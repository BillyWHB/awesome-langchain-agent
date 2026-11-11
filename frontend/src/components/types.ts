import type { BaseMessage } from "langchain";
import type { InferToolCalls, ToolCallFromTool } from "@langchain/react";
import type {
  toolCallingAgent,
  deepSearchTool,
  joinRejoinAgent,
} from "@langchain/playground-agents";

export interface AgentState {
  messages: BaseMessage[];
}

export type AgentToolCalls =
  | InferToolCalls<typeof toolCallingAgent>
  /* used in async-iterator-tools */
  | ToolCallFromTool<typeof deepSearchTool>
  /* used in join-rejoin */
  | InferToolCalls<typeof joinRejoinAgent>;
