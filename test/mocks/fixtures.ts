import { Buffer } from "buffer";
import type {
  Programme,
  DisbursementBatch,
  Milestone,
  MilestoneState,
  ApproverConfig,
} from "@cygnus-aid-disbursement/sdk";

export function createMockMilestone(overrides?: Partial<Milestone>): Milestone {
  return {
    amount: 50_000_0000000n,
    description_hash: Buffer.alloc(32, 1),
    due_by: 1800000000n,
    ...overrides,
  };
}

export function createMockMilestoneState(overrides?: Partial<MilestoneState>): MilestoneState {
  return {
    status: { tag: "Approved", values: undefined },
    evidence_hash: Buffer.alloc(32, 2),
    reason_hash: undefined,
    claimed_at: 1750000000n,
    claimed_late: false,
    ...overrides,
  };
}

export function createMockApprover(approver?: string): ApproverConfig {
  return {
    tag: "Single",
    values: [approver ?? "GAAPPROVER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB"],
  };
}

export function createMockProgramme(overrides?: Partial<Programme>): Programme {
  const defaultMilestones = [createMockMilestone()];
  const defaultStates = [createMockMilestoneState()];

  return {
    id: 0n,
    sponsor: "GASPOPNSOR1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB",
    implementer: "GAIMPLEMENTER1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890AB",
    asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    total: 100_000_0000000n,
    funded: 100_000_0000000n,
    released: 50_000_0000000n,
    disbursed: 25_000_0000000n,
    created_at: 1740000000n,
    end_by: 1850000000n,
    status: { tag: "Active", values: undefined },
    approver: createMockApprover(),
    metadata_hash: Buffer.alloc(32, 0xaa),
    batch_count: 1,
    milestones: defaultMilestones,
    milestone_states: defaultStates,
    ...overrides,
  };
}

export function createMockBatch(overrides?: Partial<DisbursementBatch>): DisbursementBatch {
  return {
    index: 0,
    disbursed_at: 1750100000n,
    root: Buffer.alloc(32, 0xbb),
    total: 25_000_0000000n,
    count: 100,
    ...overrides,
  };
}
