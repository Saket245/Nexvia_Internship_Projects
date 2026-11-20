"use client";

import React from "react";
import {
  MousePointer,
  Hand,
  StickyNote,
  Square,
  Circle,
  MoveRight,
  Pencil,
  Type,
  Plus,
  Minus,
  RotateCcw,
  Trash2,
} from "@/components/icons";
import { CanvasElementType } from "@/lib/types";

export type ToolMode = CanvasElementType | "select" | "pan";

interface CanvasToolbarProps {
  currentTool: ToolMode;
  currentColor: string;
  zoom: number;
  selectedElementId: string | null;
  readOnly?: boolean;
  onSelectTool: (tool: ToolMode) => void;
  onSelectColor: (color: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDeleteSelected: () => void;
}

export const COLOR_PALETTE = [
  { name: "Yellow", hex: "#fef08a", border: "#facc15" },
  { name: "Mint", hex: "#bbf7d0", border: "#4ade80" },
  { name: "Sky", hex: "#bae6fd", border: "#38bdf8" },
  { name: "Lavender", hex: "#e9d5ff", border: "#c084fc" },
  { name: "Peach", hex: "#fed7aa", border: "#fb923c" },
  { name: "Rose", hex: "#fbcfe8", border: "#f472b6" },
  { name: "Indigo", hex: "#e0e7ff", border: "#6366f1" },
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  currentTool,
  currentColor,
  zoom,
  selectedElementId,
  readOnly = false,
  onSelectTool,
  onSelectColor,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDeleteSelected,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 select-none">
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl">
        <button
          onClick={() => onSelectTool("select")}
          className={`p-2 rounded-xl transition cursor-pointer ${
            currentTool === "select"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          title="Select / Inspect (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectTool("pan")}
          className={`p-2 rounded-xl transition cursor-pointer ${
            currentTool === "pan"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          title="Pan Hand (H)"
        >
          <Hand className="w-4 h-4" />
        </button>

        {!readOnly && (
          <>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />

            <button
              onClick={() => onSelectTool("sticky")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "sticky"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Sticky Note (S)"
            >
              <StickyNote className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => onSelectTool("rectangle")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "rectangle"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Rectangle (R)"
            >
              <Square className="w-4 h-4 text-indigo-500" />
            </button>

            <button
              onClick={() => onSelectTool("circle")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "circle"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Circle (O)"
            >
              <Circle className="w-4 h-4 text-pink-500" />
            </button>

            <button
              onClick={() => onSelectTool("arrow")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "arrow"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Arrow Connector (A)"
            >
              <MoveRight className="w-4 h-4 text-sky-500" />
            </button>

            <button
              onClick={() => onSelectTool("drawing")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "drawing"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Freehand Pencil (P)"
            >
              <Pencil className="w-4 h-4 text-emerald-500" />
            </button>

            <button
              onClick={() => onSelectTool("text")}
              className={`p-2 rounded-xl transition cursor-pointer ${
                currentTool === "text"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="Text Box (T)"
            >
              <Type className="w-4 h-4 text-slate-500" />
            </button>

            {selectedElementId && (
              <>
                <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />
                <button
                  onClick={onDeleteSelected}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Delete Selected Element"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {!readOnly && (
        <div className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              onClick={() => onSelectColor(c.hex)}
              className={`w-6 h-6 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer ${
                currentColor === c.hex ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900" : ""
              }`}
              style={{ backgroundColor: c.hex, border: `1px solid ${c.border}` }}
              title={c.name}
            />
          ))}
        </div>
      )}

      {readOnly && (
        <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold backdrop-blur-md shadow-2xl flex items-center gap-1.5">
          <span>Read-Only</span>
        </div>
      )}

      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-2xl text-xs">
        <button
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetZoom}
          className="px-2 py-1 font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition cursor-pointer"
          title="Reset to 100%"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
