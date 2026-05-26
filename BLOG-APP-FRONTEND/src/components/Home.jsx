import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { useInteractions } from "../store/interactionsStore";
import Button from "./ui/Button";
import Card from "./ui/Card";
import SectionTitle from "./ui/SectionTitle";
import OptimizedImage from "./ui/OptimizedImage";
import SEO from "./ui/SEO";
import toast from "react-hot-toast";
import { stripHtmlAndGetTeaser } from "../utils/textHelper";

// Premium Curated Editorial Mock Articles (Static Fallbacks)
const heroArticle = {
  _id: "hero-1",
  title: "The Architecture of Tomorrow: Building Beyond the Screen",
  content: "As artificial intelligence and spatial computing redefine the digital frontier, we explore how designers and engineers are crafting the next generation of sensory-rich human interfaces. The screen, once our absolute window to information, is slowly dissolving into ambient environments...",
  category: "AI",
  author: { firstName: "Evelyn", lastName: "Thorne" },
  createdAt: "2026-05-24T10:00:00.000Z",
  readTime: "7 min read",
  tags: ["future", "design", "ai", "spatial"],
  likes: [],
  coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
};

const mockTrendingArticles = [
  {
    _id: "trend-1",
    title: "The Renaissance of Minimalism in Digital Spaces",
    content: "In an era of cognitive overload, true luxury is found in silent, high-performance interfaces. Inside the modern shift back to absolute clarity and clean layouts.",
    category: "Lifestyle",
    author: { firstName: "Marcus", lastName: "Vance" },
    createdAt: "2026-05-22T08:30:00.000Z",
    readTime: "5 min read",
    tags: ["design", "minimalism", "lifestyle"],
    likes: [],
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "trend-2",
    title: "Rust, WebAssembly, and the New Edge Network",
    content: "How compiling systems languages to the web is unlocking desktop-grade speeds inside traditional browser applications, redefining performance boundaries.",
    category: "Technology",
    author: { firstName: "Liam", lastName: "Carter" },
    createdAt: "2026-05-20T14:15:00.000Z",
    readTime: "9 min read",
    tags: ["programming", "webassembly", "rust"],
    likes: [],
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80"
  },
  {
    _id: "trend-3",
    title: "Quantum Physics at Room Temperature: The Silicon Breakthrough",
    content: "Scientists have successfully stabilized spin-qubits inside standard silicon lattices, paving a clear, high-contrast path to mass-produced quantum consumer supercomputing.",
    category: "AI",
    author: { firstName: "Dr. Sarah", lastName: "Chen" },
    createdAt: "2026-05-18T11:00:00.000Z",
    readTime: "12 min read",
    tags: ["quantum", "physics", "science"],
    likes: [],
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80"
  }
];

const categories = [
  { id: "all", name: "All Stories" },
  { id: "technology", name: "Technology" },
  { id: "ai", name: "AI" },
  { id: "design", name: "Design" },
  { id: "business", name: "Business" },
  { id: "productivity", name: "Productivity" },
  { id: "lifestyle", name: "Lifestyle" }
];

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.currentUser);

  // Interactions Zustand hook variables
  const likedArticles = useInteractions((state) => state.likedArticles);
  const likeCounts = useInteractions((state) => state.likeCounts);
  const bookmarkedIds = useInteractions((state) => state.bookmarkedIds);
  const toggleLike = useInteractions((state) => state.toggleLike);
  const toggleBookmark = useInteractions((state) => state.toggleBookmark);
  const fetchBookmarks = useInteractions((state) => state.fetchBookmarks);
  const fetchLikedArticles = useInteractions((state) => state.fetchLikedArticles);
  const syncArticleState = useInteractions((state) => state.syncArticleState);
  const trendingArticles = useInteractions((state) => state.trendingArticles);
  const fetchTrendingArticles = useInteractions((state) => state.fetchTrendingArticles);

  const [articles, setArticles] = useState([]);
  const dbFeatured = articles.find(a => a.isFeatured);
  const activeHero = dbFeatured || heroArticle;
  const activeTrending = trendingArticles && trendingArticles.length > 0 ? trendingArticles : mockTrendingArticles;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // New Search, Tag, Pagination, and Sorting States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSort, setSelectedSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  // Debounce search term to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch and sync global bookmark/liked lists on login/mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
      fetchLikedArticles();
    }
    fetchTrendingArticles();
  }, [isAuthenticated]);

  // Fetch articles from backend with params
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 6,
          sort: selectedSort,
        };
        
        if (selectedCategory && selectedCategory !== "all") {
          params.category = selectedCategory;
        }
        
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        let res = await axios.get(`${import.meta.env.VITE_API_URL}/user-api/articles`, {
          params,
          withCredentials: true
        });
        
        const payload = res.data.payload || [];
        setArticles(payload);
        
        // Sync article liked states and counts into the interactions store
        payload.forEach((article) => {
          syncArticleState(article, user?._id);
        });

        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalArticles(res.data.pagination.totalArticles || 0);
        }
      } catch (err) {
        console.error("Failed to load backend articles:", err);
        setError(err.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [isAuthenticated, currentPage, selectedCategory, debouncedSearch, selectedSort, user?._id]);

  const handleToggleLike = async (article) => {
    if (!isAuthenticated) {
      toast("Please register or login to like this article.", { icon: "🔒" });
      navigate("/login");
      return;
    }
    
    try {
      let res = await axios.put(`${import.meta.env.VITE_API_URL}/user-api/articles/like`, { articleId: article._id }, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message);
        // Instant reactive state update for immediate feedback
        setArticles(prev => prev.map(a => a._id === article._id ? { ...a, likes: res.data.payload.likes } : a));
      }
    } catch (err) {
      toast.error("Failed to update like status");
    }
  };

  const handleReadArticle = (article) => {
    if (!isAuthenticated) {
      toast("Please register or login to read the full article.", { icon: "🔒" });
      navigate("/login");
      return;
    }
    navigate(`/article/${article._id}`, { state: article });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    setNewsletterSuccess(true);
    toast.success("Welcome to Editora Dispatch!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Local filtering fallbacks if not authenticated or empty DB
  const displayArticles = isAuthenticated && articles.length > 0 
    ? articles 
    : [...trendingArticles, heroArticle];

  const filteredArticles = !isAuthenticated 
    ? (selectedCategory === "all"
        ? displayArticles
        : displayArticles.filter(article => 
            article.category?.toLowerCase() === selectedCategory.toLowerCase()
          )
      ).filter(article => {
        const matchesSearch = searchTerm 
          ? article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          : true;
        return matchesSearch;
      })
    : articles;

  return (
    <div className="space-y-20 pb-20">
      <SEO 
        title="Premium Editorial Magazine"
        description="Editora is a premium digital publication workspace. Explore curated articles, thoughtful dispatches, and deep insights across Design, Art, Technology, and AI."
      />
      
      {/* 1. HERO SECTION (Immersive Editorial Banner) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-paper-light dark:bg-paper-dark">
        {/* Abstract Background Cover */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage 
            src={activeHero.coverImage} 
            alt="Cover" 
            width={1200}
            className="w-full h-full object-cover filter brightness-[0.70] dark:brightness-[0.40] transition-all duration-700 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper-light via-paper-light/30 to-transparent dark:from-paper-dark dark:via-paper-dark/30"></div>
        </div>

        {/* Hero Card Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-start">
          <div className="max-w-2xl bg-white/70 dark:bg-card-dark/65 backdrop-blur-md border border-border-light/40 dark:border-border-dark/40 rounded-3xl p-8 sm:p-12 shadow-editorial transition-all duration-300">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-accent mb-3 block">
              Featured Story — {activeHero.category}
            </span>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-light-primary dark:text-text-dark-primary mb-4 leading-tight">
              {activeHero.title}
            </h1>
            
            <p className="text-sm sm:text-base text-text-light-secondary dark:text-text-dark-secondary mb-8 leading-relaxed line-clamp-3 font-sans">
              {stripHtmlAndGetTeaser(activeHero, 200)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Button 
                variant="primary" 
                onClick={() => handleReadArticle(activeHero)}
                className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest"
              >
                Read Story
              </Button>
              {!isAuthenticated && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/register")}
                  className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest"
                >
                  Join Editora
                </Button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border-light/50 dark:border-border-dark/50 flex items-center justify-between text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-medium">
              <span>By {activeHero.author.firstName} {activeHero.author.lastName || ""}</span>
              <span>{activeHero.readTime || "1 min read"} &bull; {formatDate(activeHero.createdAt)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED / TRENDING SECTION */}
      <section id="featured-blogs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionTitle 
          title="Trending Dispatches" 
          subtitle="Explore the stories shaping our collective perspectives today"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {activeTrending.map((article, idx) => (
            <Card 
              key={article._id}
              onClick={() => handleReadArticle(article)}
              className="flex flex-col h-full overflow-hidden border border-border-light dark:border-border-dark group"
            >
              {/* Image Frame */}
              <div className="h-56 overflow-hidden relative">
                <OptimizedImage 
                  src={article.coverImage} 
                  alt={article.title} 
                  width={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out filter brightness-[0.95] dark:brightness-[0.80]"
                />
                <span className="absolute bottom-3 left-3 text-[9px] font-bold tracking-wider uppercase bg-accent text-white dark:text-paper-dark px-2.5 py-0.5 rounded-full">
                  {article.category}
                </span>
                
                {/* Visual Glassmorphic Trending Score Badge */}
                <div className="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase bg-red-500/10 dark:bg-red-500/20 text-red-500 backdrop-blur-md border border-red-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  🔥 #{idx + 1} TRENDING
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-light-primary dark:text-text-dark-primary group-hover:text-accent transition-colors duration-200 line-clamp-2 leading-snug mb-3">
                    {article.title}
                  </h3>
                  <p className="text-xs text-text-light-secondary/85 dark:text-text-dark-secondary/85 line-clamp-3 leading-relaxed mb-6 font-sans">
                    {stripHtmlAndGetTeaser(article, 140)}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[11px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-semibold mt-auto flex-wrap gap-2">
                  <span>✍️ {article.author.firstName} {article.author.lastName || ""}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-accent font-bold">⏱️ {article.readTime || "1 min read"}</span>
                    <span>&bull;</span>
                    <span className="font-bold">👁️ {article.views || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES INTERACTIVE FILTER */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <SectionTitle 
          title="Browse by Genre" 
          subtitle="Refine the editorial desk to display the conversations you care about"
        />

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-300 cursor-pointer ${
                (selectedCategory === cat.id)
                  ? "bg-accent border-accent text-white dark:text-paper-dark shadow-md"
                  : "bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 4. LATEST ARTICLES SECTION (With Skeletons) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-light dark:border-border-dark pb-4 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-text-light-primary dark:text-text-dark-primary">
              Latest Stories
            </h2>
            <p className="text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 mt-1">
              Read high-quality articles written by curated independent publishers
            </p>
          </div>
          <span className="text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-mono font-medium whitespace-nowrap">
            Showing {filteredArticles.length} of {totalArticles || filteredArticles.length} entries
          </span>
        </div>

        {/* Advanced Live Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-5 shadow-editorial transition-editorial">
          {/* Live Search Input */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-text-light-secondary/60 dark:text-text-dark-secondary/60">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, author, or #tags..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:outline-none focus:border-accent transition-all duration-300 font-sans"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-text-light-secondary/60 hover:text-accent dark:text-text-dark-secondary/60 dark:hover:text-accent transition-colors cursor-pointer"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Live Sort Filter Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-text-light-secondary/60 dark:text-text-dark-secondary/60 whitespace-nowrap">
              Sort By
            </span>
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 rounded-2xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-accent transition-all duration-300 cursor-pointer min-w-[160px]"
            >
              <option value="latest">Latest Stories</option>
              <option value="oldest">Oldest Stories</option>
              <option value="trending">Trending Dispatches</option>
              <option value="most_liked">Most Liked Stories</option>
              <option value="most_commented">Most Discussed</option>
            </select>
          </div>
        </div>

        {/* Dynamic States */}
        {loading ? (
          /* Premium Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {[1, 2, 4, 5].map((index) => (
              <div key={index} className="flex gap-6 border border-border-light dark:border-border-dark p-5 rounded-2xl animate-pulse bg-card-light/20 dark:bg-card-dark/20">
                <div className="w-1/3 bg-border-light/40 dark:bg-border-dark/40 rounded-xl h-36"></div>
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-3">
                    <div className="h-3 w-16 bg-border-light/40 dark:bg-border-dark/40 rounded-full"></div>
                    <div className="h-4 w-full bg-border-light/40 dark:bg-border-dark/40 rounded-full"></div>
                    <div className="h-4 w-4/5 bg-border-light/40 dark:bg-border-dark/40 rounded-full"></div>
                  </div>
                  <div className="h-3 w-24 bg-border-light/40 dark:bg-border-dark/40 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center text-text-light-secondary/50 dark:text-text-dark-secondary/50 py-20 border border-dashed border-border-light dark:border-border-dark rounded-3xl mt-8">
            <p className="text-sm font-semibold">No stories match your filtering criteria currently.</p>
          </div>
        ) : (
          /* Editorial Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {filteredArticles.map((article) => (
              <Card
                key={article._id}
                onClick={() => handleReadArticle(article)}
                className="flex flex-col sm:flex-row gap-6 p-5 border border-border-light dark:border-border-dark hover:border-accent/30 group"
              >
                {/* Visual Thumbnail */}
                <div className="w-full sm:w-1/3 h-40 overflow-hidden rounded-xl bg-card-light/10 relative flex-shrink-0">
                  <img 
                    src={article.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80"} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 filter brightness-[0.95] dark:brightness-[0.80]"
                  />
                </div>

                {/* Info block */}
                <div className="flex flex-col justify-between flex-grow py-1">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent mb-2 block">
                      {article.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-text-light-primary dark:text-text-dark-primary group-hover:text-accent transition-colors leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-text-light-secondary/85 dark:text-text-dark-secondary/85 line-clamp-2 leading-relaxed mb-3 font-sans">
                      {stripHtmlAndGetTeaser(article, 120)}
                    </p>
                    
                    {/* Tags List */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm(tag);
                            }}
                            className="text-[9px] font-bold tracking-wider uppercase bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-secondary/80 dark:text-text-dark-secondary/80 px-2 py-0.5 rounded hover:text-accent hover:border-accent transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 font-semibold border-t border-border-light/30 dark:border-border-dark/30 pt-3 mt-auto">
                    <div className="flex items-center gap-2">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (article.author?._id) {
                            navigate(`/profile/${article.author._id}`);
                          }
                        }}
                        className="hover:underline hover:text-accent transition-colors cursor-pointer"
                      >
                        By {article.author?.firstName || "Creator"}
                      </span>
                      <span>&bull;</span>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Optimistic Like/Heart Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            toast("Please login to like this article.", { icon: "🔒" });
                            navigate("/login");
                            return;
                          }
                          toggleLike(article._id, user?._id);
                        }}
                        className={`flex items-center gap-1 hover:text-red-500 transition-colors font-bold text-[10px] cursor-pointer ${
                          likedArticles[article._id] ? "text-red-500 scale-110" : ""
                        }`}
                      >
                        <span>{likedArticles[article._id] ? "❤️" : "🤍"}</span>
                        <span>{likeCounts[article._id] ?? (article.likes?.length || 0)}</span>
                      </button>

                      {/* Optimistic Bookmark Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAuthenticated) {
                            toast("Please login to bookmark this article.", { icon: "🔒" });
                            navigate("/login");
                            return;
                          }
                          toggleBookmark(article, user?._id);
                          toast.success(bookmarkedIds.has(article._id) ? "Removed from Bookmarks" : "Saved to Bookmarks!");
                        }}
                        className={`flex items-center hover:text-accent transition-colors font-bold text-[10px] cursor-pointer ${
                          bookmarkedIds.has(article._id) ? "text-accent scale-110" : ""
                        }`}
                        title={bookmarkedIds.has(article._id) ? "Unbookmark" : "Bookmark"}
                      >
                        <span>{bookmarkedIds.has(article._id) ? "🔖" : "📑"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-editorial cursor-pointer"
            >
              ← Previous
            </Button>
            
            <span className="text-xs font-mono font-bold text-text-light-secondary/60 dark:text-text-dark-secondary/60">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-editorial cursor-pointer"
            >
              Next →
            </Button>
          </div>
        )}
      </section>

      {/* 5. NEWSLETTER DISPATCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-8 sm:p-16 shadow-editorial text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full filter blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full filter blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              The Dispatch
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-light-primary dark:text-text-dark-primary tracking-tight">
              Stories that shape our perspectives, directly to your inbox.
            </h2>
            <p className="text-sm text-text-light-secondary/85 dark:text-text-dark-secondary/85 leading-relaxed">
              Subscribe to get curated, high-end insights, technical essays, and independent journalism delivered weekly.
            </p>

            {newsletterSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-emerald-600 dark:text-emerald-400 font-serif text-sm">
                🎉 Welcome to the Dispatch! You are now subscribed.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 mt-6">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-5 py-3 rounded-full bg-white dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-sm focus:outline-none focus:border-accent transition-colors"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-8 py-3 rounded-full uppercase tracking-wider text-xs font-bold"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;