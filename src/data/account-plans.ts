// ===========================================================================
// §4 Strategic Account Management — account plans for important clients and
// prospects. Stored fields are the strategic/qualitative ones; commercial
// facts (current services, projects, contracts, cross-sell, health) are
// derived live from existing records, not duplicated here.
// ===========================================================================
const d = (s: string) => s;

export const STRATEGIC_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export const EXPANSION_LEVELS = ['High', 'Medium', 'Low'] as const;
export const ACCOUNT_PLAN_STATUSES = ['Active', 'Developing', 'Monitor', 'Dormant'] as const;

export interface AccountPlan {
  id: string;
  companyId: string;
  owner: string;
  strategicPriority: string;
  status: string;
  relationshipStrength: number; // 0-100
  objectives: string;
  challenges: string;
  competitors: string;
  estimatedAnnualValue: number;
  currency: string;
  expansionPotential: string;
  relationshipRisks: string;
  nextAction: string;
  nextReview: string;
  notes: string;
  created: string;
}

export const ACCOUNT_PLANS: AccountPlan[] = [
  {
    id: 'ACP-01', companyId: 'CMP-EX1', owner: 'USR-01', strategicPriority: 'Critical', status: 'Active',
    relationshipStrength: 82, currency: 'XAF', estimatedAnnualValue: 24000000, expansionPotential: 'High',
    objectives: 'Become Telcar\u2019s standing EUDR & export-compliance adviser; extend from the readiness project into an ongoing retainer and staff training.',
    challenges: 'Multiple EU buyers with differing due-diligence demands; smallholder traceability at scale.',
    competitors: 'In-house sustainability team; global certification bodies.',
    relationshipRisks: 'Key-person dependency on the founder; buyer pressure could pull work to a larger firm.',
    nextAction: 'Present the milestone-2 findings and propose a 12-month compliance retainer.',
    nextReview: d('2026-10-05'), notes: 'Flagship account and reference client for EUDR work in cocoa.', created: d('2026-05-12'),
  },
  {
    id: 'ACP-02', companyId: 'CMP-EX2', owner: 'USR-02', strategicPriority: 'High', status: 'Active',
    relationshipStrength: 70, currency: 'XAF', estimatedAnnualValue: 18000000, expansionPotential: 'High',
    objectives: 'Grow the export-compliance retainer into EUDR (cocoa arm) and market-intelligence work; leverage the GICAM leadership tie for referrals.',
    challenges: 'Group runs its own programmes; NGO scrutiny requires careful positioning.',
    competitors: 'Compagnie Fruitière group functions.',
    relationshipRisks: 'Reputational sensitivity; decisions may sit with the French parent.',
    nextAction: 'Scope an EUDR add-on for the cocoa line at the next monthly clinic.',
    nextReview: d('2026-10-10'), notes: 'Largest private employer; strong network value via GICAM.', created: d('2026-06-20'),
  },
  {
    id: 'ACP-03', companyId: 'CMP-EX3', owner: 'USR-02', strategicPriority: 'High', status: 'Developing',
    relationshipStrength: 48, currency: 'XAF', estimatedAnnualValue: 20000000, expansionPotential: 'Medium',
    objectives: 'Convert the customs review + training proposal, then establish a corridor-advisory relationship across CEMAC operations.',
    challenges: 'Large in-house team may absorb the work; long procurement cycle.',
    competitors: 'Internal team; Big-4 advisory.',
    relationshipRisks: 'Decision may stall; needs an internal champion.',
    nextAction: 'Follow up on the proposal and secure a decision date.',
    nextReview: d('2026-09-25'), notes: 'Strategic logistics account and potential delivery partner for corridor work.', created: d('2026-08-01'),
  },
];
