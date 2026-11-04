import { describe, expect, it } from "vitest";
import { cn } from "../lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "py-1", true && "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves tailwind conflicts correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});
