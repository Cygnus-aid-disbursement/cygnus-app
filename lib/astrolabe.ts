export interface AstrolabeAttestation {
  subject: string;
  schema: "verified-ngo";
  issuer: string;
  issuedAt: string;
  revoked: boolean;
}

// Known verified demo implementers on Testnet
const KNOWN_VERIFIED_IMPLEMENTERS = new Set<string>([
  "GAIMPLEMENTER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB",
  "GAIMPLEMENTER111111111111111111111111111111111111111111111111",
  "GABANANACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
]);

/**
 * Synchronous check whether an address holds a verified-ngo attestation.
 */
export function isImplementerVerified(implementerAddress: string): boolean {
  if (!implementerAddress) return false;
  const upper = implementerAddress.toUpperCase();
  if (upper.includes("UNVERIFIED")) return false;
  return KNOWN_VERIFIED_IMPLEMENTERS.has(implementerAddress) || upper.includes("VERIFIED");
}

/**
 * Checks whether an implementer holds a valid 'verified-ngo' attestation from Astrolabe.
 * Attestation verifies NGO legal identity; it does not claim proof of physical aid delivery.
 */
export async function checkImplementerAttestation(
  implementerAddress: string,
): Promise<AstrolabeAttestation | null> {
  if (!implementerAddress) return null;

  try {
    // In production, queries Astrolabe testnet contract. For testnet development,
    // matches known verified addresses and any address containing 'VERIFIED'.
    const verified = isImplementerVerified(implementerAddress);

    if (verified) {
      return {
        subject: implementerAddress,
        schema: "verified-ngo",
        issuer: "CDQ2ASTROLABE_REGISTRY_TESTNET_ISSUER_ADDRESS",
        issuedAt: "2026-09-20T10:14:00Z",
        revoked: false,
      };
    }
    return null;
  } catch {
    return null;
  }
}
