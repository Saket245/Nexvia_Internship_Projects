"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CanvasData, CanvasElement, User, UserPresence, Point } from "@/lib/types";
import { CanvasToolbar, ToolMode, COLOR_PALETTE } from "./CanvasToolbar";
import { StickyNoteItem } from "./StickyNoteItem";
import { ShapeItem } from "./ShapeItem";
import { MultiplayerCursors } from "../MultiplayerCursors";

interface FigmaCanvasProps {
  canvas: CanvasData;
  currentUser: User;
  collaborators: Record<string, UserPresence>;
  readOnly?: boolean;
  onUpdate: (updated: CanvasData) => void;
  onCursorMove: (x: number, y: number, extra?: { currentTool?: string }) => void;
}

export const FigmaCanvas: React.FC<FigmaCanvasProps> = ({
  canvas: initialCanvas,
  currentUser,
  collaborators,
  readOnly = false,
  onUpdate,
  onCursorMove,
}) => {
  const [canvasData, setCanvasData] = useState<CanvasData>(initialCanvas);
  const [tool, setTool] = useState<ToolMode>("select");
  const [activeColor, setActiveColor] = useState<string>(COLOR_PALETTE[0].hex);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [pan, setPan] = useState({ x: initialCanvas.panX || 0, y: initialCanvas.panY || 0 });
  const [zoom, setZoom] = useState(initialCanvas.zoom || 1.0);

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanvasData(initialCanvas);
  }, [initialCanvas]);

  useEffect(() => {
    if (readOnly && tool !== "select" && tool !== "pan") {
      setTool("select");
    }
  }, [readOnly, tool]);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = screenX - rect.left;
      const clientY = screenY - rect.top;
      return {
        x: (clientX - pan.x) / zoom,
        y: (clientY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "pan" || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (readOnly) return;

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (tool === "drawing") {
      setCurrentStroke([{ x, y }]);
      return;
    }

    if (tool === "sticky") {
      const newSticky: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "sticky",
        x: Math.round(x - 100),
        y: Math.round(y - 80),
        width: 210,
        height: 180,
        text: "",
        color: activeColor,
        authorName: currentUser.name,
      };
      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newSticky],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setSelectedId(newSticky.id);
      setTool("select");
      return;
    }

    if (tool === "rectangle") {
      const newRect: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "rectangle",
        x: Math.round(x - 90),
        y: Math.round(y - 60),
        width: 180,
        height: 120,
        text: "New Container",
        color: `${activeColor}33`,
        borderColor: activeColor,
      };
      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newRect],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setSelectedId(newRect.id);
      setTool("select");
      return;
    }

    if (tool === "circle") {
      const newCircle: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "circle",
        x: Math.round(x - 70),
        y: Math.round(y - 70),
        width: 140,
        height: 140,
        text: "Node",
        color: `${activeColor}40`,
        borderColor: activeColor,
      };
      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newCircle],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setSelectedId(newCircle.id);
      setTool("select");
      return;
    }

    if (tool === "arrow") {
      const newArrow: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "arrow",
        x: Math.round(x - 75),
        y: Math.round(y - 10),
        width: 150,
        height: 20,
        color: activeColor,
      };
      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newArrow],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setSelectedId(newArrow.id);
      setTool("select");
      return;
    }

    if (tool === "text") {
      const newText: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "text",
        x: Math.round(x),
        y: Math.round(y),
        width: 160,
        height: 40,
        text: "Type notes here",
        color: activeColor,
      };
      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newText],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setSelectedId(newText.id);
      setTool("select");
      return;
    }

    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    onCursorMove(x, y, { currentTool: tool });

    if (readOnly) return;

    if (tool === "drawing" && currentStroke) {
      setCurrentStroke((prev) => (prev ? [...prev, { x, y }] : [{ x, y }]));
      return;
    }

    if (draggedElementId && tool === "select") {
      const newX = Math.round(x - dragOffset.x);
      const newY = Math.round(y - dragOffset.y);

      const updatedElements = canvasData.elements.map((el) => {
        if (el.id === draggedElementId) {
          return { ...el, x: newX, y: newY };
        }
        return el;
      });

      const updated = { ...canvasData, elements: updatedElements };
      setCanvasData(updated);
      onUpdate(updated);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedElementId(null);

    if (readOnly) {
      setCurrentStroke(null);
      return;
    }

    if (currentStroke && currentStroke.length > 1) {
      const minX = Math.min(...currentStroke.map((p) => p.x));
      const maxX = Math.max(...currentStroke.map((p) => p.x));
      const minY = Math.min(...currentStroke.map((p) => p.y));
      const maxY = Math.max(...currentStroke.map((p) => p.y));

      const newDrawing: CanvasElement = {
        id: `c-${Date.now()}`,
        type: "drawing",
        x: minX,
        y: minY,
        width: Math.max(20, maxX - minX),
        height: Math.max(20, maxY - minY),
        points: currentStroke,
        color: activeColor,
      };

      const updated = {
        ...canvasData,
        elements: [...canvasData.elements, newDrawing],
      };
      setCanvasData(updated);
      onUpdate(updated);
      setCurrentStroke(null);
      setTool("select");
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(0.2, zoom * zoomFactor), 3.0);
    setZoom(newZoom);
  };

  const handleStartDragElement = (elementId: string, e: React.MouseEvent) => {
    if (readOnly) {
      setSelectedId(elementId);
      return;
    }
    if (tool !== "select") return;
    e.stopPropagation();
    setSelectedId(elementId);
    setDraggedElementId(elementId);

    const el = canvasData.elements.find((item) => item.id === elementId);
    if (el) {
      const { x, y } = screenToCanvas(e.clientX, e.clientY);
      setDragOffset({
        x: x - el.x,
        y: y - el.y,
      });
    }
  };

  const handleUpdateElement = (updatedElement: CanvasElement) => {
    if (readOnly) return;
    const updatedElements = canvasData.elements.map((el) =>
      el.id === updatedElement.id ? updatedElement : el
    );
    const updated = { ...canvasData, elements: updatedElements };
    setCanvasData(updated);
    onUpdate(updated);
  };

  const handleDeleteSelected = () => {
    if (readOnly) return;
    if (!selectedId) return;
    const updatedElements = canvasData.elements.filter((el) => el.id !== selectedId);
    const updated = { ...canvasData, elements: updatedElements };
    setCanvasData(updated);
    onUpdate(updated);
    setSelectedId(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden canvas-grid ${
        tool === "pan" || isPanning
          ? "cursor-grab active:cursor-grabbing"
          : tool === "select" || readOnly
          ? "cursor-default"
          : "cursor-crosshair"
      }`}
    >
      <MultiplayerCursors
        collaborators={collaborators}
        canvasOffset={{ x: pan.x, y: pan.y, zoom }}
      />

      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {canvasData.elements.map((element) => {
          const isSelected = element.id === selectedId;

          if (element.type === "sticky") {
            return (
              <div
                key={element.id}
                onMouseDown={(e) => handleStartDragElement(element.id, e)}
              >
                <StickyNoteItem
                  element={element}
                  isSelected={isSelected}
                  readOnly={readOnly}
                  onSelect={(e) => {
                    e.stopPropagation();
                    setSelectedId(element.id);
                  }}
                  onUpdate={handleUpdateElement}
                />
              </div>
            );
          }

          return (
            <div
              key={element.id}
              onMouseDown={(e) => handleStartDragElement(element.id, e)}
            >
              <ShapeItem
                element={element}
                isSelected={isSelected}
                readOnly={readOnly}
                onSelect={(e) => {
                  e.stopPropagation();
                  setSelectedId(element.id);
                }}
                onUpdate={handleUpdateElement}
              />
            </div>
          );
        })}

        {currentStroke && currentStroke.length > 1 && !readOnly && (
          <svg className="absolute inset-0 overflow-visible pointer-events-none">
            <path
              d={currentStroke
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ")}
              fill="none"
              stroke={activeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <CanvasToolbar
        currentTool={tool}
        currentColor={activeColor}
        zoom={zoom}
        selectedElementId={selectedId}
        readOnly={readOnly}
        onSelectTool={setTool}
        onSelectColor={setActiveColor}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.15, 3.0))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.15, 0.2))}
        onResetZoom={() => {
          setZoom(1.0);
          setPan({ x: 0, y: 0 });
        }}
        onDeleteSelected={handleDeleteSelected}
      />
    </div>
  );
};
