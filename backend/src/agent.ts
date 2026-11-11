import z from "zod";
import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import { ChatDeepSeek } from "@langchain/deepseek";
import "dotenv/config";
import { MemorySaver } from "@langchain/langgraph";
import { weatherTool,calculatorTool,searchWebTool, emailTool } from "./tools/index.js";





const agent = createAgent({
  model: new ChatDeepSeek({
    model: "deepseek-v4-flash",
    // thinking: { type: "enabled", budget_tokens: 5000 },
  }),
  tools: [weatherTool, calculatorTool, searchWebTool, emailTool],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        send_email: {
          allowedDecisions: ["approve", "edit", "reject"],
          description: "Review email before sending",
        },
      },
    }),
  ],
  // checkpointer
});

// const stream = await agent.streamEvents(
//     { messages: [{ role: "user", content: "What is the weather in SF?" }] },
//     { ...config, version: "v3" },
// );
// for await (const message of stream.messages) {
//     for await (const token of message.reasoning) {
//         process.stdout.write(`${token}`);
//     }
//     for await (const token of message.text) {
//         process.stdout.write(token);
//     }
// }

export const graph = agent;