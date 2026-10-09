import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Globe,
  GlobeLock,
  Copy,
  Check,
  AlertCircle,
  MapPin,
  Loader2,
  Search,
  LayoutGrid,
  List,
  ArrowUpRight,
  Users,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    draftJobs: 0,
    totalApplications: 0,
    shortlistedCount: 0,
    reviewPendingCount: 0,
    shortlistRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  // Filtering & view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'applications', 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [jobsRes, statsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/stats/summary'),
      ]);

      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePublish = async (jobId, currentStatus) => {
    try {
      setActionLoadingId(jobId);
      const res = await api.patch(`/jobs/${jobId}/publish`);
      if (res.data.success) {
        const updatedStatus = res.data.data.status;
        setJobs((prev) =>
          prev.map((job) =>
            job._id === jobId ? { ...job, status: updatedStatus } : job
          )
        );
        showToast(
          updatedStatus === 'published'
            ? 'Job published to candidate link.'
            : 'Job reverted to private draft.'
        );

        const statsRes = await api.get('/jobs/stats/summary');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (
      !window.confirm(
        `Delete "${title}"? This permanently removes its application form and candidate submissions.`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(jobId);
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        showToast('Job and associated submissions deleted.');
        const statsRes = await api.get('/jobs/stats/summary');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/apply/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    showToast('Application link copied.');
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        if (statusFilter !== 'all' && job.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = job.title?.toLowerCase().includes(q);
          const matchCompany = job.companyName?.toLowerCase().includes(q);
          const matchLocation = job.location?.toLowerCase().includes(q);
          return matchTitle || matchCompany || matchLocation;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'applications') return (b.applicationCount || 0) - (a.applicationCount || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [jobs, statusFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 pb-16 font-sans text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-4 py-3 rounded-[8px] flex items-center gap-2.5 text-xs font-semibold border border-line animate-in fade-in duration-150">
          <span className="w-2 h-2 rounded-full bg-signal" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-[12px] border border-line p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {user?.companyName || 'Hiring Workspace'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-ink">
            Recruiter Overview
          </h1>
          <p className="text-[14px] text-muted mt-1 max-w-xl">
            {stats.publishedJobs} active postings receiving submissions. Manage postings, review candidates, and customize application forms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/dashboard/pipeline"
            className="btn-secondary btn-compact"
          >
            <Users className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Candidate Pipeline</span>
          </Link>

          <Link
            to="/dashboard/jobs/new"
            className="btn-primary btn-compact"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span>Create job</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics: 4 Structured Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Postings */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Total Postings
          </span>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {stats.totalJobs}
          </div>
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <span className="font-semibold text-ink">{stats.publishedJobs} published</span>
            <span>&bull;</span>
            <span>{stats.draftJobs || 0} drafts</span>
          </div>
        </div>

        {/* Total Applicants */}
        <Link
          to="/dashboard/pipeline"
          className="bg-white p-5 rounded-[12px] border border-line hover:border-ink/40 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Total Candidates
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {stats.totalApplications}
          </div>
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <span className="font-semibold text-ink">{stats.reviewPendingCount || 0} applied</span>
            <span>&bull;</span>
            <span>across all roles</span>
          </div>
        </Link>

        {/* Shortlisted */}
        <Link
          to="/dashboard/pipeline"
          className="bg-white p-5 rounded-[12px] border border-line hover:border-ink/40 transition-colors block"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Shortlisted
            </span>
            <span className="w-2 h-2 rounded-full bg-signal" title="Qualified state" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {stats.shortlistedCount || 0}
          </div>
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <span className="font-semibold text-ink">{stats.shortlistRate || 0}%</span>
            <span>qualification rate</span>
          </div>
        </Link>

        {/* Status */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Public Submissions
          </span>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {stats.publishedJobs > 0 ? 'Accepting' : 'Paused'}
          </div>
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            {stats.publishedJobs > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full bg-signal" />
                <span className="font-semibold text-ink">Links active</span>
              </>
            ) : (
              <span>No published links</span>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Sort & View Mode */}
      <div className="bg-white p-4 rounded-[12px] border border-line flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All Jobs', count: jobs.length },
            { key: 'published', label: 'Published', count: jobs.filter((j) => j.status === 'published').length },
            { key: 'draft', label: 'Drafts', count: jobs.filter((j) => j.status === 'draft').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`h-[36px] px-3.5 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-ink text-paper'
                  : 'text-muted hover:text-ink hover:bg-paper-2'
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

        {/* Search, Sort, View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-[14px] stroke-[1.5]" />
            <input
              type="text"
              placeholder="Search postings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bf-input w-full pl-9 text-xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bf-input text-xs px-3 font-medium cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="applications">Most candidates</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <div className="flex items-center rounded-[8px] border border-line p-0.5 bg-paper">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-2 rounded-[6px] transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`p-2 rounded-[6px] transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <List className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-[12px] border border-line">
          <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
          <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
            Loading postings...
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 px-6 text-center max-w-md mx-auto bg-white rounded-[12px] border border-line">
          <h3 className="text-base font-bold text-ink">
            {jobs.length === 0 ? 'No job postings yet' : 'No matching jobs'}
          </h3>
          <p className="mt-2 text-xs text-muted leading-relaxed">
            {jobs.length === 0
              ? 'Create your first job posting to generate an application link and receive candidate submissions.'
              : 'Try clearing your search query or switching your status filter.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {jobs.length === 0 ? (
              <Link
                to="/dashboard/jobs/new"
                className="btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 stroke-[1.5]" />
                <span>Create job</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="btn-secondary w-full sm:w-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isPublished = job.status === 'published';
            const isActionLoading = actionLoadingId === job._id;

            return (
              <div
                key={job._id}
                className="bg-white rounded-[12px] border border-line flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] font-medium text-ink">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPublished ? 'bg-signal' : 'bg-ink'
                        }`}
                      />
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </span>

                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {job.employmentType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[17px] text-ink line-clamp-1">
                      <Link to={`/dashboard/jobs/${job._id}`} className="hover:underline">
                        {job.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-muted mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-muted stroke-[1.5]" />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  {job.salary && (
                    <div className="font-mono text-xs text-ink bg-paper border border-line px-2.5 py-1 rounded-[6px] inline-block">
                      {job.salary}
                    </div>
                  )}

                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                    <Link
                      to={`/dashboard/jobs/${job._id}/applications`}
                      className="font-semibold text-ink hover:underline flex items-center gap-1.5"
                    >
                      <span>
                        <strong>{job.applicationCount || 0}</strong>{' '}
                        {job.applicationCount === 1 ? 'candidate' : 'candidates'}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
                    </Link>

                    <span className="font-mono text-[11px] text-muted">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-3 bg-paper-2/40 border-t border-line flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {/* Copy Link */}
                    {isPublished && (
                      <button
                        onClick={() => handleCopyLink(job.slug)}
                        title="Copy application URL"
                        className="p-2 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors cursor-pointer"
                      >
                        {copiedSlug === job.slug ? (
                          <Check className="w-4 h-4 text-ink stroke-[2]" />
                        ) : (
                          <Copy className="w-4 h-4 stroke-[1.5]" />
                        )}
                      </button>
                    )}

                    {/* Form Builder */}
                    <Link
                      to={`/dashboard/jobs/${job._id}/form`}
                      title="Manage form questions"
                      className="p-2 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 stroke-[1.5]" />
                    </Link>

                    {/* Edit Details */}
                    <Link
                      to={`/dashboard/jobs/${job._id}/edit`}
                      title="Edit posting"
                      className="p-2 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
                    >
                      <Edit className="w-4 h-4 stroke-[1.5]" />
                    </Link>

                    {/* Toggle Publish */}
                    <button
                      onClick={() => handleTogglePublish(job._id, job.status)}
                      disabled={isActionLoading}
                      title={isPublished ? 'Revert to draft' : 'Publish application link'}
                      className="p-2 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors cursor-pointer"
                    >
                      {isPublished ? (
                        <GlobeLock className="w-4 h-4 stroke-[1.5]" />
                      ) : (
                        <Globe className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteJob(job._id, job.title)}
                    disabled={isActionLoading}
                    title="Delete job"
                    className="p-2 text-muted hover:text-red-700 hover:bg-red-50 rounded-[6px] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-[12px] border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line text-left">
              <thead className="bg-paper text-[11px] font-mono uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="py-3.5 px-6 font-normal">Job Title & Company</th>
                  <th className="py-3.5 px-4 font-normal">Location & Type</th>
                  <th className="py-3.5 px-4 font-normal">Status</th>
                  <th className="py-3.5 px-4 text-center font-normal">Candidates</th>
                  <th className="py-3.5 px-4 font-normal">Created</th>
                  <th className="py-3.5 px-6 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[14px]">
                {filteredJobs.map((job) => {
                  const isPublished = job.status === 'published';
                  const isActionLoading = actionLoadingId === job._id;

                  return (
                    <tr key={job._id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/dashboard/jobs/${job._id}`}
                          className="font-bold text-ink hover:underline"
                        >
                          {job.title}
                        </Link>
                        <div className="text-xs text-muted mt-0.5">{job.companyName}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-ink bg-paper px-2 py-0.5 rounded-[4px] border border-line">
                          {job.employmentType}
                        </span>
                        <div className="text-xs text-muted flex items-center mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 stroke-[1.5]" />
                          <span>{job.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isPublished ? 'bg-signal' : 'bg-ink'
                            }`}
                          />
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/dashboard/jobs/${job._id}/applications`}
                          className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-paper hover:bg-paper-2 border border-line text-ink transition-colors"
                        >
                          <span>{job.applicationCount || 0}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-muted">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {isPublished && (
                            <button
                              onClick={() => handleCopyLink(job.slug)}
                              title="Copy application link"
                              className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors cursor-pointer"
                            >
                              {copiedSlug === job.slug ? (
                                <Check className="w-4 h-4 text-ink stroke-[2]" />
                              ) : (
                                <Copy className="w-4 h-4 stroke-[1.5]" />
                              )}
                            </button>
                          )}

                          <Link
                            to={`/dashboard/jobs/${job._id}/form`}
                            title="Manage form questions"
                            className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4 stroke-[1.5]" />
                          </Link>

                          <Link
                            to={`/dashboard/jobs/${job._id}/edit`}
                            title="Edit posting"
                            className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
                          >
                            <Edit className="w-4 h-4 stroke-[1.5]" />
                          </Link>

                          <button
                            onClick={() => handleTogglePublish(job._id, job.status)}
                            disabled={isActionLoading}
                            title={isPublished ? 'Revert to draft' : 'Publish application link'}
                            className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors cursor-pointer"
                          >
                            {isPublished ? (
                              <GlobeLock className="w-4 h-4 stroke-[1.5]" />
                            ) : (
                              <Globe className="w-4 h-4 stroke-[1.5]" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job._id, job.title)}
                            disabled={isActionLoading}
                            title="Delete"
                            className="p-1.5 text-muted hover:text-red-700 hover:bg-red-50 rounded-[6px] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
