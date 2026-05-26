import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useCommentsStore = create((set, get) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (articleId) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user-api/articles/${articleId}/comments`,
        { withCredentials: true }
      );
      set({ comments: res.data.payload || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch comments" });
    } finally {
      set({ loading: false });
    }
  },

  addComment: async (articleId, commentText, currentUser) => {
    if (!commentText || !commentText.trim()) return;

    const tempId = `temp-comment-${Date.now()}`;
    const optimisticComment = {
      _id: tempId,
      articleId,
      user: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        profileImageUrl: currentUser.profileImageUrl,
        role: currentUser.role
      },
      comment: commentText,
      parentId: null,
      replies: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const originalComments = get().comments;
    // Prepend new comments to the list
    set({ comments: [...originalComments, optimisticComment] });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/articles/${articleId}/comments`,
        { comment: commentText },
        { withCredentials: true }
      );
      
      // Swap optimistic version with actual saved response
      set({
        comments: get().comments.map(c => (c._id === tempId ? res.data.payload : c))
      });
      toast.success("Comment posted!");
    } catch (err) {
      set({ comments: originalComments });
      toast.error(err.response?.data?.message || "Failed to post comment");
    }
  },

  addReply: async (parentCommentId, commentText, currentUser) => {
    if (!commentText || !commentText.trim()) return;

    const tempId = `temp-reply-${Date.now()}`;
    const optimisticReply = {
      _id: tempId,
      user: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        profileImageUrl: currentUser.profileImageUrl,
        role: currentUser.role
      },
      comment: commentText,
      parentId: parentCommentId,
      replies: [],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const originalComments = get().comments;

    // Deep search to insert reply into parentComment
    const insertReply = (list) => {
      return list.map(c => {
        if (c._id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), optimisticReply]
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: insertReply(c.replies)
          };
        }
        return c;
      });
    };

    set({ comments: insertReply(originalComments) });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/comments/${parentCommentId}/reply`,
        { comment: commentText },
        { withCredentials: true }
      );

      // Deep search to replace temp reply with actual response
      const replaceTempReply = (list) => {
        return list.map(c => {
          if (c._id === parentCommentId) {
            return {
              ...c,
              replies: (c.replies || []).map(r => (r._id === tempId ? res.data.payload : r))
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: replaceTempReply(c.replies)
            };
          }
          return c;
        });
      };

      set({ comments: replaceTempReply(get().comments) });
      toast.success("Reply posted!");
    } catch (err) {
      set({ comments: originalComments });
      toast.error(err.response?.data?.message || "Failed to post reply");
    }
  },

  updateComment: async (commentId, commentText) => {
    if (!commentText || !commentText.trim()) return;

    const originalComments = get().comments;

    // Deep search to optimistically update comment text
    const performUpdate = (list) => {
      return list.map(c => {
        if (c._id === commentId) {
          return {
            ...c,
            comment: commentText,
            isEdited: true
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: performUpdate(c.replies)
          };
        }
        return c;
      });
    };

    set({ comments: performUpdate(originalComments) });

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/comments/${commentId}`,
        { comment: commentText },
        { withCredentials: true }
      );

      // Deep search to swap populated response
      const swapPopulated = (list) => {
        return list.map(c => {
          if (c._id === commentId) {
            return res.data.payload;
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: swapPopulated(c.replies)
            };
          }
          return c;
        });
      };

      set({ comments: swapPopulated(get().comments) });
      toast.success("Comment updated!");
    } catch (err) {
      set({ comments: originalComments });
      toast.error(err.response?.data?.message || "Failed to edit comment");
    }
  },

  deleteComment: async (commentId) => {
    const originalComments = get().comments;

    // Deep search to perform soft-delete or hard-delete in local state
    const performLocalDelete = (list) => {
      return list
        .map(c => {
          if (c._id === commentId) {
            const hasChildren = c.replies && c.replies.length > 0;
            if (hasChildren) {
              return {
                ...c,
                isDeleted: true,
                comment: "[This comment has been deleted]"
              };
            }
            return null; // Signals removal for hard-delete
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: performLocalDelete(c.replies)
            };
          }
          return c;
        })
        .filter(Boolean); // Filter out hard-deleted items
    };

    set({ comments: performLocalDelete(originalComments) });

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/user-api/comments/${commentId}`,
        { withCredentials: true }
      );
      toast.success("Comment deleted");
    } catch (err) {
      set({ comments: originalComments });
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  }
}));
