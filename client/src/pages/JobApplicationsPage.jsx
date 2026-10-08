import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Search,
  Users,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

const JobApplicationsPage = () => {
  const { jobId } = useParams();

  const [data, setData] = useState({
    job: null,
    counts: { all: 0, applied: 0, shortlisted: 0, rejected: 0 },
    applications: [],
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get(`/jobs/${jobId}/applications`, { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setActionLoadingId(applicationId);
      const res = await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        // Update local state directly
        setData((prev) => ({
          ...prev,
          applications: prev.applications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          ),
          counts: {
            ...prev.counts,
            // refresh counts smoothly or refetch
          },
        }));
        // Re-fetch to sync counts accurately
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyPublicLink = () => {
    if (!data.job?.slug) return;
    const url = `${window.location.origin}/apply/${data.job.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'shortlisted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
            Shortlisted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
            Applied
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Candidate Applications
              </h1>
              {data.job && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {data.job.employmentType}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Reviewing applicants for <span className="font-semibold text-gray-800">{data.job?.title}</span>.
            </p>
          </div>
        </div>

        {data.job?.slug && (
          <button
            onClick={handleCopyPublicLink}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-500" />
                <span>Copy Application Link</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'all', label: 'All', count: data.counts.all },
            { key: 'applied', label: 'Applied', count: data.counts.applied },
            { key: 'shortlisted', label: 'Shortlisted', count: data.counts.shortlisted },
            { key: 'rejected', label: 'Rejected', count: data.counts.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                statusFilter === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search candidate or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading candidate applications...</p>
          </div>
        ) : data.applications.length === 0 ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No applications yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Share your public application link with candidates to start receiving submissions.
            </p>
            {data.job?.slug && (
              <div className="mt-5">
                <button
                  onClick={handleCopyPublicLink}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Public Link
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Application Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {data.applications.map((app) => {
                  const isUpdating = actionLoadingId === app._id;

                  return (
                    <tr key={app._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/dashboard/applications/${app._id}`}
                          className="font-semibold text-gray-900 hover:text-emerald-700 block"
                        >
                          {app.fullName}
                        </Link>
                        {/* Quick preview of experience or first answer if available */}
                        {app.answers && app.answers.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            <span className="font-medium text-gray-600">{app.answers[0].label}: </span>
                            <span>{Array.isArray(app.answers[0].answer) ? app.answers[0].answer.join(', ') : String(app.answers[0].answer)}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                        <div>{app.email}</div>
                        <div className="text-gray-400 mt-0.5">{app.phone}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>

                          {app.status !== 'shortlisted' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                              disabled={isUpdating}
                              title="Shortlist Candidate"
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Shortlist</span>
                            </button>
                          )}

                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'rejected')}
                              disabled={isUpdating}
                              title="Reject Candidate"
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
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

export default JobApplicationsPage;
