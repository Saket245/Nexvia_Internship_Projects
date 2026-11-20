"use client";

import React, { useEffect, useState } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  Code,
  Quote,
  AlertCircle,
  Minus,
  Type,
} from "@/components/icons";
import { BlockType } from "@/lib/types";

interface MenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: MenuItem[] = [
  {
    type: "paragraph",
    label: "Text",
    description: "Plain text paragraph",
    icon: <Type className="w-4 h-4 text-slate-500" />,
  },
  {
    type: "heading-1",
    label: "Heading 1",
    description: "Large section title",
    icon: <Heading1 className="w-4 h-4 text-indigo-500" />,
  },
  {
    type: "heading-2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="w-4 h-4 text-indigo-500" />,
  },
  {
    type: "heading-3",
    label: "Heading 3",
    description: "Small subsection heading",
    icon: <Heading3 className="w-4 h-4 text-indigo-500" />,
  },
  {
    type: "todo",
    label: "To-do List",
    description: "Track tasks with an interactive checkbox",
    icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
  },
  {
    type: "bullet",
    label: "Bulleted List",
    description: "Create a simple bulleted list",
    icon: <List className="w-4 h-4 text-blue-500" />,
  },
  {
    type: "number",
    label: "Numbered List",
    description: "Create a numbered list",
    icon: <ListOrdered className="w-4 h-4 text-blue-500" />,
  },
  {
    type: "code",
    label: "Code Block",
    description: "Capture code snippet with syntax styling",
    icon: <Code className="w-4 h-4 text-amber-500" />,
  },
  {
    type: "quote",
    label: "Quote",
    description: "Capture a standout quote",
    icon: <Quote className="w-4 h-4 text-purple-500" />,
  },
  {
    type: "callout",
    label: "Callout",
    description: "Emphasize tips, warnings, or notes",
    icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
  },
  {
    type: "divider",
    label: "Divider",
    description: "Visually divide blocks with a clean rule",
    icon: <Minus className="w-4 h-4 text-slate-400" />,
  },
];

interface SlashMenuProps {
  query: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ query, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = MENU_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute left-0 top-full mt-1 w-64 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Basic Blocks
      </div>
      {filtered.map((item, idx) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          onMouseEnter={() => setSelectedIndex(idx)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition ${
            idx === selectedIndex
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
              : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          }`}
        >
          <div className="p-1 rounded bg-slate-100 dark:bg-slate-700/60 shrink-0">
            {item.icon}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium truncate">{item.label}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {item.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};
