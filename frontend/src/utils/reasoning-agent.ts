  import { useStream } from "@langchain/react";

  const stream = useStream({
    apiUrl: "http://localhost:2024",
    assistantId: "weather",   // 必须等于 langgraph.json 里的 key
  });