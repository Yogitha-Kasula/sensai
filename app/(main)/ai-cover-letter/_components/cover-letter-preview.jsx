"use client";

import React from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CoverLetterPreview({ initialContent }) {
  const [content, setContent] = React.useState(initialContent);

  return (
    <div className="py-4">
      <div data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={setContent}
          height={700}
          preview="edit"
        />
      </div>
    </div>
  );
}
