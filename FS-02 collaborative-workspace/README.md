# Real-Time Collaborative Workspace

A real-time workspace where multiple people can edit documents and canvases together at the same time. You can see other people editing, view their cursors on screen, and your changes are saved automatically so you never lose work.

The project combines two styles:
- Document Editor: Similar to Notion, using blocks like paragraphs, headings, checklists, and code blocks.
- Whiteboard Canvas: Similar to Figma or FigJam, using sticky notes, shapes, and freehand drawing.

---

## Tech Stack

The project is built with the following technologies:

- React: Frontend user interface library.
- TypeScript: Type safety across frontend and backend.
- Node.js: JavaScript runtime environment for running the server.
- Express: Backend web framework providing the REST API routes.
- PostgreSQL: Relational database used for storing workspace data.
- Prisma: Database client and ORM used to interact with PostgreSQL.
- Zod: Validation library used to validate data sent to the API.
- Docker: Container tool used to run PostgreSQL, Redis, and the app together.

---

## Database-First Approach

This project follows a database-first design:

1. The database structure is written first in raw SQL files located in docker/init.sql and prisma/schema.sql.
2. Tables include workspaces, users, workspace members, documents, document blocks, canvases, canvas elements, comments, and activities.
3. Foreign keys use cascade delete so related items clean up properly when a parent record is removed.
4. When PostgreSQL starts in Docker, it runs docker/init.sql automatically.
5. Prisma reads the tables from PostgreSQL using the prisma db pull command and creates the schema.prisma file.
6. The Prisma Client is generated using prisma generate.

If you run the project without Docker, a built-in memory store is used automatically with sample data so you can test right away without installing or running a database.

---

## Project Milestones

The project meets all the required milestones:

### Milestone 1: CRDT Conflict Resolution
The project uses Yjs conflict-free replicated data types. When multiple people edit the same line or move objects at the same time, Yjs merges their edits automatically without overwriting anyone or losing text.

### Milestone 2: Login, Workspaces, and Pages
Users can switch between team members (Alex Morgan, Sophia Chen, David Kim, and Elena Rostova). The sidebar shows all workspace pages, documents, and canvases. You can create new documents or whiteboard canvases with one click.

### Milestone 3: Rich-Text Editor
The document editor provides a Notion-style block editor. You can type slash (/) on any empty line to open the insert menu. Available block types include headings, paragraphs, to-do lists, numbered lists, bullet lists, code blocks, quote blocks, callout boxes, and horizontal dividers.

### Milestone 4: WebSocket Server
A WebSocket server runs on port 1234 and on the /ws path. When someone types or moves an item, the change is broadcast over WebSockets to all connected browsers immediately.

### Milestone 5: Multiplayer Presence and Cursors
Each collaborator has an assigned color. You can see other collaborators moving their mouse cursors in real time with their names displayed. The top header shows avatars of all users currently online in the document or canvas. When another user clicks into a text block, that block shows an editing indicator with their color.

### Milestone 6: Comments, Version History, and Permissions
- Comments: A sliding drawer allows users to read comments, post new comments, and mark comments as resolved.
- Version History: Users can view snapshot history, create manual version snapshots with names, and restore previous versions.
- Permissions: Users can switch between View, Comment, and Edit modes. In View mode, editing inputs are disabled.

### Milestone 7: Redis Scaling and Multi-Browser Testing
The WebSocket server includes Redis publish-subscribe support using ioredis. When enabled, edits broadcast across multiple backend server instances so the application can scale horizontally. You can test live synchronization by opening two or more browser windows side by side.

---

## How to Run from VS Code Terminal

### Project Path
Make sure your terminal is inside the project directory:
```
D:\NexviaIntershipProjects\FS-02 collaborative-workspace
```

To navigate to this directory in PowerShell or Command Prompt:
```powershell
cd "D:\NexviaIntershipProjects\FS-02 collaborative-workspace"
```

---

### Step 1: Install Dependencies
Run this command once to install all packages:
```bash
npm install
```

---

### Step 2: Run Frontend and Backend Together (Recommended)
From the project folder, run:
```bash
npm run dev
```

This starts:
- Frontend (React + Vite): http://localhost:3000
- Backend API (Express): http://localhost:4000/api
- WebSocket Server: ws://localhost:1234

Open http://localhost:3000 in your browser to view the application.

---

### Step 3: Run Frontend and Backend in Separate Terminals (Alternative)

If you prefer two separate terminals in VS Code:

Terminal 1 (Backend API and WebSockets):
- Path: `D:\NexviaIntershipProjects\FS-02 collaborative-workspace`
- Command:
```bash
npm run dev:server
```
Backend runs on http://localhost:4000 and WebSockets run on ws://localhost:1234.

Terminal 2 (Frontend React App):
- Path: `D:\NexviaIntershipProjects\FS-02 collaborative-workspace`
- Command:
```bash
npm run dev:react
```
Frontend runs on http://localhost:3000 and automatically proxies API requests to port 4000.

---

## How to Run Automated Tests

To run the automated test suite:
```bash
npm test
```

This verifies:
1. React and TypeScript production build with Vite.
2. Express server initialization and middleware.
3. Health check route and required tech stack verification.
4. Document CRUD operations and persistence.
5. Canvas whiteboard CRUD operations and persistence.
6. Zod runtime schema validation for incoming requests.
7. React SPA static asset serving.
8. Yjs CRDT real-time merge synchronization.

---

## How to Run with Docker

You can run PostgreSQL, Redis, and the collaborative application inside Docker containers.

1. Make sure Docker Desktop is running on your machine.
2. From the project folder, start all services:
```bash
docker compose up --build
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- The collaborative app on port 4000

When running with Docker, open:
- Web Application: http://localhost:4000
- Backend API: http://localhost:4000/api
- WebSocket Server: ws://localhost:1234

To stop Docker containers:
```bash
docker compose down
```

---

## REST API Routes

### System
- GET /api/health: Returns server and database status.
- GET /api: Returns project information and tech stack.

### Documents
- GET /api/documents: Returns all documents.
- POST /api/documents: Creates a new document (validated with Zod).
- GET /api/documents/:id: Returns a single document and its blocks.
- PATCH /api/documents/:id: Updates document title, icon, or blocks.
- DELETE /api/documents/:id: Deletes a document.
- POST /api/documents/:id/blocks: Adds a block to a document.
- GET /api/documents/:id/export: Exports a document as Markdown, HTML, or JSON.

### Canvases
- GET /api/canvases: Returns all whiteboard canvases.
- POST /api/canvases: Creates a new canvas (validated with Zod).
- GET /api/canvases/:id: Returns a canvas and its sticky notes and shapes.
- PATCH /api/canvases/:id: Updates canvas settings.
- PUT /api/canvases/:id/elements: Saves all elements on a canvas.
- DELETE /api/canvases/:id: Deletes a canvas.

### Comments and Versions
- GET /api/comments: Returns comments for a document.
- POST /api/comments: Adds a new comment.
- PATCH /api/comments/:id/resolve: Marks a comment as resolved.
- GET /api/versions: Returns version snapshots for a document.
- POST /api/versions: Creates a new version snapshot.

### Workspaces and Activity
- GET /api/workspaces/default: Returns current workspace details.
- GET /api/activities: Returns recent activity logs.
- POST /api/activities: Records a new activity log.

---

## Project Structure

```
collaborative-workspace/
|-- docker/
|   \-- init.sql
|-- docker-compose.yml
|-- Dockerfile
|-- index.html
|-- package.json
|-- server.js
|-- vite.config.mjs
|-- prisma/
|   |-- schema.prisma
|   |-- schema.sql
|   \-- seed.mjs
|-- scripts/
|   |-- dev.mjs
|   |-- init-db.mjs
|   \-- test-runner.cjs
\-- src/
    |-- App.tsx
    |-- main.tsx
    |-- index.css
    |-- components/
    |   |-- notion/
    |   |-- figma/
    |   |-- MultiplayerCursors.tsx
    |   \-- icons.tsx
    |-- schemas/
    |-- server/
    |   |-- index.ts
    |   |-- websocket.ts
    |   |-- middleware/
    |   \-- routes/
    \-- lib/
```
