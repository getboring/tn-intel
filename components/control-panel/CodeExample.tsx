"use client";

import { useState } from "react";

interface CodeExampleProps {
  code: string | object;
  language?: "json" | "bash" | "typescript";
  title?: string;
  collapsible?: boolean;
  maxHeight?: number;
}

export function CodeExample({
  code,
  language = "json",
  title,
  collapsible = false,
  maxHeight = 300,
}: CodeExampleProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [copied, setCopied] = useState(false);

  const codeString =
    typeof code === "object" ? JSON.stringify(code, null, 2) : code;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <span className="text-xs text-zinc-500 uppercase tracking-wide">
            {title || language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      {isExpanded && (
        <div
          className="overflow-auto bg-zinc-950"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          <pre className="p-4 text-sm font-mono text-zinc-300 whitespace-pre">
            {codeString}
          </pre>
        </div>
      )}
    </div>
  );
}
