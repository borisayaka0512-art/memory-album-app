export const SPINE_COLORS = [
  { value: "#b5495b", label: "ローズ" },
  { value: "#5c6e58", label: "セージ" },
  { value: "#c99a3d", label: "マスタード" },
  { value: "#5b7f97", label: "ブルー" },
  { value: "#b56b4a", label: "テラコッタ" },
  { value: "#7d6295", label: "プラム" },
];

function hash(id: string, salt: number) {
  return [...id].reduce((acc, char) => acc + char.charCodeAt(0) * salt, 0);
}

export function spineColorFor(id: string, coverColor?: string | null) {
  if (coverColor) return coverColor;
  return SPINE_COLORS[hash(id, 1) % SPINE_COLORS.length].value;
}

const SPINE_WIDTHS = ["2.5rem", "2.75rem", "3rem", "3.5rem"];
export function spineWidthFor(id: string) {
  return SPINE_WIDTHS[hash(id, 7) % SPINE_WIDTHS.length];
}

const SPINE_HEIGHTS = ["8rem", "8.75rem", "9.5rem"];
export function spineHeightFor(id: string) {
  return SPINE_HEIGHTS[hash(id, 13) % SPINE_HEIGHTS.length];
}
