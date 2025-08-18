
import React from "react";
import { Routes, Route } from "react-router-dom";
import MarkdownPage from "./_MarkdownPage";

// Import markdown files as raw text
const files = import.meta.glob("./content/*.md", { as: "raw", eager: true }) as Record<string, string>;
const get = (name: string) => files[`./content/${name}.md`];

export default function DocsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MarkdownPage content={get("getting-started")} />} />
      <Route path="/getting-started" element={<MarkdownPage content={get("getting-started")} />} />
      <Route path="/install" element={<MarkdownPage content={get("install")} />} />
      <Route path="/reflex-desktop" element={<MarkdownPage content={get("reflex-desktop")} />} />
      <Route path="/store" element={<MarkdownPage content={get("store")} />} />
      <Route path="/updates" element={<MarkdownPage content={get("updates")} />} />
      <Route path="/parental-controls" element={<MarkdownPage content={get("parental-controls")} />} />
      <Route path="/faq" element={<MarkdownPage content={get("faq")} />} />
    </Routes>
  );
}
