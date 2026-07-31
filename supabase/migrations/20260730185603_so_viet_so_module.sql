-- Module viết sớ: metadata lòng sớ + hộ gia đình theo chùa

-- 1) Catalog lòng sớ (global, không theo temple)
create table if not exists public.so_templates (
  longso_id integer primary key,
  name text not null,
  lang text not null check (lang in ('qn', 'nom', 'songngu')),
  kind text not null default 'tradition',
  placeholders jsonb not null default '[]'::jsonb,
  paper_sizes text[] not null default '{}',
  storage_path text,
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_templates_name_idx on public.so_templates using gin (to_tsvector('simple', name));
create index if not exists so_templates_lang_idx on public.so_templates (lang);

create table if not exists public.so_template_sets (
  id text primary key,
  name text not null,
  longso_ids integer[] not null default '{}',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.so_templates enable row level security;
alter table public.so_template_sets enable row level security;

create policy "Authenticated read so_templates"
  on public.so_templates for select to authenticated
  using (active = true);

create policy "Super admins manage so_templates"
  on public.so_templates for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Authenticated read so_template_sets"
  on public.so_template_sets for select to authenticated
  using (active = true);

create policy "Super admins manage so_template_sets"
  on public.so_template_sets for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 2) Hộ gia đình theo chùa
create table if not exists public.so_households (
  id uuid primary key default gen_random_uuid(),
  temple_id uuid not null references public.temples(id) on delete cascade,
  chu_ho text not null,
  phone text,
  dia_chi_tinh text,
  dia_chi_huyen text,
  dia_chi_xa text,
  dia_chi_chi_tiet text,
  noi_cung text,
  nam_cung integer,
  thang_cung integer,
  ngay_cung integer,
  gio_cung text,
  ngach_so_rieng text,
  ghi_chu text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_households_temple_idx
  on public.so_households (temple_id, created_at desc)
  where deleted_at is null;

create table if not exists public.so_household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.so_households(id) on delete cascade,
  temple_id uuid not null references public.temples(id) on delete cascade,
  print_selected boolean not null default true,
  is_chu_ho boolean not null default false,
  xung_ho text,
  ho_ten text not null,
  ho_ten_nho text,
  gioi_tinh text check (gioi_tinh is null or gioi_tinh in ('nam', 'nu')),
  nam_sinh integer,
  ngay_sinh integer,
  thang_sinh integer,
  vai_tro text not null default 'gia_quyen'
    check (vai_tro in ('chu_ho', 'chinh_tien', 'gia_quyen')),
  phap_danh text,
  phap_danh_nho text,
  ngach_so_rieng text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_members_household_idx
  on public.so_household_members (household_id, sort_order);

create table if not exists public.so_ancestors (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.so_households(id) on delete cascade,
  temple_id uuid not null references public.temples(id) on delete cascade,
  print_selected boolean not null default true,
  xung_ho text,
  ten_hieu text not null,
  ten_nho text,
  nam_mat integer,
  thang_mat integer,
  ngay_mat integer,
  gio_mat text,
  an_tang text,
  an_tang_nho text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists so_ancestors_household_idx
  on public.so_ancestors (household_id, sort_order);

alter table public.so_households enable row level security;
alter table public.so_household_members enable row level security;
alter table public.so_ancestors enable row level security;

create policy "Temple admins manage so_households"
  on public.so_households for all to authenticated
  using (temple_id in (select public.user_temple_ids()) or public.is_super_admin())
  with check (temple_id in (select public.user_temple_ids()) or public.is_super_admin());

create policy "Temple admins manage so_household_members"
  on public.so_household_members for all to authenticated
  using (temple_id in (select public.user_temple_ids()) or public.is_super_admin())
  with check (temple_id in (select public.user_temple_ids()) or public.is_super_admin());

create policy "Temple admins manage so_ancestors"
  on public.so_ancestors for all to authenticated
  using (temple_id in (select public.user_temple_ids()) or public.is_super_admin())
  with check (temple_id in (select public.user_temple_ids()) or public.is_super_admin());

-- 3) Storage bucket cho bản gzip lòng sớ (public read)
insert into storage.buckets (id, name, public, file_size_limit)
values ('so-templates', 'so-templates', true, 5242880)
on conflict (id) do nothing;

create policy "Public read so-templates storage"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'so-templates');

create policy "Service role upload so-templates"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'so-templates' and public.is_super_admin());

create policy "Service role update so-templates"
  on storage.objects for update to authenticated
  using (bucket_id = 'so-templates' and public.is_super_admin())
  with check (bucket_id = 'so-templates' and public.is_super_admin());
