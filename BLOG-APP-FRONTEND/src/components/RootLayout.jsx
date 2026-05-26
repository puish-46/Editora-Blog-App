import Header from "./Header";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../store/authStore";
import { useTheme } from "../store/themeStore";
import { pageBackground } from "../styles/common";

function RootLayout() {
  const checkAuth = useAuth((state) => state.checkAuth);
  const initTheme = useTheme((state) => state.initTheme);

  const { pathname } = useLocation();

  useEffect(() => {
    // Initialize user authentication
    checkAuth();
    // Initialize light/dark mode theme
    initTheme();
  }, []);

  useEffect(() => {
    // Premium Scroll Restoration on route/page transition
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className={`${pageBackground} flex flex-col min-h-screen transition-editorial`}>
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default RootLayout;