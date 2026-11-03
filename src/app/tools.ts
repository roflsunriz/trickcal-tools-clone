import { ChevronsUp, Paintbrush, Search, Sparkles, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { MessageKey } from "../i18n";
import { BoardTool } from "../tools/community/BoardTool";
import { FoodTool } from "../tools/community/FoodTool";
import { RankUpTool } from "../tools/rank-up/RankUpTool";
import { SkillUpTool } from "../tools/skill-up/SkillUpTool";
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
  {
    id: "rank-up",
    path: "/rank-up",
    labelKey: "tool.rankUp.label",
    descriptionKey: "tool.rankUp.description",
    Icon: ChevronsUp,
    Component: RankUpTool,
  },
  {
    id: "skill-up",
    path: "/skill-up",
    labelKey: "tool.skillUp.label",
    descriptionKey: "tool.skillUp.description",
    Icon: Sparkles,
    Component: SkillUpTool,
  },
  {
    id: "board",
    path: "/board",
    labelKey: "tool.board.label",
    descriptionKey: "tool.board.description",
    Icon: Paintbrush,
    Component: BoardTool,
  },
  {
    id: "food",
    path: "/food",
    labelKey: "tool.food.label",
    descriptionKey: "tool.food.description",
    Icon: Utensils,
    Component: FoodTool,
  },
];
