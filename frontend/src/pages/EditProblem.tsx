import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Plus, Trash2, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import api from '../api/api.service';

interface ITestCase {
  input: string;
  output: string;
}

const EditProblem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [editorial, setEditorial] = useState('');
  const [testCases, setTestCases] = useState<ITestCase[]>([{ input: '', output: '' }]);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current problem details on mount
  useEffect(() => {
    const fetchProblem = async () => {
      setPageLoading(true);
      setError(null);
      try {
        const response = await api.get(`/problems/${id}`);
        if (response.data?.success && response.data?.data) {
          const prob = response.data.data;
          setTitle(prob.title);
          setDescription(prob.description);
          setDifficulty(prob.difficulty || 'Easy');
          setEditorial(prob.editorial || '');
          if (Array.isArray(prob.testCases) && prob.testCases.length > 0) {
            setTestCases(prob.testCases);
          }
        } else {
          setError('Could not retrieve problem details.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Problem service unavailable.');
      } finally {
        setPageLoading(false);
      }
    };

    if (id) fetchProblem();
  }, [id]);

  // Handle adding a test case entry
  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, { input: '', output: '' }]);
  };

  // Handle removing a testcase entry
  const handleRemoveTestCase = (index: number) => {
    if (testCases.length === 1) {
      alert('At least one testcase is required.');
      return;
    }
    setTestCases((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle value modifications
  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core Client Validations
    if (title.length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (description.length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }
    if (editorial && editorial.length < 10) {
      setError('Editorial must be at least 10 characters if provided.');
      return;
    }

    // Ensure all testcases have input/output
    const hasEmptyTestcases = testCases.some((tc) => !tc.input.trim() || !tc.output.trim());
    if (hasEmptyTestcases) {
      setError('All testcases must have non-empty inputs and outputs.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        title,
        description,
        difficulty,
        editorial: editorial || undefined,
        testCases
      };

      const response = await api.put(`/problems/${id}`, payload);

      if (response.data?.success) {
        setSuccess('Problem details updated successfully!');
        setTimeout(() => {
          navigate('/problems');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update problem. Verify authentication credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-darkBg text-text-secondary font-mono text-xs">
        <Loader2 size={36} className="animate-spin text-brandBlue mb-4" />
        <span className="uppercase tracking-widest">PULLING DATABASE RECORDS FOR WORKSPACE...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-darkBg p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="border-b border-darkBorder pb-6">
          <h1 className="text-3xl font-mono font-bold tracking-tight text-white uppercase">EDIT_CHALLENGE</h1>
          <p className="text-xs text-text-secondary mt-1 font-mono uppercase">MODIFIY METADATA AND COMPILE TEMPLATES FOR PUZZLE ID: {id}</p>
        </div>

        {/* Messaging Feedback */}
        {error && (
          <div className="flex items-start gap-2 bg-brandRed/10 border border-brandRed text-brandRed p-4 text-xs font-mono">
            <ShieldAlert className="shrink-0" size={18} />
            <div>
              <span className="font-bold">UPDATE_ERROR:</span> {error.toUpperCase()}
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 bg-brandGreen/10 border border-brandGreen text-brandGreen p-4 text-xs font-mono">
            <CheckCircle className="shrink-0" size={18} />
            <div>
              <span className="font-bold">SYSTEM_SUCCESS:</span> {success.toUpperCase()}
            </div>
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-darkPanel border border-darkBorder p-6 space-y-6">
            
            {/* Title & Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block font-bold text-text-secondary uppercase">CHALLENGE_TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.G. TWO SUM"
                  className="w-full bg-darkBg border border-darkBorder focus:border-brandBlue text-[#f3f4f6] px-3 py-2 text-sm uppercase"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-text-secondary uppercase">DIFFICULTY_INDEX</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className="w-full bg-darkBg border border-darkBorder focus:border-brandBlue text-[#f3f4f6] px-3 py-2 text-sm select-none"
                  disabled={loading}
                >
                  <option value="Easy">EASY</option>
                  <option value="Medium">MEDIUM</option>
                  <option value="Hard">HARD</option>
                </select>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="block font-bold text-text-secondary uppercase">DETAILED_DESCRIPTION (PLAIN TEXT OR MARKDOWN)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="EXPLAIN THE PROBLEM RULES, CONSTRAINTS, INPUT AND OUTPUT CONDITIONS..."
                rows={8}
                className="w-full bg-darkBg border border-darkBorder focus:border-brandBlue text-[#f3f4f6] p-3 text-sm font-sans"
                required
                disabled={loading}
              />
            </div>

            {/* Editorial Solution Textarea */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="block font-bold text-text-secondary uppercase">OFFICIAL_EDITORIAL (OPTIONAL)</label>
              <textarea
                value={editorial}
                onChange={(e) => setEditorial(e.target.value)}
                placeholder="PROVIDE EXPLANATIONS, ALGORITHMIC ANALYSIS, AND TIME COMPLEXITY DECOMPOSITION..."
                rows={5}
                className="w-full bg-darkBg border border-darkBorder focus:border-brandBlue text-[#f3f4f6] p-3 text-sm font-sans"
                disabled={loading}
              />
            </div>
          </div>

          {/* Testcases segment */}
          <div className="bg-darkPanel border border-darkBorder p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-darkBorder pb-3">
              <h3 className="font-mono text-sm font-bold text-white uppercase">PLATFORM_TESTCASES</h3>
              <button
                type="button"
                onClick={handleAddTestCase}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-darkBg hover:bg-darkHeader border border-darkBorder hover:border-brandBlue text-brandBlue transition-colors duration-150 cursor-pointer"
              >
                <Plus size={14} />
                <span>ADD_TEST_CASE</span>
              </button>
            </div>

            {/* Test Case Inputs Loop */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="bg-darkBg border border-darkBorder p-4 space-y-4 font-mono text-xs relative">
                  {/* Delete Testcase box */}
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-secondary uppercase">TEST_CASE_{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      disabled={loading || testCases.length === 1}
                      className="text-brandRed hover:text-white p-1 hover:bg-brandRed/20 border border-transparent hover:border-brandRed transition-all duration-150 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Input / Output entries */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-text-disabled uppercase">INPUT STDIN</label>
                      <textarea
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="E.G. [2,7,11,15]\n9"
                        rows={3}
                        className="w-full bg-darkPanel border border-darkBorder focus:border-brandBlue text-[#f3f4f6] p-2 text-xs"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-text-disabled uppercase">EXPECTED STDOUT</label>
                      <textarea
                        value={tc.output}
                        onChange={(e) => handleTestCaseChange(idx, 'output', e.target.value)}
                        placeholder="E.G. [0,1]"
                        rows={3}
                        className="w-full bg-darkPanel border border-darkBorder focus:border-brandBlue text-[#f3f4f6] p-2 text-xs"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 font-mono text-xs">
            <Link
              to="/problems"
              className="w-1/3 bg-darkPanel hover:bg-darkHeader border border-darkBorder text-[#f3f4f6] py-3 text-center font-bold uppercase transition-colors duration-150"
            >
              ABORT
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-brandBlue hover:bg-[#2563eb] text-white py-3 font-bold uppercase tracking-wider transition-colors duration-150 border border-brandBlue hover:border-[#2563eb] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SAVING_CHANGES...</span>
                </>
              ) : (
                <span>SAVE_PUZZLE_DETAILS</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditProblem;
