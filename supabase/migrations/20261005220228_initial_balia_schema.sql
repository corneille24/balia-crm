-- BALIA CRM foundational schema. Seed data is intentionally separate: it is
-- converted from src/data only after a project is linked and this schema is
-- reviewed against the generated Supabase types.

create extension if not exists pgcrypto;
create schema if not exists private;

create type public.workspace_role as enum ('super_admin', 'admin', 'consultant', 'finance', 'sales', 'training', 'client');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'consultant',
  active boolean not null default true,
  legacy_id text,
  title text,
  department_id uuid,
  team_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  unique (workspace_id, legacy_id)
);

-- These helpers are intentionally in a non-exposed schema. They are only
-- callable by authenticated users and use the caller's auth.uid(), never user
-- metadata, to establish workspace membership.
create function private.is_workspace_member(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = target_workspace_id and m.user_id = (select auth.uid()) and m.active
  );
$$;

create function private.can_manage_workspace(target_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = target_workspace_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('super_admin', 'admin')
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public;
revoke all on function private.can_manage_workspace(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_workspace_member(uuid), private.can_manage_workspace(uuid) to authenticated;

create function private.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure private.handle_new_user();

create table public.departments (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, name text not null, head_user_id uuid references public.profiles(id), budget numeric(14,2), currency text,
  services text[] not null default '{}', status text not null default 'Active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, legacy_id), unique (workspace_id, name)
);
create table public.teams (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, name text not null, department_id uuid references public.departments(id) on delete set null, lead_user_id uuid references public.profiles(id),
  services text[] not null default '{}', markets text[] not null default '{}', status text not null default 'Active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, legacy_id), unique (workspace_id, name)
);
alter table public.workspace_members add constraint workspace_members_department_fk foreign key (department_id) references public.departments(id) on delete set null;
alter table public.workspace_members add constraint workspace_members_team_fk foreign key (team_id) references public.teams(id) on delete set null;

create table public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  company jsonb not null default '{}'::jsonb, finance jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(), updated_by uuid references public.profiles(id)
);
create table public.document_counters (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  invoice_next integer not null default 1 check (invoice_next > 0), proposal_next integer not null default 1 check (proposal_next > 0),
  contract_next integer not null default 1 check (contract_next > 0), updated_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade, category text not null, title text not null, detail text not null,
  tone text not null default 'info', href text, read_at timestamptz, created_at timestamptz not null default now()
);
create table public.audit_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null, action text not null, entity_type text not null, entity_id uuid,
  detail text, payload jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now()
);
create table public.saved_views (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, name text not null, module text not null, filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique (workspace_id, user_id, name)
);

create table public.service_catalog (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, name text not null, category text not null, description text not null default '', price numeric(14,2), currency text,
  pricing_model text, duration text, deliverables jsonb not null default '[]'::jsonb, required_documents jsonb not null default '[]'::jsonb,
  workflow jsonb not null default '[]'::jsonb, owner_id uuid references public.profiles(id), tax_treatment text, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id), unique (workspace_id, name)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, legal_name text not null, trading_name text not null, registration_number text, country text, city text, address text, website text,
  industry text, company_size text, employees integer, turnover text, owner_id uuid references public.profiles(id), status text not null default 'Lead', health text,
  since_date date, notes text not null default '', currency text, tags text[] not null default '{}', products text[] not null default '{}', current_markets text[] not null default '{}',
  target_markets text[] not null default '{}', interests text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, legacy_id)
);
create table public.company_contacts (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, company_id uuid not null references public.companies(id) on delete cascade, first_name text not null, last_name text not null,
  position text, contact_type text, department text, email text, phone text, whatsapp text, linkedin text, preferred_channel text, decision_maker boolean not null default false,
  tags text[] not null default '{}', notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, company_id uuid references public.companies(id) on delete set null, company_name text not null, contact_name text, email text, phone text,
  country text, city text, website text, industry text, company_size text, source text, service_interest text, target_market text, current_market text,
  export_experience text, estimated_budget numeric(14,2), currency text, value numeric(14,2), score_flags text[] not null default '{}', owner_id uuid references public.profiles(id),
  status text not null default 'New', priority text, created_date date, last_contact_date date, next_follow_up_date date, notes text not null default '', tags text[] not null default '{}', campaign text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.sales_opportunities (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, company_id uuid references public.companies(id) on delete set null, lead_id uuid references public.leads(id) on delete set null,
  consultation_id uuid, name text not null, service_id uuid references public.service_catalog(id) on delete set null, value numeric(14,2), currency text, probability numeric(5,2) check (probability between 0 and 100),
  stage text not null, expected_close_date date, owner_id uuid references public.profiles(id), source text, competitor text, next_action text, notes text not null default '', lost_reason text,
  go_no_go jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.consultations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, company_id uuid references public.companies(id) on delete set null, contact_id uuid references public.company_contacts(id) on delete set null,
  scheduled_at timestamptz, consultant_id uuid references public.profiles(id), consultation_type text, meeting_type text, location text, challenge text, products text,
  current_markets text, target_markets text, export_experience text, compliance_issues text, objectives text, notes text, recommendations text, follow_up text,
  recommended_service_id uuid references public.service_catalog(id) on delete set null, estimated_value numeric(14,2), currency text, status text not null default 'Scheduled',
  opportunity_id uuid references public.sales_opportunities(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
alter table public.sales_opportunities add constraint sales_opportunities_consultation_fk foreign key (consultation_id) references public.consultations(id) on delete set null;

create table public.projects (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, company_id uuid not null references public.companies(id) on delete restrict, opportunity_id uuid references public.sales_opportunities(id) on delete set null,
  proposal_id uuid, contract_id uuid, service_id uuid references public.service_catalog(id) on delete set null, name text not null, status text not null default 'Not Started',
  manager_id uuid references public.profiles(id), start_date date, end_date date, budget numeric(14,2), currency text, notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.project_members (project_id uuid not null references public.projects(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, workspace_id uuid not null references public.workspaces(id) on delete cascade, role text, primary key (project_id, user_id));
create table public.project_workflow_steps (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, project_id uuid not null references public.projects(id) on delete cascade, position integer not null, name text not null, done boolean not null default false, completed_at timestamptz, unique (project_id, position));
create table public.tasks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  legacy_id text, project_id uuid references public.projects(id) on delete cascade, company_id uuid references public.companies(id) on delete cascade, name text not null, description text,
  assignee_id uuid references public.profiles(id), priority text, due_date date, status text not null default 'To Do', estimated_hours numeric(8,2), actual_hours numeric(8,2),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.task_checklist_items (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, task_id uuid not null references public.tasks(id) on delete cascade, position integer not null, label text not null, done boolean not null default false, unique (task_id, position));
create table public.document_requests (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null, requested_from_contact_id uuid references public.company_contacts(id) on delete set null, name text not null, category text, document_type text,
  status text not null default 'Requested', confidentiality text not null default 'Confidential', note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id)
);
create table public.document_versions (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, document_request_id uuid not null references public.document_requests(id) on delete cascade, version integer not null, storage_path text not null, original_filename text not null, mime_type text, byte_size bigint, uploaded_by uuid references public.profiles(id), uploaded_at timestamptz not null default now(), unique (document_request_id, version), unique (storage_path));

create table public.proposals (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, number text not null, company_id uuid not null references public.companies(id) on delete restrict,
  opportunity_id uuid references public.sales_opportunities(id) on delete set null, project_id uuid references public.projects(id) on delete set null, title text not null, scope text, deliverables text, timeline text, payment_terms text,
  valid_until date, assumptions text, status text not null default 'Draft', currency text not null, owner_id uuid references public.profiles(id), discount numeric(14,2) not null default 0, tax numeric(14,2) not null default 0,
  estimated_cost numeric(14,2), consultant_days numeric(8,2), signed_at timestamptz, rejected_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id), unique (workspace_id, number)
);
create table public.proposal_items (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, proposal_id uuid not null references public.proposals(id) on delete cascade, service_id uuid references public.service_catalog(id) on delete set null, position integer not null, description text not null, quantity numeric(12,2) not null default 1 check (quantity >= 0), rate numeric(14,2) not null default 0 check (rate >= 0), unique (proposal_id, position));
create table public.contracts (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, number text not null, company_id uuid not null references public.companies(id) on delete restrict, proposal_id uuid references public.proposals(id) on delete set null, project_id uuid references public.projects(id) on delete set null, status text not null default 'Draft', terms jsonb not null default '{}'::jsonb, signed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id), unique (workspace_id, number));
alter table public.projects add constraint projects_proposal_fk foreign key (proposal_id) references public.proposals(id) on delete set null;
alter table public.projects add constraint projects_contract_fk foreign key (contract_id) references public.contracts(id) on delete set null;
create table public.invoices (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, number text not null, company_id uuid not null references public.companies(id) on delete restrict, contact_id uuid references public.company_contacts(id) on delete set null, project_id uuid references public.projects(id) on delete set null, proposal_id uuid references public.proposals(id) on delete set null, contract_id uuid references public.contracts(id) on delete set null, issued_date date not null, due_date date, sent_at timestamptz, currency text not null, terms text, status text not null default 'Draft', notes text, created_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id), unique (workspace_id, number));
create table public.invoice_items (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, invoice_id uuid not null references public.invoices(id) on delete cascade, position integer not null, service_id uuid references public.service_catalog(id) on delete set null, description text not null, quantity numeric(12,2) not null default 1 check (quantity >= 0), unit text, rate numeric(14,2) not null default 0 check (rate >= 0), discount numeric(14,2) not null default 0 check (discount >= 0), tax numeric(14,2) not null default 0 check (tax >= 0), unique (invoice_id, position));
create table public.payments (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, invoice_id uuid not null references public.invoices(id) on delete cascade, amount numeric(14,2) not null check (amount > 0), currency text not null, paid_at timestamptz not null, method text, reference text, recorded_by uuid references public.profiles(id), created_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.expenses (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid references public.companies(id) on delete set null, project_id uuid references public.projects(id) on delete set null, description text not null, category text, amount numeric(14,2) not null check (amount >= 0), currency text not null, incurred_date date, status text not null default 'Pending', submitted_by uuid references public.profiles(id), approved_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.recurring_invoice_schedules (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid not null references public.companies(id) on delete cascade, project_id uuid references public.projects(id) on delete set null, contract_id uuid references public.contracts(id) on delete set null, description text not null, amount numeric(14,2) not null check (amount >= 0), currency text not null, frequency text not null, next_run_date date not null, terms text, active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));

create table public.communications (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid references public.companies(id) on delete cascade, contact_id uuid references public.company_contacts(id) on delete set null, channel text not null, subject text, body text, occurred_at timestamptz not null default now(), owner_id uuid references public.profiles(id), created_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.portal_messages (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid not null references public.companies(id) on delete cascade, contact_id uuid references public.company_contacts(id) on delete set null, sender_kind text not null check (sender_kind in ('balia', 'client')), author_name text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.calendar_events (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid references public.companies(id) on delete set null, project_id uuid references public.projects(id) on delete set null, title text not null, starts_at timestamptz not null, ends_at timestamptz, event_type text, attendees jsonb not null default '[]'::jsonb, notes text, owner_id uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.assessments (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid not null references public.companies(id) on delete cascade, project_id uuid references public.projects(id) on delete set null, assessment_type text not null, status text not null default 'Draft', overall_score numeric(5,2), completed_at timestamptz, owner_id uuid references public.profiles(id), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.assessment_scores (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, assessment_id uuid not null references public.assessments(id) on delete cascade, dimension_key text not null, score numeric(5,2) not null check (score between 0 and 100), recommendation text, unique (assessment_id, dimension_key));
create table public.knowledge_articles (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, title text not null, body text not null, category text, tags text[] not null default '{}', status text not null default 'Draft', author_id uuid references public.profiles(id), published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.academy_courses (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, title text not null, description text, category text, duration text, price numeric(14,2), currency text, instructor_id uuid references public.profiles(id), status text not null default 'Draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.academy_enrollments (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, course_id uuid not null references public.academy_courses(id) on delete cascade, contact_id uuid references public.company_contacts(id) on delete set null, status text not null default 'Enrolled', enrolled_at timestamptz not null default now(), completed_at timestamptz, unique (workspace_id, legacy_id));
create table public.library_documents (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, title text not null, document_type text, project_label text, category text, document_date date, description text, external_link text, storage_path text, owner_id uuid references public.profiles(id), tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.account_plans (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, company_id uuid not null references public.companies(id) on delete cascade, owner_id uuid references public.profiles(id), strategic_priority text, status text not null default 'Active', relationship_strength numeric(5,2) check (relationship_strength between 0 and 100), objectives text, challenges text, competitors text, estimated_annual_value numeric(14,2), currency text, expansion_potential text, relationship_risks text, next_action text, next_review_date date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));

create table public.funders (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, name text not null, organization_type text, category text, country text, region text, headquarters text, website text, general_email text, telephone text, funding_focus text, geographic_focus text[] not null default '{}', industry_focus text[] not null default '{}', target_beneficiaries text, eligible_business_types text[] not null default '{}', eligible_countries text[] not null default '{}', min_funding numeric(14,2), max_funding numeric(14,2), typical_funding numeric(14,2), currency text, mechanisms text[] not null default '{}', application_method text, registration_requirements text, eligibility_requirements text, required_documents jsonb not null default '[]'::jsonb, matching_requirement text, co_financing_requirement text, reporting_requirements text, internal_rating integer check (internal_rating between 1 and 5), relationship_status text, status text, owner_id uuid references public.profiles(id), notes text, tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.funder_contacts (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, funder_id uuid not null references public.funders(id) on delete cascade, full_name text not null, title text, email text, phone text, notes text, primary_contact boolean not null default false, unique (workspace_id, legacy_id));
create table public.business_findings (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, title text not null, finding_type text, source_organization text, source_url text, description text not null, detail text, country text, region text, market text, industry text, related_service text, related_company_id uuid references public.companies(id) on delete set null, related_funder_id uuid references public.funders(id) on delete set null, potential_value numeric(14,2), currency text, priority text, status text not null default 'New', next_action text, next_action_date date, discovered_date date, last_verified_date date, next_verification_date date, verification_status text, researcher_id uuid references public.profiles(id), responsible_id uuid references public.profiles(id), notes text, tags text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.funding_opportunities (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, funder_id uuid not null references public.funders(id) on delete restrict, finding_id uuid references public.business_findings(id) on delete set null, name text not null, program_name text, opportunity_type text, description text, amount numeric(14,2), min_amount numeric(14,2), max_amount numeric(14,2), currency text, funding_duration text, opening_date date, deadline date, geographic_eligibility text[] not null default '{}', country_eligibility text[] not null default '{}', sector_eligibility text[] not null default '{}', business_eligibility text, company_stage text, revenue_requirement text, employee_requirement text, project_requirement text, matching_funds_required boolean not null default false, co_financing_required boolean not null default false, matching_percent numeric(5,2), application_fee numeric(14,2), application_url text, official_source text, contact_person text, contact_email text, required_documents jsonb not null default '[]'::jsonb, evaluation_criteria jsonb not null default '[]'::jsonb, priority text, estimated_value numeric(14,2), strategic_value text, probability numeric(5,2) check (probability between 0 and 100), owner_id uuid references public.profiles(id), status text not null default 'Identified', stage text not null default 'Opportunity Identified', fit_inputs jsonb not null default '{}'::jsonb, verified_criteria jsonb not null default '[]'::jsonb, intelligence_inputs jsonb not null default '{}'::jsonb, next_action text, next_action_date date, notes text, tags text[] not null default '{}', discovered_date date, last_verified_date date, next_verification_date date, verification_status text, verified_by uuid references public.profiles(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.funding_opportunity_team_members (opportunity_id uuid not null references public.funding_opportunities(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, workspace_id uuid not null references public.workspaces(id) on delete cascade, primary key (opportunity_id, user_id));
create table public.funding_applications (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, opportunity_id uuid not null references public.funding_opportunities(id) on delete restrict, funder_id uuid not null references public.funders(id) on delete restrict, project_title text not null, project_summary text, objectives text, expected_outcomes text, deadline date, owner_id uuid references public.profiles(id), start_date date, status text not null default 'In Progress', funding_requested numeric(14,2), funding_awarded numeric(14,2), currency text, budget numeric(14,2), co_financing numeric(14,2), beneficiaries text, geographic_scope text, submission_date date, decision_date date, contract_status text, final_outcome text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.funding_application_requirements (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, application_id uuid not null references public.funding_applications(id) on delete cascade, requirement_key text not null, done boolean not null default false, completed_at timestamptz, unique (application_id, requirement_key));
create table public.funding_application_documents (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, application_id uuid not null references public.funding_applications(id) on delete cascade, document_request_id uuid references public.document_requests(id) on delete set null, name text not null, status text not null default 'Requested', notes text, unique (workspace_id, legacy_id));
create table public.funding_actions (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, opportunity_id uuid references public.funding_opportunities(id) on delete cascade, application_id uuid references public.funding_applications(id) on delete cascade, action_type text, description text not null, due_date date, status text not null default 'Open', owner_id uuid references public.profiles(id), completed_at timestamptz, unique (workspace_id, legacy_id));
create table public.funder_communications (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, funder_id uuid not null references public.funders(id) on delete cascade, opportunity_id uuid references public.funding_opportunities(id) on delete set null, channel text, subject text, body text, occurred_at timestamptz not null default now(), owner_id uuid references public.profiles(id), unique (workspace_id, legacy_id));
create table public.funding_outcomes (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, opportunity_id uuid not null references public.funding_opportunities(id) on delete restrict, application_id uuid references public.funding_applications(id) on delete set null, funder_id uuid not null references public.funders(id) on delete restrict, outcome text not null, amount numeric(14,2) not null default 0, currency text, outcome_date date not null, reason text, lessons_learned text, created_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.research_sources (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, name text not null, url text, source_type text, verification_status text, created_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.research_log_entries (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, researcher_id uuid references public.profiles(id), research_date date not null, source text not null, source_url text, category text, discovered text, verification_status text, changes_summary text, evidence text, notes text, created_at timestamptz not null default now(), unique (workspace_id, legacy_id));

create table public.client_prospects (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, legacy_id text, name text not null, legal_name text, website text, country text, city text, region text, industry text, sub_industry text, description text, products text, company_size text, employees text, headquarters text, parent text, established text, ownership text, export_markets text[] not null default '{}', import_markets text[] not null default '{}', cemac_operations text, segment text, services text[] not null default '{}', why_balia text, why_now text, trigger_text text, trigger_date date, trigger_source text, score_inputs jsonb not null default '{}'::jsonb, conversion_probability numeric(5,2) check (conversion_probability between 0 and 100), conversion_confidence text, commercial_potential text, general_email text, general_phone text, research_date date, last_verified_date date, verification_status text, owner_id uuid references public.profiles(id), notes text, converted_company_id uuid references public.companies(id) on delete set null, converted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (workspace_id, legacy_id));
create table public.prospect_contacts (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, prospect_id uuid not null references public.client_prospects(id) on delete cascade, role text not null, name text, title text, email text, phone text, linkedin text, confidence text, source text);
create table public.prospect_sources (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, prospect_id uuid not null references public.client_prospects(id) on delete cascade, name text not null, url text, source_type text, source_date date);

-- Tenant indexes used by dashboard, queues, and RLS predicates.
create index on public.workspace_members (user_id, workspace_id) where active;
create index on public.companies (workspace_id, owner_id);
create index on public.leads (workspace_id, owner_id, status, next_follow_up_date);
create index on public.sales_opportunities (workspace_id, owner_id, stage, expected_close_date);
create index on public.projects (workspace_id, manager_id, status);
create index on public.tasks (workspace_id, assignee_id, due_date) where status not in ('Completed', 'Cancelled');
create index on public.invoices (workspace_id, status, due_date);
create index on public.funding_opportunities (workspace_id, owner_id, status, deadline);
create index on public.funding_applications (workspace_id, owner_id, status, deadline);
create index on public.notifications (workspace_id, user_id, read_at, created_at desc);
create index on public.audit_events (workspace_id, occurred_at desc);

-- All tenant-owned tables are exposed through the Data API only to authenticated
-- workspace members. Table-specific server actions add role and assignment
-- checks before writes; RLS remains the tenant boundary even if an action is bypassed.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'workspaces', 'profiles', 'workspace_members', 'departments', 'teams', 'workspace_settings', 'document_counters', 'notifications', 'audit_events', 'saved_views', 'service_catalog',
    'companies', 'company_contacts', 'leads', 'sales_opportunities', 'consultations', 'projects', 'project_members', 'project_workflow_steps', 'tasks', 'task_checklist_items', 'document_requests', 'document_versions',
    'proposals', 'proposal_items', 'contracts', 'invoices', 'invoice_items', 'payments', 'expenses', 'recurring_invoice_schedules', 'communications', 'portal_messages', 'calendar_events', 'assessments', 'assessment_scores', 'knowledge_articles', 'academy_courses', 'academy_enrollments', 'library_documents', 'account_plans',
    'funders', 'funder_contacts', 'business_findings', 'funding_opportunities', 'funding_opportunity_team_members', 'funding_applications', 'funding_application_requirements', 'funding_application_documents', 'funding_actions', 'funder_communications', 'funding_outcomes', 'research_sources', 'research_log_entries', 'client_prospects', 'prospect_contacts', 'prospect_sources'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    if table_name = 'profiles' then
      execute 'create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()))';
      execute 'create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()))';
    elsif table_name = 'workspaces' then
      execute 'create policy workspaces_member_select on public.workspaces for select to authenticated using ((select private.is_workspace_member(id)))';
      execute 'create policy workspaces_manager_update on public.workspaces for update to authenticated using ((select private.can_manage_workspace(id))) with check ((select private.can_manage_workspace(id)))';
    elsif table_name = 'workspace_members' then
      execute 'create policy members_self_select on public.workspace_members for select to authenticated using (user_id = (select auth.uid()) or (select private.can_manage_workspace(workspace_id)))';
      execute 'create policy members_manager_write on public.workspace_members for all to authenticated using ((select private.can_manage_workspace(workspace_id))) with check ((select private.can_manage_workspace(workspace_id)))';
    else
      execute format('create policy %I on public.%I for select to authenticated using ((select private.is_workspace_member(workspace_id)))', table_name || '_member_select', table_name);
      execute format('create policy %I on public.%I for insert to authenticated with check ((select private.is_workspace_member(workspace_id)))', table_name || '_member_insert', table_name);
      execute format('create policy %I on public.%I for update to authenticated using ((select private.is_workspace_member(workspace_id))) with check ((select private.is_workspace_member(workspace_id)))', table_name || '_member_update', table_name);
      execute format('create policy %I on public.%I for delete to authenticated using ((select private.can_manage_workspace(workspace_id)))', table_name || '_manager_delete', table_name);
    end if;
  end loop;
end $$;

create policy workspace_members_self_insert on public.workspace_members for insert to authenticated with check (user_id = (select auth.uid()) and false);

-- Private document bucket: create through the Storage API/dashboard, then add
-- object policies only after document path conventions are live. The service
-- role is intentionally not referenced in this schema and must remain server-only.
