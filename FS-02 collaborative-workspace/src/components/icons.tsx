import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

const defaultProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Plus: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);

export const Minus: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M5 12h14" /></svg>
);

export const X: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export const Check: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M20 6 9 17l-5-5" /></svg>
);

export const CheckCircle: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
);

export const CheckCircle2: React.FC<IconProps> = CheckCircle;

export const CheckSquare: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);

export const Square: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
);

export const Circle: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="12" cy="12" r="10" /></svg>
);

export const Sparkles: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);

export const Zap: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

export const Search: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

export const ChevronDown: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="m6 9 6 6 6-6" /></svg>
);

export const ChevronRight: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="m9 18 6-6-6-6" /></svg>
);

export const Moon: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);

export const Sun: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);

export const Menu: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);

export const Share2: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
);

export const Trash2: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);

export const Star: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

export const Activity: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
);

export const FileText: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
);

export const Layout: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
);

export const Clock: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

export const Users: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export const Database: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg>
);

export const ArrowRight: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export const Layers: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
);

export const Cpu: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
);

export const Download: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
);

export const Copy: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);

export const ExternalLink: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
);

export const Wifi: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M12 20h.01" /><path d="M2 8.82a15 15 0 0 1 20 0" /><path d="M5 12.859a10 10 0 0 1 14 0" /><path d="M8.5 16.429a5 5 0 0 1 7 0" /></svg>
);

export const Image: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
);

export const Smile: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" /></svg>
);

export const GripVertical: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
);

export const Heading1: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="m17 12 3-2v8" /></svg>
);

export const Heading2: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" /></svg>
);

export const Heading3: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" /><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" /></svg>
);

export const List: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
);

export const ListOrdered: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
);

export const Code: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

export const Quote: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /></svg>
);

export const AlertCircle: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
);

export const MousePointer: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="m13 13 6 6" /></svg>
);

export const Hand: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
);

export const StickyNote: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" /><path d="M15 3v5a1 1 0 0 0 1 1h5" /></svg>
);

export const MoveRight: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M18 8L22 12L18 16" /><path d="M2 12H22" /></svg>
);

export const Pencil: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);

export const Type: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
);

export const RotateCcw: React.FC<IconProps> = (p) => (
  <svg {...defaultProps} {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
);
