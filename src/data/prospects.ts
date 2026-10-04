// ===========================================================================
// BALIA — Cameroon & CEMAC Client Prospect Intelligence: data model + seed.
//
// Discipline (§14/§15/§16/§35): companies here are real and researched. We
// store company-level public contact points and the *role* to target for a
// decision-maker — never invented personal names/emails. Anything not
// confirmed against an official/reputable source is marked 'Requires
// Verification' for the BD team to confirm; nothing unverified is labelled
// 'Verified'.
// ===========================================================================
const d = (s: string) => s;

export const PROSPECT_SEGMENTS = [
  'Exporter', 'Importer', 'Manufacturer', 'Agribusiness', 'Logistics / Freight',
  'Distributor / Wholesaler', 'Multinational', 'International company entering CEMAC', 'Institutional client',
] as const;

export const BALIA_SERVICES = [
  'International Trade Advisory', 'Customs Advisory', 'Trade Compliance', 'Import Compliance', 'Export Compliance',
  'Export Readiness', 'Export Development', 'AfCFTA Advisory', 'Market Entry', 'CEMAC Market Expansion',
  'EUDR Advisory', 'Regulatory Compliance', 'Trade Documentation', 'Logistics & Supply Chain Advisory',
  'Market Intelligence', 'International Business Consulting', 'Training', 'Executive Training', 'Research', 'Technical Assistance', 'Business Strategy',
] as const;

export const CEMAC_COUNTRIES = ['Cameroon', 'Gabon', 'Republic of Congo', 'Chad', 'Central African Republic', 'Equatorial Guinea'] as const;
export const OUTREACH_PRIORITIES = ['Contact Now', 'Research First', 'Nurture', 'Partnership', 'Watch', 'Do Not Pursue'] as const;
export const COMMERCIAL_BANDS = ['<$5,000', '$5,000–$15,000', '$15,000–$50,000', '$50,000–$100,000', '$100,000+', 'Unknown — requires qualification'] as const;
export const CONTACT_CONFIDENCE = ['Verified', 'High', 'Medium', 'Low'] as const;
export const PROSPECT_VERIFICATION = ['Verified', 'Requires Verification', 'Unverified'] as const;

export interface ProspectContact {
  role: string; name?: string; title?: string; email?: string; phone?: string;
  linkedin?: string; confidence: string; source?: string;
}
export interface ProspectSource { name: string; url: string; type: string; date: string; }

export interface ClientProspect {
  id: string;
  name: string; legalName?: string; website?: string;
  country: string; city: string; region?: string;
  industry: string; subIndustry?: string; description: string;
  products?: string; size?: string; employees?: string;
  headquarters?: string; parent?: string; established?: string; ownership?: string;
  exportMarkets?: string[]; importMarkets?: string[]; cemacOps?: string;
  segment: string; services: string[];
  whyBalia: string; whyNow: string;
  trigger?: string; triggerDate?: string; triggerSource?: string;
  // §17 score inputs (0-100): serviceFit, tradeExposure, geoFit, trigger,
  // capacity, decisionMaker, accessibility, growth, strategic
  scoreInputs: Record<string, number>;
  conversionProbability: number; conversionConfidence: string;
  commercialPotential: string;
  generalEmail?: string; generalPhone?: string;
  contacts: ProspectContact[]; sources: ProspectSource[];
  researchDate: string; lastVerified: string; verificationStatus: string;
  owner: string; notes?: string;
  addedToCrm?: boolean; companyId?: string;
}

// Helper for compact seed authoring.
const si = (serviceFit: number, tradeExposure: number, geoFit: number, trigger: number, capacity: number, decisionMaker: number, accessibility: number, growth: number, strategic: number) =>
  ({ serviceFit, tradeExposure, geoFit, trigger, capacity, decisionMaker, accessibility, growth, strategic });

export const CLIENT_PROSPECTS: ClientProspect[] = [
  {
    id: 'PRO-01', name: 'Telcar Cocoa Ltd', legalName: 'Telcar Cocoa Ltd', website: 'telcarcocoacm.com',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Agribusiness', subIndustry: 'Cocoa export & processing',
    description: "Cameroon's leading cocoa exporter — 32.4% of national cocoa-bean exports in 2025/26 (40,631 t; ~CFAF133bn FOB) per the National Cocoa & Coffee Board. Founded by Kate Fotso; formerly partnered with Cargill. Organic/Fair Trade/HACCP certified.",
    products: 'Cocoa beans, cocoa butter/powder, coffee', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Douala (BP Bonabéri)', parent: '—', established: '—', ownership: 'Cameroonian private',
    exportMarkets: ['EU', 'Americas', 'Asia'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['EUDR Advisory', 'Export Compliance', 'Trade Documentation', 'Market Intelligence'],
    whyBalia: "Cameroon's #1 cocoa exporter with a heavily EU-facing supply chain. The EU Deforestation Regulation creates concrete demand for EUDR readiness, geolocation traceability and due-diligence statements, plus ongoing export-compliance and documentation support.",
    whyNow: 'EUDR applies to cocoa placed on the EU market (large operators from 30 Dec 2026; micro/small 30 Jun 2027). Cameroon cocoa volumes and EU access are under pressure — traceability readiness is time-critical.',
    trigger: 'EUDR enforcement timeline for cocoa', triggerDate: d('2026-12-30'), triggerSource: 'EU Deforestation Regulation',
    scoreInputs: si(95, 95, 100, 90, 80, 60, 55, 75, 85), conversionProbability: 55, conversionConfidence: 'Medium', commercialPotential: '$50,000–$100,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Sustainability / Traceability Manager (EUDR)', confidence: 'Low', source: 'Role to target — confirm individual via company / LinkedIn' },
      { role: 'Export Manager', confidence: 'Low', source: 'Role to target' },
      { name: 'Kate Fotso', title: 'Founder & Director', role: 'Founder', confidence: 'High', source: 'Public (Forbes Africa, Wikipedia) — no personal email published' },
    ],
    sources: [
      { name: 'National Cocoa & Coffee Board data (via Food Business MEA)', url: 'foodbusinessmea.com/telcar-cocoa-regains-top-spot-as-cameroons-leading-exporter', type: 'Reputable news', date: d('2026-09-11') },
      { name: 'Business in Cameroon', url: 'businessincameroon.com', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Flagship EUDR prospect. Approach via the sustainability/traceability function; verify a named contact before outreach.',
  },
  {
    id: 'PRO-02', name: 'Africa Global Logistics Cameroon (AGL)', legalName: 'Africa Global Logistics Cameroun', website: 'aglgroup.com',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Logistics / Freight', subIndustry: 'Port handling, rail, customs clearance',
    description: 'Leading logistics operator in Cameroon (MSC group). Operates rail via Camrail, port handling at Kribi Container Terminal and the Douala wooden terminal, customs clearance and corridor logistics; 5,000+ employees.',
    products: 'Freight forwarding, port handling, customs clearance, rail, corridor logistics', size: 'Large', employees: '5,000+',
    headquarters: 'Bonanjo, Vallée Tokoto, Douala', parent: 'MSC Group', established: '—', ownership: 'Foreign (MSC)',
    exportMarkets: [], importMarkets: [], cemacOps: 'Cameroon, CEMAC corridors',
    segment: 'Logistics / Freight', services: ['Customs Advisory', 'Trade Compliance', 'CEMAC Market Expansion', 'Training', 'Logistics & Supply Chain Advisory'],
    whyBalia: 'A major customs-clearance and corridor operator whose clients need trade-facilitation and compliance depth. Potential for customs-process advisory, CEMAC corridor optimisation, trade-compliance training for staff, and joint client-facing advisory.',
    whyNow: 'Invested ~CFA1bn in new Douala port bagging/handling equipment (Nov 2025) to grow bulk-import volumes — an active expansion that raises demand for process, compliance and training support.',
    trigger: 'CFA1bn Douala port equipment investment', triggerDate: d('2025-11-25'), triggerSource: 'Business in Cameroon',
    scoreInputs: si(85, 90, 100, 75, 90, 55, 70, 75, 80), conversionProbability: 45, conversionConfidence: 'Medium', commercialPotential: '$50,000–$100,000',
    generalEmail: '', generalPhone: '+237 2 33 50 12 12', contacts: [
      { role: 'Customs / Compliance Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Operations Director', confidence: 'Low', source: 'Role to target' },
      { role: 'Country Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'AGL Group', url: 'aglgroup.com/en/News/Africa-Global-Logistics-Cameroun-et-socopao', type: 'Official company', date: d('2026-09-11') },
      { name: 'Business in Cameroon (CFA1bn investment)', url: 'businessincameroon.com/public-management/2711-15408-agl-cameroun-invests-cfa1-bn-to-upgrade-operations-at-douala-port', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Large account; may be as valuable as a delivery partner (corridor advisory) as a client. General switchboard listed publicly; verify a named contact.',
  },
  {
    id: 'PRO-03', name: 'Société Anonyme des Boissons du Cameroun (SABC)', legalName: 'Société Anonyme des Brasseries du Cameroun', website: 'boissonsducameroun.com',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Manufacturing', subIndustry: 'Beverages, glass packaging (Socaver), mineral water (SEMC)',
    description: "Cameroon's largest brewery and beverages group (founded 1948, Castel Group; Heineken minority). Second-largest state taxpayer after oil. Five plants; subsidiaries Socaver (glass) and SEMC (Tangui water). Bottles Coca-Cola products.",
    products: 'Beer, soft drinks, energy drinks, mineral water, glass packaging', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: '77 rue du Prince Bell, BP 4036, Douala', parent: 'Castel Group (BGI)', established: '1948', ownership: 'Foreign (Castel 75%, Heineken 8.8%)',
    exportMarkets: [], importMarkets: ['EU', 'International (raw materials, packaging, equipment)'], cemacOps: 'Cameroon; historic Equatorial Guinea plant',
    segment: 'Manufacturer', services: ['Import Compliance', 'Customs Advisory', 'Logistics & Supply Chain Advisory', 'Trade Compliance', 'Executive Training'],
    whyBalia: 'A large manufacturer importing significant raw materials, packaging and equipment — a natural fit for customs/import-compliance optimisation, tariff and supply-chain advisory, and trade-compliance training across a multi-plant footprint.',
    whyNow: 'Running a CFAF200bn (~US$325m) 2023–2027 investment programme (new lines in Yaoundé, Bafoussam, Garoua) after acquiring Guinness Cameroon assets — heavy capital-goods and input imports underway.',
    trigger: 'CFAF200bn 2023–2027 investment programme', triggerDate: d('2022-12-13'), triggerSource: 'Investir au Cameroun / Food Business MEA',
    scoreInputs: si(80, 75, 100, 70, 95, 55, 60, 70, 80), conversionProbability: 40, conversionConfidence: 'Medium', commercialPotential: '$50,000–$100,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Supply Chain Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Procurement Director', confidence: 'Low', source: 'Role to target' },
      { name: 'Stéphane Descazeaud', title: 'General Manager', role: 'General Manager', confidence: 'Medium', source: 'Public (press, 2022) — confirm current tenure; no personal email published' },
    ],
    sources: [
      { name: 'Boissons du Cameroun (official)', url: 'boissonsducameroun.com/histoire', type: 'Official company', date: d('2026-09-11') },
      { name: 'Investir au Cameroun (CFAF200bn programme)', url: 'investiraucameroun.com', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Large, professionalised buyer — likely to spend on advisory. Approach via supply-chain/procurement.',
  },
  {
    id: 'PRO-04', name: 'OFI Cam (Olam Food Ingredients Cameroon)', legalName: 'OFI Cam', website: 'ofi.com',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Agribusiness', subIndustry: 'Cocoa export & processing',
    description: "Cameroon's #2 cocoa exporter in 2025/26 — 24,394 t / 19.4% share (NCCB). Part of ofi (Olam Food Ingredients), a global cocoa/coffee supply-chain group.",
    products: 'Cocoa beans and products', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Douala', parent: 'ofi / Olam Group', established: '—', ownership: 'Foreign (Olam)',
    exportMarkets: ['EU', 'International'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['EUDR Advisory', 'Export Compliance', 'Trade Documentation', 'Market Intelligence'],
    whyBalia: 'Major EU-facing cocoa exporter with the same EUDR/traceability exposure as the market leader. ofi runs its own sustainability programmes, so BALIA is best positioned for supplementary local compliance, documentation and supplier-traceability support.',
    whyNow: 'EUDR cocoa timeline (large operators from 30 Dec 2026; micro/small 30 Jun 2027) plus sharp 2025/26 volume swings across Cameroon cocoa exporters.',
    trigger: 'EUDR enforcement timeline for cocoa', triggerDate: d('2026-12-30'), triggerSource: 'EU Deforestation Regulation',
    scoreInputs: si(90, 90, 100, 85, 85, 50, 55, 70, 70), conversionProbability: 35, conversionConfidence: 'Medium', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Sustainability / Traceability Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Country Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [{ name: 'NCCB export data (via Food Business MEA)', url: 'foodbusinessmea.com/telcar-cocoa-regains-top-spot-as-cameroons-leading-exporter', type: 'Reputable news', date: d('2026-09-11') }],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Multinational parent runs its own compliance; scope BALIA value carefully (local/supplementary). Confirm the Cameroon entity contact.',
  },
  {
    id: 'PRO-05', name: 'SODECOTON', legalName: 'Société de Développement du Coton du Cameroun', website: 'sodecoton.cm',
    country: 'Cameroon', city: 'Garoua', region: 'North',
    industry: 'Agribusiness', subIndustry: 'Cotton production, ginning & export; cottonseed oil',
    description: 'Major Cameroonian cotton company (state + Geocoton), a leading cotton-lint exporter based in Garoua, with associated cottonseed-oil production. A cornerstone of the northern Cameroon economy.',
    products: 'Cotton lint, cottonseed, edible oil (Diamaor)', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Garoua', parent: 'State of Cameroon / Geocoton', established: '1974', ownership: 'State + foreign',
    exportMarkets: ['Asia', 'EU'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['Export Development', 'EUDR Advisory', 'Market Intelligence', 'Trade Documentation', 'AfCFTA Advisory'],
    whyBalia: 'A large lint exporter facing evolving sustainability/traceability expectations in cotton value chains and shifting export destinations — scope for export-market intelligence, documentation and emerging due-diligence advisory.',
    whyNow: 'No current trigger independently confirmed this session — verify recent investment/market-access developments before outreach.',
    scoreInputs: si(80, 85, 100, 40, 75, 45, 50, 60, 70), conversionProbability: 30, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [{ role: 'Export / Commercial Director', confidence: 'Low', source: 'Role to target' }],
    sources: [{ name: 'General industry knowledge — pending official-source check', url: 'sodecoton.cm', type: 'Requires verification', date: d('2026-09-11') }],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Requires Verification', owner: 'USR-05',
    notes: 'Real, well-known company but not fully verified this session — confirm website, current status and a contact before working it.',
  },
  {
    id: 'PRO-06', name: 'Cameroon Development Corporation (CDC)', legalName: 'Cameroon Development Corporation', website: 'cdc-cameroon.net',
    country: 'Cameroon', city: 'Limbe', region: 'South-West',
    industry: 'Agribusiness', subIndustry: 'Rubber, palm oil, banana — plantation & export',
    description: 'One of Cameroon\u2019s largest agro-industrial employers and its second-biggest after the public service (state-owned, est. 1947). At end-2016 its plantations covered 38,537 ha — 20,695 ha rubber, 13,945 ha oil palm, 3,897 ha banana. Now the only domestically-owned banana exporter (42,286 t in the reported period); operations were disrupted by the 2019 North-West/South-West conflict.',
    products: 'Natural rubber, palm oil, bananas', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Bota, Limbe', parent: 'State of Cameroon', established: '1947', ownership: 'State',
    exportMarkets: ['EU', 'International'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Agribusiness', services: ['EUDR Advisory', 'Export Compliance', 'Regulatory Compliance', 'Technical Assistance'],
    whyBalia: 'Rubber and palm are EUDR-relevant commodities; a large plantation exporter to the EU has clear potential demand for deforestation-due-diligence, traceability and export-compliance support.',
    whyNow: 'Rubber and palm are EUDR-regulated commodities and CDC exports to the EU; national banana exports grew sharply in 2025. Operational recovery post-conflict plus EUDR timelines create demand for deforestation due-diligence and export-compliance support.',
    trigger: 'EUDR (rubber/palm) + post-conflict operational recovery', triggerDate: d('2026-12-30'), triggerSource: 'EUDR + INS/Assobacam export data',
    scoreInputs: si(85, 80, 100, 65, 70, 50, 45, 55, 75), conversionProbability: 34, conversionConfidence: 'Medium', commercialPotential: '$15,000\u2013$50,000',
    generalEmail: '', generalPhone: '', contacts: [{ role: 'Regulatory / Compliance Manager', confidence: 'Low', source: 'Role to target' }],
    sources: [
      { name: 'Wikipedia — Cameroon Development Corporation (plantation areas, employer status)', url: 'en.wikipedia.org/wiki/Cameroon_Development_Corporation', type: 'Reputable secondary', date: d('2026-09-11') },
      { name: 'Fruitnet (only state-owned banana exporter; export volumes)', url: 'fruitnet.com/eurofruit/compagnie-fruitiere-grows-share-of-cameroon-banana-export-deal/271040.article', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Confirmed against reputable sources 2026-09-11. Note post-2019 operational disruption in the South-West; confirm current capacity and a named contact before outreach.',
  },
  {
    id: 'PRO-07', name: 'Congelcam S.A.', legalName: 'Congelcam S.A.', website: '',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Import / Distribution', subIndustry: 'Frozen fish import & distribution',
    description: 'One of Cameroon\u2019s largest importers and distributors of frozen fish, with nationwide cold-chain distribution.',
    products: 'Frozen fish, seafood', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Douala', parent: '—', established: '—', ownership: 'Cameroonian private',
    exportMarkets: [], importMarkets: ['International (frozen fish)'], cemacOps: 'Cameroon',
    segment: 'Importer', services: ['Import Compliance', 'Customs Advisory', 'Trade Documentation', 'Regulatory Compliance'],
    whyBalia: 'A high-volume importer of a regulated food product — natural fit for customs/import-compliance optimisation, tariff and documentation advisory, and sanitary/regulatory navigation.',
    whyNow: 'No current trigger independently confirmed this session.',
    scoreInputs: si(80, 70, 100, 40, 70, 45, 45, 55, 60), conversionProbability: 28, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [{ role: 'Import / Customs Manager', confidence: 'Low', source: 'Role to target' }],
    sources: [{ name: 'General industry knowledge — pending official-source check', url: '', type: 'Requires verification', date: d('2026-09-11') }],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Requires Verification', owner: 'USR-05',
    notes: 'Real, major importer; no official website confirmed — verify company details and contact before outreach.',
  },
  {
    id: 'PRO-08', name: 'Olam Gabon', legalName: 'Olam Gabon', website: 'olamgroup.com',
    country: 'Gabon', city: 'Libreville', region: '—',
    industry: 'Agribusiness', subIndustry: 'Palm oil, rubber, agri-logistics (GSEZ/Nkok linkage)',
    description: 'Major agri-industrial investor in Gabon (Olam group) across palm oil, rubber and agri-logistics, closely tied to Gabon\u2019s special economic zone and export infrastructure.',
    products: 'Palm oil, rubber, agri commodities', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Libreville', parent: 'Olam Group', established: '—', ownership: 'Foreign (Olam)',
    exportMarkets: ['EU', 'International'], importMarkets: [], cemacOps: 'Gabon (CEMAC)',
    segment: 'Agribusiness', services: ['EUDR Advisory', 'Export Compliance', 'CEMAC Market Expansion', 'Market Intelligence'],
    whyBalia: 'Palm and rubber are EUDR-relevant; a large CEMAC exporter with EU exposure fits BALIA\u2019s deforestation-due-diligence and export-compliance offer, and anchors CEMAC (Gabon) coverage.',
    whyNow: 'EUDR covers palm oil and rubber — verify Olam Gabon\u2019s current EU-export exposure and local decision structure before outreach.',
    scoreInputs: si(85, 85, 70, 45, 80, 45, 45, 60, 65), conversionProbability: 25, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [{ role: 'Sustainability / Country Manager', confidence: 'Low', source: 'Role to target' }],
    sources: [{ name: 'General industry knowledge — pending official-source check', url: 'olamgroup.com', type: 'Requires verification', date: d('2026-09-11') }],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Requires Verification', owner: 'USR-05',
    notes: 'CEMAC (Gabon) anchor; multinational parent runs its own compliance — scope BALIA value carefully. Verify entity and contact.',
  },
  {
    id: 'PRO-09', name: 'SOCAPALM (Société Camerounaise de Palmeraies)', legalName: 'Société Camerounaise de Palmeraies', website: 'socfin.com',
    country: 'Cameroon', city: 'Douala / Edéa', region: 'Littoral & South',
    industry: 'Agribusiness', subIndustry: 'Palm oil production & processing',
    description: "Cameroon's largest palm-oil producer (~41-51% of national output; 78,500+ ha), part of the Socfin group (Bolloré/Fabri) and listed on the Douala Stock Exchange. Sister company Safacam produces rubber and palm kernel oil (RSPO-certified 2020).",
    products: 'Crude & refined palm oil, palm kernel oil', size: 'Large', employees: '~3,200 (group ~30,000 dependents)',
    headquarters: 'Douala', parent: 'Socfin group', established: '—', ownership: 'Foreign (Socfin/Bolloré) — DSX-listed',
    exportMarkets: ['Regional', 'EU (group)'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Agribusiness', services: ['EUDR Advisory', 'Regulatory Compliance', 'Technical Assistance', 'Trade Documentation'],
    whyBalia: 'Palm oil and (via Safacam) rubber are EUDR-regulated commodities, and the group is under sustained NGO and buyer scrutiny on land rights and traceability. That creates demand for deforestation due-diligence, traceability and regulatory-compliance support — best scoped as local/supplementary work, since the multinational parent runs its own programmes.',
    whyNow: 'CFAF38.2bn Littoral plantation-extension convention with the government, plus EUDR timelines for palm/rubber and 2025 NGO reports prompting corrective action plans.',
    trigger: 'CFAF38.2bn expansion + EUDR + 2025 sustainability action plans', triggerDate: d('2025-02-17'), triggerSource: 'Investir au Cameroun / Earthworm Foundation reports',
    scoreInputs: si(85, 70, 100, 80, 90, 55, 50, 65, 70), conversionProbability: 30, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Sustainability / Compliance Manager', confidence: 'Low', source: 'Role to target' },
      { name: 'Joseph Mengue Mendouga', title: 'Directeur Général', role: 'General Manager', confidence: 'Medium', source: 'Public (Socfin/press) — confirm current tenure; no personal email published' },
    ],
    sources: [
      { name: 'Socfin (official)', url: 'socfin.com/en/locations/socapalm', type: 'Official company', date: d('2026-09-11') },
      { name: 'Investir au Cameroun (CFAF38.2bn expansion)', url: 'investiraucameroun.com/tags/socapalm', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Sensitive account: ongoing land-rights/human-rights controversy. Position advisory carefully (compliance/traceability improvement), and weigh reputational considerations before engaging.',
  },
  {
    id: 'PRO-10', name: 'CIMENCAM (Cimenteries du Cameroun)', legalName: 'Cimenteries du Cameroun', website: 'cimencam.cm',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Manufacturing', subIndustry: 'Cement production & clinker/cement import',
    description: "Cameroon's long-standing leading cement producer (Holcim / LafargeHolcim Maroc Afrique; est. 1963; ~1.5-2.3 Mt/yr). Plants at Bonabéri (clinker crushing), Figuil (integrated) and a Yaoundé concrete plant; 8 depots. Also authorised to import cement and imports clinker.",
    products: 'Cement, clinker, ready-mix concrete', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Douala (BP 1323)', parent: 'Holcim (LafargeHolcim Maroc Afrique)', established: '1963', ownership: 'Foreign (Holcim)',
    exportMarkets: [], importMarkets: ['Clinker/cement (Congo, Egypt, group affiliates)'], cemacOps: 'Cameroon',
    segment: 'Manufacturer', services: ['Import Compliance', 'Customs Advisory', 'Logistics & Supply Chain Advisory', 'Trade Compliance', 'Executive Training'],
    whyBalia: 'A large manufacturer that also imports clinker and cement (HS 2523) — a strong fit for customs/import-compliance optimisation, tariff and supply-chain advisory, and trade-compliance training across a multi-plant, multi-depot network.',
    whyNow: 'Inaugurated a new clinker/cement line at Figuil (12 Jun 2025) and is defending share as the market liberalises and competitors (Dangote, Cimaf, Medcem, Cimpor) expand — sharpening focus on cost, imports and compliance.',
    trigger: 'New Figuil clinker line (Jun 2025) + market liberalisation', triggerDate: d('2025-06-12'), triggerSource: 'Business in Cameroon / Global Cement',
    scoreInputs: si(80, 70, 100, 70, 95, 55, 65, 65, 75), conversionProbability: 38, conversionConfidence: 'Medium', commercialPotential: '$50,000–$100,000',
    generalEmail: '', generalPhone: '+237 654 900 000', contacts: [
      { role: 'Procurement / Supply Chain Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Customs / Import Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'SNI company profile (HQ, phone)', url: 'sni.cm/index.php/en/secondary-sector-en/95-cameroon-cement-corporation.html', type: 'Government/institutional', date: d('2026-09-11') },
      { name: 'Global Cement (Figuil line)', url: 'globalcement.com/news/itemlist/tag/CIMENCAM', type: 'Reputable news', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'General switchboard published on the SNI profile; a customer-service email is referenced there — confirm the current domain before use. Approach via procurement/supply-chain.',
  },
  {
    id: 'PRO-11', name: 'Gabon Special Economic Zone (GSEZ Nkok)', legalName: 'Gabon Special Economic Zone SA', website: 'gsez.com',
    country: 'Gabon', city: 'Nkok (Libreville)', region: 'Estuaire',
    industry: 'Institutional / Industrial zone', subIndustry: 'Timber-processing SEZ & export cluster',
    description: 'Multi-sector special economic zone 27 km from Libreville (PPP between Arise IIP and the Gabonese State). Hosts 144 investors from 16 countries incl. an 84-company wood-processing cluster; made Gabon the world\'s #2 veneer exporter. Runs the TraCer log-traceability system.',
    products: 'Zone infrastructure & services; tenants export veneer, plywood, sawn timber, furniture', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Nkok, Gabon', parent: 'Arise IIP / Republic of Gabon (CDC)', established: '2010', ownership: 'PPP (Arise IIP + State)',
    exportMarkets: ['EU', 'Asia', 'International'], importMarkets: [], cemacOps: 'Gabon (CEMAC)',
    segment: 'Institutional client', services: ['EUDR Advisory', 'Trade Documentation', 'CEMAC Market Expansion', 'Technical Assistance', 'Training', 'Logistics & Supply Chain Advisory'],
    whyBalia: 'Timber is a flagship EUDR commodity and the Nkok cluster is heavily EU-facing, with documented traceability gaps in the sector. GSEZ is a gateway to ~84 wood exporters that need EUDR readiness, due-diligence and export-documentation support — best pursued as a zone-level partnership plus advisory to individual tenants.',
    whyNow: 'EUDR timber timeline combined with reported weaknesses in Nkok timber traceability (TraCer suspension episodes; EIA forest-crime findings) make deforestation-due-diligence support time-critical for EU-facing tenants.',
    trigger: 'EUDR timber timeline + Nkok traceability gaps', triggerDate: d('2026-12-30'), triggerSource: 'EUDR + Mongabay/EIA reporting',
    scoreInputs: si(90, 90, 80, 80, 85, 45, 55, 80, 90), conversionProbability: 30, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Zone / Sustainability Director (partnership)', confidence: 'Low', source: 'Role to target' },
      { role: 'Tenant Relations / Trade Facilitation lead', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'GSEZ (official)', url: 'gsez.com/en/gsez-nkok', type: 'Official company', date: d('2026-09-11') },
      { name: 'Arise IIP', url: 'ariseiip.com/project/gsez', type: 'Official company', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'CEMAC (Gabon) anchor and a partnership gateway to the wood-export cluster. Best entered as a zone-level partnership; individual tenants are downstream prospects.',
  },
  {
    id: 'PRO-12', name: 'ALPICAM-GRUMCAM (ALPI Group Cameroon)', legalName: 'Alpicam Industries SARL / Grumcam', website: 'alpi.it',
    country: 'Cameroon', city: 'Douala / East region concessions', region: 'Littoral & East',
    industry: 'Agribusiness', subIndustry: 'Timber — logging, processing & veneer export',
    description: 'Integrated Cameroon timber operator (Italy\'s ALPI Group, since 1975) via Alpicam Industries, Grumcam and Alpi Pietro et fils. Manages ~300,000+ ha of FSC-certified concessions (353,388 ha certified in 2023); produces veneer (ALPIlignum), plywood and sawn timber for global export.',
    products: 'Veneer, plywood, sliced/sawn timber, logs', size: 'Large', employees: '~1,300 in Africa',
    headquarters: 'Douala', parent: 'ALPI Group (Italy)', established: '1975', ownership: 'Foreign (ALPI)',
    exportMarkets: ['Italy', 'France', 'Spain', 'Belgium', 'UK', 'China', 'USA', 'International'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['EUDR Advisory', 'Trade Documentation', 'Export Compliance', 'Regulatory Compliance'],
    whyBalia: 'Timber is a flagship EUDR commodity and ALPICAM is heavily EU-facing. FSC certification is necessary but not sufficient for EUDR, which additionally requires geolocation data and due-diligence statements — a precise, timely fit for BALIA EUDR-readiness, due-diligence and export-documentation support.',
    whyNow: 'EUDR timber obligations (large operators from 30 Dec 2026; micro/small 30 Jun 2027) require operator-level due-diligence statements even for FSC-certified wood entering the EU.',
    trigger: 'EUDR timber timeline', triggerDate: d('2026-12-30'), triggerSource: 'EU Deforestation Regulation',
    scoreInputs: si(90, 90, 100, 85, 80, 55, 55, 65, 80), conversionProbability: 40, conversionConfidence: 'Medium', commercialPotential: '$50,000\u2013$100,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Certification / Sustainability Manager (EUDR)', confidence: 'Low', source: 'Role to target' },
      { role: 'Export Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'ALPI (official — FSC certification, operations)', url: 'alpi.it/en/news/alpi+forests+in+cameroon+obtain+fsc%C2%AE+certification/157', type: 'Official company', date: d('2026-09-11') },
      { name: 'ATIBT / Fair&Precious (operator profile)', url: 'fair-and-precious.org/en/p/104/alpicam-grumcam', type: 'Reputable secondary', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Strong, timely EUDR prospect. Lead with the FSC-vs-EUDR gap (due-diligence statements, geolocation). Confirm a named certification/export contact.',
  },
  {
    id: 'PRO-13', name: 'Plantations du Haut Penja (PHP)', legalName: 'Plantations du Haut Penja', website: 'compagniefruitiere.fr',
    country: 'Cameroon', city: 'Njombé-Penja (Moungo)', region: 'Littoral',
    industry: 'Agribusiness', subIndustry: 'Banana (also cocoa, Penja pepper) — EU export',
    description: "Cameroon's largest banana producer (~45-50% of national output; ~260,000 t/yr) and its largest private employer (~6,000 staff). A subsidiary of France's Compagnie Fruitière (Marseille); also grows cocoa and PGI-protected Penja pepper. President Armel François also chairs the GICAM employers' association.",
    products: 'Bananas, cocoa, Penja pepper (EU PGI), exotic flowers', size: 'Large', employees: '~6,000',
    headquarters: 'Njombé-Penja', parent: 'Compagnie Fruitière (France)', established: '1973', ownership: 'Foreign (Compagnie Fruitière)',
    exportMarkets: ['EU', 'Morocco', 'Chad', 'Nigeria'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['Export Compliance', 'Trade Documentation', 'Market Intelligence', 'EUDR Advisory', 'Regulatory Compliance'],
    whyBalia: 'A major EU-facing agri-exporter: bananas need tight export documentation and standards; its cocoa arm carries EUDR exposure; and Penja pepper is an EU-protected geographical indication. That spans export-compliance, documentation, market-intelligence and EUDR advisory.',
    whyNow: 'Cameroon banana exports jumped 84.7% to CFA67.7bn (\u20ac103.2m) in 2025; the group consolidated share by acquiring Boh Plantations\u2019 assets. Leadership also sits atop GICAM, opening a wider BD network.',
    trigger: 'Record 2025 banana export growth + Boh Plantations consolidation', triggerDate: d('2026-03-30'), triggerSource: 'Fruitnet / INS',
    scoreInputs: si(80, 90, 100, 75, 90, 55, 55, 70, 80), conversionProbability: 33, conversionConfidence: 'Medium', commercialPotential: '$50,000\u2013$100,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Export / Quality & Compliance Manager', confidence: 'Low', source: 'Role to target' },
      { name: 'Armel François', title: 'President (PHP) & GICAM chair', role: 'President', confidence: 'Medium', source: 'Public (GICAM/press) — no personal email published' },
    ],
    sources: [
      { name: 'Fruitnet (PHP export volumes, market share)', url: 'fruitnet.com/eurofruit/cameroon-sees-july-surge-in-banana-exports/272430.article', type: 'Reputable news', date: d('2026-09-11') },
      { name: 'Wikipedia FR — Plantations du Haut-Penja', url: 'fr.wikipedia.org/wiki/Plantations_du_Haut-Penja', type: 'Reputable secondary', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Sensitive account: labour/environmental NGO scrutiny (Oxfam, TI Cameroon). Position advisory carefully; GICAM leadership tie is a useful network entry.',
  },
  {
    id: 'PRO-14', name: 'CotonTchad Société Nouvelle (CotonTchad SN)', legalName: 'CotonTchad Société Nouvelle', website: 'olamagri.com',
    country: 'Chad', city: 'Moundou', region: 'Logone Occidental',
    industry: 'Agribusiness', subIndustry: 'Cotton — ginning & lint export; cottonseed oil',
    description: "Chad's sole cotton aggregator, ginner and exporter (est. 1971; privatised 2018 with Olam Agri holding 60%, State 35%, farmer coops 5%). Runs 8 ginning units and a cotton-oil refinery in the south; ~770 staff working with 200,000-270,000 smallholder farmers. Cotton is ~40% of Chad's exports.",
    products: 'Cotton lint, cottonseed, cotton oil', size: 'Large', employees: '~770 (+230,000 farmers)',
    headquarters: 'Moundou', parent: 'Olam Agri (60%) / State of Chad (35%)', established: '1971', ownership: 'Olam + State',
    exportMarkets: ['Asia', 'EU', 'International'], importMarkets: [], cemacOps: 'Chad (CEMAC)',
    segment: 'Exporter', services: ['Export Development', 'Market Intelligence', 'Trade Documentation', 'AfCFTA Advisory', 'Technical Assistance'],
    whyBalia: 'The single gateway for all Chadian cotton exports, with active sustainability and productivity programmes and shifting export destinations — scope for export-market intelligence, documentation, AfCFTA positioning and traceability/due-diligence support. Anchors BALIA CEMAC (Chad) coverage.',
    whyNow: 'Olam-led restructuring targeting higher cottonseed output, plus climate-resilience and sustainable-cotton partnerships (IDH, Better Cotton) — an active transformation programme.',
    trigger: 'Olam-led restructuring + sustainable-cotton partnerships', triggerDate: d('2022-10-19'), triggerSource: 'IDH / Olam Agri',
    scoreInputs: si(80, 85, 70, 60, 80, 45, 45, 60, 70), conversionProbability: 26, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Export / Commercial Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Sustainability Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'Olam Agri (official — Chad operations)', url: 'olamagri.com/locations/chad', type: 'Official company', date: d('2026-09-11') },
      { name: 'IDH Sustainable Trade (ownership, farmers)', url: 'idhsustainabletrade.com/cotton-landscape-chad', type: 'Reputable secondary', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'CEMAC (Chad) anchor. Multinational (Olam) parent runs its own programmes — scope BALIA value as supplementary/local. Confirm Moundou entity contact.',
  },
  {
    id: 'PRO-15', name: 'Congolaise Industrielle des Bois (CIB)', legalName: 'Congolaise Industrielle des Bois', website: 'olamagri.com',
    country: 'Republic of Congo', city: 'Pokola / Brazzaville', region: 'Sangha',
    industry: 'Agribusiness', subIndustry: 'Timber — forest management, processing & export',
    description: "Congo's pioneer sustainable-timber operator (Olam Agri subsidiary, since 1968). Manages ~1.8-2 million hectares across five concessions (Pokola, Loundoungou, Kabo, Pikounda, Mimbeli-Ibenga); ~1.3M ha FSC-certified — the largest FSC-certified tropical forest in Africa. ~300,000 m3 of logs/yr processed in three industrial units.",
    products: 'Logs, sawn timber, kiln-dried timber, finished wood products', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Pokola (Republic of Congo)', parent: 'Olam Agri', established: '1968', ownership: 'Foreign (Olam)',
    exportMarkets: ['EU', 'Asia', 'International'], importMarkets: [], cemacOps: 'Republic of Congo (CEMAC)',
    segment: 'Exporter', services: ['EUDR Advisory', 'Trade Documentation', 'Export Compliance', 'Technical Assistance'],
    whyBalia: 'Timber is a flagship EUDR commodity and CIB is heavily EU-facing. FSC certification does not satisfy EUDR on its own (which needs geolocation and operator due-diligence statements), so there is a precise fit for EUDR-readiness and export-documentation support — best scoped as supplementary/local work alongside the group programmes.',
    whyNow: 'EUDR timber obligations (large operators from 30 Dec 2026; micro/small 30 Jun 2027) require operator-level due-diligence even for FSC-certified wood entering the EU.',
    trigger: 'EUDR timber timeline', triggerDate: d('2026-12-30'), triggerSource: 'EU Deforestation Regulation',
    scoreInputs: si(85, 85, 70, 80, 80, 50, 45, 60, 70), conversionProbability: 26, conversionConfidence: 'Low', commercialPotential: 'Unknown — requires qualification',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Certification / Sustainability lead', confidence: 'Low', source: 'Role to target' },
      { name: 'Vincent Istace', title: 'Head of Corporate Responsibility & Sustainability', role: 'Sustainability', confidence: 'Medium', source: 'Public (Olam/FSC press) — confirm current tenure; no personal email published' },
    ],
    sources: [
      { name: 'Olam Agri / Olam Group (official — CIB operations, FSC)', url: 'olamgroup.com/news/all-news/press-release/cib-has-become-the-first-company-in-africa-to-achieve-fsctm-project-certification.html', type: 'Official company', date: d('2026-09-11') },
      { name: 'FSC Africa', url: 'africa.fsc.org/en-cd/newsfeed/congolaise-industrielle-des-bois-cib-has-become-the-first-company-in-africa-to-achieve-fsc', type: 'Reputable secondary', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'CEMAC (Congo) anchor. Olam parent runs its own sustainability programmes — scope BALIA value as supplementary/local. Lead with the FSC-vs-EUDR gap.',
  },
  {
    id: 'PRO-16', name: "UCCAO (Union Centrale des Coopératives Agricoles de l'Ouest)", legalName: "Union Centrale des Coopératives Agricoles de l'Ouest", website: 'uccao.cm',
    country: 'Cameroon', city: 'Bafoussam', region: 'West',
    industry: 'Agribusiness', subIndustry: 'Coffee cooperative union — processing & marketing (Arabica/Robusta), cocoa',
    description: "Cameroon's largest agricultural organisation (est. 1959; roots to 1913), the apex body for coffee in the western highlands. Federates six cooperatives (CAPLAME, CAPLABAM, CAPLANDE, CAPLAMI, CAPLAHN, CAPLANOUN), processing and marketing high-quality Arabica and Robusta (and some cocoa).",
    products: 'Green & roasted coffee (Arabica/Robusta), cocoa', size: 'Large (federation)', employees: 'Not publicly confirmed',
    headquarters: 'Bafoussam', parent: '—', established: '1959', ownership: 'Cooperative (Cameroonian)',
    exportMarkets: ['EU', 'International'], importMarkets: [], cemacOps: 'Cameroon',
    segment: 'Exporter', services: ['EUDR Advisory', 'Export Development', 'Export Compliance', 'Training', 'Market Intelligence', 'AfCFTA Advisory'],
    whyBalia: 'Coffee is an EUDR-regulated commodity and UCCAO aggregates from thousands of dispersed smallholders across six cooperatives — making geolocation traceability and due-diligence genuinely hard. That is a strong, specific fit for EUDR-readiness systems, export development and cooperative-member capacity-building/training.',
    whyNow: 'EUDR coffee obligations plus UCCAO\'s stated drive to revive quality and its economic role in the West region create demand for traceability, export-market and training support.',
    trigger: 'EUDR coffee timeline + UCCAO revival strategy', triggerDate: d('2026-12-30'), triggerSource: 'EUDR + UCCAO (official site)',
    scoreInputs: si(90, 75, 100, 75, 55, 45, 60, 65, 80), conversionProbability: 30, conversionConfidence: 'Low', commercialPotential: '$15,000\u2013$50,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Directeur Général', confidence: 'Low', source: 'Role to target' },
      { role: 'Export / Quality Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'UCCAO (official site)', url: 'uccao.cm', type: 'Official company', date: d('2026-09-11') },
      { name: 'UCCAO — history & members', url: 'uccao.cm/nos_membre', type: 'Official company', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Excellent EUDR-traceability fit given the smallholder/cooperative structure. Budget likely moderate (cooperative) — consider a phased/donor-co-funded engagement. Also a gateway to member cooperatives.',
  },
  {
    id: 'PRO-17', name: 'CFAO Cameroun', legalName: 'CFAO (Corporation For Africa & Overseas) — Cameroon', website: 'cfaogroup.com',
    country: 'Cameroon', city: 'Douala', region: 'Littoral',
    industry: 'Distribution / Import', subIndustry: 'Mobility (vehicles), healthcare (Laborex/Eurapharma), consumer goods & retail',
    description: 'Cameroon arm of the pan-African CFAO group (Toyota Tsusho, Japan; 40 African countries, ~23,000 staff, ~\u20ac9.1bn revenue). In Cameroon: CFAO Mobility (Toyota etc.; est. 1971), Laborex Cameroun (Eurapharma pharma wholesale, since 1949), CFAO Retail (Carrefour alliance) and the ICRAFON consumer-goods factory.',
    products: 'Vehicles & equipment, pharmaceuticals, consumer goods, retail', size: 'Large', employees: 'Not publicly confirmed (group ~23,000)',
    headquarters: 'Douala', parent: 'CFAO / Toyota Tsusho', established: '—', ownership: 'Foreign (Toyota Tsusho)',
    exportMarkets: [], importMarkets: ['France/EU', 'Asia', 'International'], cemacOps: 'Cameroon',
    segment: 'Multinational', services: ['Import Compliance', 'Customs Advisory', 'Logistics & Supply Chain Advisory', 'Regulatory Compliance', 'Trade Documentation', 'Executive Training'],
    whyBalia: 'A very large, multi-category importer — vehicles, heavily-regulated pharmaceuticals (Laborex) and consumer goods — where customs/import-compliance, tariff and regulatory complexity is real. Best-fit BALIA value is specialist/supplementary: pharma import-regulatory support, AfCFTA regional-distribution positioning, and trade-compliance training.',
    whyNow: 'CFAO Retail/Carrefour expansion and growing pharma distribution, plus AfCFTA-driven regional distribution strategy, keep customs and regulatory workload high.',
    trigger: 'Retail (Carrefour) expansion + AfCFTA regional distribution', triggerDate: d('2025-01-01'), triggerSource: 'CFAO Group (official)',
    scoreInputs: si(80, 80, 100, 55, 95, 50, 55, 70, 75), conversionProbability: 25, conversionConfidence: 'Low', commercialPotential: '$50,000\u2013$100,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Customs / Supply Chain Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Country / Regulatory Affairs Manager (pharma)', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [
      { name: 'CFAO Group (official)', url: 'cfaogroup.com/en', type: 'Official company', date: d('2026-09-11') },
      { name: 'CFAO Healthcare / Laborex (official)', url: 'cfaohealthcare.com', type: 'Official company', date: d('2026-09-11') },
    ],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Verified', owner: 'USR-05',
    notes: 'Sophisticated multinational with in-house compliance — pursue for specialist/supplementary scopes (pharma regulatory, AfCFTA), not generic advisory. Long sales cycle.',
  },
  {
    id: 'PRO-18', name: 'Ubipharm-Cameroun', legalName: 'Ubipharm-Cameroun', website: 'ubipharm.com',
    country: 'Cameroon', city: 'Douala (Bassa)', region: 'Littoral',
    industry: 'Import / Distribution', subIndustry: 'Pharmaceutical wholesale distribution',
    description: "One of Cameroon's two dominant full-line pharmaceutical wholesale distributors (licensed since 2001), part of the pharmacist-owned pan-African Ubipharm network (originating in Côte d'Ivoire). Based in Douala's Bassa industrial zone; licensed for conventional medicines, vaccines, biologicals/biosimilars, and medical devices.",
    products: 'Pharmaceuticals, vaccines, biologicals, medical devices', size: 'Large', employees: 'Not publicly confirmed',
    headquarters: 'Douala (Bassa)', parent: 'Ubipharm group', established: '2001', ownership: 'Pharmacist-owned (pan-African)',
    exportMarkets: [], importMarkets: ['France/EU', 'International'], cemacOps: 'Cameroon',
    segment: 'Importer', services: ['Import Compliance', 'Customs Advisory', 'Regulatory Compliance', 'Trade Documentation'],
    whyBalia: 'A full-line pharma importer of highly-regulated products (incl. vaccines and cold-chain biologicals) sourced heavily from Europe — a strong fit for import/customs-compliance optimisation, regulatory navigation and trade-documentation support, where errors are costly and rules are strict.',
    whyNow: 'No current trigger independently confirmed this session — verify recent licensing, capacity or facility developments before outreach.',
    scoreInputs: si(85, 65, 100, 40, 75, 45, 50, 60, 60), conversionProbability: 30, conversionConfidence: 'Low', commercialPotential: '$15,000\u2013$50,000',
    generalEmail: '', generalPhone: '', contacts: [
      { role: 'Import / Regulatory Affairs Manager', confidence: 'Low', source: 'Role to target' },
      { role: 'Supply Chain / Customs Manager', confidence: 'Low', source: 'Role to target' },
    ],
    sources: [{ name: 'ExporterIQ pharma-market guide (reputable trade source) — confirm official site', url: 'exporteriq.com/blog/top-9-pharmaceutical-product-importers-and-distributors-in-cameroon-a-market-guide-for-exporters', type: 'Reputable secondary', date: d('2026-09-11') }],
    researchDate: d('2026-09-11'), lastVerified: d('2026-09-11'), verificationStatus: 'Requires Verification', owner: 'USR-05',
    notes: 'Identified via a reputable market guide, not the official site this session — confirm entity details and a contact before outreach. Strong pharma import-compliance fit.',
  },
];
