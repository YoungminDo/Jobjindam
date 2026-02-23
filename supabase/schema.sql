-- ============================================
-- 취준진담 데이터베이스 스키마
-- Supabase Dashboard → SQL Editor에서 실행
-- ※ 몇 번을 재실행해도 안전합니다 (idempotent)
-- ============================================

-- 1. 사용자 프로필
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  profile_image_url text,
  target_job text,
  preparation_stage text check (preparation_stage in ('exploring', 'documents', 'interview', 'intern', 'offer')),
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 프로필 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. 카테고리
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_emoji text not null default '📌',
  color text not null default '#4A90E2',
  type text not null check (type in ('course', 'content', 'job')),
  "order" int not null default 0
);

-- 3. 강의
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  instructor_id uuid references profiles(id),
  instructor_name text not null,
  instructor_title text,
  category text not null,
  thumbnail_url text,
  max_students int not null default 30,
  current_students int not null default 0,
  start_date date not null,
  end_date date not null,
  duration_weeks int not null default 4,
  price int not null default 0,
  is_live boolean not null default false,
  syllabus jsonb default '[]'::jsonb,
  rating numeric(3,2) default 0,
  review_count int default 0,
  status text not null default 'recruiting' check (status in ('recruiting', 'closed', 'ongoing', 'finished')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. 수강 신청
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  status text not null default 'applied' check (status in ('applied', 'approved', 'completed', 'canceled')),
  payment_status text,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);

-- 5. 콘텐츠
create table if not exists contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  body text not null default '',
  author_id uuid references profiles(id),
  author_name text not null,
  author_title text,
  thumbnail_url text,
  category text not null,
  tags text[] default '{}',
  view_count int default 0,
  like_count int default 0,
  bookmark_count int default 0,
  is_featured boolean default false,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. 좋아요
create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  content_id uuid references contents(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, content_id)
);

-- 7. 북마크
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  content_id uuid references contents(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  content_type text not null check (content_type in ('content', 'course')),
  created_at timestamptz default now(),
  constraint bookmarks_unique_content unique(user_id, content_id),
  constraint bookmarks_unique_course unique(user_id, course_id)
);

-- 8. 채용 공고
create table if not exists job_postings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  title text not null,
  description text,
  job_type text not null check (job_type in ('newgrad', 'intern', 'experienced')),
  location text,
  deadline date not null,
  url text,
  thumbnail_url text,
  tags text[] default '{}',
  source text,
  is_active boolean default true,
  created_at timestamptz default now()
);
-- 기존 테이블에 thumbnail_url이 없으면 추가
DO $$ BEGIN
  alter table job_postings add column thumbnail_url text;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 9. 채팅방
create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dm', 'group')),
  name text,
  created_by uuid references profiles(id) not null,
  created_at timestamptz default now()
);

-- 10. 채팅방 참여자
create table if not exists chat_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 11. 메시지
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references chat_rooms(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  message_type text not null default 'text' check (message_type in ('text', 'file', 'image')),
  file_url text,
  created_at timestamptz default now()
);

-- 12. 멘토
create table if not exists mentors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique not null,
  company text not null,
  position text not null,
  years_of_experience int not null default 0,
  expertise text[] default '{}',
  introduction text,
  is_verified boolean default false,
  availability text,
  created_at timestamptz default now()
);

-- 13. 태그
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text not null default '📌',
  color text not null default '#4A90E2',
  "order" int not null default 0,
  created_at timestamptz default now()
);

-- 14. 콘텐츠-태그 관계
create table if not exists content_tags (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references contents(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  job_id uuid references job_postings(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 15. 홈 노출 우선순위 (인기강의, 추천콘텐츠, 마감임박채용)
create table if not exists featured_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('popular_courses', 'recommended_contents', 'urgent_jobs')),
  course_id uuid references courses(id) on delete cascade,
  content_id uuid references contents(id) on delete cascade,
  job_id uuid references job_postings(id) on delete cascade,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 16. 히어로 배너
create table if not exists hero_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_type text not null check (link_type in ('course', 'content', 'job', 'custom')),
  course_id uuid references courses(id) on delete set null,
  content_id uuid references contents(id) on delete set null,
  job_id uuid references job_postings(id) on delete set null,
  custom_url text,
  bg_color text default '#EBF2FF',
  text_color text default '#1a1a1a',
  focal_x int default 50,
  focal_y int default 50,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- 기존 hero_banners에 focal 컬럼이 없으면 추가
DO $$ BEGIN
  alter table hero_banners add column focal_x int default 50;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  alter table hero_banners add column focal_y int default 50;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 17. 어드민 역할
alter table profiles add column if not exists is_admin boolean default false;

-- admin_role 컬럼 추가 (이미 존재하면 무시)
DO $$ BEGIN
  alter table profiles add column admin_role text check (admin_role in ('pending', 'approved', 'rejected', 'super'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- RLS (Row Level Security) 정책
-- ※ DROP 후 CREATE → 재실행 안전
-- ============================================

-- profiles
alter table profiles enable row level security;
drop policy if exists "Public profiles" on profiles;
create policy "Public profiles" on profiles for select using (true);
drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
drop policy if exists "Users insert own profile" on profiles;
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- categories
alter table categories enable row level security;
drop policy if exists "Public categories" on categories;
create policy "Public categories" on categories for select using (true);

-- courses
alter table courses enable row level security;
drop policy if exists "Public courses" on courses;
create policy "Public courses" on courses for select using (true);

-- enrollments
alter table enrollments enable row level security;
drop policy if exists "Users view own enrollments" on enrollments;
create policy "Users view own enrollments" on enrollments for select using (auth.uid() = user_id);
drop policy if exists "Users create enrollments" on enrollments;
create policy "Users create enrollments" on enrollments for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own enrollments" on enrollments;
create policy "Users update own enrollments" on enrollments for update using (auth.uid() = user_id);

-- contents
alter table contents enable row level security;
drop policy if exists "Public contents" on contents;
create policy "Public contents" on contents for select using (true);

-- likes
alter table likes enable row level security;
drop policy if exists "Public likes count" on likes;
create policy "Public likes count" on likes for select using (true);
drop policy if exists "Users create likes" on likes;
create policy "Users create likes" on likes for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own likes" on likes;
create policy "Users delete own likes" on likes for delete using (auth.uid() = user_id);

-- bookmarks
alter table bookmarks enable row level security;
drop policy if exists "Users view own bookmarks" on bookmarks;
create policy "Users view own bookmarks" on bookmarks for select using (auth.uid() = user_id);
drop policy if exists "Users create bookmarks" on bookmarks;
create policy "Users create bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own bookmarks" on bookmarks;
create policy "Users delete own bookmarks" on bookmarks for delete using (auth.uid() = user_id);

-- job_postings
alter table job_postings enable row level security;
drop policy if exists "Public job_postings" on job_postings;
create policy "Public job_postings" on job_postings for select using (is_active = true);

-- chat_rooms
alter table chat_rooms enable row level security;
drop policy if exists "Participants view rooms" on chat_rooms;
create policy "Participants view rooms" on chat_rooms for select
  using (exists (select 1 from chat_participants where chat_participants.room_id = id and chat_participants.user_id = auth.uid()));
drop policy if exists "Auth users create rooms" on chat_rooms;
create policy "Auth users create rooms" on chat_rooms for insert with check (auth.uid() = created_by);

-- chat_participants
alter table chat_participants enable row level security;
drop policy if exists "Participants view participants" on chat_participants;
create policy "Participants view participants" on chat_participants for select
  using (exists (select 1 from chat_participants cp where cp.room_id = chat_participants.room_id and cp.user_id = auth.uid()));
drop policy if exists "Room creators add participants" on chat_participants;
create policy "Room creators add participants" on chat_participants for insert
  with check (auth.uid() = user_id or exists (select 1 from chat_rooms where id = room_id and created_by = auth.uid()));

-- messages
alter table messages enable row level security;
drop policy if exists "Participants view messages" on messages;
create policy "Participants view messages" on messages for select
  using (exists (select 1 from chat_participants where chat_participants.room_id = messages.room_id and chat_participants.user_id = auth.uid()));
drop policy if exists "Participants send messages" on messages;
create policy "Participants send messages" on messages for insert
  with check (auth.uid() = sender_id and exists (select 1 from chat_participants where chat_participants.room_id = messages.room_id and chat_participants.user_id = auth.uid()));

-- mentors
alter table mentors enable row level security;
drop policy if exists "Public verified mentors" on mentors;
create policy "Public verified mentors" on mentors for select using (is_verified = true);

-- tags
alter table tags enable row level security;
drop policy if exists "Public tags" on tags;
create policy "Public tags" on tags for select using (true);
drop policy if exists "Admin insert tags" on tags;
create policy "Admin insert tags" on tags for insert with check (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin update tags" on tags;
create policy "Admin update tags" on tags for update using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin delete tags" on tags;
create policy "Admin delete tags" on tags for delete using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

-- content_tags
alter table content_tags enable row level security;
drop policy if exists "Public content_tags" on content_tags;
create policy "Public content_tags" on content_tags for select using (true);
drop policy if exists "Admin manage content_tags" on content_tags;
create policy "Admin manage content_tags" on content_tags for all using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

-- featured_items
alter table featured_items enable row level security;
drop policy if exists "Public featured_items" on featured_items;
create policy "Public featured_items" on featured_items for select using (is_active = true);
drop policy if exists "Admin manage featured_items" on featured_items;
create policy "Admin manage featured_items" on featured_items for all using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

-- hero_banners
alter table hero_banners enable row level security;
drop policy if exists "Public hero_banners" on hero_banners;
create policy "Public hero_banners" on hero_banners for select using (is_active = true);
drop policy if exists "Admin insert hero_banners" on hero_banners;
create policy "Admin insert hero_banners" on hero_banners for insert with check (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin update hero_banners" on hero_banners;
create policy "Admin update hero_banners" on hero_banners for update using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin delete hero_banners" on hero_banners;
create policy "Admin delete hero_banners" on hero_banners for delete using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

-- 어드민용 courses/contents/job_postings CRUD 정책
drop policy if exists "Admin insert courses" on courses;
create policy "Admin insert courses" on courses for insert with check (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin update courses" on courses;
create policy "Admin update courses" on courses for update using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin delete courses" on courses;
create policy "Admin delete courses" on courses for delete using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

drop policy if exists "Admin insert contents" on contents;
create policy "Admin insert contents" on contents for insert with check (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin update contents" on contents;
create policy "Admin update contents" on contents for update using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin delete contents" on contents;
create policy "Admin delete contents" on contents for delete using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

drop policy if exists "Admin insert job_postings" on job_postings;
create policy "Admin insert job_postings" on job_postings for insert with check (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin update job_postings" on job_postings;
create policy "Admin update job_postings" on job_postings for update using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);
drop policy if exists "Admin delete job_postings" on job_postings;
create policy "Admin delete job_postings" on job_postings for delete using (
  exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
);

-- ============================================
-- Realtime 활성화 (채팅용)
-- ============================================
DO $$ BEGIN
  alter publication supabase_realtime add table messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Storage 버킷 (이미지 업로드용)
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'thumbnails',
  'thumbnails',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS: 누구나 읽기 가능
drop policy if exists "Public thumbnail read" on storage.objects;
create policy "Public thumbnail read" on storage.objects
  for select using (bucket_id = 'thumbnails');

-- Storage RLS: 어드민만 업로드 가능
drop policy if exists "Admin thumbnail upload" on storage.objects;
create policy "Admin thumbnail upload" on storage.objects
  for insert with check (
    bucket_id = 'thumbnails'
    and exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
  );

-- Storage RLS: 어드민만 삭제 가능
drop policy if exists "Admin thumbnail delete" on storage.objects;
create policy "Admin thumbnail delete" on storage.objects
  for delete using (
    bucket_id = 'thumbnails'
    and exists (select 1 from profiles where id = auth.uid() and admin_role in ('approved', 'super'))
  );
