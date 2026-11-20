"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  Smile,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Sparkles,
} from "@/components/icons";
import { DocumentData, Block, User, UserPresence } from "@/lib/types";
import { BlockItem } from "./BlockItem";
import { MultiplayerCursors } from "../MultiplayerCursors";

interface NotionEditorProps {
  document: DocumentData;
  currentUser: User;
  collaborators: Record<string, UserPresence>;
  readOnly?: boolean;
  onUpdate: (doc: DocumentData) => void;
  onCursorMove: (x: number, y: number, extra?: { activeBlockId?: string }) => void;
}

const PRESET_ICONS = ["🚀", "💡", "🎨", "📄", "🎯", "⚡", "✨", "📚", "🔥", "💻"];
const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
];

export const NotionEditor: React.FC<NotionEditorProps> = ({
  document: initialDoc,
  currentUser,
  collaborators,
  readOnly = false,
  onUpdate,
  onCursorMove,
}) => {
  const [doc, setDoc] = useState<DocumentData>(initialDoc);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDoc(initialDoc);
  }, [initialDoc]);

  const handleTitleChange = (newTitle: string) => {
    if (readOnly) return;
    const updated = { ...doc, title: newTitle };
    setDoc(updated);
    onUpdate(updated);
  };

  const handleIconSelect = (icon: string) => {
    if (readOnly) return;
    const updated = { ...doc, icon };
    setDoc(updated);
    onUpdate(updated);
    setShowIconPicker(false);
  };

  const handleCoverSelect = (coverImage: string | null) => {
    if (readOnly) return;
    const updated = { ...doc, coverImage };
    setDoc(updated);
    onUpdate(updated);
    setShowCoverPicker(false);
  };

  const handleBlockChange = (updatedBlock: Block) => {
    if (readOnly) return;
    const updatedBlocks = doc.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    const updated = { ...doc, blocks: updatedBlocks };
    setDoc(updated);
    onUpdate(updated);
  };

  const handleInsertBelow = (currentBlockId: string) => {
    if (readOnly) return;
    const idx = doc.blocks.findIndex((b) => b.id === currentBlockId);
    const newBlock: Block = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "paragraph",
      text: "",
    };
    const updatedBlocks = [...doc.blocks];
    updatedBlocks.splice(idx + 1, 0, newBlock);
    const updated = { ...doc, blocks: updatedBlocks };
    setDoc(updated);
    onUpdate(updated);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (readOnly) return;
    if (doc.blocks.length <= 1) return;
    const updatedBlocks = doc.blocks.filter((b) => b.id !== blockId);
    const updated = { ...doc, blocks: updatedBlocks };
    setDoc(updated);
    onUpdate(updated);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editorRef.current) return;
    const rect = editorRef.current.getBoundingClientRect();
    onCursorMove(e.clientX - rect.left, e.clientY - rect.top);
  };

  const fullText = doc.blocks.map((b) => b.text).join(" ");
  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      ref={editorRef}
      onMouseMove={handleMouseMove}
      className="relative flex-1 overflow-y-auto bg-white dark:bg-slate-900 min-h-screen pb-32"
    >
      <MultiplayerCursors collaborators={collaborators} />

      {doc.coverImage ? (
        <div className="relative h-48 md:h-64 w-full overflow-hidden group">
          <img
            src={doc.coverImage}
            alt="Page Cover"
            className="w-full h-full object-cover"
          />
          {!readOnly && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
              <button
                onClick={() => setShowCoverPicker(true)}
                className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs font-medium transition cursor-pointer"
              >
                Change Cover
              </button>
              <button
                onClick={() => handleCoverSelect(null)}
                className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-xs font-medium transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        !readOnly && (
          <div className="pt-8 px-6 md:px-20 max-w-4xl mx-auto">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Add Cover</span>
            </button>
          </div>
        )
      )}

      {showCoverPicker && !readOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-5 max-w-lg w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Choose Cover</h4>
              <button
                onClick={() => setShowCoverPicker(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4">
              {PRESET_COVERS.map((cov, i) => (
                <div
                  key={i}
                  onClick={() => handleCoverSelect(cov)}
                  className="h-24 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-500 transition group relative"
                >
                  <img src={cov} alt="Cover option" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 md:px-20 pt-6">
        <div className="relative mb-6">
          <div className="relative inline-block">
            <button
              disabled={readOnly}
              onClick={() => !readOnly && setShowIconPicker(!showIconPicker)}
              className={`text-4xl md:text-5xl select-none transition ${
                readOnly ? "cursor-default" : "hover:scale-110 active:scale-95 cursor-pointer"
              }`}
              title={readOnly ? undefined : "Change icon"}
            >
              {doc.icon || "📄"}
            </button>

            {showIconPicker && !readOnly && (
              <div className="absolute left-0 top-full mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl grid grid-cols-5 gap-2 z-50">
                {PRESET_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleIconSelect(emoji)}
                    className="text-2xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            readOnly={readOnly}
            disabled={readOnly}
            value={doc.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={readOnly ? "" : "Untitled Document"}
            className="w-full mt-3 bg-transparent text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white outline-none placeholder-slate-300 dark:placeholder-slate-600 leading-tight disabled:cursor-default"
          />

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500 select-none border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Yjs CRDT synced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{wordCount} words • {readingTime} min read</span>
            </div>
            {readOnly && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Read Only
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {doc.blocks.map((block, index) => {
            const focusedCollaborator = Object.values(collaborators).find(
              (c) => c.activeBlockId === block.id
            )?.user;

            return (
              <BlockItem
                key={block.id}
                block={block}
                index={index}
                readOnly={readOnly}
                focusedCollaborator={focusedCollaborator}
                onChange={handleBlockChange}
                onEnter={handleInsertBelow}
                onDelete={handleDeleteBlock}
                onInsertBelow={handleInsertBelow}
                onFocus={() => {
                  onCursorMove(0, 0, { activeBlockId: block.id });
                }}
              />
            );
          })}
        </div>

        {!readOnly && (
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleInsertBelow(doc.blocks[doc.blocks.length - 1]?.id || "b0")}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add block below</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
