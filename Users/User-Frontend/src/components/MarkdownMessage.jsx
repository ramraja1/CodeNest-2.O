import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders the AI response content, which is formatted in Markdown,
 * into structured HTML elements with Tailwind styling.
 */
export default function MarkdownMessage({ content }) {
  return (
    <ReactMarkdown
      // Enables support for GitHub Flavored Markdown (tables, checkboxes, etc.)
      remarkPlugins={[remarkGfm]}
      
      // Define custom components to apply Tailwind CSS for better styling
      components={{
        // Code Block Styling (```cpp ... ```)
        pre: ({ children }) => (
          <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto my-2 text-sm border border-gray-700">
            {children}
          </pre>
        ),
        // Inline and Block Code Styling
        code: ({ node, inline, className, children, ...props }) => {
          if (inline) {
            // Inline code (`text`)
            return (
              <code className="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded text-xs" {...props}>
                {children}
              </code>
            );
          }
          // Block code (inside <pre>)
          return (
            <code className="block whitespace-pre-wrap text-green-300" {...props}>
              {children}
            </code>
          );
        },
        // Heading Styling (### Heading)
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mt-3 mb-1 border-b border-gray-600 pb-0.5 text-orange-400">
            {children}
          </h3>
        ),
        // List Styling
        ul: ({ children }) => (
            <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2 text-gray-300">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal list-inside mt-1 space-y-0.5 ml-2 text-gray-300">{children}</ol>
        ),
        // Paragraph Styling
        p: ({ children }) => (
            <p className="mb-2 text-gray-200">{children}</p>
        ),
        // Bold Text Styling
        strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}