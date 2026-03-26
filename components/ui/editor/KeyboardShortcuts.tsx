import { useState } from "react";
import { KeyboardIcon, XIcon } from "@/components/icons/Icons";

interface Shortcut {
  keys: string[];
  action: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["Ctrl", "Z"], action: "Undo", category: "Basic" },
  { keys: ["Ctrl", "Y"], action: "Redo", category: "Basic" },
  {
    keys: ["Ctrl", "Shift", "Z"],
    action: "Redo (Alternative)",
    category: "Basic",
  },
  { keys: ["Ctrl", "C"], action: "Copy", category: "Basic" },
  { keys: ["Ctrl", "V"], action: "Paste", category: "Basic" },
  { keys: ["Ctrl", "A"], action: "Select All", category: "Basic" },
  { keys: ["Ctrl", "B"], action: "Bold", category: "Formatting" },
  { keys: ["Ctrl", "I"], action: "Italic", category: "Formatting" },
  { keys: ["Ctrl", "U"], action: "Underline", category: "Formatting" },
  {
    keys: ["Ctrl", "Shift", "S"],
    action: "Strikethrough",
    category: "Formatting",
  },
  { keys: ["Ctrl", "`"], action: "Code", category: "Formatting" },
  { keys: ["Ctrl", "Shift", "L"], action: "Align Left", category: "Layout" },
  { keys: ["Ctrl", "Shift", "E"], action: "Align Center", category: "Layout" },
  { keys: ["Ctrl", "Shift", "R"], action: "Align Right", category: "Layout" },
  { keys: ["Ctrl", "Shift", "8"], action: "Bullet List", category: "Layout" },
  { keys: ["Ctrl", "Shift", "7"], action: "Numbered List", category: "Layout" },
  { keys: ["Ctrl", "Shift", "."], action: "Blockquote", category: "Layout" },
  { keys: ["Ctrl", "K"], action: "Insert Link", category: "Insert" },
  { keys: ["Ctrl", "Shift", "I"], action: "Insert Image", category: "Insert" },
  { keys: ["Ctrl", "-"], action: "Horizontal Rule", category: "Insert" },
  { keys: ["Ctrl", "="], action: "Increase Font Size", category: "Typography" },
  { keys: ["Ctrl", "-"], action: "Decrease Font Size", category: "Typography" },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const categorized = shortcuts.reduce<Record<string, Shortcut[]>>(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) acc[shortcut.category] = [];
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {},
  );

  return (
    <div>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts"
        className="h-8 w-8 center border border-transparent rounded hover:bg-[#ffffff] group transition-colors flex items-center justify-center p-0 text-white hover:text-primary"
      >
        <KeyboardIcon className="size-5 text-current" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-5000 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0B1315] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-[#2a3033]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-[#2a3033]">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <KeyboardIcon className="size-5" /> Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Shortcuts */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto p-5 sideBar">
              {Object.entries(categorized).map(
                ([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-[#8B5CF6] dark:text-[#6C63FF] mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#8B5CF6] dark:bg-[#6C63FF] rounded-full"></div>
                      {category}
                    </h3>
                    <div className="space-y-2 ml-4">
                      {categoryShortcuts.map((shortcut, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.action}
                          </span>
                          <div className="flex gap-1.5">
                            {shortcut.keys.map((key, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs font-medium font-mono min-w-[24px] text-center border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md shadow-sm"
                              >
                                {key}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
