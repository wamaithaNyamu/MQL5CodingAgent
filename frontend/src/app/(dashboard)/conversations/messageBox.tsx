import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, task lists, etc.)
import rehypeHighlight from 'rehype-highlight'; // For syntax highlighting in code blocks
import 'highlight.js/styles/github.css'; // Or any other Highlight.js theme you prefer (e.g., 'atom-one-dark.css', 'xcode.css')


const renderMessageContent = (content: string) => {
    // Attempt to parse as JSON first
    try {
        const parsed = JSON.parse(content);

        // If it's a parsed object and has a 'response' field (likely from LLM output)
        if (typeof parsed === 'object' && parsed !== null && 'response' in parsed) {
            // Check if 'response' is a string. If so, render it as Markdown.
            if (typeof parsed.response === 'string') {
                 // Explicitly check if 'code' arg is null and if so, return null
                // This is a specific check based on your prior request for ConfirmInline
                // You might need to adjust where this null check truly belongs
                // depending on if 'parsed' always represents toolData or just assistant messages.
                // For a generic message renderer, this specific check might be too narrow.
                // However, assuming 'parsed' could be the `toolData` object sent to UI.
                if (parsed.args && 'code' in parsed.args && parsed.args.code === null) {
                    return null; // Don't render if the code argument is explicitly null
                }

                return (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        // Optional: customize how code blocks are rendered
                        components={{
                            code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <pre className="overflow-x-auto text-sm">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                ) : (
                                    <code className="bg-gray-100 px-1 text-sm rounded" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            // You can add other custom components for p, a, h1, etc. if needed
                        }}
                    >
                        {parsed.response}
                    </ReactMarkdown>
                );
            }
            // If 'response' exists but isn't a string, or if other fields are present,
            // render the whole parsed JSON nicely.
            return (
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(parsed, null, 2)}
                </pre>
            );
        }

        // If it's a valid JSON (e.g., an array, or an object without 'response' field),
        // render it as nicely formatted JSON.
        return (
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(parsed, null, 2)}
            </pre>
        );

    } catch (err) {
        // If parsing fails, it's not JSON, so treat as a plain string and render as Markdown.
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                            <pre className="overflow-x-auto text-sm">
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code className="bg-gray-100 px-1 text-sm rounded" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        );
    }
};


function extractRenderableContent(content: any): string {
  try {
    const tmpMessage = tryParseJsonCodeBlock(content)
    if(tmpMessage !==null){
        content = tmpMessage
    }

    if (typeof content === "string") {
      // Try to parse as JSON in case it's stringified
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        const first = parsed[0];
        if (first?.content) {
          const inner = tryParseJsonCodeBlock(first.content);
          return inner?.response ?? first.content;
        }
      }

      if (typeof parsed === "object" && parsed.response) {
        return parsed.response;
      }

      return content;
    }

    if (Array.isArray(content)) {
      const first = content[0];
      if (first?.content) {
        const inner = tryParseJsonCodeBlock(first.content);
        return inner?.response ?? first.content;
      }
    }

    if (typeof content === "object" && content?.response) {
      return content.response;
    }

    return String(content);
  } catch {
    return String(content);
  }
}

function tryParseJsonCodeBlock(text: string): any {
  try {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
  } catch {
    return null;
  }
  return null;
}

export { renderMessageContent,extractRenderableContent }; // Named export

