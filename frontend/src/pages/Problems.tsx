import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, ShieldAlert, Loader2, Play } from 'lucide-react';
import api from '../api/api.service';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const Problems: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProblems = async (query: string = '') => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (query.trim()) {
        response = await api.get(`/problems/search?query=${encodeURIComponent(query)}`);
      } else {
        response = await api.get('/problems');
      }

      if (response.data?.success && Array.isArray(response.data?.data)) {
        setProblems(response.data.data);
      } else {
        setProblems([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch problem set. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProblems();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems(searchQuery);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    fetchProblems('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this problem? This action is irreversible.')) {
      return;
    }

    try {
      const response = await api.delete(`/problems/${id}`);
      if (response.data?.success) {
        setProblems((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unauthorized or failed to delete problem.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-darkBg p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-darkBorder pb-6">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-tight text-white uppercase">PROBLEM_SET</h1>
            <p className="text-xs text-text-secondary mt-1 font-mono uppercase">SOLVE CHALLENGES AND ACCUMULATE TECHNICAL PROWESS</p>
          </div>
          
          {user && (
            <Link
              to="/problems/create"
              className="flex items-center gap-2 bg-brandBlue hover:bg-[#2563eb] text-white px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider transition-colors duration-150 border border-brandBlue hover:border-[#2563eb] cursor-pointer"
            >
              <Plus size={16} />
              <span>CREATE_PROBLEM</span>
            </Link>
          )}
        </div>

        {/* Search Panel */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-darkPanel border border-darkBorder p-3">
          <div className="relative flex-grow flex items-center">
            <Search className="absolute left-3 text-text-disabled" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH PROBLEMS BY TITLE, DIFFICULTY, OR DESCRIPTION..."
              className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-xs text-white placeholder-text-disabled outline-none font-mono tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-darkBg border border-darkBorder hover:border-brandBlue text-[#f3f4f6] font-mono font-bold text-xs uppercase hover:text-white transition-colors duration-150 cursor-pointer"
          >
            QUERY
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="px-4 py-2.5 bg-brandRed/10 border border-brandRed text-brandRed font-mono font-bold text-xs uppercase hover:bg-brandRed hover:text-white transition-colors duration-150 cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </form>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-2 bg-brandRed/10 border border-brandRed text-brandRed p-4 text-xs font-mono">
            <ShieldAlert size={18} className="shrink-0" />
            <div>
              <span className="font-bold">SYSTEM_ERROR:</span> {error.toUpperCase()}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-darkBorder bg-darkPanel text-text-secondary">
            <Loader2 size={36} className="animate-spin text-brandBlue mb-4" />
            <span className="font-mono text-xs uppercase tracking-widest">LOADING PROBLEMS FROM ARENA...</span>
          </div>
        ) : problems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 border border-dashed border-darkBorder bg-darkPanel/50">
            <span className="font-mono text-sm text-text-disabled uppercase">NO PROBLEMS DEPLOYED IN THIS VECTOR AT THIS TIME</span>
          </div>
        ) : (
          /* Problems Data Table */
          <div className="border border-darkBorder bg-darkPanel overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-darkHeader border-b border-darkBorder text-text-secondary font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6">PROBLEM TITLE</th>
                  <th className="py-4 px-6">DIFFICULTY</th>
                  {user && <th className="py-4 px-6 text-right">ADMIN ACTIONS</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder">
                {problems.map((prob) => {
                  // Difficulty Badge styles
                  let diffColor = 'text-brandGreen bg-brandGreen/10 border-brandGreen';
                  if (prob.difficulty === 'Medium') {
                    diffColor = 'text-brandAmber bg-brandAmber/10 border-brandAmber';
                  } else if (prob.difficulty === 'Hard') {
                    diffColor = 'text-brandRed bg-brandRed/10 border-brandRed';
                  }

                  return (
                    <tr 
                      key={prob._id} 
                      className="hover:bg-darkHeader/50 transition-colors duration-150"
                    >
                      {/* Solve Status Icon - Flat Placeholder for elegance */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block w-2.5 h-2.5 bg-darkBorder border border-text-disabled"></span>
                      </td>

                      {/* Title Link */}
                      <td className="py-4 px-6 font-semibold text-white whitespace-nowrap">
                        <Link 
                          to={`/problems/${prob._id}`}
                          className="hover:text-brandBlue transition-colors duration-150 flex items-center gap-2 group"
                        >
                          <Play size={10} className="text-brandBlue opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                          <span>{prob.title.toUpperCase()}</span>
                        </Link>
                      </td>

                      {/* Difficulty Level */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Admin controls */}
                      {user && (
                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                          <Link
                            to={`/problems/${prob._id}/edit`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-darkBorder bg-darkBg text-text-secondary hover:text-[#f3f4f6] hover:border-brandBlue transition-colors duration-150"
                          >
                            <Edit2 size={10} />
                            <span>EDIT</span>
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(prob._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border border-brandRed bg-brandRed/10 text-brandRed hover:bg-brandRed hover:text-white transition-colors duration-150 cursor-pointer"
                          >
                            <Trash2 size={10} />
                            <span>DELETE</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Problems;
