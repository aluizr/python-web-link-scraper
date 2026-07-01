const AVATAR_COLORS = [
  { bg: "#ef4444", text: "#ffffff" }, { bg: "#f97316", text: "#ffffff" },
  { bg: "#f59e0b", text: "#ffffff" }, { bg: "#84cc16", text: "#ffffff" },
  { bg: "#22c55e", text: "#ffffff" }, { bg: "#14b8a6", text: "#ffffff" },
  { bg: "#06b6d4", text: "#ffffff" }, { bg: "#3b82f6", text: "#ffffff" },
  { bg: "#6366f1", text: "#ffffff" }, { bg: "#8b5cf6", text: "#ffffff" },
  { bg: "#a855f7", text: "#ffffff" }, { bg: "#ec4899", text: "#ffffff" },
  { bg: "#f43f5e", text: "#ffffff" }, { bg: "#0ea5e9", text: "#ffffff" },
  { bg: "#10b981", text: "#ffffff" }, { bg: "#d946ef", text: "#ffffff" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getAvatarData(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const domainName = hostname.split(".")[0] || hostname;
    const letter = domainName.charAt(0).toUpperCase();
    const colorIndex = hashString(hostname) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[colorIndex];
    return { letter, color, hostname };
  } catch {
    return { letter: "?", color: AVATAR_COLORS[0], hostname: "" };
  }
}

export function getDomainColor(url: string) {
  return getAvatarData(url).color;
}
