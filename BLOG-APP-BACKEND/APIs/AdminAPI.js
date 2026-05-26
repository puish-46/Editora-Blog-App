import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { CommentModel } from "../models/CommentModel.js";

export const adminApp = exp.Router();

// ==========================================
// USER MANAGEMENT APIs
// ==========================================

// Get all users (including admins & authors)
adminApp.get("/users", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const users = await UserModel.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ message: "User list retrieved successfully", payload: users });
  } catch (err) {
    next(err);
  }
});

// Update user role (e.g. upgrade USER to AUTHOR or ADMIN)
adminApp.put("/users/:userId/role", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["USER", "AUTHOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `Role successfully updated to ${role}`, payload: user });
  } catch (err) {
    next(err);
  }
});

// Toggle suspend user (block/unblock)
adminApp.put("/users/:userId/suspend", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isUserActive } = req.body;

    const user = await UserModel.findByIdAndUpdate(userId, { isUserActive }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `User status set to ${isUserActive ? "active" : "suspended"}`, payload: user });
  } catch (err) {
    next(err);
  }
});

// Delete user
adminApp.delete("/users/:userId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hard delete user
    await UserModel.findByIdAndDelete(userId);
    // Delete user's authored articles
    await ArticleModel.deleteMany({ author: userId });
    // Delete user's comments
    await CommentModel.deleteMany({ user: userId });

    res.status(200).json({ message: "User and all associated assets deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// BLOG MANAGEMENT APIs
// ==========================================

// Get all blogs (including inactive/hidden ones)
adminApp.get("/blogs", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const blogs = await ArticleModel.find()
      .populate("author", "firstName lastName email profileImageUrl")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Blog list retrieved successfully", payload: blogs });
  } catch (err) {
    next(err);
  }
});

// Toggle feature blog (isFeatured)
adminApp.put("/blogs/:blogId/feature", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { isFeatured } = req.body;

    const blog = await ArticleModel.findByIdAndUpdate(blogId, { isFeatured }, { new: true })
      .populate("author", "firstName lastName email profileImageUrl");

    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: `Blog featured status set to ${isFeatured}`, payload: blog });
  } catch (err) {
    next(err);
  }
});

// Toggle hide blog (isArticleActive)
adminApp.put("/blogs/:blogId/hide", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { isArticleActive } = req.body;

    const blog = await ArticleModel.findByIdAndUpdate(blogId, { isArticleActive }, { new: true })
      .populate("author", "firstName lastName email profileImageUrl");

    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({ message: `Blog active status set to ${isArticleActive}`, payload: blog });
  } catch (err) {
    next(err);
  }
});

// Delete blog
adminApp.delete("/blogs/:blogId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { blogId } = req.params;

    const blog = await ArticleModel.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Article not found" });
    }

    await ArticleModel.findByIdAndDelete(blogId);
    // Delete comments on this blog
    await CommentModel.deleteMany({ articleId: blogId });

    res.status(200).json({ message: "Blog and associated comments deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// COMMENTS MODERATION APIs
// ==========================================

// Get all comments for moderation
adminApp.get("/comments", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const comments = await CommentModel.find()
      .populate("user", "firstName lastName email profileImageUrl role")
      .populate({
        path: "articleId",
        select: "title"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Comments retrieved successfully", payload: comments });
  } catch (err) {
    next(err);
  }
});

// Delete comments/replies as Admin (Hard delete)
adminApp.delete("/comments/:commentId", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { commentId } = req.params;
    
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Perform hard-delete of the comment itself
    await CommentModel.findByIdAndDelete(commentId);
    
    // Also delete or orphan child comments (set parentId to null or delete)
    // To be clean, let's delete any direct replies to this comment to keep database clear
    await CommentModel.deleteMany({ parentId: commentId });

    res.status(200).json({ message: "Comment and immediate nested replies moderated/deleted" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ANALYTICS & STATS APIs
// ==========================================

// Get complete analytical overview of the platform
adminApp.get("/analytics", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalBlogs = await ArticleModel.countDocuments();
    const totalComments = await CommentModel.countDocuments();
    
    // Sum all likes
    const articles = await ArticleModel.find({}, "likes");
    let totalLikes = 0;
    articles.forEach(article => {
      if (article.likes) totalLikes += article.likes.length;
    });

    // Trending articles (sorted by likes volume)
    const trendingBlogs = await ArticleModel.find()
      .populate("author", "firstName lastName email profileImageUrl")
      .sort({ likes: -1 })
      .limit(5);

    // Dynamic Activity Log for the Overview graph:
    // Count blogs published per day for the last 7 days
    const activityLog = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const start = new Date(d);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);

      const count = await ArticleModel.countDocuments({
        createdAt: { $gte: start, $lt: end }
      });

      activityLog.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        blogsCount: count
      });
    }

    res.status(200).json({
      message: "Analytics summary generated",
      payload: {
        totalUsers,
        totalBlogs,
        totalComments,
        totalLikes,
        trendingBlogs,
        activityLog
      }
    });
  } catch (err) {
    next(err);
  }
});