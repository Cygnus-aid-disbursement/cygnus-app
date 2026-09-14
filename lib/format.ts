// Amounts are integer stroops (7 decimals for XLM-family assets). The dashboard
// shows them as a decimal string without ever using floating point.
export function formatStroops(amount: bigint, decimals = 7): string {
  const negative = amount < 0n;
  const abs = negative ? -amount : amount;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  const body = fracStr.length > 0 ? `${whole}.${fracStr}` : `${whole}`;
  return negative ? `-${body}` : body;
}

export function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function hex(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("hex");
}

export function shortHex(buffer: Buffer | Uint8Array): string {
  const h = hex(buffer);
  return `${h.slice(0, 10)}...${h.slice(-6)}`;
}

export function formatTimestamp(seconds: bigint | number): string {
  const ms = Number(seconds) * 1000;
  if (!ms) return "not set";
  return new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}
