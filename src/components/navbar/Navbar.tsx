import React, { useState } from 'react';
import { Coffee, Search, Bell, Moon, Sun, Flame, LogOut, Film, User as UserIcon, BookOpen, Trophy, Code, LayoutDashboard } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onOpenSearch: () => void;
  onReplayIntro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  onOpenSearch,
  onReplayIntro,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const notifications = [
    { id: 1, title: 'Daily Speed Sprint Active', time: '12m ago', unread: true },
    { id: 2, title: 'Weekly Contest #28 starts tomorrow', time: '2h ago', unread: true },
    { id: 3, title: 'Your Java 17 solution for Two Sum was accepted!', time: '1d ago', unread: false },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Library', icon: Code },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B1120]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* LEFT: Brand Logo & Navigation Links */}
        <div className="flex items-center space-x-6">
          {/* Logo with Official Brand Photo */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center space-x-2.5 group focus:outline-none"
          >
            <img
              src="/logo.png"
              alt="OOP'S ORACLE"
              className="w-9 h-9 rounded-lg object-cover shadow-glow-orange border border-[#F89820]/40 group-hover:scale-105 transition duration-200"
            />
            <div className="text-left">
              <span className="text-sm font-extrabold tracking-wider font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#F89820]">
                OOP'S ORACLE
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium font-mono transition-colors ${
                    isActive
                      ? 'bg-[#151F32] text-[#F89820] border border-[#F89820]/30 shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIGHT: Search, Notifications, Theme, User Profile */}
        <div className="flex items-center space-x-3">

          {/* Global Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#151F32] hover:bg-[#1B263B] text-[#94A3B8] hover:text-[#F8FAFC] border border-white/5 text-xs font-mono transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search problems (500+)...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-black/40 rounded border border-white/10 text-gray-400">
              Ctrl K
            </kbd>
          </button>

          {/* Streak Flame Badge */}
          {user && (
            <div
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#F89820]/10 border border-[#F89820]/30 text-[#F89820] text-xs font-mono font-semibold"
              title={`${user.currentStreak} day coding streak!`}
            >
              <Flame className="w-3.5 h-3.5 text-[#F89820] fill-[#F89820] animate-bounce" />
              <span>{user.currentStreak}d</span>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md hover:bg-white/5 text-[#94A3B8] hover:text-white transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#F89820] absolute top-1 right-1" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl p-3 shadow-2xl border border-white/10 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-mono font-semibold text-white">Notifications</span>
                  <span className="text-[10px] font-mono text-[#F89820]">Mark all read</span>
                </div>
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2 px-1 text-xs hover:bg-white/5 rounded cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${n.unread ? 'text-white' : 'text-gray-400'}`}>{n.title}</span>
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#F89820]" />}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Landing Page Button */}
          <button
            onClick={onReplayIntro}
            className="p-1.5 rounded-md hover:bg-white/5 text-[#94A3B8] hover:text-[#F89820] transition"
            title="View Public Landing Page"
          >
            <Film className="w-4 h-4" />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-1.5 rounded-md hover:bg-white/5 text-[#94A3B8] hover:text-white transition"
            title="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile & Account Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 focus:outline-none"
              >
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-[#F89820]/50 object-cover"
                />
                <span className="hidden sm:inline-block text-xs font-mono font-medium text-white max-w-[100px] truncate">
                  {user.username}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl p-2 shadow-2xl border border-white/10 z-50">
                  <div className="px-3 py-2 border-b border-white/5">
                    <div className="text-xs font-semibold text-white truncate">{user.fullName}</div>
                    <div className="text-[11px] font-mono text-gray-400 truncate">@{user.username}</div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSelectTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-md transition"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>My Profile & Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        onReplayIntro();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-[#F89820] hover:bg-[#F89820]/10 rounded-md transition"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>View Landing Page</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-[#0B1120]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-mono ${
                isActive ? 'text-[#F89820]' : 'text-[#94A3B8]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
