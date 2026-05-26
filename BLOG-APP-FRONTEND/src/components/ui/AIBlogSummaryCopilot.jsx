import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Card from "./Card";
import Button from "./Button";
import Input from "./Input";

function AIBlogSummaryCopilot({ content, setValue, register, errors, watch }) {
  const [generating, setGenerating] = useState(false);

  // Watch fields for live preview rendering
  const aiSummary = watch("aiSummary") || "";
  const previewText = watch("previewText") || "";
  const seoDescription = watch("seoDescription") || "";
  const tagsInput = watch("tagsInput") || "";

  const handleGenerateSummary = async () => {
    // Strip HTML tags to validate text length
    const plainText = content ? content.replace(/<[^>]*>/g, "").trim() : "";
    if (plainText.length < 20) {
      toast.error("Content is too short! Write at least 20 characters in the editor before generating AI tools.");
      return;
    }

    try {
      setGenerating(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/author-api/article/generate-summary`,
        { content: plainText },
        { withCredentials: true }
      );

      if (res.status === 200) {
        const { summary, previewText, tags, seoDescription } = res.data.payload;
        
        // Populate form states optimistically
        setValue("aiSummary", summary, { shouldValidate: true });
        setValue("previewText", previewText, { shouldValidate: true });
        setValue("tagsInput", tags.join(", "), { shouldValidate: true });
        setValue("seoDescription", seoDescription, { shouldValidate: true });
        
        toast.success("AI Editorial Metadata generated successfully!");
      }
    } catch (err) {
      console.error("AI Summary generation failed:", err);
      toast.error(err.response?.data?.message || "AI summary generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card hoverEffect={false} className="border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-6 rounded-3xl mb-6 relative overflow-hidden">
      {/* Decorative premium AI gradient badge */}
      <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-accent via-purple-500 to-indigo-500"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-light/30 dark:border-border-dark/30 pb-4 mb-5">
        <div>
          <h3 className="font-serif font-bold text-base text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
            <span>✨</span> Gemini AI Editorial Copilot
          </h3>
          <p className="text-[10px] text-text-light-secondary/60 dark:text-text-dark-secondary/60 mt-0.5">
            Automatically generate high-performance summaries, preview teasers, SEO metadata, and tags.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateSummary}
          loading={generating}
          className="border-accent/30 text-accent hover:bg-accent/5 px-4 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer whitespace-nowrap"
        >
          {generating ? "Generating..." : "Generate AI Metadata"}
        </Button>
      </div>

      {/* Generating pulse overlay */}
      {generating && (
        <div className="py-8 text-center animate-fade-in flex flex-col items-center justify-center space-y-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-xl bg-accent/20 animate-ping"></div>
            <div className="relative w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-serif text-lg font-bold">
              ✨
            </div>
          </div>
          <p className="text-xs font-bold text-accent animate-pulse uppercase tracking-wider font-serif">
            Summarizing dispatch using Gemini 2.5-Flash...
          </p>
        </div>
      )}

      {!generating && (
        <div className="space-y-4">
          {/* EDITABLE FIELDS PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Col: Summary & Teaser */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
                  AI Editorial Summary
                </label>
                <textarea
                  {...register("aiSummary")}
                  rows={3}
                  placeholder="Generate or write a concise 2-3 sentence editorial summary..."
                  className="w-full p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-xs focus:outline-none focus:border-accent transition-all duration-300 font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
                  Card Teaser Hook (Preview Text)
                </label>
                <textarea
                  {...register("previewText")}
                  rows={2}
                  maxLength={140}
                  placeholder="Generate or write a punchy single-sentence card preview (max 140 chars)..."
                  className="w-full p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-xs focus:outline-none focus:border-accent transition-all duration-300 font-sans"
                />
                <span className="text-[9px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 text-right block mt-1">
                  {previewText.length}/140 characters
                </span>
              </div>
            </div>

            {/* Right Col: SEO Description */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
                  SEO Meta Description
                </label>
                <textarea
                  {...register("seoDescription")}
                  rows={3}
                  maxLength={155}
                  placeholder="Generate or write a search-engine ready meta description..."
                  className="w-full p-3 rounded-xl bg-paper-light dark:bg-paper-dark border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary text-xs focus:outline-none focus:border-accent transition-all duration-300 font-sans"
                />
                <span className="text-[9px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 text-right block mt-1">
                  {seoDescription.length}/155 characters
                </span>
              </div>

              {/* Dynamic Tag Pills list */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
                  Generated Tags Preview
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-paper-light/50 dark:bg-paper-dark/50 border border-dashed border-border-light dark:border-border-dark min-h-[44px] items-center">
                  {tagsInput ? (
                    tagsInput.split(",").map((tag, idx) => {
                      const cleaned = tag.trim().toLowerCase();
                      if (!cleaned) return null;
                      return (
                        <span key={idx} className="text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          #{cleaned}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-text-light-secondary/30 dark:text-text-dark-secondary/30 px-2 italic">
                      No tags generated yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC LIVE MOCK PREVIEWS */}
          {(previewText || seoDescription) && (
            <div className="pt-4 border-t border-border-light/20 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Google Search Mock Preview */}
              {seoDescription && (
                <div className="bg-paper-light/30 dark:bg-paper-dark/30 border border-border-light/30 p-4 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-text-light-secondary/40 dark:text-text-dark-secondary/40 block mb-2 font-mono">
                    Google SERP Preview
                  </span>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate font-serif">
                    {watch("title") || "Untitled Dispatch"} | Editora Premium
                  </h4>
                  <p className="text-[10px] text-green-700 dark:text-green-500 truncate mt-0.5 font-sans">
                    https://editora.io/article/mock-dispatch-preview
                  </p>
                  <p className="text-[11px] text-text-light-secondary/80 dark:text-text-dark-secondary/80 mt-1 font-sans leading-relaxed">
                    {seoDescription.slice(0, 155)}
                  </p>
                </div>
              )}

              {/* Feed Card Mock Preview */}
              {previewText && (
                <div className="bg-paper-light/30 dark:bg-paper-dark/30 border border-border-light/30 p-4 rounded-2xl">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-text-light-secondary/40 dark:text-text-dark-secondary/40 block mb-2 font-mono">
                    Home Grid Teaser Preview
                  </span>
                  <div className="border border-border-light/40 dark:border-border-dark/40 bg-card-light dark:bg-card-dark p-3.5 rounded-xl shadow-xs">
                    <h4 className="text-xs font-serif font-black text-text-light-primary dark:text-text-dark-primary leading-snug">
                      {watch("title") || "Untitled Dispatch"}
                    </h4>
                    <p className="text-[10px] text-text-light-secondary/70 dark:text-text-dark-secondary/70 mt-1 line-clamp-2 leading-relaxed">
                      {previewText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default AIBlogSummaryCopilot;
