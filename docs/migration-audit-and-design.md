# BALIA CRM migration audit and design proposal

Status: **review required**. This document completes phases 1–2 and proposes phase 3 routes. It does not change application behavior, create database migrations, or delete code.

## 1. Audit summary

The application is a Vite React SPA. `src/App.tsx` imports every operational module eagerly and renders one of 35 views from an in-memory `module` string. `src/store.tsx` contains the complete persisted client-side state, role simulation, generic CRUD reducer, and workflow automations. Browser `localStorage` is the only persistence layer.

The initial state deliberately uses the example datasets for most CRM records, the founder as funding/prospect owner, and leaves several collections empty. The existing test files are standalone TypeScript test sources; `package.json` has no test script yet.

### Reachable views

All of the following are imported by `src/App.tsx` and appear in the `modules` map. The sidebar gates them only in the browser with `ROLES` permissions.

| Area | Current view ids | Proposed route |
| --- | --- | --- |
| Overview | `dashboard`, `analytics` | `/dashboard`, `/analytics` |
| Sales | `leads`, `client-prospects`, `strategic-accounts`, `companies`, `contacts`, `opportunities`, `consultations` | `/sales/leads`, `/sales/prospects`, `/accounts/strategic`, `/accounts/companies`, `/accounts/contacts`, `/sales/opportunities`, `/sales/consultations` |
| Delivery | `clients`, `projects`, `tasks`, `documents`, `document-library` | `/accounts/clients`, `/delivery/projects`, `/delivery/tasks`, `/delivery/documents`, `/library` |
| Commercial | `proposals`, `contracts`, `invoices`, `payments`, `expenses` | `/commercial/proposals`, `/commercial/contracts`, `/commercial/invoices`, `/commercial/payments`, `/commercial/expenses` |
| Engagement | `communications`, `calendar` | `/engagement/communications`, `/engagement/calendar` |
| Intelligence | `assessments`, `intelligence`, `knowledge`, `academy` | `/intelligence/assessments`, `/intelligence/trade`, `/intelligence/knowledge`, `/intelligence/academy` |
| Funding and BI | `funding-dashboard`, `opportunity-intel`, `business-findings`, `funders`, `funding-opportunities`, `funding-applications` | `/funding`, `/funding/intelligence`, `/funding/findings`, `/funding/funders`, `/funding/opportunities`, `/funding/applications` |
| Management | `reports`, `team`, `management`, `settings` | `/reports`, `/team`, `/management`, `/settings` |

Record drawers should become deep links rather than client-only `focusId` state: e.g. `/sales/leads/[leadId]`, `/accounts/companies/[companyId]`, `/sales/opportunities/[opportunityId]`, `/delivery/projects/[projectId]`, `/delivery/tasks/[taskId]`, `/delivery/documents/[documentId]`, `/commercial/proposals/[proposalId]`, `/commercial/contracts/[contractId]`, `/commercial/invoices/[invoiceId]`, `/funding/funders/[funderId]`, `/funding/opportunities/[opportunityId]`, `/funding/applications/[applicationId]`, `/funding/findings/[findingId]`, `/team/members/[userId]`, and `/accounts/strategic/[planId]`.

`src/modules/portal.tsx` is not imported by the app or navigation and is therefore unreachable. Preserve it for now; if retained, make it an authenticated client route such as `/portal/[companyId]` with contact-scoped policies. Otherwise it is a phase-7 deletion candidate.

### Data entities

`AppState` owns these entities. Asterisks mark collections seeded as empty in the current initial state; they still have active UI or workflow support.

| Domain | Entities |
| --- | --- |
| Identity and access | users, teams*, departments*, access requests*, sessions*, login history* |
| CRM | companies, contacts, leads, opportunities, consultations |
| Delivery | projects, tasks, documents, document versions/request state, task checklists/comments embedded in current records |
| Commercial | proposals and proposal items, contracts, invoices and invoice items, payments, recurring billing schedules, expenses, time entries* |
| Engagement | communications*, portal messages*, calendar events, management meetings |
| Intelligence | assessments and scores, products, articles, courses, enrollments, document library |
| Funding | funders, funder contacts*, business findings*, funding opportunities, funding applications*, application documents*, funding actions*, funder communications*, funding outcomes*, research log, research sources* |
| Prospecting | client prospects, prospect contacts, prospect sources, prospect score inputs |
| Cross-cutting | notifications*, saved views, audit log*, lead-score rules, company/finance settings, document/service/country/role reference data, number counters |

### Reducer actions and mutations

| Action | Behavior to preserve in a server action/transaction |
| --- | --- |
| `patch`, `add`, `remove`, `bulkPatch` | Generic in-memory CRUD used for all listed collections. Replace with typed table-specific writes; do not recreate an untyped generic API. |
| `notify`, `readNotification`, `audit` | Create/read notifications and append immutable audit events. |
| `convertLead` | Qualify lead; create opportunity, a scoping task, notification, and audit event. |
| `consultationToOpportunity` | Complete consultation; create opportunity and audit/notification. |
| `opportunityToProposal` | Advance opportunity; create a service-template proposal and increment proposal number. |
| `sendProposal` | Mark proposal sent and create a three-day follow-up task. |
| `acceptProposal` | Accept/sign proposal; mark client and opportunity won; create project, contract, onboarding/workflow tasks, requested documents, notification, audit event, and next contract number. |
| `rejectProposal` | Reject proposal; mark linked opportunity lost and audit. |
| `proposalToInvoice` | Create first-installment invoice from proposal items and increment invoice number. |
| `toggleWorkflowStep` | Toggle project workflow step; calculate progress and activate a not-started project. |
| `completeProject` | Complete all workflow steps; create client-feedback task and follow-on opportunity. |
| `requestDocuments` | Create one or more document requests; notify and audit. |
| `clientUploadDocument` | Update requested document to uploaded, increment version, record uploader; notify/audit. |
| `reviewDocument` | Approve or reject an uploaded document; notify/audit. |
| `recordPayment` | Add payment and calculate invoice balance/status atomically. |
| `sendInvoice` | Mark invoice sent and timestamp it. |
| `createInvoice` | Create draft invoice and allocate next invoice number. |
| `generateRecurring` | Create an invoice from a schedule, advance next-run date, and allocate number. |
| `sendMessage` | Add portal message; notify staff for client-originated messages. |
| `saveAssessment` | Insert or update assessment and audit. |
| `setScoreRules`, `patchSettings` | Update workspace-level scoring/finance/company configuration. |
| `saveView` | Persist a per-user saved filter view. |
| `convertFinding` | Mark finding converted, create one of funder/funding opportunity/lead/opportunity/task/consultation, then notify and audit. |
| `awardOpportunity` | Mark funding opportunity and application awarded, update funder status, create funding outcome, notify/audit. |
| `rejectOpportunity` | Mark opportunity/application rejected, create outcome and lessons-learned task, notify/audit. |

The following direct UI mutations also need typed server actions: lead status/score flags; opportunity stage and go/no-go; proposal cost estimate; project, task, checklist and expense updates; account-plan CRUD; funding pipeline drag/drop and intelligence edits; application requirements/document status/submission; research log and findings creation; team/member/department/access-request/session administration; library CRUD; settings and management-meeting finalization.

### Existing domain logic and tests

Keep these pure calculations, adapting input types only at the data-boundary: `analytics`, `consultant-match`, `crosssell`, `derive`, `forecast`, `funding`, `go-no-go`, `intel-report`, `opportunity-intel`, `proposal-profit`, `prospect-intel`, and `prospect-report`.

Existing tests cover access roles, consultant matching, cross-sell, forecasts, funding pipeline, go/no-go, opportunity intelligence, proposal profit, prospect intelligence, and reducer/team behavior. Phase 4 should replace reducer-specific expectations with database/server-action integration tests while preserving the calculation tests.

### Dead-code candidates — do not remove yet

Static import tracing found these candidates:

1. `src/modules/portal.tsx` — no app or module imports; currently unreachable.
2. `src/components/ui/**` and `src/hooks/use-toast.ts` — the live app uses the custom `src/components/kit.tsx` and `Toasts` from `shell.tsx`; no live module imports the shadcn-style UI kit. There are internal imports only among the unused UI files.
3. `src/App.css` — not imported by the entry point; `src/index.css` is imported.
4. `src/assets/react.svg` and `src/assets/vite.svg` — no source references.
5. `netlify.toml`, Vite configuration, and Parcel dependencies — become migration/removal candidates only after Vercel deployment is verified.

This is a static audit, not a deletion list. A Knip run is still required after Node.js dependencies are installed; the local machine currently has neither Node.js nor pnpm available, so it cannot be executed yet.

## 2. Proposed Supabase schema

### Design decisions

* Use UUID primary keys generated by Postgres. During seed migration, retain legacy string IDs in a `legacy_id` column with a unique `(workspace_id, legacy_id)` constraint to preserve relationships and audit traceability.
* Add `workspace_id`, `created_at`, `updated_at`, `created_by`, and `updated_by` to tenant-owned mutable tables. A single BALIA workspace is seeded first; this small boundary makes staff isolation real without a second application layer.
* Use normalized child tables for relationships that are queried or independently updated (items, people, assignments, scores, requirements, versions, tags, markets). Keep variable form payloads only in a constrained `jsonb` column where the structure is intentionally evolving (`intelligence_inputs`, non-queryable notes/metadata).
* Store money as `numeric(14,2)` plus ISO currency text; never use floating point. Allocate human-readable document numbers through locked workspace counters in the same database transaction/RPC as the create action.
* Use Supabase Storage rather than database blobs. `documents` and `document_versions` store metadata and the private bucket object path.

### Tables by bounded domain

| Domain | Tables |
| --- | --- |
| Workspace, identity, access | `workspaces`, `profiles` (PK/FK `auth.users.id`), `workspace_members`, `roles`, `role_permissions`, `departments`, `teams`, `team_members`, `access_requests`, `audit_events`, `notifications`, `saved_views`, `workspace_settings`, `document_counters` |
| Reference data | `service_catalog`, `service_workflow_templates`, `countries`, `score_rules`, `email_templates`, `document_category_templates` |
| Accounts and sales | `companies`, `company_contacts`, `company_tags`, `company_markets`, `company_products`, `company_interests`, `leads`, `lead_score_flags`, `sales_opportunities`, `opportunity_go_no_go_scores`, `consultations` |
| Delivery and document management | `projects`, `project_members`, `project_workflow_steps`, `tasks`, `task_assignees`, `task_checklist_items`, `task_comments`, `document_requests`, `document_versions`, `document_access_grants` |
| Commercial | `proposals`, `proposal_items`, `contracts`, `invoices`, `invoice_items`, `payments`, `recurring_invoice_schedules`, `expenses`, `time_entries` |
| Engagement and intelligence | `communications`, `portal_messages`, `calendar_events`, `management_meetings`, `assessments`, `assessment_scores`, `knowledge_articles`, `academy_courses`, `academy_enrollments`, `library_documents`, `account_plans` |
| Funding and research | `funders`, `funder_contacts`, `funding_opportunities`, `funding_opportunity_eligibility`, `funding_opportunity_team_members`, `funding_applications`, `funding_application_requirements`, `funding_application_documents`, `funding_actions`, `funder_communications`, `funding_outcomes`, `research_log_entries`, `research_sources`, `business_findings`, `finding_conversions` |
| Prospect research | `client_prospects`, `prospect_contacts`, `prospect_sources`, `prospect_score_inputs` |

### Relationship rules

* A company has many contacts, leads, opportunities, consultations, projects, documents, invoices, communications, assessments, account plans, and portal messages.
* An opportunity belongs to one company (nullable only for research-converted leads), may originate from a lead or consultation, and has zero or more proposals. A proposal has ordered proposal items and may produce one or more invoices and a contract/project.
* A project belongs to a company and optionally a won opportunity, proposal, and contract. Its members, workflow steps, tasks, requested documents, and time entries are separate child records.
* A document request is distinct from its immutable uploaded versions. A version maps to `documents/{workspace_id}/{document_request_id}/{version}/{filename}` in a private `client-documents` bucket; never write directly to `storage.objects`.
* An invoice has ordered items and payments. A generated recurring invoice references its schedule; the schedule advances only after the invoice insert succeeds.
* A funding opportunity belongs to a funder; applications, outcomes, requirements, and team assignments reference it. A business finding can convert into many target records through `finding_conversions` rather than an embedded polymorphic array.
* A client prospect remains research data until conversion. Conversion links it to a company and lead without duplicating contacts/sources.

### Required indexes and constraints

* Foreign-key indexes for every `workspace_id`, parent ID, owner/assignee ID, and status/date filter used by dashboard lists (for example: `tasks(workspace_id, assignee_id, due_date)`, `invoices(workspace_id, status, due_date)`, `sales_opportunities(workspace_id, stage, expected_close_date)`, `funding_opportunities(workspace_id, status, deadline)`).
* Unique workspace numbers for proposals, contracts, invoices, and funder/application reference numbers.
* Check constraints for positive monetary values, percentages from 0–100, valid dates, and known status values. Use Postgres enums only for stable, cross-table concepts; keep fast-changing CRM/funding workflow statuses as constrained text/checks until the product stabilizes.
* Immutable audit events with index `(workspace_id, occurred_at desc)`; append from each mutation transaction.

## 3. Authentication and RLS plan

The current role selector is a demo aid, not security. Replace it with Supabase Auth plus `profiles` and `workspace_members`; role must be database-backed, never read from editable user metadata or a client-side dropdown.

| Actor | Read/write scope |
| --- | --- |
| Super admin | All rows and configuration in their workspace; membership, role, and settings administration. |
| Administrator | All operational workspace data; no role/system policy changes. |
| Consultant | Assigned companies, projects, tasks, documents, opportunities/proposals, assessments, and funding items; optionally broad read access for pipeline lookup where existing `consultant` permissions allow it. |
| Finance | Commercial records, company/client/project context needed for billing, financial funding fields, reports; no operational delivery writes. |
| Sales | Leads, companies, contacts, opportunities, consultations, proposals, calendar/communications, and permitted research data. |
| Training manager | Academy, relevant client/contact/calendar/task and knowledge records. |
| Client portal contact (future route) | Only their company, their own contact profile, document requests/grants, portal messages, and proposals explicitly shared with the company. |

For each exposed table: enable RLS, revoke default access from `anon`/`authenticated`, grant only required verbs to `authenticated`, and define separate `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies. Every tenant policy first constrains `workspace_id` to a membership row for `auth.uid()`. Assignment-sensitive tables additionally allow the assigned member or project/team member. Every `UPDATE` policy includes both `USING` and `WITH CHECK` so a client cannot move a row to another workspace or owner.

Role-to-permission checks should use `workspace_members.role_id` joined to immutable `roles`/`role_permissions`, with a small database helper evaluated as `(select ...)` in policies for performance. If a privileged helper is required to avoid RLS recursion, place it in a non-exposed schema, set a fixed `search_path`, revoke `PUBLIC` execution, grant only `authenticated`, and test it explicitly. Do not place a broad `SECURITY DEFINER` function in `public`.

Storage has a private `client-documents` bucket. `storage.objects` policies verify: bucket ID, a path whose first segment is an authorized workspace ID, and a matching `document_versions`/document-grant row. Upload replacement requires `SELECT`, `INSERT`, and `UPDATE` policies; deletion is restricted to the appropriate manager role. Download links use authenticated downloads or short-lived signed URLs—never a public bucket for client documents.

## 4. Route and rendering contract for phase 3

Create an authenticated `(app)` route group with a shared server-rendered shell/sidebar/topbar. Each page owns its URL state (`searchParams` for filters, sort, tabs, and date ranges); only transient UI remains client state (dialog open state, drag state, form field interaction). Server Components fetch list/detail data; Client Components keep the existing interactive module UI. Route-level `loading.tsx` boundaries will stream data-heavy views. Recharts and resizable/carousel features load dynamically within the routes that need them.

Auth routes: `/login`, `/auth/callback`, `/forgot-password`, `/reset-password`. Preserve a separate future `(portal)` route group if the currently unreachable portal is approved.

## Approval requested

Please confirm or amend:

1. The workspace-scoped schema and role boundaries, especially whether consultants should have broad workspace reads or strictly assignment-only access.
2. The route map, including whether the client portal should be promoted to `/portal/[companyId]` or retired in phase 7.

After approval, the next work is phase 3 scaffolding (Next.js shell/routes) followed by migration SQL and seed conversion—not before.
