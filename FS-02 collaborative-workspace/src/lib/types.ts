export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER" | "COMMENTER";

export type PermissionLevel = "VIEW" | "COMMENT" | "EDIT";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
  role?: Role;
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserPresence {
  user: User;
  cursor: CursorPosition | null;
  activeBlockId?: string;
  activeElementId?: string;
  currentTool?: string;
  lastActive: number;
}

export type BlockType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "todo"
  | "bullet"
  | "number"
  | "code"
  | "quote"
  | "callout"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  checked?: boolean;
  language?: string;
  icon?: string;
}

export interface DocumentData {
  id: string;
  workspaceId: string;
  title: string;
  icon: string;
  coverImage?: string | null;
  blocks: Block[];
  isFavorite: boolean;
  isArchived: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CanvasElementType =
  | "sticky"
  | "rectangle"
  | "circle"
  | "arrow"
  | "text"
  | "drawing";

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
  borderColor?: string;
  points?: Point[];
  authorName?: string;
  fontSize?: number;
}

export interface CanvasData {
  id: string;
  workspaceId: string;
  title: string;
  icon: string;
  elements: CanvasElement[];
  zoom: number;
  panX: number;
  panY: number;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  targetId: string;
  targetType: "DOCUMENT" | "CANVAS";
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  resolved: boolean;
  createdAt: string;
}

export interface VersionSnapshot {
  id: string;
  targetId: string;
  targetType: "DOCUMENT" | "CANVAS";
  title: string;
  authorName: string;
  snapshotData: string;
  createdAt: string;
}

export interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  icon: string;
  documents: DocumentData[];
  canvases: CanvasData[];
  members: { user: User; role: Role }[];
}

export interface ActivityItem {
  id: string;
  userName: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "JOINED";
  targetType: "DOCUMENT" | "CANVAS" | "WORKSPACE" | "COMMENT";
  targetTitle: string;
  createdAt: string;
}
