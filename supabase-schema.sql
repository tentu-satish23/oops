-- ====================================================================
-- OOP'S ORACLE: Production Supabase PostgreSQL Schema
-- Tagline: Master Java. Master Logic. Build Your Future.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT 'Passionate Java Developer solving algorithms on OOP''S ORACLE',
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROBLEMS TABLE (500+ Curated Java Problems)
CREATE TABLE IF NOT EXISTS public.problems (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    company_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    acceptance_rate NUMERIC(5,2) DEFAULT 65.5,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT[] DEFAULT ARRAY[]::TEXT[],
    starter_code TEXT NOT NULL,
    hints TEXT[] DEFAULT ARRAY[]::TEXT[],
    editorial TEXT DEFAULT '',
    time_limit_ms INT DEFAULT 2000,
    memory_limit_mb INT DEFAULT 256,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROBLEM TEST CASES TABLE
CREATE TABLE IF NOT EXISTS public.problem_test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    is_hidden BOOLEAN DEFAULT FALSE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    explanation TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'java',
    status TEXT NOT NULL, -- Accepted, Wrong Answer, TLE, Runtime Error, etc.
    runtime_ms INT,
    memory_kb INT,
    test_cases_passed INT DEFAULT 0,
    total_test_cases INT DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    price_inr NUMERIC(10,2) DEFAULT 5.00,
    total_lessons INT DEFAULT 0,
    difficulty TEXT DEFAULT 'Beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INT NOT NULL,
    duration_minutes INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COURSE PURCHASES
CREATE TABLE IF NOT EXISTS public.course_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    is_simulation BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'captured',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 8. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 9. CONTESTS TABLE
CREATE TABLE IF NOT EXISTS public.contests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    problem_ids INT[] DEFAULT ARRAY[]::INT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CONTEST PARTICIPATIONS
CREATE TABLE IF NOT EXISTS public.contest_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id INT REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    rank INT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON public.submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems(topic);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);

-- RLS Policies (basic - adjust as needed)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert/select their submissions
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);

-- Public read for problems, courses, contests (adjust if needed)
-- Note: For production, refine RLS further.
