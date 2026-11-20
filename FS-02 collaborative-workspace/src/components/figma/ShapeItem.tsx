"use client";

import React, { useState } from "react";
import { CanvasElement } from "@/lib/types";

interface ShapeItemProps {
  element: CanvasElement;
  isSelected: boolean;
  readOnly?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updated: CanvasElement) => void;
}

export const ShapeItem: React.FC<ShapeItemProps> = ({
  element,
  isSelected,
  readOnly = false,
  onSelect,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (element.type === "drawing" && element.points && element.points.length > 0) {
    const minX = Math.min(...element.points.map((p) => p.x));
    const minY = Math.min(...element.points.map((p) => p.y));
    const pathD = element.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x - minX} ${p.y - minY}`)
      .join(" ");

    return (
      <svg
        onClick={onSelect}
        className={`absolute cursor-pointer ${isSelected ? "filter drop-shadow-md" : ""}`}
        style={{
          left: `${minX}px`,
          top: `${minY}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          overflow: "visible",
        }}
      >
        <path
          d={pathD}
          fill="none"
          stroke={element.color || "#4f46e5"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (element.type === "arrow") {
    return (
      <div
        onClick={onSelect}
        className={`absolute flex items-center justify-center select-none ${
          readOnly ? "cursor-default" : "cursor-move"
        } ${isSelected ? "ring-2 ring-indigo-500 rounded-lg" : ""}`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
        }}
      >
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
          <line
            x1="0"
            y1="10"
            x2="88"
            y2="10"
            stroke={element.color || "#6366f1"}
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <polygon
            points="88,4 100,10 88,16"
            fill={element.color || "#6366f1"}
          />
        </svg>
        {element.text && (
          <span className="absolute -top-4 text-[10px] font-semibold text-slate-500 whitespace-nowrap bg-white/80 dark:bg-slate-800/80 px-1 rounded">
            {element.text}
          </span>
        )}
      </div>
    );
  }

  if (element.type === "circle") {
    return (
      <div
        onClick={onSelect}
        className={`absolute rounded-full flex items-center justify-center p-3 text-center select-none transition-shadow shadow-md ${
          readOnly ? "cursor-default" : "cursor-move"
        } ${isSelected ? "ring-2 ring-indigo-600 shadow-xl" : ""}`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor: element.color || "#fbcfe8",
          border: `2px solid ${element.borderColor || "#db2777"}`,
        }}
      >
        {isEditing && !readOnly ? (
          <textarea
            autoFocus
            value={element.text || ""}
            onChange={(e) => onUpdate({ ...element, text: e.target.value })}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full bg-transparent text-center text-xs font-semibold text-slate-900 resize-none outline-none leading-tight"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (readOnly) return;
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`text-xs font-semibold text-slate-900 whitespace-pre-wrap ${
              readOnly ? "cursor-default" : "cursor-text"
            }`}
          >
            {element.text || (!readOnly ? "Double-click" : "")}
          </div>
        )}
      </div>
    );
  }

  if (element.type === "text") {
    return (
      <div
        onClick={onSelect}
        className={`absolute p-2 select-none ${
          readOnly ? "cursor-default" : "cursor-move"
        } ${isSelected ? "border border-dashed border-indigo-500 rounded" : ""}`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
        }}
      >
        {isEditing && !readOnly ? (
          <textarea
            autoFocus
            value={element.text || ""}
            onChange={(e) => onUpdate({ ...element, text: e.target.value })}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 resize-none outline-none"
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (readOnly) return;
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-wrap ${
              readOnly ? "cursor-default" : "cursor-text"
            }`}
          >
            {element.text || (!readOnly ? "Text Box" : "")}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`absolute rounded-xl flex items-center justify-center p-4 text-center select-none transition-shadow shadow-md ${
        readOnly ? "cursor-default" : "cursor-move"
      } ${isSelected ? "ring-2 ring-indigo-600 shadow-xl" : ""}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: element.color || "#e0e7ff",
        border: `2px solid ${element.borderColor || "#6366f1"}`,
      }}
    >
      {isEditing && !readOnly ? (
        <textarea
          autoFocus
          value={element.text || ""}
          onChange={(e) => onUpdate({ ...element, text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          className="w-full h-full bg-transparent text-center text-xs font-semibold text-slate-900 resize-none outline-none leading-snug"
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            if (readOnly) return;
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={`text-xs font-semibold text-slate-900 whitespace-pre-wrap ${
            readOnly ? "cursor-default" : "cursor-text"
          }`}
        >
          {element.text || (!readOnly ? "Double-click to edit" : "")}
        </div>
      )}
    </div>
  );
};
