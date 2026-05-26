import { useEffect, useState } from "react";
import { useAuth } from "../../store/authStore";
import { useCommentsStore } from "../../store/commentsStore";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import toast from "react-hot-toast";

// ==========================================
// RECURSIVE INDIVDUAL COMMENT NODE COMPONENT
// ==========================================
function CommentNode({ comment, depth = 1, currentUser, onReply, onEdit, onDelete }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.comment || "");
  const [collapsed, setCollapsed] = useState(false);

  const canAction = currentUser && !comment.isDeleted;
  const isOwner = currentUser && comment.user?._id === currentUser._id;
  const isAdmin = currentUser && currentUser.role === "ADMIN";

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(comment._id, editText);
    setIsEditing(false);
  };

  const firstLetter = comment.user?.firstName
    ? comment.user.firstName.charAt(0).toUpperCase()
    : "U";

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="group mt-4 animate-fade-in">
      <Card hoverEffect={false} className={`p-4 ${comment.isDeleted ? "bg-paper-light/30 dark:bg-paper-dark/30 border-dashed" : "bg-white dark:bg-card-dark"} border border-border-light dark:border-border-dark rounded-2xl`}>
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {comment.user?.profileImageUrl ? (
              <img
                src={comment.user.profileImageUrl}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-border-light dark:border-border-dark"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent/10 dark:bg-accent/20 text-accent font-serif font-black flex items-center justify-center text-[10px]">
                {firstLetter}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-1.5">
                <span>
                  {comment.user?.firstName} {comment.user?.lastName || ""}
                </span>
                {comment.user?.role === "AUTHOR" && (
                  <span className="text-[8px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black scale-90">
                    Staff
                  </span>
                )}
              </p>
              <p className="text-[9px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 mt-0.5">
                {formatDate(comment.createdAt)}
                {comment.isEdited && <span className="ml-1.5 italic font-medium">(edited)</span>}
              </p>
            </div>
          </div>

          {/* Collapse toggle */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[9px] font-black uppercase tracking-widest text-text-light-secondary/40 dark:text-text-dark-secondary/40 hover:text-accent cursor-pointer transition-colors"
            >
              {collapsed ? `[Show +${comment.replies.length}]` : "[Collapse]"}
            </button>
          )}
        </div>

        {/* Comment Text / Edit Box */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="mt-3 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-xs focus:outline-none focus:border-accent transition-colors"
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="px-3 py-1 text-[9px] rounded-lg">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="px-3 py-1 text-[9px] rounded-lg">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <p className={`text-[11px] sm:text-xs mt-2.5 leading-relaxed ${comment.isDeleted ? "text-text-light-secondary/40 dark:text-text-dark-secondary/40 italic font-mono" : "text-text-light-secondary dark:text-text-dark-secondary"}`}>
            {comment.comment}
          </p>
        )}

        {/* Comment Footer Action Bars */}
        {canAction && !isEditing && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-light/20 dark:border-border-dark/20 text-[10px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-bold uppercase tracking-wider">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="hover:text-accent transition-colors cursor-pointer flex items-center gap-1"
            >
              💬 Reply
            </button>
            
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="hover:text-accent transition-colors cursor-pointer flex items-center gap-1"
              >
                ✏️ Edit
              </button>
            )}

            {(isOwner || isAdmin) && (
              <button
                onClick={() => {
                  if (window.confirm("Permanently delete this comment?")) {
                    onDelete(comment._id);
                  }
                }}
                className="hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}

        {/* Inline Reply Panel */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3.5 space-y-2.5 pl-4 border-l border-accent/20">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Compose your reply..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-xs focus:outline-none focus:border-accent transition-colors"
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setIsReplying(false)} className="px-3 py-1 text-[9px] rounded-lg">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="px-3 py-1 text-[9px] rounded-lg">
                Submit Reply
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Recursive Nested Replies Container with border-indentation */}
      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 sm:pl-6 border-l border-border-light dark:border-border-dark/60 ml-3.5 sm:ml-5 transition-all duration-300">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CORE COMMENT SECTION CONTAINER COMPONENT
// ==========================================
function CommentSection({ articleId }) {
  const currentUser = useAuth((state) => state.currentUser);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  
  const comments = useCommentsStore((state) => state.comments);
  const loading = useCommentsStore((state) => state.loading);
  const error = useCommentsStore((state) => state.error);
  
  const fetchComments = useCommentsStore((state) => state.fetchComments);
  const addComment = useCommentsStore((state) => state.addComment);
  const addReply = useCommentsStore((state) => state.addReply);
  const updateComment = useCommentsStore((state) => state.updateComment);
  const deleteComment = useCommentsStore((state) => state.deleteComment);

  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    if (articleId) {
      fetchComments(articleId);
    }
  }, [articleId]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!isAuthenticated) {
      toast.error("You must be logged in to leave a response!");
      return;
    }
    addComment(articleId, newCommentText, currentUser);
    setNewCommentText("");
  };

  return (
    <div className="mt-14 pt-8 border-t border-border-light dark:border-border-dark scroll-mt-24">
      <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-text-light-primary dark:text-text-dark-primary mb-6">
        Reader Responses ({comments.length || 0})
      </h3>

      {/* Main Comment Compose Section */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="mb-8 space-y-3.5">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Share your perspective, question, or editorial feedback..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-xs sm:text-sm focus:outline-none focus:border-accent transition-colors shadow-xs"
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest"
            >
              Publish Response
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 text-center border border-dashed border-border-light dark:border-border-dark rounded-2xl bg-paper-light/30 dark:bg-paper-dark/30">
          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-3">
            Join the conversation. Register or sign in to write responses and replies.
          </p>
        </div>
      )}

      {/* Error handling */}
      {error && (
        <p className="text-red-500/80 bg-red-500/10 p-3 rounded-xl text-xs font-medium border border-red-500/20 mb-4">
          {error}
        </p>
      )}

      {/* Loader */}
      {loading && comments.length === 0 ? (
        <div className="py-12 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex space-x-3">
              <div className="rounded-full bg-border-light dark:bg-border-dark h-8 w-8"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-border-light dark:bg-border-dark rounded w-1/4"></div>
                <div className="h-2 bg-border-light dark:bg-border-dark rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-text-light-secondary/50 dark:text-text-dark-secondary/50 py-10 font-sans italic">
          No responses recorded yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-6">
          {comments.map((rootComment) => (
            <CommentNode
              key={rootComment._id}
              comment={rootComment}
              currentUser={currentUser}
              onReply={addReply}
              onEdit={updateComment}
              onDelete={deleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
