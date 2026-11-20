import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding collaborative workspace database...");

  
  try {
    await prisma.activity.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.snapshot.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.canvas.deleteMany({});
    await prisma.workspaceMember.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.workspace.deleteMany({});
  } catch (e) {
    
  }

  
  const user1 = await prisma.user.create({
    data: {
      email: "alex@workspace.dev",
      name: "Alex Morgan",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      color: "#6366f1",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "sophia@workspace.dev",
      name: "Sophia Chen",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      color: "#ec4899",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "david@workspace.dev",
      name: "David Kim",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      color: "#10b981",
    },
  });

  
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Engineering & Design Hub",
      slug: "acme-engineering",
      icon: "⚡",
    },
  });

  
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: user1.id, role: "OWNER" },
      { workspaceId: workspace.id, userId: user2.id, role: "EDITOR" },
      { workspaceId: workspace.id, userId: user3.id, role: "EDITOR" },
    ],
  });

  
  const doc1 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      title: "Product Roadmap & Tech Architecture",
      icon: "🚀",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      content: JSON.stringify([
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
          text: "import * as Y from 'yjs';\nconst ydoc = new Y.Doc();\nconst yarray = ydoc.getArray('shared-blocks');\nyarray.observe(event => console.log('Delta received:', event));",
          language: "typescript",
        },
        {
          id: "b10",
          type: "quote",
          text: "Great collaboration feels invisible: everyone is in sync without ever worrying about losing work or manual merges.",
        },
      ]),
      isFavorite: true,
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      title: "Design System & Component Guidelines",
      icon: "🎨",
      coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
      content: JSON.stringify([
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
      ]),
      isFavorite: false,
    },
  });

  
  const canvas1 = await prisma.canvas.create({
    data: {
      workspaceId: workspace.id,
      title: "Product Brainstorm & User Flow Canvas",
      icon: "🗺️",
      elements: JSON.stringify([
        {
          id: "c1",
          type: "sticky",
          x: 100,
          y: 120,
          width: 220,
          height: 200,
          text: "🌟 High Priority: Real-time multiplayer presence with cursor trails & badges",
          color: "#fef08a",
          authorName: "Sophia Chen",
        },
        {
          id: "c2",
          type: "sticky",
          x: 360,
          y: 120,
          width: 220,
          height: 200,
          text: "⚡ CRDT Sync Engine: Yjs state vector interchange via WebSockets",
          color: "#bbf7d0",
          authorName: "Alex Morgan",
        },
        {
          id: "c3",
          type: "sticky",
          x: 620,
          y: 120,
          width: 220,
          height: 200,
          text: "🛡️ Storage Architecture: PostgreSQL + Prisma schema + Redis pub/sub",
          color: "#fed7aa",
          authorName: "David Kim",
        },
        {
          id: "c4",
          type: "rectangle",
          x: 100,
          y: 380,
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
          y: 400,
          width: 160,
          height: 160,
          text: "CRDT / Yjs\nConflict-Free\nSync Hub",
          color: "#fbcfe8",
          borderColor: "#db2777",
        },
        {
          id: "c6",
          type: "arrow",
          x: 425,
          y: 470,
          width: 90,
          height: 10,
          text: "Bi-directional WebSocket",
          color: "#64748b",
        },
      ]),
      zoom: 1.0,
      panX: 0,
      panY: 0,
      isFavorite: true,
    },
  });

  const canvas2 = await prisma.canvas.create({
    data: {
      workspaceId: workspace.id,
      title: "Sprint Planning Board",
      icon: "🎯",
      elements: JSON.stringify([
        {
          id: "sp1",
          type: "sticky",
          x: 150,
          y: 150,
          width: 200,
          height: 180,
          text: "🎯 Backlog:\n- PDF/Markdown export\n- Real-time voice rooms\n- Custom block embeds",
          color: "#e9d5ff",
          authorName: "David Kim",
        },
        {
          id: "sp2",
          type: "sticky",
          x: 400,
          y: 150,
          width: 200,
          height: 180,
          text: "🚀 In Progress:\n- Canvas sticky resizing\n- Freehand pencil brush\n- Multi-color picker",
          color: "#fed7aa",
          authorName: "Sophia Chen",
        },
        {
          id: "sp3",
          type: "sticky",
          x: 650,
          y: 150,
          width: 200,
          height: 180,
          text: "✅ Done:\n- Yjs WebSocket server\n- Slash commands\n- Dark mode support",
          color: "#bbf7d0",
          authorName: "Alex Morgan",
        },
      ]),
      zoom: 1.0,
      isFavorite: false,
    },
  });

  
  await prisma.activity.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: user1.id,
        userName: user1.name,
        action: "CREATED",
        targetType: "DOCUMENT",
        targetTitle: doc1.title,
      },
      {
        workspaceId: workspace.id,
        userId: user2.id,
        userName: user2.name,
        action: "CREATED",
        targetType: "CANVAS",
        targetTitle: canvas1.title,
      },
      {
        workspaceId: workspace.id,
        userId: user3.id,
        userName: user3.name,
        action: "UPDATED",
        targetType: "CANVAS",
        targetTitle: canvas1.title,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
