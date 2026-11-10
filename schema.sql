-- =====================================================================
-- Dz2link — قاعدة البيانات (Supabase / PostgreSQL)
-- نفّذ هذا الملف كاملاً مرة واحدة في: Supabase → SQL Editor → New query
-- كل الوصول يتم عبر دوال RPC آمنة. الجداول نفسها مغلقة تماماً أمام الزوار.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- الإعدادات (صف واحد) ----------
create table if not exists settings (
  id                int primary key default 1 check (id = 1),
  cycle_anchor      timestamptz not null default '2026-11-09 00:00:00+00', -- بداية أول جولة
  open_hours        int  not null default 14,    -- ساعات فتح التسجيل
  gap_hours         int  not null default 10,    -- ساعات الإغلاق قبل تجديد الجولة
  min_seconds       int  not null default 20,    -- أقل مدة بين بدء المهمة وإدخال الـ ID
  token_ttl_minutes int  not null default 360,   -- صلاحية رابط المهمة
  max_per_ip        int  not null default 5,     -- أقصى مشاركات من اتصال واحد في الجولة
  ip_salt           text not null default gen_random_uuid()::text,
  prizes            jsonb not null default '[
    {"from":1,  "to":1,   "each":5},
    {"from":2,  "to":10,  "each":2},
    {"from":11, "to":20,  "each":0.5},
    {"from":21, "to":50,  "each":0.2},
    {"from":51, "to":100, "each":0.1}
  ]'
);
insert into settings (id) values (1) on conflict do nothing;

-- ---------- المهام (رمز لكل زائر) ----------
create table if not exists sessions (
  token      uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  round_id   int  not null,
  ip_hash    text,
  used       boolean not null default false
);
create index if not exists sessions_ip_idx on sessions (ip_hash, created_at);

-- ---------- المشاركات ----------
create table if not exists entries (
  id         bigint generated always as identity primary key,
  round_id   int  not null,
  uid        text not null check (uid ~ '^[0-9]{6,12}$'),
  created_at timestamptz not null default now(),
  ip_hash    text,
  unique (round_id, uid)               -- يمنع تكرار الـ ID في الجولة نفسها
);
create index if not exists entries_round_idx on entries (round_id, id);

-- ---------- الجولات والنتائج ----------
create table if not exists rounds (
  round_id      int primary key,
  published_at  timestamptz,           -- وقت نشر القائمة والبصمة (قبل السحب)
  entries_count int,
  entries_hash  text,
  seed          text,
  drawn_at      timestamptz,
  total_prizes  numeric
);

create table if not exists winners (
  round_id   int  not null references rounds(round_id) on delete cascade,
  rank       int  not null,
  entry_id   bigint not null references entries(id),
  uid        text not null,            -- الـ ID الكامل (للإدارة فقط)
  masked_uid text not null,
  reward     numeric not null,
  paid_at    timestamptz,
  primary key (round_id, rank)
);

create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- إغلاق الجداول أمام الجميع (RLS بدون سياسات) ----------
alter table settings enable row level security;
alter table sessions enable row level security;
alter table entries  enable row level security;
alter table rounds   enable row level security;
alter table winners  enable row level security;
alter table admins   enable row level security;

-- =====================================================================
-- دوال مساعدة داخلية
-- =====================================================================
create or replace function mask_uid(p_uid text) returns text
language sql immutable as $$
  select case when length(p_uid) > 5 then left(p_uid,3) || '****' || right(p_uid,2) else p_uid end
$$;

-- حالة الجولة الحالية، محسوبة من وقت الخادم (لا يمكن التلاعب بها من المتصفح)
create or replace function _cycle() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  s settings%rowtype; v_open numeric; v_cycle numeric; v_el numeric; v_r int; v_in numeric;
begin
  select * into s from settings where id = 1;
  v_open  := s.open_hours * 3600;
  v_cycle := (s.open_hours + s.gap_hours) * 3600;
  v_el    := extract(epoch from (now() - s.cycle_anchor));
  v_r     := floor(v_el / v_cycle)::int;
  v_in    := v_el - v_r * v_cycle;
  return jsonb_build_object(
    'round',         v_r,
    'is_open',       v_in < v_open,
    'seconds_left',  ceil(case when v_in < v_open then v_open - v_in else v_cycle - v_in end)::int,
    'open_seconds',  v_open::int,
    'cycle_seconds', v_cycle::int
  );
end $$;

-- بصمة الاتصال (مجزّأة بملح سري، لا نخزّن الـ IP نفسه)
create or replace function _ip_hash() returns text
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_hdr json; v_ip text; v_salt text;
begin
  begin v_hdr := current_setting('request.headers', true)::json;
  exception when others then v_hdr := null; end;
  v_ip := split_part(coalesce(v_hdr->>'cf-connecting-ip', v_hdr->>'x-forwarded-for', ''), ',', 1);
  if v_ip = '' then return null; end if;
  select ip_salt into v_salt from settings where id = 1;
  return encode(digest(trim(v_ip) || v_salt, 'sha256'), 'hex');
end $$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

create or replace function _require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
end $$;

-- =====================================================================
-- دوال عامة (للزوار)
-- =====================================================================
create or replace function get_status() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_c jsonb := _cycle(); s settings%rowtype; v_n int;
begin
  select * into s from settings where id = 1;
  select count(*) into v_n from entries where round_id = (v_c->>'round')::int;
  return v_c || jsonb_build_object('server_time', now(), 'entries_count', v_n, 'prizes', s.prizes);
end $$;

-- يُستدعى عند الضغط على «شارك»: ينشئ رمزاً فريداً لهذا الزائر
create or replace function start_session() returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare v_c jsonb := _cycle(); v_ip text := _ip_hash(); v_t uuid;
begin
  if not (v_c->>'is_open')::boolean then raise exception 'closed'; end if;
  if v_ip is not null and (
       select count(*) from sessions where ip_hash = v_ip and created_at > now() - interval '1 hour'
     ) >= 60 then
    raise exception 'rate_limited';
  end if;
  insert into sessions (round_id, ip_hash) values ((v_c->>'round')::int, v_ip) returning token into v_t;
  return jsonb_build_object('token', v_t);
end $$;

-- يفحصه صفحة التحقق عند فتحها: هل الرمز صالح وكم ثانية يجب الانتظار؟
create or replace function check_session(p_token uuid) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_s sessions%rowtype; st settings%rowtype; v_c jsonb := _cycle(); v_age numeric;
begin
  select * into st from settings where id = 1;
  select * into v_s from sessions where token = p_token;
  if not found then return jsonb_build_object('valid', false, 'reason', 'invalid_token'); end if;
  if v_s.used then return jsonb_build_object('valid', false, 'reason', 'used'); end if;
  if v_s.round_id <> (v_c->>'round')::int
     or v_s.created_at < now() - make_interval(mins => st.token_ttl_minutes) then
    return jsonb_build_object('valid', false, 'reason', 'expired');
  end if;
  if not (v_c->>'is_open')::boolean then return jsonb_build_object('valid', false, 'reason', 'closed'); end if;
  v_age := extract(epoch from (now() - v_s.created_at));
  return jsonb_build_object('valid', true, 'wait_seconds', greatest(0, ceil(st.min_seconds - v_age))::int);
end $$;

-- تسجيل الـ ID: يُقبل فقط برمز صالح لم يُستخدم ومرّ عليه الوقت الأدنى
create or replace function submit_entry(p_token uuid, p_uid text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  v_s sessions%rowtype; st settings%rowtype; v_c jsonb := _cycle();
  v_uid text := trim(coalesce(p_uid, '')); v_ip text := _ip_hash();
  v_id bigint; v_no int;
begin
  select * into st from settings where id = 1;
  select * into v_s from sessions where token = p_token for update;
  if not found then raise exception 'invalid_token'; end if;
  if v_s.used then raise exception 'used'; end if;
  if v_s.round_id <> (v_c->>'round')::int
     or v_s.created_at < now() - make_interval(mins => st.token_ttl_minutes) then
    raise exception 'expired';
  end if;
  if not (v_c->>'is_open')::boolean then raise exception 'closed'; end if;
  if extract(epoch from (now() - v_s.created_at)) < st.min_seconds then raise exception 'too_fast'; end if;
  if v_uid !~ '^[0-9]{6,12}$' then raise exception 'invalid_uid'; end if;
  if v_ip is not null and (
       select count(*) from entries where round_id = v_s.round_id and ip_hash = v_ip
     ) >= st.max_per_ip then
    raise exception 'ip_limit';
  end if;

  begin
    insert into entries (round_id, uid, ip_hash) values (v_s.round_id, v_uid, v_ip) returning id into v_id;
  exception when unique_violation then
    raise exception 'duplicate';
  end;

  update sessions set used = true where token = p_token;
  select count(*) into v_no from entries where round_id = v_s.round_id and id <= v_id;
  return jsonb_build_object('entry_no', v_no, 'masked', mask_uid(v_uid), 'round', v_s.round_id);
end $$;

-- النتائج المنشورة (أسماء مخفية جزئياً)
create or replace function public_winners(p_rounds int default 5) returns jsonb
language sql stable security definer set search_path = public, extensions as $$
  select coalesce(jsonb_agg(q.x order by (q.x->>'round_id')::int desc), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'round_id',      r.round_id,
      'starts_at',     s.cycle_anchor + make_interval(secs => r.round_id * (s.open_hours + s.gap_hours) * 3600.0),
      'published_at',  r.published_at,
      'entries_count', r.entries_count,
      'entries_hash',  r.entries_hash,
      'seed',          r.seed,
      'drawn_at',      r.drawn_at,
      'total_prizes',  r.total_prizes,
      'winners', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'rank', w.rank, 'masked_uid', w.masked_uid, 'reward', w.reward, 'paid', w.paid_at is not null
               ) order by w.rank)
        from winners w where w.round_id = r.round_id
      ), '[]'::jsonb)
    ) as x
    from rounds r cross join settings s
    where s.id = 1 and r.published_at is not null
    order by r.round_id desc
    limit greatest(1, least(p_rounds, 30))
  ) q
$$;

-- قائمة المشاركين المخفية جزئياً (بنفس ترتيب التسجيل) لجولة تم نشرها فقط
create or replace function public_entries(p_round int) returns jsonb
language sql stable security definer set search_path = public, extensions as $$
  select case
    when exists (select 1 from rounds where round_id = p_round and published_at is not null)
    then coalesce((select jsonb_agg(mask_uid(uid) order by id) from entries where round_id = p_round), '[]'::jsonb)
    else '[]'::jsonb
  end
$$;

-- =====================================================================
-- دوال الإدارة (تتطلب تسجيل دخول مستخدم موجود في جدول admins)
-- =====================================================================
create or replace function admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  perform _require_admin();
  return jsonb_build_object(
    'cycle', _cycle(),
    'rounds', coalesce((
      select jsonb_agg(q.x order by (q.x->>'round_id')::int desc) from (
        select jsonb_build_object(
          'round_id', e.round_id, 'entries', e.n,
          'published', r.published_at is not null, 'drawn', r.drawn_at is not null,
          'entries_hash', r.entries_hash, 'seed', r.seed,
          'winners', coalesce(p.total, 0), 'paid', coalesce(p.paid, 0)
        ) as x
        from (select round_id, count(*) n from entries group by round_id order by round_id desc limit 14) e
        left join rounds r on r.round_id = e.round_id
        left join (select round_id, count(*) total, count(paid_at) paid from winners group by round_id) p
               on p.round_id = e.round_id
      ) q), '[]'::jsonb)
  );
end $$;

-- الخطوة 1: تجميد القائمة ونشر بصمتها قبل معرفة البذرة
create or replace function admin_publish(p_round int) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare v_c jsonb := _cycle(); v_n int; v_hash text;
begin
  perform _require_admin();
  if p_round > (v_c->>'round')::int or (p_round = (v_c->>'round')::int and (v_c->>'is_open')::boolean) then
    raise exception 'round_open';
  end if;
  if exists (select 1 from rounds where round_id = p_round and published_at is not null) then
    raise exception 'already_published';
  end if;
  select count(*), encode(digest(string_agg(mask_uid(uid), E'\n' order by id), 'sha256'), 'hex')
    into v_n, v_hash from entries where round_id = p_round;
  if v_n = 0 then raise exception 'no_entries'; end if;
  insert into rounds (round_id, published_at, entries_count, entries_hash)
  values (p_round, now(), v_n, v_hash)
  on conflict (round_id) do update
    set published_at = now(), entries_count = excluded.entries_count, entries_hash = excluded.entries_hash;
  return jsonb_build_object('entries', v_n, 'hash', v_hash);
end $$;

-- الخطوة 2: السحب بصيغة معلنة وقابلة للتحقق
--   k = int(SHA256(seed + ":" + i).hex[0:12]) mod len(remaining)
create or replace function admin_draw(p_round int, p_seed text) returns jsonb
language plpgsql volatile security definer set search_path = public, extensions as $$
declare
  v_r rounds%rowtype; s settings%rowtype; v_seed text := trim(coalesce(p_seed, ''));
  v_hash text; v_ids bigint[]; v_total int; v_n int; v_i int; v_j int; v_k int;
  v_h bytea; v_val bigint; v_pick bigint; v_reward numeric; v_sum numeric := 0;
begin
  perform _require_admin();
  if length(v_seed) < 8 then raise exception 'bad_seed'; end if;
  select * into v_r from rounds where round_id = p_round for update;
  if not found or v_r.published_at is null then raise exception 'not_published'; end if;
  if v_r.drawn_at is not null then raise exception 'already_drawn'; end if;
  select * into s from settings where id = 1;

  select encode(digest(string_agg(mask_uid(uid), E'\n' order by id), 'sha256'), 'hex')
    into v_hash from entries where round_id = p_round;
  if v_hash is distinct from v_r.entries_hash then raise exception 'hash_mismatch'; end if;

  select array_agg(id order by id) into v_ids from entries where round_id = p_round;
  select max((e->>'to')::int) into v_total from jsonb_array_elements(s.prizes) e;
  v_n := least(v_total, coalesce(array_length(v_ids, 1), 0));

  for v_i in 0 .. v_n - 1 loop
    v_h := digest(v_seed || ':' || v_i::text, 'sha256');
    v_val := 0;
    for v_j in 0 .. 5 loop v_val := v_val * 256 + get_byte(v_h, v_j); end loop;
    v_k    := (v_val % array_length(v_ids, 1))::int;          -- موضع من 0
    v_pick := v_ids[v_k + 1];
    v_ids  := v_ids[1:v_k] || v_ids[v_k + 2:array_length(v_ids, 1)];   -- حذف الفائز من المتبقين

    select (e->>'each')::numeric into v_reward
      from jsonb_array_elements(s.prizes) e
     where v_i + 1 between (e->>'from')::int and (e->>'to')::int limit 1;

    insert into winners (round_id, rank, entry_id, uid, masked_uid, reward)
    select p_round, v_i + 1, id, uid, mask_uid(uid), coalesce(v_reward, 0) from entries where id = v_pick;
    v_sum := v_sum + coalesce(v_reward, 0);
  end loop;

  update rounds set seed = v_seed, drawn_at = now(), total_prizes = v_sum where round_id = p_round;
  return jsonb_build_object('winners', v_n, 'total', v_sum);
end $$;

create or replace function admin_winners(p_round int) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  perform _require_admin();
  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'rank', rank, 'uid', uid, 'masked_uid', masked_uid, 'reward', reward, 'paid_at', paid_at
           ) order by rank)
    from winners where round_id = p_round), '[]'::jsonb);
end $$;

create or replace function admin_mark_paid(p_round int, p_ranks int[] default null) returns int
language plpgsql volatile security definer set search_path = public, extensions as $$
declare v_n int;
begin
  perform _require_admin();
  update winners set paid_at = now()
   where round_id = p_round and paid_at is null and (p_ranks is null or rank = any (p_ranks));
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- تنظيف الرموز القديمة (اختياري، يمكن جدولته بـ pg_cron)
create or replace function cleanup_sessions() returns void
language sql volatile security definer set search_path = public as $$
  delete from sessions where created_at < now() - interval '3 days'
$$;

-- =====================================================================
-- الصلاحيات: الجداول مغلقة، والدوال العامة فقط مفتوحة
-- =====================================================================
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant execute on function get_status(), start_session(), check_session(uuid),
                          submit_entry(uuid, text), public_winners(int), public_entries(int)
  to anon, authenticated;

grant execute on function is_admin(), admin_overview(), admin_publish(int), admin_draw(int, text),
                          admin_winners(int), admin_mark_paid(int, int[])
  to authenticated;
