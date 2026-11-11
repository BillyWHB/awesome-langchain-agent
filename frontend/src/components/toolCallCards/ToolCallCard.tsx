import { WeatherToolCard } from "./WeatherToolCard";
import { CalculatorToolCard } from "./CalculatorToolCard";
// import { SearchToolCard } from "./SearchToolCard";
import { GenericToolCard } from "./GenericToolCard";

import type { AgentToolCalls } from "../types.ts";

export function ToolCallCard({ toolCall }: { toolCall: AgentToolCalls }) {
  if (toolCall.name === "get_weather") {
    return <WeatherToolCard toolCall={toolCall} />;
  }

  if (toolCall.name === "calculate") {
    return <CalculatorToolCard toolCall={toolCall} />;
  }

  // if (toolCall.name === "search_web") {
  //   return <SearchToolCard toolCall={toolCall} />;
  // }

  return <GenericToolCard toolCall={toolCall} />;
}
