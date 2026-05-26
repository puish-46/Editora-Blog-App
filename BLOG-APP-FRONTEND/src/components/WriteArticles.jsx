import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../store/authStore";

import {
  formCard,
  formTitle,
  errorClass,
} from "../styles/common";
import Input from "./ui/Input";
import Button from "./ui/Button";
import RichTextEditor from "./ui/RichTextEditor";
import AIBlogSummaryCopilot from "./ui/AIBlogSummaryCopilot";

function WriteArticles() {
  const currentUser = useAuth((state) => state.currentUser);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "",
      title: "",
      content: "",
      aiSummary: "",
      previewText: "",
      seoDescription: "",
      tagsInput: "",
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const onWriteArticle = async (articleObj) => {
    if (!currentUser?._id) {
      toast.error("Author session not found. Please log in again.");
      return;
    }
    
    // Append author ID as required by MongoDB backend schema
    articleObj.author = currentUser._id;

    // Parse comma-separated tags input into standard MongoDB string array
    articleObj.tags = articleObj.tagsInput 
      ? articleObj.tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    delete articleObj.tagsInput;

    try {
      setLoading(true);
      setApiError(null);
      let res = await axios.post(`${import.meta.env.VITE_API_URL}/author-api/article`, articleObj, { withCredentials: true });
      if (res.status === 201) {
        toast.success("Article published successfully!");
        navigate("/author-profile/articles");
      }
    } catch (err) {
      console.log("err in write article", err);
      setApiError(err.response?.data?.message || "Failed to publish article");
      toast.error(err.response?.data?.message || "Failed to publish article");
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
        <h2 className={formTitle}>Publish New Story</h2>

        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onWriteArticle)}>
          {/* CATEGORY */}
          <Input
            label="Category"
            type="select"
            placeholder="Select a category for your story"
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

          {/* SUBMIT */}
          <Button 
            type="submit" 
            variant="primary" 
            loading={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider mt-4"
          >
            Publish Article
          </Button>
        </form>
      </div>
    </div>
  );
}

export default WriteArticles;