import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import * as S from '@/data/seed';
import * as F from '@/data/funding';
import * as P from '@/data/prospects';
import * as EX from '@/data/examples';
import * as EXC from '@/data/examples-content';
import * as LIB from '@/data/library';
import * as ACP from '@/data/account-plans';
import { ROLES, SERVICES, LEAD_SCORE_RULES, STAGE_PROBABILITY } from '@/data/catalog';
import { TODAY_ISO, addDays, invoiceTotals, nextNumber, uid, daysFromToday, projectProgress } from '@/lib/derive';
import { deadlineInfo, appCompletion, opportunityNeedsNextAction, findingNeedsNextAction, needsVerification } from '@/lib/funding';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface Notification {
  id: string; category: string; title: string; detail: string; at: string;
  read: boolean; link?: { module: string; recordId?: string };
  tone?: 'info' | 'success' | 'warning' | 'danger';
}

export interface SavedView {
  id: string; name: string; module: string; filters: Record<string, string>;
}

export interface AppState {
  users: S.User[];
  teams: S.Team[];
  departments: S.Department[];
  accessRequests: S.AccessRequest[];
  sessions: S.Session[];
  loginHistory: S.LoginEvent[];
  companies: S.Company[];
  contacts: S.Contact[];
  leads: S.Lead[];
  opportunities: S.Opportunity[];
  consultations: S.Consultation[];
  projects: S.Project[];
  tasks: S.Task[];
  documents: S.DocumentRec[];
  proposals: S.Proposal[];
  contracts: S.Contract[];
  invoices: S.Invoice[];
  payments: S.Payment[];
  recurring: S.Recurring[];
  expenses: S.Expense[];
  timeEntries: S.TimeEntry[];
  communications: S.Communication[];
  messages: S.PortalMessage[];
  assessments: S.Assessment[];
  products: S.Product[];
  articles: S.Article[];
  courses: S.Course[];
  enrollments: S.Enrollment[];
  events: S.CalendarEvent[];
  meetings: S.MgmtMeeting[];
  audit: S.AuditEntry[];
  // --- Business Intelligence & Funding module ---
  funders: F.Funder[];
  funderContacts: F.FunderContact[];
  businessFindings: F.BusinessFinding[];
  fundingOpportunities: F.FundingOpportunity[];
  fundingApplications: F.FundingApplication[];
  fundingAppDocuments: F.FundingAppDocument[];
  fundingActions: F.FundingAction[];
  funderCommunications: F.FunderCommunication[];
  fundingOutcomes: F.FundingOutcome[];
  researchLog: F.ResearchEntry[];
  prospects: P.ClientProspect[];
  library: LIB.LibraryDoc[];
  accountPlans: ACP.AccountPlan[];
  researchSources: F.ResearchSource[];
  notifications: Notification[];
  savedViews: SavedView[];
  scoreRules: typeof LEAD_SCORE_RULES;
  settings: typeof S.SETTINGS;
  counters: { invoice: number; proposal: number; contract: number; funder: number; finding: number; fundingOpp: number; application: number; action: number };
}



// The founder is the only real person in the system; everything else that was
// fabricated demo data is emptied. The researched intelligence (funders,
// funding opportunities, research log, client prospects) is kept, with owners
// reassigned to the founder so there are no references to removed users.
const FOUNDER = S.USERS[0];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const own = <T extends Record<string, any>>(arr: T[], extra: Record<string, unknown> = {}) => arr.map((x) => ({ ...x, owner: FOUNDER.id, ...extra }));

// eslint-disable-next-line react/only-export-components -- exported for unit tests; not a component
export const initialState: AppState = {
  users: S.USERS,
  teams: [],
  departments: [],
  accessRequests: [],
  sessions: [],
  loginHistory: [],
  companies: EX.EX_COMPANIES, contacts: EX.EX_CONTACTS, leads: EX.EX_LEADS,
  opportunities: EX.EX_OPPORTUNITIES, consultations: EX.EX_CONSULTATIONS, projects: EX.EX_PROJECTS,
  tasks: EX.EX_TASKS, documents: EXC.EX_DOCUMENTS, proposals: EX.EX_PROPOSALS, contracts: EX.EX_CONTRACTS,
  invoices: EX.EX_INVOICES, payments: EX.EX_PAYMENTS, recurring: EXC.EX_RECURRING, expenses: EXC.EX_EXPENSES,
  timeEntries: EXC.EX_TIME, communications: [], messages: [],
  assessments: EXC.EX_ASSESSMENTS, products: EXC.EX_PRODUCTS, articles: EXC.EX_ARTICLES, courses: EXC.EX_COURSES,
  enrollments: EXC.EX_ENROLLMENTS, events: EXC.EX_EVENTS, meetings: EXC.EX_MEETINGS, audit: [],
  funders: own(F.FUNDERS),
  funderContacts: [],
  businessFindings: [],
  fundingOpportunities: own(F.FUNDING_OPPORTUNITIES, { team: [FOUNDER.id], verifiedBy: FOUNDER.id }),
  fundingApplications: [],
  fundingAppDocuments: [], fundingActions: [],
  funderCommunications: [], fundingOutcomes: [],
  researchLog: F.RESEARCH_LOG.map((r) => ({ ...r, researcher: FOUNDER.id })),
  prospects: own(P.CLIENT_PROSPECTS),
  researchSources: [],
  library: LIB.LIBRARY,
  accountPlans: ACP.ACCOUNT_PLANS,
  notifications: [],
  savedViews: [
    { id: 'SV-1', name: 'My hot leads', module: 'leads', filters: { band: 'Hot' } },
    { id: 'SV-2', name: 'Overdue invoices', module: 'invoices', filters: { status: 'Overdue' } },
    { id: 'SV-3', name: 'EUDR clients', module: 'companies', filters: { tag: 'EUDR' } },
    { id: 'SV-4', name: 'Proposals awaiting response', module: 'proposals', filters: { status: 'Sent' } },
  ],
  scoreRules: LEAD_SCORE_RULES,
  settings: S.SETTINGS,
  counters: {
    invoice: S.SETTINGS.finance.nextInvoice, proposal: S.SETTINGS.finance.nextProposal, contract: S.SETTINGS.finance.nextContract,
    funder: F.FUNDING_COUNTERS.funder, finding: F.FUNDING_COUNTERS.finding, fundingOpp: F.FUNDING_COUNTERS.opportunity,
    application: F.FUNDING_COUNTERS.application, action: F.FUNDING_COUNTERS.action,
  },
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'patch'; collection: keyof AppState; id: string; changes: Record<string, unknown> }
  | { type: 'add'; collection: keyof AppState; record: Record<string, unknown> }
  | { type: 'remove'; collection: keyof AppState; id: string }
  | { type: 'bulkPatch'; collection: keyof AppState; ids: string[]; changes: Record<string, unknown> }
  | { type: 'notify'; note: Omit<Notification, 'id' | 'at' | 'read'> }
  | { type: 'readNotification'; id?: string }
  | { type: 'audit'; entry: { user: string; action: string; record: string; detail: string } }
  | { type: 'convertLead'; leadId: string; user: string }
  | { type: 'consultationToOpportunity'; consultationId: string; user: string }
  | { type: 'opportunityToProposal'; opportunityId: string; user: string }
  | { type: 'sendProposal'; proposalId: string; user: string }
  | { type: 'acceptProposal'; proposalId: string; signer: { name: string; email: string }; user: string }
  | { type: 'rejectProposal'; proposalId: string; reason: string; user: string }
  | { type: 'proposalToInvoice'; proposalId: string; user: string }
  | { type: 'toggleWorkflowStep'; projectId: string; index: number; user: string }
  | { type: 'completeProject'; projectId: string; user: string }
  | { type: 'requestDocuments'; companyId: string; projectId?: string; docs: { name: string; category: string; type: string }[]; contactId: string; user: string }
  | { type: 'clientUploadDocument'; documentId: string; contactId: string }
  | { type: 'reviewDocument'; documentId: string; approve: boolean; user: string }
  | { type: 'recordPayment'; invoiceId: string; payment: Omit<S.Payment, 'id'> }
  | { type: 'sendInvoice'; invoiceId: string; user: string }
  | { type: 'createInvoice'; invoice: Partial<S.Invoice>; user: string }
  | { type: 'generateRecurring'; recurringId: string; user: string }
  | { type: 'sendMessage'; message: Omit<S.PortalMessage, 'id'> }
  | { type: 'saveAssessment'; assessment: S.Assessment; user: string }
  | { type: 'setScoreRules'; rules: typeof LEAD_SCORE_RULES }
  | { type: 'saveView'; view: SavedView }
  | { type: 'convertFinding'; findingId: string; target: 'lead' | 'opportunity' | 'funder' | 'funding_opportunity' | 'task' | 'consultation'; user: string }
  | { type: 'awardOpportunity'; opportunityId: string; amount: number; user: string }
  | { type: 'rejectOpportunity'; opportunityId: string; reason: string; user: string }
  | { type: 'patchSettings'; section: 'company' | 'finance'; changes: Record<string, unknown> };

const push = <T,>(arr: T[], item: T) => [item, ...arr];

function auditEntry(user: string, action: string, record: string, detail: string): S.AuditEntry {
  return { id: uid('AUD'), at: new Date().toISOString(), user, action, record, detail, ip: '102.244.18.4' };
}

function note(n: Omit<Notification, 'id' | 'at' | 'read'>): Notification {
  return { ...n, id: uid('NTF'), at: new Date().toISOString(), read: false };
}

// eslint-disable-next-line react/only-export-components -- exported for unit tests; not a component
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'patch': {
      const list = state[action.collection] as unknown as Record<string, unknown>[];
      return {
        ...state,
        [action.collection]: list.map((r) => (r.id === action.id ? { ...r, ...action.changes } : r)),
      };
    }
    case 'bulkPatch': {
      const list = state[action.collection] as unknown as Record<string, unknown>[];
      return {
        ...state,
        [action.collection]: list.map((r) => (action.ids.includes(r.id as string) ? { ...r, ...action.changes } : r)),
      };
    }
    case 'add': {
      const list = state[action.collection] as unknown as Record<string, unknown>[];
      return { ...state, [action.collection]: push(list, action.record) };
    }
    case 'remove': {
      const list = state[action.collection] as unknown as Record<string, unknown>[];
      return { ...state, [action.collection]: list.filter((r) => r.id !== action.id) };
    }
    case 'notify':
      return { ...state, notifications: push(state.notifications, note(action.note)) };
    case 'readNotification':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          !action.id || n.id === action.id ? { ...n, read: true } : n
        ),
      };
    case 'audit':
      return { ...state, audit: push(state.audit, auditEntry(action.entry.user, action.entry.action, action.entry.record, action.entry.detail)) };

    // ---- Lead → Opportunity ------------------------------------------------
    case 'convertLead': {
      const lead = state.leads.find((l) => l.id === action.leadId);
      if (!lead) return state;
      const service = SERVICES.find((s) => s.name === lead.serviceInterest) ?? SERVICES[0];
      const opp: S.Opportunity = {
        id: uid('OPP'),
        name: `${lead.serviceInterest} — ${lead.targetMarket}`,
        companyId: lead.companyId,
        companyName: lead.companyName,
        contactName: lead.contactName,
        serviceId: service.id,
        value: lead.estimatedBudget,
        currency: lead.currency,
        probability: STAGE_PROBABILITY.Qualification,
        stage: 'Qualification',
        expectedClose: addDays(TODAY_ISO, 60),
        owner: lead.owner,
        source: lead.source,
        competitor: '—',
        nextAction: 'Book a scoping consultation',
        notes: lead.notes,
        created: TODAY_ISO,
        leadId: lead.id,
      };
      const task: S.Task = {
        id: uid('TSK'), name: `Scoping consultation — ${lead.companyName}`, description: 'Auto-created on lead conversion.',
        companyId: lead.companyId, assignee: lead.owner, priority: 'High', due: addDays(TODAY_ISO, 3),
        status: 'To Do', estimatedHours: 2, actualHours: 0, checklist: [], comments: [],
      };
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === lead.id ? { ...l, status: 'Qualified' } : l)),
        opportunities: push(state.opportunities, opp),
        tasks: push(state.tasks, task),
        notifications: push(state.notifications, note({ category: 'Sales', title: 'Opportunity created', detail: `${opp.name} — ${lead.companyName}`, tone: 'success', link: { module: 'opportunities', recordId: opp.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Lead converted', lead.id, `Converted to opportunity ${opp.id}`)),
      };
    }

    case 'convertFinding': {
      const finding = state.businessFindings.find((f) => f.id === action.findingId);
      if (!finding) return state;
      const link = (kind: string, id: string) => ({
        ...state,
        businessFindings: state.businessFindings.map((f) => (f.id === finding.id
          ? { ...f, status: 'Converted', convertedTo: [...(f.convertedTo ?? []), { kind, id }], updated: TODAY_ISO }
          : f)),
      });
      const svc = SERVICES.find((s) => s.name === finding.relatedService) ?? SERVICES[0];

      switch (action.target) {
        case 'funder': {
          const funder: F.Funder = {
            id: uid('FND'), name: finding.sourceOrg || finding.title, orgType: 'Other', category: 'Mixed',
            country: finding.country, region: finding.region, headquarters: finding.country, website: finding.sourceUrl,
            generalEmail: '', telephone: '', fundingFocus: finding.description, geographicFocus: [finding.region],
            industryFocus: [finding.industry], targetBeneficiaries: '', eligibleBusinessTypes: [], eligibleCountries: [finding.country],
            minFunding: 0, maxFunding: 0, typicalFunding: finding.potentialValue, currency: finding.currency,
            mechanisms: ['Grant'], applicationMethod: '', registrationRequirements: '', eligibilityRequirements: '',
            requiredDocuments: [], matchingRequirement: '', coFinancingRequirement: '', reportingRequirements: '',
            internalRating: 3, relationshipStatus: 'Prospect', status: 'Researching', owner: finding.responsible,
            notes: `Created from finding ${finding.id}. ${finding.notes}`, tags: finding.tags,
            created: TODAY_ISO, updated: TODAY_ISO,
          };
          return {
            ...link('funder', funder.id),
            funders: push(state.funders, funder),
            notifications: push(state.notifications, note({ category: 'Funding', title: 'Funder created from finding', detail: funder.name, tone: 'success', link: { module: 'funders', recordId: funder.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Funder ${funder.id} created`)),
          };
        }
        case 'funding_opportunity': {
          const opp: F.FundingOpportunity = {
            id: uid('FOP'), name: finding.title, funderId: finding.relatedFunderId ?? '', programName: finding.sourceOrg,
            oppType: 'Grant', description: finding.detail || finding.description,
            amount: finding.potentialValue, minAmount: 0, maxAmount: finding.potentialValue, currency: finding.currency,
            fundingDuration: '', openingDate: TODAY_ISO, deadline: finding.nextActionDate || addDays(TODAY_ISO, 60),
            geographicEligibility: [finding.region], countryEligibility: [finding.country], sectorEligibility: [finding.industry],
            businessEligibility: '', companyStage: '', revenueRequirement: '', employeeRequirement: '', projectRequirement: '',
            matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0, applicationFee: 0,
            applicationUrl: finding.sourceUrl, officialSource: finding.sourceUrl, contactPerson: '', contactEmail: '',
            requiredDocuments: [], evaluationCriteria: [], priority: finding.priority, estimatedValue: finding.potentialValue,
            strategicValue: finding.description, probability: 30, owner: finding.responsible, team: [finding.responsible],
            status: 'Identified', stage: 'Opportunity Identified',
            fitInputs: {}, verifiedCriteria: [], nextAction: finding.nextAction, nextActionDate: finding.nextActionDate,
            notes: `Created from finding ${finding.id}.`, tags: finding.tags, findingId: finding.id,
            discovered: finding.discovered, lastVerified: finding.lastVerified, nextVerification: finding.nextVerification,
            verificationStatus: finding.verificationStatus, verifiedBy: finding.researcher,
            created: TODAY_ISO, updated: TODAY_ISO,
          };
          return {
            ...link('funding_opportunity', opp.id),
            fundingOpportunities: push(state.fundingOpportunities, opp),
            notifications: push(state.notifications, note({ category: 'Funding', title: 'Funding opportunity created from finding', detail: opp.name, tone: 'success', link: { module: 'funding-opportunities', recordId: opp.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Funding opportunity ${opp.id} created`)),
          };
        }
        case 'lead': {
          const lead: S.Lead = {
            id: uid('USR'), companyName: finding.sourceOrg || finding.title, contactName: '', email: '', phone: '',
            country: finding.country, city: '', website: finding.sourceUrl, industry: finding.industry, companySize: 'Unknown',
            source: 'Internal research', serviceInterest: finding.relatedService ?? svc.name, targetMarket: finding.market,
            currentMarket: finding.country, exportExperience: 'Unknown', estimatedBudget: finding.potentialValue, currency: finding.currency,
            value: finding.potentialValue, scoreFlags: [], owner: finding.responsible, status: 'New', priority: finding.priority as 'Low' | 'Medium' | 'High',
            created: TODAY_ISO, lastContact: TODAY_ISO, nextFollowUp: addDays(TODAY_ISO, 3),
            notes: `Created from finding ${finding.id}. ${finding.detail}`, tags: finding.tags, campaign: '',
          };
          return {
            ...link('lead', lead.id),
            leads: push(state.leads, lead),
            notifications: push(state.notifications, note({ category: 'Sales', title: 'Lead created from finding', detail: lead.companyName, tone: 'success', link: { module: 'leads', recordId: lead.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Lead ${lead.id} created`)),
          };
        }
        case 'opportunity': {
          const opp: S.Opportunity = {
            id: uid('OPP'), name: finding.title, companyId: finding.relatedCompanyId, companyName: finding.sourceOrg || finding.title,
            contactName: '', serviceId: svc.id, value: finding.potentialValue, currency: finding.currency,
            probability: STAGE_PROBABILITY.Qualification, stage: 'Qualification', expectedClose: addDays(TODAY_ISO, 60),
            owner: finding.responsible, source: 'Business finding', competitor: '—', nextAction: finding.nextAction || 'Qualify the opportunity',
            notes: `Created from finding ${finding.id}. ${finding.detail}`, created: TODAY_ISO,
          };
          return {
            ...link('opportunity', opp.id),
            opportunities: push(state.opportunities, opp),
            notifications: push(state.notifications, note({ category: 'Sales', title: 'Opportunity created from finding', detail: opp.name, tone: 'success', link: { module: 'opportunities', recordId: opp.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Opportunity ${opp.id} created`)),
          };
        }
        case 'task': {
          const task: S.Task = {
            id: uid('TSK'), name: finding.nextAction || `Follow up: ${finding.title}`, description: `From finding ${finding.id}. ${finding.detail}`,
            companyId: finding.relatedCompanyId, assignee: finding.responsible, priority: (finding.priority === 'Critical' ? 'High' : finding.priority) as 'Low' | 'Medium' | 'High',
            due: finding.nextActionDate || addDays(TODAY_ISO, 7), status: 'To Do', estimatedHours: 2, actualHours: 0, checklist: [], comments: [],
          };
          return {
            ...link('task', task.id),
            tasks: push(state.tasks, task),
            notifications: push(state.notifications, note({ category: 'Delivery', title: 'Task created from finding', detail: task.name, tone: 'info', link: { module: 'tasks', recordId: task.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Task ${task.id} created`)),
          };
        }
        case 'consultation': {
          const cns: S.Consultation = {
            id: uid('CNS'), companyId: finding.relatedCompanyId, companyName: finding.sourceOrg || finding.title, contactName: '',
            date: addDays(TODAY_ISO, 7), time: '10:00', consultant: finding.responsible, type: 'Discovery',
            meetingType: 'Video', location: 'Online', challenge: finding.description, products: '', currentMarkets: finding.country,
            targetMarkets: finding.market, exportExperience: 'Unknown', complianceIssues: '', objectives: finding.nextAction,
            notes: `Created from finding ${finding.id}.`, recommendations: finding.detail, followUp: '',
            recommendedService: svc.id, estimatedValue: finding.potentialValue, currency: finding.currency, status: 'Scheduled',
          };
          return {
            ...link('consultation', cns.id),
            consultations: push(state.consultations, cns),
            notifications: push(state.notifications, note({ category: 'Sales', title: 'Consultation created from finding', detail: cns.companyName, tone: 'info', link: { module: 'consultations', recordId: cns.id } })),
            audit: push(state.audit, auditEntry(action.user, 'Finding converted', finding.id, `Consultation ${cns.id} created`)),
          };
        }
        default:
          return state;
      }
    }

    case 'awardOpportunity': {
      const o = state.fundingOpportunities.find((x) => x.id === action.opportunityId);
      if (!o) return state;
      const app = state.fundingApplications.find((a) => a.opportunityId === o.id);
      const outcome: F.FundingOutcome = {
        id: uid('FOU'), opportunityId: o.id, applicationId: app?.id, funderId: o.funderId,
        outcome: 'Awarded', amount: action.amount, currency: o.currency, date: TODAY_ISO,
        reason: 'Application successful', lessonsLearned: '',
      };
      return {
        ...state,
        fundingOpportunities: state.fundingOpportunities.map((x) => (x.id === o.id ? { ...x, status: 'Awarded', stage: 'Awarded', updated: TODAY_ISO } : x)),
        fundingApplications: app ? state.fundingApplications.map((a) => (a.id === app.id ? { ...a, status: 'Awarded', fundingAwarded: action.amount, decisionDate: TODAY_ISO, contractStatus: 'Pending', finalOutcome: 'Awarded', updated: TODAY_ISO } : a)) : state.fundingApplications,
        funders: state.funders.map((f) => (f.id === o.funderId ? { ...f, status: 'Funded' } : f)),
        fundingOutcomes: push(state.fundingOutcomes, outcome),
        notifications: push(state.notifications, note({ category: 'Funding', title: 'Funding awarded', detail: `${o.name} — ${action.amount.toLocaleString()} ${o.currency}. Set up contract and reporting schedule.`, tone: 'success', link: { module: 'funding-opportunities', recordId: o.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Funding awarded', o.id, `${action.amount} ${o.currency}`)),
      };
    }

    case 'rejectOpportunity': {
      const o = state.fundingOpportunities.find((x) => x.id === action.opportunityId);
      if (!o) return state;
      const app = state.fundingApplications.find((a) => a.opportunityId === o.id);
      const outcome: F.FundingOutcome = {
        id: uid('FOU'), opportunityId: o.id, applicationId: app?.id, funderId: o.funderId,
        outcome: 'Rejected', amount: 0, currency: o.currency, date: TODAY_ISO,
        reason: action.reason, lessonsLearned: '',
      };
      const lessonsTask: S.Task = {
        id: uid('TSK'), name: `Lessons learned: ${o.name}`, description: `Application unsuccessful. Reason: ${action.reason}. Capture what to change next time.`,
        assignee: o.owner, priority: 'Medium', due: addDays(TODAY_ISO, 7), status: 'To Do',
        estimatedHours: 1, actualHours: 0, checklist: [], comments: [],
      };
      return {
        ...state,
        fundingOpportunities: state.fundingOpportunities.map((x) => (x.id === o.id ? { ...x, status: 'Rejected', updated: TODAY_ISO } : x)),
        fundingApplications: app ? state.fundingApplications.map((a) => (a.id === app.id ? { ...a, status: 'Rejected', decisionDate: TODAY_ISO, finalOutcome: `Rejected: ${action.reason}`, updated: TODAY_ISO } : a)) : state.fundingApplications,
        fundingOutcomes: push(state.fundingOutcomes, outcome),
        tasks: push(state.tasks, lessonsTask),
        notifications: push(state.notifications, note({ category: 'Funding', title: 'Application unsuccessful', detail: `${o.name}. A lessons-learned task has been created; the full history is preserved.`, tone: 'warning', link: { module: 'funding-opportunities', recordId: o.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Funding opportunity rejected', o.id, action.reason)),
      };
    }

    case 'consultationToOpportunity': {
      const cns = state.consultations.find((c) => c.id === action.consultationId);
      if (!cns) return state;
      const service = SERVICES.find((s) => s.id === cns.recommendedService) ?? SERVICES[0];
      const opp: S.Opportunity = {
        id: uid('OPP'), name: `${service.name} — ${cns.companyName}`, companyId: cns.companyId,
        companyName: cns.companyName, contactName: cns.contactName, serviceId: service.id,
        value: cns.estimatedValue, currency: cns.currency, probability: STAGE_PROBABILITY.Consultation,
        stage: 'Consultation', expectedClose: addDays(TODAY_ISO, 45), owner: cns.consultant,
        source: 'Consultation', competitor: '—', nextAction: 'Draft and issue proposal',
        notes: cns.recommendations || cns.challenge, created: TODAY_ISO,
      };
      return {
        ...state,
        consultations: state.consultations.map((c) => (c.id === cns.id ? { ...c, status: 'Completed', opportunityId: opp.id } : c)),
        opportunities: push(state.opportunities, opp),
        notifications: push(state.notifications, note({ category: 'Sales', title: 'Opportunity created from consultation', detail: opp.name, tone: 'success', link: { module: 'opportunities', recordId: opp.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Consultation converted', cns.id, `Opportunity ${opp.id} created`)),
      };
    }

    // ---- Opportunity → Proposal -------------------------------------------
    case 'opportunityToProposal': {
      const opp = state.opportunities.find((o) => o.id === action.opportunityId);
      if (!opp) return state;
      const service = SERVICES.find((s) => s.id === opp.serviceId)!;
      const n = state.counters.proposal;
      const proposal: S.Proposal = {
        id: uid('PRP'), number: nextNumber(state.settings.finance.proposalPrefix, n),
        companyId: opp.companyId ?? '', opportunityId: opp.id, title: `${service.name} — ${opp.companyName}`,
        services: [{ serviceId: service.id, description: service.description, qty: 1, rate: opp.value }],
        scope: service.description, deliverables: service.deliverables,
        timeline: service.duration, paymentTerms: '40% on signature, 30% at midpoint, 30% on delivery',
        validUntil: addDays(TODAY_ISO, 30),
        assumptions: 'Client provides the required documents within two weeks of kick-off.',
        status: 'Draft', currency: opp.currency, owner: opp.owner, created: TODAY_ISO, discount: 0, tax: 0,
      };
      return {
        ...state,
        proposals: push(state.proposals, proposal),
        opportunities: state.opportunities.map((o) => (o.id === opp.id ? { ...o, stage: 'Proposal', probability: STAGE_PROBABILITY.Proposal } : o)),
        counters: { ...state.counters, proposal: n + 1 },
        notifications: push(state.notifications, note({ category: 'Sales', title: 'Proposal drafted', detail: `${proposal.number} — ${opp.companyName}`, tone: 'info', link: { module: 'proposals', recordId: proposal.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Proposal created', proposal.id, `${proposal.number} from ${opp.id}`)),
      };
    }

    case 'sendProposal': {
      const p = state.proposals.find((x) => x.id === action.proposalId);
      if (!p) return state;
      const followUp: S.Task = {
        id: uid('TSK'), name: `Proposal follow-up — ${p.title}`, description: 'Auto-created three days after sending.',
        companyId: p.companyId, assignee: p.owner, priority: 'High', due: addDays(TODAY_ISO, 3),
        status: 'To Do', estimatedHours: 1, actualHours: 0, checklist: [], comments: [],
      };
      return {
        ...state,
        proposals: state.proposals.map((x) => (x.id === p.id ? { ...x, status: 'Sent', sent: TODAY_ISO } : x)),
        tasks: push(state.tasks, followUp),
        notifications: push(state.notifications, note({ category: 'Sales', title: 'Proposal sent', detail: `${p.number} issued — follow-up set for ${addDays(TODAY_ISO, 3)}`, tone: 'success', link: { module: 'proposals', recordId: p.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Proposal sent', p.id, `${p.number} sent to client`)),
      };
    }

    // ---- Proposal accepted → client + project + tasks + contract ------------
    case 'acceptProposal': {
      const p = state.proposals.find((x) => x.id === action.proposalId);
      if (!p) return state;
      const service = SERVICES.find((s) => s.id === p.services[0]?.serviceId) ?? SERVICES[0];
      const value = p.services.reduce((s, it) => s + it.qty * it.rate, 0);
      const projectId = uid('PRJ');
      const contractNo = nextNumber(state.settings.finance.contractPrefix, state.counters.contract);
      const contractId = uid('CTR');

      const project: S.Project = {
        id: projectId, name: p.title, companyId: p.companyId, serviceId: service.id,
        manager: p.owner, consultants: [p.owner], start: TODAY_ISO, end: addDays(TODAY_ISO, 84),
        budget: value, currency: p.currency, status: 'Not Started', priority: 'High',
        billingModel: p.paymentTerms, estimatedHours: 120, actualHours: 0,
        contractId, proposalId: p.id,
        workflow: service.workflow.map((name) => ({ name, done: false })),
        notes: 'Created automatically on proposal acceptance.', cost: 0,
      };

      const contract: S.Contract = {
        id: contractId, number: contractNo, companyId: p.companyId, projectIds: [projectId],
        type: 'Statement of work', start: TODAY_ISO, end: addDays(TODAY_ISO, 365),
        renewal: addDays(TODAY_ISO, 335), value, currency: p.currency,
        paymentTerms: state.settings.finance.defaultTerms, owner: p.owner, status: 'Pending Signature',
        signedDoc: '—', notes: `Generated from proposal ${p.number}.`,
      };

      const onboarding: S.Task[] = [
        'Send welcome email and portal invitation',
        'Issue engagement letter for signature',
        'Request the standard document set',
        'Schedule the project kick-off call',
      ].map((name, i) => ({
        id: uid('TSK'), name: `${name}`, description: 'Onboarding task created on proposal acceptance.',
        projectId, companyId: p.companyId, assignee: p.owner,
        priority: (i === 0 ? 'High' : 'Medium') as S.Task['priority'],
        due: addDays(TODAY_ISO, 2 + i * 2), status: 'To Do', estimatedHours: 1, actualHours: 0,
        checklist: [], comments: [],
      }));

      const workflowTasks: S.Task[] = service.workflow.slice(0, 4).map((name, i) => ({
        id: uid('TSK'), name, description: `Workflow step generated from the ${service.name} template.`,
        projectId, companyId: p.companyId, assignee: p.owner, priority: 'Medium' as S.Task['priority'],
        due: addDays(TODAY_ISO, 7 + i * 7), status: 'To Do', estimatedHours: 8, actualHours: 0,
        checklist: [], comments: [],
      }));

      const docRequests: S.DocumentRec[] = service.requiredDocuments.map((name) => ({
        id: uid('DOC'), name, category: 'Corporate', type: name, companyId: p.companyId,
        projectId, uploaded: '', uploadedBy: '', version: 0, status: 'Requested',
        confidentiality: 'Confidential' as const, size: '—',
        requestedFrom: state.contacts.find((c) => c.companyId === p.companyId && c.decisionMaker)?.id,
        note: 'Requested automatically at project creation.',
      }));

      return {
        ...state,
        proposals: state.proposals.map((x) => (x.id === p.id ? {
          ...x, status: 'Accepted', accepted: TODAY_ISO, projectId,
          signature: { ...action.signer, at: new Date().toISOString(), ip: '102.244.18.77', statement: `I confirm I am authorised to accept this proposal on behalf of ${state.companies.find((c) => c.id === p.companyId)?.legalName ?? 'the client'}.` },
        } : x)),
        companies: state.companies.map((c) => (c.id === p.companyId ? { ...c, status: 'Client' as const } : c)),
        opportunities: state.opportunities.map((o) => (o.id === p.opportunityId ? { ...o, stage: 'Won', probability: 100 } : o)),
        projects: push(state.projects, project),
        contracts: push(state.contracts, contract),
        tasks: [...onboarding, ...workflowTasks, ...state.tasks],
        documents: [...docRequests, ...state.documents],
        notifications: push(state.notifications, note({ category: 'Sales', title: 'Proposal accepted', detail: `${p.number} accepted — project, contract and onboarding tasks created`, tone: 'success', link: { module: 'projects', recordId: projectId } })),
        counters: { ...state.counters, contract: state.counters.contract + 1 },
        audit: push(state.audit, auditEntry(action.user, 'Proposal accepted', p.id, `Signed by ${action.signer.name}; project ${projectId} and contract ${contractNo} created`)),
      };
    }

    case 'rejectProposal': {
      const p = state.proposals.find((x) => x.id === action.proposalId);
      if (!p) return state;
      return {
        ...state,
        proposals: state.proposals.map((x) => (x.id === p.id ? { ...x, status: 'Rejected', rejected: TODAY_ISO } : x)),
        opportunities: state.opportunities.map((o) => (o.id === p.opportunityId ? { ...o, stage: 'Lost', probability: 0, lostReason: action.reason } : o)),
        audit: push(state.audit, auditEntry(action.user, 'Proposal rejected', p.id, action.reason)),
      };
    }

    case 'proposalToInvoice': {
      const p = state.proposals.find((x) => x.id === action.proposalId);
      if (!p) return state;
      const n = state.counters.invoice;
      const contact = state.contacts.find((c) => c.companyId === p.companyId && c.type === 'Finance')
        ?? state.contacts.find((c) => c.companyId === p.companyId);
      const invoice: S.Invoice = {
        id: uid('INV'), number: nextNumber(state.settings.finance.invoicePrefix, n),
        companyId: p.companyId, contactId: contact?.id ?? '', projectId: p.projectId,
        issued: TODAY_ISO, due: addDays(TODAY_ISO, 30), currency: p.currency,
        terms: state.settings.finance.defaultTerms,
        items: p.services.map((it) => ({
          serviceId: it.serviceId, description: `${it.description} — first instalment (40%)`,
          qty: 1, unit: 'Milestone', rate: Math.round(it.rate * 0.4), discount: 0, tax: 0,
        })),
        status: 'Draft', notes: `Raised from proposal ${p.number}.`, createdBy: 'USR-04', proposalId: p.id,
      };
      return {
        ...state,
        invoices: push(state.invoices, invoice),
        counters: { ...state.counters, invoice: n + 1 },
        notifications: push(state.notifications, note({ category: 'Finance', title: 'Invoice created', detail: `${invoice.number} raised from ${p.number}`, tone: 'info', link: { module: 'invoices', recordId: invoice.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Invoice created', invoice.id, `${invoice.number} from proposal ${p.number}`)),
      };
    }

    // ---- Delivery ----------------------------------------------------------
    case 'toggleWorkflowStep': {
      const proj = state.projects.find((p) => p.id === action.projectId);
      if (!proj) return state;
      const workflow = proj.workflow.map((w, i) => (i === action.index ? { ...w, done: !w.done } : w));
      const progress = Math.round((workflow.filter((w) => w.done).length / workflow.length) * 100);
      const status = proj.status === 'Not Started' && progress > 0 ? 'Active' : proj.status;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === proj.id ? { ...p, workflow, status } : p)),
        audit: push(state.audit, auditEntry(action.user, 'Project workflow updated', proj.id, `${workflow[action.index].name} → ${workflow[action.index].done ? 'complete' : 'reopened'} (${progress}%)`)),
      };
    }

    case 'completeProject': {
      const proj = state.projects.find((p) => p.id === action.projectId);
      if (!proj) return state;
      const company = state.companies.find((c) => c.id === proj.companyId);
      const feedbackTask: S.Task = {
        id: uid('TSK'), name: `Request client feedback — ${proj.name}`, description: 'Satisfaction survey and testimonial permission.',
        projectId: proj.id, companyId: proj.companyId, assignee: proj.manager, priority: 'Medium',
        due: addDays(TODAY_ISO, 5), status: 'To Do', estimatedHours: 1, actualHours: 0, checklist: [], comments: [],
      };
      const service = SERVICES.find((s) => s.id === proj.serviceId);
      const nextService = SERVICES.find((s) => s.category !== service?.category && s.category === 'Market Entry') ?? SERVICES[1];
      const followOn: S.Opportunity = {
        id: uid('OPP'), name: `${nextService.name} — follow-on`, companyId: proj.companyId,
        companyName: company?.tradingName ?? '', contactName: state.contacts.find((c) => c.companyId === proj.companyId)?.firstName ?? '',
        serviceId: nextService.id, value: nextService.price, currency: nextService.currency,
        probability: STAGE_PROBABILITY.Qualification, stage: 'Qualification',
        expectedClose: addDays(TODAY_ISO, 90), owner: proj.manager, source: 'Existing client',
        competitor: '—', nextAction: 'Present the follow-on recommendation at the closeout meeting',
        notes: `Recommended after completing ${proj.name}.`, created: TODAY_ISO,
      };
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === proj.id ? { ...p, status: 'Completed', workflow: p.workflow.map((w) => ({ ...w, done: true })) } : p)),
        tasks: push(state.tasks, feedbackTask),
        opportunities: push(state.opportunities, followOn),
        notifications: push(state.notifications, note({ category: 'Projects', title: 'Project completed', detail: `${proj.name} — feedback request and follow-on opportunity created`, tone: 'success', link: { module: 'projects', recordId: proj.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Project completed', proj.id, proj.name)),
      };
    }

    case 'requestDocuments': {
      const docs: S.DocumentRec[] = action.docs.map((d) => ({
        id: uid('DOC'), name: d.name, category: d.category, type: d.type,
        companyId: action.companyId, projectId: action.projectId, uploaded: '', uploadedBy: '',
        version: 0, status: 'Requested', confidentiality: 'Confidential' as const, size: '—',
        requestedFrom: action.contactId, note: `Requested ${TODAY_ISO}.`,
      }));
      return {
        ...state,
        documents: [...docs, ...state.documents],
        notifications: push(state.notifications, note({ category: 'Documents', title: 'Documents requested', detail: `${docs.length} document${docs.length > 1 ? 's' : ''} requested — now visible in the client portal`, tone: 'info', link: { module: 'documents' } })),
        audit: push(state.audit, auditEntry(action.user, 'Documents requested', action.companyId, docs.map((d) => d.name).join(', '))),
      };
    }

    case 'clientUploadDocument': {
      const doc = state.documents.find((d) => d.id === action.documentId);
      if (!doc) return state;
      return {
        ...state,
        documents: state.documents.map((d) => (d.id === doc.id ? {
          ...d, status: 'Uploaded', uploaded: TODAY_ISO, uploadedBy: action.contactId,
          version: d.version + 1, size: '1.4 MB',
        } : d)),
        notifications: push(state.notifications, note({ category: 'Documents', title: 'Client uploaded a document', detail: `${doc.name} is ready for review`, tone: 'info', link: { module: 'documents', recordId: doc.id } })),
        audit: push(state.audit, auditEntry(action.contactId, 'Document uploaded', doc.id, doc.name)),
      };
    }

    case 'reviewDocument': {
      const doc = state.documents.find((d) => d.id === action.documentId);
      if (!doc) return state;
      const status = action.approve ? 'Approved' : 'Rejected';
      return {
        ...state,
        documents: state.documents.map((d) => (d.id === doc.id ? { ...d, status } : d)),
        notifications: push(state.notifications, note({ category: 'Documents', title: `Document ${status.toLowerCase()}`, detail: doc.name, tone: action.approve ? 'success' : 'warning', link: { module: 'documents', recordId: doc.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Document reviewed', doc.id, `${doc.status} → ${status}`)),
      };
    }

    // ---- Finance -----------------------------------------------------------
    case 'recordPayment': {
      const payment: S.Payment = { ...action.payment, id: uid('PAY') };
      const inv = state.invoices.find((i) => i.id === action.invoiceId)!;
      const totals = invoiceTotals(inv, [...state.payments, payment]);
      return {
        ...state,
        payments: push(state.payments, payment),
        invoices: state.invoices.map((i) => (i.id === inv.id ? { ...i, status: totals.balance <= 0.005 ? 'Paid' : 'Partially Paid' } : i)),
        notifications: push(state.notifications, note({ category: 'Finance', title: 'Payment received', detail: `${inv.number} — balance now ${totals.balance.toFixed(2)} ${inv.currency}`, tone: 'success', link: { module: 'payments' } })),
        audit: push(state.audit, auditEntry(payment.recordedBy, 'Payment recorded', payment.id, `${payment.amount} ${payment.currency} against ${inv.number}`)),
      };
    }

    case 'sendInvoice': {
      const inv = state.invoices.find((i) => i.id === action.invoiceId);
      if (!inv) return state;
      return {
        ...state,
        invoices: state.invoices.map((i) => (i.id === inv.id ? { ...i, status: 'Sent', sent: TODAY_ISO } : i)),
        notifications: push(state.notifications, note({ category: 'Finance', title: 'Invoice sent', detail: `${inv.number} sent — due ${inv.due}`, tone: 'info', link: { module: 'invoices', recordId: inv.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Invoice sent', inv.id, inv.number)),
      };
    }

    case 'createInvoice': {
      const n = state.counters.invoice;
      const invoice: S.Invoice = {
        id: uid('INV'), number: nextNumber(state.settings.finance.invoicePrefix, n),
        companyId: '', contactId: '', issued: TODAY_ISO, due: addDays(TODAY_ISO, 30),
        currency: 'XAF', terms: state.settings.finance.defaultTerms, items: [],
        status: 'Draft', notes: '', createdBy: 'USR-04', ...action.invoice,
      } as S.Invoice;
      return {
        ...state,
        invoices: push(state.invoices, invoice),
        counters: { ...state.counters, invoice: n + 1 },
        audit: push(state.audit, auditEntry(action.user, 'Invoice created', invoice.id, invoice.number)),
      };
    }

    case 'generateRecurring': {
      const rec = state.recurring.find((r) => r.id === action.recurringId);
      if (!rec) return state;
      const n = state.counters.invoice;
      const contact = state.contacts.find((c) => c.companyId === rec.companyId && c.type === 'Finance')
        ?? state.contacts.find((c) => c.companyId === rec.companyId);
      const monthLabel = new Date(`${rec.next}T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const invoice: S.Invoice = {
        id: uid('INV'), number: nextNumber(state.settings.finance.invoicePrefix, n),
        companyId: rec.companyId, contactId: contact?.id ?? '', projectId: rec.projectId,
        contractId: rec.contractId, issued: rec.next, due: addDays(rec.next, 15),
        currency: rec.currency, terms: rec.terms,
        items: [{ description: `${rec.description.replace(' — monthly', '')} — ${monthLabel}`, qty: 1, unit: 'Month', rate: rec.amount, discount: 0, tax: 0 }],
        status: 'Draft', notes: 'Generated from the recurring schedule.', recurringId: rec.id, createdBy: 'USR-04',
      };
      const nextDate = addDays(rec.next, rec.frequency === 'Monthly' ? 30 : rec.frequency === 'Quarterly' ? 91 : 365);
      return {
        ...state,
        invoices: push(state.invoices, invoice),
        recurring: state.recurring.map((r) => (r.id === rec.id ? { ...r, next: nextDate } : r)),
        counters: { ...state.counters, invoice: n + 1 },
        notifications: push(state.notifications, note({ category: 'Finance', title: 'Recurring invoice generated', detail: `${invoice.number} — next run ${nextDate}`, tone: 'info', link: { module: 'invoices', recordId: invoice.id } })),
        audit: push(state.audit, auditEntry(action.user, 'Recurring invoice generated', invoice.id, `${invoice.number} from ${rec.id}`)),
      };
    }

    case 'sendMessage': {
      const msg: S.PortalMessage = { ...action.message, id: uid('MSG') };
      return {
        ...state,
        messages: push(state.messages, msg),
        notifications: msg.from === 'client'
          ? push(state.notifications, note({ category: 'Clients', title: 'New client message', detail: `${msg.author}: ${msg.body.slice(0, 60)}…`, tone: 'info', link: { module: 'communications' } }))
          : state.notifications,
      };
    }

    case 'saveAssessment': {
      const exists = state.assessments.some((a) => a.id === action.assessment.id);
      return {
        ...state,
        assessments: exists
          ? state.assessments.map((a) => (a.id === action.assessment.id ? action.assessment : a))
          : push(state.assessments, action.assessment),
        audit: push(state.audit, auditEntry(action.user, 'Assessment saved', action.assessment.id, `${action.assessment.type} for ${action.assessment.companyId}`)),
      };
    }

    case 'setScoreRules':
      return { ...state, scoreRules: action.rules };
    case 'saveView':
      return { ...state, savedViews: push(state.savedViews, action.view) };
    case 'patchSettings':
      return { ...state, settings: { ...state.settings, [action.section]: { ...state.settings[action.section], ...action.changes } } };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  user: S.User;
  role: string;
  setRole: (r: string) => void;
  can: (perm: string) => boolean;
  module: string;
  setModule: (m: string, recordId?: string) => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  users: S.User[];
  userById: (id: string) => S.User | undefined;
  companyById: (id?: string) => S.Company | undefined;
  toast: (msg: string, tone?: 'success' | 'info' | 'warning') => void;
  toasts: { id: string; msg: string; tone: string }[];
  portalCompanyId: string;
  setPortalCompanyId: (id: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);

// ---------------------------------------------------------------------------
// Persistence — keep the working state across page reloads.
//
// The app has no backend, so state lives in this reducer. To satisfy "status
// must persist after refreshing / reopening", we mirror the reducer state to
// localStorage (best-effort) and rehydrate from it on load. It's versioned so
// a future shape change can invalidate stale stored state cleanly, and every
// access is guarded so private-mode / quota / parse failures fall back to the
// seed rather than breaking the app.
// ---------------------------------------------------------------------------
const PERSIST_KEY = 'balia-crm.state';
const PERSIST_VERSION = 18; // bump on any state-shape OR seed-data change (persisted collections override the seed on load)

function loadPersisted(): AppState {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return initialState;
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as { version?: number; state?: Partial<AppState> } | null;
    if (!parsed || parsed.version !== PERSIST_VERSION || !parsed.state) return initialState;
    // Merge onto the seed so collections added since the state was saved still exist.
    return { ...initialState, ...parsed.state };
  } catch {
    return initialState;
  }
}

function persist(state: AppState) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify({ version: PERSIST_VERSION, state }));
  } catch {
    /* best-effort: ignore quota / serialization errors */
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersisted);
  useEffect(() => { persist(state); }, [state]);
  const [role, setRole] = useState('super_admin');
  const [module, setModuleRaw] = useState('dashboard');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone: string }[]>([]);
  const [portalCompanyId, setPortalCompanyId] = useState('CMP-01');

  const user = useMemo(() => {
    const map: Record<string, string> = {
      super_admin: 'USR-01', admin: 'USR-02', consultant: 'USR-01',
      finance: 'USR-01', sales: 'USR-01', training: 'USR-01',
    };
    return state.users.find((u) => u.id === map[role]) ?? state.users[0];
  }, [role, state.users]);

  const can = (perm: string) => {
    const r = ROLES.find((x) => x.id === role);
    if (!r) return false;
    return r.permissions.includes('*') || r.permissions.includes(perm);
  };

  const setModule = (m: string, recordId?: string) => {
    setModuleRaw(m);
    setFocusId(recordId ?? null);
  };

  const toast = (msg: string, tone: 'success' | 'info' | 'warning' = 'success') => {
    const id = uid('T');
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  };

  const value: Ctx = {
    state, dispatch, user, role, setRole, can, module, setModule, focusId, setFocusId,
    users: state.users,
    userById: (id) => state.users.find((u) => u.id === id),
    companyById: (id) => state.companies.find((c) => c.id === id),
    toast, toasts, portalCompanyId, setPortalCompanyId,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// --- Cross-cutting selectors ------------------------------------------------

export function useAlerts() {
  const { state } = useApp();
  return useMemo(() => {
    const alerts: { id: string; severity: 'danger' | 'warning' | 'info'; category: string; title: string; detail: string; module: string; recordId?: string }[] = [];

    state.invoices.forEach((inv) => {
      const t = invoiceTotals(inv, state.payments);
      if (t.status === 'Overdue') {
        alerts.push({
          id: `AL-${inv.id}`, severity: t.overdueDays > 21 ? 'danger' : 'warning', category: 'Finance',
          title: `${inv.number} overdue by ${t.overdueDays} days`,
          detail: `${state.companies.find((c) => c.id === inv.companyId)?.tradingName} — balance ${t.balance.toFixed(0)} ${inv.currency}`,
          module: 'invoices', recordId: inv.id,
        });
      }
    });

    state.tasks.forEach((t) => {
      if (!['Completed', 'Cancelled'].includes(t.status) && daysFromToday(t.due) < 0) {
        alerts.push({
          id: `AL-${t.id}`, severity: 'warning', category: 'Delivery',
          title: `Task overdue: ${t.name}`,
          detail: `${Math.abs(daysFromToday(t.due))} days past due`,
          module: 'tasks', recordId: t.id,
        });
      }
    });

    state.projects.forEach((p) => {
      if (p.status === 'Waiting for Client') {
        alerts.push({ id: `AL-${p.id}`, severity: 'warning', category: 'Delivery', title: `${p.name} is blocked`, detail: 'Waiting on client documents', module: 'projects', recordId: p.id });
      } else if (p.status !== 'Completed' && daysFromToday(p.end) < 0) {
        alerts.push({ id: `AL-${p.id}`, severity: 'danger', category: 'Delivery', title: `${p.name} past its end date`, detail: `${Math.abs(daysFromToday(p.end))} days overdue at ${projectProgress(p)}% complete`, module: 'projects', recordId: p.id });
      }
    });

    state.proposals.forEach((p) => {
      if (p.status === 'Sent' && p.sent && -daysFromToday(p.sent) > 5) {
        alerts.push({ id: `AL-${p.id}`, severity: 'warning', category: 'Sales', title: `${p.number} awaiting response`, detail: `Sent ${Math.abs(daysFromToday(p.sent))} days ago`, module: 'proposals', recordId: p.id });
      }
      if (p.status === 'Changes Requested') {
        alerts.push({ id: `AL-${p.id}-c`, severity: 'warning', category: 'Sales', title: `${p.number}: changes requested`, detail: p.title, module: 'proposals', recordId: p.id });
      }
    });

    state.documents.forEach((doc) => {
      if (doc.status === 'Requested') {
        alerts.push({ id: `AL-${doc.id}`, severity: 'info', category: 'Documents', title: `Missing: ${doc.name}`, detail: state.companies.find((c) => c.id === doc.companyId)?.tradingName ?? '', module: 'documents', recordId: doc.id });
      }
      if (doc.expiry) {
        const days = daysFromToday(doc.expiry);
        if (days <= 30) {
          alerts.push({ id: `AL-${doc.id}-x`, severity: days <= 7 ? 'danger' : 'warning', category: 'Documents', title: `${doc.name} expires ${days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`}`, detail: state.companies.find((c) => c.id === doc.companyId)?.tradingName ?? '', module: 'documents', recordId: doc.id });
        }
      }
    });

    state.contracts.forEach((ct) => {
      const days = daysFromToday(ct.renewal);
      if (ct.status !== 'Expired' && days <= 90 && days >= -30) {
        alerts.push({ id: `AL-${ct.id}`, severity: days <= 30 ? 'warning' : 'info', category: 'Contracts', title: `${ct.number} renewal ${days < 0 ? 'passed' : `in ${days} days`}`, detail: state.companies.find((c) => c.id === ct.companyId)?.tradingName ?? '', module: 'contracts', recordId: ct.id });
      }
    });

    state.opportunities.forEach((o) => {
      if (!['Won', 'Lost'].includes(o.stage) && -daysFromToday(o.created) > 45) {
        alerts.push({ id: `AL-${o.id}`, severity: 'info', category: 'Sales', title: `Stalled: ${o.name}`, detail: `Open for ${Math.abs(daysFromToday(o.created))} days at ${o.stage}`, module: 'opportunities', recordId: o.id });
      }
    });

    // ---- Funding & business-intelligence alerts --------------------------
    const closedOpp = ['Funded', 'Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
    state.fundingOpportunities.forEach((o) => {
      if (closedOpp.includes(o.status)) return;
      const dl = deadlineInfo(o.deadline);
      const funderName = state.funders.find((f) => f.id === o.funderId)?.name ?? '';
      // Deadline escalation by urgency band (spec §7).
      if (dl.urgency === 'Overdue') {
        alerts.push({ id: `AL-${o.id}-dl`, severity: 'danger', category: 'Funding', title: `Deadline passed: ${o.name}`, detail: `${funderName} — ${dl.label}`, module: 'funding-opportunities', recordId: o.id });
      } else if (dl.urgency === 'Critical') {
        alerts.push({ id: `AL-${o.id}-dl`, severity: 'danger', category: 'Funding', title: `Critical: ${o.name} due ${dl.label}`, detail: `${funderName} — escalate or decide`, module: 'funding-opportunities', recordId: o.id });
      } else if (dl.urgency === 'Urgent') {
        alerts.push({ id: `AL-${o.id}-dl`, severity: 'warning', category: 'Funding', title: `Urgent: ${o.name} due ${dl.label}`, detail: funderName, module: 'funding-opportunities', recordId: o.id });
      }
      // Active opportunity with no next action (spec §28).
      if (opportunityNeedsNextAction(o)) {
        alerts.push({ id: `AL-${o.id}-na`, severity: 'warning', category: 'Funding', title: `No next action: ${o.name}`, detail: `${funderName} — assign an owner action`, module: 'funding-opportunities', recordId: o.id });
      }
      // Stale verification (spec §17).
      if (needsVerification(o.nextVerification)) {
        alerts.push({ id: `AL-${o.id}-vf`, severity: 'info', category: 'Funding', title: `Verify: ${o.name}`, detail: `Terms not verified since ${o.lastVerified}`, module: 'funding-opportunities', recordId: o.id });
      }
    });

    state.fundingApplications.forEach((a) => {
      if (a.submissionDate) return;
      const dl = deadlineInfo(a.deadline);
      const c = appCompletion(a);
      if (dl.urgency === 'Critical' || dl.urgency === 'Overdue') {
        alerts.push({ id: `AL-${a.id}-dl`, severity: 'danger', category: 'Funding', title: `Application due ${dl.label}: ${a.projectTitle}`, detail: `${c.percent}% complete · ${c.outstandingMandatory.length} mandatory outstanding`, module: 'funding-applications', recordId: a.id });
      }
      // Missing required documents (spec §12/§24).
      const missing = state.fundingAppDocuments.filter((d) => d.applicationId === a.id && d.required && (d.status === 'Missing' || d.status === 'Requested'));
      if (missing.length) {
        alerts.push({ id: `AL-${a.id}-doc`, severity: dl.urgency === 'Critical' ? 'warning' : 'info', category: 'Funding', title: `${missing.length} required document${missing.length === 1 ? '' : 's'} missing`, detail: `${a.projectTitle}: ${missing.map((m) => m.name).join(', ')}`, module: 'funding-applications', recordId: a.id });
      }
    });

    state.fundingActions.forEach((act) => {
      if (act.status !== 'Completed' && daysFromToday(act.dueDate) < 0) {
        alerts.push({ id: `AL-${act.id}`, severity: 'warning', category: 'Funding', title: `Overdue action: ${act.name}`, detail: `${Math.abs(daysFromToday(act.dueDate))} days past due`, module: 'funding-opportunities', recordId: act.opportunityId });
      }
    });

    state.businessFindings.forEach((f) => {
      if (findingNeedsNextAction(f)) {
        alerts.push({ id: `AL-${f.id}-na`, severity: 'info', category: 'Funding', title: `Finding needs action: ${f.title}`, detail: 'No next action set', module: 'business-findings', recordId: f.id });
      }
    });

    const order = { danger: 0, warning: 1, info: 2 };
    return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [state]);
}
