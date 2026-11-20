"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckSquare,
  Square,
} from "@/components/icons";
import { Block, BlockType } from "@/lib/types";
import { SlashMenu } from "./SlashMenu";

interface BlockItemProps {
  block: Block;
  index: number;
  focusedCollaborator?: { name: string; color: string };
  readOnly?: boolean;
  onChange: (updated: Block) => void;
  onEnter: (currentBlockId: string) => void;
  onDelete: (currentBlockId: string) => void;
  onInsertBelow: (currentBlockId: string) => void;
  onFocus: () => void;
}

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  focusedCollaborator,
  readOnly = false,
  onChange,
  onEnter,
  onDelete,
  onInsertBelow,
  onFocus,
}) => {
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [block.text, block.type]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    if (slashQuery !== null) return;

    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      onEnter(block.id);
    } else if (e.key === "Backspace" && block.text === "") {
      e.preventDefault();
      onDelete(block.id);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const text = e.target.value;
    onChange({ ...block, text });

    if (text.startsWith("/")) {
      setSlashQuery(text.slice(1));
    } else {
      setSlashQuery(null);
    }
  };

  const handleSelectSlash = (type: BlockType) => {
    if (readOnly) return;
    onChange({
      ...block,
      type,
      text: "",
    });
    setSlashQuery(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(block.text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const renderContent = () => {
    switch (block.type) {
      case "heading-1":
        return (
          <textarea
            ref={inputRef}
            rows={1}
            readOnly={readOnly}
            value={block.text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={readOnly ? undefined : onFocus}
            placeholder={readOnly ? "" : "Heading 1"}
            className="w-full bg-transparent text-2xl md:text-3xl font-bold text-slate-900 dark:text-white resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-tight"
          />
        );

      case "heading-2":
        return (
          <textarea
            ref={inputRef}
            rows={1}
            readOnly={readOnly}
            value={block.text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={readOnly ? undefined : onFocus}
            placeholder={readOnly ? "" : "Heading 2"}
            className="w-full bg-transparent text-xl md:text-2xl font-semibold text-slate-900 dark:text-white resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-snug"
          />
        );

      case "heading-3":
        return (
          <textarea
            ref={inputRef}
            rows={1}
            readOnly={readOnly}
            value={block.text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={readOnly ? undefined : onFocus}
            placeholder={readOnly ? "" : "Heading 3"}
            className="w-full bg-transparent text-lg md:text-xl font-medium text-slate-900 dark:text-white resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-snug"
          />
        );

      case "todo":
        return (
          <div className="flex items-start gap-2.5 w-full">
            <button
              disabled={readOnly}
              onClick={() => !readOnly && onChange({ ...block, checked: !block.checked })}
              className="mt-1 text-slate-400 hover:text-indigo-600 transition shrink-0 disabled:cursor-default"
            >
              {block.checked ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "To-do task..."}
              className={`w-full bg-transparent text-sm resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed ${
                block.checked
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-800 dark:text-slate-200"
              }`}
            />
          </div>
        );

      case "bullet":
        return (
          <div className="flex items-start gap-2.5 w-full">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0" />
            <textarea
              ref={inputRef}
              rows={1}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "List item..."}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed"
            />
          </div>
        );

      case "number":
        return (
          <div className="flex items-start gap-2 w-full">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 select-none w-5 shrink-0">
              {index + 1}.
            </span>
            <textarea
              ref={inputRef}
              rows={1}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "Numbered item..."}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed"
            />
          </div>
        );

      case "code":
        return (
          <div className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-200 p-3 relative font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <span>{block.language || "typescript"}</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              ref={inputRef}
              rows={3}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "Write or paste code here..."}
              className="w-full bg-transparent text-xs font-mono text-emerald-400 resize-none outline-none leading-relaxed placeholder-slate-600"
            />
          </div>
        );

      case "quote":
        return (
          <div className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-1 italic w-full">
            <textarea
              ref={inputRef}
              rows={1}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "Empty quote..."}
              className="w-full bg-transparent text-sm text-slate-600 dark:text-slate-300 resize-none outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-relaxed"
            />
          </div>
        );

      case "callout":
        return (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full">
            <span className="text-lg select-none shrink-0">{block.icon || "💡"}</span>
            <textarea
              ref={inputRef}
              rows={1}
              readOnly={readOnly}
              value={block.text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={readOnly ? undefined : onFocus}
              placeholder={readOnly ? "" : "Callout notice..."}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 resize-none outline-none placeholder-slate-400 leading-relaxed"
            />
          </div>
        );

      case "divider":
        return (
          <div className="py-3 w-full cursor-pointer group/divider">
            <hr className="border-t border-slate-200 dark:border-slate-700 group-hover/divider:border-indigo-400 transition" />
          </div>
        );

      default:
        return (
          <textarea
            ref={inputRef}
            rows={1}
            readOnly={readOnly}
            value={block.text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={readOnly ? undefined : onFocus}
            placeholder={readOnly ? "" : "Type '/' for commands or start typing..."}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-200 resize-none outline-none placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
          />
        );
    }
  };

  return (
    <div
      className={`group relative flex items-start gap-1 py-1 px-2 rounded-lg transition ${
        focusedCollaborator
          ? "ring-1 shadow-xs"
          : readOnly
          ? ""
          : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
      }`}
      style={
        focusedCollaborator
          ? {
              borderLeft: `3px solid ${focusedCollaborator.color}`,
              backgroundColor: `${focusedCollaborator.color}08`,
            }
          : undefined
      }
    >
      {focusedCollaborator && (
        <div
          className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-xs z-10"
          style={{ backgroundColor: focusedCollaborator.color }}
        >
          {focusedCollaborator.name} is editing
        </div>
      )}

      {!readOnly && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1 pt-1 shrink-0 select-none transition">
          <button
            onClick={() => onInsertBelow(block.id)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            title="Add block below"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing transition"
            title="Drag block"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition"
            title="Delete block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        {renderContent()}

        {!readOnly && slashQuery !== null && (
          <SlashMenu
            query={slashQuery}
            onSelect={handleSelectSlash}
            onClose={() => setSlashQuery(null)}
          />
        )}
      </div>
    </div>
  );
};
