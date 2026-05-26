import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import { useAdminStore } from "../store/adminStore";
import Button from "./ui/Button";
import Card from "./ui/Card";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = useAuth((state) => state.currentUser);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const users = useAdminStore((state) => state.users);
  const blogs = useAdminStore((state) => state.blogs);
  const comments = useAdminStore((state) => state.comments);
  const analytics = useAdminStore((state) => state.analytics);
  const loading = useAdminStore((state) => state.loading);
  const error = useAdminStore((state) => state.error);

  const fetchAnalytics = useAdminStore((state) => state.fetchAnalytics);
  const fetchUsers = useAdminStore((state) => state.fetchUsers);
  const updateUserRole = useAdminStore((state) => state.updateUserRole);
  const toggleUserSuspension = useAdminStore((state) => state.toggleUserSuspension);
  const deleteUser = useAdminStore((state) => state.deleteUser);
  const fetchBlogs = useAdminStore((state) => state.fetchBlogs);
  const toggleBlogFeatured = useAdminStore((state) => state.toggleBlogFeatured);
  const toggleBlogHidden = useAdminStore((state) => state.toggleBlogHidden);
  const deleteBlog = useAdminStore((state) => state.deleteBlog);
  const fetchComments = useAdminStore((state) => state.fetchComments);
  const deleteComment = useAdminStore((state) => state.deleteComment);

  const [activeTab, setActiveTab] = useState("overview");

  // Protect Admin Route on Frontend
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate("/login");
      return;
    }
    if (currentUser.role !== "ADMIN") {
      toast.error("Access denied. Admin permissions required.");
      navigate("/");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Initial Fetches
  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchAnalytics();
      fetchUsers();
      fetchBlogs();
      fetchComments();
    }
  }, [currentUser]);

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-light dark:bg-paper-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview & Stats", icon: "📊" },
    { id: "users", name: "Users Directory", icon: "👥" },
    { id: "blogs", name: "Blogs & Editorial", icon: "✍️" },
    { id: "comments", name: "Comments Moderator", icon: "💬" }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-paper-light dark:bg-paper-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Row */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-text-light-primary dark:text-text-dark-primary">
              Admin HQ
            </h1>
            <p className="text-xs sm:text-sm text-text-light-secondary/60 dark:text-text-dark-secondary/60 mt-1">
              Complete analytical intelligence, moderation parameters, and controls desk.
            </p>
          </div>
          <span className="self-start md:self-auto text-[10px] font-mono uppercase bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent px-3 py-1.5 rounded-full font-bold">
            🛡️ root access authorized
          </span>
        </div>

        {/* Outer Grid Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Workspace Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <Card hoverEffect={false} className="p-3 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-light-secondary/40 dark:text-text-dark-secondary/40 px-3 mb-2 block">
                Workspace Modules
              </span>
              <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer w-full text-left ${
                      activeTab === tab.id
                        ? "bg-accent border border-accent text-white dark:text-paper-dark shadow-md"
                        : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-paper-light dark:hover:bg-paper-dark"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Module Desk Panel */}
          <div className="lg:col-span-3">
            
            {/* Error alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* TAB CONTENT 1: OVERVIEW & ANALYTICS STATS */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Stats Cards Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", val: analytics.totalUsers, icon: "👥", bg: "bg-blue-500/10 dark:bg-blue-500/5", border: "border-blue-500/20" },
                    { label: "Articles Published", val: analytics.totalBlogs, icon: "📰", bg: "bg-emerald-500/10 dark:bg-emerald-500/5", border: "border-emerald-500/20" },
                    { label: "Reader Responses", val: analytics.totalComments, icon: "💬", bg: "bg-amber-500/10 dark:bg-amber-500/5", border: "border-amber-500/20" },
                    { label: "Dispatches Likes", val: analytics.totalLikes, icon: "❤️", bg: "bg-rose-500/10 dark:bg-rose-500/5", border: "border-rose-500/20" }
                  ].map((card, i) => (
                    <Card key={i} hoverEffect={false} className={`p-5 flex flex-col justify-between ${card.bg} border ${card.border} rounded-3xl h-28`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-text-light-secondary/60 dark:text-text-dark-secondary/60">
                          {card.label}
                        </span>
                        <span className="text-sm">{card.icon}</span>
                      </div>
                      <span className="font-serif text-2xl sm:text-3xl font-black text-text-light-primary dark:text-text-dark-primary mt-2">
                        {loading ? "..." : card.val}
                      </span>
                    </Card>
                  ))}
                </div>

                {/* Graphical Activity Log Summary */}
                <Card hoverEffect={false} className="p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl">
                  <h3 className="font-serif text-sm font-bold text-text-light-primary dark:text-text-dark-primary mb-4 flex items-center gap-2">
                    📈 Article Publishing Activity (Last 7 Days)
                  </h3>
                  
                  {loading ? (
                    <div className="h-48 flex items-center justify-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 animate-pulse">
                      Synthesizing dataset...
                    </div>
                  ) : (
                    <div className="flex items-end justify-between h-48 pt-6 border-b border-border-light dark:border-border-dark/60">
                      {analytics.activityLog?.map((day, i) => {
                        // Max height scalar
                        const maxVal = Math.max(...analytics.activityLog.map(d => d.blogsCount || 0), 1);
                        const percent = ((day.blogsCount || 0) / maxVal) * 80 + 10; // Capped scale for clean UI

                        return (
                          <div key={i} className="flex flex-col items-center flex-1 group">
                            {/* Hover tooltip */}
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-accent text-white dark:text-paper-dark font-mono text-[9px] font-bold px-2 py-0.5 rounded mb-1 whitespace-nowrap">
                              {day.blogsCount} blogs
                            </span>
                            
                            {/* Visual bar */}
                            <div 
                              style={{ height: `${percent}%` }}
                              className="w-8 sm:w-12 bg-accent/20 dark:bg-accent/15 group-hover:bg-accent border-t border-x border-accent/40 rounded-t-lg transition-all duration-300"
                            ></div>
                            
                            {/* X-axis Label */}
                            <span className="text-[9px] font-semibold text-text-light-secondary/60 dark:text-text-dark-secondary/60 mt-2 font-mono whitespace-nowrap">
                              {day.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Trending Articles Section */}
                <Card hoverEffect={false} className="p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl">
                  <h3 className="font-serif text-sm font-bold text-text-light-primary dark:text-text-dark-primary mb-4 flex items-center gap-2">
                    🔥 Trending Articles by Engagement
                  </h3>

                  {analytics.trendingBlogs?.length === 0 ? (
                    <p className="text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 py-8 italic font-sans">
                      No published article engagement data synthesized yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-border-light dark:divide-border-dark/40">
                      {analytics.trendingBlogs?.map((blog, idx) => (
                        <div key={blog._id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-serif text-base sm:text-lg font-black text-accent/30 w-5">
                              0{idx + 1}
                            </span>
                            <div>
                              <h4 
                                onClick={() => navigate(`/article/${blog._id}`)}
                                className="text-xs sm:text-sm font-bold text-text-light-primary dark:text-text-dark-primary hover:text-accent cursor-pointer transition-colors line-clamp-1 leading-snug"
                              >
                                {blog.title}
                              </h4>
                              <p className="text-[10px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 mt-0.5 font-medium">
                                By {blog.author?.firstName} {blog.author?.lastName} &bull; {blog.category}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            ❤️ {blog.likes?.length || 0} likes
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

              </div>
            )}

            {/* TAB CONTENT 2: USERS MANAGEMENT DIRECTORY */}
            {activeTab === "users" && (
              <Card hoverEffect={false} className="p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-sm font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                    👥 Users Moderation & Directory
                  </h3>
                  <span className="text-[9px] font-semibold text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-mono">
                    Total: {users.length} entries
                  </span>
                </div>

                {loading && users.length === 0 ? (
                  <div className="py-20 text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 animate-pulse">
                    Querying credentials directory...
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 py-10 italic font-sans">
                    No registry users found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-light dark:border-border-dark/60 text-text-light-secondary/50 dark:text-text-dark-secondary/50 font-bold uppercase tracking-wider text-[9px]">
                          <th className="pb-3 pr-2">Profile</th>
                          <th className="pb-3 px-2">Role</th>
                          <th className="pb-3 px-2">Status</th>
                          <th className="pb-3 pl-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light/40 dark:divide-border-dark/20 font-medium">
                        {users.map((usr) => (
                          <tr key={usr._id} className="hover:bg-paper-light/20 dark:hover:bg-card-dark/20 transition-colors">
                            {/* Profile details */}
                            <td className="py-3.5 pr-2">
                              <div className="flex items-center gap-2.5">
                                {usr.profileImageUrl ? (
                                  <img
                                    src={usr.profileImageUrl}
                                    alt="User"
                                    className="w-7 h-7 rounded-full object-cover border border-border-light dark:border-border-dark"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-accent/10 dark:bg-accent/20 text-accent font-serif font-black flex items-center justify-center text-[10px]">
                                    {usr.firstName?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-text-light-primary dark:text-text-dark-primary text-xs sm:text-sm">
                                    {usr.firstName} {usr.lastName || ""}
                                  </p>
                                  <p className="text-[10px] text-text-light-secondary/50 dark:text-text-dark-secondary/50">
                                    {usr.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Role Select Upgrade */}
                            <td className="py-3.5 px-2">
                              <select
                                value={usr.role}
                                onChange={(e) => updateUserRole(usr._id, e.target.value)}
                                className="bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark rounded-lg px-2.5 py-1 text-[10px] font-bold focus:outline-none focus:border-accent uppercase tracking-wider"
                              >
                                <option value="USER">USER</option>
                                <option value="AUTHOR">AUTHOR</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>

                            {/* Status block badge */}
                            <td className="py-3.5 px-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                usr.isUserActive 
                                  ? "bg-emerald-500/10 text-emerald-500" 
                                  : "bg-red-500/10 text-red-500"
                              }`}>
                                {usr.isUserActive ? "Active" : "Suspended"}
                              </span>
                            </td>

                            {/* Actions bar */}
                            <td className="py-3.5 pl-2 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => toggleUserSuspension(usr._id, !usr.isUserActive)}
                                  className="px-2.5 py-1 text-[9px] rounded-lg tracking-widest"
                                >
                                  {usr.isUserActive ? "SUSPEND" : "ACTIVATE"}
                                </Button>
                                {usr._id !== currentUser._id && (
                                  <Button
                                    variant="danger"
                                    onClick={() => {
                                      if (window.confirm(`Permanently erase user record and written blogs?`)) {
                                        deleteUser(usr._id);
                                      }
                                    }}
                                    className="px-2.5 py-1 text-[9px] rounded-lg tracking-widest"
                                  >
                                    DELETE
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* TAB CONTENT 3: BLOGS & EDITORIAL CONTROL */}
            {activeTab === "blogs" && (
              <Card hoverEffect={false} className="p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-sm font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                    ✍️ Editorial & Article Index
                  </h3>
                  <span className="text-[9px] font-semibold text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-mono">
                    Total: {blogs.length} entries
                  </span>
                </div>

                {loading && blogs.length === 0 ? (
                  <div className="py-20 text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 animate-pulse">
                    Parsing article archives...
                  </div>
                ) : blogs.length === 0 ? (
                  <p className="text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 py-10 italic font-sans">
                    No articles published in databases.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-light dark:border-border-dark/60 text-text-light-secondary/50 dark:text-text-dark-secondary/50 font-bold uppercase tracking-wider text-[9px]">
                          <th className="pb-3 pr-2">Article Details</th>
                          <th className="pb-3 px-2">Author</th>
                          <th className="pb-3 px-2">Status</th>
                          <th className="pb-3 pl-2 text-right">Moderations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light/40 dark:divide-border-dark/20 font-medium">
                        {blogs.map((blog) => (
                          <tr key={blog._id} className="hover:bg-paper-light/20 dark:hover:bg-card-dark/20 transition-colors">
                            {/* Blog Cover + Title */}
                            <td className="py-3.5 pr-2">
                              <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm">
                                <img
                                  src={blog.coverImage}
                                  alt="Cover"
                                  className="w-10 h-7 rounded-md object-cover border border-border-light dark:border-border-dark"
                                />
                                <div>
                                  <p 
                                    onClick={() => navigate(`/article/${blog._id}`)}
                                    className="font-bold text-text-light-primary dark:text-text-dark-primary text-xs sm:text-sm hover:text-accent cursor-pointer transition-colors line-clamp-1 leading-snug"
                                  >
                                    {blog.title}
                                  </p>
                                  <p className="text-[9px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 uppercase font-black tracking-widest mt-0.5">
                                    {blog.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Author name */}
                            <td className="py-3.5 px-2">
                              <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary font-semibold">
                                {blog.author?.firstName || "Unknown"} {blog.author?.lastName || ""}
                              </span>
                            </td>

                            {/* Feature and Active Status indicators */}
                            <td className="py-3.5 px-2 space-y-1">
                              <div>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                  blog.isArticleActive 
                                    ? "bg-emerald-500/10 text-emerald-500" 
                                    : "bg-amber-500/10 text-amber-500"
                                }`}>
                                  {blog.isArticleActive ? "Visible" : "Hidden"}
                                </span>
                              </div>
                              {blog.isFeatured && (
                                <div>
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-accent/15 text-accent">
                                    ⭐ FEATURED
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Actions bar */}
                            <td className="py-3.5 pl-2 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => toggleBlogFeatured(blog._id, !blog.isFeatured)}
                                  className="px-2 py-1 text-[9px] rounded-lg tracking-widest uppercase font-bold"
                                >
                                  {blog.isFeatured ? "Unfeature" : "Feature"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => toggleBlogHidden(blog._id, !blog.isArticleActive)}
                                  className="px-2 py-1 text-[9px] rounded-lg tracking-widest uppercase font-bold"
                                >
                                  {blog.isArticleActive ? "Hide" : "Show"}
                                </Button>
                                <Button
                                  variant="danger"
                                  onClick={() => {
                                    if (window.confirm(`Permanently erase this blog article?`)) {
                                      deleteBlog(blog._id);
                                    }
                                  }}
                                  className="px-2 py-1 text-[9px] rounded-lg tracking-widest"
                                >
                                  DELETE
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* TAB CONTENT 4: COMMENTS MODERATION */}
            {activeTab === "comments" && (
              <Card hoverEffect={false} className="p-6 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif text-sm font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                    💬 Comments Moderation Desk
                  </h3>
                  <span className="text-[9px] font-semibold text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-mono">
                    Total: {comments.length} entries
                  </span>
                </div>

                {loading && comments.length === 0 ? (
                  <div className="py-20 text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 animate-pulse">
                    Synthesizing responses board...
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-center text-xs text-text-light-secondary/40 dark:text-text-dark-secondary/40 py-10 italic font-sans">
                    No comments found across dispatches.
                  </p>
                ) : (
                  <div className="divide-y divide-border-light dark:divide-border-dark/40 max-h-[70vh] overflow-y-auto pr-2">
                    {comments.map((comment) => (
                      <div key={comment._id} className="py-4 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-paper-light/20 dark:hover:bg-card-dark/20 transition-all rounded-xl p-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            {comment.user?.profileImageUrl ? (
                              <img
                                src={comment.user.profileImageUrl}
                                alt="User"
                                className="w-5 h-5 rounded-full object-cover border border-border-light"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-accent/10 dark:bg-accent/20 text-accent font-serif font-black flex items-center justify-center text-[8px]">
                                {comment.user?.firstName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs font-bold text-text-light-primary dark:text-text-dark-primary">
                              {comment.user?.firstName} {comment.user?.lastName || ""}
                            </span>
                            <span className="text-[9px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 font-mono">
                              ({comment.user?.email})
                            </span>
                          </div>

                          <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary bg-paper-light dark:bg-paper-dark border border-border-light/45 dark:border-border-dark/45 rounded-xl p-3 leading-relaxed">
                            {comment.comment}
                          </p>

                          <p className="text-[9px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 font-medium">
                            Thread:{" "}
                            <span 
                              onClick={() => navigate(`/article/${comment.articleId?._id}`)}
                              className="font-bold underline text-accent cursor-pointer"
                            >
                              {comment.articleId?.title || "Deleted/Missing Article"}
                            </span>{" "}
                            &bull; Date: {new Date(comment.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <Button
                          variant="danger"
                          onClick={() => {
                            if (window.confirm("Perform a hard moderate/delete of this comment?")) {
                              deleteComment(comment._id);
                            }
                          }}
                          className="px-3 py-1.5 text-[9px] rounded-lg tracking-widest self-end sm:self-center"
                        >
                          MODERATE
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
