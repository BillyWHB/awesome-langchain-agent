import { tool } from "langchain";
import { z } from "zod";

export const searchWebTool = tool(
  async ({ query }) => {
    const slug = query.toLowerCase().replace(/\s+/g, "-");
    return {
      query,
      results: [
        {
          title: `Getting Started with ${query}`,
          url: `https://example.com/${slug}`,
          snippet:
            "A comprehensive guide covering the fundamentals and best practices for getting started.",
        },
        {
          title: `${query} — Official Documentation`,
          url: `https://docs.example.com/${slug}`,
          snippet:
            "Official reference documentation with detailed API specifications and usage examples.",
        },
        {
          title: `${query}: Best Practices & Tips`,
          url: `https://blog.example.com/${slug}`,
          snippet:
            "Expert tips and industry best practices compiled from real-world production experience.",
        },
      ],
    };
  },
  {
    name: "search_web",
    description: "Search the web for information about a topic",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  },
);
