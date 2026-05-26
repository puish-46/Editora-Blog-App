import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./ui/Loader";
import ProfileHeader from "./ui/ProfileHeader";
import BlogGrid from "./ui/BlogGrid";
import SectionTitle from "./ui/SectionTitle";
import toast from "react-hot-toast";

function UserProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch public profile and stats
        const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/profile/${id}`, { withCredentials: true });
        if (profileRes.status === 200) {
          setProfileUser(profileRes.data.payload.user);
          setStats({
            totalBlogs: profileRes.data.payload.totalBlogs,
            totalLikes: profileRes.data.payload.totalLikes
          });
        }

        // 2. Fetch public authored blogs
        const blogsRes = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles/user/${id}`, { withCredentials: true });
        if (blogsRes.status === 200) {
          setArticles(blogsRes.data.payload || []);
        }
      } catch (err) {
        console.error("Failed to load public profile:", err);
        setError(err.response?.data?.message || "Failed to load public profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  const handleCardClick = (article) => {
    navigate(`/article/${article._id}`, { state: article });
  };

  if (loading) {
    return <Loader message="Opening editorial profile..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="font-serif text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Profile Unavailable</h3>
        <p className="text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 mb-6">{error}</p>
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-accent text-white dark:text-paper-dark cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 transition-editorial">
      {/* 1. Profile Header Row */}
      {profileUser && (
        <ProfileHeader 
          user={profileUser}
          stats={stats}
          editable={false}
        />
      )}

      {/* 2. Written Stories Desk */}
      <div className="mt-12">
        <SectionTitle 
          title="Published Dispatches" 
          subtitle="Explore all editorial coverage and opinions published by this contributor"
        />

        <div className="mt-8">
          <BlogGrid 
            articles={articles}
            loading={loading}
            emptyMessage="This contributor has not published any dispatches yet."
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </div>
  );
}

export default UserProfileDetails;
