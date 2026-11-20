import { DocumentData, CanvasData, ActivityItem, CommentItem, VersionSnapshot, User, WorkspaceData } from "./types";
import { prisma, isDbConnected } from "./prisma";

export const DEFAULT_USERS: User[] = [
  {
    id: "user-1",
    name: "Alex Morgan",
    email: "alex@workspace.dev",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    color: "#6366f1",
    role: "OWNER",
  },
  {
    id: "user-2",
    name: "Sophia Chen",
    email: "sophia@workspace.dev",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    color: "#ec4899",
    role: "EDITOR",
  },
  {
    id: "user-3",
    name: "David Kim",
    email: "david@workspace.dev",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    color: "#10b981",
    role: "EDITOR",
  },
  {
    id: "user-4",
    name: "Elena Rostova",
    email: "elena@workspace.dev",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    color: "#f59e0b",
    role: "VIEWER",
  },
];

const initialDocuments: DocumentData[] = [
  {
    id: "doc-roadmap",
    workspaceId: "ws-default",
    title: "Product Roadmap & Tech Architecture",
    icon: "🚀",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    isFavorite: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: "b1",
        type: "heading-1",
        text: "🚀 Real-Time Collaborative Workspace Specification",
      },
      {
        id: "b2",
        type: "callout",
        icon: "💡",
        text: "Welcome to our unified Notion & Figma multiplayer platform. Changes sync peer-to-peer using Yjs Conflict-Free Replicated Data Types (CRDTs).",
      },
      {
        id: "b3",
        type: "heading-2",
        text: "Core Architecture Pillars",
      },
      {
        id: "b4",
        type: "paragraph",
        text: "This platform combines the structured document hierarchy of Notion with the infinite visual canvas capabilities of Figma into a single low-latency environment.",
      },
      {
        id: "b5",
        type: "todo",
        text: "Implement Yjs CRDT dual-way synchronizer",
        checked: true,
      },
      {
        id: "b6",
        type: "todo",
        text: "Multiplayer cursor tracking with sub-millisecond awareness protocol",
        checked: true,
      },
      {
        id: "b7",
        type: "todo",
        text: "Sticky note and shape vector manipulation engine",
        checked: true,
      },
      {
        id: "b8",
        type: "todo",
        text: "Automated snapshot generation and history rollback",
        checked: false,
      },
      {
        id: "b9",
        type: "code",
        text: "import * as Y from 'yjs';\nconst ydoc = new Y.Doc();\nconst ymap = ydoc.getMap('elements');\nymap.set('sticky-1', { text: 'Realtime update!' });",
        language: "typescript",
      },
      {
        id: "b10",
        type: "quote",
        text: "Great collaboration feels invisible: everyone is in sync without ever worrying about losing work or manual merges.",
      },
    ],
  },
  {
    id: "doc-design-system",
    workspaceId: "ws-default",
    title: "Design System & Component Guidelines",
    icon: "🎨",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    isFavorite: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: "d1",
        type: "heading-1",
        text: "🎨 Design System Standards",
      },
      {
        id: "d2",
        type: "paragraph",
        text: "Our design system provides tokens for high-contrast accessibility, dark mode fidelity, and smooth 60fps canvas transformations.",
      },
      {
        id: "d3",
        type: "bullet",
        text: "Primary Brand Hue: Indigo-600 (#4f46e5) with Violet accent (#7c3aed)",
      },
      {
        id: "d4",
        type: "bullet",
        text: "Collaborator Cursors: Dynamic pastel contrast palettes with micro-pill tags",
      },
      {
        id: "d5",
        type: "callout",
        icon: "✨",
        text: "Keep interactions fluid: smooth easing transitions on hover and active states.",
      },
    ],
  },
];

const initialCanvases: CanvasData[] = [
  {
    id: "canvas-brainstorm",
    workspaceId: "ws-default",
    title: "Product Brainstorm & Architecture Canvas",
    icon: "🗺️",
    isFavorite: true,
    isArchived: false,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: "c1",
        type: "sticky",
        x: 100,
        y: 100,
        width: 220,
        height: 190,
        text: "🌟 High Priority:\nReal-time multiplayer presence with cursor trails & badges",
        color: "#fef08a",
        authorName: "Sophia Chen",
      },
      {
        id: "c2",
        type: "sticky",
        x: 360,
        y: 100,
        width: 220,
        height: 190,
        text: "⚡ CRDT Sync Engine:\nYjs state vector interchange via WebSockets",
        color: "#bbf7d0",
        authorName: "Alex Morgan",
      },
      {
        id: "c3",
        type: "sticky",
        x: 620,
        y: 100,
        width: 220,
        height: 190,
        text: "🛡️ Storage Architecture:\nPostgreSQL + Prisma schema + Redis pub/sub",
        color: "#fed7aa",
        authorName: "David Kim",
      },
      {
        id: "c4",
        type: "rectangle",
        x: 100,
        y: 340,
        width: 320,
        height: 180,
        text: "Frontend Layer\n• React + TypeScript\n• Tailwind CSS\n• Responsive Design",
        color: "#e0e7ff",
        borderColor: "#6366f1",
      },
      {
        id: "c5",
        type: "circle",
        x: 520,
        y: 350,
        width: 170,
        height: 170,
        text: "CRDT / Yjs\nConflict-Free\nSync Hub",
        color: "#fbcfe8",
        borderColor: "#db2777",
      },
      {
        id: "c6",
        type: "arrow",
        x: 425,
        y: 430,
        width: 90,
        height: 10,
        text: "WS stream",
        color: "#6366f1",
      },
    ],
  },
  {
    id: "canvas-sprint",
    workspaceId: "ws-default",
    title: "Sprint Planning & Task Flow",
    icon: "🎯",
    isFavorite: false,
    isArchived: false,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: "sp1",
        type: "sticky",
        x: 120,
        y: 120,
        width: 210,
        height: 180,
        text: "🎯 Backlog:\n- PDF/Markdown export\n- Real-time comment pins\n- Keyboard shortcuts",
        color: "#e9d5ff",
        authorName: "David Kim",
      },
      {
        id: "sp2",
        type: "sticky",
        x: 370,
        y: 120,
        width: 210,
        height: 180,
        text: "🚀 In Progress:\n- Canvas sticky resizing\n- Freehand pencil brush\n- Multi-color picker",
        color: "#fed7aa",
        authorName: "Sophia Chen",
      },
      {
        id: "sp3",
        type: "sticky",
        x: 620,
        y: 120,
        width: 210,
        height: 180,
        text: "✅ Completed:\n- Yjs WebSocket server\n- Slash commands\n- Dark mode support",
        color: "#bbf7d0",
        authorName: "Alex Morgan",
      },
    ],
  },
];

const initialActivities: ActivityItem[] = [
  {
    id: "act-1",
    userName: "Alex Morgan",
    action: "CREATED",
    targetType: "DOCUMENT",
    targetTitle: "Product Roadmap & Tech Architecture",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "act-2",
    userName: "Sophia Chen",
    action: "UPDATED",
    targetType: "CANVAS",
    targetTitle: "Product Brainstorm & Architecture Canvas",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "act-3",
    userName: "David Kim",
    action: "JOINED",
    targetType: "WORKSPACE",
    targetTitle: "Acme Engineering Hub",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

class MemoryStore {
  documents: Map<string, DocumentData> = new Map();
  canvases: Map<string, CanvasData> = new Map();
  comments: CommentItem[] = [
    {
      id: "comment-1",
      targetId: "doc-roadmap",
      targetType: "DOCUMENT",
      authorId: "user-2",
      authorName: "Sophia Chen",
      authorColor: "#ec4899",
      content: "Ensure we benchmark Redis pub/sub latency under 100 concurrent peer connections.",
      resolved: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "comment-2",
      targetId: "doc-roadmap",
      targetType: "DOCUMENT",
      authorId: "user-3",
      authorName: "David Kim",
      authorColor: "#10b981",
      content: "TipTap rich-text editor bindings work smoothly with the Yjs document state.",
      resolved: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
  snapshots: Map<string, VersionSnapshot[]> = new Map();
  activities: ActivityItem[] = [...initialActivities];

  constructor() {
    initialDocuments.forEach((doc) => {
      this.documents.set(doc.id, doc);
      this.snapshots.set(doc.id, [
        {
          id: `snap-${doc.id}-v1`,
          targetId: doc.id,
          targetType: "DOCUMENT",
          title: "Initial Draft Snapshot",
          authorName: "Alex Morgan",
          snapshotData: JSON.stringify(doc),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    });
    initialCanvases.forEach((canvas) => {
      this.canvases.set(canvas.id, canvas);
      this.snapshots.set(canvas.id, [
        {
          id: `snap-${canvas.id}-v1`,
          targetId: canvas.id,
          targetType: "CANVAS",
          title: "Sprint Board Baseline Snapshot",
          authorName: "Sophia Chen",
          snapshotData: JSON.stringify(canvas),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    });
  }
}

const memoryStore = new MemoryStore();

export async function getDocuments(): Promise<DocumentData[]> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const docs = await prisma.document.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return docs.map((d: any) => ({
        id: d.id,
        workspaceId: d.workspaceId,
        title: d.title,
        icon: d.icon || "📄",
        coverImage: d.coverImage,
        blocks: JSON.parse(d.content || "[]"),
        isFavorite: false,
        isArchived: false,
        parentId: null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("Prisma error fallback to in-memory:", e);
    }
  }
  return Array.from(memoryStore.documents.values());
}

export async function getDocument(id: string): Promise<DocumentData | null> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const d: any = await prisma.document.findUnique({ where: { id } });
      if (d) {
        return {
          id: d.id,
          workspaceId: d.workspaceId,
          title: d.title,
          icon: d.icon || "📄",
          coverImage: d.coverImage,
          blocks: JSON.parse(d.content || "[]"),
          isFavorite: false,
          isArchived: false,
          parentId: null,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Prisma error fallback:", e);
    }
  }
  return memoryStore.documents.get(id) || null;
}

export async function saveDocument(doc: DocumentData): Promise<DocumentData> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const updated: any = await prisma.document.upsert({
        where: { id: doc.id },
        update: {
          title: doc.title,
          icon: doc.icon,
          coverImage: doc.coverImage,
          content: JSON.stringify(doc.blocks),
          updatedAt: new Date(),
        },
        create: {
          id: doc.id,
          workspaceId: doc.workspaceId || "ws-default",
          title: doc.title,
          icon: doc.icon,
          coverImage: doc.coverImage,
          content: JSON.stringify(doc.blocks),
        },
      });
      return {
        id: updated.id,
        workspaceId: updated.workspaceId,
        title: updated.title,
        icon: updated.icon || "📄",
        coverImage: updated.coverImage,
        blocks: JSON.parse(updated.content || "[]"),
        isFavorite: doc.isFavorite ?? false,
        isArchived: doc.isArchived ?? false,
        parentId: null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma saveDocument fallback:", e);
    }
  }
  const updatedDoc = { ...doc, updatedAt: new Date().toISOString() };
  memoryStore.documents.set(doc.id, updatedDoc);
  return updatedDoc;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      await prisma.document.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn("Prisma deleteDocument fallback:", e);
    }
  }
  return memoryStore.documents.delete(id);
}

export async function getCanvases(): Promise<CanvasData[]> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const items = await prisma.canvas.findMany({
        orderBy: { updatedAt: "desc" },
      });
      return items.map((c: any) => ({
        id: c.id,
        workspaceId: c.workspaceId,
        title: c.title,
        icon: c.icon || "🎨",
        elements: JSON.parse(c.background || "[]"),
        zoom: c.zoom || 1.0,
        panX: c.panX || 0,
        panY: c.panY || 0,
        isFavorite: false,
        isArchived: false,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("Prisma getCanvases fallback:", e);
    }
  }
  return Array.from(memoryStore.canvases.values());
}

export async function getCanvas(id: string): Promise<CanvasData | null> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const c: any = await prisma.canvas.findUnique({ where: { id } });
      if (c) {
        return {
          id: c.id,
          workspaceId: c.workspaceId,
          title: c.title,
          icon: c.icon || "🎨",
          elements: JSON.parse(c.background || "[]"),
          zoom: c.zoom || 1.0,
          panX: c.panX || 0,
          panY: c.panY || 0,
          isFavorite: false,
          isArchived: false,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("Prisma getCanvas fallback:", e);
    }
  }
  return memoryStore.canvases.get(id) || null;
}

export async function saveCanvas(canvas: CanvasData): Promise<CanvasData> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      const updated: any = await prisma.canvas.upsert({
        where: { id: canvas.id },
        update: {
          title: canvas.title,
          icon: canvas.icon,
          background: JSON.stringify(canvas.elements),
          zoom: canvas.zoom,
          panX: canvas.panX,
          panY: canvas.panY,
          updatedAt: new Date(),
        },
        create: {
          id: canvas.id,
          workspaceId: canvas.workspaceId || "ws-default",
          title: canvas.title,
          icon: canvas.icon,
          background: JSON.stringify(canvas.elements),
          zoom: canvas.zoom,
          panX: canvas.panX,
          panY: canvas.panY,
        },
      });
      return {
        id: updated.id,
        workspaceId: updated.workspaceId,
        title: updated.title,
        icon: updated.icon || "🎨",
        elements: JSON.parse(updated.background || "[]"),
        zoom: updated.zoom || 1.0,
        panX: updated.panX || 0,
        panY: updated.panY || 0,
        isFavorite: canvas.isFavorite ?? false,
        isArchived: canvas.isArchived ?? false,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma saveCanvas fallback:", e);
    }
  }
  const updatedCanvas = { ...canvas, updatedAt: new Date().toISOString() };
  memoryStore.canvases.set(canvas.id, updatedCanvas);
  return updatedCanvas;
}

export async function deleteCanvas(id: string): Promise<boolean> {
  const connected = await isDbConnected();
  if (connected) {
    try {
      await prisma.canvas.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn("Prisma deleteCanvas fallback:", e);
    }
  }
  return memoryStore.canvases.delete(id);
}

export async function getActivities(): Promise<ActivityItem[]> {
  return memoryStore.activities.slice(0, 20);
}

export async function addActivity(activity: Omit<ActivityItem, "id" | "createdAt">): Promise<ActivityItem> {
  const item: ActivityItem = {
    ...activity,
    id: `act-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memoryStore.activities.unshift(item);
  return item;
}

export async function recordActivity(
  action: string,
  targetType: string,
  targetTitle: string,
  userName = "Alex Rivers"
): Promise<ActivityItem> {
  return addActivity({
    userName,
    action: action as any,
    targetType: targetType as any,
    targetTitle,
  });
}

export async function getComments(targetId: string): Promise<CommentItem[]> {
  return memoryStore.comments.filter((c) => c.targetId === targetId);
}

export async function addComment(comment: Omit<CommentItem, "id" | "createdAt">): Promise<CommentItem> {
  const item: CommentItem = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memoryStore.comments.unshift(item);
  return item;
}

export async function resolveComment(id: string): Promise<boolean> {
  const c = memoryStore.comments.find((item) => item.id === id);
  if (c) {
    c.resolved = !c.resolved;
    return true;
  }
  return false;
}

export async function getVersionSnapshots(targetId: string): Promise<VersionSnapshot[]> {
  return memoryStore.snapshots.get(targetId) || [];
}

export async function createVersionSnapshot(
  snapshot: Omit<VersionSnapshot, "id" | "createdAt">
): Promise<VersionSnapshot> {
  const item: VersionSnapshot = {
    ...snapshot,
    id: `snap-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const list = memoryStore.snapshots.get(snapshot.targetId) || [];
  list.unshift(item);
  memoryStore.snapshots.set(snapshot.targetId, list);
  return item;
}
