import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RootLoading from "../app/loading";
import ProgrammeDetailLoading from "../app/programmes/[id]/loading";
import RootError from "../app/error";
import ProgrammeDetailError from "../app/programmes/[id]/error";

describe("Loading and Error boundary components", () => {
  describe("RootLoading", () => {
    it("renders loading skeleton with status role and accessible label", () => {
      const html = renderToStaticMarkup(<RootLoading />);
      expect(html).toContain('role="status"');
      expect(html).toContain("Loading aid programmes...");
      expect(html).toContain("animate-pulse");
      expect(html).toContain("Loading aid programmes from Stellar ledger...");
    });
  });

  describe("ProgrammeDetailLoading", () => {
    it("renders programme detail skeleton with status role", () => {
      const html = renderToStaticMarkup(<ProgrammeDetailLoading />);
      expect(html).toContain('role="status"');
      expect(html).toContain("Loading programme details...");
      expect(html).toContain("animate-pulse");
    });
  });

  describe("RootError", () => {
    it("renders error message and retry button", () => {
      const resetFn = vi.fn();
      const error = new Error("Simulated RPC rate limit error");
      const html = renderToStaticMarkup(<RootError error={error} reset={resetFn} />);

      expect(html).toContain("Something went wrong");
      expect(html).toContain("Simulated RPC rate limit error");
      expect(html).toContain("Try again");
      expect(html).toContain("Back to programmes");
    });
  });

  describe("ProgrammeDetailError", () => {
    it("renders programme-specific error with return link", () => {
      const resetFn = vi.fn();
      const error = new Error("Programme #99 not found");
      const html = renderToStaticMarkup(<ProgrammeDetailError error={error} reset={resetFn} />);

      expect(html).toContain("Unable to load programme");
      expect(html).toContain("Programme #99 not found");
      expect(html).toContain("Retry query");
      expect(html).toContain("Return to dashboard");
    });
  });
});
