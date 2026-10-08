import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import CandidateStatusBadge from '../components/CandidateStatus';
import {
  ArrowLeft,
  Search,
  Eye,
  AlertCircle,
  Loader2,
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
        setData((prev) => ({
          ...prev,
          applications: prev.applications.map((app) =>
            app._id === applicationId ? { ...app, status: newStatus } : app
          ),
        }));
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                Candidate pipeline
              </h1>
              {data.job && (
                <span className="font-mono text-xs text-ink bg-paper px-2 py-0.5 rounded-[4px] border border-line">
                  {data.job.employmentType}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              Submissions for <strong className="text-ink font-semibold">{data.job?.title}</strong>
            </p>
          </div>
        </div>

        {data.job?.slug && (
          <button
            onClick={handleCopyPublicLink}
            className="btn-secondary btn-compact self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-ink stroke-[2]" />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[1.5]" />
                <span>Copy application link</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-[12px] border border-line p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
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
              className={`h-[36px] px-3.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-2 ${
                statusFilter === tab.key
                  ? 'bg-ink text-paper'
                  : 'bg-paper hover:bg-paper-2 text-ink border border-line'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-[4px] ${
                  statusFilter === tab.key ? 'bg-[#202022] text-paper' : 'bg-paper-2 text-muted'
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
            className="bf-input h-[36px] pl-9 pr-3 text-xs w-full"
          />
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5 stroke-[1.5]" />
        </form>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-[12px] border border-line overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
              Loading candidates...
            </p>
          </div>
        ) : data.applications.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto">
            <h3 className="text-base font-bold text-ink">No applications yet</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Share your public application link with candidates to start receiving submissions.
            </p>
            {data.job?.slug && (
              <div className="mt-5">
                <button
                  onClick={handleCopyPublicLink}
                  className="btn-primary btn-compact"
                >
                  <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Copy application link</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left">
              <thead className="bg-paper text-[11px] font-mono uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="py-3.5 px-6 font-normal">Candidate</th>
                  <th className="py-3.5 px-4 font-normal">Contact</th>
                  <th className="py-3.5 px-4 font-normal">Submitted</th>
                  <th className="py-3.5 px-4 font-normal">State</th>
                  <th className="py-3.5 px-6 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[14px]">
                {data.applications.map((app) => {
                  const isUpdating = actionLoadingId === app._id;

                  return (
                    <tr key={app._id} className="hover:bg-paper/40 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/dashboard/applications/${app._id}`}
                          className="font-bold text-ink hover:underline block"
                        >
                          {app.fullName}
                        </Link>
                        {app.answers && app.answers.length > 0 && (
                          <div className="text-xs text-muted mt-0.5 line-clamp-1">
                            <span className="font-medium text-ink">{app.answers[0].label}: </span>
                            <span>{Array.isArray(app.answers[0].answer) ? app.answers[0].answer.join(', ') : String(app.answers[0].answer)}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-muted">
                        <div className="text-ink font-medium">{app.email}</div>
                        <div className="font-mono text-[11px] mt-0.5">{app.phone}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-muted">
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <CandidateStatusBadge status={app.status} />
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="btn-secondary btn-compact"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>View</span>
                          </Link>

                          {app.status !== 'shortlisted' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                              disabled={isUpdating}
                              title="Shortlist applicant"
                              className="btn-primary-dark btn-compact"
                            >
                              <span>Shortlist</span>
                            </button>
                          )}

                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(app._id, 'rejected')}
                              disabled={isUpdating}
                              title="Reject applicant"
                              className="btn-secondary btn-compact text-muted hover:text-red-700 hover:border-red-600"
                            >
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
