import { describe, it, expect } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { checkImplementerAttestation } from "../lib/astrolabe";
import { AstrolabeBadge } from "../components/astrolabe-badge";

describe("astrolabe module", () => {
  describe("checkImplementerAttestation", () => {
    it("returns attestation for known verified implementer", async () => {
      const known = "GAIMPLEMENTER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB";
      const att = await checkImplementerAttestation(known);
      expect(att).not.toBeNull();
      expect(att?.schema).toBe("verified-ngo");
      expect(att?.revoked).toBe(false);
    });

    it("returns attestation for testnet addresses containing VERIFIED", async () => {
      const addr = "GA_VERIFIED_NGO_ADDRESS_TESTNET_12345";
      const att = await checkImplementerAttestation(addr);
      expect(att).not.toBeNull();
      expect(att?.schema).toBe("verified-ngo");
    });

    it("returns null for unverified address", async () => {
      const addr = "GA_RANDOM_UNVERIFIED_ADDRESS";
      const att = await checkImplementerAttestation(addr);
      expect(att).toBeNull();
    });

    it("returns null for empty address", async () => {
      expect(await checkImplementerAttestation("")).toBeNull();
    });
  });

  describe("AstrolabeBadge component", () => {
    it("renders with badge text and names Astrolabe trust source", () => {
      const html = renderToStaticMarkup(<AstrolabeBadge source="Astrolabe Schema Registry" />);
      expect(html).toContain("Verified NGO");
      expect(html).toContain("Astrolabe Schema Registry");
    });

    it("contains honest ledger disclaimer in title and aria-label", () => {
      const html = renderToStaticMarkup(<AstrolabeBadge />);
      expect(html).toContain(
        "Confirms organization identity; does not represent on-chain proof of physical aid delivery.",
      );
      expect(html).toContain(
        "Blockchain records funds movement under protocol rules, not physical delivery of aid.",
      );
    });
  });
});
