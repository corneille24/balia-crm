// ---------------------------------------------------------------------------
// Demo dataset. Fictional African businesses and realistic trade scenarios.
// No real personal data.
// ---------------------------------------------------------------------------
import { STAGE_PROBABILITY } from './catalog';

const d = (s: string) => s; // ISO date strings, kept as strings for portability

export interface User {
  id: string; name: string; initials: string; role: string; title: string;
  email: string; phone: string; active: boolean; lastLogin: string;
  // Team & Access (all optional so existing records remain valid)
  firstName?: string; lastName?: string; preferredName?: string;
  userType?: string; department?: string; team?: string;
  country?: string; city?: string; status?: string; manager?: string;
  employeeId?: string; startDate?: string; created?: string;
  // Consultant profile (optional)
  isConsultant?: boolean; professionalTitle?: string; shortBio?: string; fullBio?: string;
  qualifications?: string; certifications?: string; yearsExperience?: number;
  expertise?: string[]; industries?: string[]; languages?: string[]; specialisms?: string[];
  coverageCountries?: string[]; coverageRegions?: string[]; coverageMarkets?: string[];
  coverageServices?: string[]; tradeCorridors?: string[];
  employmentType?: string; endDate?: string; availability?: string;
  costRate?: number; billableRate?: number; rateCurrency?: string;
}

export const USERS: User[] = [
  { id: 'USR-01', name: 'Cornelius F. D. Dzekashu', initials: 'CD', role: 'super_admin', title: 'Founder & Principal Consultant', email: 'principal@baliaconsulting.com', phone: '+237 6 55 00 11 22', active: true, lastLogin: d('2026-09-08T07:12:00'), userType: 'Super Admin', department: 'Management', team: 'Management', status: 'Active', country: 'Cameroon', city: 'Douala', isConsultant: true, professionalTitle: 'Principal Consultant', yearsExperience: 18, expertise: ['AfCFTA', 'Trade policy', 'Market access'], languages: ['English', 'French'] },
  { id: 'USR-02', name: 'Suliy Bara', initials: 'SB', role: 'admin', title: 'Consultant', email: 's.bara@baliaconsulting.com', phone: '', active: true, lastLogin: '', userType: 'Administrator', department: 'Trade Advisory', team: 'Trade Advisory', status: 'Active', country: 'Cameroon', city: 'Douala' },
];

export interface Team {
  id: string; name: string; lead: string; department: string;
  services: string[]; markets: string[]; status: string;
}
export interface Department {
  id: string; name: string; head: string; budget: number; currency: string;
  services: string[]; status: string;
}

export const TEAMS: Team[] = [
  { id: 'TEAM-01', name: 'Trade Advisory', lead: 'USR-02', department: 'Trade Advisory', services: ['AfCFTA advisory', 'Market-entry strategy'], markets: ['ECOWAS', 'CEMAC'], status: 'Active' },
  { id: 'TEAM-02', name: 'Customs & Compliance', lead: 'USR-03', department: 'Customs & Compliance', services: ['Customs advisory', 'Import/export compliance'], markets: ['CEMAC'], status: 'Active' },
  { id: 'TEAM-03', name: 'Business Development', lead: 'USR-05', department: 'Business Development', services: ['Client acquisition'], markets: ['Cameroon', 'Nigeria'], status: 'Active' },
  { id: 'TEAM-04', name: 'Training', lead: 'USR-06', department: 'Training', services: ['Trade training & workshops'], markets: ['Pan-African'], status: 'Active' },
  { id: 'TEAM-05', name: 'Finance', lead: 'USR-04', department: 'Finance', services: ['Billing', 'Financial control'], markets: [], status: 'Active' },
  { id: 'TEAM-06', name: 'Operations', lead: 'USR-07', department: 'Operations', services: ['Delivery operations'], markets: [], status: 'Active' },
  { id: 'TEAM-07', name: 'Management', lead: 'USR-01', department: 'Management', services: ['Strategy', 'Oversight'], markets: [], status: 'Active' },
];

export const DEPARTMENTS_DATA: Department[] = [
  { id: 'DEP-01', name: 'Management', head: 'USR-01', budget: 0, currency: 'XAF', services: ['Strategy', 'Oversight'], status: 'Active' },
  { id: 'DEP-02', name: 'Trade Advisory', head: 'USR-02', budget: 24000000, currency: 'XAF', services: ['AfCFTA advisory', 'Market-entry strategy', 'Export readiness'], status: 'Active' },
  { id: 'DEP-03', name: 'Customs & Compliance', head: 'USR-03', budget: 18000000, currency: 'XAF', services: ['Customs advisory', 'Regulatory & compliance advisory'], status: 'Active' },
  { id: 'DEP-04', name: 'Business Development', head: 'USR-05', budget: 12000000, currency: 'XAF', services: ['Client acquisition'], status: 'Active' },
  { id: 'DEP-05', name: 'Training', head: 'USR-06', budget: 9000000, currency: 'XAF', services: ['Trade training & workshops'], status: 'Active' },
  { id: 'DEP-06', name: 'Finance', head: 'USR-04', budget: 6000000, currency: 'XAF', services: ['Billing', 'Financial control'], status: 'Active' },
  { id: 'DEP-07', name: 'Operations', head: 'USR-07', budget: 7500000, currency: 'XAF', services: ['Delivery operations'], status: 'Active' },
];

export interface AccessRequest {
  id: string; requester: string; type: string; target: string; reason: string;
  status: string; requested: string; decidedBy?: string; decidedAt?: string; decisionNote?: string;
}
export interface Session {
  id: string; user: string; device: string; browser: string; ip: string;
  location: string; started: string; lastActive: string; current?: boolean; active: boolean;
}
export interface LoginEvent {
  id: string; user: string; event: string; at: string;
  device: string; browser: string; ip: string; result: string; reason?: string;
}

export const ACCESS_REQUESTS: AccessRequest[] = [
  { id: 'ACR-01', requester: 'USR-05', type: 'Client', target: 'Kola Agro Industries', reason: 'Leading the renewal conversation; need visibility of the account.', status: 'Pending', requested: d('2026-09-08T09:20:00') },
  { id: 'ACR-02', requester: 'USR-02', type: 'Sensitive record', target: 'Consultant billing rates', reason: 'Preparing a staffing proposal and need blended rates.', status: 'Pending', requested: d('2026-09-07T15:05:00') },
  { id: 'ACR-03', requester: 'USR-06', type: 'Module access', target: 'Reports', reason: 'Reporting on training revenue for the quarter.', status: 'Approved', requested: d('2026-09-04T11:00:00'), decidedBy: 'USR-07', decidedAt: d('2026-09-04T14:12:00'), decisionNote: 'Read access granted.' },
  { id: 'ACR-04', requester: 'USR-03', type: 'Project', target: 'EUDR Readiness — Kola Agro', reason: 'Assigned as supporting consultant.', status: 'Rejected', requested: d('2026-09-02T08:30:00'), decidedBy: 'USR-01', decidedAt: d('2026-09-02T10:00:00'), decisionNote: 'Not yet assigned; revisit after kickoff.' },
];

export const SESSIONS: Session[] = [
  { id: 'SES-01', user: 'USR-01', device: 'MacBook Pro', browser: 'Chrome 128', ip: '102.244.18.4', location: 'Douala, CM', started: d('2026-09-08T07:10:00'), lastActive: d('2026-09-08T09:02:00'), current: true, active: true },
  { id: 'SES-02', user: 'USR-01', device: 'iPhone 15', browser: 'Safari Mobile', ip: '154.72.10.88', location: 'Douala, CM', started: d('2026-09-07T18:40:00'), lastActive: d('2026-09-07T21:15:00'), active: true },
  { id: 'SES-03', user: 'USR-02', device: 'Windows 11', browser: 'Edge 128', ip: '41.82.220.7', location: 'Dakar, SN', started: d('2026-09-08T08:00:00'), lastActive: d('2026-09-08T08:50:00'), active: true },
  { id: 'SES-04', user: 'USR-04', device: 'MacBook Air', browser: 'Chrome 128', ip: '197.248.30.2', location: 'Nairobi, KE', started: d('2026-09-08T06:50:00'), lastActive: d('2026-09-08T07:30:00'), active: true },
];

export const LOGIN_HISTORY: LoginEvent[] = [
  { id: 'LOG-01', user: 'USR-01', event: 'Login', at: d('2026-09-08T07:10:00'), device: 'MacBook Pro', browser: 'Chrome 128', ip: '102.244.18.4', result: 'Success' },
  { id: 'LOG-02', user: 'USR-02', event: 'Login', at: d('2026-09-08T08:00:00'), device: 'Windows 11', browser: 'Edge 128', ip: '41.82.220.7', result: 'Success' },
  { id: 'LOG-03', user: 'USR-05', event: 'Failed login', at: d('2026-09-08T07:58:00'), device: 'Android', browser: 'Chrome Mobile', ip: '154.72.44.19', result: 'Failed', reason: 'Incorrect password' },
  { id: 'LOG-04', user: 'USR-04', event: 'Login', at: d('2026-09-08T06:50:00'), device: 'MacBook Air', browser: 'Chrome 128', ip: '197.248.30.2', result: 'Success' },
  { id: 'LOG-05', user: 'USR-06', event: 'Password reset', at: d('2026-09-05T13:40:00'), device: 'Windows 11', browser: 'Firefox 129', ip: '102.244.90.11', result: 'Success' },
  { id: 'LOG-06', user: 'USR-03', event: 'Logout', at: d('2026-09-07T17:45:00'), device: 'MacBook Pro', browser: 'Safari 17', ip: '102.244.18.40', result: 'Success' },
  { id: 'LOG-07', user: 'USR-07', event: 'Invitation acceptance', at: d('2026-08-30T10:12:00'), device: 'Windows 11', browser: 'Edge 127', ip: '105.112.20.9', result: 'Success' },
  { id: 'LOG-08', user: 'USR-05', event: 'Login', at: d('2026-09-08T08:31:00'), device: 'Android', browser: 'Chrome Mobile', ip: '154.72.44.19', result: 'Success' },
];

export interface Company {
  id: string; legalName: string; tradingName: string; regNumber: string;
  country: string; city: string; address: string; website: string; industry: string;
  size: string; employees: number; turnover: string; products: string[];
  currentMarkets: string[]; targetMarkets: string[]; interests: string[];
  owner: string; status: 'Lead' | 'Prospect' | 'Client' | 'Former Client';
  health: 'Healthy' | 'Stable' | 'Needs Attention' | 'At Risk';
  tags: string[]; since: string; notes: string; currency: string;
}

export const COMPANIES: Company[] = [
  { id: 'CMP-01', legalName: 'Kola Nut Agro-Industries SARL', tradingName: 'Kola Agro', regNumber: 'RC/DLA/2016/B/4417', country: 'Cameroon', city: 'Douala', address: 'Zone Industrielle de Bonabéri, BP 4417, Douala', website: 'kola-agro.cm', industry: 'Agri-processing', size: 'Medium', employees: 218, turnover: 'XAF 4.8bn', products: ['Cocoa butter', 'Cocoa liquor', 'Cocoa powder'], currentMarkets: ['Cameroon', 'Nigeria', 'Gabon'], targetMarkets: ['Netherlands', 'Germany', 'Ghana'], interests: ['EUDR', 'AfCFTA', 'EU Market'], owner: 'USR-01', status: 'Client', health: 'Healthy', tags: ['EUDR', 'High Value', 'Exporter', 'Retainer'], since: d('2025-04-14'), notes: 'Flagship EUDR account. Board is pushing for first EU direct shipment before the December 2026 deadline.', currency: 'EUR' },
  { id: 'CMP-02', legalName: 'Sahel Textiles PLC', tradingName: 'Sahel Textiles', regNumber: 'RC-1198442', country: 'Nigeria', city: 'Kano', address: 'Plot 22, Bompai Industrial Layout, Kano', website: 'saheltextiles.ng', industry: 'Textiles & apparel', size: 'Large', employees: 640, turnover: 'XAF 13.3bn', products: ['Woven cotton fabric', 'Finished garments'], currentMarkets: ['Nigeria', 'Niger'], targetMarkets: ['Ghana', 'Senegal', 'United Kingdom'], interests: ['AfCFTA'], owner: 'USR-05', status: 'Client', health: 'Stable', tags: ['AfCFTA', 'Manufacturer'], since: d('2025-11-03'), notes: 'Wants preferential access across ECOWAS under AfCFTA rather than the ETLS route.', currency: 'XAF' },
  { id: 'CMP-03', legalName: 'Zanzibar Spice Collective Ltd', tradingName: 'ZSC', regNumber: 'ZNZ-2019-00871', country: 'Tanzania', city: 'Zanzibar', address: 'Malindi Road, Stone Town, Zanzibar', website: 'zanzibarspice.co.tz', industry: 'Food & spices', size: 'Small', employees: 74, turnover: 'XAF 1.9bn', products: ['Cloves', 'Black pepper', 'Cardamom', 'Vanilla'], currentMarkets: ['Tanzania', 'Kenya', 'UAE'], targetMarkets: ['Germany', 'France'], interests: ['EU Market', 'Export Readiness'], owner: 'USR-02', status: 'Client', health: 'Needs Attention', tags: ['Exporter', 'EU Market'], since: d('2026-01-20'), notes: 'Documentation quality is the binding constraint. Two rejected consignments in 2025.', currency: 'EUR' },
  { id: 'CMP-04', legalName: 'Accra Cocoa Ventures Ltd', tradingName: 'Accra Cocoa', regNumber: 'CS-441220198', country: 'Ghana', city: 'Accra', address: '14 Ring Road East, Osu, Accra', website: 'accracocoa.gh', industry: 'Agri-processing', size: 'Medium', employees: 155, turnover: 'XAF 5.7bn', products: ['Cocoa nibs', 'Cocoa butter'], currentMarkets: ['Ghana', 'Côte d’Ivoire'], targetMarkets: ['Netherlands', 'Germany'], interests: ['EUDR', 'EU Market'], owner: 'USR-01', status: 'Client', health: 'Healthy', tags: ['EUDR', 'Exporter', 'High Value'], since: d('2026-03-02'), notes: 'Referred by the Cocoa Value Addition Alliance following the Abuja Declaration.', currency: 'EUR' },
  { id: 'CMP-05', legalName: 'Rift Valley Coffee Union', tradingName: 'RVCU', regNumber: 'CS/2014/198220', country: 'Kenya', city: 'Nairobi', address: 'Nyeri Road, Kilimani, Nairobi', website: 'riftvalleycoffee.ke', industry: 'Agriculture', size: 'Medium', employees: 310, turnover: 'XAF 7.7bn', products: ['Washed arabica', 'Speciality micro-lots'], currentMarkets: ['Kenya', 'Germany'], targetMarkets: ['United Kingdom', 'United Arab Emirates'], interests: ['Export Readiness', 'Market Entry'], owner: 'USR-02', status: 'Client', health: 'Healthy', tags: ['Exporter', 'Retainer'], since: d('2025-08-11'), notes: 'Retainer client. Monthly corridor briefing plus classification support.', currency: 'XAF' },
  { id: 'CMP-06', legalName: 'Atlas Ceramics SA', tradingName: 'Atlas Ceramics', regNumber: 'RC-CASA-88114', country: 'Morocco', city: 'Casablanca', address: 'Zone Industrielle Ain Sebaa, Casablanca', website: 'atlasceramics.ma', industry: 'Building materials', size: 'Large', employees: 480, turnover: 'EUR 41m', products: ['Floor tiles', 'Sanitary ware'], currentMarkets: ['Morocco', 'Spain', 'France'], targetMarkets: ['Senegal', 'Côte d’Ivoire', 'Cameroon'], interests: ['AfCFTA'], owner: 'USR-05', status: 'Prospect', health: 'Stable', tags: ['AfCFTA', 'Manufacturer', 'High Value'], since: d('2026-06-18'), notes: 'Wants to serve West Africa from Casablanca under AfCFTA preferences.', currency: 'EUR' },
  { id: 'CMP-07', legalName: 'Bamenda Timber & Wood Products SARL', tradingName: 'Bamenda Timber', regNumber: 'RC/BDA/2011/B/992', country: 'Cameroon', city: 'Bamenda', address: 'Mile 4 Nkwen, Bamenda', website: 'bamendatimber.cm', industry: 'Forestry & wood', size: 'Medium', employees: 195, turnover: 'XAF 2.6bn', products: ['Sawn hardwood', 'Wood flooring'], currentMarkets: ['Cameroon', 'Nigeria'], targetMarkets: ['Netherlands', 'Germany', 'United Kingdom'], interests: ['EUDR', 'EU Market'], owner: 'USR-01', status: 'Prospect', health: 'Needs Attention', tags: ['EUDR', 'Priority', 'Exporter'], since: d('2026-07-29'), notes: 'Geolocation data for 40% of concessions is missing. High-urgency EUDR case.', currency: 'EUR' },
  { id: 'CMP-08', legalName: 'Dakar Marine Foods SA', tradingName: 'Dakar Marine', regNumber: 'SN-DKR-2017-9930', country: 'Senegal', city: 'Dakar', address: 'Môle 8, Port Autonome de Dakar', website: 'dakarmarine.sn', industry: 'Seafood processing', size: 'Medium', employees: 260, turnover: 'EUR 18m', products: ['Frozen octopus', 'Tuna loins'], currentMarkets: ['Senegal', 'Spain', 'Italy'], targetMarkets: ['France', 'Netherlands'], interests: ['EU Market', 'Regulatory'], owner: 'USR-02', status: 'Prospect', health: 'Stable', tags: ['Exporter', 'EU Market'], since: d('2026-05-06'), notes: 'EU establishment number already held; needs labelling and traceability review.', currency: 'EUR' },
  { id: 'CMP-09', legalName: 'Lusaka Copper Fabrication Ltd', tradingName: 'Lusaka Copper', regNumber: 'ZM-118220', country: 'Zambia', city: 'Lusaka', address: 'Plot 4411, Lusaka South MFEZ', website: 'lusakacopper.zm', industry: 'Metals fabrication', size: 'Medium', employees: 340, turnover: 'XAF 16.3bn', products: ['Copper cable', 'Busbars'], currentMarkets: ['Zambia', 'DRC', 'Zimbabwe'], targetMarkets: ['Tanzania', 'Kenya', 'Rwanda'], interests: ['AfCFTA'], owner: 'USR-03', status: 'Prospect', health: 'Stable', tags: ['AfCFTA', 'Manufacturer'], since: d('2026-08-12'), notes: 'Landlocked corridor costs are the main commercial constraint.', currency: 'XAF' },
  { id: 'CMP-10', legalName: 'Kigali Pharma Distribution Ltd', tradingName: 'Kigali Pharma', regNumber: 'RW-104882201', country: 'Rwanda', city: 'Kigali', address: 'KG 7 Ave, Kacyiru, Kigali', website: 'kigalipharma.rw', industry: 'Pharmaceutical distribution', size: 'Small', employees: 88, turnover: 'XAF 3.7bn', products: ['Generic medicines', 'Medical consumables'], currentMarkets: ['Rwanda'], targetMarkets: ['Burundi', 'DRC'], interests: ['Regulatory', 'Customs'], owner: 'USR-03', status: 'Lead', health: 'Stable', tags: ['Importer'], since: d('2026-08-30'), notes: 'Import compliance enquiry from the website. Not yet qualified.', currency: 'XAF' },
];

export interface Contact {
  id: string; companyId: string; firstName: string; lastName: string; position: string;
  type: string; department: string; email: string; phone: string; whatsapp: string;
  linkedin: string; preferred: string; decisionMaker: boolean; tags: string[]; notes: string;
}

const c = (id: string, companyId: string, firstName: string, lastName: string, position: string, type: string, department: string, email: string, phone: string, decisionMaker: boolean, preferred: string, notes: string, tags: string[] = []): Contact => ({
  id, companyId, firstName, lastName, position, type, department, email, phone,
  whatsapp: phone, linkedin: `linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
  preferred, decisionMaker, tags, notes,
});

export const CONTACTS: Contact[] = [
  c('CON-01', 'CMP-01', 'Elise', 'Mbarga', 'Managing Director', 'CEO', 'Executive', 'e.mbarga@kola-agro.cm', '+237 6 77 21 04 88', true, 'Email', 'Decision maker on all EUDR spend. Prefers written summaries before calls.', ['Decision Maker']),
  c('CON-02', 'CMP-01', 'Patrick', 'Awono', 'Export Manager', 'Export Manager', 'Commercial', 'p.awono@kola-agro.cm', '+237 6 90 44 12 77', false, 'WhatsApp', 'Day-to-day contact for shipment documentation.', []),
  c('CON-03', 'CMP-01', 'Nadège', 'Tchouta', 'Sustainability Officer', 'Compliance', 'Compliance', 'n.tchouta@kola-agro.cm', '+237 6 55 88 03 21', false, 'Email', 'Owns the geolocation dataset and supplier declarations.', ['EUDR']),
  c('CON-04', 'CMP-02', 'Ibrahim', 'Sanusi', 'Group Chief Executive', 'CEO', 'Executive', 'i.sanusi@saheltextiles.ng', '+234 803 220 4417', true, 'Phone', 'Signs contracts personally. Very responsive on WhatsApp.', ['Decision Maker']),
  c('CON-05', 'CMP-02', 'Fatima', 'Bello', 'Head of Exports', 'Export Manager', 'Commercial', 'f.bello@saheltextiles.ng', '+234 809 118 2204', false, 'Email', 'Manages ECOWAS documentation.', []),
  c('CON-06', 'CMP-03', 'Salma', 'Juma', 'Founder & Director', 'Founder', 'Executive', 's.juma@zanzibarspice.co.tz', '+255 777 412 009', true, 'Email', 'Founder-led. Cost sensitive but committed to EU entry.', ['Decision Maker']),
  c('CON-07', 'CMP-03', 'Hamisi', 'Rashid', 'Operations Lead', 'Operations', 'Operations', 'h.rashid@zanzibarspice.co.tz', '+255 715 330 812', false, 'WhatsApp', 'Handles packing and consignment preparation.', []),
  c('CON-08', 'CMP-04', 'Kwame', 'Boateng', 'Chief Operating Officer', 'Director', 'Executive', 'k.boateng@accracocoa.gh', '+233 24 411 8802', true, 'Email', 'Introduced through the Cocoa Value Addition Alliance.', ['Decision Maker']),
  c('CON-09', 'CMP-04', 'Abena', 'Osei', 'Compliance Manager', 'Compliance', 'Compliance', 'a.osei@accracocoa.gh', '+233 20 887 3310', false, 'Email', 'Collating supplier plot data for the EUDR register.', ['EUDR']),
  c('CON-10', 'CMP-05', 'Joseph', 'Kariuki', 'General Manager', 'Director', 'Executive', 'j.kariuki@riftvalleycoffee.ke', '+254 722 880 114', true, 'Phone', 'Retainer sponsor. Quarterly review scheduled each January and July.', ['Decision Maker', 'Retainer']),
  c('CON-11', 'CMP-05', 'Wanjiru', 'Njoroge', 'Finance Director', 'Finance', 'Finance', 'w.njoroge@riftvalleycoffee.ke', '+254 733 209 771', false, 'Email', 'Approves invoices; requires PO reference on every invoice.', ['Finance']),
  c('CON-12', 'CMP-06', 'Youssef', 'El Amrani', 'Export Director', 'Director', 'Commercial', 'y.elamrani@atlasceramics.ma', '+212 661 224 908', true, 'Email', 'Evaluating BALIA against a Casablanca firm. Price-sensitive.', ['Decision Maker']),
  c('CON-13', 'CMP-06', 'Leila', 'Bennani', 'Logistics Manager', 'Operations', 'Operations', 'l.bennani@atlasceramics.ma', '+212 662 771 340', false, 'Email', 'Owns the freight and corridor data.', []),
  c('CON-14', 'CMP-07', 'Emmanuel', 'Nfor', 'Managing Director', 'CEO', 'Executive', 'e.nfor@bamendatimber.cm', '+237 6 78 11 90 42', true, 'WhatsApp', 'Urgent EUDR exposure; understands the December 2026 deadline.', ['Decision Maker', 'Priority']),
  c('CON-15', 'CMP-07', 'Blaise', 'Ndikum', 'Forestry Supervisor', 'Operations', 'Operations', 'b.ndikum@bamendatimber.cm', '+237 6 99 04 71 20', false, 'Phone', 'Holds the concession maps in paper form.', []),
  c('CON-16', 'CMP-08', 'Awa', 'Ndiaye', 'Quality & Compliance Director', 'Compliance', 'Compliance', 'a.ndiaye@dakarmarine.sn', '+221 77 550 8812', true, 'Email', 'Former EU inspector. Technically demanding.', ['Decision Maker']),
  c('CON-17', 'CMP-08', 'Cheikh', 'Fall', 'Commercial Manager', 'Procurement', 'Commercial', 'c.fall@dakarmarine.sn', '+221 76 330 2214', false, 'Phone', 'Negotiates commercial terms.', []),
  c('CON-18', 'CMP-09', 'Mutale', 'Chanda', 'Head of Trade', 'Director', 'Commercial', 'm.chanda@lusakacopper.zm', '+260 977 220 118', true, 'Email', 'Focused on landed cost into East Africa.', ['Decision Maker']),
  c('CON-19', 'CMP-10', 'Claudine', 'Uwase', 'Regulatory Affairs Lead', 'Compliance', 'Compliance', 'c.uwase@kigalipharma.rw', '+250 788 441 220', true, 'Email', 'Enquiry came through the website contact form.', []),
  c('CON-20', 'CMP-02', 'Musa', 'Adeyemi', 'Group Finance Controller', 'Finance', 'Finance', 'm.adeyemi@saheltextiles.ng', '+234 807 441 9021', false, 'Email', 'Processes payments on a 45-day cycle in practice.', ['Finance']),
];

export interface Lead {
  id: string; companyName: string; contactName: string; email: string; phone: string;
  country: string; city: string; website: string; industry: string; companySize: string;
  source: string; serviceInterest: string; targetMarket: string; currentMarket: string;
  exportExperience: string; estimatedBudget: number; currency: string; value: number;
  scoreFlags: string[]; owner: string; status: string; priority: 'Low' | 'Medium' | 'High';
  created: string; lastContact: string; nextFollowUp: string; notes: string; tags: string[];
  campaign: string; lostReason?: string; companyId?: string;
}

const leadSeeds: Array<[string, string, string, string, string, string, string, string, string, number, string[], string, string, string, string, string, string]> = [
  // company, contact, country, industry, source, service, targetMarket, exportExp, owner, budget, flags, status, priority, created, lastContact, nextFollowUp, notes
  ['Bamenda Timber & Wood Products', 'Emmanuel Nfor', 'Cameroon', 'Forestry & wood', 'Referral', 'EUDR Readiness & Due Diligence', 'Netherlands', 'Occasional', 'USR-01', 13250000, ['export_plans', 'compliance_issue', 'budget', 'decision_maker', 'urgent', 'target_market'], 'Negotiation', 'High', '2026-07-29', '2026-09-05', '2026-09-09', 'Board approved budget. Contract wording under review by their lawyer.'],
  ['Atlas Ceramics SA', 'Youssef El Amrani', 'Morocco', 'Building materials', 'LinkedIn', 'AfCFTA Market Entry Strategy', 'Senegal', 'Experienced', 'USR-05', 10840000, ['export_plans', 'expansion', 'target_market', 'decision_maker'], 'Proposal Sent', 'High', '2026-06-18', '2026-09-02', '2026-09-10', 'Comparing us with a Casablanca advisory. Differentiate on AfCFTA origin depth.'],
  ['Dakar Marine Foods SA', 'Awa Ndiaye', 'Senegal', 'Seafood processing', 'Networking', 'Product Compliance Assessment', 'France', 'Experienced', 'USR-02', 4520000, ['export_plans', 'target_market', 'compliance_issue'], 'Proposal Required', 'Medium', '2026-05-06', '2026-09-01', '2026-09-11', 'Wants labelling and traceability review ahead of a new French retail listing.'],
  ['Lusaka Copper Fabrication', 'Mutale Chanda', 'Zambia', 'Metals fabrication', 'Partner', 'AfCFTA Readiness Assessment', 'Kenya', 'Occasional', 'USR-03', 5420000, ['export_plans', 'expansion', 'target_market'], 'Consultation Scheduled', 'Medium', '2026-08-12', '2026-09-04', '2026-09-12', 'Consultation booked for 12 September to scope corridor economics.'],
  ['Kigali Pharma Distribution', 'Claudine Uwase', 'Rwanda', 'Pharmaceutical distribution', 'Website', 'Customs Compliance Review', 'Burundi', 'None', 'USR-03', 2410000, ['compliance_issue'], 'New', 'Medium', '2026-08-30', '2026-08-30', '2026-09-08', 'Website enquiry about repeated clearance delays at Rusumo.'],
  ['Nyanza Tea Estates', 'Peter Muhoza', 'Rwanda', 'Agriculture', 'Google', 'Export Readiness Assessment', 'United Kingdom', 'None', 'USR-02', 3610000, ['export_plans', 'target_market', 'budget'], 'Qualified', 'High', '2026-08-19', '2026-09-03', '2026-09-09', 'First-time exporter with strong volumes and a UK buyer already interested.'],
  ['Abidjan Cashew Processing', 'Marie-Laure Kouassi', 'Côte d’Ivoire', 'Agri-processing', 'Referral', 'EU Market Entry Assessment', 'Germany', 'Occasional', 'USR-01', 10240000, ['export_plans', 'expansion', 'target_market', 'decision_maker'], 'Contacted', 'High', '2026-08-25', '2026-09-06', '2026-09-14', 'Referred by Accra Cocoa. Processing capacity doubling in Q1 2027.'],
  ['Mombasa Logistics Group', 'Ali Hassan', 'Kenya', 'Logistics', 'LinkedIn', 'Customs & Trade Compliance Training', 'Kenya', 'Experienced', 'USR-06', 7230000, ['budget', 'decision_maker', 'urgent'], 'Proposal Sent', 'High', '2026-08-05', '2026-09-01', '2026-09-09', 'In-house training for 24 declarants across three branches.'],
  ['Lagos Packaging Industries', 'Chidi Okonkwo', 'Nigeria', 'Packaging', 'Networking', 'AfCFTA Readiness Assessment', 'Ghana', 'Occasional', 'USR-05', 4820000, ['export_plans', 'target_market'], 'Contacted', 'Medium', '2026-08-14', '2026-08-29', '2026-09-10', 'Met at the Lagos AfCFTA business forum.'],
  ['Cotonou Shea Cooperative', 'Rachel Adjovi', 'Benin', 'Agri-processing', 'Partner', 'Export Readiness Assessment', 'France', 'None', 'USR-02', 3010000, ['export_plans', 'target_market'], 'Qualified', 'Medium', '2026-07-16', '2026-08-28', '2026-09-15', 'Cooperative structure — decision cycle will be slow.'],
  ['Windhoek Meat Exports', 'Johan Shipanga', 'Namibia', 'Meat processing', 'Google', 'Product Compliance Assessment', 'Netherlands', 'Experienced', 'USR-03', 4220000, ['export_plans', 'compliance_issue', 'target_market'], 'Nurture', 'Low', '2026-06-02', '2026-08-11', '2026-10-01', 'Budget deferred to their next financial year.'],
  ['Kampala Coffee Traders', 'Sarah Namatovu', 'Uganda', 'Agriculture', 'Referral', 'Export Documentation Package', 'Germany', 'Occasional', 'USR-02', 2110000, ['export_plans', 'target_market', 'budget'], 'Won', 'Medium', '2026-05-11', '2026-06-20', '2026-09-20', 'Converted in June. Documentation package delivered.'],
  ['Ouagadougou Leather Works', 'Boureima Sawadogo', 'Burkina Faso', 'Leather goods', 'WhatsApp', 'AfCFTA Readiness Assessment', 'Ghana', 'None', 'USR-05', 2710000, ['export_plans'], 'Nurture', 'Low', '2026-04-22', '2026-07-30', '2026-10-15', 'Interested but no funding confirmed.'],
  ['Maputo Seafoods Lda', 'Carlos Machava', 'Mozambique', 'Seafood processing', 'LinkedIn', 'EU Market Entry Assessment', 'Portugal', 'Occasional', 'USR-02', 9040000, ['export_plans', 'expansion', 'target_market', 'budget'], 'Qualified', 'High', '2026-08-21', '2026-09-04', '2026-09-11', 'Strong fit. Needs EU establishment approval route mapped.'],
  ['Harare Agro Mills', 'Tendai Moyo', 'Zimbabwe', 'Food processing', 'Website', 'AfCFTA Readiness Assessment', 'Zambia', 'None', 'USR-05', 3310000, ['export_plans', 'target_market'], 'Contacted', 'Medium', '2026-08-27', '2026-09-02', '2026-09-12', 'Regional expansion into Zambia and Malawi.'],
  ['Casablanca Auto Parts', 'Nabil Tazi', 'Morocco', 'Automotive', 'Direct', 'HS Classification Advisory', 'Cameroon', 'Experienced', 'USR-03', 1810000, ['compliance_issue', 'urgent'], 'Proposal Required', 'Medium', '2026-08-31', '2026-09-05', '2026-09-09', 'Classification dispute with CEMAC customs on brake components.'],
  ['Kinshasa Building Supplies', 'Gilbert Kabeya', 'DR Congo', 'Building materials', 'Networking', 'Customs Compliance Review', 'DR Congo', 'None', 'USR-03', 3920000, ['compliance_issue', 'budget'], 'Qualified', 'Medium', '2026-08-08', '2026-09-01', '2026-09-10', 'Duty overpayment suspected on imported fittings.'],
  ['Freetown Fisheries Ltd', 'Aminata Kamara', 'Sierra Leone', 'Seafood processing', 'Partner', 'Export Readiness Assessment', 'Spain', 'None', 'USR-02', 2890000, ['export_plans', 'target_market'], 'New', 'Low', '2026-09-01', '2026-09-01', '2026-09-09', 'Introduced by a chamber of commerce partner.'],
  ['Bujumbura Coffee Washing', 'Léonce Ndayisaba', 'Burundi', 'Agriculture', 'Referral', 'Export Documentation Package', 'Belgium', 'None', 'USR-02', 1810000, ['export_plans'], 'Contacted', 'Low', '2026-08-18', '2026-08-30', '2026-09-16', 'Small volumes; may suit the training route instead.'],
  ['Tema Steel Works', 'Nii Armah', 'Ghana', 'Metals fabrication', 'LinkedIn', 'AfCFTA Market Entry Strategy', 'Nigeria', 'Occasional', 'USR-05', 6630000, ['export_plans', 'expansion', 'target_market', 'decision_maker'], 'Consultation Scheduled', 'High', '2026-08-24', '2026-09-05', '2026-09-10', 'Consultation set for 10 September with the CEO and CFO.'],
  ['Nairobi Medical Supplies', 'Grace Otieno', 'Kenya', 'Medical devices', 'Google', 'Product Compliance Assessment', 'Tanzania', 'None', 'USR-03', 3130000, ['compliance_issue', 'target_market'], 'Contacted', 'Medium', '2026-08-20', '2026-09-03', '2026-09-13', 'Needs EAC conformity route mapped.'],
  ['Yaoundé Furniture Collective', 'Sylvie Meka', 'Cameroon', 'Furniture', 'WhatsApp', 'AfCFTA Readiness Assessment', 'Gabon', 'None', 'USR-05', 2110000, ['export_plans'], 'New', 'Low', '2026-09-03', '2026-09-03', '2026-09-10', 'WhatsApp enquiry from a workshop attendee.'],
  ['Port Harcourt Chemicals', 'Emeka Nwosu', 'Nigeria', 'Chemicals', 'Direct', 'Customs Compliance Review', 'Nigeria', 'Experienced', 'USR-03', 5720000, ['compliance_issue', 'budget', 'decision_maker'], 'Qualified', 'High', '2026-08-11', '2026-09-04', '2026-09-09', 'Post-clearance audit notice received from Nigeria Customs.'],
  ['Arusha Horticulture Exports', 'Neema Massawe', 'Tanzania', 'Horticulture', 'Referral', 'EU Market Entry Assessment', 'Netherlands', 'Occasional', 'USR-02', 8430000, ['export_plans', 'expansion', 'target_market', 'budget', 'decision_maker'], 'Negotiation', 'High', '2026-07-08', '2026-09-05', '2026-09-09', 'Scope agreed; negotiating payment schedule across three tranches.'],
  ['Luanda Beverage Co', 'Paulo Ferreira', 'Angola', 'Beverages', 'Website', 'AfCFTA Readiness Assessment', 'Namibia', 'None', 'USR-05', 3610000, ['export_plans', 'target_market'], 'Lost', 'Low', '2026-05-19', '2026-07-14', '2026-07-14', 'Chose an in-house route.'],
  ['Blantyre Tea Company', 'Alinafe Banda', 'Malawi', 'Agriculture', 'Partner', 'Export Readiness Assessment', 'United Kingdom', 'Occasional', 'USR-02', 3310000, ['export_plans', 'target_market'], 'Nurture', 'Low', '2026-06-27', '2026-08-20', '2026-10-05', 'Waiting on cooperative board approval.'],
  ['Djibouti Trade Logistics', 'Hodan Farah', 'Djibouti', 'Logistics', 'Networking', 'Customs & Trade Compliance Training', 'Ethiopia', 'Experienced', 'USR-06', 5420000, ['budget', 'decision_maker'], 'Proposal Required', 'Medium', '2026-08-29', '2026-09-05', '2026-09-11', 'Corridor training for 18 staff.'],
  ['Bangui Agro Exports', 'Jean-Pierre Yakite', 'Central African Republic', 'Agriculture', 'WhatsApp', 'Export Readiness Assessment', 'Cameroon', 'None', 'USR-05', 1510000, [], 'New', 'Low', '2026-09-05', '2026-09-05', '2026-09-12', 'Very early stage. Regional corridor question.'],
  ['Kumasi Textiles Ltd', 'Yaw Mensah', 'Ghana', 'Textiles & apparel', 'LinkedIn', 'Rules of Origin Advisory', 'Nigeria', 'Occasional', 'USR-05', 2530000, ['export_plans', 'target_market', 'compliance_issue'], 'Qualified', 'Medium', '2026-08-22', '2026-09-04', '2026-09-10', 'Origin status challenged on a Nigerian consignment.'],
  ['Antananarivo Vanilla Union', 'Hery Rakoto', 'Madagascar', 'Food & spices', 'Referral', 'EU Market Entry Assessment', 'France', 'Experienced', 'USR-02', 7830000, ['export_plans', 'target_market', 'budget'], 'Contacted', 'Medium', '2026-08-16', '2026-09-02', '2026-09-15', 'Existing EU sales through an agent; wants direct listing.'],
];

export const LEADS: Lead[] = leadSeeds.map((s, i) => {
  const [companyName, contactName, country, industry, source, serviceInterest, targetMarket, exportExperience, owner, budget, flags, status, priority, created, lastContact, nextFollowUp, notes] = s;
  const first = contactName.split(' ')[0].toLowerCase();
  const domain = companyName.toLowerCase().replace(/[^a-z]+/g, '').slice(0, 14);
  return {
    id: `LED-${String(i + 1).padStart(3, '0')}`,
    companyName, contactName,
    email: `${first}@${domain}.com`,
    phone: '+000 000 000 000',
    country, city: '', website: `${domain}.com`, industry, companySize: 'Medium',
    source, serviceInterest, targetMarket, currentMarket: country, exportExperience,
    estimatedBudget: budget, currency: 'XAF', value: budget,
    scoreFlags: flags as string[], owner, status,
    priority: priority as Lead['priority'],
    created, lastContact, nextFollowUp, notes,
    tags: [], campaign: source === 'Google' ? 'Search — Export Compliance 2026' : source === 'LinkedIn' ? 'LinkedIn — AfCFTA Series' : '',
    lostReason: status === 'Lost' ? 'Chose an in-house route' : undefined,
    companyId: ['Bamenda Timber & Wood Products', 'Atlas Ceramics SA', 'Dakar Marine Foods SA', 'Lusaka Copper Fabrication', 'Kigali Pharma Distribution'][
      ['Bamenda Timber & Wood Products', 'Atlas Ceramics SA', 'Dakar Marine Foods SA', 'Lusaka Copper Fabrication', 'Kigali Pharma Distribution'].indexOf(companyName)
    ] ? ['CMP-07', 'CMP-06', 'CMP-08', 'CMP-09', 'CMP-10'][
      ['Bamenda Timber & Wood Products', 'Atlas Ceramics SA', 'Dakar Marine Foods SA', 'Lusaka Copper Fabrication', 'Kigali Pharma Distribution'].indexOf(companyName)
    ] : undefined,
  };
});

export interface Opportunity {
  id: string; name: string; companyId?: string; companyName: string; contactName: string;
  serviceId: string; value: number; currency: string; probability: number; stage: string;
  expectedClose: string; owner: string; source: string; competitor: string;
  nextAction: string; notes: string; created: string; leadId?: string; lostReason?: string;
  goNoGo?: { scores: Record<string, number>; requiredPartners: boolean; recommendation: string; rationale: string; scorePct: number; decidedBy: string; decidedAt: string };
}

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'OPP-001', name: 'EUDR due diligence programme', companyId: 'CMP-07', companyName: 'Bamenda Timber & Wood Products', contactName: 'Emmanuel Nfor', serviceId: 'SVC-10', value: 22000, currency: 'EUR', probability: 80, stage: 'Negotiation', expectedClose: '2026-09-18', owner: 'USR-01', source: 'Referral', competitor: 'Preferred by Nature (direct)', nextAction: 'Contract wording call on 9 September', notes: 'Deadline pressure is our strongest lever — 30 December 2026 is immovable.', created: '2026-07-30', leadId: 'LED-001' },
  { id: 'OPP-002', name: 'West Africa entry under AfCFTA', companyId: 'CMP-06', companyName: 'Atlas Ceramics SA', contactName: 'Youssef El Amrani', serviceId: 'SVC-02', value: 18000, currency: 'EUR', probability: 60, stage: 'Proposal', expectedClose: '2026-09-30', owner: 'USR-05', source: 'LinkedIn', competitor: 'Local Casablanca advisory', nextAction: 'Proposal follow-up call 10 September', notes: 'Price is the sticking point; consider phasing into two tranches.', created: '2026-06-20', leadId: 'LED-002' },
  { id: 'OPP-003', name: 'French retail listing compliance', companyId: 'CMP-08', companyName: 'Dakar Marine Foods SA', contactName: 'Awa Ndiaye', serviceId: 'SVC-11', value: 7500, currency: 'EUR', probability: 40, stage: 'Consultation', expectedClose: '2026-10-15', owner: 'USR-02', source: 'Networking', competitor: '—', nextAction: 'Draft proposal by 11 September', notes: 'Technically demanding client; the proposal must show depth on labelling.', created: '2026-05-08', leadId: 'LED-003' },
  { id: 'OPP-004', name: 'East Africa corridor readiness', companyId: 'CMP-09', companyName: 'Lusaka Copper Fabrication', contactName: 'Mutale Chanda', serviceId: 'SVC-01', value: 5420000, currency: 'XAF', probability: 40, stage: 'Consultation', expectedClose: '2026-10-30', owner: 'USR-03', source: 'Partner', competitor: '—', nextAction: 'Consultation 12 September', notes: 'Corridor cost modelling will decide this.', created: '2026-08-13', leadId: 'LED-004' },
  { id: 'OPP-005', name: 'Netherlands horticulture entry', companyName: 'Arusha Horticulture Exports', contactName: 'Neema Massawe', serviceId: 'SVC-08', value: 14000, currency: 'EUR', probability: 80, stage: 'Negotiation', expectedClose: '2026-09-22', owner: 'USR-02', source: 'Referral', competitor: 'Dutch consultancy', nextAction: 'Agree three-tranche payment schedule', notes: 'Scope agreed. Only payment phasing outstanding.', created: '2026-07-10', leadId: 'LED-024' },
  { id: 'OPP-006', name: 'Declarant training programme', companyName: 'Mombasa Logistics Group', contactName: 'Ali Hassan', serviceId: 'SVC-14', value: 7230000, currency: 'XAF', probability: 60, stage: 'Proposal', expectedClose: '2026-09-25', owner: 'USR-06', source: 'LinkedIn', competitor: 'KESRA', nextAction: 'Follow up on proposal sent 1 September', notes: '24 declarants across three branches.', created: '2026-08-06', leadId: 'LED-008' },
  { id: 'OPP-007', name: 'Post-clearance audit defence', companyName: 'Port Harcourt Chemicals', contactName: 'Emeka Nwosu', serviceId: 'SVC-04', value: 5720000, currency: 'XAF', probability: 20, stage: 'Qualification', expectedClose: '2026-11-10', owner: 'USR-03', source: 'Direct', competitor: 'Big-four Nigeria', nextAction: 'Qualify audit scope and deadline', notes: 'Customs audit notice received; timing is urgent for them.', created: '2026-08-12', leadId: 'LED-023' },
  { id: 'OPP-008', name: 'UK tea market readiness', companyName: 'Nyanza Tea Estates', contactName: 'Peter Muhoza', serviceId: 'SVC-06', value: 3610000, currency: 'XAF', probability: 20, stage: 'Qualification', expectedClose: '2026-11-20', owner: 'USR-02', source: 'Google', competitor: '—', nextAction: 'Book scoping consultation', notes: 'UK buyer already interested — strong conversion case.', created: '2026-08-20', leadId: 'LED-006' },
  { id: 'OPP-009', name: 'Retainer renewal 2027', companyId: 'CMP-05', companyName: 'Rift Valley Coffee Union', contactName: 'Joseph Kariuki', serviceId: 'SVC-12', value: 18070000, currency: 'XAF', probability: 80, stage: 'Negotiation', expectedClose: '2026-12-15', owner: 'USR-02', source: 'Direct', competitor: '—', nextAction: 'Present 2027 retainer scope at the December review', notes: 'Twelve-month renewal at an uplifted rate.', created: '2026-08-28' },
  { id: 'OPP-010', name: 'Portugal seafood entry', companyName: 'Maputo Seafoods Lda', contactName: 'Carlos Machava', serviceId: 'SVC-08', value: 15000, currency: 'EUR', probability: 40, stage: 'Consultation', expectedClose: '2026-11-05', owner: 'USR-02', source: 'LinkedIn', competitor: '—', nextAction: 'Consultation to map EU establishment approval', notes: 'Needs the EU approved-establishment route explained early.', created: '2026-08-22', leadId: 'LED-014' },
];

export interface Consultation {
  id: string; companyId?: string; companyName: string; contactName: string; date: string;
  time: string; consultant: string; type: string; meetingType: string; location: string;
  challenge: string; products: string; currentMarkets: string; targetMarkets: string;
  exportExperience: string; complianceIssues: string; objectives: string; notes: string;
  recommendations: string; followUp: string; recommendedService: string;
  estimatedValue: number; currency: string; status: 'Scheduled' | 'Completed' | 'Cancelled';
  opportunityId?: string;
}

export const CONSULTATIONS: Consultation[] = [
  { id: 'CNS-001', companyId: 'CMP-07', companyName: 'Bamenda Timber & Wood Products', contactName: 'Emmanuel Nfor', date: '2026-08-04', time: '10:00', consultant: 'USR-01', type: 'Compliance consultation', meetingType: 'Video call', location: 'Google Meet', challenge: 'No geolocation data for roughly 40% of supply concessions ahead of EUDR application.', products: 'Sawn hardwood, wood flooring', currentMarkets: 'Cameroon, Nigeria', targetMarkets: 'Netherlands, Germany, United Kingdom', exportExperience: 'Occasional — via traders, never direct', complianceIssues: 'Missing plot polygons; land tenure evidence held only in paper form; no due diligence system.', objectives: 'Be able to place product on the EU market after 30 December 2026.', notes: 'MD understands the deadline and has board backing. Forestry supervisor holds paper concession maps that need digitising.', recommendations: 'Full EUDR readiness programme with a phased geolocation data capture workstream. Partner with an accredited verification body for the assurance step.', followUp: 'Proposal issued 6 August; contract negotiation now in progress.', recommendedService: 'SVC-10', estimatedValue: 22000, currency: 'EUR', status: 'Completed', opportunityId: 'OPP-001' },
  { id: 'CNS-002', companyId: 'CMP-06', companyName: 'Atlas Ceramics SA', contactName: 'Youssef El Amrani', date: '2026-06-25', time: '14:30', consultant: 'USR-05', type: 'AfCFTA consultation', meetingType: 'Video call', location: 'Microsoft Teams', challenge: 'Wants to serve West Africa from Casablanca but cannot evidence originating status under AfCFTA rules.', products: 'Floor tiles, sanitary ware', currentMarkets: 'Morocco, Spain, France', targetMarkets: 'Senegal, Côte d’Ivoire, Cameroon', exportExperience: 'Experienced — EU corridors', complianceIssues: 'Imported clay and glaze inputs may fail the value-addition threshold.', objectives: 'Preferential access to ECOWAS and CEMAC markets within twelve months.', notes: 'Export director is comparing us against a local firm. Our depth on rules of origin is the differentiator.', recommendations: 'AfCFTA market entry strategy with an origin determination workstream on the top three SKUs.', followUp: 'Proposal sent 2 September; follow-up call booked 10 September.', recommendedService: 'SVC-02', estimatedValue: 18000, currency: 'EUR', status: 'Completed', opportunityId: 'OPP-002' },
  { id: 'CNS-003', companyId: 'CMP-08', companyName: 'Dakar Marine Foods SA', contactName: 'Awa Ndiaye', date: '2026-08-27', time: '11:00', consultant: 'USR-02', type: 'Market-entry consultation', meetingType: 'In person', location: 'Dakar — client premises', challenge: 'A French retail listing requires labelling, traceability and packaging changes the team has not scoped.', products: 'Frozen octopus, tuna loins', currentMarkets: 'Senegal, Spain, Italy', targetMarkets: 'France, Netherlands', exportExperience: 'Experienced — EU approved establishment held', complianceIssues: 'Nutrition declaration format, French language labelling, lot traceability back to vessel.', objectives: 'Pass the retailer technical audit in Q1 2027.', notes: 'Compliance director is a former EU inspector — the proposal must be technically detailed.', recommendations: 'Product compliance assessment covering labelling, traceability and the retailer audit checklist.', followUp: 'Draft proposal due 11 September.', recommendedService: 'SVC-11', estimatedValue: 7500, currency: 'EUR', status: 'Completed', opportunityId: 'OPP-003' },
  { id: 'CNS-004', companyId: 'CMP-09', companyName: 'Lusaka Copper Fabrication', contactName: 'Mutale Chanda', date: '2026-09-12', time: '09:30', consultant: 'USR-03', type: 'AfCFTA consultation', meetingType: 'Video call', location: 'Google Meet', challenge: 'Landed cost into East Africa is uncompetitive against Chinese imports.', products: 'Copper cable, busbars', currentMarkets: 'Zambia, DRC, Zimbabwe', targetMarkets: 'Tanzania, Kenya, Rwanda', exportExperience: 'Occasional — regional only', complianceIssues: 'Unclear whether copper cathode inputs confer originating status.', objectives: 'Win a Kenyan infrastructure supply contract in 2027.', notes: '', recommendations: '', followUp: '', recommendedService: 'SVC-01', estimatedValue: 5420000, currency: 'XAF', status: 'Scheduled', opportunityId: 'OPP-004' },
  { id: 'CNS-005', companyName: 'Tema Steel Works', contactName: 'Nii Armah', date: '2026-09-10', time: '15:00', consultant: 'USR-05', type: 'Initial consultation', meetingType: 'Video call', location: 'Zoom', challenge: 'Nigerian buyers demand AfCFTA certificates the company cannot currently produce.', products: 'Reinforcement bar, structural sections', currentMarkets: 'Ghana', targetMarkets: 'Nigeria', exportExperience: 'Occasional', complianceIssues: 'No origin determination performed; scrap inputs partly imported.', objectives: 'Ship under AfCFTA preference by Q2 2027.', notes: '', recommendations: '', followUp: '', recommendedService: 'SVC-03', estimatedValue: 6630000, currency: 'XAF', status: 'Scheduled' },
];

export interface Project {
  id: string; name: string; companyId: string; serviceId: string; manager: string;
  consultants: string[]; start: string; end: string; budget: number; currency: string;
  status: string; priority: 'Low' | 'Medium' | 'High'; billingModel: string;
  estimatedHours: number; actualHours: number; contractId?: string; proposalId?: string;
  workflow: { name: string; done: boolean }[]; notes: string; feedbackScore?: number;
  cost: number;
}

const wfFrom = (steps: string[], doneCount: number) => steps.map((name, i) => ({ name, done: i < doneCount }));

export const PROJECTS: Project[] = [
  { id: 'PRJ-001', name: 'EUDR Readiness Programme', companyId: 'CMP-01', serviceId: 'SVC-10', manager: 'USR-01', consultants: ['USR-01', 'USR-03'], start: '2026-06-15', end: '2026-10-30', budget: 18000, currency: 'EUR', status: 'Active', priority: 'High', billingModel: 'Fixed fee — 3 milestones', estimatedHours: 220, actualHours: 148, contractId: 'CTR-001', proposalId: 'PRP-001', workflow: wfFrom(['Client onboarding', 'Supply chain scoping', 'Document collection', 'Geolocation data review', 'Due diligence gap analysis', 'Risk assessment', 'Compliance register build', 'Remediation roadmap', 'Final report', 'Client presentation', 'Project completion'], 6), notes: 'Geolocation dataset is 82% complete. Two cooperatives still outstanding.', cost: 9200 },
  { id: 'PRJ-002', name: 'EU Market Entry Assessment — Speciality Cocoa', companyId: 'CMP-01', serviceId: 'SVC-08', manager: 'USR-02', consultants: ['USR-02'], start: '2026-08-01', end: '2026-11-15', budget: 16500, currency: 'EUR', status: 'Active', priority: 'High', billingModel: 'Fixed fee — 2 milestones', estimatedHours: 180, actualHours: 71, contractId: 'CTR-001', proposalId: 'PRP-002', workflow: wfFrom(['Client onboarding', 'Scoping workshop', 'Product & HS classification review', 'Target market screening', 'Tariff & rules of origin analysis', 'Regulatory requirements mapping', 'Competitor & pricing analysis', 'Distribution channel mapping', 'Entry strategy drafting', 'Final report', 'Client presentation', 'Project completion'], 5), notes: 'Netherlands and Germany shortlisted. Landed-cost model in build.', cost: 4100 },
  { id: 'PRJ-003', name: 'AfCFTA Readiness Assessment — ECOWAS', companyId: 'CMP-02', serviceId: 'SVC-01', manager: 'USR-05', consultants: ['USR-05', 'USR-03'], start: '2026-07-06', end: '2026-09-14', budget: 5120000, currency: 'XAF', status: 'Under Review', priority: 'Medium', billingModel: 'Fixed fee', estimatedHours: 120, actualHours: 118, contractId: 'CTR-002', proposalId: 'PRP-003', workflow: wfFrom(['Client onboarding', 'Initial consultation', 'Product portfolio review', 'Rules of origin analysis', 'Tariff preference modelling', 'Corridor & logistics review', 'Opportunity shortlist', 'Final report', 'Client presentation', 'Project completion'], 8), notes: 'Draft report with the client for comment. Presentation booked for 14 September.', cost: 3250000 },
  { id: 'PRJ-004', name: 'Export Readiness Assessment', companyId: 'CMP-03', serviceId: 'SVC-06', manager: 'USR-02', consultants: ['USR-02'], start: '2026-06-01', end: '2026-08-29', budget: 3310000, currency: 'XAF', status: 'Waiting for Client', priority: 'Medium', billingModel: 'Fixed fee', estimatedHours: 90, actualHours: 78, contractId: 'CTR-003', proposalId: 'PRP-004', workflow: wfFrom(['Client onboarding', 'Initial consultation', 'Document collection', 'Company assessment', 'Product assessment', 'Export capability assessment', 'Market assessment', 'Compliance assessment', 'Gap analysis', 'Recommendations', 'Final report', 'Client presentation', 'Project completion', 'Follow-up'], 8), notes: 'Blocked: awaiting quality certificates and the 2025 financial statements.', cost: 1990000 },
  { id: 'PRJ-005', name: 'EUDR Supplier Register Build', companyId: 'CMP-04', serviceId: 'SVC-10', manager: 'USR-01', consultants: ['USR-01'], start: '2026-04-13', end: '2026-07-31', budget: 15000, currency: 'EUR', status: 'Completed', priority: 'High', billingModel: 'Fixed fee', estimatedHours: 190, actualHours: 176, contractId: 'CTR-004', proposalId: 'PRP-005', workflow: wfFrom(['Client onboarding', 'Supply chain scoping', 'Document collection', 'Geolocation data review', 'Due diligence gap analysis', 'Risk assessment', 'Compliance register build', 'Remediation roadmap', 'Final report', 'Client presentation', 'Project completion'], 11), notes: 'Delivered on time. Client rated the engagement 9/10.', feedbackScore: 9, cost: 8800 },
  { id: 'PRJ-006', name: 'Trade Advisory Retainer 2026', companyId: 'CMP-05', serviceId: 'SVC-12', manager: 'USR-02', consultants: ['USR-02', 'USR-03'], start: '2026-01-05', end: '2026-12-31', budget: 18070000, currency: 'XAF', status: 'Active', priority: 'Medium', billingModel: 'Monthly retainer', estimatedHours: 240, actualHours: 162, contractId: 'CTR-005', workflow: wfFrom(['Onboarding', 'Monthly briefing cycle', 'Quarterly review'], 2), notes: 'Rolling engagement. Eight monthly briefings issued to date.', cost: 6870000 },
  { id: 'PRJ-007', name: 'Customs Compliance Review — Import Desk', companyId: 'CMP-02', serviceId: 'SVC-04', manager: 'USR-03', consultants: ['USR-03'], start: '2026-08-17', end: '2026-09-30', budget: 4100000, currency: 'XAF', status: 'Active', priority: 'High', billingModel: 'Fixed fee', estimatedHours: 100, actualHours: 44, contractId: 'CTR-002', workflow: wfFrom(['Client onboarding', 'Customs process walkthrough', 'Declaration sampling', 'HS classification review', 'Valuation & origin review', 'Findings workshop', 'Corrective action plan', 'Final report', 'Project completion'], 4), notes: 'Declaration sample of 120 entries under review. Early signs of misclassification on dyed fabric.', cost: 1570000 },
  { id: 'PRJ-008', name: 'Export Documentation Package', companyId: 'CMP-03', serviceId: 'SVC-07', manager: 'USR-02', consultants: ['USR-02'], start: '2026-09-01', end: '2026-09-26', budget: 1930000, currency: 'XAF', status: 'Planning', priority: 'Medium', billingModel: 'Fixed fee', estimatedHours: 45, actualHours: 6, contractId: 'CTR-003', workflow: wfFrom(['Client onboarding', 'Initial consultation', 'Document collection', 'Company assessment', 'Product assessment', 'Export capability assessment', 'Market assessment', 'Compliance assessment', 'Gap analysis', 'Recommendations', 'Final report', 'Client presentation', 'Project completion', 'Follow-up'], 1), notes: 'Kick-off scheduled once the readiness assessment closes.', cost: 240000 },
];

export interface Task {
  id: string; name: string; description: string; projectId?: string; companyId?: string;
  assignee: string; priority: 'Low' | 'Medium' | 'High'; due: string; status: string;
  estimatedHours: number; actualHours: number; checklist: { text: string; done: boolean }[];
  recurrence?: string; comments: { user: string; at: string; text: string }[];
}

const t = (id: string, name: string, projectId: string | undefined, companyId: string | undefined, assignee: string, priority: Task['priority'], due: string, status: string, est: number, act: number, description = '', checklist: string[] = []): Task => ({
  id, name, description, projectId, companyId, assignee, priority, due, status,
  estimatedHours: est, actualHours: act,
  checklist: checklist.map((text) => ({ text, done: status === 'Completed' })),
  comments: [],
});

export const TASKS: Task[] = [
  t('TSK-001', 'Chase geolocation data from Ndian cooperative', 'PRJ-001', 'CMP-01', 'USR-03', 'High', '2026-09-05', 'In Progress', 6, 4, 'Two cooperatives have not returned plot polygons. Escalate through the sustainability officer.', ['Send reminder', 'Offer field capture support', 'Confirm receipt']),
  t('TSK-002', 'Draft EUDR risk assessment section', 'PRJ-001', 'CMP-01', 'USR-01', 'High', '2026-09-12', 'In Progress', 14, 6, 'Country risk, supplier risk and mitigation measures.', ['Country benchmark', 'Supplier scoring', 'Mitigation table']),
  t('TSK-003', 'Build compliance register template', 'PRJ-001', 'CMP-01', 'USR-01', 'Medium', '2026-09-19', 'To Do', 10, 0, 'Excel register aligned to the due diligence statement fields.'),
  t('TSK-004', 'Landed-cost model — Rotterdam route', 'PRJ-002', 'CMP-01', 'USR-02', 'High', '2026-09-11', 'In Progress', 12, 5, 'Freight, duty, EUDR compliance overhead and handling.'),
  t('TSK-005', 'Competitor pricing scan — German speciality cocoa', 'PRJ-002', 'CMP-01', 'USR-02', 'Medium', '2026-09-18', 'To Do', 8, 0),
  t('TSK-006', 'Incorporate client comments into ECOWAS report', 'PRJ-003', 'CMP-02', 'USR-05', 'High', '2026-09-09', 'In Progress', 8, 3, 'Client returned comments on 5 September.'),
  t('TSK-007', 'Prepare client presentation deck', 'PRJ-003', 'CMP-02', 'USR-05', 'High', '2026-09-12', 'To Do', 6, 0, 'Bilingual EN/FR deck for the 14 September session.'),
  t('TSK-008', 'Follow up on missing quality certificates', 'PRJ-004', 'CMP-03', 'USR-02', 'High', '2026-08-28', 'Waiting', 2, 1, 'Project is blocked until these arrive.'),
  t('TSK-009', 'Complete market assessment section', 'PRJ-004', 'CMP-03', 'USR-02', 'Medium', '2026-09-15', 'To Do', 10, 0),
  t('TSK-010', 'Sample 120 import declarations', 'PRJ-007', 'CMP-02', 'USR-03', 'High', '2026-09-10', 'In Progress', 20, 12, 'Stratified sample across 2025–2026 entries.'),
  t('TSK-011', 'HS classification review — dyed woven fabric', 'PRJ-007', 'CMP-02', 'USR-03', 'High', '2026-09-16', 'To Do', 12, 0),
  t('TSK-012', 'Issue August retainer briefing', 'PRJ-006', 'CMP-05', 'USR-02', 'Medium', '2026-09-03', 'Completed', 6, 6, 'Monthly corridor and regulatory briefing.', ['Draft briefing', 'Internal review', 'Send to client']),
  t('TSK-013', 'Quarterly retainer review call', 'PRJ-006', 'CMP-05', 'USR-02', 'Medium', '2026-10-02', 'To Do', 3, 0, undefined, []),
  t('TSK-014', 'Kick-off call for documentation package', 'PRJ-008', 'CMP-03', 'USR-02', 'Medium', '2026-09-15', 'To Do', 2, 0),
  t('TSK-015', 'Contract negotiation call — Bamenda Timber', undefined, 'CMP-07', 'USR-01', 'High', '2026-09-09', 'To Do', 2, 0, 'Their counsel raised two clauses on liability and data ownership.'),
  t('TSK-016', 'Proposal follow-up — Atlas Ceramics', undefined, 'CMP-06', 'USR-05', 'High', '2026-09-10', 'To Do', 1, 0, 'Proposal sent 2 September; no response yet.'),
  t('TSK-017', 'Draft proposal — Dakar Marine product compliance', undefined, 'CMP-08', 'USR-02', 'High', '2026-09-11', 'To Do', 5, 0),
  t('TSK-018', 'Prepare consultation brief — Lusaka Copper', undefined, 'CMP-09', 'USR-03', 'Medium', '2026-09-11', 'To Do', 3, 0, 'Corridor cost benchmarks for Dar es Salaam and Mombasa routes.'),
  t('TSK-019', 'Chase invoice BALIA-2026-0004', undefined, 'CMP-03', 'USR-04', 'High', '2026-09-04', 'In Progress', 1, 0, 'Now 24 days overdue. Escalate to the founder.'),
  t('TSK-020', 'Review Q3 expense claims', undefined, undefined, 'USR-04', 'Medium', '2026-09-15', 'To Do', 3, 0),
  t('TSK-021', 'Publish September regulatory alert', undefined, undefined, 'USR-01', 'Medium', '2026-09-14', 'To Do', 4, 0, 'EUDR implementing act update for all retainer clients.'),
  t('TSK-022', 'Confirm AfCFTA workshop venue — Douala', undefined, undefined, 'USR-06', 'Medium', '2026-09-18', 'To Do', 2, 0),
];

export interface DocumentRec {
  id: string; name: string; category: string; type: string; companyId: string;
  projectId?: string; uploaded: string; uploadedBy: string; expiry?: string; version: number;
  status: string; confidentiality: 'Standard' | 'Confidential' | 'Restricted'; size: string;
  requestedFrom?: string; note?: string;
}

export const DOCUMENTS: DocumentRec[] = [
  { id: 'DOC-001', name: 'Certificate of Incorporation — Kola Agro', category: 'Corporate', type: 'Certificate of Incorporation', companyId: 'CMP-01', uploaded: '2025-04-16', uploadedBy: 'CON-01', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '1.2 MB' },
  { id: 'DOC-002', name: 'Supplier plot geolocation dataset v3', category: 'Compliance', type: 'EUDR Due Diligence Statement', companyId: 'CMP-01', projectId: 'PRJ-001', uploaded: '2026-08-22', uploadedBy: 'CON-03', version: 3, status: 'Under Review', confidentiality: 'Restricted', size: '18.4 MB', note: '82% coverage. Ndian and Meme cooperatives outstanding.' },
  { id: 'DOC-003', name: 'Land tenure evidence — Southwest concessions', category: 'Compliance', type: 'Regulatory Certificate', companyId: 'CMP-01', projectId: 'PRJ-001', uploaded: '', uploadedBy: '', version: 0, status: 'Requested', confidentiality: 'Restricted', size: '—', requestedFrom: 'CON-03', note: 'Requested 28 August. Needed for the risk assessment.' },
  { id: 'DOC-004', name: 'Cocoa product specification sheet', category: 'Product', type: 'Product Specification', companyId: 'CMP-01', projectId: 'PRJ-002', uploaded: '2026-08-05', uploadedBy: 'CON-02', version: 2, status: 'Approved', confidentiality: 'Standard', size: '840 KB' },
  { id: 'DOC-005', name: 'Phytosanitary certificate — consignment 2026/114', category: 'Compliance', type: 'Phytosanitary Certificate', companyId: 'CMP-01', uploaded: '2026-03-11', uploadedBy: 'CON-02', expiry: '2026-09-30', version: 1, status: 'Approved', confidentiality: 'Standard', size: '420 KB', note: 'Expires within 30 days.' },
  { id: 'DOC-006', name: 'Business registration — Sahel Textiles', category: 'Corporate', type: 'Business Registration', companyId: 'CMP-02', uploaded: '2025-11-05', uploadedBy: 'CON-04', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '960 KB' },
  { id: 'DOC-007', name: 'Import declarations sample 2025–2026', category: 'Trade', type: 'Customs Declaration', companyId: 'CMP-02', projectId: 'PRJ-007', uploaded: '2026-08-20', uploadedBy: 'CON-05', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '32.1 MB' },
  { id: 'DOC-008', name: 'Broker agreement — Kano desk', category: 'Trade', type: 'Customs Declaration', companyId: 'CMP-02', projectId: 'PRJ-007', uploaded: '', uploadedBy: '', version: 0, status: 'Requested', confidentiality: 'Confidential', size: '—', requestedFrom: 'CON-05', note: 'Requested 1 September.' },
  { id: 'DOC-009', name: 'Bill of materials — woven cotton', category: 'Product', type: 'Technical Datasheet', companyId: 'CMP-02', projectId: 'PRJ-003', uploaded: '2026-07-14', uploadedBy: 'CON-05', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '310 KB' },
  { id: 'DOC-010', name: 'Quality certificates — spice grading', category: 'Product', type: 'Product Certificate', companyId: 'CMP-03', projectId: 'PRJ-004', uploaded: '', uploadedBy: '', version: 0, status: 'Requested', confidentiality: 'Standard', size: '—', requestedFrom: 'CON-06', note: 'Requested 21 August. Project blocked without these.' },
  { id: 'DOC-011', name: 'Financial statements 2025', category: 'Corporate', type: 'Tax Clearance', companyId: 'CMP-03', projectId: 'PRJ-004', uploaded: '', uploadedBy: '', version: 0, status: 'Requested', confidentiality: 'Restricted', size: '—', requestedFrom: 'CON-06', note: 'Requested 21 August.' },
  { id: 'DOC-012', name: 'Packing list template — EU consignments', category: 'Trade', type: 'Packing List', companyId: 'CMP-03', projectId: 'PRJ-008', uploaded: '2026-09-02', uploadedBy: 'CON-07', version: 1, status: 'Under Review', confidentiality: 'Standard', size: '180 KB' },
  { id: 'DOC-013', name: 'Rejected consignment notice — Hamburg', category: 'Trade', type: 'Customs Declaration', companyId: 'CMP-03', uploaded: '2026-01-28', uploadedBy: 'CON-06', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '1.1 MB', note: 'Root-cause evidence for the readiness assessment.' },
  { id: 'DOC-014', name: 'EUDR compliance register — final', category: 'Compliance', type: 'EUDR Due Diligence Statement', companyId: 'CMP-04', projectId: 'PRJ-005', uploaded: '2026-07-28', uploadedBy: 'USR-01', version: 4, status: 'Approved', confidentiality: 'Restricted', size: '6.7 MB' },
  { id: 'DOC-015', name: 'Supplier declarations bundle', category: 'Compliance', type: 'Regulatory Certificate', companyId: 'CMP-04', projectId: 'PRJ-005', uploaded: '2026-06-19', uploadedBy: 'CON-09', version: 2, status: 'Approved', confidentiality: 'Restricted', size: '11.9 MB' },
  { id: 'DOC-016', name: 'Certificate of origin — coffee lot KE-2026-04', category: 'Trade', type: 'Certificate of Origin', companyId: 'CMP-05', uploaded: '2026-04-09', uploadedBy: 'CON-10', expiry: '2026-10-09', version: 1, status: 'Approved', confidentiality: 'Standard', size: '290 KB' },
  { id: 'DOC-017', name: 'Trade licence — RVCU', category: 'Corporate', type: 'Trade Licence', companyId: 'CMP-05', uploaded: '2026-01-08', uploadedBy: 'CON-10', expiry: '2026-12-31', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '540 KB' },
  { id: 'DOC-018', name: 'Concession maps (scanned)', category: 'Compliance', type: 'Regulatory Certificate', companyId: 'CMP-07', uploaded: '2026-08-06', uploadedBy: 'CON-15', version: 1, status: 'Rejected', confidentiality: 'Restricted', size: '24.3 MB', note: 'Scans are not georeferenced. Re-capture required.' },
  { id: 'DOC-019', name: 'EU establishment approval — SN 118', category: 'Compliance', type: 'Regulatory Certificate', companyId: 'CMP-08', uploaded: '2026-05-12', uploadedBy: 'CON-16', expiry: '2027-05-11', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '760 KB' },
  { id: 'DOC-020', name: 'Product label artwork — French market', category: 'Product', type: 'Product Specification', companyId: 'CMP-08', uploaded: '2026-08-30', uploadedBy: 'CON-16', version: 1, status: 'Under Review', confidentiality: 'Standard', size: '4.2 MB' },
  { id: 'DOC-021', name: 'Export licence — timber', category: 'Compliance', type: 'Export Permit', companyId: 'CMP-07', uploaded: '2026-02-14', uploadedBy: 'CON-14', expiry: '2026-10-05', version: 1, status: 'Approved', confidentiality: 'Confidential', size: '380 KB', note: 'Renewal due within 30 days.' },
];

export interface ProposalItem { serviceId: string; description: string; qty: number; rate: number; }
export interface Proposal {
  id: string; number: string; companyId: string; opportunityId?: string; title: string;
  services: ProposalItem[]; scope: string; deliverables: string[]; timeline: string;
  paymentTerms: string; validUntil: string; assumptions: string; status: string;
  currency: string; owner: string; created: string; sent?: string; viewed?: string;
  accepted?: string; rejected?: string; signature?: { name: string; email: string; at: string; ip: string; statement: string };
  projectId?: string; discount: number; tax: number; estimatedCost?: number; consultantDays?: number;
}

export const PROPOSALS: Proposal[] = [
  { id: 'PRP-001', number: 'BALIA-P-2026-0011', companyId: 'CMP-01', title: 'EUDR Readiness Programme', services: [{ serviceId: 'SVC-10', description: 'EUDR readiness, due diligence system and compliance register', qty: 1, rate: 18000 }], scope: 'Supply chain mapping across 14 cooperatives, geolocation data validation, risk assessment and construction of the due diligence system required to place product on the EU market.', deliverables: ['Supply chain map', 'Geolocation dataset review', 'Risk assessment', 'Compliance register', 'Due diligence statement template'], timeline: '18 weeks from kick-off', paymentTerms: '40% on signature, 30% at gap analysis, 30% on final report', validUntil: '2026-06-30', assumptions: 'Client provides supplier contact details and access to purchase records within two weeks of kick-off.', status: 'Accepted', currency: 'EUR', owner: 'USR-01', created: '2026-05-28', sent: '2026-05-29', viewed: '2026-05-30', accepted: '2026-06-10', signature: { name: 'Elise Mbarga', email: 'e.mbarga@kola-agro.cm', at: '2026-06-10T14:22:00', ip: '102.244.18.77', statement: 'I confirm I am authorised to accept this proposal on behalf of Kola Nut Agro-Industries SARL.' }, projectId: 'PRJ-001', discount: 0, tax: 0 },
  { id: 'PRP-002', number: 'BALIA-P-2026-0014', companyId: 'CMP-01', title: 'EU Market Entry Assessment — Speciality Cocoa', services: [{ serviceId: 'SVC-08', description: 'EU market entry assessment for speciality cocoa products', qty: 1, rate: 16500 }], scope: 'Market sizing across the Netherlands and Germany, regulatory dossier, distributor shortlist and landed-cost modelling.', deliverables: ['Market sizing', 'Regulatory dossier', 'Distributor shortlist', 'Landed-cost model', 'Entry roadmap'], timeline: '14 weeks', paymentTerms: '50% on signature, 50% on final report', validUntil: '2026-08-15', assumptions: 'Existing EUDR workstream provides the traceability evidence base.', status: 'Accepted', currency: 'EUR', owner: 'USR-02', created: '2026-07-10', sent: '2026-07-11', viewed: '2026-07-12', accepted: '2026-07-24', signature: { name: 'Elise Mbarga', email: 'e.mbarga@kola-agro.cm', at: '2026-07-24T09:41:00', ip: '102.244.18.77', statement: 'I confirm I am authorised to accept this proposal on behalf of Kola Nut Agro-Industries SARL.' }, projectId: 'PRJ-002', discount: 0, tax: 0 },
  { id: 'PRP-003', number: 'BALIA-P-2026-0009', companyId: 'CMP-02', title: 'AfCFTA Readiness Assessment — ECOWAS corridors', services: [{ serviceId: 'SVC-01', description: 'AfCFTA readiness assessment covering origin, tariffs and corridors', qty: 1, rate: 5120000 }], scope: 'Assessment of preferential access for woven fabric and finished garments across Ghana, Senegal and Côte d’Ivoire.', deliverables: ['Readiness scorecard', 'Origin position paper', 'Corridor analysis', 'Action roadmap'], timeline: '10 weeks', paymentTerms: '50% on signature, 50% on delivery', validUntil: '2026-07-15', assumptions: 'Bills of materials available for the top five SKUs.', status: 'Accepted', currency: 'XAF', owner: 'USR-05', created: '2026-06-18', sent: '2026-06-19', viewed: '2026-06-19', accepted: '2026-06-28', signature: { name: 'Ibrahim Sanusi', email: 'i.sanusi@saheltextiles.ng', at: '2026-06-28T16:05:00', ip: '197.210.44.19', statement: 'I confirm I am authorised to accept this proposal on behalf of Sahel Textiles PLC.' }, projectId: 'PRJ-003', discount: 0, tax: 0 },
  { id: 'PRP-004', number: 'BALIA-P-2026-0016', companyId: 'CMP-06', opportunityId: 'OPP-002', title: 'AfCFTA Market Entry Strategy — West Africa', services: [{ serviceId: 'SVC-02', description: 'AfCFTA market entry strategy for Senegal, Côte d’Ivoire and Cameroon', qty: 1, rate: 18000 }], scope: 'Market screening, origin determination on three lead SKUs, preference modelling, distributor shortlist and phased entry roadmap.', deliverables: ['Market screening matrix', 'Origin determination', 'Entry strategy', 'Partner shortlist', 'Pricing model'], timeline: '12 weeks', paymentTerms: '40% on signature, 30% at midpoint, 30% on delivery', validUntil: '2026-10-02', assumptions: 'Client provides input sourcing data for glaze and clay.', status: 'Sent', currency: 'EUR', owner: 'USR-05', created: '2026-09-01', sent: '2026-09-02', viewed: '2026-09-03', discount: 0, tax: 0 },
  { id: 'PRP-005', number: 'BALIA-P-2026-0017', companyId: 'CMP-07', opportunityId: 'OPP-001', title: 'EUDR Readiness & Due Diligence — Timber', services: [{ serviceId: 'SVC-10', description: 'EUDR readiness programme including geolocation data capture support', qty: 1, rate: 20000 }, { serviceId: 'SVC-11', description: 'Product compliance assessment — EU timber standards', qty: 1, rate: 2000 }], scope: 'Concession mapping and geolocation capture, land tenure evidence review, risk assessment and due diligence system build for direct EU placement.', deliverables: ['Concession geolocation dataset', 'Land tenure dossier', 'Risk assessment', 'Compliance register', 'Verification body briefing'], timeline: '16 weeks', paymentTerms: '40% on signature, 30% at risk assessment, 30% on final report', validUntil: '2026-09-20', assumptions: 'Field capture support is limited to twelve days on site.', status: 'Changes Requested', currency: 'EUR', owner: 'USR-01', created: '2026-08-05', sent: '2026-08-06', viewed: '2026-08-06', discount: 0, tax: 0 },
];

export interface Contract {
  id: string; number: string; companyId: string; projectIds: string[]; type: string;
  start: string; end: string; renewal: string; value: number; currency: string;
  paymentTerms: string; owner: string; status: string; signedDoc: string; notes: string;
  signature?: { name: string; email: string; at: string; ip: string };
}

export const CONTRACTS: Contract[] = [
  { id: 'CTR-001', number: 'BALIA-C-2026-0004', companyId: 'CMP-01', projectIds: ['PRJ-001', 'PRJ-002'], type: 'Master services agreement', start: '2026-06-12', end: '2027-06-11', renewal: '2027-05-12', value: 34500, currency: 'EUR', paymentTerms: 'Net 30', owner: 'USR-01', status: 'Active', signedDoc: 'MSA-KolaAgro-signed.pdf', notes: 'Covers both the EUDR and EU entry workstreams.', signature: { name: 'Elise Mbarga', email: 'e.mbarga@kola-agro.cm', at: '2026-06-12T11:00:00', ip: '102.244.18.77' } },
  { id: 'CTR-002', number: 'BALIA-C-2026-0005', companyId: 'CMP-02', projectIds: ['PRJ-003', 'PRJ-007'], type: 'Statement of work', start: '2026-07-01', end: '2026-10-31', renewal: '2026-10-01', value: 9220000, currency: 'XAF', paymentTerms: 'Net 45', owner: 'USR-05', status: 'Expiring', signedDoc: 'SOW-SahelTextiles-signed.pdf', notes: 'Expires in under 60 days — renewal conversation due.', signature: { name: 'Ibrahim Sanusi', email: 'i.sanusi@saheltextiles.ng', at: '2026-07-01T08:30:00', ip: '197.210.44.19' } },
  { id: 'CTR-003', number: 'BALIA-C-2026-0006', companyId: 'CMP-03', projectIds: ['PRJ-004', 'PRJ-008'], type: 'Engagement letter', start: '2026-05-25', end: '2026-10-15', renewal: '2026-09-15', value: 5240000, currency: 'XAF', paymentTerms: 'Net 30', owner: 'USR-02', status: 'Expiring', signedDoc: 'EL-ZSC-signed.pdf', notes: 'Renewal date falls within a week.', signature: { name: 'Salma Juma', email: 's.juma@zanzibarspice.co.tz', at: '2026-05-25T13:15:00', ip: '41.222.9.144' } },
  { id: 'CTR-004', number: 'BALIA-C-2026-0002', companyId: 'CMP-04', projectIds: ['PRJ-005'], type: 'Statement of work', start: '2026-04-08', end: '2026-08-15', renewal: '2026-07-15', value: 15000, currency: 'EUR', paymentTerms: 'Net 30', owner: 'USR-01', status: 'Expired', signedDoc: 'SOW-AccraCocoa-signed.pdf', notes: 'Delivered and closed. Follow-on opportunity identified.', signature: { name: 'Kwame Boateng', email: 'k.boateng@accracocoa.gh', at: '2026-04-08T10:20:00', ip: '154.160.22.87' } },
  { id: 'CTR-005', number: 'BALIA-C-2026-0001', companyId: 'CMP-05', projectIds: ['PRJ-006'], type: 'Retainer agreement', start: '2026-01-05', end: '2026-12-31', renewal: '2026-11-30', value: 18070000, currency: 'XAF', paymentTerms: 'Net 15, billed monthly', owner: 'USR-02', status: 'Active', signedDoc: 'RET-RVCU-signed.pdf', notes: '2027 renewal is in negotiation as OPP-009.', signature: { name: 'Joseph Kariuki', email: 'j.kariuki@riftvalleycoffee.ke', at: '2026-01-05T09:00:00', ip: '105.160.14.203' } },
];

export interface InvoiceItem { serviceId?: string; description: string; qty: number; unit: string; rate: number; discount: number; tax: number; }
export interface Invoice {
  id: string; number: string; companyId: string; contactId: string; projectId?: string;
  contractId?: string; proposalId?: string; issued: string; due: string; currency: string;
  terms: string; items: InvoiceItem[]; status: string; notes: string; po?: string;
  sent?: string; viewed?: string; recurringId?: string; createdBy: string;
}

export const INVOICES: Invoice[] = [
  { id: 'INV-001', number: 'BALIA-2026-0001', companyId: 'CMP-01', contactId: 'CON-01', projectId: 'PRJ-001', contractId: 'CTR-001', issued: '2026-06-15', due: '2026-07-15', currency: 'EUR', terms: 'Net 30', items: [{ description: 'EUDR Readiness Programme — milestone 1 (40%)', qty: 1, unit: 'Milestone', rate: 7200, discount: 0, tax: 0 }], status: 'Paid', notes: 'Milestone 1 on signature.', sent: '2026-06-15', viewed: '2026-06-16', createdBy: 'USR-04' },
  { id: 'INV-002', number: 'BALIA-2026-0002', companyId: 'CMP-02', contactId: 'CON-20', projectId: 'PRJ-003', contractId: 'CTR-002', issued: '2026-07-06', due: '2026-08-20', currency: 'XAF', terms: 'Net 45', items: [{ description: 'AfCFTA Readiness Assessment — 50% on signature', qty: 1, unit: 'Milestone', rate: 2560000, discount: 0, tax: 0 }], status: 'Paid', notes: '', po: 'PO-STX-4417', sent: '2026-07-06', viewed: '2026-07-08', createdBy: 'USR-04' },
  { id: 'INV-003', number: 'BALIA-2026-0003', companyId: 'CMP-04', contactId: 'CON-08', projectId: 'PRJ-005', contractId: 'CTR-004', issued: '2026-07-31', due: '2026-08-30', currency: 'EUR', terms: 'Net 30', items: [{ description: 'EUDR Supplier Register Build — final instalment', qty: 1, unit: 'Milestone', rate: 7500, discount: 0, tax: 0 }], status: 'Paid', notes: 'Final instalment on delivery.', sent: '2026-07-31', viewed: '2026-08-01', createdBy: 'USR-04' },
  { id: 'INV-004', number: 'BALIA-2026-0004', companyId: 'CMP-03', contactId: 'CON-06', projectId: 'PRJ-004', contractId: 'CTR-003', issued: '2026-07-15', due: '2026-08-14', currency: 'XAF', terms: 'Net 30', items: [{ description: 'Export Readiness Assessment — 60% progress billing', qty: 1, unit: 'Milestone', rate: 1990000, discount: 0, tax: 0 }], status: 'Sent', notes: 'Client has cash-flow pressure; agreed to review on 12 September.', sent: '2026-07-15', viewed: '2026-07-17', createdBy: 'USR-04' },
  { id: 'INV-005', number: 'BALIA-2026-0005', companyId: 'CMP-01', contactId: 'CON-01', projectId: 'PRJ-001', contractId: 'CTR-001', issued: '2026-08-14', due: '2026-09-13', currency: 'EUR', terms: 'Net 30', items: [{ description: 'EUDR Readiness Programme — milestone 2 (30%)', qty: 1, unit: 'Milestone', rate: 5400, discount: 0, tax: 0 }], status: 'Partially Paid', notes: '', sent: '2026-08-14', viewed: '2026-08-15', createdBy: 'USR-04' },
  { id: 'INV-006', number: 'BALIA-2026-0006', companyId: 'CMP-05', contactId: 'CON-11', projectId: 'PRJ-006', contractId: 'CTR-005', issued: '2026-08-01', due: '2026-08-16', currency: 'XAF', terms: 'Net 15', items: [{ description: 'Trade Advisory Retainer — August 2026', qty: 1, unit: 'Month', rate: 1510000, discount: 0, tax: 0 }], status: 'Paid', notes: '', po: 'PO-RVCU-2026-08', sent: '2026-08-01', recurringId: 'REC-001', createdBy: 'USR-04' },
  { id: 'INV-007', number: 'BALIA-2026-0007', companyId: 'CMP-05', contactId: 'CON-11', projectId: 'PRJ-006', contractId: 'CTR-005', issued: '2026-09-01', due: '2026-09-16', currency: 'XAF', terms: 'Net 15', items: [{ description: 'Trade Advisory Retainer — September 2026', qty: 1, unit: 'Month', rate: 1510000, discount: 0, tax: 0 }], status: 'Sent', notes: '', po: 'PO-RVCU-2026-09', sent: '2026-09-01', viewed: '2026-09-02', recurringId: 'REC-001', createdBy: 'USR-04' },
  { id: 'INV-008', number: 'BALIA-2026-0008', companyId: 'CMP-02', contactId: 'CON-20', projectId: 'PRJ-007', contractId: 'CTR-002', issued: '2026-08-17', due: '2026-10-01', currency: 'XAF', terms: 'Net 45', items: [{ description: 'Customs Compliance Review — 50% on commencement', qty: 1, unit: 'Milestone', rate: 2050000, discount: 0, tax: 0 }], status: 'Sent', notes: '', po: 'PO-STX-4502', sent: '2026-08-17', viewed: '2026-08-18', createdBy: 'USR-04' },
  { id: 'INV-009', number: 'BALIA-2026-0009', companyId: 'CMP-01', contactId: 'CON-01', projectId: 'PRJ-002', contractId: 'CTR-001', issued: '2026-08-05', due: '2026-09-04', currency: 'EUR', terms: 'Net 30', items: [{ description: 'EU Market Entry Assessment — 50% on signature', qty: 1, unit: 'Milestone', rate: 8250, discount: 0, tax: 0 }], status: 'Sent', notes: '', sent: '2026-08-05', viewed: '2026-08-06', createdBy: 'USR-04' },
  { id: 'INV-010', number: 'BALIA-2026-0010', companyId: 'CMP-03', contactId: 'CON-06', projectId: 'PRJ-008', contractId: 'CTR-003', issued: '2026-09-02', due: '2026-10-02', currency: 'XAF', terms: 'Net 30', items: [{ description: 'Export Documentation Package — 50% on commencement', qty: 1, unit: 'Milestone', rate: 960000, discount: 0, tax: 0 }], status: 'Draft', notes: 'Hold until the readiness assessment invoice is settled.', createdBy: 'USR-04' },
];

export interface Payment {
  id: string; invoiceId: string; date: string; amount: number; currency: string;
  method: string; reference: string; bank: string; transactionId: string; notes: string;
  recordedBy: string;
}

export const PAYMENTS: Payment[] = [
  { id: 'PAY-001', invoiceId: 'INV-001', date: '2026-07-10', amount: 7200, currency: 'EUR', method: 'Bank transfer', reference: 'KOLA/EUDR/M1', bank: 'Société Générale Cameroun', transactionId: 'SGC-2026-441822', notes: 'Full settlement.', recordedBy: 'USR-04' },
  { id: 'PAY-002', invoiceId: 'INV-002', date: '2026-08-18', amount: 2560000, currency: 'XAF', method: 'Bank transfer', reference: 'STX-PO-4417', bank: 'Zenith Bank', transactionId: 'ZEN-88220114', notes: '', recordedBy: 'USR-04' },
  { id: 'PAY-003', invoiceId: 'INV-003', date: '2026-08-22', amount: 4000, currency: 'EUR', method: 'Bank transfer', reference: 'ACV-EUDR-1', bank: 'Ecobank Ghana', transactionId: 'ECO-GH-772014', notes: 'Part payment.', recordedBy: 'USR-04' },
  { id: 'PAY-004', invoiceId: 'INV-003', date: '2026-08-29', amount: 3500, currency: 'EUR', method: 'Bank transfer', reference: 'ACV-EUDR-2', bank: 'Ecobank Ghana', transactionId: 'ECO-GH-772199', notes: 'Balance settled.', recordedBy: 'USR-04' },
  { id: 'PAY-005', invoiceId: 'INV-005', date: '2026-09-04', amount: 3000, currency: 'EUR', method: 'Bank transfer', reference: 'KOLA/EUDR/M2a', bank: 'Société Générale Cameroun', transactionId: 'SGC-2026-449017', notes: 'Partial — balance promised by 20 September.', recordedBy: 'USR-04' },
  { id: 'PAY-006', invoiceId: 'INV-006', date: '2026-08-12', amount: 1510000, currency: 'XAF', method: 'Bank transfer', reference: 'RVCU-AUG', bank: 'KCB Bank Kenya', transactionId: 'KCB-2026-11842', notes: '', recordedBy: 'USR-04' },
  { id: 'PAY-007', invoiceId: 'INV-001', date: '2026-06-30', amount: 0, currency: 'EUR', method: 'Bank transfer', reference: 'Adjustment', bank: '—', transactionId: '—', notes: 'Zero-value reconciliation entry retained for audit.', recordedBy: 'USR-04' },
  { id: 'PAY-008', invoiceId: 'INV-004', date: '2026-08-05', amount: 600000, currency: 'XAF', method: 'Mobile money', reference: 'ZSC-PART-1', bank: 'M-Pesa Tanzania', transactionId: 'MP-TZ-4471902', notes: 'Goodwill part payment while cash flow recovers.', recordedBy: 'USR-04' },
  { id: 'PAY-009', invoiceId: 'INV-002', date: '2026-08-18', amount: 0, currency: 'XAF', method: 'Bank transfer', reference: 'FX adjustment', bank: 'Zenith Bank', transactionId: 'ZEN-88220115', notes: 'FX difference absorbed by BALIA.', recordedBy: 'USR-04' },
  { id: 'PAY-010', invoiceId: 'INV-009', date: '2026-09-07', amount: 4000, currency: 'EUR', method: 'Bank transfer', reference: 'KOLA/EUMKT/1', bank: 'Société Générale Cameroun', transactionId: 'SGC-2026-451188', notes: 'Partial against milestone 1.', recordedBy: 'USR-04' },
];

export interface Recurring {
  id: string; companyId: string; projectId: string; contractId: string; description: string;
  amount: number; currency: string; frequency: string; start: string; end: string;
  next: string; terms: string; status: 'Active' | 'Paused' | 'Ended';
}

export const RECURRING: Recurring[] = [
  { id: 'REC-001', companyId: 'CMP-05', projectId: 'PRJ-006', contractId: 'CTR-005', description: 'Trade Advisory Retainer — monthly', amount: 1510000, currency: 'XAF', frequency: 'Monthly', start: '2026-01-01', end: '2026-12-31', next: '2026-10-01', terms: 'Net 15', status: 'Active' },
];

export interface Expense {
  id: string; date: string; category: string; description: string; vendor: string;
  amount: number; currency: string; tax: number; projectId?: string; companyId?: string;
  user: string; method: string; receipt: string; reimbursable: boolean; status: string; notes: string;
}

export const EXPENSES: Expense[] = [
  { id: 'EXP-001', date: '2026-08-19', category: 'Travel', description: 'Douala–Bamenda field visit, concession mapping', vendor: 'Camair-Co', amount: 285000, currency: 'XAF', tax: 0, projectId: 'PRJ-001', companyId: 'CMP-01', user: 'USR-03', method: 'Card', receipt: 'receipt-camairco-0819.pdf', reimbursable: true, status: 'Approved', notes: 'Two-day field capture support.' },
  { id: 'EXP-002', date: '2026-08-27', category: 'Accommodation', description: 'Dakar client visit — two nights', vendor: 'Radisson Dakar', amount: 420, currency: 'EUR', tax: 0, companyId: 'CMP-08', user: 'USR-02', method: 'Card', receipt: 'receipt-radisson.pdf', reimbursable: true, status: 'Submitted', notes: '' },
  { id: 'EXP-003', date: '2026-09-01', category: 'Software', description: 'Geospatial analysis licence — monthly', vendor: 'QGIS Cloud Pro', amount: 89, currency: 'EUR', tax: 0, projectId: 'PRJ-001', user: 'USR-01', method: 'Card', receipt: 'receipt-qgis-sep.pdf', reimbursable: false, status: 'Approved', notes: 'Recurring cost allocated to the EUDR workstream.' },
  { id: 'EXP-004', date: '2026-08-11', category: 'Professional fees', description: 'Legal review of EU data processing clauses', vendor: 'Cabinet Mengue & Associés', amount: 650000, currency: 'XAF', tax: 0, user: 'USR-01', method: 'Bank transfer', receipt: 'invoice-mengue.pdf', reimbursable: false, status: 'Approved', notes: '' },
  { id: 'EXP-005', date: '2026-09-03', category: 'Marketing', description: 'LinkedIn campaign — AfCFTA series, September', vendor: 'LinkedIn Ads', amount: 470000, currency: 'XAF', tax: 0, user: 'USR-05', method: 'Card', receipt: 'receipt-li-sep.pdf', reimbursable: false, status: 'Submitted', notes: '' },
];

export interface TimeEntry {
  id: string; user: string; companyId: string; projectId: string; taskId?: string;
  date: string; hours: number; billable: boolean; description: string;
}

export const TIME_ENTRIES: TimeEntry[] = [
  { id: 'TME-001', user: 'USR-01', companyId: 'CMP-01', projectId: 'PRJ-001', taskId: 'TSK-002', date: '2026-09-04', hours: 6, billable: true, description: 'Risk assessment drafting' },
  { id: 'TME-002', user: 'USR-03', companyId: 'CMP-01', projectId: 'PRJ-001', taskId: 'TSK-001', date: '2026-09-05', hours: 4, billable: true, description: 'Cooperative follow-up calls' },
  { id: 'TME-003', user: 'USR-02', companyId: 'CMP-01', projectId: 'PRJ-002', taskId: 'TSK-004', date: '2026-09-05', hours: 5, billable: true, description: 'Landed-cost modelling' },
  { id: 'TME-004', user: 'USR-05', companyId: 'CMP-02', projectId: 'PRJ-003', taskId: 'TSK-006', date: '2026-09-07', hours: 3, billable: true, description: 'Client comment integration' },
  { id: 'TME-005', user: 'USR-03', companyId: 'CMP-02', projectId: 'PRJ-007', taskId: 'TSK-010', date: '2026-09-07', hours: 6, billable: true, description: 'Declaration sampling' },
  { id: 'TME-006', user: 'USR-02', companyId: 'CMP-05', projectId: 'PRJ-006', taskId: 'TSK-012', date: '2026-09-03', hours: 6, billable: true, description: 'August retainer briefing' },
  { id: 'TME-007', user: 'USR-01', companyId: 'CMP-01', projectId: 'PRJ-001', date: '2026-09-07', hours: 2, billable: false, description: 'Internal QA review' },
];

export interface Communication {
  id: string; companyId: string; type: string; direction: 'in' | 'out'; subject: string;
  summary: string; user: string; contactId?: string; at: string; projectId?: string;
}

export const COMMUNICATIONS: Communication[] = [
  { id: 'ACT-001', companyId: 'CMP-01', type: 'Email', direction: 'out', subject: 'Geolocation dataset — outstanding cooperatives', summary: 'Sent the list of two outstanding cooperatives with a proposed field capture window.', user: 'USR-03', contactId: 'CON-03', at: '2026-09-05T11:20:00', projectId: 'PRJ-001' },
  { id: 'ACT-002', companyId: 'CMP-01', type: 'Meeting', direction: 'out', subject: 'EUDR steering call', summary: 'Agreed to bring the risk assessment forward to mid-September so the board can review before the December deadline.', user: 'USR-01', contactId: 'CON-01', at: '2026-09-02T15:00:00', projectId: 'PRJ-001' },
  { id: 'ACT-003', companyId: 'CMP-06', type: 'Email', direction: 'out', subject: 'Proposal BALIA-P-2026-0016', summary: 'Proposal issued for the West Africa entry strategy.', user: 'USR-05', contactId: 'CON-12', at: '2026-09-02T09:15:00' },
  { id: 'ACT-004', companyId: 'CMP-07', type: 'Call', direction: 'out', subject: 'Contract clauses', summary: 'Client counsel raised liability cap and data ownership. Revised wording to be circulated.', user: 'USR-01', contactId: 'CON-14', at: '2026-09-05T16:40:00' },
  { id: 'ACT-005', companyId: 'CMP-03', type: 'Email', direction: 'in', subject: 'Re: outstanding documents', summary: 'Client acknowledged the request and asked for two more weeks.', user: 'USR-02', contactId: 'CON-06', at: '2026-08-30T08:12:00', projectId: 'PRJ-004' },
  { id: 'ACT-006', companyId: 'CMP-02', type: 'Note', direction: 'out', subject: 'Report comments received', summary: 'Client returned twelve comments on the draft ECOWAS report, mainly on tariff tables.', user: 'USR-05', at: '2026-09-05T10:05:00', projectId: 'PRJ-003' },
  { id: 'ACT-007', companyId: 'CMP-05', type: 'Email', direction: 'out', subject: 'August retainer briefing', summary: 'Monthly corridor and regulatory briefing issued.', user: 'USR-02', contactId: 'CON-10', at: '2026-09-03T07:30:00', projectId: 'PRJ-006' },
  { id: 'ACT-008', companyId: 'CMP-08', type: 'Meeting', direction: 'out', subject: 'Market entry consultation', summary: 'On-site consultation in Dakar covering labelling, traceability and the retailer audit.', user: 'USR-02', contactId: 'CON-16', at: '2026-08-27T11:00:00' },
  { id: 'ACT-009', companyId: 'CMP-04', type: 'Email', direction: 'in', subject: 'Thank you — register delivered', summary: 'COO confirmed sign-off and rated the engagement 9/10.', user: 'USR-01', contactId: 'CON-08', at: '2026-07-31T14:50:00', projectId: 'PRJ-005' },
  { id: 'ACT-010', companyId: 'CMP-03', type: 'Call', direction: 'out', subject: 'Invoice BALIA-2026-0004', summary: 'Discussed the overdue balance; client requested a review call on 12 September.', user: 'USR-04', contactId: 'CON-06', at: '2026-09-04T13:25:00' },
];

export interface PortalMessage {
  id: string; companyId: string; projectId?: string; from: 'client' | 'balia';
  author: string; at: string; body: string; read: boolean;
}

export const MESSAGES: PortalMessage[] = [
  { id: 'MSG-001', companyId: 'CMP-01', projectId: 'PRJ-001', from: 'balia', author: 'Cornelius F. D. Dzekashu', at: '2026-09-05T11:25:00', body: 'Nadège, we are still missing plot polygons from Ndian and Meme. If field capture would help, we can send Serge for two days in the week of 21 September.', read: true },
  { id: 'MSG-002', companyId: 'CMP-01', projectId: 'PRJ-001', from: 'client', author: 'Nadège Tchouta', at: '2026-09-06T09:02:00', body: 'Thank you. Ndian have promised their data by Friday. Field support for Meme would be very welcome — please confirm the dates.', read: false },
  { id: 'MSG-003', companyId: 'CMP-03', projectId: 'PRJ-004', from: 'balia', author: 'Aminata Diallo', at: '2026-08-21T10:00:00', body: 'Salma, we have requested the quality certificates and 2025 financial statements in your portal. The assessment cannot progress to the compliance section without them.', read: true },
  { id: 'MSG-004', companyId: 'CMP-03', projectId: 'PRJ-004', from: 'client', author: 'Salma Juma', at: '2026-08-30T08:10:00', body: 'Understood. Our auditor is finalising the statements — we should have everything with you within two weeks.', read: true },
];

export interface Assessment {
  id: string; companyId: string; projectId?: string; type: 'Trade Readiness' | 'Market Entry';
  date: string; assessor: string; scores: Record<string, number>; notes: string;
  targetMarket?: string; product?: string; hsCode?: string;
}

export const ASSESSMENTS: Assessment[] = [
  { id: 'ASM-001', companyId: 'CMP-03', projectId: 'PRJ-004', type: 'Trade Readiness', date: '2026-07-08', assessor: 'USR-02', scores: { c1: 5, c2: 3, c3: 3, c4: 4, p1: 3, p2: 2, p3: 2, p4: 3, e1: 2, e2: 3, e3: 2, e4: 2, m1: 4, m2: 3, m3: 3, m4: 2, r1: 3, r2: 2, r3: 3, r4: 3, l1: 3, l2: 3, l3: 2 }, notes: 'Documentation and packaging are the binding constraints. Two rejected consignments trace to labelling errors.', targetMarket: 'Germany', product: 'Cloves' },
  { id: 'ASM-002', companyId: 'CMP-01', projectId: 'PRJ-002', type: 'Trade Readiness', date: '2026-08-12', assessor: 'USR-01', scores: { c1: 5, c2: 5, c3: 4, c4: 5, p1: 4, p2: 4, p3: 4, p4: 4, e1: 4, e2: 4, e3: 4, e4: 4, m1: 5, m2: 4, m3: 3, m4: 4, r1: 4, r2: 4, r3: 3, r4: 5, l1: 4, l2: 4, l3: 4 }, notes: 'Strong across the board. Distribution route into the EU is the remaining gap.', targetMarket: 'Netherlands', product: 'Cocoa butter' },
  { id: 'ASM-003', companyId: 'CMP-07', type: 'Trade Readiness', date: '2026-08-04', assessor: 'USR-01', scores: { c1: 4, c2: 3, c3: 3, c4: 4, p1: 3, p2: 3, p3: 2, p4: 2, e1: 2, e2: 3, e3: 2, e4: 2, m1: 3, m2: 2, m3: 2, m4: 2, r1: 2, r2: 2, r3: 2, r4: 1, l1: 3, l2: 2, l3: 3 }, notes: 'EUDR exposure is severe. Origin evidence and regulatory readiness are the priority.', targetMarket: 'Netherlands', product: 'Sawn hardwood' },
  { id: 'ASM-004', companyId: 'CMP-02', projectId: 'PRJ-003', type: 'Market Entry', date: '2026-07-20', assessor: 'USR-05', scores: {}, notes: 'ECOWAS entry viable for finished garments; woven fabric fails the change-of-tariff-heading test without a yarn-sourcing change.', targetMarket: 'Ghana', product: 'Finished garments', hsCode: '6205.20' },
];

export interface Product {
  id: string; companyId: string; name: string; category: string; hsCode: string;
  origin: string; targetMarkets: string[]; requirements: string[]; certifications: string[]; notes: string;
}

export const PRODUCTS: Product[] = [
  { id: 'PRD-001', companyId: 'CMP-01', name: 'Cocoa butter, deodorised', category: 'Agri-processed', hsCode: '1804.00', origin: 'Cameroon', targetMarkets: ['Netherlands', 'Germany'], requirements: ['EUDR due diligence statement', 'Food contact packaging conformity', 'Health certificate'], certifications: ['ISO 22000'], notes: 'Duty-free into the EU under the Central Africa iEPA; EUDR is the binding constraint.' },
  { id: 'PRD-002', companyId: 'CMP-01', name: 'Cocoa powder, natural', category: 'Agri-processed', hsCode: '1805.00', origin: 'Cameroon', targetMarkets: ['Netherlands', 'Ghana'], requirements: ['EUDR due diligence statement', 'Labelling per Regulation 1169/2011'], certifications: ['ISO 22000'], notes: '' },
  { id: 'PRD-003', companyId: 'CMP-02', name: 'Woven cotton fabric, dyed', category: 'Textiles', hsCode: '5208.32', origin: 'Nigeria', targetMarkets: ['Ghana', 'Senegal'], requirements: ['AfCFTA certificate of origin', 'ECOWAS conformity'], certifications: ['OEKO-TEX'], notes: 'Fails change-of-tariff-heading with imported yarn; needs the value-added rule instead.' },
  { id: 'PRD-004', companyId: 'CMP-03', name: 'Whole cloves, grade A', category: 'Spices', hsCode: '0907.10', origin: 'Tanzania', targetMarkets: ['Germany', 'France'], requirements: ['Phytosanitary certificate', 'Pesticide MRL compliance', 'EU labelling'], certifications: [], notes: 'Two 2025 consignments rejected on labelling grounds.' },
  { id: 'PRD-005', companyId: 'CMP-05', name: 'Washed arabica, AA screen', category: 'Coffee', hsCode: '0901.11', origin: 'Kenya', targetMarkets: ['United Kingdom', 'United Arab Emirates'], requirements: ['Certificate of origin', 'EUDR (EU only)', 'ICO certificate'], certifications: ['Rainforest Alliance'], notes: 'UK DCTS gives duty-free access.' },
  { id: 'PRD-006', companyId: 'CMP-07', name: 'Sawn hardwood, kiln dried', category: 'Timber', hsCode: '4407.29', origin: 'Cameroon', targetMarkets: ['Netherlands', 'Germany', 'United Kingdom'], requirements: ['EUDR geolocation data', 'Land tenure evidence', 'Legality verification'], certifications: [], notes: 'Cameroon is standard-risk under EUDR — full due diligence applies.' },
  { id: 'PRD-007', companyId: 'CMP-08', name: 'Frozen octopus, whole cleaned', category: 'Seafood', hsCode: '0307.51', origin: 'Senegal', targetMarkets: ['France', 'Netherlands'], requirements: ['EU approved establishment', 'Health certificate', 'Catch certificate (IUU)'], certifications: ['HACCP'], notes: 'Catch certificate discipline is the main audit risk.' },
];

export interface Article {
  id: string; title: string; category: string; author: string; updated: string;
  readTime: string; summary: string; body: string; tags: string[]; type: 'Article' | 'Checklist' | 'Template' | 'SOP';
}

export const ARTICLES: Article[] = [
  { id: 'KB-001', title: 'EUDR: what changes on 30 December 2026', category: 'EUDR', author: 'USR-01', updated: '2026-08-30', readTime: '7 min', type: 'Article', tags: ['EUDR', 'EU Market', 'Compliance'], summary: 'The confirmed application date under Regulation (EU) 2025/2650, what operators must hold, and how Cameroon’s standard-risk classification shapes the due diligence burden.', body: 'From 30 December 2026, operators placing cocoa, coffee, timber, palm oil, rubber, soy and cattle products on the EU market must file a due diligence statement before the goods enter free circulation.\n\nThe statement requires geolocation of every plot of land where the commodity was produced, evidence that production did not occur on land deforested after 31 December 2020, and evidence of compliance with the laws of the country of production.\n\n**Cameroon is classified as standard risk.** That means the full due diligence obligation applies — information collection, risk assessment and risk mitigation — with no simplified route. Exporters should assume their EU buyers will push the documentary burden up the chain, and that a buyer without a complete plot dataset will simply switch supplier.\n\nThe practical sequence we use with clients is: map the supply base, capture polygons for plots above four hectares and points below, verify land tenure, score supplier risk, then build a register that can produce a statement per consignment.' },
  { id: 'KB-002', title: 'Rules of origin under AfCFTA: the three tests', category: 'Rules of Origin', author: 'USR-01', updated: '2026-07-14', readTime: '9 min', type: 'Article', tags: ['AfCFTA', 'Rules of Origin'], summary: 'Wholly obtained, substantial transformation and the value-addition threshold — with worked examples from textiles and processed food.', body: 'AfCFTA origin is determined by one of three routes: the goods are wholly obtained in a State Party, they undergo sufficient working or processing, or they meet a value-addition threshold set in the product-specific rules.\n\nMost disputes we see turn on the second test. A change of tariff heading is not satisfied where the imported input already sits in the same heading as the finished good — the classic failure being dyed fabric produced from imported greige fabric of the same heading.\n\n**Where the tariff-shift test fails, check the alternative rule.** Many product-specific rules offer a value-added percentage as an alternative. Building a defensible calculation requires the ex-works price, a costed bill of materials and supplier declarations for every non-originating input.' },
  { id: 'KB-003', title: 'Export documentation checklist — EU-bound agri consignments', category: 'Trade documentation', author: 'USR-02', updated: '2026-06-22', readTime: '4 min', type: 'Checklist', tags: ['Export', 'EU Market', 'Documentation'], summary: 'The document set an EU-bound agricultural consignment needs, in the order the chain requires it.', body: 'Commercial invoice with the correct Incoterm and place named.\nPacking list matching the invoice line for line.\nBill of lading or air waybill consigned correctly for the payment method.\nCertificate of origin, preferential where a preference is claimed.\nPhytosanitary certificate issued within the validity window of the destination.\nHealth certificate where the product is of animal origin.\nEUDR due diligence statement reference number, from 30 December 2026.\nCatch certificate for fishery products.\nAnalysis certificate where the buyer contract requires it.' },
  { id: 'KB-004', title: 'CEMAC customs valuation: the four traps', category: 'Customs', author: 'USR-03', updated: '2026-05-30', readTime: '6 min', type: 'Article', tags: ['Customs', 'CEMAC'], summary: 'Where declared values are most often challenged in the CEMAC zone, and how to build a defensible valuation file.', body: 'Transaction value remains the primary method, but four adjustments account for most disputes in the region.\n\nFirst, royalties and licence fees related to the imported goods that the buyer must pay as a condition of sale. Second, assists — moulds, dies and design work supplied free of charge. Third, freight and insurance to the port of entry, where the declared apportionment does not match the carrier documentation. Fourth, related-party pricing, where no test values have been prepared in advance.\n\n**Build the valuation file before the declaration, not after the query.**' },
  { id: 'KB-005', title: 'Client onboarding SOP', category: 'Internal SOPs', author: 'USR-07', updated: '2026-04-11', readTime: '5 min', type: 'SOP', tags: ['Internal'], summary: 'The standard sequence from accepted proposal to active project, with the owner at each step.', body: 'On proposal acceptance, the practice administrator converts the company record to Client status and creates the project from the service workflow.\n\nThe engagement owner issues the contract within two working days and requests the standard document set through the client portal.\n\nFinance raises the first milestone invoice on contract signature. The project moves to Active once the signed contract and the first document upload are both recorded.\n\n**No project is set Active with an unsigned contract.**' },
  { id: 'KB-006', title: 'Incoterms 2020 for first-time exporters', category: 'Incoterms', author: 'USR-02', updated: '2026-03-19', readTime: '8 min', type: 'Article', tags: ['Export', 'Training'], summary: 'Why EXW and DDP are usually the wrong choices for a first African export, and what to use instead.', body: 'First-time exporters gravitate to EXW because it looks simple. It is not: the seller still has to support export clearance in practice, and the buyer controls the evidence you need to prove export for tax purposes.\n\nDDP is the opposite error — the seller takes on import clearance and duty in a jurisdiction where it has no presence and often cannot recover VAT.\n\n**FCA at a named terminal, or CIF where the buyer wants a landed price, covers most first exports well.**' },
  { id: 'KB-007', title: 'Country guide: Netherlands entry for African agri-exporters', category: 'Country guides', author: 'USR-02', updated: '2026-08-02', readTime: '10 min', type: 'Article', tags: ['EU Market', 'Market Entry'], summary: 'Rotterdam as the entry point, the buyer landscape, and the documentation discipline Dutch importers expect.', body: 'The Netherlands is the first point of EU entry for most African cocoa, coffee and timber, and the Dutch trade houses set the documentary standard for the rest of the EU.\n\nExpect the importer to ask for the full traceability chain up front rather than at the border, and to run their own risk assessment on your supply base before contracting.\n\n**Being able to produce a plot-level dataset on request is now a commercial qualification, not just a regulatory one.**' },
  { id: 'KB-008', title: 'Proposal template — assessment engagements', category: 'Internal SOPs', author: 'USR-01', updated: '2026-02-08', readTime: '3 min', type: 'Template', tags: ['Internal', 'Proposals'], summary: 'The standard structure for assessment proposals, including the scope, assumptions and payment clauses we do not vary.', body: 'Context and understanding of the client situation.\nScope of work, broken into workstreams that map to the project workflow.\nDeliverables, each one a named artefact.\nTimeline in weeks from kick-off, never in fixed dates.\nFees and payment schedule.\nAssumptions and client responsibilities.\nTerms and conditions.\n\n**Payment schedules are never fewer than two tranches and the first is never below 40%.**' },
];

export interface Course {
  id: string; title: string; category: string; level: string; duration: string;
  instructor: string; price: number; currency: string; objectives: string[];
  modules: { title: string; lessons: string[] }[]; enrolled: number; completed: number;
  avgScore: number; certificates: number; status: 'Published' | 'Draft';
}

export const COURSES: Course[] = [
  { id: 'CRS-001', title: 'AfCFTA Practitioner Certificate', category: 'AfCFTA', level: 'Intermediate', duration: '12 hours', instructor: 'USR-01', price: 270000, currency: 'XAF', objectives: ['Read and apply AfCFTA tariff schedules', 'Determine originating status', 'Prepare AfCFTA certificates of origin', 'Identify corridor and logistics constraints'], modules: [{ title: 'The AfCFTA framework', lessons: ['Origins and architecture', 'State Parties and ratification status', 'Tariff liberalisation schedules'] }, { title: 'Rules of origin', lessons: ['The three origin tests', 'Product-specific rules', 'Worked example: textiles', 'Worked example: processed food'] }, { title: 'Documentation', lessons: ['The certificate of origin', 'Supplier declarations', 'Record keeping'] }], enrolled: 68, completed: 41, avgScore: 78, certificates: 41, status: 'Published' },
  { id: 'CRS-002', title: 'Customs Compliance Fundamentals', category: 'Customs', level: 'Foundation', duration: '8 hours', instructor: 'USR-03', price: 190000, currency: 'XAF', objectives: ['Classify goods correctly', 'Apply the valuation hierarchy', 'Prepare for a post-clearance audit'], modules: [{ title: 'Classification', lessons: ['Structure of the HS', 'General interpretative rules', 'Practical classification'] }, { title: 'Valuation', lessons: ['Transaction value', 'Adjustments', 'Alternative methods'] }, { title: 'Audit readiness', lessons: ['Record keeping', 'Responding to a query', 'Voluntary disclosure'] }], enrolled: 94, completed: 63, avgScore: 81, certificates: 63, status: 'Published' },
  { id: 'CRS-003', title: 'EUDR Compliance for Operators', category: 'EUDR', level: 'Advanced', duration: '10 hours', instructor: 'USR-01', price: 590, currency: 'EUR', objectives: ['Build a due diligence system', 'Capture and validate geolocation data', 'Assess and mitigate supply chain risk', 'File a due diligence statement'], modules: [{ title: 'The regulation', lessons: ['Scope and commodities', 'Operator and trader obligations', 'Country risk classification'] }, { title: 'Data', lessons: ['Geolocation requirements', 'Field capture methods', 'Data quality checks'] }, { title: 'Due diligence', lessons: ['Information collection', 'Risk assessment', 'Risk mitigation', 'The statement'] }], enrolled: 52, completed: 19, avgScore: 74, certificates: 19, status: 'Published' },
  { id: 'CRS-004', title: 'Export Readiness Essentials', category: 'Export Readiness', level: 'Foundation', duration: '6 hours', instructor: 'USR-02', price: 130000, currency: 'XAF', objectives: ['Assess your own export readiness', 'Select a target market on evidence', 'Build the documentation set', 'Choose the right Incoterm'], modules: [{ title: 'Are you ready?', lessons: ['The six dimensions', 'Self-assessment', 'Closing the gaps'] }, { title: 'Market selection', lessons: ['Screening criteria', 'Data sources', 'Shortlisting'] }, { title: 'Getting paid', lessons: ['Incoterms', 'Payment methods', 'Trade finance basics'] }], enrolled: 137, completed: 88, avgScore: 84, certificates: 88, status: 'Published' },
  { id: 'CRS-005', title: 'Trade Documentation Masterclass', category: 'Trade Compliance', level: 'Intermediate', duration: '7 hours', instructor: 'USR-02', price: 170000, currency: 'XAF', objectives: ['Produce a consistent document set', 'Avoid the errors that cause rejection', 'Manage certificates and their validity'], modules: [{ title: 'The core set', lessons: ['Invoice and packing list', 'Transport documents', 'Certificates of origin'] }, { title: 'Regulatory documents', lessons: ['Phytosanitary and health', 'Permits and licences', 'Validity management'] }], enrolled: 61, completed: 33, avgScore: 79, certificates: 33, status: 'Published' },
];

export interface Enrollment {
  id: string; courseId: string; learnerName: string; organisation: string; companyId?: string;
  cohort: string; progress: number; score?: number; certified: boolean; enrolled: string; corporate: boolean;
}

export const ENROLLMENTS: Enrollment[] = [
  { id: 'ENR-001', courseId: 'CRS-003', learnerName: 'Nadège Tchouta', organisation: 'Kola Nut Agro-Industries', companyId: 'CMP-01', cohort: 'EUDR Sept 2026', progress: 72, score: 81, certified: false, enrolled: '2026-08-10', corporate: true },
  { id: 'ENR-002', courseId: 'CRS-003', learnerName: 'Abena Osei', organisation: 'Accra Cocoa Ventures', companyId: 'CMP-04', cohort: 'EUDR Sept 2026', progress: 100, score: 88, certified: true, enrolled: '2026-07-02', corporate: true },
  { id: 'ENR-003', courseId: 'CRS-001', learnerName: 'Fatima Bello', organisation: 'Sahel Textiles', companyId: 'CMP-02', cohort: 'AfCFTA Q3 2026', progress: 100, score: 76, certified: true, enrolled: '2026-06-14', corporate: true },
  { id: 'ENR-004', courseId: 'CRS-002', learnerName: 'Blaise Ndikum', organisation: 'Bamenda Timber', companyId: 'CMP-07', cohort: 'Customs Q3 2026', progress: 45, certified: false, enrolled: '2026-08-19', corporate: true },
  { id: 'ENR-005', courseId: 'CRS-004', learnerName: 'Hamisi Rashid', organisation: 'Zanzibar Spice Collective', companyId: 'CMP-03', cohort: 'Open enrolment', progress: 100, score: 90, certified: true, enrolled: '2026-05-20', corporate: false },
  { id: 'ENR-006', courseId: 'CRS-001', learnerName: 'Leila Bennani', organisation: 'Atlas Ceramics', companyId: 'CMP-06', cohort: 'AfCFTA Q3 2026', progress: 30, certified: false, enrolled: '2026-08-28', corporate: true },
  { id: 'ENR-007', courseId: 'CRS-005', learnerName: 'Patrick Awono', organisation: 'Kola Nut Agro-Industries', companyId: 'CMP-01', cohort: 'Open enrolment', progress: 60, certified: false, enrolled: '2026-08-05', corporate: false },
  { id: 'ENR-008', courseId: 'CRS-002', learnerName: 'Cheikh Fall', organisation: 'Dakar Marine Foods', companyId: 'CMP-08', cohort: 'Customs Q3 2026', progress: 100, score: 72, certified: true, enrolled: '2026-06-30', corporate: true },
];

export interface CalendarEvent {
  id: string; title: string; type: string; date: string; time: string; duration: string;
  companyId?: string; projectId?: string; participants: string[]; location: string;
  agenda: string; notes: string;
}

export const EVENTS: CalendarEvent[] = [
  { id: 'EVT-001', title: 'Contract negotiation — Bamenda Timber', type: 'Client meeting', date: '2026-09-09', time: '10:00', duration: '45 min', companyId: 'CMP-07', participants: ['USR-01'], location: 'Google Meet', agenda: 'Liability cap and data ownership clauses.', notes: '' },
  { id: 'EVT-002', title: 'Proposal follow-up — Atlas Ceramics', type: 'Client meeting', date: '2026-09-10', time: '14:00', duration: '30 min', companyId: 'CMP-06', participants: ['USR-05'], location: 'Microsoft Teams', agenda: 'Walk through the proposal and address pricing.', notes: '' },
  { id: 'EVT-003', title: 'Initial consultation — Tema Steel Works', type: 'Consultation', date: '2026-09-10', time: '15:00', duration: '60 min', participants: ['USR-05'], location: 'Zoom', agenda: 'AfCFTA origin position for steel products into Nigeria.', notes: '' },
  { id: 'EVT-004', title: 'AfCFTA consultation — Lusaka Copper', type: 'Consultation', date: '2026-09-12', time: '09:30', duration: '60 min', companyId: 'CMP-09', participants: ['USR-03'], location: 'Google Meet', agenda: 'Corridor economics and origin status of copper inputs.', notes: '' },
  { id: 'EVT-005', title: 'Client presentation — ECOWAS readiness', type: 'Client meeting', date: '2026-09-14', time: '11:00', duration: '90 min', companyId: 'CMP-02', projectId: 'PRJ-003', participants: ['USR-05', 'USR-03'], location: 'Kano — client premises', agenda: 'Final report walkthrough and roadmap.', notes: 'Bilingual deck required.' },
  { id: 'EVT-006', title: 'EUDR steering call', type: 'Client meeting', date: '2026-09-16', time: '15:00', duration: '45 min', companyId: 'CMP-01', projectId: 'PRJ-001', participants: ['USR-01', 'USR-03'], location: 'Google Meet', agenda: 'Risk assessment progress and field capture scheduling.', notes: '' },
  { id: 'EVT-007', title: 'Monthly management review — August', type: 'Internal meeting', date: '2026-09-11', time: '09:00', duration: '120 min', participants: ['USR-01', 'USR-04', 'USR-05', 'USR-07'], location: 'Douala office', agenda: 'Pipeline, delivery, finance and academy review.', notes: '' },
  { id: 'EVT-008', title: 'AfCFTA Practitioner Workshop — Douala', type: 'Training', date: '2026-09-24', time: '08:30', duration: '2 days', participants: ['USR-06', 'USR-01'], location: 'Douala — Hotel Akwa Palace', agenda: 'Two-day practitioner workshop, 22 registered participants.', notes: '' },
  { id: 'EVT-009', title: 'Project deadline — Export Documentation Package', type: 'Project deadline', date: '2026-09-26', time: '17:00', duration: '—', companyId: 'CMP-03', projectId: 'PRJ-008', participants: ['USR-02'], location: '—', agenda: '', notes: '' },
];

export interface MgmtMeeting {
  id: string; period: string; date: string; status: 'Draft' | 'Reviewed' | 'Final';
  attendees: string[]; narrative: string;
  actions: { id: string; decision: string; action: string; owner: string; priority: string; deadline: string; status: string; notes: string }[];
}

export const MGMT_MEETINGS: MgmtMeeting[] = [
  {
    id: 'MGM-001', period: 'July 2026', date: '2026-08-07', status: 'Final',
    attendees: ['USR-01', 'USR-04', 'USR-05', 'USR-07'],
    narrative: 'July closed with the Accra Cocoa register delivered and the second EUDR milestone billed. Pipeline concentration in EUDR work remains the principal commercial risk, and the Zanzibar engagement is the main delivery concern.',
    actions: [
      { id: 'MGA-001', decision: 'Reduce dependence on EUDR-led revenue', action: 'Build an AfCFTA-led campaign targeting West African manufacturers', owner: 'USR-05', priority: 'High', deadline: '2026-09-30', status: 'In Progress', notes: 'LinkedIn series running since August.' },
      { id: 'MGA-002', decision: 'Escalate the Zanzibar document blockage', action: 'Founder to call Salma Juma directly and agree a hard date', owner: 'USR-01', priority: 'High', deadline: '2026-09-12', status: 'Open', notes: 'Still outstanding as at 8 September.' },
      { id: 'MGA-003', decision: 'Tighten invoice discipline', action: 'Introduce a seven-day pre-due reminder on all invoices', owner: 'USR-04', priority: 'Medium', deadline: '2026-08-31', status: 'Completed', notes: 'Reminder schedule now automated.' },
    ],
  },
  {
    id: 'MGM-002', period: 'August 2026', date: '2026-09-11', status: 'Draft',
    attendees: ['USR-01', 'USR-04', 'USR-05', 'USR-07'],
    narrative: '',
    actions: [],
  },
];

export interface AuditEntry {
  id: string; at: string; user: string; action: string; record: string; detail: string; ip: string;
}

export const AUDIT: AuditEntry[] = [
  { id: 'AUD-001', at: '2026-09-08T07:12:00', user: 'USR-01', action: 'User logged in', record: 'USR-01', detail: 'Session started', ip: '102.244.18.4' },
  { id: 'AUD-002', at: '2026-09-07T16:40:00', user: 'USR-04', action: 'Payment recorded', record: 'PAY-010', detail: 'EUR 4,000.00 against BALIA-2026-0009', ip: '105.160.14.9' },
  { id: 'AUD-003', at: '2026-09-06T09:02:00', user: 'CON-03', action: 'Client message sent', record: 'MSG-002', detail: 'Portal message on PRJ-001', ip: '102.244.18.77' },
  { id: 'AUD-004', at: '2026-09-05T11:20:00', user: 'USR-03', action: 'Document status changed', record: 'DOC-002', detail: 'Uploaded → Under Review', ip: '102.244.18.31' },
  { id: 'AUD-005', at: '2026-09-02T09:15:00', user: 'USR-05', action: 'Proposal sent', record: 'PRP-004', detail: 'BALIA-P-2026-0016 sent to Atlas Ceramics SA', ip: '102.244.18.22' },
  { id: 'AUD-006', at: '2026-08-30T14:11:00', user: 'USR-01', action: 'Knowledge article published', record: 'KB-001', detail: 'EUDR: what changes on 30 December 2026', ip: '102.244.18.4' },
  { id: 'AUD-007', at: '2026-08-22T10:05:00', user: 'CON-03', action: 'Document uploaded', record: 'DOC-002', detail: 'Supplier plot geolocation dataset v3 (18.4 MB)', ip: '102.244.18.77' },
  { id: 'AUD-008', at: '2026-07-24T09:41:00', user: 'CON-01', action: 'Proposal accepted', record: 'PRP-002', detail: 'Signed electronically by Elise Mbarga', ip: '102.244.18.77' },
];

export const SETTINGS = {
  company: {
    name: 'BALIA Consulting SARLU',
    tagline: 'International Trade, Customs & Market Entry Advisory',
    regNumber: 'RC/DLA/2025/B/1188',
    address: 'Rue Njo-Njo, Bonapriso, BP 12440, Douala, Cameroon',
    email: 'contact@baliaconsulting.com',
    phone: '+237 6 55 00 11 22',
    website: 'baliaconsulting.com',
    vat: 'M012512345678K',
    capital: 'XAF 999,000',
  },
  finance: {
    baseCurrency: 'XAF',
    invoicePrefix: 'BALIA-2026-',
    proposalPrefix: 'BALIA-P-2026-',
    contractPrefix: 'BALIA-C-2026-',
    nextInvoice: 11,
    nextProposal: 18,
    nextContract: 7,
    defaultTerms: 'Net 30',
    taxRate: 19.25,
    taxLabel: 'VAT (Cameroon)',
    bank: 'Société Générale Cameroun — IBAN CM21 10003 00220 41188220114 78',
    footer: 'Thank you for working with BALIA Consulting.',
  },
  reminders: [
    { at: -7, label: 'Friendly reminder', channel: 'Client', active: true },
    { at: 0, label: 'Payment due today', channel: 'Client', active: true },
    { at: 7, label: 'Payment reminder', channel: 'Client', active: true },
    { at: 14, label: 'Escalation to finance and account owner', channel: 'Internal', active: true },
    { at: 30, label: 'Management alert', channel: 'Internal', active: true },
  ],
  contractReminders: [90, 60, 30, 7],
  targets: { monthlyRevenue: 22000, annualRevenue: 260000, newClients: 12 },
};

export const REVENUE_TARGETS: Record<string, number> = {
  Jan: 18000, Feb: 18000, Mar: 20000, Apr: 20000, May: 22000, Jun: 22000,
  Jul: 22000, Aug: 24000, Sep: 24000, Oct: 26000, Nov: 26000, Dec: 28000,
};

export const OPPORTUNITY_DEFAULT_PROB = STAGE_PROBABILITY;
