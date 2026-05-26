import { useEffect } from "react";

/**
 * Reusable SEO Component for managing page titles, meta descriptions, 
 * canonical URLs, Open Graph tags, and Twitter Cards dynamically.
 */
function SEO({ 
  title, 
  description = "Editora is a premium digital magazine and publication workspace for sharing thoughtful insights on Design, technology, and art.", 
  image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", 
  url = window.location.href, 
  type = "website" 
}) {
  
  useEffect(() => {
    // 1. Dynamic Page Titles
    const displayTitle = title ? `${title} | Editora Magazine` : "Editora — Premium Editorial Magazine";
    document.title = displayTitle;

    // Helper function to set or create meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeValue);
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    // Helper to set or create link tag
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (element) {
        element.setAttribute("href", href);
      } else {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        element.setAttribute("href", href);
        document.head.appendChild(element);
      }
    };

    // 2. Meta Description
    setMetaTag("name", "description", description);

    // 3. Open Graph Tags
    setMetaTag("property", "og:title", displayTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:image", image);
    setMetaTag("property", "og:url", url);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:site_name", "Editora");

    // 4. Twitter Cards Tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", displayTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", image);

    // 5. Canonical URLs
    setLinkTag("canonical", url);

  }, [title, description, image, url, type]);

  return null; // SEO renders side-effects inside head, no visible tree output
}

export default SEO;
