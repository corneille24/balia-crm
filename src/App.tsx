import React, { useState } from 'react';
import { AppProvider, useApp } from '@/store';
import { Sidebar, Topbar, Toasts } from '@/components/shell';
import { Dashboard, Analytics } from '@/modules/dashboard';
import { Leads, Opportunities, Consultations } from '@/modules/sales';
import { Companies, Contacts } from '@/modules/accounts';
import { Projects, Tasks, Documents } from '@/modules/delivery';
import { Proposals, Contracts, Invoices, Payments, Expenses } from '@/modules/commercial';
import { Assessments, Intelligence, Knowledge, Academy } from '@/modules/intelligence';
import { Communications, Calendar } from '@/modules/engagement';
import { Reports, Management, Settings } from '@/modules/management';
import { Funders } from '@/modules/funding';
import { FundingOpportunities } from '@/modules/funding-opportunities';
import { FundingApplications } from '@/modules/funding-applications';
import { BusinessFindings } from '@/modules/funding-findings';
import { FundingDashboard } from '@/modules/funding-dashboard';
import { OpportunityIntel } from '@/modules/funding-intel';
import { ClientProspects } from '@/modules/client-prospects';
import { DocumentLibrary } from '@/modules/document-library';
import { StrategicAccounts } from '@/modules/strategic-accounts';
import { TeamAccess } from '@/modules/team';
import { cn } from '@/lib/utils';

function Workspace() {
  const { module } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const modules: Record<string, React.ReactElement> = {
    dashboard: <Dashboard />,
    analytics: <Analytics />,
    leads: <Leads />,
    companies: <Companies />,
    contacts: <Contacts />,
    opportunities: <Opportunities />,
    consultations: <Consultations />,
    clients: <Companies clientsOnly />,
    projects: <Projects />,
    tasks: <Tasks />,
    documents: <Documents />,
    proposals: <Proposals />,
    contracts: <Contracts />,
    invoices: <Invoices />,
    payments: <Payments />,
    expenses: <Expenses />,
    communications: <Communications />,
    calendar: <Calendar />,
    assessments: <Assessments />,
    intelligence: <Intelligence />,
    knowledge: <Knowledge />,
    academy: <Academy />,
    funders: <Funders />,
    'funding-opportunities': <FundingOpportunities />,
    'funding-applications': <FundingApplications />,
    'business-findings': <BusinessFindings />,
    'funding-dashboard': <FundingDashboard />,
    'opportunity-intel': <OpportunityIntel />,
    'client-prospects': <ClientProspects />,
    'document-library': <DocumentLibrary />,
    'strategic-accounts': <StrategicAccounts />,
    reports: <Reports />,
    team: <TeamAccess />,
    management: <Management />,
    settings: <Settings />,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className={cn('transition-[padding] duration-200', collapsed ? 'lg:pl-[60px]' : 'lg:pl-[232px]')}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-6">
          {modules[module] ?? <Dashboard />}
        </main>
      </div>
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Workspace />
    </AppProvider>
  );
}
