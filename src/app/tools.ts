import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { MessageKey } from "../i18n";
import { SweepTool } from "../tools/sweep/SweepTool";

export type ToolDefinition = {
  id: string;
  path: string;
  labelKey: MessageKey;
  descriptionKey: MessageKey;
  Icon: LucideIcon;
  Component: () => ReactNode;
};

export const tools: ToolDefinition[] = [
  {
    id: "sweep",
    path: "/sweep",
    labelKey: "tool.sweep.label",
    descriptionKey: "tool.sweep.description",
    Icon: Search,
    Component: SweepTool,
  },
];
