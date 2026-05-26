/**
 * Calculate estimated reading time based on a standard 200 WPM rate.
 */
export const calculateReadTime = (content) => {
  if (!content) return "1 min read";
  
  // Strip HTML tags from RichText contents
  const text = content.replace(/<[^>]*>/g, "").trim();
  if (!text) return "1 min read";
  
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  
  return `${minutes} min read`;
};
