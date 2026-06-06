import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SweepTool } from "../tools/sweep/SweepTool";

export type ToolDefinition = {
  id: string;
  path: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  Component: () => ReactNode;
};

export const tools: ToolDefinition[] = [
  {
    id: "sweep",
    path: "/sweep",
    label: "スイープツール",
    description: "素材から必要ステージを計算します。",
    Icon: Search,
    Component: SweepTool,
  },
];
