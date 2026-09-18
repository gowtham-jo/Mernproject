import React, { useState, useEffect } from 'react';
import { FileCheck, Users, BookOpen, Search } from 'lucide-react';
import enrollmentService from '../../services/enrollmentService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';

export const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await enrollmentService.getAllEnrollments({ page, limit: 12 });
      setEnrollments(res.data.enrollments || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Enrollments</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit student enrollment records and course completion statuses ({totalCount} total)
        </p>
      </div>

      {loading ? (
        <Loader text="Loading enrollments..." />
      ) : enrollments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Enrolled Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Enrolled Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {enrollments.map((enr) => (
                  <tr key={enr._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={enr.student?.profileImage}
                          name={enr.student?.name}
                          size="md"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{enr.student?.name}</h4>
                          <p className="text-[11px] text-slate-400">{enr.student?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                      {enr.course?.title}
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>{enr.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${enr.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(enr.enrolledAt || enr.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Badge variant={enr.progress === 100 ? 'green' : 'blue'} size="sm" dot>
                        {enr.progress === 100 ? 'Completed' : 'In Progress'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <EmptyState
          icon={FileCheck}
          title="No enrollments recorded"
          description="Student enrollments will populate here."
        />
      )}
    </div>
  );
};

export default AdminEnrollments;
