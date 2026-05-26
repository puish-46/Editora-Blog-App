import exp from 'express'
import { verifyToken } from '../middlewares/verifyToken.js'
import { ArticleModel } from '../models/ArticleModel.js'
import { UserModel } from '../models/UserModel.js'
import { NotificationModel } from '../models/NotificationModel.js'
import { CommentModel } from '../models/CommentModel.js'
import { upload } from '../config/multer.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'

export const userApp = exp()

// read articles with advanced search, pagination, and sorting
userApp.get("/articles", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 6 } = req.query;

    // Build matching query
    const query = { isArticleActive: true };

    if (category && category !== "all") {
      query.category = { $regex: new RegExp(category, "i") };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");

      // Find matching authors to search by author name
      const matchingAuthors = await UserModel.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex }
        ]
      }).select("_id");

      const authorIds = matchingAuthors.map(author => author._id);

      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
        { author: { $in: authorIds } }
      ];
    }

    // Determine sorting criteria
    let sortOption = {};
    if (sort === "latest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "trending" || sort === "most_commented") {
      sortOption = { commentsCount: -1 };
    } else if (sort === "most_liked") {
      sortOption = { likesCount: -1 };
    } else {
      sortOption = { createdAt: -1 }; // default latest
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Aggregation pipeline to append length trackers
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
          likesCount: { $size: { $ifNull: ["$likes", []] } }
        }
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limitNum },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } }
    ];

    const articleList = await ArticleModel.aggregate(pipeline);
    const totalArticles = await ArticleModel.countDocuments(query);
    const totalPages = Math.ceil(totalArticles / limitNum);

    res.status(200).json({
      message: "articles",
      payload: articleList,
      pagination: {
        totalArticles,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
});

// read single article by ID with population
userApp.get("/article/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const article = await ArticleModel.findOne({ _id: req.params.id, isArticleActive: true })
      .populate("author", "firstName lastName email profileImageUrl role")
      .populate("comments.user", "firstName lastName email profileImageUrl");
      
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    res.status(200).json({ message: "Article details", payload: article });
  } catch (err) {
    next(err);
  }
});

// GET bookmarks list
userApp.get("/articles/bookmarks", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await UserModel.findById(userId).populate({
      path: "bookmarks",
      match: { isArticleActive: true },
      populate: {
        path: "author",
        select: "firstName lastName email profileImageUrl"
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Bookmarked articles", payload: user.bookmarks || [] });
  } catch (err) {
    next(err);
  }
});

// GET liked articles list
userApp.get("/articles/liked", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const likedArticles = await ArticleModel.find({
      likes: userId,
      isArticleActive: true
    }).populate("author", "firstName lastName email profileImageUrl");

    res.status(200).json({ message: "Liked articles", payload: likedArticles });
  } catch (err) {
    next(err);
  }
});

// GET single article like count & state
userApp.get("/articles/:id/likes", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const article = await ArticleModel.findOne({ _id: req.params.id, isArticleActive: true });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const likesCount = article.likes?.length || 0;
    const likedByUser = req.user ? article.likes?.includes(req.user.id) : false;

    res.status(200).json({ message: "Likes details", payload: { likesCount, likedByUser } });
  } catch (err) {
    next(err);
  }
});

// POST like article
userApp.post("/articles/like", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.id;

    const article = await ArticleModel.findOne({ _id: articleId, isArticleActive: true });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!article.likes) {
      article.likes = [];
    }

    if (!article.likes.includes(userId)) {
      article.likes.push(userId);
      await article.save();

      // Trigger Notification
      if (article.author && article.author.toString() !== userId) {
        await NotificationModel.create({
          recipient: article.author,
          sender: userId,
          type: "like",
          article: article._id
        });
      }
    }

    res.status(200).json({ message: "Article liked successfully", payload: article });
  } catch (err) {
    next(err);
  }
});

// POST unlike article
userApp.post("/articles/unlike", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.id;

    const article = await ArticleModel.findOne({ _id: articleId, isArticleActive: true });
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (article.likes) {
      const index = article.likes.indexOf(userId);
      if (index !== -1) {
        article.likes.splice(index, 1);
        await article.save();
      }
    }

    res.status(200).json({ message: "Article unliked successfully", payload: article });
  } catch (err) {
    next(err);
  }
});

// POST bookmark article
userApp.post("/articles/bookmark", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    if (!user.bookmarks.includes(articleId)) {
      user.bookmarks.push(articleId);
      await user.save();

      // Trigger Notification
      const article = await ArticleModel.findById(articleId);
      if (article && article.author && article.author.toString() !== userId) {
        await NotificationModel.create({
          recipient: article.author,
          sender: userId,
          type: "bookmark",
          article: article._id
        });
      }
    }

    res.status(200).json({ message: "Article bookmarked successfully", payload: user.bookmarks });
  } catch (err) {
    next(err);
  }
});

// POST remove bookmark
userApp.post("/articles/unbookmark", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.bookmarks) {
      const index = user.bookmarks.indexOf(articleId);
      if (index !== -1) {
        user.bookmarks.splice(index, 1);
        await user.save();
      }
    }

    res.status(200).json({ message: "Article removed from bookmarks", payload: user.bookmarks });
  } catch (err) {
    next(err);
  }
});

// Legacy PUT toggle like route (to keep complete backward compatibility with existing code)
userApp.put("/articles/like", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId } = req.body;
    const userId = req.user?.id;

    const articleDoc = await ArticleModel.findOne({ _id: articleId, isArticleActive: true });
    if (!articleDoc) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!articleDoc.likes) {
      articleDoc.likes = [];
    }

    const index = articleDoc.likes.indexOf(userId);
    if (index === -1) {
      articleDoc.likes.push(userId);
      await articleDoc.save();
      res.status(200).json({ message: "Article liked successfully", payload: articleDoc });
    } else {
      articleDoc.likes.splice(index, 1);
      await articleDoc.save();
      res.status(200).json({ message: "Article unliked successfully", payload: articleDoc });
    }
  } catch (err) {
    next(err);
  }
});

// add comments to an article
userApp.put("/articles", verifyToken("USER"), async (req, res, next) => {
  try {
    const { articleId, comment } = req.body;
    const articleDoc = await ArticleModel.findOne({ _id: articleId, isArticleActive: true }).populate("comments.user");
    if (!articleDoc) {
      return res.status(404).json({ message: "Article not found" });
    }
    const userId = req.user?.id;
    articleDoc.comments.push({ user: userId, comment: comment });
    await articleDoc.save();

    // Trigger Notification
    if (articleDoc.author && articleDoc.author.toString() !== userId) {
      await NotificationModel.create({
        recipient: articleDoc.author,
        sender: userId,
        type: "comment",
        article: articleDoc._id,
        comment: comment.slice(0, 100)
      });
    }
    
    // Repopulate to return with user info
    const updatedArticle = await ArticleModel.findById(articleId)
      .populate("author", "firstName lastName email profileImageUrl role")
      .populate("comments.user", "firstName lastName email profileImageUrl");

    res.status(200).json({ message: "Comment added successfully", payload: updatedArticle });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADVANCED THREADED COMMENTS & REPLIES APIs
// ==========================================

// GET all nested comments for an article
userApp.get("/articles/:articleId/comments", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const comments = await CommentModel.find({ articleId })
      .populate("user", "firstName lastName email profileImageUrl role")
      .sort({ createdAt: 1 });

    // Build hierarchical comment tree structure (max depth limit is 3)
    const buildCommentTree = (items, parentId = null, depth = 1) => {
      return items
        .filter(item => {
          const itemParent = item.parentId ? item.parentId.toString() : null;
          const targetParent = parentId ? parentId.toString() : null;
          return itemParent === targetParent;
        })
        .map(item => ({
          ...item.toObject(),
          replies: depth < 3 ? buildCommentTree(items, item._id, depth + 1) : []
        }));
    };

    const tree = buildCommentTree(comments);
    res.status(200).json({ message: "Article nested comments", payload: tree });
  } catch (err) {
    next(err);
  }
});

// POST add top-level comment
userApp.post("/articles/:articleId/comments", verifyToken("USER", "AUTHOR"), async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment body cannot be empty" });
    }

    const newComment = await CommentModel.create({
      articleId,
      user: userId,
      comment
    });

    const populated = await CommentModel.findById(newComment._id)
      .populate("user", "firstName lastName email profileImageUrl role");

    // Trigger Notification to blog author (skip self-actions)
    const article = await ArticleModel.findById(articleId);
    if (article && article.author && article.author.toString() !== userId) {
      await NotificationModel.create({
        recipient: article.author,
        sender: userId,
        type: "comment",
        article: article._id,
        comment: comment.slice(0, 100)
      });
    }

    res.status(201).json({ message: "Comment posted", payload: populated });
  } catch (err) {
    next(err);
  }
});

// POST reply to a comment (caps nesting at depth 3)
userApp.post("/comments/:commentId/reply", verifyToken("USER", "AUTHOR"), async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Reply body cannot be empty" });
    }

    const parentComment = await CommentModel.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    // Determine actual parent to cap nesting depth at 3
    let actualParentId = parentComment._id;
    if (parentComment.parentId) {
      const grandParent = await CommentModel.findById(parentComment.parentId);
      if (grandParent && grandParent.parentId) {
        // Capping nesting depth to 3: reply is made a sibling of parentComment at depth 3
        actualParentId = parentComment.parentId;
      }
    }

    const reply = await CommentModel.create({
      articleId: parentComment.articleId,
      user: userId,
      comment,
      parentId: actualParentId
    });

    const populated = await CommentModel.findById(reply._id)
      .populate("user", "firstName lastName email profileImageUrl role");

    // Trigger Notification to parent comment author (skip self-actions)
    if (parentComment.user && parentComment.user.toString() !== userId) {
      await NotificationModel.create({
        recipient: parentComment.user,
        sender: userId,
        type: "reply",
        article: parentComment.articleId,
        comment: comment.slice(0, 100)
      });
    }

    res.status(201).json({ message: "Reply posted", payload: populated });
  } catch (err) {
    next(err);
  }
});

// PUT edit comment
userApp.put("/comments/:commentId", verifyToken("USER", "AUTHOR"), async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment body cannot be empty" });
    }

    const targetComment = await CommentModel.findOne({ _id: commentId, user: userId });
    if (!targetComment) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    targetComment.comment = comment;
    targetComment.isEdited = true;
    await targetComment.save();

    const populated = await CommentModel.findById(commentId)
      .populate("user", "firstName lastName email profileImageUrl role");

    res.status(200).json({ message: "Comment updated", payload: populated });
  } catch (err) {
    next(err);
  }
});

// DELETE comment (supports soft-delete to preserve reply trees)
userApp.delete("/comments/:commentId", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const targetComment = await CommentModel.findById(commentId);
    if (!targetComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (targetComment.user.toString() !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    const hasReplies = await CommentModel.exists({ parentId: commentId });
    if (hasReplies) {
      // Soft delete to protect threads tree
      targetComment.isDeleted = true;
      targetComment.comment = "[This comment has been deleted]";
      await targetComment.save();
    } else {
      // Hard delete if no children replies exist
      await CommentModel.deleteOne({ _id: commentId });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// POST increment views (tracked safely)
userApp.post("/articles/:id/view", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const article = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json({ message: "Views incremented", payload: { views: article.views } });
  } catch (err) {
    next(err);
  }
});

// GET trending articles (Hacker News / Reddit decay score ranking)
userApp.get("/articles/trending", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const articles = await ArticleModel.find({ isArticleActive: true })
      .populate("author", "firstName lastName email profileImageUrl role");

    const trending = articles.map(article => {
      const likesCount = article.likes?.length || 0;
      const commentsCount = article.comments?.length || 0;
      const viewsCount = article.views || 0;

      // Calculate time delta in hours since creation
      const createdTime = new Date(article.createdAt).getTime();
      const hoursSinceCreation = (Date.now() - createdTime) / (1000 * 60 * 60);

      // Hacker News style time-gravity decay algorithm
      const score = (viewsCount + likesCount * 5 + commentsCount * 3) / Math.pow(hoursSinceCreation + 2, 1.5);

      return {
        ...article.toObject(),
        trendingScore: score
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 6);

    res.status(200).json({ message: "Trending articles fetched successfully", payload: trending });
  } catch (err) {
    next(err);
  }
});

// GET user profile (public profile data)
userApp.get("/profile/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find authored articles count and total likes received on those articles
    const authoredArticles = await ArticleModel.find({ author: user._id, isArticleActive: true });
    const totalBlogs = authoredArticles.length;
    const totalLikes = authoredArticles.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);

    res.status(200).json({
      message: "User Profile details",
      payload: {
        user,
        totalBlogs,
        totalLikes
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT update user profile (protected settings updater)
userApp.put("/profile/update", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, bio, profession, location, website, socialLinks, profileImageUrl } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (profession !== undefined) user.profession = profession;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    if (socialLinks) {
      user.socialLinks = {
        twitter: socialLinks.twitter || "",
        github: socialLinks.github || "",
        linkedin: socialLinks.linkedin || ""
      };
    }

    await user.save();
    
    // Return updated user details sans password
    const updatedUser = await UserModel.findById(userId).select("-password");
    res.status(200).json({ message: "Profile updated successfully", payload: updatedUser });
  } catch (err) {
    next(err);
  }
});

// GET user stats (protected dashboard analytics)
userApp.get("/profile/stats", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;

    // Written articles
    const writtenArticles = await ArticleModel.find({ author: userId, isArticleActive: true });
    const totalBlogs = writtenArticles.length;
    const totalLikes = writtenArticles.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
    const totalComments = writtenArticles.reduce((acc, curr) => acc + (curr.comments?.length || 0), 0);

    // Get bookmarks list
    const userObj = await UserModel.findById(userId);
    const totalBookmarks = userObj?.bookmarks?.length || 0;

    // Formulate a beautiful "recent activity" list
    const recentActivity = [];
    
    // 1. Articles user has written recently
    writtenArticles.slice(0, 3).forEach(art => {
      recentActivity.push({
        type: "publish",
        title: `Published "${art.title}"`,
        time: art.createdAt,
        id: art._id
      });
    });

    // 2. Articles user has liked recently
    const likedArticles = await ArticleModel.find({ likes: userId, isArticleActive: true }).limit(3);
    likedArticles.forEach(art => {
      recentActivity.push({
        type: "like",
        title: `Liked "${art.title}"`,
        time: art.updatedAt || art.createdAt,
        id: art._id
      });
    });

    // Sort recent activity by time descending
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({
      message: "Profile analytics",
      payload: {
        stats: {
          totalBlogs,
          totalLikes,
          totalComments,
          totalBookmarks
        },
        recentActivity: recentActivity.slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET user blogs (public authored dispatches list)
userApp.get("/articles/user/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const authoredArticles = await ArticleModel.find({ author: req.params.id, isArticleActive: true })
      .populate("author", "firstName lastName email profileImageUrl role")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Authored articles", payload: authoredArticles });
  } catch (err) {
    next(err);
  }
});

// POST upload avatar to Cloudinary
userApp.post("/profile/upload-avatar", verifyToken("USER", "AUTHOR", "ADMIN"), upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
      message: "Avatar uploaded successfully",
      payload: {
        profileImageUrl: cloudinaryResult.secure_url
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET notifications list
userApp.get("/notifications", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const notifications = await NotificationModel.find({ recipient: userId })
      .populate("sender", "firstName lastName profileImageUrl email")
      .populate("article", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Notifications list", payload: notifications });
  } catch (err) {
    next(err);
  }
});

// GET unread notifications count
userApp.get("/notifications/unread-count", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const unreadCount = await NotificationModel.countDocuments({ recipient: userId, isRead: false });
    res.status(200).json({ message: "Unread count", payload: unreadCount });
  } catch (err) {
    next(err);
  }
});

// PATCH mark all notifications as read (MUST be declared before single read route parameter to prevent route matching conflict)
userApp.patch("/notifications/read-all", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    await NotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

// PATCH mark single notification as read
userApp.patch("/notifications/:id/read", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", payload: notification });
  } catch (err) {
    next(err);
  }
});

// DELETE a specific notification
userApp.delete("/notifications/:id", verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const notification = await NotificationModel.findOneAndDelete({ _id: req.params.id, recipient: userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    next(err);
  }
});