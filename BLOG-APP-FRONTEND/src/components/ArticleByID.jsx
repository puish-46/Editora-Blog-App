import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { useInteractions } from "../store/interactionsStore";
import Loader from "./ui/Loader";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import toast from "react-hot-toast";
import CommentSection from "./ui/CommentSection";
import OptimizedImage from "./ui/OptimizedImage";
import SEO from "./ui/SEO";
import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  commentsWrapper,
  commentHeader,
  commentUserRow,
  avatar,
  commentUser,
  commentTime,
  commentText,
  errorClass,
} from "../styles/common.js";
import { useForm } from "react-hook-form";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const user = useAuth((state) => state.currentUser);

  // Interactions Zustand hook variables
  const likedArticles = useInteractions((state) => state.likedArticles);
  const likeCounts = useInteractions((state) => state.likeCounts);
  const bookmarkedIds = useInteractions((state) => state.bookmarkedIds);
  const toggleLike = useInteractions((state) => state.toggleLike);
  const toggleBookmark = useInteractions((state) => state.toggleBookmark);
  const syncArticleState = useInteractions((state) => state.syncArticleState);
  const incrementView = useInteractions((state) => state.incrementView);

  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (article) return;

    const getArticle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/article/${id}`, { withCredentials: true });
        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    getArticle();
  }, [id]);

  useEffect(() => {
    if (article) {
      syncArticleState(article, user?._id);
    }
  }, [article, user?._id]);

  useEffect(() => {
    if (article?._id) {
      incrementView(article._id);
    }
  }, [article?._id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;
    const confirmMsg = newStatus ? "Restore this article?" : "Delete this article?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/author-api/article`,
        { articleId: article._id, isArticleActive: newStatus },
        { withCredentials: true },
      );
      setArticle(res.data.payload);
      toast.success(newStatus ? "Article successfully restored" : "Article successfully deleted");
    } catch (err) {
      console.log("ERROR:", err.response);
      const msg = err.response?.data?.message || "Operation failed";
      toast.error(msg);
    }
  };

  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast("Please register or login to like this article.", { icon: "🔒" });
      navigate("/login");
      return;
    }
    
    try {
      let res = await axios.put(`${import.meta.env.VITE_API_URL}/user-api/articles/like`, { articleId: article._id }, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message);
        setArticle(prev => ({
          ...prev,
          likes: res.data.payload.likes
        }));
      }
    } catch (err) {
      toast.error("Failed to update like status");
    }
  };

  const addComment = async (commentObj) => {
    if (!commentObj.comment?.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    commentObj.articleId = article._id;
    try {
      let res = await axios.put(`${import.meta.env.VITE_API_URL}/user-api/articles`, commentObj, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message || "Comment added successfully");
        setArticle(res.data.payload);
        reset(); // Clear input
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  if (loading) return <Loader message="Opening article..." />;
  if (error) return <div className="max-w-3xl mx-auto py-12"><p className={errorClass}>{error}</p></div>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      {/* Header */}
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>

        <h1 className={`${articleMainTitle} leading-tight`}>{article.title}</h1>

        <div className={articleAuthorRow}>
          <div 
            onClick={() => {
              if (article.author?._id) {
                navigate(`/profile/${article.author._id}`);
              }
            }}
            className={`${authorInfo} hover:text-accent transition-colors cursor-pointer`}
          >
            <span className="text-base">✍️</span>
            <span className="hover:underline">{article.author?.firstName} {article.author?.lastName || ""}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-light-secondary/65 dark:text-text-dark-secondary/65 font-medium">
            <span>{formatDate(article.createdAt)}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-semibold text-accent">⏱️ {article.readTime || "1 min read"}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-semibold">👁️ {(article.views || 0) + 1} views</span>
          </div>
        </div>

        {/* Like & Tags Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-4 border-t border-border-light/50 dark:border-border-dark/50">
          <div className="flex items-center gap-3">
            {/* Optimistic Like Button */}
            <button 
              onClick={() => {
                if (!user) {
                  toast("Please login to like this article.", { icon: "🔒" });
                  navigate("/login");
                  return;
                }
                toggleLike(article._id, user?._id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-editorial cursor-pointer ${
                likedArticles[article._id]
                  ? "bg-red-500/10 border-red-500/30 text-red-500 shadow-sm"
                  : "bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:border-red-500/50 hover:text-red-500"
              }`}
            >
              <span>❤️</span>
              <span>{likeCounts[article._id] ?? (article.likes?.length || 0)} Likes</span>
            </button>

            {/* Optimistic Bookmark Button */}
            <button 
              onClick={() => {
                if (!user) {
                  toast("Please login to bookmark this article.", { icon: "🔒" });
                  navigate("/login");
                  return;
                }
                toggleBookmark(article, user?._id);
                toast.success(bookmarkedIds.has(article._id) ? "Removed from Bookmarks" : "Saved to Bookmarks!");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-editorial cursor-pointer ${
                bookmarkedIds.has(article._id)
                  ? "bg-accent/10 border-accent/30 text-accent shadow-sm"
                  : "bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:border-accent/50 hover:text-accent"
              }`}
            >
              <span>🔖</span>
              <span>{bookmarkedIds.has(article._id) ? "Saved" : "Save Story"}</span>
            </button>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-[10px] bg-white dark:bg-card-dark text-text-light-secondary/70 dark:text-text-dark-secondary/70 px-2.5 py-1 rounded-full border border-border-light dark:border-border-dark uppercase tracking-wider font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Dynamic SEO Injector for search engine indexing */}
      <SEO 
        title={article.title}
        description={article.previewText || article.seoDescription || "Read this editorial story on Editora."}
        image={article.coverImage}
        type="article"
      />

      {/* Immersive high-contrast Cover Image */}
      {article.coverImage && (
        <div className="w-full h-[40vh] sm:h-[50vh] rounded-3xl overflow-hidden mb-10 border border-border-light/40 dark:border-border-dark/40 shadow-editorial">
          <OptimizedImage
            src={article.coverImage}
            alt={article.title}
            width={1200}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* AI EDITORIAL SUMMARY BLOCK */}
      {article.aiSummary && (
        <div className="my-8 p-6 rounded-3xl bg-accent/[0.03] dark:bg-accent/[0.01] border border-accent/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent to-purple-500"></div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs">✨</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent font-sans">
              Gemini Editorial Summary
            </span>
          </div>
          <p className="font-serif italic text-sm sm:text-base leading-relaxed text-text-light-primary/90 dark:text-text-dark-primary/90">
            "{article.aiSummary}"
          </p>
        </div>
      )}

      {/* Content */}
      <div 
        className={`${articleContent} prose-editorial font-serif text-base sm:text-lg tracking-wide`}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* AUTHOR actions */}
      {user?.role === "AUTHOR" && (
        <div className="flex gap-4 mt-10 border-t border-border-light dark:border-border-dark pt-6">
          <Button variant="secondary" onClick={() => editArticle(article)} className="px-6 py-2 rounded-full">
            Edit Article
          </Button>

          <Button 
            variant={article.isArticleActive ? "danger" : "primary"} 
            onClick={toggleArticleStatus}
            className="px-6 py-2 rounded-full font-semibold"
          >
            {article.isArticleActive ? "Delete Article" : "Restore Article"}
          </Button>
        </div>
      )}

      {/* NESTED THREADED DISCUSSION FORUM */}
      <CommentSection articleId={article._id} />

      {/* Footer */}
      <div className={articleFooter}>
        Last updated: {formatDate(article.updatedAt)}
      </div>
    </div>
  );
}

export default ArticleByID;