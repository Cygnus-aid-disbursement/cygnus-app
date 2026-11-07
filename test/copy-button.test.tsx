import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CopyButton } from "../components/copy-button";

describe("CopyButton component", () => {
  it("renders with default accessible attributes and sr-only label", () => {
    const html = renderToStaticMarkup(
      <CopyButton value="GA7X...SAMPLE" label="Copy sponsor address" />,
    );

    expect(html).toContain('aria-label="Copy sponsor address"');
    expect(html).toContain('title="Copy sponsor address"');
    expect(html).toContain('<span class="sr-only">Copy sponsor address</span>');
    expect(html).toContain("<svg");
  });

  it("applies custom className", () => {
    const html = renderToStaticMarkup(
      <CopyButton value="test-val" className="custom-copy-class" />,
    );

    expect(html).toContain("custom-copy-class");
  });

  it("sets button type to button to prevent form submission", () => {
    const html = renderToStaticMarkup(<CopyButton value="hash-val" />);
    expect(html).toContain('type="button"');
  });
});
