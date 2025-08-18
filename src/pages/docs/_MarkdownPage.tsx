
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DocsLayout from "./DocsLayout";

export default function MarkdownPage({ content }: { content: string }) {
  return (
    <DocsLayout>
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-li:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </DocsLayout>
  );
}
