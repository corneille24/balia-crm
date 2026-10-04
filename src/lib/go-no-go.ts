// ===========================================================================
// §6 Go/No-Go bid assessment — scores an opportunity against qualification
// criteria and produces a recommendation: GO, GO WITH PARTNER,
// GO — CONSORTIUM, WATCH or NO-GO. Pure + testable.
// ===========================================================================
export interface GoNoGoCriterion { key: string; label: string; weight: number }
export const GO_NO_GO_CRITERIA: GoNoGoCriterion[] = [
  { key: 'strategicFit', label: 'Strategic fit', weight: 15 },
  { key: 'geographicFit', label: 'Geographic fit', weight: 10 },
  { key: 'clientFit', label: 'Client fit', weight: 10 },
  { key: 'eligibility', label: 'Eligibility', weight: 12 },
  { key: 'experience', label: 'Relevant experience', weight: 10 },
  { key: 'capability', label: 'Technical capability', weight: 10 },
  { key: 'consultants', label: 'Consultants available', weight: 8 },
  { key: 'time', label: 'Time available', weight: 5 },
  { key: 'competition', label: 'Competitive position', weight: 5 },
  { key: 'value', label: 'Contract value', weight: 5 },
  { key: 'profitability', label: 'Profitability', weight: 5 },
  { key: 'winProbability', label: 'Probability of winning', weight: 5 },
];
const TOTAL_WEIGHT = GO_NO_GO_CRITERIA.reduce((s, c) => s + c.weight, 0);

export type GoNoGoDecision = 'GO' | 'GO WITH PARTNER' | 'GO — CONSORTIUM' | 'WATCH' | 'NO-GO';

export interface GoNoGoResult {
  scorePct: number;
  recommendation: GoNoGoDecision;
  tone: 'success' | 'info' | 'warning' | 'danger';
  rationale: string;
}

// scores: each criterion 0..5. requiredPartners: does the bid need partners?
export function assessGoNoGo(scores: Record<string, number>, opts: { requiredPartners?: boolean } = {}): GoNoGoResult {
  const weighted = GO_NO_GO_CRITERIA.reduce((s, c) => s + (Math.max(0, Math.min(5, Number(scores[c.key]) || 0)) / 5) * c.weight, 0);
  const scorePct = Math.round((weighted / TOTAL_WEIGHT) * 100);

  const capability = Number(scores.capability) || 0;
  const consultants = Number(scores.consultants) || 0;
  const eligibility = Number(scores.eligibility) || 0;
  const experience = Number(scores.experience) || 0;

  // Hard blockers
  if (eligibility <= 1) return { scorePct, recommendation: 'NO-GO', tone: 'danger', rationale: 'Eligibility is a blocker — BALIA does not meet the requirements.' };

  if (scorePct < 40) return { scorePct, recommendation: 'NO-GO', tone: 'danger', rationale: `Overall fit is low (${scorePct}%). Not worth pursuing.` };
  if (scorePct < 58) return { scorePct, recommendation: 'WATCH', tone: 'warning', rationale: `Moderate fit (${scorePct}%). Monitor and revisit if the picture improves.` };

  // Strong overall — decide the delivery model.
  const capacityGap = consultants <= 2;
  const capabilityGap = capability <= 2 || experience <= 2;
  if (opts.requiredPartners && (capacityGap && capabilityGap)) return { scorePct, recommendation: 'GO — CONSORTIUM', tone: 'info', rationale: `Strong fit (${scorePct}%) but needs both capacity and capability — pursue as a consortium.` };
  if (opts.requiredPartners || capabilityGap) return { scorePct, recommendation: 'GO WITH PARTNER', tone: 'info', rationale: `Strong fit (${scorePct}%); bring in a partner to cover a capability or requirement gap.` };
  if (capacityGap) return { scorePct, recommendation: 'GO WITH PARTNER', tone: 'info', rationale: `Strong fit (${scorePct}%) but limited internal capacity — add a delivery partner.` };
  return { scorePct, recommendation: 'GO', tone: 'success', rationale: `Strong fit (${scorePct}%) and BALIA can deliver in-house.` };
}
