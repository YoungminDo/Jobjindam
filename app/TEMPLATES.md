# 재사용 가능한 MVP 템플릿

---

## 1. SaaS 템플릿

> 구독 기반 B2B/B2C 서비스

### 핵심 기능
- 사용자 인증 (이메일, OAuth)
- 구독/플랜 관리
- 대시보드
- 설정 페이지
- 관리자 패널

### 페이지 구조
```
/                    → 랜딩 페이지
/login               → 로그인
/signup              → 회원가입
/dashboard           → 메인 대시보드
/dashboard/settings  → 계정 설정
/pricing             → 요금제 페이지
/admin               → 관리자 (role 체크)
```

### DB 스키마
```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz default now()
);

-- 구독
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  plan text not null,
  status text default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

alter table subscriptions enable row level security;
create policy "Users can view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);
```

### 요청 예시
```
"[서비스명] SaaS 만들어줘.
핵심 기능: [도구/서비스 설명]
플랜: Free / Pro ($XX) / Enterprise ($XX)
타겟: [누구를 위한 건지]"
```

---

## 2. 커뮤니티 템플릿

> 사용자 간 소통이 핵심인 서비스

### 핵심 기능
- 게시글 작성/수정/삭제
- 댓글/대댓글
- 좋아요/북마크
- 카테고리/태그
- 사용자 프로필
- 검색

### 페이지 구조
```
/                    → 홈 (최신/인기 피드)
/login               → 로그인
/signup              → 회원가입
/posts               → 게시글 목록
/posts/[id]          → 게시글 상세
/posts/new           → 글쓰기
/profile/[id]        → 사용자 프로필
/profile/settings    → 프로필 설정
/search              → 검색
/category/[slug]     → 카테고리별 목록
```

### DB 스키마
```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text
);

-- 게시글
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  category_id uuid references categories(id),
  title text not null,
  content text not null,
  image_url text,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 댓글
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 좋아요
create table likes (
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- 북마크
create table bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- RLS
alter table profiles enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table posts enable row level security;
create policy "Public posts" on posts for select using (true);
create policy "Authors can insert" on posts for insert with check (auth.uid() = author_id);
create policy "Authors can update" on posts for update using (auth.uid() = author_id);
create policy "Authors can delete" on posts for delete using (auth.uid() = author_id);

alter table comments enable row level security;
create policy "Public comments" on comments for select using (true);
create policy "Auth users can comment" on comments for insert with check (auth.uid() = author_id);
create policy "Authors can delete own comments" on comments for delete using (auth.uid() = author_id);

alter table likes enable row level security;
create policy "Public likes" on likes for select using (true);
create policy "Auth users can like" on likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike" on likes for delete using (auth.uid() = user_id);

alter table bookmarks enable row level security;
create policy "Users see own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users can bookmark" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove bookmark" on bookmarks for delete using (auth.uid() = user_id);
```

### 요청 예시
```
"[분야] 커뮤니티 만들어줘.
타겟: [대상 사용자]
주요 기능: 글쓰기, 댓글, 좋아요
추가: [고유 기능]"
```

---

## 3. 이커머스 템플릿

> 상품 판매 중심 서비스

### 핵심 기능
- 상품 목록/상세
- 장바구니
- 주문/결제
- 주문 내역
- 상품 검색/필터
- 판매자 관리 (선택)

### 페이지 구조
```
/                        → 홈 (추천 상품, 카테고리)
/login                   → 로그인
/signup                  → 회원가입
/products                → 상품 목록
/products/[id]           → 상품 상세
/cart                    → 장바구니
/checkout                → 결제
/orders                  → 주문 내역
/orders/[id]             → 주문 상세
/profile                 → 내 정보
/admin/products          → 상품 관리 (관리자)
/admin/orders            → 주문 관리 (관리자)
```

### DB 스키마
```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  phone text,
  address text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text
);

-- 상품
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  name text not null,
  description text,
  price int not null,
  sale_price int,
  image_urls text[] default '{}',
  stock int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 장바구니
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity int default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- 주문
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  status text default 'pending'
    check (status in ('pending', 'paid', 'shipping', 'delivered', 'canceled')),
  total_amount int not null,
  shipping_address text not null,
  shipping_name text not null,
  shipping_phone text not null,
  created_at timestamptz default now()
);

-- 주문 상품
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  price int not null,
  quantity int not null
);

-- RLS
alter table profiles enable row level security;
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

alter table products enable row level security;
create policy "Public products" on products for select using (is_active = true);
create policy "Admin manage products" on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table cart_items enable row level security;
create policy "Users manage own cart" on cart_items for all using (auth.uid() = user_id);

alter table orders enable row level security;
create policy "Users view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users create orders" on orders for insert with check (auth.uid() = user_id);

alter table order_items enable row level security;
create policy "Users view own order items" on order_items for select
  using (exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid()));
```

### 요청 예시
```
"[상품 종류] 쇼핑몰 만들어줘.
판매 상품: [카테고리 나열]
결제: 토스페이먼츠 / 스트라이프
특이사항: [커스터마이징, 구독박스 등]"
```

---

## 4. 예약 시스템 템플릿

> 시간/날짜 기반 예약 서비스

### 핵심 기능
- 예약 가능 일정 조회
- 예약 생성/취소
- 예약 현황 대시보드
- 알림 (이메일/푸시)
- 리뷰/평점
- 제공자 관리

### 페이지 구조
```
/                            → 홈 (검색, 추천)
/login                       → 로그인
/signup                      → 회원가입
/providers                   → 제공자 목록
/providers/[id]              → 제공자 상세 + 예약
/bookings                    → 내 예약 목록
/bookings/[id]               → 예약 상세
/profile                     → 내 프로필
/provider/dashboard          → 제공자 대시보드
/provider/schedule           → 일정 관리
/provider/bookings           → 예약 관리
/admin                       → 관리자 패널
```

### DB 스키마
```sql
-- 사용자 프로필
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer'
    check (role in ('customer', 'provider', 'admin')),
  created_at timestamptz default now()
);

-- 제공자 정보
create table providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  business_name text not null,
  description text,
  category text,
  address text,
  image_urls text[] default '{}',
  rating numeric(3,2) default 0,
  review_count int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 서비스 (제공자가 제공하는 서비스 목록)
create table services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null,
  price int not null,
  is_active boolean default true
);

-- 가용 시간대
create table available_slots (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true
);

-- 예약
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  provider_id uuid references providers(id),
  service_id uuid references services(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'canceled', 'no_show')),
  total_price int not null,
  note text,
  created_at timestamptz default now()
);

-- 리뷰
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) unique,
  customer_id uuid references profiles(id),
  provider_id uuid references providers(id),
  rating int check (rating between 1 and 5),
  content text,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Users update own" on profiles for update using (auth.uid() = id);

alter table providers enable row level security;
create policy "Public active providers" on providers for select using (is_active = true);
create policy "Providers manage own" on providers for all using (auth.uid() = user_id);

alter table services enable row level security;
create policy "Public active services" on services for select using (is_active = true);
create policy "Providers manage own services" on services for all
  using (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()));

alter table available_slots enable row level security;
create policy "Public slots" on available_slots for select using (is_active = true);
create policy "Providers manage own slots" on available_slots for all
  using (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()));

alter table bookings enable row level security;
create policy "Customers view own bookings" on bookings for select using (auth.uid() = customer_id);
create policy "Providers view their bookings" on bookings for select
  using (exists (select 1 from providers where providers.id = provider_id and providers.user_id = auth.uid()));
create policy "Customers create bookings" on bookings for insert with check (auth.uid() = customer_id);

alter table reviews enable row level security;
create policy "Public reviews" on reviews for select using (true);
create policy "Customers write reviews" on reviews for insert with check (auth.uid() = customer_id);
```

### 요청 예시
```
"[분야] 예약 서비스 만들어줘.
예약 대상: [미용실, 병원, 스튜디오 등]
시간 단위: [30분/1시간/하루]
추가 기능: [결제, 리뷰, 알림 등]"
```

---

## 템플릿 활용법

1. **그대로 사용**: "SaaS 템플릿으로 [서비스] 만들어줘"
2. **조합 사용**: "커뮤니티 + 이커머스로 중고거래 만들어줘"
3. **확장 사용**: "예약 템플릿 기반으로 시작하고 [추가 기능] 넣어줘"
4. **커스텀**: 템플릿을 참고하되 완전히 새로운 구조로 요청
