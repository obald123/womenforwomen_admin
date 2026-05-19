"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3, Image as ImageIcon } from "lucide-react";
import { apiFetch } from "../../../lib/apiClient";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onImageAdded?: (imageUrl: string, caption: string) => void;
  className?: string;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={
        "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-colors " +
        (active
          ? "border-[#00A991] bg-[#00A991]/10 text-[#007A71]"
          : "border-[#F2F2F2] bg-white text-[#0D2323] hover:bg-[#FAFAFA]") +
        (disabled ? " opacity-40 cursor-not-allowed" : "")
      }
    >
      {children}
    </button>
  );
}

async function uploadInlineImage(file: File) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await apiFetch<{ url: string }>("/api/uploads/article-inline-image", {
    method: "POST",
    body: fd,
  });
  return res.url;
}

export default function ArticleEditor({ value, onChange, onImageAdded, className }: Props) {
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] w-full outline-none leading-relaxed text-[14px] text-[#0D2323] " +
          "[&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:text-[20px] [&>h2]:font-black " +
          "[&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:text-[16px] [&>h3]:font-extrabold " +
          "[&>p]:my-3 [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-[#F2F2F2]",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const disabled = !editor;

  const handleInsertImage = async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadInlineImage(file);
        setPendingImageUrl(url);
        setCaption("");
        setShowCaptionModal(true);
      } catch {
        // errors are handled by callers via toast in the page; keep editor simple
      }
    };
    input.click();
  };

  function escapeHtml(str: string) {
    return str.replace(/[&<>"']/g, (s) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s]));
  }

  const handleCaptionSubmit = () => {
    if (pendingImageUrl) {
      const safeCaption = escapeHtml(caption || "");
      const figureHtml = `<figure class=\"article-inline-figure\"><img src=\"${pendingImageUrl}\" alt=\"${safeCaption || 'Image'}\" /><figcaption>${safeCaption}</figcaption></figure>`;
      editor?.chain().focus().insertContent(figureHtml).run();
      if (onImageAdded) {
        onImageAdded(pendingImageUrl, caption);
      }
    }
    setShowCaptionModal(false);
    setPendingImageUrl(null);
    setCaption("");
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2 border-2 border-[#F2F2F2] bg-white p-2">
        <ToolbarButton
          label="Heading 2"
          disabled={disabled}
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          disabled={disabled}
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
          H3
        </ToolbarButton>
        <div className="mx-1 h-7 w-px bg-[#F2F2F2]" />
        <ToolbarButton
          label="Bold"
          disabled={disabled}
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          disabled={disabled}
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          disabled={disabled}
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <div className="mx-1 h-7 w-px bg-[#F2F2F2]" />
        <ToolbarButton label="Insert image" disabled={disabled} onClick={handleInsertImage}>
          <ImageIcon size={16} />
          Image
        </ToolbarButton>
      </div>

      <div className="border-2 border-t-0 border-[#F2F2F2] bg-white px-4 py-3">
        <EditorContent editor={editor} />
      </div>

      {showCaptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest">Add Image Caption</h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter a caption or description for this image..."
              className="mb-4 w-full rounded border-2 border-[#F2F2F2] p-3 text-sm outline-none focus:border-[#0D2323]"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCaptionModal(false);
                  setPendingImageUrl(null);
                  setCaption("");
                }}
                className="px-4 py-2 text-xs font-bold uppercase text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCaptionSubmit}
                className="rounded bg-[#0D2323] px-6 py-2 text-xs font-bold uppercase text-white hover:bg-[#00A991]"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

