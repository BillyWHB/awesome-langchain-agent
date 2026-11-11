import { tool } from "langchain";
import { z } from "zod";

export const weatherTool = tool(
  async ({ city }) => {
    const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"];
    const temp = Math.floor(Math.random() * 30) + 50;
    return {
      city,
      temperature: temp,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      unit: "fahrenheit",
    };
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get weather for"),
    }),
  },
);
