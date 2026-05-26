import { NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../store/authStore";
import { useTheme } from "../store/themeStore";
import { useNotifications } from "../store/notificationsStore";
import { navLinkClass, navLinkActiveClass } from "../styles/common";

function Header() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.currentUser);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Notifications Store variables
  const unreadCount = useNotifications((state) => state.unreadCount);
  const notifications = useNotifications((state) => state.notifications);
  const fetchNotifications = useNotifications((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotifications((state) => state.fetchUnreadCount);
  const markAsRead = useNotifications((state) => state.markAsRead);
  const markAllAsRead = useNotifications((state) => state.markAllAsRead);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Monitor scroll behavior for premium transparent-to-opaque effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Notifications Polling and fetcher
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleBellClick = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen) {
      fetchNotifications();
    }
  };

  const getProfilePath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "AUTHOR":
        return "/author-profile";
      case "ADMIN":
        return "/admin-profile";
      default:
        return "/user-profile";
    }
  };

  const getWritePath = () => {
    if (!isAuthenticated) return "/register";
    if (user?.role === "AUTHOR") return "/author-profile/write-article";
    return "/unauthorized";
  };

  const handleSmoothScroll = (selector) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const element = document.querySelector(selector);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Determine transparent background state on homepage top
  const isHomepage = location.pathname === "/";
  const headerBgClass = isScrolled
    ? "bg-white/80 dark:bg-paper-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark shadow-sm"
    : isHomepage
      ? "bg-transparent border-b border-transparent"
      : "bg-white/80 dark:bg-paper-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark";

  return (
    <nav className={`fixed top-0 left-0 w-full h-[72px] flex items-center z-50 transition-all duration-300 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <NavLink 
          to="/" 
          className="font-serif tracking-widest text-2xl font-bold uppercase flex items-center gap-1.5 text-text-light-primary dark:text-text-dark-primary select-none group"
        >
          <span className="text-accent group-hover:scale-105 transition-transform">E</span>ditora
        </NavLink>

        {/* DESKTOP NAV ITEMS */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? navLinkActiveClass : `${navLinkClass} hover:text-accent`
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <button
                onClick={() => handleSmoothScroll("#featured-blogs")}
                className={`${navLinkClass} hover:text-accent bg-transparent border-0 cursor-pointer`}
              >
                Explore
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSmoothScroll("#categories")}
                className={`${navLinkClass} hover:text-accent bg-transparent border-0 cursor-pointer`}
              >
                Categories
              </button>
            </li>
            <li>
              <NavLink
                to={getWritePath()}
                className={({ isActive }) =>
                  isActive ? navLinkActiveClass : `${navLinkClass} hover:text-accent`
                }
              >
                Write
              </NavLink>
            </li>
            <li>
              <NavLink
                to={getProfilePath()}
                className={({ isActive }) =>
                  isActive ? navLinkActiveClass : `${navLinkClass} hover:text-accent`
                }
              >
                {isAuthenticated ? "Profile" : "Sign In"}
              </NavLink>
            </li>
          </ul>

          <div className="h-4 w-[1px] bg-border-light dark:bg-border-dark"></div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border-light dark:border-border-dark bg-card-light/40 dark:bg-card-dark/40 text-text-light-secondary dark:text-text-dark-secondary hover:text-accent hover:border-accent/40 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.4 12.4l1.58 1.58M3 12h2.25m13.5 0H21M6.08 18.08l1.58-1.58M18.08 6.08l1.58-1.58M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
              </svg>
            )}
          </button>

          {/* Notifications Bell Overlay Trigger */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={handleBellClick}
                className="p-2 rounded-full border border-border-light dark:border-border-dark bg-card-light/40 dark:bg-card-dark/40 text-text-light-secondary dark:text-text-dark-secondary hover:text-accent hover:border-accent/40 active:scale-95 transition-all duration-200 cursor-pointer relative"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-[9px] text-white dark:text-paper-dark font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-paper-dark animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Editorial Bell Dropdown Menu Container */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-editorial rounded-3xl p-4 z-50 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-border-light/20 pb-2.5 mb-2.5">
                    <span className="font-serif font-extrabold text-sm text-text-light-primary dark:text-text-dark-primary">
                      Dispatches Activity
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-[10px] uppercase font-bold tracking-widest text-accent hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 py-6 text-center italic">
                        Your dispatches log is clear.
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                            if (notif.article?._id) {
                              navigate(`/article/${notif.article._id}`);
                            }
                            setDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                            notif.isRead
                              ? "bg-transparent border-transparent text-text-light-secondary/60 dark:text-text-dark-secondary/60"
                              : "bg-accent/5 border-accent/10 text-text-light-primary dark:text-text-dark-primary shadow-sm"
                          }`}
                        >
                          {/* Sender Initials or Avatar */}
                          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 font-bold font-serif">
                            {notif.sender?.firstName?.charAt(0).toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold leading-snug">
                              <span className="font-bold text-accent">{notif.sender?.firstName}</span>{" "}
                              {notif.type === "like" && "liked your dispatch"}
                              {notif.type === "bookmark" && "saved your story"}
                              {notif.type === "comment" && "reviewed your dispatch"}
                            </p>
                            {notif.article && (
                              <p className="text-[10px] text-text-light-secondary/50 dark:text-text-dark-secondary/50 truncate mt-0.5 font-sans">
                                "{notif.article.title}"
                              </p>
                            )}
                            <span className="text-[9px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 font-mono mt-1 block">
                              {new Date(notif.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dashboard link button */}
                  <div className="border-t border-border-light/20 pt-2.5 mt-2.5 font-sans">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/user-profile", { state: { openTab: "notifications" } });
                      }}
                      className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-accent hover:underline block cursor-pointer"
                    >
                      View All Logs &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex md:hidden items-center gap-4">
          {/* Theme Toggle for Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border-light dark:border-border-dark bg-card-light/40 dark:bg-card-dark/40 text-text-light-secondary dark:text-text-dark-secondary hover:text-accent hover:border-accent/40 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.4 12.4l1.58 1.58M3 12h2.25m13.5 0H21M6.08 18.08l1.58-1.58M18.08 6.08l1.58-1.58M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
              </svg>
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-light-primary dark:text-text-dark-primary hover:text-accent focus:outline-none cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER MENU */}
      <div 
        className={`fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-white/98 dark:bg-paper-dark/98 backdrop-blur-md z-40 transition-all duration-300 flex flex-col px-6 py-8 border-t border-border-light dark:border-border-dark md:hidden ${
          mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <ul className="flex flex-col gap-6 text-lg font-serif">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "text-accent font-bold" : "text-text-light-primary dark:text-text-dark-primary"
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSmoothScroll("#featured-blogs");
              }}
              className="text-left text-lg font-serif text-text-light-primary dark:text-text-dark-primary bg-transparent border-0 cursor-pointer"
            >
              Explore
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSmoothScroll("#categories");
              }}
              className="text-left text-lg font-serif text-text-light-primary dark:text-text-dark-primary bg-transparent border-0 cursor-pointer"
            >
              Categories
            </button>
          </li>
          <li>
            <NavLink
              to={getWritePath()}
              className={({ isActive }) =>
                isActive ? "text-accent font-bold" : "text-text-light-primary dark:text-text-dark-primary"
              }
            >
              Write
            </NavLink>
          </li>
          <li>
            <NavLink
              to={getProfilePath()}
              className={({ isActive }) =>
                isActive ? "text-accent font-bold" : "text-text-light-primary dark:text-text-dark-primary"
              }
            >
              {isAuthenticated ? "Profile" : "Sign In"}
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Header;