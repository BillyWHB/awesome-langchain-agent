import { tool } from "langchain";
import { z } from "zod";

export const emailTool = tool(
  async ({ to, subject, body }) => {
    const id = `msg_${Date.now().toString(36)}`;
    return JSON.stringify({
      status: "sent",
      messageId: id,
      to,
      subject,
      body,
      summary: `Email "${subject}" sent to ${to} with body: "${body}"`,
    });
  },
  {
    name: "send_email",
    description: "Send an email to a recipient with a subject and body",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject line"),
      body: z.string().describe("Email body content"),
    }),
  },
);
