import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./ui/Loader";
import Card from "./ui/Card";
import Button from "./ui/Button";
import {
  articleGrid,
  articleTitle,
  errorClass,
  bodyText,
} from "../styles/common.js";

function AuthorList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAuthors();
  }, []);

  const getAuthors = async () => {
    setLoading(true);
    try {
      let res = await axios.get(`${import.meta.env.VITE_API_URL}/admin-api/authors`, { withCredentials: true });
      setAuthors(res.data.payload);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  const deleteAuthor = async (email) => {
    if (!window.confirm(`Are you sure you want to deactivate author ${email}?`)) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin-api/user`, { email, isUserActive: false }, { withCredentials: true });
      getAuthors();
    } catch (err) {
      setError("Failed to deactivate author");
    }
  };

  const restoreAuthor = async (email) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin-api/user`, { email, isUserActive: true }, { withCredentials: true });
      getAuthors();
    } catch (err) {
      setError("Failed to activate author");
    }
  };

  if (loading) return <Loader message="Retrieving creators directory..." />;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div>
      {authors.length === 0 ? (
        <div className="text-center text-text-light-secondary/55 dark:text-text-dark-secondary/55 py-20 border border-dashed border-border-light dark:border-border-dark rounded-3xl">
          <p className="text-sm font-medium">No authors found.</p>
        </div>
      ) : (
        <div className={articleGrid}>
          {authors.map((author) => (
            <Card key={author._id} hoverEffect={true} className="flex flex-col justify-between h-full relative group">
              {/* Badge */}
              <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                author.isUserActive 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" 
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}>
                {author.isUserActive ? "ACTIVE" : "DEACTIVE"}
              </span>

              {/* Author Info */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent mb-2.5 block">
                  {author.role}
                </span>

                <h4 className={`${articleTitle} mb-1 font-serif text-lg font-bold text-text-light-primary dark:text-text-dark-primary`}>
                  {author.firstName} {author.lastName || ""}
                </h4>

                <p className={`${bodyText} text-xs font-mono break-all text-text-light-secondary/75 dark:text-text-dark-secondary/75`}>
                  {author.email}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-border-light dark:border-border-dark flex gap-3">
                {author.isUserActive ? (
                  <Button
                    variant="danger"
                    onClick={() => deleteAuthor(author.email)}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg"
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => restoreAuthor(author.email)}
                    className="w-full py-1.5 text-xs font-semibold rounded-lg"
                  >
                    Activate
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuthorList;