import React, { useState, useEffect, useCallback } from "react";
import { NotionEditor } from "./components/notion/NotionEditor";
import { FigmaCanvas } from "./components/figma/FigmaCanvas";
import { useCollabSync } from "./lib/collab-sync";
import { Sun, Moon } from "./components/icons";
import {
  User,
  DocumentData,
  CanvasData,
  UserPresence,
  CommentItem,
  VersionSnapshot,
  PermissionLevel,
} from "./lib/types";
import { DEFAULT_USERS } from "./lib/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<"document" | "canvas">("document");
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-roadmap");
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>("canvas-brainstorm");
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("collab_theme");
      if (saved) return saved === "dark";
      return true;
    }
    return true;
  });
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("collab_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("collab_theme", "light");
    }
  }, [darkMode]);

  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS[0]);
  const [permission, setPermission] = useState<PermissionLevel>("EDIT");

  const [showPagesSidebar, setShowPagesSidebar] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);

  const activeTargetId = activeTab === "document" ? (documentData?.id || "") : (canvasData?.id || "");
  const currentRoom = `${activeTab === "document" ? "doc" : "canvas"}-${activeTargetId || "default"}`;

  const {
    status,
    latency,
    collaborators,
    updateCursor,
  } = useCollabSync({
    room: currentRoom,
    currentUser,
  });

  const loadWorkspaceData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, canvasRes] = await Promise.all([
        fetch("/api/documents"),
        fetch("/api/canvases"),
      ]);

      if (docsRes.ok) {
        const docs: DocumentData[] = await docsRes.json();
        setDocuments(docs);
        if (docs.length > 0) {
          const current = docs.find((d) => d.id === selectedDocId) || docs[0];
          setDocumentData(current);
          setSelectedDocId(current.id);
        }
      }

      if (canvasRes.ok) {
        const cans: CanvasData[] = await canvasRes.json();
        setCanvases(cans);
        if (cans.length > 0) {
          const current = cans.find((c) => c.id === selectedCanvasId) || cans[0];
          setCanvasData(current);
          setSelectedCanvasId(current.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDocId, selectedCanvasId]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const loadComments = useCallback(async (targetId: string) => {
    if (!targetId) return;
    try {
      const res = await fetch(`/api/comments?targetId=${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSnapshots = useCallback(async (targetId: string) => {
    if (!targetId) return;
    try {
      const res = await fetch(`/api/versions?targetId=${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTargetId) {
      loadComments(activeTargetId);
      loadSnapshots(activeTargetId);
    }
  }, [activeTargetId, loadComments, loadSnapshots]);

  const handleDocumentChange = useCallback(async (updated: DocumentData) => {
    if (permission === "VIEW" || permission === "COMMENT") return;
    setDocumentData(updated);
    setIsSaved(false);
    try {
      await fetch(`/api/documents/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updated.title,
          icon: updated.icon,
          blocks: updated.blocks.map((b) => ({
            id: b.id,
            type: b.type,
            text: b.text,
            checked: b.checked,
            language: b.language,
            icon: b.icon,
          })),
        }),
      });
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    }
  }, [permission]);

  const handleCanvasChange = useCallback(async (updated: CanvasData) => {
    if (permission === "VIEW" || permission === "COMMENT") return;
    setCanvasData(updated);
    setIsSaved(false);
    try {
      await fetch(`/api/canvases/${updated.id}/elements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements: updated.elements.map((el) => ({
            id: el.id,
            type: el.type,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
            text: el.text || "",
            color: el.color,
            borderColor: el.borderColor,
            authorName: el.authorName,
          })),
        }),
      });
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    }
  }, [permission]);

  const handleCreateDocument = async () => {
    if (permission !== "EDIT") return;
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Untitled Document ${documents.length + 1}`,
          icon: "📄",
          workspaceId: "ws-default",
        }),
      });
      if (res.ok) {
        const created: DocumentData = await res.json();
        setDocuments((prev) => [created, ...prev]);
        setDocumentData(created);
        setSelectedDocId(created.id);
        setActiveTab("document");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCanvas = async () => {
    if (permission !== "EDIT") return;
    try {
      const res = await fetch("/api/canvases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Whiteboard Canvas ${canvases.length + 1}`,
          workspaceId: "ws-default",
        }),
      });
      if (res.ok) {
        const created: CanvasData = await res.json();
        setCanvases((prev) => [created, ...prev]);
        setCanvasData(created);
        setSelectedCanvasId(created.id);
        setActiveTab("canvas");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (permission === "VIEW") return;
    if (!newCommentText.trim() || !activeTargetId) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: activeTargetId,
          targetType: activeTab === "document" ? "DOCUMENT" : "CANVAS",
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorColor: currentUser.color,
          content: newCommentText.trim(),
        }),
      });

      if (res.ok) {
        const created: CommentItem = await res.json();
        setComments((prev) => [created, ...prev]);
        setNewCommentText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveComment = async (id: string) => {
    if (permission === "VIEW") return;
    try {
      await fetch(`/api/comments/${id}/resolve`, { method: "PATCH" });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSnapshot = async () => {
    if (permission !== "EDIT") return;
    if (!activeTargetId) return;
    const currentPayload = activeTab === "document" ? documentData : canvasData;
    if (!currentPayload) return;

    const snapshotTitle = prompt("Enter snapshot milestone name:", `Snapshot #${snapshots.length + 1}`);
    if (!snapshotTitle) return;

    try {
      const res = await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: activeTargetId,
          targetType: activeTab === "document" ? "DOCUMENT" : "CANVAS",
          title: snapshotTitle,
          authorName: currentUser.name,
          snapshotData: JSON.stringify(currentPayload),
        }),
      });

      if (res.ok) {
        const created: VersionSnapshot = await res.json();
        setSnapshots((prev) => [created, ...prev]);
        alert("Version snapshot saved successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreSnapshot = (snap: VersionSnapshot) => {
    if (permission !== "EDIT") return;
    if (confirm(`Restore snapshot "${snap.title}" from ${new Date(snap.createdAt).toLocaleTimeString()}?`)) {
      try {
        const parsed = JSON.parse(snap.snapshotData);
        if (activeTab === "document") {
          handleDocumentChange(parsed);
        } else {
          handleCanvasChange(parsed);
        }
        setShowHistory(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const collaboratorList: UserPresence[] = Object.values(collaborators).filter(
    (c) => c.user && c.user.id !== currentUser.id
  );

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => setShowPagesSidebar(!showPagesSidebar)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center gap-1.5 font-medium"
              title="Toggle Pages & Workspaces"
            >
              <span>📂</span>
              <span className="hidden sm:inline">Pages</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                ⚡
              </div>
              <div>
                <h1 className="font-bold text-xs sm:text-sm leading-tight tracking-tight">
                  Real-Time Workspace
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Notion & Figma multiplayer sync
                </p>
              </div>
            </div>

            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("document")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === "document"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>📄</span>
                <span className="hidden sm:inline">Document</span>
              </button>
              <button
                onClick={() => setActiveTab("canvas")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === "canvas"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>🎨</span>
                <span className="hidden sm:inline">Canvas</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-end flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400">Role:</span>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as PermissionLevel)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="EDIT">Editor (Full edit)</option>
                <option value="COMMENT">Commenter (Comments only)</option>
                <option value="VIEW">Viewer (Read-only)</option>
              </select>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                showComments
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              title="Comments Thread"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Comments</span>
              {comments.filter((c) => !c.resolved).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {comments.filter((c) => !c.resolved).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                showHistory
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                  : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
              title="Version History Snapshots"
            >
              <span>🕒</span>
              <span className="hidden sm:inline">History</span>
            </button>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSaved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`}
              />
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Saving..."}</span>
            </div>

            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition"
              title="Switch Collaborator Profile"
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-medium truncate max-w-[80px]">
                {currentUser.name.split(" ")[0]}
              </span>
            </button>

            <div className="flex items-center -space-x-1">
              {collaboratorList.map((collab) => (
                <div
                  key={collab.user.id}
                  title={`${collab.user.name} (Online)`}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: collab.user.color }}
                >
                  {collab.user.name.charAt(0)}
                </div>
              ))}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition flex items-center justify-center shadow-xs"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {permission !== "EDIT" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-center text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>
            Viewing in {permission === "VIEW" ? "Read-Only (Viewer)" : "Commenter (Comments only)"} mode. Document and canvas editing are disabled.
          </span>
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        {showPagesSidebar && (
          <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-30 shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Workspace Pages</span>
              <button
                onClick={() => setShowPagesSidebar(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              <div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Documents</span>
                  {permission === "EDIT" && (
                    <button
                      onClick={handleCreateDocument}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold px-1 cursor-pointer"
                      title="Add new document"
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="space-y-0.5 mt-1">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setDocumentData(doc);
                        setActiveTab("document");
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 truncate transition ${
                        activeTab === "document" && selectedDocId === doc.id
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{doc.icon || "📄"}</span>
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Canvases</span>
                  {permission === "EDIT" && (
                    <button
                      onClick={handleCreateCanvas}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold px-1 cursor-pointer"
                      title="Add new canvas"
                    >
                      +
                    </button>
                  )}
                </div>
                <div className="space-y-0.5 mt-1">
                  {canvases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCanvasId(c.id);
                        setCanvasData(c);
                        setActiveTab("canvas");
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 truncate transition ${
                        activeTab === "canvas" && selectedCanvasId === c.id
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{c.icon || "🎨"}</span>
                      <span className="truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col relative overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading collaborative workspace...</span>
              </div>
            </div>
          ) : activeTab === "document" ? (
            documentData && (
              <div className="flex-1 overflow-y-auto">
                <NotionEditor
                  document={documentData}
                  currentUser={currentUser}
                  collaborators={collaborators}
                  readOnly={permission !== "EDIT"}
                  onUpdate={handleDocumentChange}
                  onCursorMove={updateCursor}
                />
              </div>
            )
          ) : (
            canvasData && (
              <div className="flex-1 overflow-hidden relative">
                <FigmaCanvas
                  canvas={canvasData}
                  currentUser={currentUser}
                  collaborators={collaborators}
                  readOnly={permission !== "EDIT"}
                  onUpdate={handleCanvasChange}
                  onCursorMove={updateCursor}
                />
              </div>
            )
          )}
        </main>

        {showComments && (
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-30 shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comments</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {comments.length}
                </span>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {permission === "VIEW" ? (
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40">
                Viewing in Read-Only mode. Commenting is disabled for Viewers.
              </div>
            ) : (
              <form onSubmit={handleAddComment} className="p-3 border-b border-slate-200 dark:border-slate-800">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs transition"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No comments yet. Be the first to start a conversation!
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border text-xs transition ${
                      c.resolved
                        ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: c.authorColor }}
                        />
                        <span className="font-semibold">{c.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.content}</p>
                    {permission !== "VIEW" && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleResolveComment(c.id)}
                          className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600"
                        >
                          {c.resolved ? "Reopen" : "Mark Resolved ✓"}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {showHistory && (
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-30 shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Version History</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <button
                disabled={permission !== "EDIT"}
                onClick={handleCreateSnapshot}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📸</span>
                <span>Save Current Milestone</span>
              </button>
              {permission !== "EDIT" && (
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
                  Milestone snapshots require Editor role.
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No snapshots recorded yet. Click above to save a snapshot.
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span>{snap.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(snap.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">Saved by {snap.authorName}</div>
                    {permission === "EDIT" && (
                      <button
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="w-full py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white transition text-[11px] font-semibold cursor-pointer"
                      >
                        Restore Version
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Switch Collaborator Profile</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 mt-3">
              {DEFAULT_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowUserModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                    currentUser.id === u.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
