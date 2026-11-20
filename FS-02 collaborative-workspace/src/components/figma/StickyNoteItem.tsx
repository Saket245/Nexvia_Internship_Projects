"use client";

import React, { useState, useRef } from "react";
import { CanvasElement } from "@/lib/types";

interface StickyNoteItemProps {
  element: CanvasElement;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updated: CanvasElement) => void;
}

export const StickyNoteItem: React.FC<StickyNoteItemProps> = ({
  element,
  isSelected,
  readOnly = false,
  onSelect,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    onUpdate({
      ...element,
      text: e.target.value,
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`sticky-note absolute rounded-xl p-4 flex flex-col justify-between select-none transition-shadow ${
        readOnly ? "cursor-default" : "cursor-move"
      } ${isSelected ? "ring-2 ring-indigo-600 shadow-xl" : ""}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: element.color || "#fef08a",
      }}
    >
      <div className="flex-1 overflow-hidden">
        {isEditing && !readOnly ? (
          <textarea
            ref={textRef}
            autoFocus
            value={element.text || ""}
            onChange={handleTextChange}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 resize-none outline-none leading-relaxed"
            placeholder="Write note..."
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (readOnly) return;
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`w-full h-full text-xs sm:text-sm font-medium text-slate-900 whitespace-pre-wrap break-words leading-relaxed ${
              readOnly ? "cursor-default" : "cursor-text"
            }`}
          >
            {element.text || (!readOnly && <span className="text-slate-400 italic">Double-click to write note...</span>)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[10px] text-slate-600 font-medium select-none">
        <span className="opacity-75">{element.authorName || "Note"}</span>
        <span className="text-[9px] opacity-60">FigJam Style</span>
      </div>
    </div>
  );
};
