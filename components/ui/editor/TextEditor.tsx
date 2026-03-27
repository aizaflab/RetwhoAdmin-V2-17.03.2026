"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";

import { Button } from "../button/Button";
import { cn } from "@/lib/utils";
import KeyboardShortcuts from "./KeyboardShortcuts";
import {
  Undo2Icon,
  Redo2Icon,
  FlexTextIcon,
  TypeIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  PaletteIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  ListIcon,
  ListOrderIcon,
  ImageIcon,
  LinkIcon,
  QuoteIcon,
  MinusIcon,
  CopyIcon,
  ClipboardIcon,
} from "@/components/icons/Icons";

/* =========================
   Resizable Image Extension
   ========================= */
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {},
      },
      alignment: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-alignment"),
        renderHTML: (attributes) =>
          attributes.alignment
            ? { "data-alignment": attributes.alignment }
            : {},
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement("div");
      container.className = "image-wrapper group my-4";
      container.setAttribute(
        "data-alignment",
        node.attrs.alignment || "center",
      );

      const imageContainer = document.createElement("div");
      imageContainer.className = "image-container relative";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.className = "block rounded-lg shadow-lg";
      img.style.width = node.attrs.width ? node.attrs.width + "px" : "100%";
      img.style.height = "auto";

      // helper path maker (simple placeholders)
      const getIconPath = (alignment: string) => {
        switch (alignment) {
          case "left":
            return "M4 12h16M4 6h10M4 18h10";
          case "center":
            return "M4 12h16M7 6h10M7 18h10";
          case "right":
            return "M4 12h16M10 6h10M10 18h10";
          default:
            return "M4 12h16";
        }
      };

      // Alignment controls
      const alignmentControls = document.createElement("div");
      alignmentControls.className =
        "absolute top-2 left-2 bg-darkPrimary/50 backdrop-blur rounded-lg shadow-lg p-1 group-hover:opacity-100 transition-opacity flex gap-1";

      ["left", "center", "right"].forEach((value) => {
        const btn = document.createElement("button");
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${getIconPath(
          value,
        )}"/></svg>`;
        btn.title = `Align ${value}`;
        btn.className = cn(
          "w-8 h-8 rounded hover:bg-[#6C63FF] flex items-center justify-center text-sm",
          node.attrs.alignment === value ? "bg-[#6C63FF]" : "",
        );
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof getPos === "function") {
            editor.commands.updateAttributes("image", { alignment: value });
            container.setAttribute("data-alignment", value);
          }
        };
        alignmentControls.appendChild(btn);
      });

      // Resize handle
      const resizeHandle = document.createElement("div");
      resizeHandle.className =
        "absolute bottom-2 right-2 w-4 h-4 bg-[#6C63FF] cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-sm";

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" ` +
        `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
        `stroke-linecap="round" stroke-linejoin="round"><path d="m18 6-12 12"/>` +
        `<path d="m6 6 12 12"/></svg>`;
      deleteBtn.className =
        "absolute top-8 right-0 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center";
      deleteBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof getPos === "function") {
          const pos = getPos();
          if (typeof pos === "number") {
            editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });
          }
        }
      };

      // Resize logic
      let isResizing = false;
      let startWidth = 0;
      let startX = 0;

      const handleResize = (e: { clientX: number }) => {
        if (!isResizing) return;
        const deltaX = e.clientX - startX;
        let newWidth = startWidth + deltaX;
        const containerWidth = container.offsetWidth;
        newWidth = Math.max(200, Math.min(containerWidth, newWidth));
        img.style.width = newWidth + "px";
      };

      const stopResize = () => {
        if (!isResizing) return;
        isResizing = false;
        if (typeof getPos === "function") {
          editor.commands.updateAttributes("image", { width: img.offsetWidth });
        }
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
      };

      resizeHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isResizing = true;
        startWidth = img.offsetWidth;
        startX = e.clientX;
        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResize);
      });

      imageContainer.appendChild(img);
      imageContainer.appendChild(alignmentControls);
      imageContainer.appendChild(resizeHandle);
      imageContainer.appendChild(deleteBtn);
      container.appendChild(imageContainer);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.attrs.src !== node.attrs.src)
            img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.alignment !== node.attrs.alignment) {
            container.setAttribute(
              "data-alignment",
              updatedNode.attrs.alignment,
            );
          }
          if (
            updatedNode.attrs.width !== node.attrs.width &&
            updatedNode.attrs.width
          ) {
            img.style.width = updatedNode.attrs.width + "px";
          }
          return true;
        },
      };
    };
  },
});

/* =========================
   Enhanced TextStyle (font)
   ========================= */
const EnhancedTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize.replace(/['"]+/g, ""),
        renderHTML: (attrs) =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
      fontFamily: {
        default: null,
        parseHTML: (el) => el.style.fontFamily.replace(/['"]+/g, ""),
        renderHTML: (attrs) =>
          attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
      setFontFamily:
        (fontFamily) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontFamily }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontFamily: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

/* =========================
   TextEditor Component
   ========================= */

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function TextEditor({
  value = "",
  onChange,
  placeholder,
}: TextEditorProps) {
  // Mount guard to avoid SSR/hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);
  const [isFontFamilyMenuOpen, setIsFontFamilyMenuOpen] = useState(false);
  const [activeFontSize, setActiveFontSize] = useState("16px");
  const [activeFontFamily, setActiveFontFamily] = useState("Inter");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isCodeView, setIsCodeView] = useState(false);
  const [characterCount, setCharacterCount] = useState({
    characters: 0,
    words: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);
  const fontFamilyMenuRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6600",
    "#FFCC00",
    "#00FF00",
    "#0066FF",
    "#6600FF",
    "#FF00FF",
    "#00FFFF",
    "#262689",
    "#6B46C1",
    "#EC4899",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#F97316",
    "#06B6D4",
  ];

  const fontSizes = [
    { value: "12px", label: "12px" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px" },
    { value: "28px", label: "28px" },
    { value: "32px", label: "32px" },
    { value: "36px", label: "36px" },
    { value: "48px", label: "48px" },
    { value: "64px", label: "64px" },
    { value: "72px", label: "72px" },
  ];

  const fontFamilies = [
    {
      value: "Inter, system-ui, sans-serif",
      label: "Inter",
      preview: "The quick brown fox",
    },
    {
      value: "Poppins, system-ui, sans-serif",
      label: "Poppins",
      preview: "The quick brown fox",
    },
    {
      value: "Roboto, system-ui, sans-serif",
      label: "Roboto",
      preview: "The quick brown fox",
    },
    {
      value: "Open Sans, system-ui, sans-serif",
      label: "Open Sans",
      preview: "The quick brown fox",
    },
    {
      value: "Lato, system-ui, sans-serif",
      label: "Lato",
      preview: "The quick brown fox",
    },
  ];

  const updateCharacterCount = useCallback((ed: Editor | null) => {
    if (ed && ed.storage.characterCount) {
      setCharacterCount({
        characters: ed.storage.characterCount.characters(),
        words: ed.storage.characterCount.words(),
      });
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        },
      }),
      ResizableImage.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Placeholder.configure({
        placeholder: () => placeholder || "",
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      EnhancedTextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      CharacterCount.configure({ limit: null }),
    ],
    // 👇 prevents TipTap from rendering on the server
    immediatelyRender: false,
    // Don't pass `content` here; we set it in onCreate after mount
    editable: true,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
      },
    },
    onCreate: ({ editor }) => {
      // set initial content on client
      editor.commands.setContent(value || "");
      setTimeout(() => {
        editor.commands.focus();
        updateCharacterCount(editor);
      }, 0);
    },
    onSelectionUpdate: ({ editor }) => {
      const attrs = editor.getAttributes("textStyle");
      setActiveFontSize(attrs.fontSize ? attrs.fontSize : "16px");
      setActiveFontFamily(
        attrs.fontFamily
          ? attrs.fontFamily.split(",")[0].replace(/['"]/g, "")
          : "Inter",
      );
      setCanUndo(editor.can().undo());
      setCanRedo(editor.can().redo());
      updateCharacterCount(editor);
      onChange?.(editor.getHTML());
    },
    onUpdate: ({ editor }) => {
      setCanUndo(editor.can().undo());
      setCanRedo(editor.can().redo());
      updateCharacterCount(editor);
      onChange?.(editor.getHTML());
    },
  });

  // Keep editor synced if `value` prop changes after mount
  useEffect(() => {
    if (!editor) return;
    if (!isCodeView) {
      const current = editor.getHTML();
      if (value != null && value !== current) {
        editor.commands.setContent(value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorMenuRef.current &&
        !colorMenuRef.current.contains(event.target as Node)
      )
        setIsColorMenuOpen(false);
      if (
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(event.target as Node)
      )
        setIsFontSizeMenuOpen(false);
      if (
        fontFamilyMenuRef.current &&
        !fontFamilyMenuRef.current.contains(event.target as Node)
      )
        setIsFontFamilyMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Image upload
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            editor?.chain().focus().setImage({ src: reader.result }).run();
          }
        };
        reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [editor],
  );

  // Link helpers
  const handleLinkInsert = useCallback(() => {
    if (linkUrl && editor) {
      const url = linkUrl.match(/^https?:\/\//)
        ? linkUrl
        : `https://${linkUrl}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setLinkUrl("");
      setIsLinkMenuOpen(false);
    }
  }, [linkUrl, editor]);

  const handleLinkRemove = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setIsLinkMenuOpen(false);
  }, [editor]);

  const openLinkMenu = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    setSelectedText(text);
    const linkMark = editor.getAttributes("link");
    setLinkUrl(linkMark.href || "");
    setIsLinkMenuOpen(true);
  }, [editor]);

  // Color & highlight
  const applyColor = useCallback(
    (color: string) => editor?.chain().focus().setColor(color).run(),
    [editor],
  );
  const applyHighlight = useCallback(
    (color: string) => editor?.chain().focus().toggleHighlight({ color }).run(),
    [editor],
  );

  // Font controls
  const applyFontSize = useCallback(
    (size: string) => {
      editor?.chain().focus().setFontSize(size).run();
      setActiveFontSize(size);
      setIsFontSizeMenuOpen(false);
    },
    [editor],
  );

  const applyFontFamily = useCallback(
    (fontFamily: string, label: string) => {
      editor?.chain().focus().setFontFamily(fontFamily).run();
      setActiveFontFamily(label);
      setIsFontFamilyMenuOpen(false);
    },
    [editor],
  );

  // Copy/Paste
  const copyText = useCallback(async () => {
    if (!editor) return;
    try {
      await navigator.clipboard.writeText(editor.getText());
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = editor.getText();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [editor]);

  const pasteText = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && editor) editor.chain().focus().insertContent(text).run();
    } catch {}
  }, [editor]);

  const toggleCodeView = useCallback(() => setIsCodeView((s) => !s), []);

  // Toolbar button primitive
  const ToolbarButton = ({
    icon: IconNode,
    onClick,
    active,
    disabled: buttonDisabled,
    title,
    children,
  }: {
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children?: React.ReactNode;
  }) => (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={buttonDisabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-200 dark:text-white",
        active
          ? "bg-gray-100 text-primary hover:bg-gray-200 dark:bg-darkBorder dark:text-white"
          : "hover:bg-gray-100 hover:text-primary dark:hover:bg-darkBorder dark:hover:text-white",
      )}
    >
      {IconNode}
      {children}
    </Button>
  );

  // Avoid SSR/hydration issues: render nothing until mounted & editor ready
  if (!mounted || !editor) return null;

  return (
    <div className="w-full mx-auto bg-white dark:bg-darkBg rounded-md border border-gray-200 dark:border-darkBorder overflow-hidden text-editor">
      {/* Toolbar */}
      <div className="z-40 flex flex-wrap items-center gap-1 p-3 bg-white dark:bg-darkPrimary border-b border-gray-200 dark:border-darkBorder text-gray-700 dark:text-gray-200">
        {/* Undo / Redo */}
        <ToolbarButton
          icon={<Undo2Icon className="size-5" />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo2Icon className="size-5" />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        />
        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Font Family */}
        <div className="relative" ref={fontFamilyMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFontFamilyMenuOpen((v) => !v)}
            className={cn(
              "h-8 px-2 text-sm min-w-[90px] hover:text-primary dark:text-white dark:hover:text-primary",
              isFontFamilyMenuOpen &&
                "bg-gray-100 text-primary dark:bg-darkBorder",
            )}
            title="Font Family"
          >
            <FlexTextIcon className="h-4 w-4 mr-1" />
            {activeFontFamily}
          </Button>
          {isFontFamilyMenuOpen && (
            <div className="absolute top-12 left-0 z-50 bg-white dark:bg-darkPrimary rounded-lg shadow-lg border sideBar border-border dark:border-darkBorder p-2 min-w-[200px] max-h-60 overflow-y-auto space-y-1">
              {fontFamilies.map((font) => (
                <button
                  key={font.value}
                  className={cn(
                    "w-full text-left px-3 py-2 mb-1 rounded text-sm hover:bg-primary hover:text-white flex flex-col gap-1 text-black dark:text-text5 dark:hover:bg-darkBorder",
                    activeFontFamily === font.label &&
                      "bg-primary text-white dark:bg-hover dark:bg-darkBorder dark:text-white",
                  )}
                  onClick={() => applyFontFamily(font.value, font.label)}
                  style={{ fontFamily: font.value }}
                >
                  <span className="font-medium ">{font.label}</span>
                  <span className="text-xs opacity-85 ">{font.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div className="relative" ref={fontSizeMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFontSizeMenuOpen((v) => !v)}
            className={cn(
              "h-8 px-2 text-sm min-w-[70px] hover:text-primary dark:text-white dark:hover:text-primary",
              isFontSizeMenuOpen &&
                "bg-gray-100 text-primary dark:bg-darkBorder",
            )}
            title="Font Size"
          >
            <TypeIcon className="h-4 w-4 mr-1" />
            {activeFontSize}
          </Button>
          {isFontSizeMenuOpen && (
            <div className="absolute top-12 left-0 z-50 bg-white dark:bg-darkPrimary rounded-lg shadow-lg border border-border dark:border-darkBorder sideBar p-2 min-w-[120px] max-h-60 overflow-y-auto text-black dark:text-white space-y-1">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded text-sm hover:bg-primary hover:text-white dark:hover:bg-darkBorder dark:text-text5",
                    activeFontSize === size.value &&
                      "bg-primary text-white dark:bg-darkBorder",
                  )}
                  onClick={() => applyFontSize(size.value)}
                  style={{ fontSize: size.value }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Inline formatting */}
        <ToolbarButton
          icon={<BoldIcon className="size-[18px]" />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={<ItalicIcon className="size-[18px]" />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={<UnderlineIcon className="size-[18px]" />}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={<StrikethroughIcon className="size-[18px]" />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        />
        <ToolbarButton
          icon={<CodeIcon className="size-5" />}
          onClick={toggleCodeView}
          active={editor.isActive("code")}
          title="Code"
        />

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Colors */}
        <div className="relative" ref={colorMenuRef}>
          <ToolbarButton
            icon={<PaletteIcon className="size-5" />}
            onClick={() => setIsColorMenuOpen((v) => !v)}
            title="Text Color"
          />
          {isColorMenuOpen && (
            <div className="absolute top-12 left-0 z-50 bg-white dark:bg-darkPrimary rounded-lg shadow-lg border border-border dark:border-darkBorder p-3 w-64">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-text5">
                    Text Color
                  </p>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-darkLight"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {colors.map((color) => (
                    <button
                      key={`text-${color}`}
                      className={cn(
                        "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                        editor.isActive("textStyle", { color })
                          ? "border-[#6C63FF]"
                          : "border-[#132226]",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        applyColor(color);
                        setIsColorMenuOpen(false);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-text5">
                    Highlight
                  </p>
                  <button
                    className="text-xs text-blue-500 hover:text-blue-700 dark:text-darkLight"
                    onClick={() =>
                      editor.chain().focus().unsetHighlight().run()
                    }
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {colors.slice(0, 12).map((color) => (
                    <button
                      key={`highlight-${color}`}
                      className={cn(
                        "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                        editor.isActive("highlight", { color })
                          ? "border-[#6C63FF]"
                          : "border-gray-300",
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        applyHighlight(color);
                        setIsColorMenuOpen(false);
                      }}
                      title={`Highlight ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Alignment */}
        <ToolbarButton
          icon={<AlignLeftIcon className="size-5" />}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        />
        <ToolbarButton
          icon={<AlignCenterIcon className="size-5" />}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        />
        <ToolbarButton
          icon={<AlignRightIcon className="size-5" />}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        />

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Lists */}
        <ToolbarButton
          icon={<ListIcon className="size-5" />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={<ListOrderIcon className="size-5" />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        />

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Insert Image */}
        <ToolbarButton
          icon={<ImageIcon className="size-5" />}
          onClick={() => fileInputRef.current?.click()}
          title="Insert Image (Full Width, Resizable)"
        />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            icon={<LinkIcon className="size-5" />}
            onClick={openLinkMenu}
            active={editor.isActive("link") || isLinkMenuOpen}
            title="Insert Link"
          />
          {isLinkMenuOpen && (
            <div className="absolute top-10 right-0 z-50 bg-white dark:bg-darkPrimary rounded-lg shadow-lg border border-border dark:border-darkBorder p-3 w-72 text-black dark:text-white">
              <div className="flex flex-col gap-2">
                {selectedText && (
                  <div className="text-xs text-gray-500 dark:text-text5 bg-gray-50 dark:bg-darkBg p-2 rounded">
                    Selected:{" "}
                    <span className="font-medium">{selectedText}</span>
                  </div>
                )}
                <label className="text-xs font-medium text-gray-600 dark:text-text5">
                  URL
                </label>
                <div className="flex">
                  <input
                    ref={linkInputRef}
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-2 py-1.5 text-sm border bg-transparent border-primary dark:border-darkBorder rounded-l focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && handleLinkInsert()}
                  />
                  <button
                    onClick={handleLinkInsert}
                    disabled={!linkUrl}
                    className="px-3 py-1.5 bg-primary border border-primary text-white rounded-r hover:bg-[#2d5058] disabled:opacity-50 cursor-pointer"
                  >
                    ✓
                  </button>
                </div>
                <div className="flex justify-between mt-2">
                  {editor.isActive("link") && (
                    <button
                      onClick={handleLinkRemove}
                      className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      Remove Link
                    </button>
                  )}
                  <button
                    onClick={() => setIsLinkMenuOpen(false)}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-darkBorder text-gray-600 dark:text-text5 rounded hover:bg-gray-200 dark:hover:bg-darkBorder/80 ml-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ToolbarButton
          icon={<QuoteIcon className="size-5" />}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        />
        <ToolbarButton
          icon={<MinusIcon className="size-5" />}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        />

        <div className="h-6 mx-1 w-px bg-[#edefff] dark:bg-darkBorder" />

        {/* Copy / Paste */}
        <ToolbarButton
          icon={<CopyIcon className="size-5" />}
          onClick={copyText}
          title="Copy (Ctrl+C)"
        />
        <ToolbarButton
          icon={<ClipboardIcon className="size-5" />}
          onClick={pasteText}
          title="Paste (Ctrl+V)"
        />

        <div className="h-6 mx-1 w-px bg-[#edefff]" />

        {/* Help */}
        <KeyboardShortcuts />
      </div>

      {/* Editor Content */}
      <div
        className="relative cursor-text max-h-[70vh] overflow-auto sideBar"
        onClick={() => {
          if (editor && !isCodeView) editor.commands.focus();
        }}
      >
        {isCodeView ? (
          <div className="min-h-[500px] p-5 py-[1.50rem]">
            <pre>
              <code>{editor.getHTML()}</code>
            </pre>
          </div>
        ) : (
          <EditorContent
            editor={editor}
            className="min-h-[500px] px-1 focus-within:outline-none"
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 bg-[#f8fafc] dark:bg-darkPrimary border-t border-border dark:border-darkBorder text-sm text-gray-600 dark:text-text5">
        <div className="flex items-center gap-4">
          <span>Words: {characterCount.words}</span>
          <span>Characters: {characterCount.characters}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}
