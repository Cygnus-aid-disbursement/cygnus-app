import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DisbursementBuilder } from "../components/disbursement-builder";

describe("DisbursementBuilder component", () => {
  it("renders with PRD design spec link and form inputs", () => {
    const html = renderToStaticMarkup(<DisbursementBuilder busy={false} run={vi.fn()} />);
    expect(html).toContain("Disbursement batch builder");
    expect(html).toContain("Contract PRD Design Spec");
    expect(html).toContain(
      "https://github.com/Cygnus-aid-disbursement/cygnus-contracts/blob/main/docs/design.md",
    );
    expect(html).toContain("batch-programme-id");
    expect(html).toContain("batch-index-input");
    expect(html).toContain("batch-json-input");
    expect(html).toContain("Compute Merkle tree");
  });

  it("disables compute button when busy", () => {
    const html = renderToStaticMarkup(<DisbursementBuilder busy={true} run={vi.fn()} />);
    expect(html).toContain("disabled");
  });
});
