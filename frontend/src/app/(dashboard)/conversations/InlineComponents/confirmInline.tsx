'use client';

import React, { memo, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/stackoverflow-light.css";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useChatStore } from '@/stores/chatStore';

type ConfirmInlineProps = {
  sessionId: string;
  data: {
    args?: Record<string, unknown>;
    tool?: string;
  } | null;
  confirming: boolean;
  confirmed: boolean;
  rejected: boolean;
  onConfirm: () => void;
  onReject: () => void;
};

const ConfirmInline = memo(({ sessionId, data, confirming, confirmed, rejected, onConfirm, onReject }: ConfirmInlineProps) => {
  const { args, tool } = data || {};

  const setBotName = useChatStore(state => state.setBotName);
  const currentBotNameInStore = useChatStore(state => state.botNamesBySession[sessionId]);

  // If 'code' arg is explicitly null, don't render the component at all.
  if (args && 'code' in args && args.code === null) {
    console.log("ConfirmInline: 'code' argument is explicitly null. Not rendering ConfirmInline.");
    return null;
  }

  const countWords = (str: string): number => {
    return str.split(/\s+/).filter(word => word.length > 0).length;
  };

  useEffect(() => {
    let extractedBotName: string | undefined;

    if (args) {
      if (typeof args.documentName === 'string') {
        extractedBotName = args.documentName;
      } else if (typeof args.botName === 'string') {
        extractedBotName = args.botName;
      }
    }

    if (extractedBotName && extractedBotName !== currentBotNameInStore) {
      console.log(`ConfirmInline useEffect: Setting botName "${extractedBotName}" for session "${sessionId}"`);
      setBotName(sessionId, extractedBotName);
    } else if (!extractedBotName) {
      console.warn(
        `ConfirmInline useEffect: No 'documentName' or 'botName' found in tool arguments for session "${sessionId}". ` +
        `Bot name will not be set/updated from these args. Args:`, args
      );
    }
  }, [args, sessionId, setBotName, currentBotNameInStore]);

  const renderArgs = () => {
    if (!args) return null;

    // Filter out arguments where the value is null, undefined, or the string "null" or "undefined"
    const filteredArgs = Object.entries(args).filter(([, value]) => {
      if (value === null || typeof value === 'undefined') {
        return false;
      }
      if (typeof value === 'string') {
        const lowerCaseValue = value.toLowerCase();
        if (lowerCaseValue === 'null' || lowerCaseValue === 'undefined') {
          return false;
        }
      }
      return true;
    });

    if (filteredArgs.length === 0) {
      return <div className="text-sm text-muted-foreground">No arguments to display.</div>;
    }

    return (
      <div className="w-full max-w-3xl mx-auto my-code-block">
        <div className="p-6 space-y-6">
          {filteredArgs.map(([key, value]) => {
            const displayValue = typeof value === "string" ? value : JSON.stringify(value, null, 2);
            const isLongText = typeof value === "string" && countWords(value) > 14;

            return (
              <div key={key} className="flex flex-col space-y-2">
                <Label htmlFor={key} className="capitalize font-semibold">
                  {key}
                </Label>

                {key === "code" ? (
                  <div className="overflow-x-auto my-code-block">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const isInline = (props as any).inline;
                          return isInline ? (
                            <code className="bg-gray-100 px-1">{children}</code>
                          ) : (
                            <pre className="overflow-x-auto text-sm w-full">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {`~~~c++\n${value}\n~~~`}
                    </ReactMarkdown>
                  </div>
                ) : (
                  isLongText ? (
                    <Textarea
                      id={key}
                      name={key}
                      value={displayValue}
                      readOnly
                      className="min-h-[60px]"
                    />
                  ) : (
                    <Input
                      id={key}
                      name={key}
                      value={displayValue}
                      readOnly
                    />
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleConfirmAction = () => {
    onConfirm();
  };

  return (
    <div className="mt-6 w-full border rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md">
      <div>
        {confirming ? (
          <>
            <div className="text-sm text-muted-foreground space-y-2">
              <div>
                <strong className="text-blue-600">Tool:</strong> {tool ?? 'Unknown'}
              </div>
              {renderArgs()}
            </div>
            <div className="mt-3 text-green-600 dark:text-green-400 font-medium">
              Running {tool}...
            </div>
          </>
        ) : (
          <>
            <div className="text-muted-foreground space-y-2">
              {(!confirmed && !rejected) ?
                <div>
                  Agent is ready to run the tool: <strong>{tool ?? 'Unknown'}</strong>
                </div>
                :
                <div>
                  Agent ran the tool: <strong>{tool ?? 'Unknown'}</strong>
                </div>
              }

              {renderArgs()}
            </div>

            {!confirmed && !rejected ? <>
              <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
                <div className="text-sm text-muted-foreground/70">
                  Please confirm to proceed.
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={onReject}
                    variant="destructive"
                    className="text-white"
                    aria-label={`Reject running ${tool}`}
                  >
                    {confirming ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={handleConfirmAction}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    aria-label={`Confirm running ${tool}`}
                  >
                    {confirming ? "Confirming..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </> :
              confirmed ? (
                <div className="text-sm text-green-600">
                  User confirmed the tool run
                </div>
              ) : <div className="text-sm text-red-600">
                User rejected the tool run
              </div>
            }
          </>
        )}
      </div>
    </div>
  );
});

ConfirmInline.displayName = 'ConfirmInline';

export default ConfirmInline;