// ---------------------------------------------------------------------------
// Business Intelligence, Funding & Opportunity Tracker — data model + seed
//
// Self-contained module data. Everything here follows the same conventions as
// src/data/seed.ts (string ISO dates, ID prefixes, in-memory collections that
// can be swapped for a real backend later). Money is XAF-first; USD/EUR/GBP
// remain selectable for funders that denominate in those currencies.
// ---------------------------------------------------------------------------

const d = (s: string) => s;

// ===========================================================================
// Enums / controlled vocabularies
// ===========================================================================

export const FINDING_TYPES = [
  'Funding Opportunity', 'Grant', 'Investment Opportunity', 'Government Program',
  'Tender', 'Procurement Opportunity', 'Partnership Opportunity', 'Business Lead',
  'Market Opportunity', 'Client Opportunity', 'Training Opportunity',
  'Consulting Opportunity', 'Export Opportunity', 'Import Opportunity',
  'Trade Opportunity', 'Regulatory Development', 'Policy Development',
  'Market Intelligence', 'Competitor Intelligence', 'Industry Intelligence',
  'Strategic Partnership', 'Event', 'Networking Opportunity', 'Other',
] as const;
export type FindingType = (typeof FINDING_TYPES)[number];

export const FINDING_CATEGORIES = [
  'Funding', 'Market', 'Partnership', 'Regulatory', 'Client', 'Trade',
  'Export', 'Consulting', 'Training', 'Competitive', 'Policy', 'Other',
] as const;

export const RESEARCH_SOURCE_TYPES = [
  'Government', 'AfCFTA', 'Development organization', 'Embassy', 'Bank',
  'Investment fund', 'NGO', 'Private foundation', 'Corporate foundation',
  'International organization', 'Industry association', 'Website', 'Newsletter',
  'LinkedIn', 'Conference', 'Networking', 'Referral', 'Client', 'Consultant',
  'Internal research', 'Other',
] as const;

export const VERIFICATION_STATUSES = [
  'Verified', 'Needs Verification', 'Expired', 'Changed', 'Withdrawn',
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const STRATEGIC_IMPORTANCE = ['Low', 'Medium', 'High', 'Critical'] as const;
export const CONFIDENCE_LEVELS = ['Unconfirmed', 'Low', 'Medium', 'High', 'Confirmed'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const FINDING_STATUSES = [
  'New', 'Reviewing', 'Action Required', 'In Progress', 'Converted',
  'Monitoring', 'Dormant', 'Archived', 'Dismissed',
] as const;

export const FUNDER_ORG_TYPES = [
  'Development Finance Institution', 'Multilateral', 'Bilateral Donor',
  'Government Agency', 'Foundation', 'Corporate Foundation', 'Impact Investor',
  'Commercial Bank', 'NGO', 'Challenge Fund', 'Accelerator', 'Export Agency',
  'Industry Body', 'Other',
] as const;

export const FUNDER_CATEGORIES = [
  'Grant Maker', 'Concessional Lender', 'Equity Investor', 'Blended Finance',
  'Technical Assistance', 'Challenge Fund', 'Prize', 'Procurement', 'Mixed',
] as const;

export const FUNDING_MECHANISMS = [
  'Grant', 'Loan', 'Equity', 'Technical Assistance', 'Challenge Fund',
  'Accelerator', 'Prize', 'Procurement', 'Partnership', 'Guarantee', 'Other',
] as const;

export const FUNDER_STATUSES = [
  'Prospect', 'Researching', 'Qualified', 'Contacted', 'Relationship Established',
  'Active Opportunity', 'Application Submitted', 'Funded', 'Unsuccessful',
  'Dormant', 'Archived',
] as const;
export type FunderStatus = (typeof FUNDER_STATUSES)[number];

export const OPPORTUNITY_TYPES = [
  'Grant', 'Concessional Loan', 'Equity', 'Challenge Fund', 'Technical Assistance',
  'Accelerator', 'Prize', 'Tender', 'Procurement', 'Blended', 'Partnership',
] as const;

// BALIA opportunity categories — HOW BALIA engages (§2), the primary lens of
// the intelligence engine. Distinct from oppType (the funding mechanism).
export const BALIA_CATEGORIES = [
  'Direct BALIA Funding', 'Consulting Contract', 'Technical Assistance', 'Training Contract',
  'Research Contract', 'Procurement / Tender', 'Framework Agreement', 'Consortium Opportunity',
  'Subcontracting', 'Partnership', 'Client Funding',
] as const;
export type BaliaCategory = (typeof BALIA_CATEGORIES)[number];

// Funding types A–L (§12).
export const FUNDING_TYPES = [
  'Grant', 'Consulting Contract', 'Technical Assistance', 'Training Contract',
  'Research Contract', 'Procurement / Tender', 'Framework Agreement', 'Consortium Opportunity',
  'Subcontracting', 'Partnership', 'Client Funding', 'Investment / Finance',
] as const;

// BALIA eligibility levels (§17).
export const BALIA_ELIGIBILITY = [
  'Directly Eligible', 'Potentially Eligible', 'Eligible with Partner',
  'Eligible as Consortium Member', 'Eligible as Subcontractor', 'Client Opportunity',
  'Not Eligible', 'Unclear',
] as const;
export type BaliaEligibility = (typeof BALIA_ELIGIBILITY)[number];

// Application priority (§23).
export const APPLICATION_PRIORITIES = [
  'Apply Now', 'Develop', 'Watch', 'Partner', 'Client Referral', 'Do Not Pursue',
] as const;
export type ApplicationPriority = (typeof APPLICATION_PRIORITIES)[number];

// URL / source verification status (§15).
export const URL_STATUSES = ['Verified', 'Requires Verification', 'Unverified', 'Broken Link'] as const;
export type UrlStatus = (typeof URL_STATUSES)[number];

// Probability confidence (§19).
export const PROBABILITY_CONFIDENCE = ['High', 'Medium', 'Low'] as const;

export const FUNDING_OPP_STATUSES = [
  'Researching', 'Identified', 'Under Review', 'Qualified', 'Preparing Application',
  'Application in Progress', 'Internal Review', 'Submitted', 'Under Evaluation',
  'Shortlisted', 'Interview/Due Diligence', 'Awarded', 'Contracting', 'Funded',
  'Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'On Hold', 'Archived',
] as const;
export type FundingOppStatus = (typeof FUNDING_OPP_STATUSES)[number];

// The visual pipeline stages (section 4). Condensed operational board.
export const FUNDING_PIPELINE_STAGES = [
  'Funder Identified', 'Opportunity Identified', 'Eligibility Review', 'Qualified',
  'Application Preparation', 'Documents Complete', 'Application Submitted',
  'Evaluation', 'Shortlisted', 'Due Diligence', 'Awarded', 'Contracting',
  'Funded', 'Reporting', 'Completed',
] as const;
export type FundingStage = (typeof FUNDING_PIPELINE_STAGES)[number];

export const APPLICATION_STATUSES = [
  'Not Started', 'Preparing', 'In Progress', 'Internal Review', 'Ready to Submit',
  'Submitted', 'Under Evaluation', 'Shortlisted', 'Due Diligence', 'Awarded',
  'Rejected', 'Withdrawn',
] as const;

export const DOCUMENT_STATUSES = [
  'Missing', 'Requested', 'Received', 'Under Review', 'Approved', 'Rejected', 'Needs Update',
] as const;
export type FundingDocStatus = (typeof DOCUMENT_STATUSES)[number];

export const OUTCOME_TYPES = ['Awarded', 'Rejected', 'Withdrawn', 'Expired', 'Pending'] as const;

// Mandatory application requirement checklist keys (section 6). `mandatory`
// items block 100% completion until done.
export interface RequirementDef { key: string; label: string; mandatory: boolean }
export const APPLICATION_REQUIREMENTS: RequirementDef[] = [
  { key: 'eligibility', label: 'Eligibility confirmed', mandatory: true },
  { key: 'opportunity_reviewed', label: 'Opportunity reviewed', mandatory: true },
  { key: 'form_created', label: 'Application form created', mandatory: true },
  { key: 'org_profile', label: 'Organization profile completed', mandatory: true },
  { key: 'exec_summary', label: 'Executive summary completed', mandatory: true },
  { key: 'business_plan', label: 'Business plan completed', mandatory: false },
  { key: 'project_proposal', label: 'Project proposal completed', mandatory: true },
  { key: 'budget', label: 'Budget completed', mandatory: true },
  { key: 'financials', label: 'Financial documents uploaded', mandatory: true },
  { key: 'registration', label: 'Company registration uploaded', mandatory: true },
  { key: 'tax', label: 'Tax documents uploaded', mandatory: false },
  { key: 'bank', label: 'Bank documents uploaded', mandatory: false },
  { key: 'cvs', label: 'CVs uploaded', mandatory: false },
  { key: 'support_letters', label: 'Supporting letters obtained', mandatory: false },
  { key: 'references', label: 'References obtained', mandatory: false },
  { key: 'reviewed', label: 'Application reviewed', mandatory: true },
  { key: 'approved', label: 'Management approval obtained', mandatory: true },
  { key: 'submitted', label: 'Application submitted', mandatory: true },
];

// Fit-score criteria (section 8), each weighted. Sum of weights = 100.
export interface FitCriterionDef { key: string; label: string; weight: number }
export const FIT_CRITERIA: FitCriterionDef[] = [
  { key: 'geographic', label: 'Geographic eligibility', weight: 14 },
  { key: 'business', label: 'Business eligibility', weight: 12 },
  { key: 'industry', label: 'Industry alignment', weight: 10 },
  { key: 'funding_size', label: 'Funding-size alignment', weight: 8 },
  { key: 'project', label: 'Project alignment', weight: 10 },
  { key: 'company_stage', label: 'Company-stage alignment', weight: 6 },
  { key: 'experience', label: 'Experience requirements', weight: 8 },
  { key: 'partnership', label: 'Partnership requirements', weight: 6 },
  { key: 'financial', label: 'Financial requirements', weight: 8 },
  { key: 'documentation', label: 'Documentation readiness', weight: 6 },
  { key: 'strategic', label: 'Strategic alignment', weight: 8 },
  { key: 'probability', label: 'Probability of success', weight: 4 },
];

// ===========================================================================
// Record interfaces
// ===========================================================================

export interface FunderContact {
  id: string; funderId: string; name: string; position: string;
  email: string; phone: string; linkedin: string; primary: boolean; notes: string;
}

export interface Funder {
  id: string; name: string; orgType: string; category: string;
  country: string; region: string; headquarters: string; website: string;
  generalEmail: string; telephone: string;
  fundingFocus: string; geographicFocus: string[]; industryFocus: string[];
  targetBeneficiaries: string; eligibleBusinessTypes: string[]; eligibleCountries: string[];
  minFunding: number; maxFunding: number; typicalFunding: number; currency: string;
  mechanisms: string[]; applicationMethod: string;
  registrationRequirements: string; eligibilityRequirements: string;
  requiredDocuments: string[]; matchingRequirement: string; coFinancingRequirement: string;
  reportingRequirements: string;
  internalRating: number; // 0-5
  relationshipStatus: string; status: FunderStatus;
  lastContact?: string; nextContact?: string; owner: string;
  notes: string; tags: string[]; created: string; updated: string;
}

export interface FundingOpportunity {
  id: string; name: string; funderId: string; programName: string;
  oppType: string; description: string;
  amount: number; minAmount: number; maxAmount: number; currency: string;
  fundingDuration: string; openingDate: string; deadline: string;
  geographicEligibility: string[]; countryEligibility: string[]; sectorEligibility: string[];
  businessEligibility: string; companyStage: string;
  revenueRequirement: string; employeeRequirement: string; projectRequirement: string;
  matchingFundsRequired: boolean; coFinancingRequired: boolean; matchingPercent: number;
  applicationFee: number; applicationUrl: string; officialSource: string;
  contactPerson: string; contactEmail: string;
  requiredDocuments: string[]; evaluationCriteria: string[];
  priority: string; estimatedValue: number; strategicValue: string;
  probability: number; // 0-100 subjective
  owner: string; team: string[];
  status: FundingOppStatus; stage: FundingStage;
  // fit inputs (0-100 per criterion), and verified-eligibility flags
  fitInputs: Record<string, number>;
  verifiedCriteria: string[]; // keys the team has actually verified
  nextAction: string; nextActionDate: string;
  notes: string; tags: string[]; findingId?: string;
  discovered: string; lastVerified: string; nextVerification: string;
  verificationStatus: VerificationStatus; verifiedBy: string;
  created: string; updated: string;
  // --- BALIA opportunity-intelligence layer (all optional; §17–§32) ---
  baliaCategory?: string;        // BALIA_CATEGORIES — how BALIA engages
  fundingType?: string;          // FUNDING_TYPES A–L
  baliaEligibility?: string;     // BALIA_ELIGIBILITY, with a reason
  eligibilityReason?: string;
  // §18 strategic-fit factor inputs (0-100 each): trade, customs, export,
  // geo, eligibility, revenue, capability, brand, timing
  fitFactors?: Record<string, number>;
  competitiveness?: number;      // §19 estimated BALIA competitiveness 0-100
  competitivenessConfidence?: string; // High | Medium | Low
  competitivenessRationale?: string;
  competition?: string;          // Low | Medium | High
  applicationDifficulty?: string;// Low | Medium | High
  revenuePotential?: number;     // §21 0-100
  clientAdvisoryPotential?: number; // §22 0-100
  historicalSelectionRate?: number; // §20 stored separately if funder publishes
  sourceConfidence?: number;     // §32 0-100
  sourceDomain?: string;
  urlStatus?: string;            // URL_STATUSES
}

export interface FundingRequirementState {
  key: string; done: boolean; at?: string;
}

export interface FundingApplication {
  id: string; opportunityId: string; funderId: string;
  projectTitle: string; projectSummary: string; objectives: string; expectedOutcomes: string;
  deadline: string; owner: string; team: string[];
  startDate: string; submissionDate?: string; decisionDate?: string;
  status: string;
  fundingRequested: number; fundingAwarded: number; currency: string;
  budget: number; coFinancing: number; beneficiaries: string; geographicScope: string;
  requirements: FundingRequirementState[]; // completion checklist
  reviewComments: string; contractStatus: string; reportingRequirements: string;
  finalOutcome: string; notes: string;
  created: string; updated: string;
}

export interface FundingAppDocument {
  id: string; applicationId: string; opportunityId: string;
  name: string; required: boolean; status: FundingDocStatus;
  responsible: string; expiryDate?: string; documentId?: string; notes: string;
}

export interface FundingAction {
  id: string; opportunityId?: string; applicationId?: string;
  name: string; owner: string; startDate: string; dueDate: string;
  status: string; priority: string; dependsOn?: string;
  completion: number; comments: string; created: string;
}

export interface FunderCommunication {
  id: string; funderId: string; opportunityId?: string;
  type: string; date: string; subject: string; summary: string;
  user: string; direction: 'Inbound' | 'Outbound';
}

export interface FundingOutcome {
  id: string; opportunityId: string; applicationId?: string; funderId: string;
  outcome: string; amount: number; currency: string; date: string;
  reason: string; lessonsLearned: string;
}

export interface ResearchSource {
  id: string; name: string; type: string; url: string;
  dateAccessed: string; datePublished?: string; dateVerified?: string;
  researcher: string; reliability: number; notes: string; // reliability 0-5
}

export interface BusinessFinding {
  id: string; title: string; type: FindingType; category: string;
  description: string; detail: string;
  sourceId?: string; source: string; sourceUrl: string; sourceOrg: string;
  discovered: string; lastVerified: string;
  market: string; country: string; region: string; industry: string;
  relatedService?: string; relatedClientId?: string; relatedCompanyId?: string;
  relatedProjectId?: string; relatedFunderId?: string; relatedOpportunityId?: string;
  strategicImportance: string; potentialValue: number; currency: string;
  confidence: string; researcher: string; responsible: string;
  status: string; priority: string; nextAction: string; nextActionDate: string;
  verificationStatus: VerificationStatus; nextVerification: string;
  convertedTo?: { kind: string; id: string }[];
  notes: string; tags: string[]; created: string; updated: string;
}

// ===========================================================================
// Seed data — BALIA-relevant funders active in African trade / AfCFTA space
// ===========================================================================

export const FUNDERS: Funder[] = [
  {
    id: 'FND-01', name: 'African Development Bank — Africa Trade Fund', orgType: 'Development Finance Institution',
    category: 'Grant Maker', country: 'Côte d’Ivoire', region: 'Africa', headquarters: 'Abidjan, Côte d’Ivoire',
    website: 'afdb.org', generalEmail: 'aftra@afdb.org', telephone: '+225 27 20 26 10 20',
    fundingFocus: 'Trade facilitation, AfCFTA implementation, export capacity, trade information systems',
    geographicFocus: ['Africa', 'CEMAC', 'ECOWAS', 'EAC'], industryFocus: ['Trade services', 'Agri-processing', 'Manufacturing', 'Logistics'],
    targetBeneficiaries: 'Trade support institutions, SMEs, consultancies delivering trade capacity',
    eligibleBusinessTypes: ['SME', 'Consultancy', 'Trade body'], eligibleCountries: ['Cameroon', 'Nigeria', 'Ghana', 'Kenya', 'Senegal', 'Côte d’Ivoire'],
    minFunding: 15000000, maxFunding: 300000000, typicalFunding: 90000000, currency: 'XAF',
    mechanisms: ['Grant', 'Technical Assistance'], applicationMethod: 'Online portal + concept note',
    registrationRequirements: 'Legal registration, 2 years of audited accounts', eligibilityRequirements: 'Africa-based, demonstrated trade capacity, co-financing 10%',
    requiredDocuments: ['Company registration', 'Audited financials', 'Concept note', 'Budget', 'Team CVs'],
    matchingRequirement: '10% cash or in-kind', coFinancingRequirement: 'Yes — 10% minimum',
    reportingRequirements: 'Quarterly narrative + financial reports',
    internalRating: 5, relationshipStatus: 'Relationship Established', status: 'Active Opportunity',
    lastContact: d('2026-08-22'), nextContact: d('2026-09-18'), owner: 'USR-01',
    notes: 'Strong AfCFTA alignment. BALIA delivered a corridor study for their Abidjan team in 2025.', tags: ['AfCFTA', 'Trade', 'Priority'],
    created: d('2025-06-10'), updated: d('2026-08-22'),
  },
  {
    id: 'FND-02', name: 'TradeMark Africa', orgType: 'Development organization' as string,
    category: 'Technical Assistance', country: 'Kenya', region: 'Africa', headquarters: 'Nairobi, Kenya',
    website: 'trademarkafrica.com', generalEmail: 'info@trademarkafrica.com', telephone: '+254 20 423 5000',
    fundingFocus: 'Trade costs reduction, standards, export capability, women in trade, digital trade',
    geographicFocus: ['EAC', 'Horn of Africa', 'West Africa'], industryFocus: ['Agriculture', 'Manufacturing', 'Logistics', 'Trade services'],
    targetBeneficiaries: 'Exporters, trade intermediaries, business support organisations',
    eligibleBusinessTypes: ['SME', 'Cooperative', 'Consultancy'], eligibleCountries: ['Kenya', 'Tanzania', 'Rwanda', 'Uganda', 'Ghana'],
    minFunding: 10000000, maxFunding: 120000000, typicalFunding: 45000000, currency: 'XAF',
    mechanisms: ['Grant', 'Technical Assistance', 'Challenge Fund'], applicationMethod: 'Call-based; EOI then full proposal',
    registrationRequirements: 'Registered entity, tax compliance', eligibilityRequirements: 'Operating in target corridors; measurable trade outcomes',
    requiredDocuments: ['Registration', 'Tax clearance', 'Proposal', 'Logframe', 'Budget'],
    matchingRequirement: 'None for TA; 20% for challenge fund', coFinancingRequirement: 'Depends on window',
    reportingRequirements: 'Results-based, milestone reporting',
    internalRating: 4, relationshipStatus: 'Contacted', status: 'Qualified',
    lastContact: d('2026-07-30'), nextContact: d('2026-09-20'), owner: 'USR-05',
    notes: 'Runs periodic challenge funds relevant to AfCFTA readiness work.', tags: ['Trade', 'EAC'],
    created: d('2025-09-02'), updated: d('2026-07-30'),
  },
  {
    id: 'FND-03', name: 'GIZ — develoPPP', orgType: 'Bilateral Donor',
    category: 'Blended Finance', country: 'Germany', region: 'Europe', headquarters: 'Bonn, Germany',
    website: 'developpp.de', generalEmail: 'info@developpp.de', telephone: '+49 228 4460 3400',
    fundingFocus: 'Private-sector development partnerships, sustainable supply chains, EUDR compliance capacity',
    geographicFocus: ['Africa', 'Global South'], industryFocus: ['Agri-processing', 'Forestry', 'Manufacturing'],
    targetBeneficiaries: 'Companies with a development impact business case',
    eligibleBusinessTypes: ['SME', 'Large enterprise'], eligibleCountries: ['Cameroon', 'Ghana', 'Côte d’Ivoire', 'Kenya', 'Nigeria'],
    minFunding: 65000000, maxFunding: 130000000, typicalFunding: 98000000, currency: 'XAF',
    mechanisms: ['Grant', 'Partnership'], applicationMethod: 'Ideas competition, rolling windows',
    registrationRequirements: 'Established company, annual turnover threshold', eligibilityRequirements: 'Min. turnover; 50% co-financing; development impact',
    requiredDocuments: ['Company profile', 'Financials', 'Project concept', 'Co-financing evidence'],
    matchingRequirement: '50% co-financing', coFinancingRequirement: 'Yes — 50%',
    reportingRequirements: 'Impact indicators + audited use of funds',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Researching',
    nextContact: d('2026-09-25'), owner: 'USR-01',
    notes: 'Excellent fit for EUDR supply-chain compliance partnerships with cocoa/coffee clients.', tags: ['EUDR', 'Supply chain'],
    created: d('2026-08-01'), updated: d('2026-08-15'),
  },
  {
    id: 'FND-04', name: 'Afreximbank — AfCFTA Adjustment Fund', orgType: 'Development Finance Institution',
    category: 'Concessional Lender', country: 'Egypt', region: 'Africa', headquarters: 'Cairo, Egypt',
    website: 'afreximbank.com', generalEmail: 'info@afreximbank.com', telephone: '+20 2 24564100',
    fundingFocus: 'AfCFTA adjustment, trade finance, factory readiness, standards upgrading',
    geographicFocus: ['Africa'], industryFocus: ['Manufacturing', 'Agri-processing', 'Trade services'],
    targetBeneficiaries: 'Exporters and SMEs adjusting to AfCFTA competition',
    eligibleBusinessTypes: ['SME', 'Large enterprise', 'Consultancy'], eligibleCountries: ['Cameroon', 'Nigeria', 'Ghana', 'Zambia', 'Kenya', 'Senegal'],
    minFunding: 30000000, maxFunding: 600000000, typicalFunding: 150000000, currency: 'XAF',
    mechanisms: ['Loan', 'Grant', 'Guarantee'], applicationMethod: 'Through partner banks / direct for TA windows',
    registrationRequirements: 'Registered exporter, bankable proposal', eligibilityRequirements: 'AfCFTA State Party; viable adjustment plan',
    requiredDocuments: ['Registration', 'Financials', 'Adjustment plan', 'Trade records'],
    matchingRequirement: 'Varies by instrument', coFinancingRequirement: 'For grants: 15%',
    reportingRequirements: 'Financial + trade impact reporting',
    internalRating: 5, relationshipStatus: 'Relationship Established', status: 'Active Opportunity',
    lastContact: d('2026-08-12'), nextContact: d('2026-09-15'), owner: 'USR-01',
    notes: 'Central to AfCFTA adjustment financing. High strategic value for BALIA client referrals.', tags: ['AfCFTA', 'Priority', 'Trade finance'],
    created: d('2025-04-20'), updated: d('2026-08-12'),
  },
  {
    id: 'FND-05', name: 'International Trade Centre — SheTrades', orgType: 'International organization',
    category: 'Technical Assistance', country: 'Switzerland', region: 'Europe', headquarters: 'Geneva, Switzerland',
    website: 'intracen.org', generalEmail: 'shetrades@intracen.org', telephone: '+41 22 730 0111',
    fundingFocus: 'Women-led export businesses, market access, e-commerce, standards',
    geographicFocus: ['Africa', 'Global'], industryFocus: ['Agriculture', 'Textiles', 'Services'],
    targetBeneficiaries: 'Women-owned / women-led SMEs and support institutions',
    eligibleBusinessTypes: ['SME', 'Cooperative'], eligibleCountries: ['Cameroon', 'Nigeria', 'Kenya', 'Ghana', 'Côte d’Ivoire'],
    minFunding: 5000000, maxFunding: 40000000, typicalFunding: 18000000, currency: 'XAF',
    mechanisms: ['Grant', 'Technical Assistance', 'Accelerator'], applicationMethod: 'Programme cohorts, periodic calls',
    registrationRequirements: 'Registered business, women ownership/leadership', eligibilityRequirements: 'Women-led; export ambition',
    requiredDocuments: ['Registration', 'Ownership evidence', 'Business plan'],
    matchingRequirement: 'None', coFinancingRequirement: 'No',
    reportingRequirements: 'Participation + outcome tracking',
    internalRating: 3, relationshipStatus: 'Prospect', status: 'Researching',
    owner: 'USR-05', nextContact: d('2026-10-01'),
    notes: 'Relevant for BALIA’s women-led client cohort and possible co-delivery.', tags: ['Women in trade', 'Market access'],
    created: d('2026-08-18'), updated: d('2026-08-18'),
  },
  {
    id: 'FND-06', name: 'Enabel — Wehubit / Trade for Development', orgType: 'Bilateral Donor',
    category: 'Grant Maker', country: 'Belgium', region: 'Europe', headquarters: 'Brussels, Belgium',
    website: 'enabel.be', generalEmail: 'info@enabel.be', telephone: '+32 2 505 37 00',
    fundingFocus: 'Digital for development, trade for development, value chains, fair trade',
    geographicFocus: ['Africa'], industryFocus: ['Agriculture', 'Digital services', 'Trade services'],
    targetBeneficiaries: 'SMEs, cooperatives, digital solution providers',
    eligibleBusinessTypes: ['SME', 'Cooperative', 'Startup'], eligibleCountries: ['Cameroon', 'Senegal', 'Benin', 'Burkina Faso', 'DR Congo'],
    minFunding: 20000000, maxFunding: 100000000, typicalFunding: 55000000, currency: 'XAF',
    mechanisms: ['Grant', 'Challenge Fund'], applicationMethod: 'Thematic calls for proposals',
    registrationRequirements: 'Legal registration in eligible country', eligibilityRequirements: 'Country focus; thematic fit',
    requiredDocuments: ['Registration', 'Proposal', 'Budget', 'Partnership letters'],
    matchingRequirement: '10-20% depending on call', coFinancingRequirement: 'Yes',
    reportingRequirements: 'Narrative + financial per call rules',
    internalRating: 3, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-02', nextContact: d('2026-09-30'),
    notes: 'Francophone Africa focus fits BALIA’s CEMAC base well.', tags: ['Francophone', 'Value chains'],
    created: d('2026-08-20'), updated: d('2026-08-20'),
  },
  {
    id: 'FND-07', name: 'World Bank Group', orgType: 'Multilateral Institution',
    category: 'Development Finance Institution', country: 'United States', region: 'Global', headquarters: 'Washington, D.C.',
    website: 'worldbank.org', generalEmail: '', telephone: '',
    fundingFocus: 'Consulting services on Bank-financed projects (trade, customs, private-sector development) via REOIs, plus corporate/operational consulting',
    geographicFocus: ['Global', 'Africa'], industryFocus: ['Trade', 'Public sector', 'Private-sector development'],
    targetBeneficiaries: 'Consulting firms and individual consultants',
    eligibleBusinessTypes: ['Consulting firm', 'Individual consultant'], eligibleCountries: ['Cameroon', 'Global'],
    minFunding: 0, maxFunding: 0, typicalFunding: 0, currency: 'USD',
    mechanisms: ['Procurement', 'Technical Assistance'], applicationMethod: 'REOI / EOI via STEP and WBGeProcure',
    registrationRequirements: 'Vendor registration (WBGeProcure); STEP for project procurement', eligibilityRequirements: 'Open to firms; borrower-executed procurement under Bank rules',
    requiredDocuments: ['EOI', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    matchingRequirement: 'None', coFinancingRequirement: 'No',
    reportingRequirements: 'Per contract',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-01', nextContact: d('2026-09-30'),
    notes: 'Official procurement channels verified 2026-09-11. Cameroon is a borrowing member — REOIs on Bank-financed trade/PSD projects are directly biddable.', tags: ['Procurement', 'Consulting'],
    created: d('2026-09-11'), updated: d('2026-09-11'),
  },
  {
    id: 'FND-08', name: 'United Nations (UNGM)', orgType: 'Multilateral Institution',
    category: 'International organization', country: 'Switzerland', region: 'Global', headquarters: 'Copenhagen / Geneva',
    website: 'ungm.org', generalEmail: 'registry@ungm.org', telephone: '',
    fundingFocus: 'Single-window procurement for 30+ UN organisations — consulting, technical assistance, studies (UNDP, UNIDO, ITC, UNECA, FAO and others)',
    geographicFocus: ['Global', 'Africa'], industryFocus: ['Trade', 'Development', 'Advisory'],
    targetBeneficiaries: 'Suppliers and individual consultants worldwide',
    eligibleBusinessTypes: ['Consulting firm', 'Individual consultant', 'NGO'], eligibleCountries: ['Cameroon', 'Global'],
    minFunding: 0, maxFunding: 0, typicalFunding: 0, currency: 'USD',
    mechanisms: ['Procurement', 'Technical Assistance'], applicationMethod: 'Free registration on UNGM, then bid on agency tenders/EOIs',
    registrationRequirements: 'Free UNGM registration (Basic; Level 1 for most bids)', eligibilityRequirements: 'Open to all countries; no nationality restriction',
    requiredDocuments: ['Company profile', 'Registration certificate', 'Declaration of eligibility'],
    matchingRequirement: 'None', coFinancingRequirement: 'No',
    reportingRequirements: 'Per contract',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-01', nextContact: d('2026-09-30'),
    notes: 'Official portal verified 2026-09-11. 500+ live UN notices at any time; registration is free and open to Cameroonian firms.', tags: ['UN', 'Procurement', 'Consulting'],
    created: d('2026-09-11'), updated: d('2026-09-11'),
  },
  {
    id: 'FND-09', name: 'Expertise France', orgType: 'Bilateral Donor',
    category: 'Development organization', country: 'France', region: 'Europe', headquarters: 'Paris, France',
    website: 'expertisefrance.fr', generalEmail: '', telephone: '',
    fundingFocus: 'Technical assistance and consultancy across governance, trade, private-sector development and public finance in francophone Africa',
    geographicFocus: ['Africa', 'Francophone Africa'], industryFocus: ['Trade', 'Governance', 'Private-sector development'],
    targetBeneficiaries: 'Consultancies, research firms, individual experts',
    eligibleBusinessTypes: ['Consulting firm', 'Individual consultant'], eligibleCountries: ['Cameroon', 'Global'],
    minFunding: 0, maxFunding: 0, typicalFunding: 0, currency: 'EUR',
    mechanisms: ['Technical Assistance', 'Procurement'], applicationMethod: 'Tenders on the PLACE portal (marches-publics.gouv.fr) + calls on expertisefrance.fr',
    registrationRequirements: 'Bid via PLACE for contracts of EUR 40k+', eligibilityRequirements: 'Open to companies/consultancies; francophone experts favoured',
    requiredDocuments: ['Tender response', 'Firm profile', 'Expert CVs'],
    matchingRequirement: 'None', coFinancingRequirement: 'No',
    reportingRequirements: 'Per contract',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-02', nextContact: d('2026-09-30'),
    notes: 'Official procurement channel verified 2026-09-11. Francophone-Africa TA focus is an excellent fit for BALIA\'s CEMAC base — incl. Cameroon missions.', tags: ['France', 'Francophone', 'Technical assistance'],
    created: d('2026-09-11'), updated: d('2026-09-11'),
  },
  {
    id: 'FND-10', name: 'European Union — Funding & Tenders', orgType: 'Multilateral Institution',
    category: 'International organization', country: 'Belgium', region: 'Europe', headquarters: 'Brussels, Belgium',
    website: 'ec.europa.eu', generalEmail: '', telephone: '',
    fundingFocus: 'Calls for proposals and external-aid tenders (DG INTPA), including trade, private-sector development and Global Gateway in Africa',
    geographicFocus: ['Africa', 'Global'], industryFocus: ['Trade', 'Development', 'Private-sector development'],
    targetBeneficiaries: 'Implementing partners, consultancies, consortia',
    eligibleBusinessTypes: ['Consulting firm', 'Consortium', 'NGO'], eligibleCountries: ['Cameroon', 'Global'],
    minFunding: 0, maxFunding: 0, typicalFunding: 0, currency: 'EUR',
    mechanisms: ['Grant', 'Procurement', 'Partnership'], applicationMethod: 'EU Funding & Tenders Portal + EU Delegation (Cameroon) calls',
    registrationRequirements: 'PIC / EU Login registration on the portal', eligibilityRequirements: 'Per call; external-aid contracts follow PRAG rules',
    requiredDocuments: ['Concept note / full proposal', 'Consortium agreement', 'Budget'],
    matchingRequirement: 'Often co-financing required', coFinancingRequirement: 'Yes (varies)',
    reportingRequirements: 'Per grant/contract',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-01', nextContact: d('2026-09-30'),
    notes: 'Official portal verified 2026-09-11. Best approached as a consortium member; watch the EU Delegation to Cameroon for local calls.', tags: ['EU', 'Consortium', 'Global Gateway'],
    created: d('2026-09-11'), updated: d('2026-09-11'),
  },
  {
    id: 'FND-11', name: 'Republic of Cameroon — Public Procurement (ARMP / MINMAP)', orgType: 'Government Agency',
    category: 'Government', country: 'Cameroon', region: 'Central Africa', headquarters: 'Yaoundé, Cameroon',
    website: 'armp.cm', generalEmail: '', telephone: '',
    fundingFocus: 'National public procurement — tenders, calls for expressions of interest and consultancy/expert assignments across ministries and public bodies',
    geographicFocus: ['Cameroon'], industryFocus: ['Public sector', 'Trade', 'Customs'],
    targetBeneficiaries: 'Cameroon-registered firms and experts',
    eligibleBusinessTypes: ['Company', 'Consultant'], eligibleCountries: ['Cameroon'],
    minFunding: 0, maxFunding: 0, typicalFunding: 0, currency: 'XAF',
    mechanisms: ['Procurement', 'Technical Assistance'], applicationMethod: 'Register on COLEPS / ARMP; bid on published AAO and AMI',
    registrationRequirements: 'COLEPS supplier profile (NIU, RCCM, tax attestation)', eligibilityRequirements: 'Cameroon registration and a valid administrative file',
    requiredDocuments: ['Administrative file', 'Technical offer', 'Financial offer', 'Bid bond where required'],
    matchingRequirement: 'None', coFinancingRequirement: 'No',
    reportingRequirements: 'Per contract',
    internalRating: 4, relationshipStatus: 'Prospect', status: 'Prospect',
    owner: 'USR-01', nextContact: d('2026-09-30'),
    notes: 'Official ARMP portal (armp.cm) and COLEPS e-procurement verified 2026-09-11. BALIA is Cameroon-registered — ideal for national trade/customs tenders and expert EOIs.', tags: ['Cameroon', 'Government', 'Procurement'],
    created: d('2026-09-11'), updated: d('2026-09-11'),
  },
];

export const FUNDER_CONTACTS: FunderContact[] = [
  { id: 'FCT-01', funderId: 'FND-01', name: 'Dr. Amadou Cissé', position: 'Senior Trade Facilitation Officer', email: 'a.cisse@afdb.org', phone: '+225 27 20 26 12 40', linkedin: 'linkedin.com/in/amadoucisse', primary: true, notes: 'Met at the Abidjan AfCFTA forum. Sponsor for the trade fund window.' },
  { id: 'FCT-02', funderId: 'FND-02', name: 'Grace Wanjiru', position: 'Programme Manager, Business Competitiveness', email: 'g.wanjiru@trademarkafrica.com', phone: '+254 20 423 5044', linkedin: 'linkedin.com/in/gracewanjiru', primary: true, notes: 'Handles the challenge fund pipeline.' },
  { id: 'FCT-03', funderId: 'FND-04', name: 'Kwame Boateng', position: 'Manager, AfCFTA Adjustment Fund', email: 'k.boateng@afreximbank.com', phone: '+20 2 24564130', linkedin: 'linkedin.com/in/kwameboateng', primary: true, notes: 'Key contact for adjustment financing referrals.' },
  { id: 'FCT-04', funderId: 'FND-03', name: 'Anke Richter', position: 'Advisor, develoPPP Africa', email: 'anke.richter@giz.de', phone: '+49 228 4460 3455', linkedin: 'linkedin.com/in/ankerichter', primary: true, notes: 'Cold outreach pending; identified via develoPPP site.' },
];

export const FUNDING_OPPORTUNITIES: FundingOpportunity[] = [
  {
    id: 'FOP-01', name: 'AfCFTA Trade Capacity Grant — CEMAC Corridor', funderId: 'FND-01', programName: 'Africa Trade Fund (AfTra) 2026 Window',
    oppType: 'Grant', description: 'Grant to strengthen trade support services and SME export readiness along the Douala–N’Djamena and Douala–Bangui corridors.',
    amount: 90000000, minAmount: 45000000, maxAmount: 180000000, currency: 'XAF',
    fundingDuration: '18 months', openingDate: d('2026-07-15'), deadline: d('2026-10-05'),
    geographicEligibility: ['CEMAC'], countryEligibility: ['Cameroon', 'Chad', 'Central African Republic', 'Gabon'], sectorEligibility: ['Trade services', 'Agri-processing', 'Logistics'],
    businessEligibility: 'Registered trade-support institution or consultancy with corridor experience', companyStage: 'Established (2+ yrs)',
    revenueRequirement: 'Audited accounts for 2 years', employeeRequirement: 'Min. 3 staff', projectRequirement: 'Corridor-focused trade capacity project',
    matchingFundsRequired: true, coFinancingRequired: true, matchingPercent: 10,
    applicationFee: 0, applicationUrl: 'afdb.org/aftra/apply', officialSource: 'afdb.org/aftra',
    contactPerson: 'Dr. Amadou Cissé', contactEmail: 'a.cisse@afdb.org',
    requiredDocuments: ['Company registration', 'Audited financials', 'Concept note', 'Budget', 'Team CVs', 'Corridor experience evidence'],
    evaluationCriteria: ['Relevance to AfCFTA', 'Corridor impact', 'Team capacity', 'Value for money', 'Sustainability'],
    priority: 'Critical', estimatedValue: 90000000, strategicValue: 'Flagship — positions BALIA as AfCFTA corridor implementer', probability: 65,
    owner: 'USR-01', team: ['USR-01', 'USR-03', 'USR-05'],
    status: 'Application in Progress', stage: 'Application Preparation',
    fitInputs: { geographic: 100, business: 90, industry: 95, funding_size: 90, project: 90, company_stage: 100, experience: 85, partnership: 70, financial: 80, documentation: 65, strategic: 100, probability: 65 },
    verifiedCriteria: ['geographic', 'business', 'industry', 'funding_size', 'company_stage', 'strategic'],
    nextAction: 'Complete budget and corridor evidence annex', nextActionDate: d('2026-09-14'),
    notes: 'Strongest current opportunity. Cameroon base is a direct advantage.', tags: ['AfCFTA', 'Priority', 'CEMAC'], findingId: 'BFN-01',
    discovered: d('2026-07-18'), lastVerified: d('2026-09-01'), nextVerification: d('2026-09-25'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-07-18'), updated: d('2026-09-06'),
    baliaCategory: 'Direct BALIA Funding', fundingType: 'Grant', baliaEligibility: 'Directly Eligible', eligibilityReason: 'Registered corridor consultancy with a Cameroon base and direct AfCFTA experience.',
    fitFactors: { trade: 95, customs: 80, export: 90, geo: 100, eligibility: 90, revenue: 75, capability: 90, brand: 100, timing: 90 },
    competitiveness: 68, competitivenessConfidence: 'Medium', competitivenessRationale: 'Strong eligibility and corridor fit; some competition from regional TA firms.', competition: 'Medium', applicationDifficulty: 'Medium',
    revenuePotential: 78, sourceConfidence: 90, sourceDomain: 'afdb.org', urlStatus: 'Verified',
  },
  {
    id: 'FOP-02', name: 'EUDR Supply-Chain Compliance Partnership', funderId: 'FND-03', programName: 'develoPPP Classic 2026',
    oppType: 'Blended', description: 'Public-private partnership co-financing to build EUDR due-diligence and geolocation capacity across cocoa and coffee supply chains.',
    amount: 98000000, minAmount: 65000000, maxAmount: 130000000, currency: 'XAF',
    fundingDuration: '24 months', openingDate: d('2026-08-01'), deadline: d('2026-11-30'),
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon', 'Ghana', 'Côte d’Ivoire'], sectorEligibility: ['Agri-processing', 'Forestry'],
    businessEligibility: 'Established company with development impact case; 50% co-financing', companyStage: 'Established',
    revenueRequirement: 'Turnover threshold met', employeeRequirement: 'n/a', projectRequirement: 'EUDR-focused supply-chain project with measurable impact',
    matchingFundsRequired: true, coFinancingRequired: true, matchingPercent: 50,
    applicationFee: 0, applicationUrl: 'developpp.de/ideas', officialSource: 'developpp.de',
    contactPerson: 'Anke Richter', contactEmail: 'anke.richter@giz.de',
    requiredDocuments: ['Company profile', 'Financials', 'Project concept', 'Co-financing evidence', 'Partnership letters'],
    evaluationCriteria: ['Development impact', 'Co-financing', 'Sustainability', 'Innovation'],
    priority: 'High', estimatedValue: 98000000, strategicValue: 'Anchors EUDR service line with a marquee donor partnership', probability: 40,
    owner: 'USR-01', team: ['USR-01', 'USR-02'],
    status: 'Qualified', stage: 'Eligibility Review',
    fitInputs: { geographic: 100, business: 80, industry: 100, funding_size: 90, project: 95, company_stage: 90, experience: 90, partnership: 50, financial: 55, documentation: 40, strategic: 95, probability: 40 },
    verifiedCriteria: ['geographic', 'industry', 'project', 'strategic'],
    nextAction: 'Confirm 50% co-financing route with an anchor client', nextActionDate: d('2026-09-20'),
    notes: 'Co-financing is the binding constraint. Kola Agro is a candidate co-applicant.', tags: ['EUDR', 'Supply chain'], findingId: 'BFN-02',
    discovered: d('2026-08-05'), lastVerified: d('2026-08-28'), nextVerification: d('2026-09-22'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-08-05'), updated: d('2026-09-04'),
    baliaCategory: 'Partnership', fundingType: 'Partnership', baliaEligibility: 'Eligible with Partner', eligibilityReason: 'develoPPP requires a European or commercial lead partner; BALIA joins as the local trade/compliance partner.',
    fitFactors: { trade: 85, customs: 90, export: 80, geo: 90, eligibility: 60, revenue: 80, capability: 85, brand: 80, timing: 70 },
    competitiveness: 52, competitivenessConfidence: 'Medium', competitivenessRationale: 'Needs a lead partner secured; strong EUDR/compliance angle.', competition: 'Medium', applicationDifficulty: 'High',
    revenuePotential: 72, sourceConfidence: 90, sourceDomain: 'developpp.de', urlStatus: 'Verified',
  },
  {
    id: 'FOP-03', name: 'Trade Competitiveness Challenge Fund', funderId: 'FND-02', programName: 'Business Competitiveness Window 4',
    oppType: 'Challenge Fund', description: 'Matched grant for interventions that measurably cut trade costs or raise export volumes for SMEs.',
    amount: 45000000, minAmount: 20000000, maxAmount: 80000000, currency: 'XAF',
    fundingDuration: '12 months', openingDate: d('2026-08-20'), deadline: d('2026-09-28'),
    geographicEligibility: ['EAC', 'West Africa'], countryEligibility: ['Kenya', 'Tanzania', 'Rwanda', 'Ghana'], sectorEligibility: ['Agriculture', 'Manufacturing', 'Trade services'],
    businessEligibility: 'Registered entity with trade-cost reduction intervention; 20% match', companyStage: 'Any',
    revenueRequirement: 'n/a', employeeRequirement: 'n/a', projectRequirement: 'Measurable trade outcomes with logframe',
    matchingFundsRequired: true, coFinancingRequired: true, matchingPercent: 20,
    applicationFee: 0, applicationUrl: 'trademarkafrica.com/challenge', officialSource: 'trademarkafrica.com',
    contactPerson: 'Grace Wanjiru', contactEmail: 'g.wanjiru@trademarkafrica.com',
    requiredDocuments: ['Registration', 'Tax clearance', 'Proposal', 'Logframe', 'Budget'],
    evaluationCriteria: ['Trade impact', 'Value for money', 'Feasibility', 'Additionality'],
    priority: 'High', estimatedValue: 45000000, strategicValue: 'Diversifies funder base into EAC', probability: 30,
    owner: 'USR-05', team: ['USR-05', 'USR-02'],
    status: 'Under Review', stage: 'Opportunity Identified',
    fitInputs: { geographic: 40, business: 85, industry: 90, funding_size: 85, project: 70, company_stage: 100, experience: 75, partnership: 80, financial: 70, documentation: 50, strategic: 65, probability: 30 },
    verifiedCriteria: ['business', 'industry', 'funding_size'],
    nextAction: 'Confirm whether a Cameroon-based applicant is eligible for this EAC window', nextActionDate: d('2026-09-12'),
    notes: 'Geographic eligibility is uncertain — deadline is tight. Assess before committing effort.', tags: ['Challenge fund', 'EAC'], findingId: 'BFN-03',
    discovered: d('2026-08-22'), lastVerified: d('2026-08-22'), nextVerification: d('2026-09-10'),
    verificationStatus: 'Needs Verification', verifiedBy: 'USR-05',
    created: d('2026-08-22'), updated: d('2026-08-30'),
    baliaCategory: 'Direct BALIA Funding', fundingType: 'Grant', baliaEligibility: 'Potentially Eligible', eligibilityReason: 'Challenge fund historically favours East Africa; the CEMAC corridor angle needs strengthening.',
    fitFactors: { trade: 90, customs: 70, export: 85, geo: 60, eligibility: 65, revenue: 70, capability: 80, brand: 80, timing: 75 },
    competitiveness: 44, competitivenessConfidence: 'Medium', competitivenessRationale: 'Competitive pan-African field; geography is the main gap.', competition: 'High', applicationDifficulty: 'Medium',
    revenuePotential: 65, sourceConfidence: 80, sourceDomain: 'trademarkafrica.com', urlStatus: 'Requires Verification',
  },
  {
    id: 'FOP-04', name: 'SheTrades Export Accelerator — Cohort 5', funderId: 'FND-05', programName: 'SheTrades Africa',
    oppType: 'Accelerator', description: 'Capacity + small grants for women-led exporters, with market linkage support.',
    amount: 18000000, minAmount: 5000000, maxAmount: 40000000, currency: 'XAF',
    fundingDuration: '9 months', openingDate: d('2026-09-01'), deadline: d('2026-12-15'),
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon', 'Nigeria', 'Kenya', 'Ghana', 'Côte d’Ivoire'], sectorEligibility: ['Agriculture', 'Textiles', 'Services'],
    businessEligibility: 'Women-owned or women-led registered business', companyStage: 'Early to growth',
    revenueRequirement: 'n/a', employeeRequirement: 'n/a', projectRequirement: 'Export growth plan',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'intracen.org/shetrades/apply', officialSource: 'intracen.org',
    contactPerson: 'SheTrades Africa Desk', contactEmail: 'shetrades@intracen.org',
    requiredDocuments: ['Registration', 'Ownership evidence', 'Business plan'],
    evaluationCriteria: ['Women leadership', 'Export potential', 'Growth plan'],
    priority: 'Medium', estimatedValue: 18000000, strategicValue: 'Co-delivery and client-referral channel', probability: 45,
    owner: 'USR-05', team: ['USR-05'],
    status: 'Identified', stage: 'Funder Identified',
    fitInputs: { geographic: 100, business: 60, industry: 70, funding_size: 60, project: 65, company_stage: 70, experience: 70, partnership: 60, financial: 80, documentation: 45, strategic: 60, probability: 45 },
    verifiedCriteria: ['geographic'],
    nextAction: 'Decide whether BALIA applies directly or channels women-led clients', nextActionDate: d('2026-09-24'),
    notes: 'Better suited as a client-referral channel than a direct BALIA application.', tags: ['Women in trade'],
    discovered: d('2026-08-30'), lastVerified: d('2026-08-30'), nextVerification: d('2026-10-05'),
    verificationStatus: 'Needs Verification', verifiedBy: 'USR-05',
    created: d('2026-08-30'), updated: d('2026-08-30'),
    baliaCategory: 'Client Funding', fundingType: 'Client Funding', baliaEligibility: 'Client Opportunity', eligibilityReason: 'Targets women-led exporters — a BALIA advisory client segment rather than a direct BALIA application.',
    fitFactors: { trade: 80, customs: 60, export: 95, geo: 85, eligibility: 40, revenue: 55, capability: 70, brand: 70, timing: 60 },
    competitiveness: 30, competitivenessConfidence: 'Low', competitivenessRationale: 'Not a direct BALIA application; value is in advising eligible clients.', competition: 'High', applicationDifficulty: 'Low',
    clientAdvisoryPotential: 82, revenuePotential: 45, sourceConfidence: 90, sourceDomain: 'shetrades.com', urlStatus: 'Verified',
  },
  {
    id: 'FOP-05', name: 'AfCFTA Adjustment — SME Standards Upgrade', funderId: 'FND-04', programName: 'Adjustment Fund TA Window',
    oppType: 'Technical Assistance', description: 'TA funding to help SMEs upgrade standards and certifications to compete under AfCFTA tariff liberalisation.',
    amount: 150000000, minAmount: 60000000, maxAmount: 300000000, currency: 'XAF',
    fundingDuration: '18 months', openingDate: d('2026-06-01'), deadline: d('2026-09-10'),
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon', 'Nigeria', 'Ghana', 'Zambia', 'Senegal'], sectorEligibility: ['Manufacturing', 'Agri-processing'],
    businessEligibility: 'AfCFTA State Party firms with adjustment plan', companyStage: 'Established',
    revenueRequirement: 'Trade records required', employeeRequirement: 'n/a', projectRequirement: 'Standards/certification upgrade plan',
    matchingFundsRequired: true, coFinancingRequired: true, matchingPercent: 15,
    applicationFee: 0, applicationUrl: 'afreximbank.com/adjustment', officialSource: 'afreximbank.com',
    contactPerson: 'Kwame Boateng', contactEmail: 'k.boateng@afreximbank.com',
    requiredDocuments: ['Registration', 'Financials', 'Adjustment plan', 'Trade records'],
    evaluationCriteria: ['Adjustment need', 'Viability', 'Trade impact'],
    priority: 'Medium', estimatedValue: 150000000, strategicValue: 'Large ticket; suits a consortium of BALIA manufacturing clients', probability: 20,
    owner: 'USR-01', team: ['USR-01', 'USR-03'],
    status: 'On Hold', stage: 'Opportunity Identified',
    fitInputs: { geographic: 100, business: 85, industry: 80, funding_size: 70, project: 60, company_stage: 90, experience: 80, partnership: 40, financial: 50, documentation: 40, strategic: 80, probability: 20 },
    verifiedCriteria: ['geographic', 'business', 'company_stage'],
    nextAction: 'Deadline likely missed for this cycle — monitor next window', nextActionDate: d('2026-09-30'),
    notes: 'Deadline is imminent and preparation not started. Better positioned as a client-consortium play next round.', tags: ['AfCFTA', 'Standards'],
    discovered: d('2026-06-05'), lastVerified: d('2026-07-15'), nextVerification: d('2026-09-15'),
    verificationStatus: 'Expired', verifiedBy: 'USR-01',
    created: d('2026-06-05'), updated: d('2026-08-20'),
    baliaCategory: 'Technical Assistance', fundingType: 'Technical Assistance', baliaEligibility: 'Potentially Eligible', eligibilityReason: 'TA window for SME standards upgrade; BALIA can deliver the customs/standards advisory component.',
    fitFactors: { trade: 85, customs: 95, export: 80, geo: 90, eligibility: 70, revenue: 85, capability: 90, brand: 75, timing: 65 },
    competitiveness: 58, competitivenessConfidence: 'Medium', competitivenessRationale: 'Strong customs/standards capability; timing depends on the window opening.', competition: 'Medium', applicationDifficulty: 'Medium',
    revenuePotential: 80, sourceConfidence: 80, sourceDomain: 'afreximbank.com', urlStatus: 'Requires Verification',
  },
  {
    id: 'FOP-06', name: 'AfDB Consulting & Procurement — Trade & Regional Integration', funderId: 'FND-01', programName: 'AfDB E-Consultant / Consultant Management System',
    oppType: 'Procurement', description: 'Standing channel for consulting firms to bid on AfDB EOIs and tenders across trade, regional integration and private-sector development, including in Central Africa.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'USD',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'AfDB member country; firms register on the Consultant Management System (CMS/SAP Fieldglass) / E-Consultant and respond to Expressions of Interest.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'afdb.org/en/projects-and-operations/procurement', officialSource: 'afdb.org/en/projects-and-operations/procurement',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official AfDB procurement/E-Consultant channel verified 2026-09-11. Register on CMS, then shortlist trade/customs/AfCFTA EOIs. Individual notices carry their own deadlines.', tags: ['AfDB', 'Procurement', 'Consulting', 'CEMAC'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Procurement / Tender', fundingType: 'Procurement / Tender', baliaEligibility: 'Directly Eligible', eligibilityReason: 'AfDB member country; firms register on the Consultant Management System (CMS/SAP Fieldglass) / E-Consultant and respond to Expressions of Interest.',
    fitFactors: { trade: 90, customs: 85, export: 80, geo: 95, eligibility: 90, revenue: 85, capability: 85, brand: 90, timing: 70 },
    competitiveness: 50, competitivenessConfidence: 'Medium', competitivenessRationale: 'Strong regional alignment and eligibility; competition from established consultancies.', competition: 'High', applicationDifficulty: 'Medium',
    revenuePotential: 82, sourceConfidence: 90, sourceDomain: 'afdb.org', urlStatus: 'Verified',
  },
  {
    id: 'FOP-07', name: 'UN System Procurement — UNGM Supplier & Consultant Registration', funderId: 'FND-08', programName: 'UNGM single-window registration',
    oppType: 'Procurement', description: 'Free single registration giving access to consulting/TA tenders and EOIs from 30+ UN organisations (UNDP, UNIDO, ITC, UNECA, FAO and others).',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'USD',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'Free UNGM registration is open to firms from all countries with no nationality restriction; Level 1 unlocks most bids.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'ungm.org/Account/registration', officialSource: 'ungm.org',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official UNGM portal verified 2026-09-11. 500+ live notices at any time; free to register. Bid on trade/customs/AfCFTA consulting EOIs.', tags: ['UN', 'UNGM', 'Procurement', 'Consulting'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Framework Agreement', fundingType: 'Framework Agreement', baliaEligibility: 'Directly Eligible', eligibilityReason: 'Free UNGM registration is open to firms from all countries with no nationality restriction; Level 1 unlocks most bids.',
    fitFactors: { trade: 80, customs: 70, export: 75, geo: 85, eligibility: 95, revenue: 80, capability: 75, brand: 85, timing: 60 },
    competitiveness: 45, competitivenessConfidence: 'Medium', competitivenessRationale: 'Open eligibility and large volume; strong competition, so target trade/customs-specific notices.', competition: 'High', applicationDifficulty: 'Medium',
    revenuePotential: 75, sourceConfidence: 90, sourceDomain: 'ungm.org', urlStatus: 'Verified',
  },
  {
    id: 'FOP-08', name: 'World Bank-Financed Project Consulting — REOIs via STEP', funderId: 'FND-07', programName: 'World Bank project & corporate procurement',
    oppType: 'Procurement', description: 'Requests for Expressions of Interest for consulting on Bank-financed projects (incl. in Cameroon) plus operational consulting over US$50k, across trade facilitation, customs and PSD.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'USD',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'Cameroon is a borrowing member; firms may participate in a procurement without prior vendor approval and bid on REOIs published via STEP.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'projects.worldbank.org/en/projects-operations/opportunities', officialSource: 'worldbank.org/en/about/corporate-procurement/business-opportunities',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official World Bank procurement channels (STEP / WBGeProcure) verified 2026-09-11. Monitor REOIs on Bank-financed Cameroon and regional trade/PSD projects.', tags: ['World Bank', 'STEP', 'Procurement', 'Consulting'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Consulting Contract', fundingType: 'Consulting Contract', baliaEligibility: 'Directly Eligible', eligibilityReason: 'Cameroon is a borrowing member; firms may participate in a procurement without prior vendor approval and bid on REOIs published via STEP.',
    fitFactors: { trade: 85, customs: 80, export: 75, geo: 90, eligibility: 90, revenue: 85, capability: 80, brand: 90, timing: 65 },
    competitiveness: 42, competitivenessConfidence: 'Medium', competitivenessRationale: 'High-value assignments but a competitive, QCBS-driven field; a strong track record and partners help.', competition: 'High', applicationDifficulty: 'High',
    revenuePotential: 85, sourceConfidence: 90, sourceDomain: 'worldbank.org', urlStatus: 'Verified',
  },
  {
    id: 'FOP-09', name: 'TradeMark Africa — Trade-Facilitation Consultancy Tenders', funderId: 'FND-02', programName: 'TMA procurement (firms/consortia tenders)',
    oppType: 'Tender', description: 'Live stream of TMA consultancy tenders on trade facilitation, digital trade and cross-border trader support (e.g. Abidjan-Lagos / Abidjan-Ouagadougou corridor TA).',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'USD',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'TMA tenders are open to firms/consortia; TMA operates in West and East Africa (not yet Cameroon), so a regional consortium strengthens positioning.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'trademarkafrica.com/procurement', officialSource: 'trademarkafrica.com/procurement',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official TMA procurement page verified 2026-09-11. Live consultancy tenders with individual deadlines; strongest as a consortium member.', tags: ['TradeMark Africa', 'Trade facilitation', 'Consortium', 'Tender'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Consulting Contract', fundingType: 'Consulting Contract', baliaEligibility: 'Eligible as Consortium Member', eligibilityReason: 'TMA tenders are open to firms/consortia; TMA operates in West and East Africa (not yet Cameroon), so a regional consortium strengthens positioning.',
    fitFactors: { trade: 95, customs: 85, export: 80, geo: 65, eligibility: 70, revenue: 80, capability: 90, brand: 85, timing: 70 },
    competitiveness: 40, competitivenessConfidence: 'Medium', competitivenessRationale: 'Excellent capability fit; geography outside BALIA core CEMAC base is the main gap — partner regionally.', competition: 'High', applicationDifficulty: 'Medium',
    revenuePotential: 72, sourceConfidence: 90, sourceDomain: 'trademarkafrica.com', urlStatus: 'Verified',
  },
  {
    id: 'FOP-10', name: 'develoPPP Classic — Ideas Competition (Q3 window)', funderId: 'FND-03', programName: 'develoPPP Classic (BMZ, via GIZ / DEG Impulse)',
    oppType: 'Partnership', description: 'Twice-yearly ideas competition co-financing private-sector projects that deliver local SDG impact — a route to fund a BALIA trade-capacity development partnership.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'USD',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: d('2026-09-30'),
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'develoPPP Classic accepts companies registered in the EU/EFTA or a country on the OECD-DAC list (Cameroon qualifies); the project must deliver local SDG impact beyond core business.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'developpp.de/en/application/classic', officialSource: 'developpp.de/en/application/classic',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official develoPPP site verified 2026-09-11. Recurring windows 15 Feb-31 Mar and 15 Aug-30 Sep; confirm the current focus theme before applying.', tags: ['develoPPP', 'BMZ', 'GIZ', 'Partnership'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Partnership', fundingType: 'Partnership', baliaEligibility: 'Potentially Eligible', eligibilityReason: 'develoPPP Classic accepts companies registered in the EU/EFTA or a country on the OECD-DAC list (Cameroon qualifies); the project must deliver local SDG impact beyond core business.',
    fitFactors: { trade: 80, customs: 70, export: 75, geo: 85, eligibility: 65, revenue: 70, capability: 80, brand: 80, timing: 90 },
    competitiveness: 48, competitivenessConfidence: 'Medium', competitivenessRationale: 'Eligibility via the OECD-DAC route is promising but needs a strong development-impact case; a co-applicant helps.', competition: 'Medium', applicationDifficulty: 'High',
    revenuePotential: 68, sourceConfidence: 90, sourceDomain: 'developpp.de', urlStatus: 'Verified',
  },
  {
    id: 'FOP-11', name: 'Expertise France — TA & Consultancy Assignments (francophone Africa)', funderId: 'FND-09', programName: 'PLACE public-procurement tenders / EF calls',
    oppType: 'Technical Assistance', description: 'Standing stream of technical-assistance and consultancy assignments across trade, governance and PSD in francophone Africa, including Cameroon missions.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'EUR',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'Francophone consultancies can bid via the PLACE portal; Expertise France runs TA missions across francophone Africa incl. Cameroon.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'expertisefrance.fr/en/public-procurement-and-tenders', officialSource: 'expertisefrance.fr/en/public-procurement-and-tenders',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official Expertise France procurement channel verified 2026-09-11. Monitor PLACE (marches-publics.gouv.fr) for trade/customs/PSD TA in francophone Africa.', tags: ['Expertise France', 'Francophone', 'TA', 'CEMAC'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Technical Assistance', fundingType: 'Technical Assistance', baliaEligibility: 'Directly Eligible', eligibilityReason: 'Francophone consultancies can bid via the PLACE portal; Expertise France runs TA missions across francophone Africa incl. Cameroon.',
    fitFactors: { trade: 85, customs: 80, export: 80, geo: 95, eligibility: 85, revenue: 82, capability: 85, brand: 80, timing: 65 },
    competitiveness: 55, competitivenessConfidence: 'Medium', competitivenessRationale: 'Strong francophone/geographic fit and eligibility; build a bailleur-format CV and monitor PLACE.', competition: 'Medium', applicationDifficulty: 'Medium',
    revenuePotential: 80, sourceConfidence: 90, sourceDomain: 'expertisefrance.fr', urlStatus: 'Verified',
  },
  {
    id: 'FOP-12', name: 'EU External-Aid Calls & Tenders — Trade / PSD in Africa', funderId: 'FND-10', programName: 'EU Funding & Tenders Portal (DG INTPA)',
    oppType: 'Procurement', description: 'Calls for proposals and external-aid tenders for trade, private-sector development and Global Gateway in Africa, plus local calls from the EU Delegation to Cameroon.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'EUR',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'EU external-aid tenders/calls typically require a consortium or EU-registered lead; African entities are eligible as partners, and the EU Delegation to Cameroon publishes local calls.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'ec.europa.eu/info/funding-tenders/opportunities/portal', officialSource: 'international-partnerships.ec.europa.eu/funding-and-technical-assistance/looking-funding_en',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official EU Funding & Tenders Portal verified 2026-09-11. Best pursued as a consortium member; track EU Delegation to Cameroon calls.', tags: ['EU', 'Consortium', 'Global Gateway', 'Grant'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Consulting Contract', fundingType: 'Consulting Contract', baliaEligibility: 'Eligible as Consortium Member', eligibilityReason: 'EU external-aid tenders/calls typically require a consortium or EU-registered lead; African entities are eligible as partners, and the EU Delegation to Cameroon publishes local calls.',
    fitFactors: { trade: 85, customs: 75, export: 80, geo: 80, eligibility: 60, revenue: 80, capability: 80, brand: 90, timing: 65 },
    competitiveness: 40, competitivenessConfidence: 'Medium', competitivenessRationale: 'High brand value but a competitive, consortium-driven field — secure a lead partner and watch the Cameroon Delegation.', competition: 'High', applicationDifficulty: 'High',
    revenuePotential: 82, sourceConfidence: 90, sourceDomain: 'ec.europa.eu', urlStatus: 'Verified',
  },
  {
    id: 'FOP-13', name: 'Enabel — Studies, TA & Training Contracts', funderId: 'FND-06', programName: 'Enabel public procurement',
    oppType: 'Procurement', description: 'Procurement contracts for studies, technical assistance, training and consultancy, plus grants via calls for proposals, across Enabel partner countries.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'EUR',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'Enabel procurement is open to firms and individual consultants (or partnerships); its francophone-Africa footprint fits BALIA well.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'enabel.be/public-procurement', officialSource: 'enabel.be/work-with-us',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official Enabel procurement channel verified 2026-09-11. Advertises procurement over EUR 15k; register and monitor for trade/TA/training scopes.', tags: ['Enabel', 'Belgium', 'Francophone', 'TA'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Technical Assistance', fundingType: 'Technical Assistance', baliaEligibility: 'Directly Eligible', eligibilityReason: 'Enabel procurement is open to firms and individual consultants (or partnerships); its francophone-Africa footprint fits BALIA well.',
    fitFactors: { trade: 80, customs: 78, export: 78, geo: 88, eligibility: 80, revenue: 78, capability: 82, brand: 78, timing: 60 },
    competitiveness: 50, competitivenessConfidence: 'Medium', competitivenessRationale: 'Good francophone fit; assignments span partner countries so monitor for trade/PSD/VET scopes.', competition: 'Medium', applicationDifficulty: 'Medium',
    revenuePotential: 76, sourceConfidence: 90, sourceDomain: 'enabel.be', urlStatus: 'Verified',
  },
  {
    id: 'FOP-14', name: 'Cameroon National Public Procurement — Tenders & Expert EOIs', funderId: 'FND-11', programName: 'ARMP / COLEPS (MINMAP contracting authorities)',
    oppType: 'Procurement', description: 'National tenders (AAO) and calls for expressions of interest (AMI) across Cameroon ministries and public bodies, including consultancy and expert assignments in trade and public finance.',
    amount: 0, minAmount: 0, maxAmount: 0, currency: 'XAF',
    fundingDuration: 'Varies by assignment', openingDate: d('2026-09-11'), deadline: '',
    geographicEligibility: ['Africa'], countryEligibility: ['Cameroon'], sectorEligibility: ['Trade', 'Customs', 'Private-sector development'],
    businessEligibility: 'BALIA is Cameroon-registered; register on COLEPS / ARMP and bid on national tenders and expert EOIs — the strongest eligibility position of any channel.', companyStage: 'Established',
    revenueRequirement: 'Not publicly confirmed', employeeRequirement: 'Not publicly confirmed', projectRequirement: 'Per assignment',
    matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0,
    applicationFee: 0, applicationUrl: 'armp.cm', officialSource: 'armp.cm',
    contactPerson: '', contactEmail: '',
    requiredDocuments: ['EOI / proposal', 'Firm profile', 'CVs', 'Similar-assignment evidence'],
    evaluationCriteria: ['Relevant experience', 'Team qualifications', 'Methodology', 'Value for money'],
    priority: 'High', estimatedValue: 0, strategicValue: 'Standing channel — recurring biddable assignments', probability: 40,
    owner: 'USR-01', team: ['USR-01'],
    status: 'Identified', stage: 'Opportunity Identified',
    fitInputs: {}, verifiedCriteria: [],
    nextAction: 'Register / monitor and shortlist relevant EOIs', nextActionDate: d('2026-09-25'),
    notes: 'Official ARMP portal (armp.cm) and COLEPS e-procurement verified 2026-09-11. Register on COLEPS, then track trade/customs AAO and expert AMI.', tags: ['Cameroon', 'Government', 'Procurement', 'CEMAC'],
    discovered: d('2026-09-11'), lastVerified: d('2026-09-11'), nextVerification: d('2026-10-11'),
    verificationStatus: 'Verified', verifiedBy: 'USR-01',
    created: d('2026-09-11'), updated: d('2026-09-11'),
    baliaCategory: 'Procurement / Tender', fundingType: 'Procurement / Tender', baliaEligibility: 'Directly Eligible', eligibilityReason: 'BALIA is Cameroon-registered; register on COLEPS / ARMP and bid on national tenders and expert EOIs — the strongest eligibility position of any channel.',
    fitFactors: { trade: 80, customs: 85, export: 70, geo: 100, eligibility: 100, revenue: 70, capability: 85, brand: 70, timing: 65 },
    competitiveness: 55, competitivenessConfidence: 'Medium', competitivenessRationale: 'Home-market eligibility is unbeatable; competition is local and price-sensitive, and state payment delays are a known risk.', competition: 'High', applicationDifficulty: 'Medium',
    revenuePotential: 68, sourceConfidence: 90, sourceDomain: 'armp.cm', urlStatus: 'Verified',
  },
];

// §35 — Research log: an auditable record of each intelligence-research update.
export interface ResearchEntry {
  id: string; researcher: string; date: string; source: string; sourceUrl: string;
  category: string; discovered: string; verificationStatus: string;
  changes: string; evidence: string; notes: string;
}

export const RESEARCH_LOG: ResearchEntry[] = [
  { id: 'RL-01', researcher: 'USR-01', date: d('2026-09-11'), source: 'African Development Bank', sourceUrl: 'afdb.org/en/projects-and-operations/procurement', category: 'Consulting & Technical Assistance', discovered: 'FOP-06 — AfDB Consulting & Procurement', verificationStatus: 'Verified', changes: 'Added new verified opportunity FOP-06 and confirmed funder FND-01', evidence: 'Official AfDB procurement page + Consultant Management System (E-Consultant/CMS)', notes: 'Member-country eligibility; EOI-driven, individual notices carry their own deadlines.' },
  { id: 'RL-02', researcher: 'USR-01', date: d('2026-09-11'), source: 'United Nations (UNGM)', sourceUrl: 'ungm.org', category: 'Procurement portal', discovered: 'FOP-07 — UNGM registration', verificationStatus: 'Verified', changes: 'Added FOP-07 and new funder FND-08', evidence: 'Official UNGM portal — free registration open to all countries', notes: '500+ live UN notices at any time; target trade/customs EOIs.' },
  { id: 'RL-03', researcher: 'USR-01', date: d('2026-09-11'), source: 'World Bank Group', sourceUrl: 'worldbank.org/en/about/corporate-procurement/business-opportunities', category: 'Consulting & Technical Assistance', discovered: 'FOP-08 — World Bank REOIs via STEP', verificationStatus: 'Verified', changes: 'Added FOP-08 and new funder FND-07', evidence: 'Official World Bank procurement pages + STEP (step.worldbank.org)', notes: 'Cameroon is a borrowing member; firms may bid without prior vendor approval.' },
  { id: 'RL-04', researcher: 'USR-01', date: d('2026-09-11'), source: 'TradeMark Africa', sourceUrl: 'trademarkafrica.com/procurement', category: 'Trade facilitation / tenders', discovered: 'FOP-09 — TMA consultancy tenders', verificationStatus: 'Verified', changes: 'Added FOP-09 against existing funder FND-02', evidence: 'Official TMA procurement/tenders page with live consultancy tenders', notes: 'West/East Africa footprint (not Cameroon) — pursue as a consortium member.' },
  { id: 'RL-05', researcher: 'USR-01', date: d('2026-09-11'), source: 'develoPPP (BMZ / GIZ)', sourceUrl: 'developpp.de/en/application/classic', category: 'Partnership / co-financing', discovered: 'FOP-10 — develoPPP Classic ideas competition', verificationStatus: 'Verified', changes: 'Added FOP-10 against existing funder FND-03', evidence: 'Official develoPPP site — recurring windows 15 Feb-31 Mar and 15 Aug-30 Sep', notes: 'OECD-DAC-list eligibility route (Cameroon qualifies); needs a strong development-impact case.' },
  { id: 'RL-06', researcher: 'USR-01', date: d('2026-09-11'), source: 'ITC SheTrades', sourceUrl: 'shetrades.com', category: 'Client funding / women exporters', discovered: 'FOP-04 (existing) — funder confirmed', verificationStatus: 'Verified', changes: 'Confirmed funder FND-05 and the SheTrades initiative against its official site', evidence: 'Official shetrades.com — standing initiative, hubs, academy', notes: 'Primarily a client-referral opportunity for women-led exporter clients.' },
  { id: 'RL-07', researcher: 'USR-01', date: d('2026-09-11'), source: 'Afreximbank — AfCFTA Adjustment Fund', sourceUrl: 'afreximbank.com', category: 'AfCFTA / technical assistance', discovered: 'FOP-05 (existing) — funder confirmed', verificationStatus: 'Verified', changes: 'Confirmed funder FND-04 and the Adjustment Fund against official pages', evidence: 'Official afreximbank.com — US$10bn fund, Base/General/Credit sub-funds, active 2026', notes: 'The specific SME-standards TA window in FOP-05 remains Requires Verification.' },
  { id: 'RL-08', researcher: 'USR-01', date: d('2026-09-11'), source: 'Expertise France', sourceUrl: 'expertisefrance.fr/en/public-procurement-and-tenders', category: 'Technical assistance / francophone Africa', discovered: 'FOP-11 — Expertise France TA', verificationStatus: 'Verified', changes: 'Added FOP-11 and new funder FND-09', evidence: 'Official Expertise France procurement page + PLACE portal (marches-publics.gouv.fr)', notes: 'Excellent francophone/Cameroon fit; bid via PLACE for EUR 40k+ contracts.' },
  { id: 'RL-09', researcher: 'USR-01', date: d('2026-09-11'), source: 'European Union — Funding & Tenders', sourceUrl: 'ec.europa.eu/info/funding-tenders/opportunities/portal', category: 'EU external aid / consortium', discovered: 'FOP-12 — EU external-aid calls & tenders', verificationStatus: 'Verified', changes: 'Added FOP-12 and new funder FND-10', evidence: 'Official EU Funding & Tenders Portal + DG INTPA looking-for-funding page', notes: 'Consortium-driven; also watch the EU Delegation to Cameroon for local calls.' },
  { id: 'RL-10', researcher: 'USR-01', date: d('2026-09-11'), source: 'Enabel', sourceUrl: 'enabel.be/public-procurement', category: 'Technical assistance / francophone Africa', discovered: 'FOP-13 — Enabel studies/TA/training', verificationStatus: 'Verified', changes: 'Added FOP-13 against existing funder FND-06', evidence: 'Official Enabel procurement pages; advertises procurement over EUR 15k', notes: 'Open to firms/consultants; monitor for trade/PSD/VET scopes.' },
  { id: 'RL-11', researcher: 'USR-01', date: d('2026-09-11'), source: 'Republic of Cameroon — ARMP / COLEPS', sourceUrl: 'armp.cm', category: 'Cameroon national procurement', discovered: 'FOP-14 — Cameroon national tenders & EOIs', verificationStatus: 'Verified', changes: 'Added FOP-14 and new funder FND-11', evidence: 'Official ARMP portal (armp.cm) + PRIDESOFT / COLEPS e-procurement', notes: 'Strongest eligibility of any channel — BALIA is Cameroon-registered. Note state payment-delay risk.' },
];

export const FUNDING_APPLICATIONS: FundingApplication[] = [
  {
    id: 'FAP-01', opportunityId: 'FOP-01', funderId: 'FND-01',
    projectTitle: 'CEMAC Corridor Trade Capacity Programme', projectSummary: 'An 18-month programme to strengthen SME export readiness and trade-support services along the Douala–N’Djamena and Douala–Bangui corridors, delivered by BALIA with corridor stakeholders.',
    objectives: 'Improve corridor trade facilitation; build SME export capability; deliver AfCFTA origin and documentation training.',
    expectedOutcomes: '40 SMEs export-ready; 2 corridor briefings; 120 practitioners trained.',
    deadline: d('2026-10-05'), owner: 'USR-01', team: ['USR-01', 'USR-03', 'USR-05'],
    startDate: d('2026-08-01'), status: 'In Progress',
    fundingRequested: 90000000, fundingAwarded: 0, currency: 'XAF',
    budget: 99000000, coFinancing: 9000000, beneficiaries: '40 SMEs, 120 practitioners', geographicScope: 'CEMAC — Cameroon, Chad, CAR',
    requirements: [
      { key: 'eligibility', done: true, at: d('2026-08-02') },
      { key: 'opportunity_reviewed', done: true, at: d('2026-08-02') },
      { key: 'form_created', done: true, at: d('2026-08-05') },
      { key: 'org_profile', done: true, at: d('2026-08-06') },
      { key: 'exec_summary', done: true, at: d('2026-08-12') },
      { key: 'business_plan', done: false },
      { key: 'project_proposal', done: true, at: d('2026-08-20') },
      { key: 'budget', done: false },
      { key: 'financials', done: true, at: d('2026-08-15') },
      { key: 'registration', done: true, at: d('2026-08-06') },
      { key: 'tax', done: true, at: d('2026-08-06') },
      { key: 'bank', done: false },
      { key: 'cvs', done: true, at: d('2026-08-18') },
      { key: 'support_letters', done: false },
      { key: 'references', done: false },
      { key: 'reviewed', done: false },
      { key: 'approved', done: false },
      { key: 'submitted', done: false },
    ],
    reviewComments: '', contractStatus: 'n/a', reportingRequirements: 'Quarterly narrative + financial',
    finalOutcome: '', notes: 'Budget and corridor evidence annex are the critical path items.',
    created: d('2026-08-01'), updated: d('2026-09-06'),
  },
  {
    id: 'FAP-02', opportunityId: 'FOP-02', funderId: 'FND-03',
    projectTitle: 'EUDR Compliance Partnership — Cocoa & Coffee', projectSummary: 'A develoPPP partnership to build EUDR due-diligence and geolocation capability across BALIA client supply chains, with a co-financing anchor client.',
    objectives: 'Establish EUDR due-diligence systems; map and geolocate supply base; train operators.',
    expectedOutcomes: '3 supply chains EUDR-ready; geolocation dataset; compliance register template.',
    deadline: d('2026-11-30'), owner: 'USR-01', team: ['USR-01', 'USR-02'],
    startDate: d('2026-08-28'), status: 'Preparing',
    fundingRequested: 98000000, fundingAwarded: 0, currency: 'XAF',
    budget: 196000000, coFinancing: 98000000, beneficiaries: '3 supply chains, ~600 smallholders', geographicScope: 'Cameroon, Ghana',
    requirements: [
      { key: 'eligibility', done: true, at: d('2026-08-28') },
      { key: 'opportunity_reviewed', done: true, at: d('2026-08-28') },
      { key: 'form_created', done: false },
      { key: 'org_profile', done: true, at: d('2026-08-29') },
      { key: 'exec_summary', done: false },
      { key: 'business_plan', done: false },
      { key: 'project_proposal', done: false },
      { key: 'budget', done: false },
      { key: 'financials', done: true, at: d('2026-08-29') },
      { key: 'registration', done: true, at: d('2026-08-29') },
      { key: 'tax', done: false },
      { key: 'bank', done: false },
      { key: 'cvs', done: false },
      { key: 'support_letters', done: false },
      { key: 'references', done: false },
      { key: 'reviewed', done: false },
      { key: 'approved', done: false },
      { key: 'submitted', done: false },
    ],
    reviewComments: '', contractStatus: 'n/a', reportingRequirements: 'Impact indicators + audited use of funds',
    finalOutcome: '', notes: 'Blocked on confirming the co-financing anchor client before proposal build.',
    created: d('2026-08-28'), updated: d('2026-09-04'),
  },
];

export const FUNDING_APP_DOCUMENTS: FundingAppDocument[] = [
  { id: 'FAD-01', applicationId: 'FAP-01', opportunityId: 'FOP-01', name: 'Company registration (RC/DLA)', required: true, status: 'Approved', responsible: 'USR-07', documentId: undefined, notes: '' },
  { id: 'FAD-02', applicationId: 'FAP-01', opportunityId: 'FOP-01', name: 'Audited financials 2024–2025', required: true, status: 'Approved', responsible: 'USR-04', notes: '' },
  { id: 'FAD-03', applicationId: 'FAP-01', opportunityId: 'FOP-01', name: 'Programme budget', required: true, status: 'Under Review', responsible: 'USR-04', notes: 'Draft v2 with the finance manager.' },
  { id: 'FAD-04', applicationId: 'FAP-01', opportunityId: 'FOP-01', name: 'Corridor experience evidence', required: true, status: 'Received', responsible: 'USR-03', notes: 'Assembling the 2025 corridor study references.' },
  { id: 'FAD-05', applicationId: 'FAP-01', opportunityId: 'FOP-01', name: 'Letters of support', required: false, status: 'Missing', responsible: 'USR-05', notes: 'Requesting from corridor chambers of commerce.' },
  { id: 'FAD-06', applicationId: 'FAP-02', opportunityId: 'FOP-02', name: 'Company profile', required: true, status: 'Approved', responsible: 'USR-01', notes: '' },
  { id: 'FAD-07', applicationId: 'FAP-02', opportunityId: 'FOP-02', name: 'Co-financing evidence', required: true, status: 'Missing', responsible: 'USR-01', notes: 'Awaiting anchor client commitment letter.' },
  { id: 'FAD-08', applicationId: 'FAP-02', opportunityId: 'FOP-02', name: 'Partnership letters', required: true, status: 'Requested', responsible: 'USR-02', notes: '' },
];

export const FUNDING_ACTIONS: FundingAction[] = [
  { id: 'FAC-01', opportunityId: 'FOP-01', applicationId: 'FAP-01', name: 'Finalise programme budget', owner: 'USR-04', startDate: d('2026-09-08'), dueDate: d('2026-09-14'), status: 'In Progress', priority: 'Critical', completion: 60, comments: 'Reconciling co-financing lines.', created: d('2026-09-06') },
  { id: 'FAC-02', opportunityId: 'FOP-01', applicationId: 'FAP-01', name: 'Obtain corridor letters of support', owner: 'USR-05', startDate: d('2026-09-09'), dueDate: d('2026-09-20'), status: 'Not Started', priority: 'High', completion: 0, comments: '', created: d('2026-09-06') },
  { id: 'FAC-03', opportunityId: 'FOP-01', applicationId: 'FAP-01', name: 'Internal review + management approval', owner: 'USR-01', startDate: d('2026-09-24'), dueDate: d('2026-09-30'), status: 'Not Started', priority: 'High', dependsOn: 'FAC-01', completion: 0, comments: '', created: d('2026-09-06') },
  { id: 'FAC-04', opportunityId: 'FOP-02', applicationId: 'FAP-02', name: 'Confirm co-financing anchor client', owner: 'USR-01', startDate: d('2026-09-09'), dueDate: d('2026-09-20'), status: 'In Progress', priority: 'Critical', completion: 25, comments: 'Kola Agro board discussion pending.', created: d('2026-09-04') },
  { id: 'FAC-05', opportunityId: 'FOP-03', name: 'Verify EAC eligibility for a Cameroon applicant', owner: 'USR-05', startDate: d('2026-09-08'), dueDate: d('2026-09-12'), status: 'In Progress', priority: 'High', completion: 40, comments: 'Emailed the programme manager.', created: d('2026-09-06') },
];

export const FUNDER_COMMUNICATIONS: FunderCommunication[] = [
  { id: 'FCM-01', funderId: 'FND-01', opportunityId: 'FOP-01', type: 'Meeting', date: d('2026-08-22'), subject: 'AfTra window scoping call', summary: 'Confirmed corridor focus is a strong fit; advised to emphasise measurable SME outcomes.', user: 'USR-01', direction: 'Outbound' },
  { id: 'FCM-02', funderId: 'FND-04', opportunityId: 'FOP-05', type: 'Email', date: d('2026-08-12'), subject: 'Adjustment Fund TA window timing', summary: 'Boateng confirmed the current TA window closes 10 Sept; next cycle expected Q1 2027.', user: 'USR-01', direction: 'Inbound' },
  { id: 'FCM-03', funderId: 'FND-02', opportunityId: 'FOP-03', type: 'Email', date: d('2026-07-30'), subject: 'Challenge fund eligibility query', summary: 'Requested clarification on cross-region applicant eligibility. Response pending.', user: 'USR-05', direction: 'Outbound' },
];

export const FUNDING_OUTCOMES: FundingOutcome[] = [
  { id: 'FOU-01', opportunityId: 'FOP-00-HIST', funderId: 'FND-01', outcome: 'Awarded', amount: 42000000, currency: 'XAF', date: d('2025-11-20'), reason: 'Strong corridor study proposal', lessonsLearned: 'Early funder engagement and a named sponsor were decisive.' },
];

export const RESEARCH_SOURCES: ResearchSource[] = [
  { id: 'RSR-01', name: 'AfDB AfTra programme page', type: 'Development organization', url: 'afdb.org/aftra', dateAccessed: d('2026-07-18'), datePublished: d('2026-07-01'), dateVerified: d('2026-09-01'), researcher: 'USR-01', reliability: 5, notes: 'Official source.' },
  { id: 'RSR-02', name: 'develoPPP ideas competition', type: 'Development organization', url: 'developpp.de/ideas', dateAccessed: d('2026-08-05'), datePublished: d('2026-08-01'), dateVerified: d('2026-08-28'), researcher: 'USR-01', reliability: 5, notes: 'Rolling windows.' },
  { id: 'RSR-03', name: 'TradeMark Africa challenge fund call', type: 'Website', url: 'trademarkafrica.com/challenge', dateAccessed: d('2026-08-22'), datePublished: d('2026-08-20'), researcher: 'USR-05', reliability: 4, notes: 'Eligibility wording ambiguous on geography.' },
  { id: 'RSR-04', name: 'AfCFTA Secretariat newsletter', type: 'AfCFTA', url: 'au-afcfta.org/news', dateAccessed: d('2026-09-02'), datePublished: d('2026-08-29'), researcher: 'USR-03', reliability: 4, notes: 'Policy-development source.' },
];

export const BUSINESS_FINDINGS: BusinessFinding[] = [
  {
    id: 'BFN-01', title: 'AfDB AfTra window open for CEMAC corridor trade capacity', type: 'Funding Opportunity', category: 'Funding',
    description: 'AfDB’s Africa Trade Fund has opened a window directly relevant to BALIA’s CEMAC corridor work.',
    detail: 'Grants of XAF 45–180m for trade-support and SME export-readiness projects on African corridors. Cameroon base is a direct advantage. 10% co-financing required.',
    sourceId: 'RSR-01', source: 'Development organization', sourceUrl: 'afdb.org/aftra', sourceOrg: 'African Development Bank',
    discovered: d('2026-07-18'), lastVerified: d('2026-09-01'),
    market: 'CEMAC', country: 'Cameroon', region: 'Central Africa', industry: 'Trade services',
    relatedService: 'AfCFTA Readiness Assessment', relatedFunderId: 'FND-01', relatedOpportunityId: 'FOP-01',
    strategicImportance: 'Critical', potentialValue: 90000000, currency: 'XAF',
    confidence: 'Confirmed', researcher: 'USR-01', responsible: 'USR-01',
    status: 'Converted', priority: 'Critical', nextAction: 'Progress the application', nextActionDate: d('2026-09-14'),
    verificationStatus: 'Verified', nextVerification: d('2026-09-25'),
    convertedTo: [{ kind: 'funding_opportunity', id: 'FOP-01' }],
    notes: 'Now the flagship funding opportunity.', tags: ['AfCFTA', 'Priority', 'CEMAC'],
    created: d('2026-07-18'), updated: d('2026-09-06'),
  },
  {
    id: 'BFN-02', title: 'GIZ develoPPP fits EUDR supply-chain service line', type: 'Partnership Opportunity', category: 'Partnership',
    description: 'develoPPP co-financing could anchor BALIA’s EUDR service line with a marquee donor partnership.',
    detail: 'Requires 50% co-financing and a development-impact case. Kola Agro is a candidate co-applicant. Deadline 30 Nov.',
    sourceId: 'RSR-02', source: 'Development organization', sourceUrl: 'developpp.de/ideas', sourceOrg: 'GIZ',
    discovered: d('2026-08-05'), lastVerified: d('2026-08-28'),
    market: 'Africa', country: 'Cameroon', region: 'Africa', industry: 'Agri-processing',
    relatedService: 'EUDR Readiness & Due Diligence', relatedFunderId: 'FND-03', relatedOpportunityId: 'FOP-02',
    strategicImportance: 'High', potentialValue: 98000000, currency: 'XAF',
    confidence: 'High', researcher: 'USR-01', responsible: 'USR-01',
    status: 'Converted', priority: 'High', nextAction: 'Confirm co-financing anchor', nextActionDate: d('2026-09-20'),
    verificationStatus: 'Verified', nextVerification: d('2026-09-22'),
    convertedTo: [{ kind: 'funding_opportunity', id: 'FOP-02' }],
    notes: 'Co-financing is the binding constraint.', tags: ['EUDR', 'Supply chain'],
    created: d('2026-08-05'), updated: d('2026-09-04'),
  },
  {
    id: 'BFN-03', title: 'TradeMark Africa challenge fund — geography needs checking', type: 'Grant', category: 'Funding',
    description: 'A challenge-fund window that could fit, but cross-region eligibility for a Cameroon applicant is unclear.',
    detail: 'Matched grant (20%) for trade-cost reduction. EAC/West Africa focus. Deadline 28 Sept is tight; verify eligibility before investing effort.',
    sourceId: 'RSR-03', source: 'Website', sourceUrl: 'trademarkafrica.com/challenge', sourceOrg: 'TradeMark Africa',
    discovered: d('2026-08-22'), lastVerified: d('2026-08-22'),
    market: 'EAC', country: 'Kenya', region: 'East Africa', industry: 'Trade services',
    relatedFunderId: 'FND-02', relatedOpportunityId: 'FOP-03',
    strategicImportance: 'Medium', potentialValue: 45000000, currency: 'XAF',
    confidence: 'Medium', researcher: 'USR-05', responsible: 'USR-05',
    status: 'In Progress', priority: 'High', nextAction: 'Verify eligibility with programme manager', nextActionDate: d('2026-09-12'),
    verificationStatus: 'Needs Verification', nextVerification: d('2026-09-10'),
    convertedTo: [{ kind: 'funding_opportunity', id: 'FOP-03' }],
    notes: 'Assumption, not confirmed: that a Cameroon-based applicant qualifies.', tags: ['Challenge fund', 'EAC'],
    created: d('2026-08-22'), updated: d('2026-08-30'),
  },
  {
    id: 'BFN-04', title: 'Nigeria Customs modernisation creates advisory demand', type: 'Consulting Opportunity', category: 'Consulting',
    description: 'Nigeria Customs’ B’Odogwu rollout is generating post-clearance audit and classification advisory demand.',
    detail: 'Several BALIA leads in Nigeria cite audit and classification pressure. A packaged advisory offer could convert this into revenue.',
    sourceId: 'RSR-04', source: 'Industry association', sourceUrl: 'au-afcfta.org/news', sourceOrg: 'Trade press',
    discovered: d('2026-09-02'), lastVerified: d('2026-09-02'),
    market: 'Nigeria', country: 'Nigeria', region: 'West Africa', industry: 'Customs',
    relatedService: 'Customs Compliance Review', relatedCompanyId: undefined,
    strategicImportance: 'High', potentialValue: 30000000, currency: 'XAF',
    confidence: 'Medium', researcher: 'USR-03', responsible: 'USR-05',
    status: 'Action Required', priority: 'High', nextAction: 'Package a Nigeria post-clearance audit offer', nextActionDate: d('2026-09-16'),
    verificationStatus: 'Verified', nextVerification: d('2026-10-01'),
    notes: 'Convertible into a consulting opportunity and targeted campaign.', tags: ['Nigeria', 'Customs'],
    created: d('2026-09-02'), updated: d('2026-09-02'),
  },
  {
    id: 'BFN-05', title: 'EU EUDR enforcement date firming up — client urgency rising', type: 'Regulatory Development', category: 'Regulatory',
    description: 'Clarified EUDR timelines are increasing urgency among BALIA cocoa/coffee/timber clients.',
    detail: 'Firmer enforcement expectations mean geolocation and due-diligence readiness is now time-critical for in-scope clients. Supports both delivery revenue and the develoPPP partnership case.',
    sourceId: 'RSR-04', source: 'Newsletter', sourceUrl: 'au-afcfta.org/news', sourceOrg: 'EU / trade press',
    discovered: d('2026-08-29'), lastVerified: d('2026-09-02'),
    market: 'EU', country: 'Cameroon', region: 'Africa', industry: 'Agri-processing',
    relatedService: 'EUDR Readiness & Due Diligence', relatedFunderId: 'FND-03',
    strategicImportance: 'High', potentialValue: 0, currency: 'XAF',
    confidence: 'High', researcher: 'USR-01', responsible: 'USR-01',
    status: 'Monitoring', priority: 'Medium', nextAction: 'Brief in-scope clients on timeline', nextActionDate: d('2026-09-18'),
    verificationStatus: 'Verified', nextVerification: d('2026-09-30'),
    notes: 'Market intelligence that strengthens several other records.', tags: ['EUDR', 'Regulatory'],
    created: d('2026-08-29'), updated: d('2026-09-02'),
  },
  {
    id: 'BFN-06', title: 'Enabel Francophone value-chain call expected Q4', type: 'Funding Opportunity', category: 'Funding',
    description: 'Enabel is expected to open a Francophone Africa value-chain / trade-for-development call in Q4 2026.',
    detail: 'Would fit BALIA’s CEMAC base well. No open call yet — monitor and pre-position with a concept note.',
    sourceId: undefined, source: 'Internal research', sourceUrl: 'enabel.be', sourceOrg: 'Enabel',
    discovered: d('2026-08-20'), lastVerified: d('2026-08-20'),
    market: 'Francophone Africa', country: 'Cameroon', region: 'Africa', industry: 'Value chains',
    relatedFunderId: 'FND-06',
    strategicImportance: 'Medium', potentialValue: 55000000, currency: 'XAF',
    confidence: 'Low', researcher: 'USR-02', responsible: 'USR-02',
    status: 'Monitoring', priority: 'Medium', nextAction: 'Draft a pre-positioning concept note', nextActionDate: d('2026-10-01'),
    verificationStatus: 'Needs Verification', nextVerification: d('2026-09-28'),
    notes: 'Anticipated, not yet confirmed. Keep verification current.', tags: ['Francophone', 'Value chains'],
    created: d('2026-08-20'), updated: d('2026-08-20'),
  },
];

// Convenience: id -> counter start values for creating new records at runtime.
export const FUNDING_COUNTERS = {
  funder: FUNDERS.length + 1,
  finding: BUSINESS_FINDINGS.length + 1,
  opportunity: FUNDING_OPPORTUNITIES.length + 1,
  application: FUNDING_APPLICATIONS.length + 1,
  action: FUNDING_ACTIONS.length + 1,
};
