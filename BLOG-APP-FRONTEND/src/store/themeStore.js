import { create } from "zustand";

export const useTheme = create((set) => ({
  theme: localStorage.getItem("editora-theme") || "light",
  
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("editora-theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    return { theme: nextTheme };
  }),
  
  initTheme: () => {
    const currentTheme = localStorage.getItem("editora-theme") || "light";
    
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    set({ theme: currentTheme });
  }
}));
