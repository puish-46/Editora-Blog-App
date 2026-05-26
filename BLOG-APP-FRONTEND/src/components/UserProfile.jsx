import { useAuth } from "../store/authStore";
import { useNavigate, useLocation } from "react-router";
import { useNotifications } from "../store/notificationsStore";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "./ui/Loader";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import ProfileHeader from "./ui/ProfileHeader";
import DashboardSidebar from "./ui/DashboardSidebar";
import UserStatsCard from "./ui/UserStatsCard";
import BlogGrid from "./ui/BlogGrid";
import toast from "react-hot-toast";

import {
  errorClass,
  bodyText,
  headingClass,
  subHeadingClass,
} from "../styles/common.js";

function UserProfile() {
  const logout = useAuth((state) => state.logout);
  const currentUser = useAuth((state) => state.currentUser);
  const updateUser = useAuth((state) => state.updateUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | my-blogs | liked-blogs | bookmarks | settings

  // Notifications Store variables
  const dbNotifications = useNotifications((state) => state.notifications);
  const loadingNotifications = useNotifications((state) => state.loading);
  const fetchNotifications = useNotifications((state) => state.fetchNotifications);
  const markAsRead = useNotifications((state) => state.markAsRead);
  const markAllAsRead = useNotifications((state) => state.markAllAsRead);
  const deleteNotification = useNotifications((state) => state.deleteNotification);

  const locationState = useLocation().state;

  useEffect(() => {
    if (locationState?.openTab) {
      setActiveTab(locationState.openTab);
    }
  }, [locationState]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);

  // Profile fields & lists
  const [myArticles, setMyArticles] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [likedArticlesList, setLikedArticlesList] = useState([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalLikes: 0,
    totalComments: 0,
    totalBookmarks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Settings Edit states
  const [firstName, setFirstName] = useState(currentUser?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [profession, setProfession] = useState(currentUser?.profession || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [website, setWebsite] = useState(currentUser?.website || "");
  const [twitter, setTwitter] = useState(currentUser?.socialLinks?.twitter || "");
  const [github, setGithub] = useState(currentUser?.socialLinks?.github || "");
  const [linkedin, setLinkedin] = useState(currentUser?.socialLinks?.linkedin || "");
  const [profileImageUrl, setProfileImageUrl] = useState(currentUser?.profileImageUrl || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Sync settings when currentUser loads/changes
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setBio(currentUser.bio || "");
      setProfession(currentUser.profession || "");
      setLocation(currentUser.location || "");
      setWebsite(currentUser.website || "");
      setTwitter(currentUser.socialLinks?.twitter || "");
      setGithub(currentUser.socialLinks?.github || "");
      setLinkedin(currentUser.socialLinks?.linkedin || "");
      setProfileImageUrl(currentUser.profileImageUrl || "");
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch authored blogs by this specific user
      const myBlogsRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/user/${currentUser?._id}`, { withCredentials: true });
      if (myBlogsRes.status === 200) {
        setMyArticles(myBlogsRes.data.payload || []);
      }

      // 2. Fetch bookmarks
      const bookmarksRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/bookmarks`, { withCredentials: true });
      if (bookmarksRes.status === 200) {
        setBookmarkedArticles(bookmarksRes.data.payload || []);
      }

      // 3. Fetch liked articles
      const likedRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/liked`, { withCredentials: true });
      if (likedRes.status === 200) {
        setLikedArticlesList(likedRes.data.payload || []);
      }

      // 4. Fetch user stats and recent activity logs
      const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/profile/stats`, { withCredentials: true });
      if (statsRes.status === 200) {
        setStats(statsRes.data.payload.stats || { totalBlogs: 0, totalLikes: 0, totalComments: 0, totalBookmarks: 0 });
        setRecentActivity(statsRes.data.payload.recentActivity || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err.response?.data?.error || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      fetchDashboardData();
    }
  }, [currentUser?._id]);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleCardClick = (article) => {
    navigate(`/article/${article._id}`, { state: article });
  };

  // Avatar upload via Cloudinary backend endpoint
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user-api/profile/upload-avatar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );

      if (res.status === 200) {
        const newUrl = res.data.payload.profileImageUrl;
        setProfileImageUrl(newUrl);
        
        // Auto-save the profile picture update instantly
        const updateRes = await axios.put(
          `${import.meta.env.VITE_API_URL}/user-api/profile/update`,
          { profileImageUrl: newUrl },
          { withCredentials: true }
        );
        
        if (updateRes.status === 200) {
          updateUser(updateRes.data.payload);
          toast.success("Profile picture updated successfully!");
        }
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Profile Save handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        firstName,
        lastName,
        bio,
        profession,
        location,
        website,
        socialLinks: {
          twitter,
          github,
          linkedin
        }
      };

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/user-api/profile/update`,
        updateData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        updateUser(res.data.payload);
        toast.success("Profile details saved successfully!");
        setActiveTab("overview");
      }
    } catch (err) {
      console.error("Failed to update profile details:", err);
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setLoading(false);
    }
  };

  if (loading && myArticles.length === 0 && stats.totalBlogs === 0) {
    return <Loader message="Opening your workspace dashboard..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 transition-editorial">
      {/* 1. Header Banner */}
      {currentUser && (
        <ProfileHeader
          user={currentUser}
          stats={stats}
          editable={true}
          onAvatarClick={() => document.getElementById("avatarFileInput").click()}
        />
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        id="avatarFileInput"
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />

      {/* 2. Responsive Multi-Column Dashboard Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Navigation Section */}
        <div className="lg:col-span-1">
          <DashboardSidebar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={currentUser}
            onLogout={onLogout}
          />
        </div>

        {/* Right Dashboard Workspace Panels */}
        <div className="lg:col-span-3">
          {error && <p className={errorClass}>{error}</p>}

          {/* OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <h3 className={`${headingClass} text-xl border-b border-border-light dark:border-border-dark pb-3`}>
                Dashboard Analytics
              </h3>

              {/* Stats Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <UserStatsCard title="Authored Blogs" value={stats.totalBlogs} icon="✍️" description="Stories written" />
                <UserStatsCard title="Likes Earned" value={stats.totalLikes} icon="❤️" description="Reader reactions" />
                <UserStatsCard title="Comments" value={stats.totalComments} icon="💬" description="Total reviews" />
                <UserStatsCard title="Bookmarks" value={stats.totalBookmarks} icon="🔖" description="Stories saved" />
              </div>

              {/* Recent Activity Timeline card */}
              <Card hoverEffect={false} className="border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 rounded-3xl mt-4">
                <h4 className="font-serif text-lg font-bold text-text-light-primary dark:text-text-dark-primary mb-4 border-b border-border-light/20 pb-3">
                  Recent Workspace Activity
                </h4>

                {recentActivity.length === 0 ? (
                  <p className="text-xs text-text-light-secondary/50 dark:text-text-dark-secondary/50 italic py-4">
                    No recent actions recorded. Support some articles or compose a dispatch to trigger log actions!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 items-start text-xs border-b border-border-light/10 pb-3 last:border-0 last:pb-0">
                        <span className="text-base shrink-0">
                          {activity.type === "publish" ? "✍️" : "❤️"}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-text-light-primary dark:text-text-dark-primary">
                            {activity.title}
                          </p>
                          <span className="text-[10px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 block mt-1 font-mono">
                            {new Date(activity.time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* MY BLOGS PANEL */}
          {activeTab === "my-blogs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-border-light dark:border-border-dark pb-3">
                <h3 className={`${headingClass} text-xl`}>Authored Stories</h3>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{myArticles.length} Published</span>
              </div>
              <BlogGrid 
                articles={myArticles}
                loading={loading}
                emptyMessage="No stories published yet. Compose a new article and publish it to the Editora directory!"
                onCardClick={handleCardClick}
              />
            </div>
          )}

          {/* LIKED BLOGS PANEL */}
          {activeTab === "liked-blogs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-border-light dark:border-border-dark pb-3">
                <h3 className={`${headingClass} text-xl`}>Liked Stories</h3>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{likedArticlesList.length} Support Articles</span>
              </div>
              <BlogGrid 
                articles={likedArticlesList}
                loading={loading}
                emptyMessage="You haven't liked any dispatches yet. Support independent writing by liking articles on the homepage!"
                onCardClick={handleCardClick}
              />
            </div>
          )}

          {/* BOOKMARKS PANEL */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-border-light dark:border-border-dark pb-3">
                <h3 className={`${headingClass} text-xl`}>Saved Bookmarks</h3>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{bookmarkedArticles.length} Saved</span>
              </div>
              <BlogGrid 
                articles={bookmarkedArticles}
                loading={loading}
                emptyMessage="Your bookmarks queue is currently empty. Bookmark dispatches from the homepage feed to save them here!"
                onCardClick={handleCardClick}
              />
            </div>
          )}

          {/* NOTIFICATIONS LOGS PANEL */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-baseline border-b border-border-light dark:border-border-dark pb-3">
                <h3 className={`${headingClass} text-xl`}>Notifications Logs</h3>
                <div className="flex items-center gap-3">
                  {dbNotifications.filter(n => !n.isRead).length > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs uppercase font-extrabold tracking-wider text-accent hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Mark all as read
                    </button>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {dbNotifications.length} Total
                  </span>
                </div>
              </div>

              {loadingNotifications ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="h-20 w-full animate-pulse bg-card-light/20 dark:bg-card-dark/20 border border-border-light dark:border-border-dark rounded-2xl"></div>
                  ))}
                </div>
              ) : dbNotifications.length === 0 ? (
                <div className="text-center text-text-light-secondary/50 dark:text-text-dark-secondary/50 py-16 border border-dashed border-border-light dark:border-border-dark rounded-3xl">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-accent/40 mx-auto mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  <p className="text-sm font-semibold">Your notifications inbox is clear.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dbNotifications.map((notif) => (
                    <Card
                      key={notif._id}
                      hoverEffect={false}
                      className={`p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                        notif.isRead
                          ? "bg-card-light/40 dark:bg-card-dark/40 border-border-light/40 dark:border-border-dark/40"
                          : "bg-accent/[0.03] dark:bg-accent/[0.01] border-accent/20 shadow-sm"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-sm">
                          {notif.sender?.firstName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-xs text-text-light-primary dark:text-text-dark-primary font-semibold leading-relaxed">
                            <span className="font-extrabold text-accent">{notif.sender?.firstName} {notif.sender?.lastName || ""}</span>{" "}
                            {notif.type === "like" && "liked your dispatch"}
                            {notif.type === "bookmark" && "saved your story to their bookmarks"}
                            {notif.type === "comment" && "commented on your story"}
                          </p>
                          {notif.article && (
                            <p 
                              onClick={() => navigate(`/article/${notif.article._id}`)}
                              className="text-[11px] font-bold text-accent hover:underline cursor-pointer mt-1 font-serif"
                            >
                              "{notif.article.title}"
                            </p>
                          )}
                          {notif.comment && (
                            <p className="text-[11px] italic bg-paper-light dark:bg-paper-dark border border-border-light/30 p-2.5 rounded-xl text-text-light-secondary/80 dark:text-text-dark-secondary/80 mt-1.5 font-sans leading-relaxed">
                              "{notif.comment}"
                            </p>
                          )}
                          <span className="text-[9px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 block mt-1.5 font-mono">
                            {new Date(notif.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif._id)}
                            className="px-3 py-1.5 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent hover:text-white dark:hover:text-paper-dark text-accent text-[10px] uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif._id)}
                          className="p-1.5 rounded-xl border border-border-light dark:border-border-dark text-text-light-secondary/50 dark:text-text-dark-secondary/50 hover:text-red-500 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                          title="Delete notification"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT SETTINGS PANEL */}
          {activeTab === "settings" && (
            <Card hoverEffect={false} className="border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 rounded-3xl animate-fade-in">
              <h3 className="font-serif text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-6 border-b border-border-light/30 pb-3">
                Account Settings
              </h3>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* 1. Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input 
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Profession / Title"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="e.g. Lead UI Designer at Google"
                  />
                  <Input 
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>

                <Input 
                  label="Website / Portfolio"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. editora.io"
                />

                {/* 2. Biography */}
                <div className="mb-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
                    Biography / Cover Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell the community about yourself, your background, and your professional coverage interests..."
                    className="w-full p-4 rounded-2xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-xs focus:outline-none focus:border-accent transition-all duration-300 font-sans"
                  />
                </div>

                {/* 3. Social Media Links */}
                <div className="pt-4 border-t border-border-light/20">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-accent mb-4">
                    Social Connections Links
                  </h4>
                  <div className="space-y-4">
                    <Input 
                      label="Twitter Profile link"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="e.g. https://twitter.com/username"
                    />
                    <Input 
                      label="GitHub Profile link"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="e.g. https://github.com/username"
                    />
                    <Input 
                      label="LinkedIn Profile link"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="e.g. https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-6 border-t border-border-light/20">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>

              </form>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

export default UserProfile;