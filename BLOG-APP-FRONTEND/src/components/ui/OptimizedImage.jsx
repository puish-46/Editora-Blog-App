import React, { useState, useEffect } from "react";

/**
 * Reusable, high-performance OptimizedImage component.
 * Automatically injects Cloudinary transformations (f_auto, q_auto),
 * implements skeleton placeholders, handles errors, and loads lazily.
 */
function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  fallback = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState("");

  useEffect(() => {
    if (!src) {
      setOptimizedSrc(fallback);
      return;
    }

    // Process Cloudinary URL for performance optimizations (f_auto, q_auto)
    if (src.includes("res.cloudinary.com")) {
      // Find insertion point after '/upload' or '/v\d+'
      const uploadIdx = src.indexOf("/upload");
      if (uploadIdx !== -1) {
        const start = src.substring(0, uploadIdx + 8);
        const end = src.substring(uploadIdx + 8);
        // Inject format auto, quality auto, and optional width constraints
        const transformStr = width ? `f_auto,q_auto,w_${width}/` : "f_auto,q_auto/";
        setOptimizedSrc(`${start}${transformStr}${end}`);
      } else {
        setOptimizedSrc(src);
      }
    } else {
      setOptimizedSrc(src);
    }
  }, [src, fallback, width]);

  return (
    <div className={`relative overflow-hidden bg-border-light/20 dark:bg-border-dark/20 ${className}`}>
      {/* SKELETON PLACEHOLDER */}
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-card-light via-border-light/40 to-card-light dark:from-card-dark dark:via-border-dark/40 dark:to-card-dark" />
      )}

      {/* RENDERED IMAGE */}
      <img
        src={error ? fallback : optimizedSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          loaded ? "opacity-100 scale-100 filter-none" : "opacity-0 scale-95 filter blur-sm"
        }`}
        {...props}
      />
    </div>
  );
}

export default OptimizedImage;
