import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NetworkStatusIndicator, OfflineBanner } from "../components/network-status";

describe("NetworkStatus components", () => {
  describe("NetworkStatusIndicator", () => {
    it("renders online state by default", () => {
      const html = renderToStaticMarkup(<NetworkStatusIndicator forcedOnline={true} />);
      expect(html).toContain("Online");
      expect(html).toContain("bg-emerald-500");
    });

    it("renders offline state with status role and aria-live when offline", () => {
      const html = renderToStaticMarkup(<NetworkStatusIndicator forcedOnline={false} />);
      expect(html).toContain("Offline Mode");
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain("bg-amber-500");
    });
  });

  describe("OfflineBanner", () => {
    it("renders nothing when online", () => {
      const html = renderToStaticMarkup(<OfflineBanner forcedOnline={true} />);
      expect(html).toBe("");
    });

    it("renders warning banner when offline", () => {
      const html = renderToStaticMarkup(<OfflineBanner forcedOnline={false} />);
      expect(html).toContain("Offline Field Mode:");
      expect(html).toContain("Cached records are readable");
      expect(html).toContain('role="status"');
    });
  });
});
