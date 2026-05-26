import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../store/authStore";
import Loader from "./ui/Loader";
import Card from "./ui/Card";
import {
  articleGrid,
  articleTitle,
  errorClass,
  bodyText,
  timestampClass,
} from "../styles/common.js";

function AuthorArticles() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.currentUser);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const getAuthorArticles = async () => {
      try {
        setLoading(true);
        let res = await axios.get(`${import.meta.env.VITE_API_URL}/author-api/articles`, { withCredentials: true });
        if (res.status === 200) {
          setArticles(res.data.payload);
        }
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    getAuthorArticles();
  }, [user]);

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
    });
  };

  if (loading) return <Loader message="Fetching your published articles..." />;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div>
      {articles.length === 0 ? (
        <div className="text-center text-text-light-secondary/55 dark:text-text-dark-secondary/55 py-20 border border-dashed border-border-light dark:border-border-dark rounded-3xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-accent/40 mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V6c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V7.5Z" />
          </svg>
          <p className="text-sm font-medium">You haven't published any articles yet.</p>
        </div>
      ) : (
        <div className={articleGrid}>
          {articles.map((article) => (
            <Card
              key={article._id}
              onClick={() => openArticle(article)}
              className="flex flex-col justify-between h-full relative group"
            >
              {/* Status Badge */}
              <span className={`absolute top-4 right-4 text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                article.isArticleActive 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}>
                {article.isArticleActive ? "ACTIVE" : "DELETED"}
              </span>

              <div>
                {/* Category */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2.5 block">
                  {article.category || "General"}
                </span>
                
                {/* Title */}
                <h4 className={`${articleTitle} group-hover:text-accent transition-colors mb-2`}>
                  {article.title}
                </h4>

                {/* Excerpt */}
                <p className={`${bodyText} text-sm line-clamp-3 mb-4`}>
                  {article.content}
                </p>
              </div>

              {/* Meta details */}
              <div className="flex justify-between items-center border-t border-border-light dark:border-border-dark pt-4 mt-auto">
                <span className={timestampClass}>
                  {formatDate(article.createdAt)}
                </span>
                <span className="text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform duration-200">
                  Manage &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthorArticles;