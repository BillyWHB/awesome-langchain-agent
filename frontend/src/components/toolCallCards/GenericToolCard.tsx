import { useState } from "react";
import type { AssembledToolCall } from "@langchain/react";

import { ChevronIcon } from "@/components/icons";

function ResultValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-text-tertiary italic">null</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-text-secondary font-medium">{value ? "true" : "false"}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-text-secondary tabular-nums">{value}</span>;
  }

  if (typeof value === "string") {
    return <span className="text-text-secondary">{value}</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-outside pl-4 space-y-1 marker:text-emerald-500 dark:marker:text-emerald-400">
        {value.map((item, i) => (
          <li key={i} className="text-text-secondary">
            {typeof item === "object" && item !== null ? (
              <ResultObject data={item as Record<string, unknown>} nested />
            ) : (
              <ResultValue value={item} />
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    return <ResultObject data={value as Record<string, unknown>} nested />;
  }

  return <span className="text-text-secondary">{String(value)}</span>;
}

function ResultObject({
  data,
  nested = false,
}: {
  data: Record<string, unknown>;
  nested?: boolean;
}) {
  const entries = Object.entries(data);
  return (
    <div className={nested ? "space-y-1.5" : "space-y-2"}>
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
            {key.replace(/[_-]/g, " ")}
          </div>
          <ResultValue value={value} />
        </div>
      ))}
    </div>
  );
}

function FormattedResult({ content }: { content: unknown }) {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return (
      <div className="rounded-md border-l-2 border-emerald-500 dark:border-emerald-400 bg-surface-tertiary px-3 py-2.5 text-xs overflow-x-auto">
        <ResultObject data={content as Record<string, unknown>} />
      </div>
    );
  }

  if (Array.isArray(content)) {
    return (
      <div className="rounded-md border-l-2 border-emerald-500 dark:border-emerald-400 bg-surface-tertiary px-3 py-2.5 text-xs overflow-x-auto">
        <ResultValue value={content} />
      </div>
    );
  }

  return (
    <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 font-mono text-xs text-emerald-800 dark:text-emerald-300 overflow-x-auto">
      <pre className="whitespace-pre-wrap">{String(content)}</pre>
    </div>
  );
}

export function GenericToolCard({ toolCall }: { toolCall: AssembledToolCall }) {
  const [resultOpen, setResultOpen] = useState(false);
  const isPending = toolCall.status === "running";

  return (
    <div
      className="rounded-xl border border-border bg-surface-secondary p-4"
      data-testid="sdk-preview-chat-turn"
    >
      <div className="flex items-center gap-2.5">
        <svg
          className="w-4 h-4 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="font-semibold text-sm text-text font-mono flex-1">{toolCall.name}</span>
        {isPending && (
          <svg className="w-4 h-4 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
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
        )}
      </div>

      <div className="mt-2 rounded-md bg-surface-tertiary px-3 py-2 font-mono text-xs text-text-secondary overflow-x-auto">
        <pre className="whitespace-pre-wrap">{JSON.stringify(toolCall.input, null, 2)}</pre>
      </div>

      {toolCall.status === "finished" && toolCall.output !== null && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setResultOpen((o) => !o)}
            className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <ChevronIcon open={resultOpen} />
            Result
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              resultOpen ? "max-h-60 opacity-100 mt-2" : "max-h-0 opacity-0"
            }`}
          >
            <FormattedResult content={toolCall.output} />
          </div>
        </div>
      )}
    </div>
  );
}
