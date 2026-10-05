export const MODULE_ROUTES = {
  dashboard: '/dashboard',
  analytics: '/analytics',
  leads: '/sales/leads',
  'client-prospects': '/sales/prospects',
  'strategic-accounts': '/accounts/strategic',
  companies: '/accounts/companies',
  contacts: '/accounts/contacts',
  opportunities: '/sales/opportunities',
  consultations: '/sales/consultations',
  clients: '/accounts/clients',
  projects: '/delivery/projects',
  tasks: '/delivery/tasks',
  documents: '/delivery/documents',
  'document-library': '/library',
  proposals: '/commercial/proposals',
  contracts: '/commercial/contracts',
  invoices: '/commercial/invoices',
  payments: '/commercial/payments',
  expenses: '/commercial/expenses',
  communications: '/engagement/communications',
  calendar: '/engagement/calendar',
  assessments: '/intelligence/assessments',
  intelligence: '/intelligence/trade',
  knowledge: '/intelligence/knowledge',
  academy: '/intelligence/academy',
  'funding-dashboard': '/funding',
  'opportunity-intel': '/funding/intelligence',
  'business-findings': '/funding/findings',
  funders: '/funding/funders',
  'funding-opportunities': '/funding/opportunities',
  'funding-applications': '/funding/applications',
  reports: '/reports',
  team: '/team',
  management: '/management',
  settings: '/settings',
} as const;

export type ModuleId = keyof typeof MODULE_ROUTES;

const ROUTE_ENTRIES = Object.entries(MODULE_ROUTES)
  .sort(([, a], [, b]) => b.length - a.length) as [ModuleId, string][];

export function routeForModule(module: string, recordId?: string) {
  const route = MODULE_ROUTES[module as ModuleId] ?? MODULE_ROUTES.dashboard;
  return recordId ? `${route}?record=${encodeURIComponent(recordId)}` : route;
}

export function moduleFromPathname(pathname: string | null): ModuleId {
  const match = ROUTE_ENTRIES.find(([, route]) => pathname === route || pathname?.startsWith(`${route}/`));
  return match?.[0] ?? 'dashboard';
}
