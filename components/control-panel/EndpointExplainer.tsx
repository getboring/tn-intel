"use client";

import { useState } from "react";
import { ApiEndpoint } from "@/lib/data-sources";
import { CodeExample } from "./CodeExample";

interface EndpointExplainerProps {
  endpoint: ApiEndpoint;
  baseUrl: string;
  index: number;
}

export function EndpointExplainer({
  endpoint,
  baseUrl,
  index,
}: EndpointExplainerProps) {
  const [showResponse, setShowResponse] = useState(false);

  const methodColors: Record<string, string> = {
    GET: "bg-emerald-950 text-emerald-400 border-emerald-900",
    POST: "bg-blue-950 text-blue-400 border-blue-900",
    PUT: "bg-amber-950 text-amber-400 border-amber-900",
    DELETE: "bg-red-950 text-red-400 border-red-900",
  };

  return (
    <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-zinc-600 font-mono text-sm">{index}.</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono border ${
                methodColors[endpoint.method] || methodColors.GET
              }`}
            >
              {endpoint.method}
            </span>
            <code className="text-sm text-zinc-300 font-mono">
              {endpoint.path}
            </code>
          </div>
          <p className="text-zinc-400 text-sm mt-2">{endpoint.purpose}</p>
        </div>
      </div>

      {/* Description */}
      <div className="ml-6 space-y-3">
        <p className="text-zinc-500 text-sm">{endpoint.description}</p>

        {/* Parameters */}
        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">
              Parameters
            </p>
            <div className="space-y-1">
              {endpoint.parameters.map((param) => (
                <div
                  key={param.name}
                  className="flex items-start gap-2 text-sm"
                >
                  <code className="text-amber-400 font-mono text-xs bg-amber-950/30 px-1.5 py-0.5 rounded">
                    {param.name}
                  </code>
                  <span className="text-zinc-600">({param.type})</span>
                  <span className="text-zinc-500">{param.description}</span>
                  {param.required && (
                    <span className="text-red-400 text-xs">required</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example URL */}
        {endpoint.example && (
          <div>
            <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">
              Example Request
            </p>
            <CodeExample
              code={endpoint.example}
              language="bash"
              title="URL"
              maxHeight={100}
            />
          </div>
        )}

        {/* Example Response */}
        {endpoint.exampleResponse && (
          <div>
            <button
              onClick={() => setShowResponse(!showResponse)}
              className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wide hover:text-zinc-200 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${
                  showResponse ? "rotate-90" : ""
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
              Example Response
            </button>
            {showResponse && (
              <div className="mt-2">
                <CodeExample
                  code={endpoint.exampleResponse}
                  language="json"
                  title="Response"
                  maxHeight={200}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
