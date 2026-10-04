// ===========================================================================
// Document Library — a catalogue/index of BALIA deliverables and documents,
// each with a link you can open. The CRM has no file store, so entries hold
// metadata + an external link (Drive/Docs/etc.), not the file itself.
// ===========================================================================
const d = (s: string) => s;

export const LIBRARY_TYPES = [
  'Report', 'Presentation', 'Proposal', 'Strategy', 'Template', 'Guide', 'Contract', 'Research', 'Spreadsheet', 'Brief', 'Other',
] as const;
export const LIBRARY_PROJECTS = [
  'Balia CRM', 'Balia Consulting', 'TradeBridge Advisory', 'Other',
] as const;

export interface LibraryDoc {
  id: string; title: string; type: string; project: string; category: string;
  date: string; description: string; link: string; owner: string; tags: string[];
}

// Starter shelf: the deliverables genuinely produced in the Balia CRM work.
// Add your TradeBridge / Balia documents (with their Drive/Docs links) via
// "Add document".
export const LIBRARY: LibraryDoc[] = [
  {
    id: 'LIB-01', title: 'BALIA Opportunity Intelligence Report', type: 'Report', project: 'Balia CRM', category: 'Funding & Trade Intelligence',
    date: d('2026-09-14'), description: 'Full funding & trade opportunity report — executive summary, Top-20 direct/consulting/client lists, category and deadline breakdowns, and a data-quality summary. This is a saved snapshot; the live version is generated on demand from the Opportunity Intelligence dashboard.',
    link: '/library/BALIA-Opportunity-Intelligence-Report.md', owner: 'USR-01', tags: ['Intelligence', 'Funding'],
  },
  {
    id: 'LIB-02', title: 'BALIA Cameroon & CEMAC Client Pipeline Report', type: 'Report', project: 'Balia CRM', category: 'Business Development',
    date: d('2026-09-14'), description: 'Client prospect pipeline report — Top-50 by score / conversion / commercial potential / why-now, plus Cameroon and CEMAC master lists. This is a saved snapshot; the live version is generated on demand from Client Prospects.',
    link: '/library/BALIA-Client-Pipeline-Report.md', owner: 'USR-02', tags: ['Prospects', 'Pipeline'],
  },
  {
    id: 'LIB-03', title: 'EUDR 2026 — Readiness Guide for Cameroon & CEMAC Exporters', type: 'Guide', project: 'Balia Consulting', category: 'EUDR & Sustainability',
    date: d('2026-09-14'), description: 'Detailed EUDR readiness guide (11 sections): what the regulation is, the amended 2026/2027 timeline, scope & operator roles, the four core obligations, the Due Diligence Statement, plot geolocation, risk assessment, what certification does/does not cover, sector notes for cocoa/coffee/timber/palm/rubber, a readiness roadmap and how BALIA helps.',
    link: '/library/BALIA-EUDR-2026-Readiness-Guide.docx', owner: 'USR-01', tags: ['EUDR', 'Guide'],
  },
  {
    id: 'LIB-04', title: 'AfCFTA Implementation — 2026 Guide', type: 'Guide', project: 'Balia Consulting', category: 'AfCFTA & Trade Policy',
    date: d('2026-09-14'), description: 'Detailed AfCFTA implementation guide (10 sections): the framework and protocols, 2026 status, tariff liberalisation, rules of origin, PAPSS, services/digital protocols, what it means for CEMAC exporters, a step-by-step guide to claiming preferences, challenges, and how BALIA helps.',
    link: '/library/BALIA-AfCFTA-2026-Implementation-Guide.docx', owner: 'USR-01', tags: ['AfCFTA', 'Guide'],
  },
  // --- Downloadable BALIA operational tools (served from /library) ---
  {
    id: 'LIB-05', title: 'EUDR Supplier & Plot Traceability Register (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'EUDR & Sustainability',
    date: d('2026-09-13'), description: 'Working register to capture supplier/plot geolocation and due-diligence evidence, with a summary of completeness and risk. Flagship tool for EUDR engagements (cocoa, coffee, palm, rubber, timber).',
    link: '/library/BALIA-EUDR-Traceability-Register.xlsx', owner: 'USR-01', tags: ['EUDR', 'Tool', 'Traceability'],
  },
  {
    id: 'LIB-06', title: 'Import Landed-Cost Calculator (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'Customs',
    date: d('2026-09-13'), description: 'Calculates CIF, duty, excise, VAT (19.25% default) and total landed cost per unit from your inputs. Useful for import-compliance and tariff advisory.',
    link: '/library/BALIA-Landed-Cost-Calculator.xlsx', owner: 'USR-02', tags: ['Customs', 'Tool'],
  },
  {
    id: 'LIB-07', title: 'Client Prospect Tracker (spreadsheet)', type: 'Spreadsheet', project: 'Balia CRM', category: 'Business Development',
    date: d('2026-09-13'), description: 'Track and qualify Cameroon & CEMAC prospects with a weighted score, conversion estimate and outreach status. Mirrors the Client Prospect Intelligence view.',
    link: '/library/BALIA-Prospect-Tracker.xlsx', owner: 'USR-02', tags: ['BD', 'Tool'],
  },
  {
    id: 'LIB-08', title: 'Client Consultation Report (template)', type: 'Template', project: 'Balia Consulting', category: 'Delivery',
    date: d('2026-09-13'), description: 'Structured Word template to record a consultation — client details, challenge, findings, recommendations and next step. Fill the bracketed fields.',
    link: '/library/BALIA-Consultation-Report-Template.docx', owner: 'USR-01', tags: ['Template', 'Consultation'],
  },
  {
    id: 'LIB-09', title: 'EUDR Readiness Assessment (checklist)', type: 'Template', project: 'Balia Consulting', category: 'EUDR & Sustainability',
    date: d('2026-09-13'), description: 'Checklist to assess an exporter\u2019s EUDR readiness across scope, traceability, legality, deforestation-free evidence and the DDS, with a readiness summary table.',
    link: '/library/BALIA-EUDR-Readiness-Checklist.docx', owner: 'USR-01', tags: ['EUDR', 'Checklist'],
  },
  {
    id: 'LIB-10', title: 'Advisory Proposal (template)', type: 'Template', project: 'Balia Consulting', category: 'Business Development',
    date: d('2026-09-13'), description: 'Reusable proposal skeleton — understanding, scope, approach, team, fees and acceptance. Fill the bracketed fields per engagement.',
    link: '/library/BALIA-Proposal-Template.docx', owner: 'USR-02', tags: ['Proposal', 'Template'],
  },
  {
    id: 'LIB-11', title: 'AfCFTA Practitioner — Course Workbook (training)', type: 'Guide', project: 'Balia Consulting', category: 'Training',
    date: d('2026-09-13'), description: 'Training workbook for the AfCFTA Practitioner course — three modules, current 2026 facts, exercises and a certification table. Accompanies the Academy course.',
    link: '/library/BALIA-AfCFTA-Practitioner-Workbook.docx', owner: 'USR-01', tags: ['Training', 'AfCFTA'],
  },
  {
    id: 'LIB-12', title: 'Customs & Trade Compliance — Training Slides', type: 'Presentation', project: 'Balia Consulting', category: 'Training',
    date: d('2026-09-13'), description: 'BALIA-branded slide deck for customs & trade-compliance training — the customs environment, HS classification, valuation, rules of origin, common pitfalls, the EUDR intersection and how BALIA helps.',
    link: '/library/BALIA-Customs-Compliance-Training.pptx', owner: 'USR-02', tags: ['Training', 'Customs', 'Slides'],
  },
  {
    id: 'LIB-13', title: 'HS Classification & Duty Workbook (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'Customs',
    date: d('2026-09-13'), description: 'Log products with their HS code, customs value, duty and VAT rates; duty, VAT and total tax compute automatically. Supports classification and customs advisory.',
    link: '/library/BALIA-HS-Classification-Workbook.xlsx', owner: 'USR-02', tags: ['Customs', 'Tool', 'HS'],
  },
  {
    id: 'LIB-14', title: 'Project Time & Budget Tracker (spreadsheet)', type: 'Spreadsheet', project: 'Balia CRM', category: 'Delivery',
    date: d('2026-09-13'), description: 'Log time and cost per project; billable value, budget usage, gross margin and margin % recalculate on a summary sheet. For engagement delivery management.',
    link: '/library/BALIA-Project-Time-Budget-Tracker.xlsx', owner: 'USR-01', tags: ['Delivery', 'Tool'],
  },
  {
    id: 'LIB-15', title: 'Export Readiness Self-Assessment (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'Export Development',
    date: d('2026-09-13'), description: 'Scored self-assessment across market, product, regulatory, documentation, customs, logistics, finance and capacity — with an overall readiness percentage and bands.',
    link: '/library/BALIA-Export-Readiness-Assessment.xlsx', owner: 'USR-01', tags: ['Export', 'Assessment', 'Tool'],
  },
  {
    id: 'LIB-16', title: 'Engagement Letter & Statement of Work (template)', type: 'Template', project: 'Balia Consulting', category: 'Business Development',
    date: d('2026-09-13'), description: 'Word engagement-letter/SOW template — parties, scope, fees, responsibilities, confidentiality, term, liability, governing law and acceptance blocks.',
    link: '/library/BALIA-Engagement-Letter-SOW-Template.docx', owner: 'USR-02', tags: ['Template', 'Contract'],
  },
  {
    id: 'LIB-17', title: 'EUDR Due Diligence Statement (template)', type: 'Template', project: 'Balia Consulting', category: 'EUDR & Sustainability',
    date: d('2026-09-13'), description: 'Template mirroring the required EUDR Due Diligence Statement content — operator, product, country/geolocation of production, due-diligence conclusion and declaration.',
    link: '/library/BALIA-EUDR-Due-Diligence-Statement-Template.docx', owner: 'USR-01', tags: ['EUDR', 'Template', 'DDS'],
  },
  {
    id: 'LIB-18', title: 'AfCFTA Rules of Origin Worksheet (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'AfCFTA & Trade Policy',
    date: d('2026-09-13'), description: 'Assess whether a product qualifies for AfCFTA preferences — records the origin criterion, computes regional value content (RVC) and flags qualification against the threshold or CTH rule.',
    link: '/library/BALIA-AfCFTA-Rules-of-Origin-Worksheet.xlsx', owner: 'USR-01', tags: ['AfCFTA', 'Rules of Origin', 'Tool'],
  },
  {
    id: 'LIB-19', title: 'Invoice & Accounts-Receivable Tracker (spreadsheet)', type: 'Spreadsheet', project: 'Balia CRM', category: 'Finance',
    date: d('2026-09-13'), description: 'Track invoices and receivables — VAT, total, balance, days overdue and status compute automatically, with a summary of outstanding and overdue amounts.',
    link: '/library/BALIA-Invoice-AR-Tracker.xlsx', owner: 'USR-01', tags: ['Finance', 'Tool'],
  },
  {
    id: 'LIB-20', title: 'EUDR Supplier Risk Matrix (spreadsheet)', type: 'Spreadsheet', project: 'Balia Consulting', category: 'EUDR & Sustainability',
    date: d('2026-09-13'), description: 'Score suppliers/plots on country, traceability, legality and deforestation risk; a weighted score and risk level (Low/Medium/High) drive the mitigation plan.',
    link: '/library/BALIA-EUDR-Supplier-Risk-Matrix.xlsx', owner: 'USR-02', tags: ['EUDR', 'Risk', 'Tool'],
  },
  {
    id: 'LIB-21', title: 'Market-Entry Strategy (template)', type: 'Template', project: 'Balia Consulting', category: 'Market Entry',
    date: d('2026-09-13'), description: 'Word template for a market-entry strategy — objective, market assessment, entry-mode comparison, go-to-market plan, roadmap, risks and investment.',
    link: '/library/BALIA-Market-Entry-Strategy-Template.docx', owner: 'USR-02', tags: ['Market Entry', 'Template'],
  },
  {
    id: 'LIB-22', title: 'Incoterms® 2020 — Quick Reference', type: 'Guide', project: 'Balia Consulting', category: 'Customs & Trade',
    date: d('2026-09-13'), description: 'One-page reference to all 11 Incoterms® 2020 — meaning, where risk transfers and what the seller pays, with notes on C-terms and insurance cover.',
    link: '/library/BALIA-Incoterms-2020-Quick-Reference.docx', owner: 'USR-02', tags: ['Incoterms', 'Reference', 'Trade'],
  },
  {
    id: 'LIB-23', title: 'Client Onboarding Checklist', type: 'Template', project: 'Balia CRM', category: 'Delivery',
    date: d('2026-09-13'), description: 'Checklist from engagement acceptance to kick-off — commercial setup, compliance/KYC, project setup, delivery readiness and sign-off.',
    link: '/library/BALIA-Client-Onboarding-Checklist.docx', owner: 'USR-01', tags: ['Onboarding', 'Checklist'],
  },
  {
    id: 'LIB-24', title: 'Trade Finance — Practical Guide', type: 'Guide', project: 'Balia Consulting', category: 'Trade Finance',
    date: d('2026-09-13'), description: 'Orientation to payment methods, Letters of Credit, guarantees, financing instruments, PAPSS and the underpinning document set — for advising exporters and importers.',
    link: '/library/BALIA-Trade-Finance-Guide.docx', owner: 'USR-01', tags: ['Trade Finance', 'Guide'],
  },
];
