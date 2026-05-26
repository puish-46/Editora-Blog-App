// src/styles/common.js
// Theme: Premium Editorial Magazine "Editora"
// Designed with sophisticated typography, soft spacing, elegant borders, and responsive dark mode compatibility

// ─── Layout ───────────────────────────────────────────
export const pageBackground = 
  "bg-paper-light dark:bg-paper-dark text-text-light-primary dark:text-text-dark-primary min-h-screen transition-colors duration-300 ease-out selection:bg-accent/20 selection:text-accent-hover";
export const pageWrapper = 
  "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 transition-all duration-300";
export const section = 
  "mb-16";

// ─── Cards ────────────────────────────────────────────
export const cardClass =
  "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-7 hover:border-accent/40 dark:hover:border-accent/40 shadow-editorial hover:shadow-editorial-hover hover:scale-[1.01] transition-all duration-300 cursor-pointer";

// ─── Typography ───────────────────────────────────────
export const pageTitleClass = 
  "font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-text-light-primary dark:text-text-dark-primary tracking-tight leading-tight mb-4";
export const headingClass = 
  "font-serif text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary tracking-tight leading-snug";
export const subHeadingClass = 
  "font-sans text-lg sm:text-xl font-semibold text-text-light-primary dark:text-text-dark-primary tracking-tight";
export const bodyText = 
  "font-sans text-text-light-secondary dark:text-text-dark-secondary leading-relaxed";
export const mutedText = 
  "font-sans text-sm text-text-light-secondary/70 dark:text-text-dark-secondary/70";
export const linkClass = 
  "text-accent hover:text-accent-hover transition-colors font-medium underline decoration-accent/25 hover:decoration-accent/70 underline-offset-4 cursor-pointer";

// ─── Buttons ──────────────────────────────────────────
export const primaryBtn =
  "bg-accent hover:bg-accent-hover text-white dark:text-paper-dark font-semibold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer text-sm tracking-tight";
export const secondaryBtn =
  "border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary font-medium px-6 py-2.5 rounded-full hover:bg-card-light dark:hover:bg-card-dark active:scale-95 transition-all duration-200 cursor-pointer text-sm";
export const ghostBtn = 
  "text-accent hover:text-accent-hover font-semibold transition-colors duration-200 cursor-pointer text-sm flex items-center gap-1.5";

// ─── Forms ────────────────────────────────────────────
export const formCard = 
  "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-3xl p-8 sm:p-12 max-w-xl mx-auto shadow-editorial transition-all duration-300";
export const formTitle = 
  "font-serif text-3xl font-bold text-text-light-primary dark:text-text-dark-primary tracking-tight text-center mb-8";
export const labelClass = 
  "text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block";
export const inputClass =
  "w-full bg-white dark:bg-paper-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-light-primary dark:text-text-dark-primary text-sm placeholder:text-text-light-secondary/40 dark:placeholder:text-text-dark-secondary/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-300";
export const formGroup = 
  "mb-5";
export const submitBtn =
  "w-full bg-accent hover:bg-accent-hover text-white dark:text-paper-dark font-semibold py-3 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer mt-4 text-sm tracking-tight";

// ─── Navbar ───────────────────────────────────────────
export const navbarClass =
  "bg-paper-light/80 dark:bg-paper-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-6 sm:px-8 h-[64px] flex items-center sticky top-0 z-50 transition-all duration-300";
export const navContainerClass = 
  "max-w-6xl mx-auto w-full flex items-center justify-between";
export const navBrandClass = 
  "font-serif text-xl sm:text-2xl font-bold text-text-light-primary dark:text-text-dark-primary tracking-tight hover:text-accent dark:hover:text-accent transition-colors duration-200";
export const navLinksClass = 
  "flex items-center gap-6 sm:gap-8";
export const navLinkClass = 
  "text-[0.85rem] font-medium tracking-wide text-text-light-secondary dark:text-text-dark-secondary hover:text-accent dark:hover:text-accent transition-colors duration-200";
export const navLinkActiveClass = 
  "text-[0.85rem] font-semibold tracking-wide text-accent border-b-2 border-accent pb-0.5";

// ─── Article / Blog ───────────────────────────────────
export const articleGrid = 
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10";
export const articleCardClass =
  "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-6 hover:border-accent/40 rounded-2xl hover:shadow-editorial transition-all duration-300 flex flex-col gap-3 cursor-pointer";
export const articleTitle = 
  "font-serif text-lg sm:text-xl font-bold text-text-light-primary dark:text-text-dark-primary leading-snug tracking-tight group-hover:text-accent transition-colors duration-200";
export const articleExcerpt = 
  "font-sans text-sm text-text-light-secondary dark:text-text-dark-secondary leading-relaxed";
export const articleMeta = 
  "font-sans text-xs tracking-wider uppercase font-semibold text-accent";
export const articleBody = 
  "font-serif text-text-light-secondary dark:text-text-dark-secondary leading-[1.85] text-[0.98rem] max-w-2xl transition-colors duration-300";
export const timestampClass = 
  "font-sans text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60 flex items-center gap-1.5";
export const tagClass = 
  "text-[0.65rem] font-semibold text-accent uppercase tracking-widest w-fit border border-accent/20 px-2 py-0.5 rounded";

// ─── Article Page ─────────────────────────────────────
export const articlePageWrapper = 
  "max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 transition-all duration-300";
export const articleHeader = 
  "mb-8 md:mb-12 flex flex-col gap-4 border-b border-border-light dark:border-border-dark pb-6 md:pb-8";
export const articleCategory = 
  "text-[0.75rem] font-bold uppercase tracking-widest text-accent";
export const articleMainTitle = 
  "font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-text-light-primary dark:text-text-dark-primary leading-tight tracking-tight";
export const articleAuthorRow =
  "flex items-center justify-between py-2 text-sm text-text-light-secondary/80 dark:text-text-dark-secondary/80";
export const authorInfo = 
  "flex items-center gap-2 font-semibold text-text-light-primary dark:text-text-dark-primary";
export const articleContent = 
  "font-serif text-text-light-primary dark:text-text-dark-primary leading-[1.85] text-[1.05rem] whitespace-pre-line mt-6 md:mt-8 transition-colors duration-300";
export const articleFooter = 
  "border-t border-border-light dark:border-border-dark mt-12 pt-6 text-xs text-text-light-secondary/60 dark:text-text-dark-secondary/60";

// ─── Article Actions ─────────────────────────────
export const articleActions = 
  "flex gap-3 mt-8";
export const editBtn = 
  "bg-accent hover:bg-accent-hover text-white dark:text-paper-dark text-sm font-semibold px-5 py-2 rounded-full transition shadow-sm active:scale-95 cursor-pointer";
export const deleteBtn = 
  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-semibold px-5 py-2 rounded-full hover:bg-red-500 hover:text-white transition shadow-sm active:scale-95 cursor-pointer";

// ─── Article Status Badge ─────────────────────────
export const articleStatusActive =
  "absolute top-4 right-4 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
export const articleStatusDeleted =
  "absolute top-4 right-4 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400";

// ─── Feedback ─────────────────────────────────────────
export const errorClass =
  "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl px-4 py-3.5 text-sm font-medium my-4";
export const successClass =
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-3.5 text-sm font-medium my-4";
export const loadingClass = 
  "text-accent/70 text-sm font-medium animate-pulse text-center py-12";
export const emptyStateClass = 
  "text-center text-text-light-secondary/60 dark:text-text-dark-secondary/60 py-20 text-sm border border-dashed border-border-light dark:border-border-dark rounded-3xl";

// ─── Comments ───────────────────────────────────────
export const commentsWrapper = 
  "mt-16 border-t border-border-light dark:border-border-dark pt-10 flex flex-col gap-6";
export const commentCard = 
  "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-6 transition-all duration-300 hover:border-accent/30";
export const commentHeader = 
  "flex items-center justify-between mb-3";
export const commentUser = 
  "text-sm font-bold text-text-light-primary dark:text-text-dark-primary";
export const commentTime = 
  "text-xs text-text-light-secondary/50 dark:text-text-dark-secondary/50";
export const commentText = 
  "text-text-light-secondary dark:text-text-dark-secondary text-sm leading-relaxed font-sans";
export const avatar =
  "w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold border border-accent/25";
export const commentUserRow = 
  "flex items-center gap-3";

// ─── Divider ──────────────────────────────────────────
export const divider = 
  "border-t border-border-light dark:border-border-dark my-10";

// ─── Tables ───────────────────────────────────────────
export const tableContainer =
  "w-full overflow-x-auto rounded-2xl bg-card-light/35 dark:bg-card-dark/35";
export const tableHeaderClass =
  "bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark";
export const tableRowClass =
  "border-b border-border-light/50 dark:border-border-dark/50 hover:bg-card-light/40 dark:hover:bg-card-dark/40 transition-colors";
export const tableCellClass =
  "px-6 py-4 text-sm font-medium text-text-light-primary dark:text-text-dark-primary";