// ---------------------------------------------------------------------------
// BALIA Consulting — reference data: services, workflows, countries, products,
// scoring rules, roles and permissions.
// ---------------------------------------------------------------------------

export const TODAY = new Date('2026-09-08T09:00:00');

export type RoleId =
  | 'super_admin'
  | 'admin'
  | 'consultant'
  | 'finance'
  | 'sales'
  | 'training';

export interface Role {
  id: RoleId;
  name: string;
  blurb: string;
  permissions: string[]; // '*' = everything
}

export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    blurb: 'Full system access, configuration and audit',
    permissions: ['*'],
  },
  {
    id: 'admin',
    name: 'Administrator',
    blurb: 'Runs the practice — everything except critical system settings',
    permissions: [
      'dashboard', 'leads', 'companies', 'contacts', 'opportunities', 'consultations',
      'clients', 'projects', 'tasks', 'documents', 'proposals', 'contracts',
      'invoices', 'payments', 'expenses', 'communications', 'calendar',
      'assessments', 'academy', 'reports', 'knowledge', 'management',
      'funding', 'funding.finance',
      'finance.view', 'finance.edit', 'record.edit', 'users.manage',
    ],
  },
  {
    id: 'consultant',
    name: 'Consultant',
    blurb: 'Delivers assigned clients and projects',
    permissions: [
      'dashboard', 'leads', 'companies', 'contacts', 'consultations', 'clients',
      'projects', 'tasks', 'documents', 'proposals', 'communications', 'calendar',
      'assessments', 'knowledge', 'reports', 'funding', 'record.edit', 'scope.assigned',
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    blurb: 'Invoicing, payments, expenses and revenue reporting',
    permissions: [
      'dashboard', 'companies', 'clients', 'projects', 'invoices', 'payments',
      'expenses', 'reports', 'contracts', 'funding', 'funding.finance', 'finance.view', 'finance.edit', 'record.edit',
    ],
  },
  {
    id: 'sales',
    name: 'Sales / Business Development',
    blurb: 'Owns the pipeline from enquiry to signature',
    permissions: [
      'dashboard', 'leads', 'companies', 'contacts', 'opportunities', 'consultations',
      'proposals', 'calendar', 'communications', 'reports', 'knowledge', 'funding', 'record.edit',
    ],
  },
  {
    id: 'training',
    name: 'Training Manager',
    blurb: 'Runs BALIA Academy, cohorts and certification',
    permissions: [
      'dashboard', 'companies', 'contacts', 'academy', 'calendar', 'tasks',
      'knowledge', 'reports', 'record.edit',
    ],
  },
];

export const USER_TYPES = [
  'Super Admin', 'Administrator', 'Consultant', 'Finance', 'Sales / Business Development',
  'Training Manager', 'Instructor', 'Researcher', 'Operations', 'External Expert',
];
export const DEPARTMENTS = [
  'Trade Advisory', 'Customs & Compliance', 'Market Entry', 'Research & Intelligence',
  'Training', 'Finance', 'Business Development', 'Operations', 'Management',
];
export const USER_STATUSES = ['Invited', 'Active', 'Inactive', 'Suspended', 'Deactivated', 'Locked'];

export const SERVICE_CATEGORIES = [
  'AfCFTA',
  'Customs & Trade',
  'Export Readiness',
  'Market Entry',
  'Regulatory Compliance',
  'Training',
] as const;

export interface Service {
  id: string;
  name: string;
  category: (typeof SERVICE_CATEGORIES)[number];
  description: string;
  price: number;
  currency: 'XAF' | 'USD' | 'EUR';
  pricingModel: 'Fixed fee' | 'Day rate' | 'Retainer' | 'Per participant';
  duration: string;
  deliverables: string[];
  requiredDocuments: string[];
  workflow: string[];
  owner: string;
  taxTreatment: string;
}

const WF_EXPORT_READINESS = [
  'Client onboarding',
  'Initial consultation',
  'Document collection',
  'Company assessment',
  'Product assessment',
  'Export capability assessment',
  'Market assessment',
  'Compliance assessment',
  'Gap analysis',
  'Recommendations',
  'Final report',
  'Client presentation',
  'Project completion',
  'Follow-up',
];

const WF_MARKET_ENTRY = [
  'Client onboarding',
  'Scoping workshop',
  'Product & HS classification review',
  'Target market screening',
  'Tariff & rules of origin analysis',
  'Regulatory requirements mapping',
  'Competitor & pricing analysis',
  'Distribution channel mapping',
  'Entry strategy drafting',
  'Final report',
  'Client presentation',
  'Project completion',
];

const WF_EUDR = [
  'Client onboarding',
  'Supply chain scoping',
  'Document collection',
  'Geolocation data review',
  'Due diligence gap analysis',
  'Risk assessment',
  'Compliance register build',
  'Remediation roadmap',
  'Final report',
  'Client presentation',
  'Project completion',
];

const WF_CUSTOMS = [
  'Client onboarding',
  'Customs process walkthrough',
  'Declaration sampling',
  'HS classification review',
  'Valuation & origin review',
  'Findings workshop',
  'Corrective action plan',
  'Final report',
  'Project completion',
];

const WF_AFCFTA = [
  'Client onboarding',
  'Initial consultation',
  'Product portfolio review',
  'Rules of origin analysis',
  'Tariff preference modelling',
  'Corridor & logistics review',
  'Opportunity shortlist',
  'Final report',
  'Client presentation',
  'Project completion',
];

const WF_TRAINING = [
  'Scoping call',
  'Curriculum adaptation',
  'Participant registration',
  'Materials preparation',
  'Delivery',
  'Assessment & certification',
  'Feedback collection',
  'Completion report',
];

export const SERVICES: Service[] = [
  {
    id: 'SVC-01', name: 'AfCFTA Readiness Assessment', category: 'AfCFTA',
    description: 'Structured review of a firm’s ability to trade preferentially under the AfCFTA, covering origin, tariffs, corridors and documentation.',
    price: 5120000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '4–6 weeks',
    deliverables: ['Readiness scorecard', 'Rules of origin position paper', 'Corridor analysis', 'Action roadmap'],
    requiredDocuments: ['Certificate of Incorporation', 'Product specifications', 'Bill of materials', 'Recent export declarations'],
    workflow: WF_AFCFTA, owner: 'USR-01', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-02', name: 'AfCFTA Market Entry Strategy', category: 'AfCFTA',
    description: 'Country-by-country entry plan for intra-African expansion including partner shortlists and preference modelling.',
    price: 8430000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '6–8 weeks',
    deliverables: ['Market screening matrix', 'Entry strategy', 'Partner shortlist', 'Pricing model'],
    requiredDocuments: ['Product catalogue', 'Price list', 'Export history'],
    workflow: WF_MARKET_ENTRY, owner: 'USR-01', taxTreatment: 'Zero-rated (export of services)',
  },
  {
    id: 'SVC-03', name: 'Rules of Origin Advisory', category: 'AfCFTA',
    description: 'Determination of originating status, value-addition modelling and certificate of origin preparation.',
    price: 2530000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '2–3 weeks',
    deliverables: ['Origin determination memo', 'Value-add calculation', 'Certificate template'],
    requiredDocuments: ['Bill of materials', 'Supplier declarations', 'Production process description'],
    workflow: WF_AFCFTA, owner: 'USR-02', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-04', name: 'Customs Compliance Review', category: 'Customs & Trade',
    description: 'Independent review of declarations, classification, valuation and broker performance against CEMAC and national rules.',
    price: 4100000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '3–5 weeks',
    deliverables: ['Declaration audit findings', 'Classification corrections', 'Duty exposure estimate', 'Corrective action plan'],
    requiredDocuments: ['Customs declarations (12 months)', 'Commercial invoices', 'Bills of lading', 'Broker agreements'],
    workflow: WF_CUSTOMS, owner: 'USR-02', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-05', name: 'HS Classification Advisory', category: 'Customs & Trade',
    description: 'Line-by-line tariff classification with binding-ruling support where available.',
    price: 1690000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '1–2 weeks',
    deliverables: ['Classification schedule', 'Justification notes', 'Duty rate comparison'],
    requiredDocuments: ['Product specifications', 'Technical datasheets', 'Photographs'],
    workflow: WF_CUSTOMS, owner: 'USR-03', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-06', name: 'Export Readiness Assessment', category: 'Export Readiness',
    description: 'The BALIA six-dimension diagnostic scoring company, product, export, market, regulatory and logistics readiness.',
    price: 3310000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '3–4 weeks',
    deliverables: ['Trade readiness scorecard', 'Gap analysis', 'Prioritised roadmap', 'Executive presentation'],
    requiredDocuments: ['Certificate of Incorporation', 'Financial statements', 'Product specifications', 'Quality certificates'],
    workflow: WF_EXPORT_READINESS, owner: 'USR-01', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-07', name: 'Export Documentation Package', category: 'Export Readiness',
    description: 'Build and validate the full export documentation set for a given corridor and product.',
    price: 1930000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '2 weeks',
    deliverables: ['Document matrix', 'Completed templates', 'Broker briefing note'],
    requiredDocuments: ['Commercial invoice sample', 'Packing list sample', 'Product certificates'],
    workflow: WF_EXPORT_READINESS, owner: 'USR-03', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-08', name: 'EU Market Entry Assessment', category: 'Market Entry',
    description: 'Feasibility and compliance assessment for entering the European Union, including standards, tariffs and route to market.',
    price: 16500, currency: 'EUR', pricingModel: 'Fixed fee', duration: '8–10 weeks',
    deliverables: ['Market sizing', 'Regulatory requirements dossier', 'Distributor shortlist', 'Landed-cost model', 'Entry roadmap'],
    requiredDocuments: ['Product specifications', 'Test reports', 'Production capacity statement', 'Price list'],
    workflow: WF_MARKET_ENTRY, owner: 'USR-01', taxTreatment: 'Reverse charge (EU B2B)',
  },
  {
    id: 'SVC-09', name: 'Distributor & Partner Identification', category: 'Market Entry',
    description: 'Screened shortlist of vetted distributors, agents or JV partners in a target market with introductions.',
    price: 9500, currency: 'EUR', pricingModel: 'Fixed fee', duration: '6 weeks',
    deliverables: ['Longlist', 'Vetted shortlist', 'Introduction calls', 'Negotiation brief'],
    requiredDocuments: ['Company profile', 'Product catalogue', 'Partnership criteria'],
    workflow: WF_MARKET_ENTRY, owner: 'USR-02', taxTreatment: 'Reverse charge (EU B2B)',
  },
  {
    id: 'SVC-10', name: 'EUDR Readiness & Due Diligence', category: 'Regulatory Compliance',
    description: 'Deforestation-regulation readiness: supply chain mapping, geolocation data, risk assessment and the compliance register.',
    price: 18000, currency: 'EUR', pricingModel: 'Fixed fee', duration: '8–12 weeks',
    deliverables: ['Supply chain map', 'Geolocation dataset review', 'Risk assessment', 'Compliance register', 'Due diligence statement template'],
    requiredDocuments: ['Supplier list', 'Plot geolocation data', 'Land tenure evidence', 'Purchase records'],
    workflow: WF_EUDR, owner: 'USR-01', taxTreatment: 'Reverse charge (EU B2B)',
  },
  {
    id: 'SVC-11', name: 'Product Compliance Assessment', category: 'Regulatory Compliance',
    description: 'Mapping of product standards, labelling, certification and conformity requirements for a target market.',
    price: 6200, currency: 'EUR', pricingModel: 'Fixed fee', duration: '4 weeks',
    deliverables: ['Requirements matrix', 'Labelling review', 'Certification roadmap'],
    requiredDocuments: ['Product specifications', 'Current labels', 'Test reports'],
    workflow: WF_EXPORT_READINESS, owner: 'USR-03', taxTreatment: 'Reverse charge (EU B2B)',
  },
  {
    id: 'SVC-12', name: 'Trade Advisory Retainer', category: 'Customs & Trade',
    description: 'Ongoing advisory access: classification queries, regulatory alerts, monthly corridor briefing and escalation support.',
    price: 1510000, currency: 'XAF', pricingModel: 'Retainer', duration: 'Monthly, rolling',
    deliverables: ['Monthly briefing', 'Unlimited classification queries', 'Regulatory alert service'],
    requiredDocuments: ['Signed engagement letter'],
    workflow: ['Onboarding', 'Monthly briefing cycle', 'Quarterly review'],
    owner: 'USR-01', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-13', name: 'AfCFTA Practitioner Workshop', category: 'Training',
    description: 'Two-day intensive on tariff schedules, rules of origin and the AfCFTA documentary regime.',
    price: 270000, currency: 'XAF', pricingModel: 'Per participant', duration: '2 days',
    deliverables: ['Workshop delivery', 'Bilingual handbook', 'Certificate of completion'],
    requiredDocuments: ['Participant roster'],
    workflow: WF_TRAINING, owner: 'USR-06', taxTreatment: 'VAT 19.25% (CM)',
  },
  {
    id: 'SVC-14', name: 'Customs & Trade Compliance Training', category: 'Training',
    description: 'In-house programme for import/export teams covering declarations, valuation, origin and audit readiness.',
    price: 7230000, currency: 'XAF', pricingModel: 'Fixed fee', duration: '3 days',
    deliverables: ['Tailored curriculum', 'Delivery', 'Assessment', 'Certificates'],
    requiredDocuments: ['Participant roster', 'Sample declarations'],
    workflow: WF_TRAINING, owner: 'USR-06', taxTreatment: 'VAT 19.25% (CM)',
  },
];

export interface Country {
  code: string;
  name: string;
  region: string;
  currency: string;
  languages: string;
  agreements: string[];
  afcfta: 'Ratified' | 'Signed' | 'Trading under AfCFTA' | 'Not a party';
  industries: string[];
  opportunities: string;
  importNotes: string;
  risk: 'Low' | 'Moderate' | 'Elevated' | 'High';
}

export const COUNTRIES: Country[] = [
  { code: 'CM', name: 'Cameroon', region: 'Central Africa', currency: 'XAF', languages: 'French, English', agreements: ['AfCFTA', 'CEMAC', 'ECCAS', 'EU-Central Africa iEPA'], afcfta: 'Trading under AfCFTA', industries: ['Cocoa', 'Timber', 'Aluminium', 'Agro-processing'], opportunities: 'Cocoa value addition under the Abuja Declaration; timber processing for EU-compliant supply chains.', importNotes: 'GUCE single window; pre-shipment inspection above XAF 2m; VAT 19.25%.', risk: 'Moderate' },
  { code: 'NG', name: 'Nigeria', region: 'West Africa', currency: 'NGN', languages: 'English', agreements: ['AfCFTA', 'ECOWAS'], afcfta: 'Trading under AfCFTA', industries: ['Petrochemicals', 'Textiles', 'Food processing', 'Fintech'], opportunities: 'Largest single AfCFTA consumer market; strong demand for processed food and packaging.', importNotes: 'Form M and PAAR required; import prohibition list applies; NAFDAC registration for regulated goods.', risk: 'Elevated' },
  { code: 'GH', name: 'Ghana', region: 'West Africa', currency: 'GHS', languages: 'English', agreements: ['AfCFTA', 'ECOWAS', 'UK-Ghana iEPA'], afcfta: 'Trading under AfCFTA', industries: ['Cocoa', 'Gold', 'Agribusiness'], opportunities: 'AfCFTA Secretariat host; cocoa processing incentives; regional distribution hub.', importNotes: 'ICUMS single window; FDA Ghana registration for food and cosmetics.', risk: 'Low' },
  { code: 'KE', name: 'Kenya', region: 'East Africa', currency: 'KES', languages: 'English, Swahili', agreements: ['AfCFTA', 'EAC', 'COMESA', 'EU-Kenya EPA'], afcfta: 'Trading under AfCFTA', industries: ['Coffee', 'Tea', 'Horticulture', 'Logistics'], opportunities: 'EU-Kenya EPA gives duty-free access; Mombasa corridor serves the Great Lakes.', importNotes: 'KEBS PVoC certificate of conformity mandatory; iCMS declarations.', risk: 'Low' },
  { code: 'TZ', name: 'Tanzania', region: 'East Africa', currency: 'TZS', languages: 'Swahili, English', agreements: ['AfCFTA', 'EAC', 'SADC'], afcfta: 'Ratified', industries: ['Spices', 'Cashew', 'Mining', 'Tourism'], opportunities: 'Spice and cashew value addition; Dar es Salaam corridor to landlocked markets.', importNotes: 'TBS conformity assessment; TANCIS declarations.', risk: 'Moderate' },
  { code: 'RW', name: 'Rwanda', region: 'East Africa', currency: 'RWF', languages: 'Kinyarwanda, English, French', agreements: ['AfCFTA', 'EAC', 'COMESA'], afcfta: 'Trading under AfCFTA', industries: ['Coffee', 'Pharmaceuticals', 'ICT'], opportunities: 'Guided trade initiative participant; strong regulatory predictability.', importNotes: 'Rwanda FDA registration for medicines; electronic single window.', risk: 'Low' },
  { code: 'SN', name: 'Senegal', region: 'West Africa', currency: 'XOF', languages: 'French', agreements: ['AfCFTA', 'ECOWAS', 'UEMOA'], afcfta: 'Trading under AfCFTA', industries: ['Seafood', 'Groundnuts', 'Phosphates'], opportunities: 'EU-approved fishery establishments; strong francophone gateway.', importNotes: 'GAINDE single window; EU health certification for fishery products.', risk: 'Low' },
  { code: 'ZM', name: 'Zambia', region: 'Southern Africa', currency: 'ZMW', languages: 'English', agreements: ['AfCFTA', 'COMESA', 'SADC'], afcfta: 'Trading under AfCFTA', industries: ['Copper', 'Agriculture', 'Manufacturing'], opportunities: 'Copper fabrication for regional infrastructure; landlocked corridor arbitrage.', importNotes: 'ZRA ASYCUDA World; ZABS standards approval.', risk: 'Moderate' },
  { code: 'MA', name: 'Morocco', region: 'North Africa', currency: 'MAD', languages: 'Arabic, French', agreements: ['AfCFTA', 'EU Association Agreement', 'US FTA'], afcfta: 'Signed', industries: ['Automotive', 'Ceramics', 'Phosphates', 'Textiles'], opportunities: 'Established EU supply chains; springboard for West African distribution.', importNotes: 'PortNet single window; CE-equivalent conformity for construction products.', risk: 'Low' },
  { code: 'DE', name: 'Germany', region: 'Europe', currency: 'EUR', languages: 'German', agreements: ['EU Single Market', 'GSP', 'EPAs'], afcfta: 'Not a party', industries: ['Manufacturing', 'Food retail', 'Chemicals'], opportunities: 'Largest EU market for certified cocoa and speciality coffee.', importNotes: 'EUDR applies from 30 December 2026; EU food hygiene rules; CBAM for covered goods.', risk: 'Low' },
  { code: 'FR', name: 'France', region: 'Europe', currency: 'EUR', languages: 'French', agreements: ['EU Single Market', 'EPAs'], afcfta: 'Not a party', industries: ['Food processing', 'Retail', 'Cosmetics'], opportunities: 'Francophone-Africa trade ties; strong speciality food demand.', importNotes: 'EUDR from 30 December 2026; DGCCRF labelling enforcement.', risk: 'Low' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', currency: 'EUR', languages: 'Dutch, English', agreements: ['EU Single Market', 'EPAs'], afcfta: 'Not a party', industries: ['Logistics', 'Cocoa processing', 'Horticulture'], opportunities: 'Rotterdam is the entry point for most African cocoa and timber.', importNotes: 'EUDR from 30 December 2026; strict due diligence documentation at first placement.', risk: 'Low' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', currency: 'GBP', languages: 'English', agreements: ['UK DCTS', 'Bilateral EPAs'], afcfta: 'Not a party', industries: ['Retail', 'Food service', 'Financial services'], opportunities: 'DCTS Enhanced Preferences give tariff-free access for many African goods.', importNotes: 'UKCA marking; BTOM border checks on SPS goods.', risk: 'Low' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East', currency: 'AED', languages: 'Arabic, English', agreements: ['CEPA network', 'GCC'], afcfta: 'Not a party', industries: ['Re-export', 'Logistics', 'Commodities'], opportunities: 'Jebel Ali re-export hub for African commodities into Asia.', importNotes: 'ESMA conformity; halal certification for food products.', risk: 'Low' },
];

export interface LeadScoreRule {
  id: string;
  label: string;
  points: number;
  active: boolean;
}

export const LEAD_SCORE_RULES: LeadScoreRule[] = [
  { id: 'export_plans', label: 'Confirmed export plans', points: 20, active: true },
  { id: 'expansion', label: 'International expansion planned', points: 15, active: true },
  { id: 'target_market', label: 'Specific target market identified', points: 10, active: true },
  { id: 'compliance_issue', label: 'Live compliance problem', points: 15, active: true },
  { id: 'budget', label: 'Budget confirmed', points: 15, active: true },
  { id: 'decision_maker', label: 'Decision maker engaged', points: 15, active: true },
  { id: 'urgent', label: 'Urgent project timeline', points: 10, active: true },
];

export function scoreBand(score: number) {
  if (score >= 81) return { label: 'Very Hot', tone: 'danger' as const };
  if (score >= 61) return { label: 'Hot', tone: 'warning' as const };
  if (score >= 31) return { label: 'Warm', tone: 'gold' as const };
  return { label: 'Cold', tone: 'muted' as const };
}

export const LEAD_STATUSES = [
  'New', 'Contacted', 'Qualified', 'Consultation Scheduled', 'Proposal Required',
  'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Nurture',
] as const;

export const PIPELINE_STAGES = [
  'Qualification', 'Consultation', 'Proposal', 'Negotiation', 'Won', 'Lost',
] as const;

export const STAGE_PROBABILITY: Record<string, number> = {
  Qualification: 20, Consultation: 40, Proposal: 60, Negotiation: 80, Won: 100, Lost: 0,
};

export const LEAD_SOURCES = [
  'Website', 'Google', 'LinkedIn', 'Referral', 'Networking', 'Partner', 'WhatsApp', 'Direct', 'Other',
] as const;

export const MARKETING_COST: Record<string, number> = {
  Website: 3200, Google: 5400, LinkedIn: 4100, Referral: 600, Networking: 2800,
  Partner: 1500, WhatsApp: 400, Direct: 0, Other: 0,
};

export const ASSESSMENT_DIMENSIONS = [
  {
    id: 'company', name: 'Company Readiness', weight: 18,
    questions: [
      { id: 'c1', text: 'Legally registered with current trade licences', max: 5 },
      { id: 'c2', text: 'Financial capacity to fund an export cycle', max: 5 },
      { id: 'c3', text: 'Management commitment and dedicated export owner', max: 5 },
      { id: 'c4', text: 'Production capacity to serve export volumes', max: 5 },
    ],
  },
  {
    id: 'product', name: 'Product Readiness', weight: 18,
    questions: [
      { id: 'p1', text: 'Complete product documentation and specifications', max: 5 },
      { id: 'p2', text: 'Export-grade packaging validated for transit', max: 5 },
      { id: 'p3', text: 'Labelling meets destination-market rules', max: 5 },
      { id: 'p4', text: 'Recognised standards and certifications held', max: 5 },
    ],
  },
  {
    id: 'export', name: 'Export Readiness', weight: 18,
    questions: [
      { id: 'e1', text: 'Prior export experience on this corridor', max: 5 },
      { id: 'e2', text: 'Logistics partners and freight arrangements in place', max: 5 },
      { id: 'e3', text: 'Export documentation set complete and accurate', max: 5 },
      { id: 'e4', text: 'Incoterms understood and correctly applied', max: 5 },
    ],
  },
  {
    id: 'market', name: 'Market Readiness', weight: 18,
    questions: [
      { id: 'm1', text: 'Target market selected on evidence', max: 5 },
      { id: 'm2', text: 'Competitor and pricing analysis completed', max: 5 },
      { id: 'm3', text: 'Distribution route identified', max: 5 },
      { id: 'm4', text: 'Landed-cost model built and tested', max: 5 },
    ],
  },
  {
    id: 'regulatory', name: 'Regulatory Readiness', weight: 18,
    questions: [
      { id: 'r1', text: 'Destination import requirements mapped', max: 5 },
      { id: 'r2', text: 'Product regulations and conformity understood', max: 5 },
      { id: 'r3', text: 'Certificates and permits obtained', max: 5 },
      { id: 'r4', text: 'Origin rules met and evidenced', max: 5 },
    ],
  },
  {
    id: 'logistics', name: 'Logistics Readiness', weight: 10,
    questions: [
      { id: 'l1', text: 'Corridor and port routing decided', max: 5 },
      { id: 'l2', text: 'Customs broker appointed and briefed', max: 5 },
      { id: 'l3', text: 'Cold chain / handling requirements met', max: 5 },
    ],
  },
];

export function readinessBand(score: number) {
  if (score >= 90) return { label: 'Highly Ready', tone: 'success' as const };
  if (score >= 75) return { label: 'Export Ready', tone: 'success' as const };
  if (score >= 60) return { label: 'Developing', tone: 'gold' as const };
  if (score >= 40) return { label: 'Early Stage', tone: 'warning' as const };
  return { label: 'Not Ready', tone: 'danger' as const };
}

export const DOCUMENT_CATEGORIES: Record<string, string[]> = {
  Corporate: ['Certificate of Incorporation', 'Business Registration', 'Tax Clearance', 'Trade Licence'],
  Trade: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin', 'Customs Declaration'],
  Product: ['Product Specification', 'Product Certificate', 'Technical Datasheet', 'HS Classification Note'],
  Compliance: ['Regulatory Certificate', 'EUDR Due Diligence Statement', 'Import Permit', 'Export Permit', 'Phytosanitary Certificate'],
};

export const EXPENSE_CATEGORIES = [
  'Travel', 'Accommodation', 'Transportation', 'Meals', 'Training', 'Software',
  'Marketing', 'Professional fees', 'Office', 'Client expenses', 'Other',
];

export const EMAIL_TEMPLATES = [
  { id: 'ET-01', name: 'New lead acknowledgement', subject: 'Thank you for contacting BALIA Consulting', body: 'Dear {{client_name}},\n\nThank you for your enquiry about {{service_name}}. I have reviewed the details you shared for {{company_name}} and would like to propose a short discovery call this week.\n\nKind regards,\n{{consultant_name}}\nBALIA Consulting' },
  { id: 'ET-02', name: 'Consultation confirmation', subject: 'Your consultation with BALIA Consulting — {{date}}', body: 'Dear {{client_name}},\n\nConfirming our consultation on {{date}}. We will cover your target markets, current compliance position and the fastest route to a decision.\n\n{{consultant_name}}' },
  { id: 'ET-03', name: 'Proposal cover email', subject: 'Proposal {{proposal_number}} — {{project_name}}', body: 'Dear {{client_name}},\n\nPlease find attached our proposal for {{project_name}}, valued at {{proposal_amount}}. The proposal remains valid for 30 days.\n\n{{consultant_name}}' },
  { id: 'ET-04', name: 'Document request', subject: 'Documents required for {{project_name}}', body: 'Dear {{client_name}},\n\nTo progress {{project_name}} we need the following documents uploaded to your BALIA client portal:\n\n{{document_list}}\n\n{{consultant_name}}' },
  { id: 'ET-05', name: 'Invoice', subject: 'Invoice {{invoice_number}} from BALIA Consulting', body: 'Dear {{client_name}},\n\nPlease find invoice {{invoice_number}} for {{invoice_amount}}, due {{due_date}}.\n\nBALIA Consulting — Finance' },
  { id: 'ET-06', name: 'Invoice reminder', subject: 'Reminder: invoice {{invoice_number}} due {{due_date}}', body: 'Dear {{client_name}},\n\nA friendly reminder that invoice {{invoice_number}} for {{invoice_amount}} falls due on {{due_date}}.\n\nBALIA Consulting — Finance' },
  { id: 'ET-07', name: 'Project kickoff', subject: '{{project_name}} — kickoff and next steps', body: 'Dear {{client_name}},\n\nWe are pleased to confirm that {{project_name}} is now active. Your portal has been updated with the workplan and the first document requests.\n\n{{consultant_name}}' },
  { id: 'ET-08', name: 'Contract renewal notice', subject: 'Your BALIA engagement renews on {{date}}', body: 'Dear {{client_name}},\n\nYour engagement with BALIA Consulting is due for renewal on {{date}}. I would welcome a short call to review scope for the coming period.\n\n{{consultant_name}}' },
];

export const CURRENCIES = ['XAF', 'USD', 'EUR', 'GBP'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

// Indicative rates to XAF (BALIA's base currency), used only for portfolio roll-ups.
export const FX_TO_XAF: Record<string, number> = { XAF: 1, USD: 602.41, EUR: 656.63, GBP: 765.06 };
