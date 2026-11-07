import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatCygnusEvent, type FormattedEvent } from "../lib/events";
import { EventTimeline } from "../components/event-timeline";
import type { CygnusEvent } from "@cygnus-aid-disbursement/sdk";

describe("events module", () => {
  const dummyAddress1 = "GASPONSOR111111111111111111111111111111111111111111111111";
  const dummyAddress2 = "GAIMPLEMENTER11111111111111111111111111111111111111111111";

  describe("formatCygnusEvent", () => {
    it("formats ProgrammeCreated event with budget and addresses", () => {
      const event: CygnusEvent = {
        type: "ProgrammeCreated",
        programmeId: 1n,
        sponsor: dummyAddress1,
        implementer: dummyAddress2,
        total: 100_0000000n,
      };

      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("ProgrammeCreated");
      expect(formatted.programmeId).toBe("1");
      expect(formatted.title).toBe("Programme created");
      expect(formatted.details?.Budget).toBe("100");
      expect(formatted.copyValues?.Sponsor).toBe(dummyAddress1);
    });

    it("formats ProgrammeFunded event", () => {
      const event: CygnusEvent = {
        type: "ProgrammeFunded",
        programmeId: 1n,
        amount: 50_0000000n,
      };

      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("ProgrammeFunded");
      expect(formatted.details?.Amount).toBe("50");
    });

    it("formats MilestoneClaimed event (on time vs late)", () => {
      const onTime: CygnusEvent = {
        type: "MilestoneClaimed",
        programmeId: 1n,
        milestoneIndex: 0,
        evidenceHash: Buffer.alloc(32, 0x11),
        claimedLate: false,
      };
      const formattedOnTime = formatCygnusEvent(onTime);
      expect(formattedOnTime.badgeTone).toBe("neutral");
      expect(formattedOnTime.details?.Timing).toBe("On time");

      const late: CygnusEvent = {
        type: "MilestoneClaimed",
        programmeId: 1n,
        milestoneIndex: 1,
        evidenceHash: Buffer.alloc(32, 0x22),
        claimedLate: true,
      };
      const formattedLate = formatCygnusEvent(late);
      expect(formattedLate.badgeTone).toBe("warn");
      expect(formattedLate.details?.Timing).toBe("Claimed late");
    });

    it("formats MilestoneApproved event", () => {
      const event: CygnusEvent = {
        type: "MilestoneApproved",
        programmeId: 1n,
        milestoneIndex: 2,
      };
      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("MilestoneApproved");
      expect(formatted.badgeTone).toBe("active");
    });

    it("formats MilestoneRejected event", () => {
      const event: CygnusEvent = {
        type: "MilestoneRejected",
        programmeId: 1n,
        milestoneIndex: 1,
        reasonHash: Buffer.alloc(32, 0x33),
      };
      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("MilestoneRejected");
      expect(formatted.badgeTone).toBe("warn");
      expect(formatted.copyValues?.["Reason hash"]).toBe(Buffer.alloc(32, 0x33).toString("hex"));
    });

    it("formats BatchDisbursed event", () => {
      const event: CygnusEvent = {
        type: "BatchDisbursed",
        programmeId: 1n,
        batchIndex: 0,
        root: Buffer.alloc(32, 0x44),
        total: 20_0000000n,
        count: 50,
      };
      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("BatchDisbursed");
      expect(formatted.details?.Recipients).toBe("50");
      expect(formatted.copyValues?.["Merkle root"]).toBe(Buffer.alloc(32, 0x44).toString("hex"));
    });

    it("formats ProgrammeRefunded event", () => {
      const event: CygnusEvent = {
        type: "ProgrammeRefunded",
        programmeId: 1n,
        amount: 5_0000000n,
      };
      const formatted = formatCygnusEvent(event);
      expect(formatted.type).toBe("ProgrammeRefunded");
      expect(formatted.details?.["Refunded amount"]).toBe("5");
    });
  });

  describe("EventTimeline component", () => {
    it("renders empty state when events list is empty", () => {
      const html = renderToStaticMarkup(<EventTimeline events={[]} />);
      expect(html).toContain("No contract events recorded for this programme yet.");
    });

    it("renders timeline events with badges, titles, descriptions, and copy buttons", () => {
      const dummyEvents: FormattedEvent[] = [
        {
          type: "ProgrammeCreated",
          programmeId: "1",
          title: "Programme created",
          description: "Created with budget of 100.0 XLM",
          details: { Sponsor: "GASPO...1111" },
          copyValues: { Sponsor: dummyAddress1 },
          badgeTone: "active",
        },
      ];

      const html = renderToStaticMarkup(<EventTimeline events={dummyEvents} />);
      expect(html).toContain("Programme created");
      expect(html).toContain("ProgrammeCreated");
      expect(html).toContain("Copy sponsor");
    });
  });
});
