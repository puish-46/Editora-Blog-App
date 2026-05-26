import Card from "./Card";
import { stripHtmlAndGetTeaser } from "../../utils/textHelper";

function BlogGrid({ articles = [], loading = false, emptyMessage = "No stories found.", onCardClick }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium"
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="border border-border-light dark:border-border-dark p-5 rounded-2xl animate-pulse bg-card-light/20 dark:bg-card-dark/20 h-44"></div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center text-text-light-secondary/50 dark:text-text-dark-secondary/50 py-16 border border-dashed border-border-light dark:border-border-dark rounded-3xl">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-accent/40 mx-auto mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V6c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V7.5Z" />
        </svg>
        <p className="text-sm font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {articles.map((article) => (
        <Card
          key={article._id}
          onClick={() => onCardClick?.(article)}
          className="flex flex-col justify-between p-5 border border-border-light dark:border-border-dark hover:border-accent/30 group cursor-pointer"
        >
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent mb-2 block">
              {article.category || "Story"}
            </span>
            <h3 className="font-serif text-base font-bold text-text-light-primary dark:text-text-dark-primary group-hover:text-accent transition-colors leading-snug mb-2 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-xs text-text-light-secondary/85 dark:text-text-dark-secondary/85 line-clamp-2 leading-relaxed mb-4 font-sans">
              {stripHtmlAndGetTeaser(article, 120)}
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-semibold border-t border-border-light/30 dark:border-border-dark/30 pt-3 mt-auto flex-wrap gap-2">
            <span>By {article.author?.firstName || "Author"}</span>
            <div className="flex items-center gap-2">
              <span>{formatDate(article.createdAt)}</span>
              <span>&bull;</span>
              <span className="text-accent font-bold">⏱️ {article.readTime || "1 min read"}</span>
              <span>&bull;</span>
              <span className="font-bold">👁️ {article.views || 0}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default BlogGrid;
