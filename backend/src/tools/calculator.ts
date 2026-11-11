import { tool } from "langchain";
import { z } from "zod";

const MAX_EXPRESSION_LENGTH = 64;
const MAX_LITERAL_DIGITS = 15;

function validationError(sanitized: string): string | null {
  if (sanitized.length > MAX_EXPRESSION_LENGTH) {
    return `Expression too long (max ${MAX_EXPRESSION_LENGTH} characters).`;
  }
  if (sanitized.includes("**")) {
    return "Exponentiation (**) is not allowed.";
  }
  if (!/^[\d+\-*/().]+$/.test(sanitized)) {
    return "Only numbers and +, -, *, /, (, ) are allowed.";
  }
  for (const match of sanitized.matchAll(/\d+/g)) {
    if (match[0].length > MAX_LITERAL_DIGITS) {
      return `Number literals may contain at most ${MAX_LITERAL_DIGITS} digits.`;
    }
  }
  return null;
}

function safeEvaluate(expression: string): number {
  const sanitized = expression.replace(/\s/g, "");
  const error = validationError(sanitized);
  if (error !== null) {
    throw new Error(`Invalid expression: "${expression}". ${error}`);
  }
  return new Function(`"use strict"; return (${sanitized});`)() as number;
}

export const calculatorTool = tool(
  async ({ expression }) => {
    try {
      const result = safeEvaluate(expression);
      return { expression, result };
    } catch (err) {
      return {
        expression,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
  {
    name: "calculate",
    description: "Evaluate a mathematical expression. Supports +, -, *, /, and parentheses.",
    schema: z.object({
      expression: z.string().describe("The math expression to evaluate, e.g. '2 + 3 * 4'"),
    }),
  },
);
