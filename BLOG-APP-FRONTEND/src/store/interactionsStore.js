import { create } from "zustand";
import axios from "axios";

export const useInteractions = create((set, get) => ({
  likedArticles: {}, // { [articleId]: boolean }
  likeCounts: {},    // { [articleId]: number }
  bookmarks: [],     // Array of bookmarked article objects
  bookmarkedIds: new Set(), // Set of bookmarked article IDs
  trendingArticles: [], // Array of high-engagement scoring articles
  loading: false,

  // Initialize and fetch bookmarks from server
  fetchBookmarks: async () => {
    try {
      let res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/bookmarks`, { withCredentials: true });
      if (res.status === 200) {
        const bookmarks = res.data.payload || [];
        const bookmarkedIds = new Set(bookmarks.map(b => b._id));
        set({ bookmarks, bookmarkedIds });
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  },

  // Initialize and fetch liked articles to sync liked states
  fetchLikedArticles: async () => {
    try {
      let res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/liked`, { withCredentials: true });
      if (res.status === 200) {
        const likedList = res.data.payload || [];
        const likedArticles = {};
        likedList.forEach(a => {
          likedArticles[a._id] = true;
        });
        set({ likedArticles });
      }
    } catch (err) {
      console.error("Failed to fetch liked articles:", err);
    }
  },

  // Initialize counts for specific articles on load
  syncArticleState: (article, userId) => {
    if (!article) return;
    const isLiked = article.likes?.includes(userId) || false;
    const count = article.likes?.length || 0;
    
    set((state) => ({
      likedArticles: { ...state.likedArticles, [article._id]: isLiked },
      likeCounts: { ...state.likeCounts, [article._id]: count }
    }));
  },

  // OPTIMISTIC Toggle Like
  toggleLike: async (articleId, userId) => {
    if (!userId) return false;

    const state = get();
    const wasLiked = !!state.likedArticles[articleId];
    const currentCount = state.likeCounts[articleId] ?? 0;

    // 1. Apply OPTIMISTIC update instantly
    const newLikedState = !wasLiked;
    const newCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);

    set((state) => ({
      likedArticles: { ...state.likedArticles, [articleId]: newLikedState },
      likeCounts: { ...state.likeCounts, [articleId]: newCount }
    }));

    try {
      // 2. Call API in the background
      const endpoint = newLikedState ? "like" : "unlike";
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/articles/${endpoint}`,
        { articleId },
        { withCredentials: true }
      );
      
      if (res.status !== 200) {
        throw new Error("API failed");
      }
      return true;
    } catch (err) {
      console.error("Failed to like/unlike article, rolling back...", err);
      // 3. ROLLBACK state on error
      set((state) => ({
        likedArticles: { ...state.likedArticles, [articleId]: wasLiked },
        likeCounts: { ...state.likeCounts, [articleId]: currentCount }
      }));
      return false;
    }
  },

  // OPTIMISTIC Toggle Bookmark
  toggleBookmark: async (article, userId) => {
    if (!userId || !article) return false;

    const state = get();
    const articleId = article._id;
    const isBookmarked = state.bookmarkedIds.has(articleId);

    // 1. Apply OPTIMISTIC update instantly
    const newBookmarkedIds = new Set(state.bookmarkedIds);
    let newBookmarks = [...state.bookmarks];

    if (isBookmarked) {
      newBookmarkedIds.delete(articleId);
      newBookmarks = newBookmarks.filter(b => b._id !== articleId);
    } else {
      newBookmarkedIds.add(articleId);
      newBookmarks.push(article);
    }

    set({ bookmarks: newBookmarks, bookmarkedIds: newBookmarkedIds });

    try {
      // 2. Call API in the background
      const endpoint = isBookmarked ? "unbookmark" : "bookmark";
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/articles/${endpoint}`,
        { articleId },
        { withCredentials: true }
      );

      if (res.status !== 200) {
        throw new Error("API failed");
      }
      return true;
    } catch (err) {
      console.error("Failed to update bookmark, rolling back...", err);
      // 3. ROLLBACK state on error
      const rollbackIds = new Set(state.bookmarkedIds);
      set({ bookmarks: state.bookmarks, bookmarkedIds: rollbackIds });
      return false;
    }
  },

  // Increment views on article open, guarded against rapid duplication
  incrementView: async (articleId) => {
    if (!articleId) return;
    const key = `viewed_${articleId}`;
    const lastViewed = localStorage.getItem(key);
    const now = Date.now();

    // Guard: Prevent double-counting if viewed within last 24 hours
    if (lastViewed && now - parseInt(lastViewed) < 24 * 60 * 60 * 1000) {
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/articles/${articleId}/view`,
        {},
        { withCredentials: true }
      );
      localStorage.setItem(key, now.toString());
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  },

  // Fetch trending articles using Hacker News / Reddit decay scores
  fetchTrendingArticles: async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user-api/articles/trending`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        set({ trendingArticles: res.data.payload || [] });
      }
    } catch (err) {
      console.error("Failed to fetch trending articles:", err);
    }
  }
}));
