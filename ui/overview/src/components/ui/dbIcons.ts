/* The DataBridge workspace icon set (copied from frontend/app.js ICONS) so the shared menu looks the same in both
   apps. 24×24, stroked; keep in sync when an icon changes there. */
export const DB_ICONS = {
  overview: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"5\" rx=\"1.5\"/><rect x=\"14\" y=\"12\" width=\"7\" height=\"9\" rx=\"1.5\"/><rect x=\"3\" y=\"16\" width=\"7\" height=\"5\" rx=\"1.5\"/>",
  analytics: "<path d=\"M3 3v18h18\"/><path d=\"M8 17v-4M12 17V8M16 17v-6M20 17V5\"/>",
  spark: "<path d=\"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z\"/><path d=\"M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z\"/>",
  report: "<path d=\"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z\"/><path d=\"M14 3v5h5M9 13h6M9 17h6M9 9h2\"/>",
  chart: "<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>",
  chat: "<path d=\"M4 5h16v11H9l-5 4z\"/><path d=\"M8 9.5h8M8 12.5h5\"/>",
  home: "<path d=\"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>",
  folder: "<path d=\"M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>",
  term: "<path d=\"M4 17l6-5-6-5M12 19h8\"/>",
  flask: "<path d=\"M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3\"/><path d=\"M7 15h10\"/>",
  trend: "<path d=\"M3 17l6-6 4 4 8-8\"/><path d=\"M15 7h6v6\"/>",
  db: "<ellipse cx=\"12\" cy=\"5.5\" rx=\"8\" ry=\"3\"/><path d=\"M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/>",
  hub: "<circle cx=\"12\" cy=\"12\" r=\"3\"/><circle cx=\"4\" cy=\"6\" r=\"2\"/><circle cx=\"20\" cy=\"6\" r=\"2\"/><circle cx=\"4\" cy=\"18\" r=\"2\"/><circle cx=\"20\" cy=\"18\" r=\"2\"/><path d=\"M6 7l3.5 3M18 7l-3.5 3M6 17l3.5-3M18 17l-3.5-3\"/>",
  sources: "<ellipse cx=\"11\" cy=\"5\" rx=\"7\" ry=\"3\"/><path d=\"M4 5v12c0 1.7 3.1 3 7 3M18 5v5M4 11c0 1.7 3.1 3 7 3\"/><path d=\"M15 17h6M18 14l3 3-3 3\"/>",
  flow: "<rect x=\"3\" y=\"3\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"15\" y=\"15\" width=\"6\" height=\"6\" rx=\"1\"/><path d=\"M9 6h4a2 2 0 0 1 2 2v7\"/>",
  cpu: "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><path d=\"M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3\"/>",
  pulse: "<path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/>",
  bell: "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8\"/><path d=\"M10.3 21a1.9 1.9 0 0 0 3.4 0\"/>",
  logs: "<path d=\"M5 4h14v16H5zM8 8h8M8 12h8M8 16h5\"/>",
  shield: "<path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"/><path d=\"M9 12l2 2 4-4\"/>",
  user: "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c0-4 3.6-7 8-7s8 3 8 7\"/>",
  plug: "<path d=\"M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0z\"/><path d=\"M12 17v4\"/>",
  gear: "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z\"/>",
  sliders: "<path d=\"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6\"/>",
} as const;

export type DbIconName = keyof typeof DB_ICONS;
