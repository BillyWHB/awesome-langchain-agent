import { useStream } from "@langchain/react";
import { AIMessage, HumanMessage } from "langchain";
import { useEffect, useRef, useState } from "react";
import {
    ChatContainer,
    AIBubble,
    HumanBubble,
    ChatInput,
    TypingIndicator,
    PresetPrompts,
    Markdown,
    ToolCallCard,
    ThinkingBubble
} from "../components/playground";
import type { HITLRequest, HITLResponse } from "langchain";
import { ApprovalCard } from "../components/hitlCards/ApprovalCard";



const AGENT_URL = "http://localhost:2024";

const PRESETS = [
    "What's the weather like in San Francisco?",
    "What is (25 * 4) + 130 / 2?",
    "Search for LangChain documentation",
    "Send an email to team@acme.com with subject 'Q4 Results' saying revenue grew 15% this quarter",
    "A farmer has 100 feet of fencing. What dimensions of a rectangular pen maximize the enclosed area, and what is that area?"
];

export default function Chat() {
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);


    const stream = useStream({
        apiUrl: AGENT_URL,
        assistantId: "weather",
        threadId,
        onThreadId: setThreadId,
    });
    const { messages, isLoading, interrupt } = stream;


    const handleSubmit = (text: string) => {
        stream.submit({ messages: [{ type: "human" as const, content: text }] });
        // console.log("messages", stream.messages.length, stream.messages.map(m => m.getType()));
    };
    const bottomRef = useRef<HTMLDivElement>(null);

    /**
     * HITL methods
     */
    const hitlRequest = interrupt?.value as HITLRequest | undefined;
    const actionRequests = hitlRequest?.actionRequests ?? [];
    const reviewConfigs = hitlRequest?.reviewConfigs ?? [];

    const handleApprove = async () => {
        if (!hitlRequest) return;
        setIsProcessing(true);
        try {
            const resume: HITLResponse = {
                decisions: actionRequests.map(() => ({
                    type: "approve",
                })),
            };
            await stream.respond(resume);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (index: number, reason: string) => {
        if (!hitlRequest) return;
        setIsProcessing(true);
        try {
            const resume: HITLResponse = {
                decisions: actionRequests.map((_, i) =>
                    i === index
                        ? { type: "reject" as const, message: reason || "User rejected" }
                        : { type: "reject" as const, message: "Rejected along with other actions" },
                ),
            };
            await stream.respond(resume);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = async (index: number, editedArgs: Record<string, unknown>) => {
        if (!hitlRequest) return;
        setIsProcessing(true);
        try {
            const originalAction = actionRequests[index];
            const resume: HITLResponse = {
                decisions: actionRequests.map((_, i) =>
                    i === index
                        ? {
                            type: "edit" as const,
                            editedAction: { name: originalAction.name, args: editedArgs },
                        }
                        : { type: "approve" as const },
                ),
            };
            await stream.respond(resume);
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <ChatContainer
            input={
                <ChatInput
                    onSubmit={handleSubmit}
                    disabled={isLoading}
                    onNewThread={messages.length > 0 ? () => setThreadId(null) : undefined}
                />
            }
        >
            {messages.length === 0 && <PresetPrompts prompts={PRESETS} onSelect={handleSubmit} />}

            {messages.map((msg, i) => {
                if (HumanMessage.isInstance(msg)) {
                    return (
                        <HumanBubble key={msg.id ?? i}>
                            <Markdown>{msg.text}</Markdown>
                        </HumanBubble>
                    );
                };


                if (AIMessage.isInstance(msg)) {
                    const reasoningBlocks = msg.contentBlocks
                        .filter((b) => b.type === "reasoning")
                        .map((b) => b.reasoning)
                        .join("");
                    const textBlocks = msg.contentBlocks.filter((b) => b.type === "text");

                    return (
                        <div key={msg.id ?? i} className="space-y-2">
                            {reasoningBlocks.length > 0 && (
                                <ThinkingBubble
                                    key={`${msg.id}-thinking`}
                                    content={reasoningBlocks}
                                    isStreaming={stream.isLoading && i === stream.messages.length - 1}
                                />
                            )}
                            {textBlocks.length > 0 && (
                                <AIBubble key={`${msg.id}-text`}>
                                    <Markdown>{textBlocks.map(({ text }) => text).join("")}</Markdown>
                                </AIBubble>
                            )}
                            {stream.toolCalls
                                .filter((tc) => msg.tool_calls?.find((t) => t.id === tc.callId))
                                .map((tc) => (
                                    <div key={tc.callId} className="pl-9 max-w-[80%]">
                                        <ToolCallCard toolCall={tc} />
                                    </div>
                                ))}
                        </div>
                    );
                }

                return null;
            })}

            {isLoading && !hitlRequest && <TypingIndicator />}

            {hitlRequest && actionRequests.length > 0 && !isProcessing && (
                <div className="pl-9 max-w-[80%]">
                    {actionRequests.map((actionRequest, idx) => (
                        <ApprovalCard
                            key={idx}
                            actionRequest={actionRequest}
                            reviewConfig={reviewConfigs[idx]}
                            onApprove={() => handleApprove()}
                            onReject={(reason) => handleReject(idx, reason)}
                            onEdit={(editedArgs) => handleEdit(idx, editedArgs)}
                            isProcessing={isProcessing}
                        />
                    ))}
                </div>
            )}
            <div ref={bottomRef} />
        </ChatContainer>
    );
}