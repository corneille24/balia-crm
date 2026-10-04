// ===========================================================================
// §9 Smart consultant matching — rank internal consultants against an
// opportunity/project by expertise, service & country coverage, language,
// availability and current workload. Pure + testable; reads existing user
// (consultant) profiles from Team & Access.
// ===========================================================================
import { SERVICES } from '@/data/catalog';
import type { AppState } from '@/store';
import type { User } from '@/data/seed';

export interface MatchCriteria {
  serviceCategory?: string; serviceName?: string; country?: string; languages?: string[]; keywords?: string[];
}
export interface ConsultantMatch { userId: string; name: string; score: number; available: string; reasons: string[] }

const has = (arr: unknown, v: string) => Array.isArray(arr) && (arr as string[]).some((x) => x?.toLowerCase().includes(v.toLowerCase()));
const overlaps = (arr: unknown, kws: string[]) => Array.isArray(arr) && (arr as string[]).some((x) => kws.some((k) => x?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(x?.toLowerCase())));

const AVAIL_SCORE: Record<string, number> = { Available: 10, 'Partially Available': 6, 'Fully Allocated': 2, Overallocated: 0, 'On Leave': 0 };

function activeProjects(userId: string, state: AppState): number {
  return state.projects.filter((p) => p.status !== 'Completed' && (p.manager === userId || (p.consultants || []).includes(userId))).length;
}

export function matchConsultants(criteria: MatchCriteria, state: AppState): ConsultantMatch[] {
  const consultants = (state.users as User[]).filter((u) => u.isConsultant || u.userType === 'Consultant');
  const kws = criteria.keywords ?? [];
  const load = Math.max(1, ...consultants.map((c) => activeProjects(c.id, state)));

  return consultants.map((c) => {
    const reasons: string[] = [];
    let score = 0;
    // Expertise / specialism (weight 30)
    if (criteria.serviceName && (overlaps(c.expertise, [criteria.serviceName]) || overlaps(c.specialisms, [criteria.serviceName]))) { score += 18; reasons.push(`expertise in ${criteria.serviceName}`); }
    if (kws.length && (overlaps(c.expertise, kws) || overlaps(c.specialisms, kws) || overlaps(c.industries, kws))) { score += 12; reasons.push('relevant domain expertise'); }
    // Service coverage (weight 20)
    if (criteria.serviceCategory && (has(c.coverageServices, criteria.serviceCategory) || has(c.expertise, criteria.serviceCategory))) { score += 20; reasons.push(`covers ${criteria.serviceCategory}`); }
    // Country coverage (weight 20)
    if (criteria.country && (has(c.coverageCountries, criteria.country) || c.country === criteria.country || has(c.coverageRegions, 'CEMAC'))) { score += 20; reasons.push(`coverage in ${criteria.country}`); }
    // Language (weight 15)
    if (criteria.languages?.length && criteria.languages.some((l) => has(c.languages, l))) { score += 15; reasons.push(`speaks ${criteria.languages.filter((l) => has(c.languages, l)).join('/')}`); }
    // Availability (weight 10)
    const avail = c.availability ?? 'Available';
    score += AVAIL_SCORE[avail] ?? 5;
    if ((AVAIL_SCORE[avail] ?? 5) >= 6) reasons.push(avail.toLowerCase());
    // Workload (weight 5) — lighter load scores higher
    const ap = activeProjects(c.id, state);
    score += Math.round(5 * (1 - ap / load));
    if (ap === 0) reasons.push('no active projects');

    return { userId: c.id, name: c.name, score: Math.max(0, Math.min(100, score)), available: avail, reasons };
  }).sort((a, b) => b.score - a.score);
}

// Derive criteria from an opportunity and match.
export function matchForOpportunity(opp: { serviceId?: string; companyId?: string; country?: string }, state: AppState): ConsultantMatch[] {
  const service = SERVICES.find((s) => s.id === opp.serviceId);
  const company = state.companies.find((c) => c.id === opp.companyId);
  const country = opp.country || company?.country;
  const languages = country && ['Cameroon', 'Gabon', 'Chad', 'Central African Republic', 'Republic of Congo'].includes(country) ? ['French', 'English'] : ['English'];
  return matchConsultants({ serviceCategory: service?.category, serviceName: service?.name, country, languages, keywords: service ? [service.category] : [] }, state);
}
