import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  formCard,
  formTitle,
  errorClass,
} from "../styles/common.js";
import Input from "./ui/Input";
import Button from "./ui/Button";
import RichTextEditor from "./ui/RichTextEditor";
import AIBlogSummaryCopilot from "./ui/AIBlogSummaryCopilot";

function EditArticle() {
  const { state: articleObj } = useLocation();
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...articleObj,
      tagsInput: articleObj.tags ? articleObj.tags.join(", ") : "",
      aiSummary: articleObj.aiSummary || "",
      previewText: articleObj.previewText || "",
      seoDescription: articleObj.seoDescription || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const onEditSubmit = async (modifiedArticleObj) => {
    // Add original article ID
    modifiedArticleObj.articleId = articleObj._id;

    // Parse edited tags comma-separated list into standard string array for MongoDB
    modifiedArticleObj.tags = modifiedArticleObj.tagsInput
      ? modifiedArticleObj.tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    delete modifiedArticleObj.tagsInput;
    
    try {
      setLoading(true);
      setApiError(null);
      let res = await axios.put(`${import.meta.env.VITE_API_URL}/author-api/article`, modifiedArticleObj, { withCredentials: true });
      if (res.status === 200) {
        toast.success("Article successfully updated!");
        navigate(`/article/${articleObj._id}`, { state: res.data.payload });
      }
    } catch (err) {
      console.log("err in edit article", err);
      setApiError(err.response?.data?.message || "Failed to update article");
      toast.error(err.response?.data?.message || "Failed to update article");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "technology", label: "Technology" },
    { value: "ai", label: "Artificial Intelligence" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "productivity", label: "Productivity" },
    { value: "lifestyle", label: "Lifestyle & Culture" },
  ];

  return (
    <div className="flex items-center justify-center py-6">
      <div className={`${formCard} max-w-4xl w-full`}>
        <h2 className={formTitle}>Edit Story</h2>

        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onEditSubmit)}>
          {/* CATEGORY */}
          <Input
            label="Category"
            type="select"
            placeholder="Select a category"
            error={errors.category?.message}
            options={categories}
            {...register("category", {
              required: "Category is required",
            })}
          />

          {/* TITLE */}
          <Input
            label="Title"
            type="text"
            placeholder="Enter a compelling title..."
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters",
              },
            })}
          />

          {/* TAGS INPUT */}
          <Input
            label="Tags (comma-separated)"
            type="text"
            placeholder="e.g. technology, design, writing, future"
            error={errors.tagsInput?.message}
            {...register("tagsInput")}
          />

          {/* CONTENT (TIPTAP RICH TEXT EDITOR) */}
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2.5 block">
              Story Content
            </label>
            <Controller
              name="content"
              control={control}
              rules={{
                required: "Content is required",
                minLength: {
                  value: 20,
                  message: "Content must be at least 20 characters",
                },
              }}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.content && (
              <p className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl px-4 py-2 text-xs font-medium mt-2">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* AI COPILOT SYSTEM */}
          <AIBlogSummaryCopilot
            content={watch("content")}
            setValue={setValue}
            register={register}
            errors={errors}
            watch={watch}
          />

          {/* SUBMIT BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              type="submit" 
              variant="primary" 
              loading={loading}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider"
            >
              Save Changes
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticle;