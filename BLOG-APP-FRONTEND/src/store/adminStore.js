import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
  users: [],
  blogs: [],
  comments: [],
  analytics: {
    totalUsers: 0,
    totalBlogs: 0,
    totalComments: 0,
    totalLikes: 0,
    trendingBlogs: [],
    activityLog: []
  },
  loading: false,
  error: null,

  fetchAnalytics: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/analytics`, {
        withCredentials: true
      });
      set({ analytics: res.data.payload });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch analytics" });
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/users`, {
        withCredentials: true
      });
      set({ users: res.data.payload || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch users" });
    } finally {
      set({ loading: false });
    }
  },

  updateUserRole: async (userId, role) => {
    const originalUsers = get().users;
    // Optimistic Update
    set({
      users: get().users.map(u => (u._id === userId ? { ...u, role } : u))
    });

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin-api/users/${userId}/role`,
        { role },
        { withCredentials: true }
      );
      toast.success(res.data.message || "User role updated successfully");
      // Replace with actual response payload
      set({
        users: get().users.map(u => (u._id === userId ? res.data.payload : u))
      });
    } catch (err) {
      set({ users: originalUsers });
      toast.error(err.response?.data?.message || "Failed to update user role");
    }
  },

  toggleUserSuspension: async (userId, isUserActive) => {
    const originalUsers = get().users;
    // Optimistic Update
    set({
      users: get().users.map(u => (u._id === userId ? { ...u, isUserActive } : u))
    });

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin-api/users/${userId}/suspend`,
        { isUserActive },
        { withCredentials: true }
      );
      toast.success(res.data.message || "User status updated");
      set({
        users: get().users.map(u => (u._id === userId ? res.data.payload : u))
      });
    } catch (err) {
      set({ users: originalUsers });
      toast.error(err.response?.data?.message || "Failed to toggle suspension status");
    }
  },

  deleteUser: async (userId) => {
    const originalUsers = get().users;
    // Optimistic Update
    set({
      users: get().users.filter(u => u._id !== userId)
    });

    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/admin-api/users/${userId}`, {
        withCredentials: true
      });
      toast.success(res.data.message || "User deleted");
    } catch (err) {
      set({ users: originalUsers });
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  },

  fetchBlogs: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/blogs`, {
        withCredentials: true
      });
      set({ blogs: res.data.payload || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch blogs" });
    } finally {
      set({ loading: false });
    }
  },

  toggleBlogFeatured: async (blogId, isFeatured) => {
    const originalBlogs = get().blogs;
    // Optimistic Update
    set({
      blogs: get().blogs.map(b => (b._id === blogId ? { ...b, isFeatured } : b))
    });

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin-api/blogs/${blogId}/feature`,
        { isFeatured },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Featured status updated");
      set({
        blogs: get().blogs.map(b => (b._id === blogId ? res.data.payload : b))
      });
    } catch (err) {
      set({ blogs: originalBlogs });
      toast.error(err.response?.data?.message || "Failed to update featured status");
    }
  },

  toggleBlogHidden: async (blogId, isArticleActive) => {
    const originalBlogs = get().blogs;
    // Optimistic Update
    set({
      blogs: get().blogs.map(b => (b._id === blogId ? { ...b, isArticleActive } : b))
    });

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin-api/blogs/${blogId}/hide`,
        { isArticleActive },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Article visibility toggled");
      set({
        blogs: get().blogs.map(b => (b._id === blogId ? res.data.payload : b))
      });
    } catch (err) {
      set({ blogs: originalBlogs });
      toast.error(err.response?.data?.message || "Failed to update article visibility");
    }
  },

  deleteBlog: async (blogId) => {
    const originalBlogs = get().blogs;
    // Optimistic Update
    set({
      blogs: get().blogs.filter(b => b._id !== blogId)
    });

    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/admin-api/blogs/${blogId}`, {
        withCredentials: true
      });
      toast.success(res.data.message || "Article deleted successfully");
    } catch (err) {
      set({ blogs: originalBlogs });
      toast.error(err.response?.data?.message || "Failed to delete article");
    }
  },

  fetchComments: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/comments`, {
        withCredentials: true
      });
      set({ comments: res.data.payload || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to fetch comments for moderation" });
    } finally {
      set({ loading: false });
    }
  },

  deleteComment: async (commentId) => {
    const originalComments = get().comments;
    // Optimistic Update
    set({
      comments: get().comments.filter(c => c._id !== commentId)
    });

    try {
      const res = await axios.delete(`${import.meta.env.VITE_API_URL}/admin-api/comments/${commentId}`, {
        withCredentials: true
      });
      toast.success(res.data.message || "Comment removed successfully");
    } catch (err) {
      set({ comments: originalComments });
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  }
}));
