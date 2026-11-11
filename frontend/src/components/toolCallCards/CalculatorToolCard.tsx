import type { ToolCallFromTool } from "@langchain/react";
import type { calculatorTool } from "@langchain/playground-agents";

export function CalculatorToolCard({
  toolCall,
}: {
  toolCall: ToolCallFromTool<typeof calculatorTool>;
}) {
  const expression = toolCall.input.expression ?? "";

  if (toolCall.status === "running") {
    return (
      <div
        className="rounded-xl border border-accent-gold bg-surface p-4"
        data-testid="sdk-preview-chat-turn"
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-accent-gold animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth={3}
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <div className="text-sm font-medium text-text-secondary font-mono">
            Computing {expression}…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-accent-gold bg-surface p-4"
      data-testid="sdk-preview-chat-turn"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-accent-gold/20 flex items-center justify-center">
          <span className="text-text-secondary text-xs font-bold">fx</span>
        </div>
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
          Calculator
        </span>
      </div>
      {toolCall.error ? (
        <div className="text-sm text-error font-mono">{toolCall.error}</div>
      ) : (
        <div className="font-mono">
          <div className="text-sm text-text-tertiary">{expression}</div>
          <div className="text-2xl font-bold text-text tabular-nums mt-1">
            = {toolCall.output?.result}
          </div>
        </div>
      )}
    </div>
  );
}
