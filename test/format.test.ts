import { describe, expect, it } from "vitest";
import { formatStroops, formatTimestamp, hex, shortAddress, shortHex } from "../lib/format";

describe("formatStroops", () => {
  it("renders whole and fractional stroops without floating point", () => {
    expect(formatStroops(0n)).toBe("0");
    expect(formatStroops(10_000_000n)).toBe("1");
    expect(formatStroops(12_500_000n)).toBe("1.25");
    expect(formatStroops(1n)).toBe("0.0000001");
    expect(formatStroops(-5_000_000n)).toBe("-0.5");
  });

  it("supports custom decimals", () => {
    expect(formatStroops(1_000n, 2)).toBe("10");
    expect(formatStroops(150n, 2)).toBe("1.5");
  });
});

describe("shortAddress", () => {
  it("truncates long addresses", () => {
    expect(shortAddress("GABCDEFGHIJKLMNOP")).toBe("GABCDE...MNOP");
  });

  it("returns short addresses as-is", () => {
    expect(shortAddress("GABC123")).toBe("GABC123");
  });
});

describe("hex and shortHex", () => {
  it("encodes Uint8Array or Buffer to hex string", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(hex(bytes)).toBe("deadbeef");
  });

  it("truncates long hex strings", () => {
    const bytes = new Uint8Array(32).fill(0xab);
    const result = shortHex(bytes);
    expect(result).toBe("ababababab...ababab");
  });
});

describe("formatTimestamp", () => {
  it("formats epoch seconds to readable UTC string", () => {
    // 1700000000 -> 2023-11-14T22:13:20.000Z -> "2023-11-14 22:13 UTC"
    expect(formatTimestamp(1700000000n)).toBe("2023-11-14 22:13 UTC");
    expect(formatTimestamp(1700000000)).toBe("2023-11-14 22:13 UTC");
  });

  it("returns 'not set' for zero or falsey timestamp", () => {
    expect(formatTimestamp(0n)).toBe("not set");
    expect(formatTimestamp(0)).toBe("not set");
  });
});
