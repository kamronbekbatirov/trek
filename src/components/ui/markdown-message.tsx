"use client";

import React from "react";

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  blocks.forEach((block, bi) => {
    if (!block.trim()) return;

    const lines = block.split("\n");

    // Heading
    const hMatch = lines[0].match(/^#{1,3}\s+(.+)/);
    if (hMatch) {
      elements.push(
        <p key={bi} className="font-semibold text-sm mt-1">{parseInline(hMatch[1])}</p>
      );
      return;
    }

    // List block: every line starts with - • * or digit.
    const isListBlock = lines.every((l) => /^[-•*]\s|^\d+\.\s/.test(l.trim()));
    if (isListBlock) {
      elements.push(
        <ul key={bi} className="space-y-0.5 pl-1">
          {lines.map((line, li) => (
            <li key={li} className="text-sm leading-relaxed flex gap-1.5 items-start">
              <span className="mt-2 w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />
              <span>{parseInline(line.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, ""))}</span>
            </li>
          ))}
        </ul>
      );
      return;
    }

    // Mixed block — render line by line, list items inline
    const lineElements: React.ReactNode[] = [];
    let pendingList: string[] = [];

    const flushList = (key: string) => {
      if (pendingList.length === 0) return;
      lineElements.push(
        <ul key={key} className="space-y-0.5 pl-1 my-0.5">
          {pendingList.map((item, li) => (
            <li key={li} className="text-sm leading-relaxed flex gap-1.5 items-start">
              <span className="mt-2 w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      pendingList = [];
    };

    lines.forEach((line, li) => {
      if (/^[-•*]\s|^\d+\.\s/.test(line.trim())) {
        pendingList.push(line.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, ""));
      } else {
        flushList(`l-${bi}-${li}`);
        if (line.trim()) {
          lineElements.push(
            <span key={li} className="block text-sm leading-relaxed">{parseInline(line)}</span>
          );
        }
      }
    });
    flushList(`l-${bi}-end`);

    elements.push(<div key={bi}>{lineElements}</div>);
  });

  return <div className="space-y-1.5">{elements}</div>;
}
