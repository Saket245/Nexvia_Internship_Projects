"use client";

import React from "react";
import { UserPresence } from "@/lib/types";

interface MultiplayerCursorsProps {
  collaborators: Record<string, UserPresence>;
  canvasOffset?: { x: number; y: number; zoom: number };
}

export const MultiplayerCursors: React.FC<MultiplayerCursorsProps> = ({
  collaborators,
  canvasOffset,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {Object.entries(collaborators).map(([id, presence]) => {
        if (!presence.cursor) return null;

        let screenX = presence.cursor.x;
        let screenY = presence.cursor.y;

        if (canvasOffset) {
          screenX = presence.cursor.x * canvasOffset.zoom + canvasOffset.x;
          screenY = presence.cursor.y * canvasOffset.zoom + canvasOffset.y;
        }

        const color = presence.user?.color || "#6366f1";
        const name = presence.user?.name || "Collaborator";

        return (
          <div
            key={id}
            className="cursor-presence absolute flex items-start gap-1"
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
              transition: "transform 0.05s linear",
            }}
          >
            <svg
              className="w-5 h-5 drop-shadow-md"
              viewBox="0 0 24 24"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" />
            </svg>

            <div
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-md whitespace-nowrap flex items-center gap-1.5"
              style={{ backgroundColor: color }}
            >
              <span>{name}</span>
              {presence.currentTool && (
                <span className="text-[10px] opacity-90 px-1 rounded bg-black/20">
                  {presence.currentTool}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
