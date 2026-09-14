import { describe, expect, it } from "vitest";
import { formatStroops, shortAddress } from "../lib/format";
import { progress } from "../lib/enums";

describe("formatStroops", () => {
  it("renders whole and fractional stroops without floating point", () => {
    expect(formatStroops(0n)).toBe("0");
    expect(formatStroops(10_000_000n)).toBe("1");
    expect(formatStroops(12_500_000n)).toBe("1.25");
    expect(formatStroops(1n)).toBe("0.0000001");
    expect(formatStroops(-5_000_000n)).toBe("-0.5");
  });
});

describe("shortAddress", () => {
  it("truncates long addresses", () => {
    expect(shortAddress("GABCDEFGHIJKLMNOP")).toBe("GABCDE...MNOP");
  });
});

describe("progress", () => {
  it("clamps to a percentage", () => {
    expect(progress(0n, 100n)).toBe(0);
    expect(progress(50n, 100n)).toBe(50);
    expect(progress(200n, 100n)).toBe(100);
    expect(progress(1n, 0n)).toBe(0);
  });
});
