// ===========================================================================
// EXAMPLE CONTENT — Knowledge Base, Academy, Calendar, Management review and
// the remaining tabs, so no section is empty. Reference articles carry
// current (mid-2026) trade/EUDR/AfCFTA facts checked against public sources;
// courses reflect BALIA's real training offering. Illustrative operational
// records (events, meetings, docs, time, expenses) are tied to the example
// companies and the two real users.
// ===========================================================================
import type {
  Article, Course, Enrollment, CalendarEvent, Assessment, DocumentRec,
  Product, TimeEntry, Expense, MgmtMeeting, Recurring,
} from '@/data/seed';

const d = (s: string) => s;

// --- Knowledge Base (§ current reference notes) ----------------------------
export const EX_ARTICLES: Article[] = [
  {
    id: 'KB-EX1', title: 'EUDR 2026: what Cameroon & CEMAC exporters must do now', category: 'EUDR & Sustainability',
    author: 'USR-01', updated: d('2026-09-08'), readTime: '9 min',
    summary: 'The EU Deforestation Regulation was postponed by a year (Reg. (EU) 2025/2650): large/medium operators comply from 30 Dec 2026, micro/small from 30 Jun 2027. The core due-diligence, geolocation and deforestation-free obligations are unchanged. This article walks through scope, obligations, the DDS, traceability, enforcement and a readiness plan.',
    body: 'WHY THIS MATTERS\n\nRegulation (EU) 2023/1115 — the EUDR — prohibits placing seven commodities and their derived products on the EU market unless they are deforestation-free, legally produced, and covered by a due-diligence statement. For Cameroon and CEMAC exporters this is decisive: the EU is a primary destination for the region\u2019s cocoa, coffee, timber and palm/rubber, and a non-compliant consignment can be refused entry regardless of price or quality.\n\nTIMELINE (AS AMENDED)\n\nRegulation (EU) 2025/2650 (Official Journal, 23 December 2025) postponed application by a year. Large and medium operators and traders must comply from 30 December 2026; micro and small operators from 30 June 2027. A simplification review was scheduled for April 2026. Treat 30 December 2026 as the hard deadline for any large/medium operator — the delay is preparation time, not a reprieve.\n\nSCOPE — COMMODITIES, PRODUCTS, ROLES\n\nIn scope: cattle, cocoa, coffee, oil palm, rubber, soya and wood, plus a long list of derived products (chocolate, roasted coffee, palm derivatives, tyres, furniture, paper). Scope is decided by HS code (Annex I), not by product name. Roles matter: the \u201coperator\u201d first places the product on the EU market (or exports it) and carries the full obligation; large/medium traders carry operator-like duties; a \u201cdownstream operator\u201d category narrows some duties where diligence was already exercised upstream. Many Cameroon exporters sell to an EU importer who is the operator in law — but that importer pushes the evidence burden back up the chain contractually, so readiness is a commercial necessity.\n\nTHE FOUR CORE OBLIGATIONS\n\n(1) Deforestation-free — produced on land not deforested after 31 December 2020 (for wood, not degraded). (2) Legality — compliant with the country of production\u2019s laws on land use, environment, third-party rights, labour, tax and trade. (3) Geolocation — coordinates of every plot (polygons above 4 ha), with the production date/range. (4) Due Diligence Statement — submitted through the EU information system, confirming no more than negligible risk.\n\nTHE DUE DILIGENCE STATEMENT\n\nThe DDS is the operative document: it consolidates the information collected, the risk assessment and mitigation, and must state the estimated annual quantity placed on the market. It generates a reference number that travels with the goods; downstream operators can rely on it. Supporting records are retained for five years.\n\nTRACEABILITY TO PLOT — THE HARDEST PART\n\nGeolocation is where dispersed CEMAC supply chains struggle. Map the supply base to plot level with stable IDs; capture coordinates (polygons >4 ha) and production periods; reconcile volumes plot-to-consignment (mass balance); and onboard new suppliers before their product ships. BALIA\u2019s EUDR Supplier & Plot Traceability Register (Document Library) structures exactly this.\n\nRISK, MITIGATION AND CERTIFICATION\n\nAssess the risk of non-compliance (country/region benchmarking, forest presence, rights, corruption, chain complexity, data reliability). Where risk is more than negligible, mitigate — extra data, audits, supplier capacity-building — until it is negligible. Note: FSC, Rainforest Alliance, Fairtrade and organic help operationally and evidence legality, but no certification by itself satisfies the EUDR, which requires operator-level geolocation and a DDS.\n\nENFORCEMENT\n\nInspections are risk-tiered (indicatively ~1% of operators from low-risk countries, ~3% standard, ~9% high-risk). Penalties are set nationally with EU minimums — fines proportionate to product value, confiscation, and potential exclusion from the market. Competent-authority enforcement obligations begin in the course of 2026.\n\nSECTOR NOTES\n\nCocoa & coffee — dispersed smallholders; cooperative unions can coordinate plot data. Timber — concession-level data plus legality (permit/traceability systems); FSC helps but is not sufficient. Palm & rubber — plantation geolocation is more tractable; watch outgrower schemes.\n\nA READINESS PLAN\n\nConfirm scope (HS codes, EU flows); assign an owner and legal role; build the plot register and collect geolocation; assemble legality and deforestation-free evidence against the 2020 cut-off; run the risk assessment and document mitigation; prepare DDS content and the submission route; set up five-year record-keeping; and dry-run a consignment before the deadline. See the EUDR 2026 Readiness Guide in the Document Library for the full version.',
    tags: ['EUDR', 'Cocoa', 'Timber', 'Coffee', 'Palm', 'Compliance'], type: 'Article',
  },
  {
    id: 'KB-EX2', title: 'AfCFTA implementation — 2026 status & how to use it', category: 'AfCFTA & Trade Policy',
    author: 'USR-01', updated: d('2026-09-05'), readTime: '8 min',
    summary: 'AfCFTA is moving from framework to functioning market: intra-African trade is ~US$220bn (2025), rules of origin are agreed on ~92% of tariff lines, and PAPSS settles cross-border payments in local currencies. This article covers the framework, 2026 status, tariffs, rules of origin, PAPSS, and a step-by-step guide to claiming preferences.',
    body: 'WHAT AfCFTA IS\n\nThe African Continental Free Trade Area is the world\u2019s largest free-trade area by membership — 54 of 55 AU states. It aims to create a single market for goods and services, liberalise tariffs on most trade, and progressively remove non-tariff barriers, built out through protocols on goods, services, dispute settlement, investment, IP, competition, digital trade, and women and youth in trade.\n\nSTATUS IN 2026\n\nIntra-African trade reached ~US$220bn in 2025, with growth forecast for 2026; the intra-African share of total trade (~16%) is far below Asia\u2019s and Europe\u2019s — which is the headroom. Around 48 states have ratified; a smaller group actively trades under AfCFTA preferences. Rules of origin are agreed on ~92% of tariff lines (outstanding automotive, textiles and clothing lines progressing). The Guided Trade Initiative demonstrates the operational plumbing on selected corridors.\n\nTARIFF LIBERALISATION\n\nMembers commit to liberalise at least 90% of tariff lines over phase-down periods, with a category of sensitive products on longer timelines and a small excluded list (~3%). This is not a blanket zero-tariff market: whether a product benefits depends on the importing country\u2019s schedule and the product\u2019s classification. Always check the applicable preferential rate before assuming a saving.\n\nRULES OF ORIGIN — THE KEY TO PREFERENCES\n\nA product qualifies only if it meets the rules of origin, via one of two routes: wholly obtained (grown/extracted/produced entirely in a State Party — typical for unprocessed commodities), or substantial transformation (for goods using imported inputs, meeting the product-specific rule: a change of tariff heading, a minimum regional value content, or a specified process). Qualifying goods need a certificate of origin and an evidence pack (supplier declarations, bills of materials, value calculations). Weak origin documentation is the most common reason preferences are denied. BALIA\u2019s AfCFTA Rules of Origin Worksheet (Document Library) computes regional value content and flags qualification.\n\nPAPSS — PAYING ACROSS BORDERS\n\nThe Pan-African Payment and Settlement System lets businesses pay and be paid across African borders in local currencies, clearing through central banks rather than a hard-currency correspondent chain. For CEMAC exporters this can cut transaction costs (often ~20\u201330%), shorten settlement and reduce FX exposure.\n\nBEYOND GOODS\n\nTrade in services is being liberalised in priority sectors (business services, logistics, finance); the Digital Trade Protocol frames e-commerce and cross-border data; the Women & Youth in Trade Protocol targets wider participation.\n\nWHAT IT MEANS FOR CEMAC EXPORTERS\n\nAfCFTA lets CEMAC firms diversify beyond the EU into fast-growing African markets on preferential terms; manufacturers and agribusinesses that meet rules of origin gain most. The practical work: confirm which products qualify, secure origin documentation, model the duty saving versus MFN, and build market entry around corridors that function today.\n\nCLAIMING PREFERENCES — STEP BY STEP\n\n(1) Identify the destination market and its AfCFTA schedule for your product. (2) Determine the applicable rule of origin and confirm the product meets it. (3) Assemble the origin evidence pack and obtain the certificate of origin. (4) Compare the preferential duty with the MFN rate to quantify the saving. (5) Align documentation and logistics; consider PAPSS for settlement.\n\nCHALLENGES TO PLAN AROUND\n\nUneven domestication (not every member grants preferences smoothly yet), non-tariff barriers (standards, licensing, border delays — there is an online NTB reporting mechanism), and the documentation burden (get origin proof right before shipping).',
    tags: ['AfCFTA', 'Rules of Origin', 'PAPSS', 'Market access'], type: 'Article',
  },
  {
    id: 'KB-EX3', title: 'Cameroon customs essentials: systems, valuation & HS classification', category: 'Customs',
    author: 'USR-02', updated: d('2026-08-30'), readTime: '7 min',
    summary: 'A practitioner note on Cameroon import/export procedures — the GUCE single window and ASYCUDA, customs valuation, HS classification, origin, and the compliance pitfalls that drive most reassessments and penalties.',
    body: 'THE CUSTOMS ENVIRONMENT\n\nCameroon customs operate through the GUCE single window and the ASYCUDA declaration system; declarations, valuation and classification are electronic. Public procurement — including customs and trade-consultancy tenders — is published via ARMP and the COLEPS platform. The Douala port complex anchors the main corridors, notably Douala\u2013N\u2019Djamena (Chad) and Douala\u2013Bangui (CAR). Know the roles: importer/exporter, declarant, licensed customs broker, and the authority.\n\nCUSTOMS VALUATION\n\nThe WTO transaction-value method is the norm: the price actually paid or payable, adjusted to CIF by adding freight, insurance and dutiable assists. Disputes commonly arise on related-party pricing, royalties and licence fees, and undeclared assists (tooling, materials supplied to the producer). Build the value from the invoice up and keep the supporting evidence; a landed-cost model (see the Document Library) both prices imports and cross-checks declarations.\n\nHS CLASSIFICATION\n\nThe Harmonized System assigns a code to every traded good (six digits globally, with national extensions). The code determines the duty rate, VAT treatment and any regulatory controls. Most reassessments and penalties trace back to a wrong HS code. Build a client-specific classification register, document the reasoning for each code, and keep any binding-ruling or expert evidence. Re-check classification when products or specifications change.\n\nORIGIN\n\nFor AfCFTA or EU preferences, keep origin documentation aligned to the applicable rules of origin. Goods using mixed inputs need value-added calculations to show they qualify. Origin errors are as costly as classification errors and are scrutinised at the border.\n\nCOMMON PITFALLS\n\nMis-declared HS codes; under-declared value or undeclared assists; incomplete or inconsistent documentation; weak record-keeping; no process for new suppliers or products; and treating certification as if it were compliance. A declaration-sampling diagnostic quickly surfaces the exposure and the recurring errors.\n\nA COMPLIANCE APPROACH\n\nSample recent declarations; test classification, valuation and origin against the evidence; quantify the exposure; agree a corrective action plan; and put standing controls in place (a classification register, a valuation checklist, a document set per shipment, and periodic internal review). Where volumes and stakes are high, a customs-compliance review pays for itself in avoided reassessments and faster clearance.',
    tags: ['Customs', 'Cameroon', 'HS classification', 'Valuation', 'Origin'], type: 'Article',
  },
  {
    id: 'KB-EX4', title: 'EU market export documentation — working checklist', category: 'Export Development',
    author: 'USR-02', updated: d('2026-08-22'), readTime: '5 min',
    summary: 'A working checklist of the documents typically required to place agri-food and timber products on the EU market, with notes on who issues each and the lead times to plan for.',
    body: 'HOW TO USE THIS\n\nExport documentation is product- and importer-specific — treat this as a master list to tailor per shipment. For each document, map the issuing authority and the lead time before your first shipment window; missing or late paperwork is a leading cause of held consignments.\n\nCORE DOCUMENT SET\n\nCommercial invoice and packing list; bill of lading or air waybill; certificate of origin (and an AfCFTA/EUR.1 form where preferences apply); phytosanitary certificate for agricultural products; and, for EUDR-in-scope commodities from 30 December 2026, a Due Diligence Statement plus plot geolocation data.\n\nQUALITY, HEALTH & CERTIFICATION\n\nHealth and quality certificates and laboratory results as required by the product and destination; certification evidence (Organic, Fair Trade, FSC, GlobalG.A.P.) where a claim is made; and any product-specific conformity documentation.\n\nTRADE & LOGISTICS\n\nImport licences or registrations held by the EU importer; traceability records back to plot or producer; contracts and a confirmation of Incoterms (which fix who pays and who bears risk to which point — see the Incoterms 2020 quick reference in the Document Library); and insurance documentation.\n\nPRACTICAL TIPS\n\nConfirm the importer\u2019s specific requirements early — buyers often demand more than the legal minimum. Keep a shipment file that mirrors this checklist, assign an owner per document, and build a lead-time calendar so certificates are valid at the time of shipment, not expired or pending.',
    tags: ['Export', 'Documentation', 'EU', 'Checklist'], type: 'Checklist',
  },
  {
    id: 'KB-EX5', title: 'EUDR Due Diligence Statement — preparation SOP', category: 'EUDR & Sustainability',
    author: 'USR-01', updated: d('2026-09-02'), readTime: '6 min',
    summary: 'A standard operating procedure for preparing an EUDR Due Diligence Statement for an in-scope client — from scoping the consignment flows through submission and five-year record-keeping.',
    body: 'PURPOSE\n\nThis SOP standardises how BALIA prepares a Due Diligence Statement (DDS) so that every engagement produces a consistent, defensible submission. It applies to any client placing in-scope commodities (cocoa, coffee, palm, rubber, timber and derivatives) on the EU market.\n\nSTEP 1 — SCOPE\n\nIdentify the products and consignment flows in scope: map HS codes and quantify EU-bound volumes. Confirm the client\u2019s legal role (operator, trader or downstream operator), since it sets the obligation.\n\nSTEP 2 — MAP THE SUPPLY BASE\n\nMap the supply base to plot level and assign stable plot IDs. Collect geolocation coordinates — polygons for plots over four hectares, points below — and the production date or range.\n\nSTEP 3 — GATHER EVIDENCE\n\nCollect legality evidence (land tenure/use rights, permits, environmental, labour and tax compliance) and deforestation-free evidence against the 31 December 2020 cut-off (for wood, no degradation). Keep the source and date of each item.\n\nSTEP 4 — RISK ASSESSMENT\n\nAssess risk using country/region benchmarking and supplier-level factors (chain complexity, data reliability, rights and corruption indicators). Record the conclusion: negligible or non-negligible.\n\nSTEP 5 — MITIGATE\n\nWhere risk is non-negligible, apply and document mitigation — additional data collection, independent verification, or supplier capacity-building — and re-assess until the risk is negligible. Only a negligible-risk conclusion supports a DDS.\n\nSTEP 6 — QUANTITY & REGISTER\n\nRecord the estimated annual quantity of regulated products. Consolidate everything in the compliance register; log gaps and the remediation roadmap.\n\nSTEP 7 — DRAFT & REVIEW\n\nDraft the DDS content; carry out internal review and sign-off against this SOP.\n\nSTEP 8 — SUBMIT & RETAIN\n\nSubmit through the EU information system (TRACES); capture the DDS reference number, which travels with the goods. Retain all supporting records for five years and make them available to competent authorities on request.\n\nDELIVERABLES\n\nA due-diligence gap report, a compliance register, a remediation roadmap, and the signed DDS with its reference number.',
    tags: ['EUDR', 'DDS', 'SOP', 'Traceability'], type: 'SOP',
  },
  {
    id: 'KB-EX6', title: 'CEMAC trade corridors & cross-border facilitation', category: 'Logistics & Corridors',
    author: 'USR-02', updated: d('2026-08-18'), readTime: '6 min',
    summary: 'Orientation on the main CEMAC corridors anchored on the Douala port complex — the Douala\u2013N\u2019Djamena and Douala\u2013Bangui routes — what drives corridor performance, and where trade-facilitation advisory adds value.',
    body: 'THE CORRIDOR MAP\n\nThe Douala port complex (Douala and Kribi terminals) is the maritime gateway for much of CEMAC\u2019s landlocked trade. Two corridors dominate: Douala\u2013N\u2019Djamena, serving Chad, and Douala\u2013Bangui, serving the Central African Republic. Gabon, the Republic of Congo and Equatorial Guinea rely on their own ports plus regional links. These corridors carry both imports (equipment, food, consumer goods) and exports (cotton, timber, agricultural commodities).\n\nWHAT DRIVES PERFORMANCE\n\nCorridor cost and time are shaped by customs interconnection between transit and destination countries, the number and efficiency of checkpoints, documentation accuracy, and port dwell times. Delays and informal costs at borders can outweigh tariff savings, so facilitation is as important as tariff policy. AfCFTA and CEMAC integration aim to reduce these frictions, but domestication into national systems is uneven.\n\nWHERE ADVISORY ADDS VALUE\n\nFor shippers: improving declaration accuracy and documentation to cut clearance time and reassessment risk. For logistics operators (freight forwarders, port handlers, transporters): corridor diagnostics, customs-process improvement, and trade-compliance training. For manufacturers and agribusinesses: routing and Incoterms decisions that reduce landed cost and risk. Tie the work to AfCFTA where intra-regional preferences apply, and to EUDR where corridor goods are EU-bound and traceability data must reconcile with customs data.\n\nA PRACTICAL LENS\n\nStart with a corridor diagnostic: map the end-to-end flow, the documents and authorities at each step, the time and cost per stage, and the recurring bottlenecks. From there, prioritise the fixes with the best time/cost payoff — usually documentation quality, classification accuracy and checkpoint preparation — and build the capability internally through training so the gains persist.',
    tags: ['CEMAC', 'Corridors', 'Logistics', 'Trade facilitation'], type: 'Article',
  },
];

// --- Academy (BALIA's training offering) -----------------------------------
export const EX_COURSES: Course[] = [
  {
    id: 'CRS-EX1', title: 'AfCFTA Practitioner Certificate', category: 'AfCFTA', level: 'Intermediate', duration: '3 days',
    instructor: 'USR-01', price: 350000, currency: 'XAF',
    objectives: ['Understand the AfCFTA framework and current implementation', 'Apply rules of origin to qualify goods', 'Model tariff preferences', 'Prepare AfCFTA documentation'],
    modules: [
      { title: 'AfCFTA foundations', lessons: ['The agreement & protocols', 'Implementation status 2026', 'PAPSS & Guided Trade Initiative'] },
      { title: 'Rules of origin', lessons: ['Origin criteria', 'Value-added calculations', 'Documentation'] },
      { title: 'Practical application', lessons: ['Tariff-preference modelling', 'Case clinic'] },
    ],
    enrolled: 0, completed: 0, avgScore: 0, certificates: 0, status: 'Published',
  },
  {
    id: 'CRS-EX2', title: 'Customs & Trade Compliance Fundamentals', category: 'Customs', level: 'Foundation', duration: '2 days',
    instructor: 'USR-02', price: 250000, currency: 'XAF',
    objectives: ['Navigate Cameroon customs procedures', 'Classify goods correctly (HS)', 'Apply valuation rules', 'Avoid common compliance pitfalls'],
    modules: [
      { title: 'Customs environment', lessons: ['GUCE / ASYCUDA overview', 'Roles & obligations'] },
      { title: 'Classification & valuation', lessons: ['HS classification', 'WTO valuation'] },
      { title: 'Compliance in practice', lessons: ['Declaration accuracy', 'Record-keeping & audits'] },
    ],
    enrolled: 0, completed: 0, avgScore: 0, certificates: 0, status: 'Published',
  },
  {
    id: 'CRS-EX3', title: 'EUDR Readiness for Exporters', category: 'EUDR & Sustainability', level: 'Intermediate', duration: '2 days',
    instructor: 'USR-01', price: 300000, currency: 'XAF',
    objectives: ['Understand EUDR scope & the 2026/2027 timeline', 'Build plot-level traceability', 'Prepare a Due Diligence Statement', 'Set up a compliance register'],
    modules: [
      { title: 'EUDR essentials', lessons: ['Scope & commodities', 'Timeline & simplifications (Reg. 2025/2650)'] },
      { title: 'Traceability & DDS', lessons: ['Geolocation data', 'Risk assessment', 'DDS preparation'] },
      { title: 'Getting ready', lessons: ['Compliance register', 'Remediation roadmap'] },
    ],
    enrolled: 0, completed: 0, avgScore: 0, certificates: 0, status: 'Published',
  },
  {
    id: 'CRS-EX4', title: 'Export Readiness & Documentation', category: 'Export Development', level: 'Foundation', duration: '2 days',
    instructor: 'USR-02', price: 250000, currency: 'XAF',
    objectives: ['Assess export readiness', 'Assemble the export documentation set', 'Understand EU market requirements', 'Plan a first shipment'],
    modules: [
      { title: 'Readiness', lessons: ['Market selection', 'Capacity & pricing'] },
      { title: 'Documentation', lessons: ['Core documents', 'Certificates & origin'] },
      { title: 'Market entry', lessons: ['EU requirements', 'Logistics & Incoterms'] },
    ],
    enrolled: 0, completed: 0, avgScore: 0, certificates: 0, status: 'Published',
  },
  {
    id: 'CRS-EX5', title: 'Rules of Origin Masterclass', category: 'AfCFTA', level: 'Advanced', duration: '1 day',
    instructor: 'USR-01', price: 200000, currency: 'XAF',
    objectives: ['Master origin criteria', 'Handle mixed-input value calculations', 'Prepare defensible origin documentation'],
    modules: [
      { title: 'Origin criteria', lessons: ['Wholly obtained', 'Substantial transformation'] },
      { title: 'Calculations & documentation', lessons: ['Value-added methods', 'Evidence pack'] },
    ],
    enrolled: 0, completed: 0, avgScore: 0, certificates: 0, status: 'Draft',
  },
];

export const EX_ENROLLMENTS: Enrollment[] = [
  { id: 'ENR-EX1', courseId: 'CRS-EX2', learnerName: 'AGL Operations Team (cohort 1)', organisation: 'AGL Cameroon', companyId: 'CMP-EX3', cohort: '2026-Q4', progress: 0, certified: false, enrolled: d('2026-09-10'), corporate: true },
  { id: 'ENR-EX2', courseId: 'CRS-EX3', learnerName: 'UCCAO Cooperative Leads', organisation: 'UCCAO', companyId: 'CMP-EX8', cohort: '2026-Q4', progress: 20, certified: false, enrolled: d('2026-09-09'), corporate: true },
  { id: 'ENR-EX3', courseId: 'CRS-EX1', learnerName: 'SABC Trade & Compliance', organisation: 'SABC', companyId: 'CMP-EX6', cohort: '2026-Q4', progress: 0, certified: false, enrolled: d('2026-09-06'), corporate: true },
];

// --- Calendar --------------------------------------------------------------
export const EX_EVENTS: CalendarEvent[] = [
  { id: 'EVT-EX1', title: 'SOCAPALM — EUDR scoping consultation', type: 'Consultation', date: d('2026-09-22'), time: '15:00', duration: '90 min', companyId: 'CMP-EX5', participants: ['USR-02'], location: 'Edéa', agenda: 'Scope an EUDR readiness programme for palm (and rubber via Safacam).', notes: 'Sensitive account — position carefully.' },
  { id: 'EVT-EX2', title: 'SABC — import-compliance diagnostic consultation', type: 'Consultation', date: d('2026-09-24'), time: '10:30', duration: '60 min', companyId: 'CMP-EX6', participants: ['USR-01'], location: 'Douala', agenda: 'Diagnostic of import-compliance workload across plants.', notes: '' },
  { id: 'EVT-EX3', title: 'Telcar — EUDR project review', type: 'Project meeting', date: d('2026-09-18'), time: '11:00', duration: '45 min', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', participants: ['USR-01', 'USR-02'], location: 'Google Meet', agenda: 'Compliance register progress & remediation roadmap.', notes: '' },
  { id: 'EVT-EX4', title: 'AGL — proposal follow-up', type: 'Client meeting', date: d('2026-09-18'), time: '14:00', duration: '30 min', companyId: 'CMP-EX3', participants: ['USR-02'], location: 'Microsoft Teams', agenda: 'Decision on customs review + training proposal.', notes: '' },
  { id: 'EVT-EX5', title: 'CFAO — scope & pricing negotiation', type: 'Client meeting', date: d('2026-09-22'), time: '16:00', duration: '45 min', companyId: 'CMP-EX4', participants: ['USR-01'], location: 'Douala', agenda: 'Revise pharma import-compliance scope.', notes: '' },
  { id: 'EVT-EX6', title: 'Weekly team stand-up', type: 'Internal', date: d('2026-09-15'), time: '09:00', duration: '30 min', participants: ['USR-01', 'USR-02'], location: 'Office', agenda: 'Pipeline, deliveries and blockers.', notes: 'Recurring Mondays.' },
  { id: 'EVT-EX7', title: 'Monthly management review — September', type: 'Internal', date: d('2026-09-30'), time: '15:00', duration: '90 min', participants: ['USR-01', 'USR-02'], location: 'Office', agenda: 'Board-grade operating review.', notes: '' },
  { id: 'EVT-EX8', title: 'develoPPP Classic — application deadline', type: 'Deadline', date: d('2026-09-30'), time: '17:00', duration: '—', participants: ['USR-01'], location: '—', agenda: 'Funding opportunity FOP-10 window closes.', notes: 'Confirm current focus theme.' },
  { id: 'EVT-EX9', title: 'EUDR — large-operator deadline', type: 'Deadline', date: d('2026-12-30'), time: '00:00', duration: '—', participants: ['USR-01', 'USR-02'], location: '—', agenda: 'EUDR applies to large/medium operators (Reg. 2025/2650).', notes: 'Client readiness must be complete before this date.' },
  { id: 'EVT-EX10', title: 'Customs & Compliance training — AGL cohort 1', type: 'Training', date: d('2026-10-14'), time: '09:00', duration: '2 days', companyId: 'CMP-EX3', participants: ['USR-02'], location: 'Douala', agenda: 'Customs & trade-compliance training (cohort 1 of 2).', notes: '' },
];

// --- Management review ------------------------------------------------------
export const EX_MEETINGS: MgmtMeeting[] = [
  {
    id: 'MMR-EX1', period: 'September 2026', date: d('2026-09-30'), status: 'Draft', attendees: ['USR-01', 'USR-02'],
    narrative: 'Pipeline is anchored by EUDR readiness demand ahead of the 30 December 2026 deadline. Two engagements are in delivery (Telcar, PHP), three opportunities are progressing (AGL proposal sent, CFAO in negotiation, SOCAPALM scoping), and three qualified leads are being worked (SABC, CIMENCAM, UCCAO). Corporate training is being packaged alongside the AGL customs engagement. Focus for October: convert the AGL and CFAO opportunities, run the SOCAPALM and SABC consultations, and progress the develoPPP funding window.',
    actions: [
      { id: 'MMA-EX1', decision: 'Prioritise EUDR readiness offer', action: 'Package a standard EUDR readiness engagement and pitch to UCCAO and SOCAPALM', owner: 'USR-01', priority: 'High', deadline: d('2026-10-10'), status: 'Open', notes: 'Tie to the December 2026 deadline.' },
      { id: 'MMA-EX2', decision: 'Close AGL', action: 'Follow up and close the AGL customs review + training proposal', owner: 'USR-02', priority: 'High', deadline: d('2026-09-25'), status: 'Open', notes: '' },
      { id: 'MMA-EX3', decision: 'Pursue develoPPP window', action: 'Confirm eligibility and prepare a develoPPP Classic concept', owner: 'USR-01', priority: 'Medium', deadline: d('2026-09-28'), status: 'Open', notes: 'Window closes 30 Sep.' },
    ],
  },
];

// --- Supporting records (assessments, documents, products, time, expenses) --
export const EX_ASSESSMENTS: Assessment[] = [
  { id: 'ASM-EX1', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', type: 'Trade Readiness', date: d('2026-05-14'), assessor: 'USR-01', scores: { 'Regulatory readiness': 55, 'Traceability': 40, 'Documentation': 60, 'Market access': 75 }, notes: 'EUDR traceability is the main gap; strong market position.', targetMarket: 'EU', product: 'Cocoa beans', hsCode: '1801.00' },
  { id: 'ASM-EX2', companyId: 'CMP-EX8', type: 'Market Entry', date: d('2026-09-08'), assessor: 'USR-01', scores: { 'Product readiness': 65, 'Regulatory readiness': 45, 'Traceability': 35, 'Commercial capacity': 55 }, notes: 'Smallholder traceability across cooperatives is the key EUDR challenge.', targetMarket: 'EU', product: 'Arabica/Robusta coffee', hsCode: '0901.11' },
];

export const EX_DOCUMENTS: DocumentRec[] = [
  { id: 'DOC-EX1', name: 'Telcar — EUDR due-diligence gap report', category: 'Deliverable', type: 'Report', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', uploaded: d('2026-08-20'), uploadedBy: 'USR-02', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '2.4 MB' },
  { id: 'DOC-EX2', name: 'Telcar — compliance register (working)', category: 'Deliverable', type: 'Spreadsheet', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', uploaded: d('2026-09-05'), uploadedBy: 'USR-02', version: 3, status: 'Under Review', confidentiality: 'Confidential', size: '1.1 MB' },
  { id: 'DOC-EX3', name: 'Telcar — signed engagement contract', category: 'Corporate', type: 'Contract', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', uploaded: d('2026-05-10'), uploadedBy: 'USR-01', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '640 KB' },
  { id: 'DOC-EX4', name: 'PHP — retainer statement of work', category: 'Corporate', type: 'SOW', companyId: 'CMP-EX2', projectId: 'PRJ-EX2', uploaded: d('2026-06-20'), uploadedBy: 'USR-02', version: 1, status: 'Approved', confidentiality: 'Standard', size: '420 KB' },
  { id: 'DOC-EX5', name: 'AGL — customs review proposal', category: 'Proposal', type: 'Proposal', companyId: 'CMP-EX3', uploaded: d('2026-08-20'), uploadedBy: 'USR-02', version: 1, status: 'Sent', confidentiality: 'Standard', size: '780 KB' },
];

export const EX_PRODUCTS: Product[] = [
  { id: 'PRD-EX1', companyId: 'CMP-EX1', name: 'Cocoa beans (export grade)', category: 'Agri-commodity', hsCode: '1801.00', origin: 'Cameroon', targetMarkets: ['EU', 'Americas', 'Asia'], requirements: ['EUDR DDS', 'Phytosanitary certificate', 'Certificate of origin'], certifications: ['Organic', 'Fair Trade'], notes: 'In-scope for EUDR.' },
  { id: 'PRD-EX2', companyId: 'CMP-EX2', name: 'Bananas (Cavendish)', category: 'Fresh produce', hsCode: '0803.90', origin: 'Cameroon', targetMarkets: ['EU', 'Morocco'], requirements: ['Phytosanitary certificate', 'Cold-chain compliance', 'Certificate of origin'], certifications: ['GlobalG.A.P.'], notes: 'EU-facing; reefer logistics.' },
  { id: 'PRD-EX3', companyId: 'CMP-EX8', name: 'Arabica coffee (green)', category: 'Agri-commodity', hsCode: '0901.11', origin: 'Cameroon (West)', targetMarkets: ['EU'], requirements: ['EUDR DDS', 'Certificate of origin'], certifications: [], notes: 'Smallholder traceability challenge.' },
];

export const EX_TIME: TimeEntry[] = [
  { id: 'TIM-EX1', user: 'USR-02', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', taskId: 'TSK-EX1', date: d('2026-09-10'), hours: 6, billable: true, description: 'Compliance register — plot geodata import and cross-checks.' },
  { id: 'TIM-EX2', user: 'USR-01', companyId: 'CMP-EX1', projectId: 'PRJ-EX1', date: d('2026-09-11'), hours: 3, billable: true, description: 'Remediation roadmap drafting.' },
  { id: 'TIM-EX3', user: 'USR-02', companyId: 'CMP-EX2', projectId: 'PRJ-EX2', date: d('2026-09-09'), hours: 4, billable: true, description: 'PHP monthly export-compliance clinic prep.' },
];

export const EX_EXPENSES: Expense[] = [
  { id: 'EXP-EX1', date: d('2026-09-04'), category: 'Travel', description: 'Field visit — Edéa (SOCAPALM scoping prep)', vendor: 'Transport', amount: 85000, currency: 'XAF', tax: 0, companyId: 'CMP-EX5', user: 'USR-02', method: 'Card', receipt: '', reimbursable: true, status: 'Submitted', notes: '' },
  { id: 'EXP-EX2', date: d('2026-09-02'), category: 'Software', description: 'Geolocation / mapping tooling (EUDR)', vendor: 'SaaS', amount: 120000, currency: 'XAF', tax: 0, projectId: 'PRJ-EX1', companyId: 'CMP-EX1', user: 'USR-01', method: 'Card', receipt: '', reimbursable: false, status: 'Approved', notes: 'Telcar project.' },
];

export const EX_RECURRING: Recurring[] = [
  { id: 'REC-EX1', companyId: 'CMP-EX2', projectId: 'PRJ-EX2', contractId: '', description: 'PHP — export-compliance retainer (monthly)', amount: 1500000, currency: 'XAF', frequency: 'Monthly', start: d('2026-06-20'), end: d('2026-12-20'), next: d('2026-10-01'), terms: 'Net 30', status: 'Active' },
];
