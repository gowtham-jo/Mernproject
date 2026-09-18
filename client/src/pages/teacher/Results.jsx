import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, Search } from 'lucide-react';
import quizService from '../../services/quizService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';

export const TeacherResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await quizService.getResults();
        setResults(res.data.results || []);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filtered = results.filter((r) => {
    const studentName = r.student?.name?.toLowerCase().includes(search.toLowerCase());
    const quizTitle = r.quiz?.title?.toLowerCase().includes(search.toLowerCase());
    return studentName || quizTitle;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Quiz Submissions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time examination marks and pass/fail evaluations
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchBar
            placeholder="Search student or quiz..."
            value={search}
            onSearch={(val) => setSearch(val)}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading quiz evaluations..." />
      ) : filtered.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Assessment Quiz
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Submitted Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={res.student?.profileImage}
                          name={res.student?.name}
                          size="sm"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{res.student?.name}</h4>
                          <p className="text-[10px] text-slate-400">{res.student?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {res.quiz?.title || 'Course Quiz'}
                    </td>

                    <td className="px-6 py-4 text-xs font-black text-slate-900">
                      {res.score} / {res.totalMarks}
                    </td>

                    <td className="px-6 py-4 text-xs font-black text-blue-600">
                      {res.percentage}%
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={res.passed ? 'green' : 'rose'} size="sm" dot>
                        {res.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(res.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Award}
          title="No submissions recorded"
          description="Student quiz submissions will automatically stream in here."
        />
      )}
    </div>
  );
};

export default TeacherResults;
