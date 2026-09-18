import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import enrollmentService from '../../services/enrollmentService';
import chatService from '../../services/chatService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';

export const TeacherStudents = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await enrollmentService.getTeacherStudents();
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStartChat = async (studentId) => {
    try {
      await chatService.getOrCreateConversation(studentId);
      navigate('/teacher/messages');
    } catch (err) {
      toast.error('Could not initiate chat.');
    }
  };

  const filtered = enrollments.filter((e) => {
    const nameMatch = e.student?.name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = e.student?.email?.toLowerCase().includes(search.toLowerCase());
    const courseMatch = e.course?.title?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || courseMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enrolled Students</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor progress and communicate with students enrolled in your masterclasses
          </p>
        </div>

        <div className="w-full sm:w-64">
          <SearchBar
            placeholder="Search students or course..."
            value={search}
            onSearch={(val) => setSearch(val)}
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading enrolled students..." />
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
                    Course Enrolled
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Curriculum Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Enrolled Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Direct Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((enr) => (
                  <tr key={enr._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={enr.student?.profileImage}
                          name={enr.student?.name}
                          size="md"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {enr.student?.name || 'Student'}
                          </h4>
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
                      {new Date(enr.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartChat(enr.student?._id)}
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        <span>Message</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Students enrolled in your courses will be listed here."
        />
      )}
    </div>
  );
};

export default TeacherStudents;
