import React, { useState, useEffect } from 'react';
import { Search, X, Code, BookOpen, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Problem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (slug: string) => void;
  onSelectCourse: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  onSelectCourse
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.getProblems({ search: query, limit: 8 });
        setResults(res.problems || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#151F32] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0B1120]">
          <Search className="w-5 h-5 text-[#F89820] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search 500+ Java problems by title, topic, company, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
          />
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {loading && (
            <div className="py-8 text-center text-xs font-mono text-gray-400">
              Searching OOP'S ORACLE database...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="py-8 text-center text-xs font-mono text-gray-400">
              No problems found matching "{query}"
            </div>
          )}

          {!loading && results.map((prob) => {
            const diffColor =
              prob.difficulty === 'Easy'
                ? 'text-[#22C55E] bg-[#22C55E]/10'
                : prob.difficulty === 'Medium'
                ? 'text-[#F89820] bg-[#F89820]/10'
                : 'text-red-400 bg-red-500/10';

            return (
              <div
                key={prob.id}
                onClick={() => {
                  onSelectProblem(prob.slug);
                  onClose();
                }}
                className="p-3 hover:bg-[#1B263B] rounded-lg cursor-pointer flex items-center justify-between transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-md bg-[#0B1120] flex items-center justify-center text-xs font-mono font-bold text-gray-400 group-hover:text-[#F89820] transition">
                    #{prob.id}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[#F89820] transition">
                      {prob.title}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-mono mt-0.5">
                      <span>{prob.topic}</span>
                      <span>•</span>
                      <span>{prob.companyTags?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${diffColor}`}>
                    {prob.difficulty}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#0B1120] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
