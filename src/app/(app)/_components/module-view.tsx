'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ModuleId } from '@/lib/routes';

const loading = () => <div className="h-64 animate-pulse rounded-lg bg-muted" aria-label="Loading workspace" />;
const load = (factory: () => Promise<{ default: ComponentType }>) => dynamic(factory, { loading });

const Dashboard = load(() => import('@/modules/dashboard').then(({ Dashboard: defaultExport }) => ({ default: defaultExport })));
const Analytics = load(() => import('@/modules/dashboard').then(({ Analytics: defaultExport }) => ({ default: defaultExport })));
const Leads = load(() => import('@/modules/sales').then(({ Leads: defaultExport }) => ({ default: defaultExport })));
const Opportunities = load(() => import('@/modules/sales').then(({ Opportunities: defaultExport }) => ({ default: defaultExport })));
const Consultations = load(() => import('@/modules/sales').then(({ Consultations: defaultExport }) => ({ default: defaultExport })));
const Companies = load(() => import('@/modules/accounts').then(({ Companies: defaultExport }) => ({ default: defaultExport })));
const Clients = load(() => import('@/modules/accounts').then(({ Companies }) => ({ default: () => <Companies clientsOnly /> })));
const Contacts = load(() => import('@/modules/accounts').then(({ Contacts: defaultExport }) => ({ default: defaultExport })));
const Projects = load(() => import('@/modules/delivery').then(({ Projects: defaultExport }) => ({ default: defaultExport })));
const Tasks = load(() => import('@/modules/delivery').then(({ Tasks: defaultExport }) => ({ default: defaultExport })));
const Documents = load(() => import('@/modules/delivery').then(({ Documents: defaultExport }) => ({ default: defaultExport })));
const Proposals = load(() => import('@/modules/commercial').then(({ Proposals: defaultExport }) => ({ default: defaultExport })));
const Contracts = load(() => import('@/modules/commercial').then(({ Contracts: defaultExport }) => ({ default: defaultExport })));
const Invoices = load(() => import('@/modules/commercial').then(({ Invoices: defaultExport }) => ({ default: defaultExport })));
const Payments = load(() => import('@/modules/commercial').then(({ Payments: defaultExport }) => ({ default: defaultExport })));
const Expenses = load(() => import('@/modules/commercial').then(({ Expenses: defaultExport }) => ({ default: defaultExport })));
const Communications = load(() => import('@/modules/engagement').then(({ Communications: defaultExport }) => ({ default: defaultExport })));
const Calendar = load(() => import('@/modules/engagement').then(({ Calendar: defaultExport }) => ({ default: defaultExport })));
const Assessments = load(() => import('@/modules/intelligence').then(({ Assessments: defaultExport }) => ({ default: defaultExport })));
const Intelligence = load(() => import('@/modules/intelligence').then(({ Intelligence: defaultExport }) => ({ default: defaultExport })));
const Knowledge = load(() => import('@/modules/intelligence').then(({ Knowledge: defaultExport }) => ({ default: defaultExport })));
const Academy = load(() => import('@/modules/intelligence').then(({ Academy: defaultExport }) => ({ default: defaultExport })));
const Funders = load(() => import('@/modules/funding').then(({ Funders: defaultExport }) => ({ default: defaultExport })));
const FundingOpportunities = load(() => import('@/modules/funding-opportunities').then(({ FundingOpportunities: defaultExport }) => ({ default: defaultExport })));
const FundingApplications = load(() => import('@/modules/funding-applications').then(({ FundingApplications: defaultExport }) => ({ default: defaultExport })));
const BusinessFindings = load(() => import('@/modules/funding-findings').then(({ BusinessFindings: defaultExport }) => ({ default: defaultExport })));
const FundingDashboard = load(() => import('@/modules/funding-dashboard').then(({ FundingDashboard: defaultExport }) => ({ default: defaultExport })));
const OpportunityIntel = load(() => import('@/modules/funding-intel').then(({ OpportunityIntel: defaultExport }) => ({ default: defaultExport })));
const ClientProspects = load(() => import('@/modules/client-prospects').then(({ ClientProspects: defaultExport }) => ({ default: defaultExport })));
const DocumentLibrary = load(() => import('@/modules/document-library').then(({ DocumentLibrary: defaultExport }) => ({ default: defaultExport })));
const StrategicAccounts = load(() => import('@/modules/strategic-accounts').then(({ StrategicAccounts: defaultExport }) => ({ default: defaultExport })));
const Reports = load(() => import('@/modules/management').then(({ Reports: defaultExport }) => ({ default: defaultExport })));
const TeamAccess = load(() => import('@/modules/team').then(({ TeamAccess: defaultExport }) => ({ default: defaultExport })));
const Management = load(() => import('@/modules/management').then(({ Management: defaultExport }) => ({ default: defaultExport })));
const Settings = load(() => import('@/modules/management').then(({ Settings: defaultExport }) => ({ default: defaultExport })));

const modules: Record<ModuleId, ComponentType> = {
  dashboard: Dashboard, analytics: Analytics, leads: Leads, 'client-prospects': ClientProspects,
  'strategic-accounts': StrategicAccounts, companies: Companies, contacts: Contacts, opportunities: Opportunities,
  consultations: Consultations, clients: Clients, projects: Projects, tasks: Tasks, documents: Documents,
  'document-library': DocumentLibrary, proposals: Proposals, contracts: Contracts, invoices: Invoices,
  payments: Payments, expenses: Expenses, communications: Communications, calendar: Calendar,
  assessments: Assessments, intelligence: Intelligence, knowledge: Knowledge, academy: Academy,
  'funding-dashboard': FundingDashboard, 'opportunity-intel': OpportunityIntel, 'business-findings': BusinessFindings,
  funders: Funders, 'funding-opportunities': FundingOpportunities, 'funding-applications': FundingApplications,
  reports: Reports, team: TeamAccess, management: Management, settings: Settings,
};

export function ModuleView({ module }: Readonly<{ module: ModuleId }>) {
  const View = modules[module];
  return <View />;
}
