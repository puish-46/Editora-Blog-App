/**
 * Helper to strip HTML tags and extract a clean preview teaser for card display.
 * Prioritizes pre-generated AI preview text or editorial summaries.
 */
export const stripHtmlAndGetTeaser = (article, maxLength = 120) => {
  if (!article) return "";
  
  if (article.previewText && article.previewText.trim()) {
    return article.previewText;
  }
  
  if (article.aiSummary && article.aiSummary.trim()) {
    return article.aiSummary.length > maxLength
      ? `${article.aiSummary.slice(0, maxLength)}...`
      : article.aiSummary;
  }

  // Fallback: Strip HTML tags and slice raw content
  const rawText = article.content 
    ? article.content.replace(/<[^>]*>/g, "").trim()
    : "";
    
  return rawText.length > maxLength 
    ? `${rawText.slice(0, maxLength)}...` 
    : rawText;
};
