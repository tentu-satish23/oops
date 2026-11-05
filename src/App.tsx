import React, { useState } from 'react';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { Navbar } from './components/navbar/Navbar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProblemLibrary } from './components/library/ProblemLibrary';
import { CodingWorkspace } from './components/workspace/CodingWorkspace';
import { ContestsPage } from './components/contests/ContestsPage';
import { CoursesPage } from './components/courses/CoursesPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { SearchModal } from './components/search/SearchModal';
import { User } from './types';

export const App: React.FC = () => {
  // Current authenticated user
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('oracle_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Top-level application view: 'landing' | 'auth' | 'app'
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('landing') === 'true') return 'landing';
    const saved = localStorage.getItem('oracle_user');
    if (saved) return 'app';
    return 'landing'; // Default to the Landing Page!
  });

  // Auth initial mode ('login' | 'signup')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Active navigation tab inside authenticated app
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Currently open problem slug for coding workspace
  const [activeProblemSlug, setActiveProblemSlug] = useState<string | null>(null);

  // Contest / Course target navigation
  const [targetContestSlug, setTargetContestSlug] = useState<string | null>(null);
  const [targetCourseSlug, setTargetCourseSlug] = useState<string | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('oracle_user');
    localStorage.removeItem('oracle_token');
    setUser(null);
    setView('landing');
  };

  const handleOpenProblem = (slug: string) => {
    setActiveProblemSlug(slug);
    setActiveTab('workspace');
  };

  const handleOpenContest = (slug: string) => {
    setTargetContestSlug(slug);
    setActiveTab('contests');
  };

  const handleOpenCourse = (slug: string) => {
    setTargetCourseSlug(slug);
    setActiveTab('courses');
  };

  // 1. PUBLIC LANDING PAGE (Features the seamless aesthetic video showcase)
  if (view === 'landing') {
    return (
      <LandingPage
        onEnterAuth={(mode = 'login') => {
          setAuthMode(mode);
          setView('auth');
        }}
        onExploreProblems={() => {
          if (user) {
            setActiveTab('library');
            setView('app');
          } else {
            setAuthMode('login');
            setView('auth');
          }
        }}
        isLoggedIn={!!user}
        onGoToDashboard={() => setView('app')}
      />
    );
  }

  // 2. AUTHENTICATION SCREEN (Login & Registration)
  if (view === 'auth' || !user) {
    return (
      <AuthPage
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => setView('landing')}
        initialMode={authMode}
      />
    );
  }

  // 3. AUTHENTICATED PLATFORM (Dashboard, Library, Workspace, Courses, Contests, Profile)
  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#F89820]/30 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'workspace') setActiveProblemSlug(null);
        }}
        user={user}
        onLogout={handleLogout}
        onOpenSearch={() => setIsSearchOpen(true)}
        onReplayIntro={() => setView('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            onOpenProblem={handleOpenProblem}
            onOpenCourse={handleOpenCourse}
            onOpenContest={handleOpenContest}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'library' && (
          <ProblemLibrary onOpenProblem={handleOpenProblem} />
        )}

        {activeTab === 'workspace' && (
          <CodingWorkspace
            slug={activeProblemSlug || 'two-sum'}
            onNavigateProblem={handleOpenProblem}
            onBackToLibrary={() => setActiveTab('library')}
          />
        )}

        {activeTab === 'contests' && (
          <ContestsPage
            initialContestSlug={targetContestSlug}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesPage
            initialCourseSlug={targetCourseSlug}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onLogout={handleLogout}
            onOpenProblem={handleOpenProblem}
            onOpenCourse={handleOpenCourse}
            onReplayIntro={() => setView('landing')}
          />
        )}
      </main>

      {/* Global Cmd+K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProblem={handleOpenProblem}
        onSelectCourse={handleOpenCourse}
      />
    </div>
  );
};

export default App;
