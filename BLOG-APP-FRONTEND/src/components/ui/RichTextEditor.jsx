import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "./Button";

function RichTextEditor({ value, onChange, placeholder = "Start writing your story here..." }) {
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent hover:text-accent-hover underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto my-6 rounded-2xl max-h-[450px] object-cover border border-border-light dark:border-border-dark",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "focus:outline-none prose-editorial font-serif text-base sm:text-lg min-h-[350px] p-6 text-text-light-primary dark:text-text-dark-primary",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Handle external value updates (e.g. for EditArticle prefill)
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    // cancelled
    if (url === null) return;

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      toast.error("Only JPG and PNG images are supported.");
      return;
    }

    // Validate size (2MB limit matching backend)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/author-api/upload-image`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      
      const imageUrl = res.data.url;
      editor.chain().focus().setImage({ src: imageUrl }).run();
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="w-full border border-border-light dark:border-border-dark rounded-2xl overflow-hidden bg-white dark:bg-card-dark focus-within:ring-2 focus-within:ring-accent/15 focus-within:border-accent transition-all duration-300">
      
      {/* TOOLBAR */}
      <div className="sticky top-0 z-20 flex flex-wrap gap-1 items-center px-4 py-2 border-b border-border-light dark:border-border-dark bg-paper-light dark:bg-paper-dark/95 backdrop-blur-sm">
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg text-sm font-bold tracking-tight cursor-pointer ${
            editor.isActive("heading", { level: 1 })
              ? "bg-accent/10 text-accent font-extrabold"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg text-sm font-bold tracking-tight cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent/10 text-accent font-extrabold"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <div className="w-[1px] h-4 bg-border-light dark:bg-border-dark mx-1"></div>

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("bold")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("italic")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("underline")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Underline"
        >
          <u>U</u>
        </button>

        <div className="w-[1px] h-4 bg-border-light dark:bg-border-dark mx-1"></div>

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.75 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Ordered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.247 6.75h12m-12 5.25h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3 13.5h.75v-3.75H3m1.5 5.25H3v.75h1.5v.75H3" />
          </svg>
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Blockquote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V6c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125V7.5Z" />
          </svg>
        </button>

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("codeBlock")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Code Block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
        </button>

        <div className="w-[1px] h-4 bg-border-light dark:bg-border-dark mx-1"></div>

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded-lg cursor-pointer ${
            editor.isActive("link")
              ? "bg-accent/10 text-accent"
              : "text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          }`}
          title="Insert Link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </button>

        {/* Image Upload Label Button */}
        <label
          className={`p-2 rounded-lg cursor-pointer flex items-center justify-center text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark ${
            imageUploading ? "animate-pulse text-accent" : ""
          }`}
          title="Upload & Embed Image"
        >
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleImageUpload}
            className="hidden"
            disabled={imageUploading}
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </label>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg cursor-pointer text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark"
          title="Horizontal Rule"
        >
          &mdash;
        </button>

        {/* Clear Formatting / Undo / Redo */}
        <div className="w-[1px] h-4 bg-border-light dark:bg-border-dark mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg cursor-pointer text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark active:scale-95 transition-transform"
          title="Undo"
        >
          &larr;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg cursor-pointer text-text-light-secondary dark:text-text-dark-secondary hover:bg-card-light dark:hover:bg-card-dark active:scale-95 transition-transform"
          title="Redo"
        >
          &rarr;
        </button>
      </div>

      {/* EDITABLE CONTENT BOX */}
      <div className="bg-card-light/25 dark:bg-card-dark/10 min-h-[350px] divide-y divide-border-light dark:divide-border-dark">
        <EditorContent editor={editor} />
      </div>

      {/* Tip / helper text */}
      <div className="px-6 py-2 border-t border-border-light dark:border-border-dark bg-paper-light dark:bg-paper-dark text-[10px] text-text-light-secondary/40 dark:text-text-dark-secondary/40 font-mono flex justify-between items-center select-none">
        <span>Press Tab to shift focus out of text editor.</span>
        <span>TipTap Rich Engine 2.0</span>
      </div>

    </div>
  );
}

export default RichTextEditor;
