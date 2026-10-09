import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CandidateStatusBadge, { CandidateDot } from '../components/CandidateStatus';
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
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

const DashboardPage = ({ defaultTab = 'jobs' }) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary view tab: 'jobs' (Postings) or 'pipeline' (Candidate Pipeline)
  const initialTab = searchParams.get('tab') || defaultTab;
  const [activeMainTab, setActiveMainTab] = useState(initialTab);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
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
  const [candidateUpdatingId, setCandidateUpdatingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');

  // Jobs filtering & view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'applications', 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Pipeline filtering
  const [pipelineRoleFilter, setPipelineRoleFilter] = useState('all');
  const [pipelineSearch, setPipelineSearch] = useState('');

  // Update URL param when switching tab
  const handleTabSwitch = (tab) => {
    setActiveMainTab(tab);
    setSearchParams(tab === 'jobs' ? {} : { tab });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [jobsRes, statsRes, appsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/jobs/stats/summary'),
        api.get('/applications'),
      ]);

      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (appsRes.data.success) {
        setApplications(appsRes.data.data.applications || []);
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

  // Sync if prop changed
  useEffect(() => {
    if (defaultTab && defaultTab !== activeMainTab && !searchParams.get('tab')) {
      setActiveMainTab(defaultTab);
    }
  }, [defaultTab]);

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
        setApplications((prev) => prev.filter((a) => (a.job?._id || a.job) !== jobId));
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

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      const res = await api.post('/jobs/seed-demo');
      if (res.data.success) {
        showToast('Sample posting and candidate data loaded.');
        await fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load demo data.');
    } finally {
      setLoading(false);
    }
  };

  // Pipeline Status Change Handler (Applied / Shortlisted / Rejected)
  const handlePipelineStatusChange = async (appId, newStatus) => {
    try {
      setCandidateUpdatingId(appId);
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        showToast(`Candidate moved to ${newStatus}.`);

        // Refresh stats silently
        const statsRes = await api.get('/jobs/stats/summary');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setCandidateUpdatingId(null);
    }
  };

  // Filtered jobs for Jobs tab
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

  // Filtered candidates for Pipeline tab
  const filteredPipelineCandidates = useMemo(() => {
    return applications.filter((app) => {
      // Role filter
      if (pipelineRoleFilter !== 'all') {
        const jId = app.job?._id || app.job;
        if (jId !== pipelineRoleFilter) return false;
      }

      // Search filter
      if (pipelineSearch.trim()) {
        const q = pipelineSearch.toLowerCase();
        const matchName = app.fullName?.toLowerCase().includes(q);
        const matchEmail = app.email?.toLowerCase().includes(q);
        const matchJob = app.job?.title?.toLowerCase().includes(q);
        return matchName || matchEmail || matchJob;
      }

      return true;
    });
  }, [applications, pipelineRoleFilter, pipelineSearch]);

  // Group candidates by pipeline stage
  const appliedCandidates = useMemo(
    () => filteredPipelineCandidates.filter((c) => c.status === 'applied'),
    [filteredPipelineCandidates]
  );
  const shortlistedCandidates = useMemo(
    () => filteredPipelineCandidates.filter((c) => c.status === 'shortlisted'),
    [filteredPipelineCandidates]
  );
  const rejectedCandidates = useMemo(
    () => filteredPipelineCandidates.filter((c) => c.status === 'rejected'),
    [filteredPipelineCandidates]
  );

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const getCvUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `${backendBase}${url}`;
  };

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
            {activeMainTab === 'pipeline' ? 'Candidate Hiring Pipeline' : 'Recruiter Overview'}
          </h1>
          <p className="text-[14px] text-muted mt-1 max-w-xl">
            {activeMainTab === 'pipeline'
              ? 'Track candidates across Applied, Shortlisted, and Rejected stages in one unified workflow.'
              : `${stats.publishedJobs} active postings receiving submissions. Manage candidates and custom forms below.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/jobs/new"
            className="btn-primary"
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

        {/* Total Candidates */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Total Candidates
          </span>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {stats.totalApplications}
          </div>
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <span className="font-semibold text-ink">{stats.reviewPendingCount || 0} applied</span>
            <span>&bull;</span>
            <span>across all roles</span>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
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
        </div>

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

      {/* Main View Switcher: Postings vs. Candidate Pipeline */}
      <div className="border-b border-line flex items-center gap-2">
        <button
          onClick={() => handleTabSwitch('jobs')}
          className={`h-[42px] px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'jobs'
              ? 'border-ink text-ink font-bold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Briefcase className="w-4 h-4 stroke-[1.5]" />
          <span>Job Postings</span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-white border border-line text-ink">
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('pipeline')}
          className={`h-[42px] px-4 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'pipeline'
              ? 'border-ink text-ink font-bold'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-signal" />
          <span>Candidate Pipeline</span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-white border border-line text-ink">
            {applications.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CANDIDATE PIPELINE BOARD */}
      {activeMainTab === 'pipeline' ? (
        <div className="space-y-6">
          {/* Pipeline Filters Bar */}
          <div className="bg-white p-4 rounded-[12px] border border-line flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted whitespace-nowrap">
                  Role:
                </span>
                <select
                  value={pipelineRoleFilter}
                  onChange={(e) => setPipelineRoleFilter(e.target.value)}
                  className="bf-input text-xs px-3 font-medium cursor-pointer"
                >
                  <option value="all">All Roles ({jobs.length})</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Status Count Badges */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-paper text-xs font-semibold border border-line text-ink">
                  <CandidateDot status="applied" size={7} />
                  <span>{appliedCandidates.length} Applied</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-paper text-xs font-semibold border border-line text-ink">
                  <CandidateDot status="shortlisted" size={7} />
                  <span>{shortlistedCandidates.length} Shortlisted</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-paper text-xs font-semibold border border-line text-ink">
                  <CandidateDot status="rejected" size={7} />
                  <span>{rejectedCandidates.length} Rejected</span>
                </span>
              </div>
            </div>

            {/* Candidate Search */}
            <div className="relative md:w-72">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-[14px] stroke-[1.5]" />
              <input
                type="text"
                placeholder="Search candidates by name, email..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                className="bf-input w-full pl-9 text-xs"
              />
            </div>
          </div>

          {/* 3-Column Pipeline Kanban Board */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-[12px] border border-line">
              <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                Loading candidate pipeline...
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 px-6 text-center max-w-md mx-auto bg-white rounded-[12px] border border-line">
              <Users className="w-8 h-8 text-muted mx-auto stroke-[1.5] mb-3" />
              <h3 className="text-base font-bold text-ink">No candidates in pipeline yet</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                When applicants submit forms through your public links, their submissions appear here organized by hiring stages.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleSeedDemo}
                  className="btn-primary w-full sm:w-auto"
                >
                  Load sample candidates
                </button>
                <Link
                  to="/dashboard/jobs/new"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Create job posting
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* COLUMN 1: APPLIED */}
              <div className="bg-paper rounded-[12px] border border-line p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <CandidateDot status="applied" size={9} />
                    <h3 className="font-bold text-sm text-ink">Applied</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-white border border-line text-ink font-semibold">
                    {appliedCandidates.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {appliedCandidates.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted border border-dashed border-line rounded-[8px] bg-white/50">
                      No candidates currently in Applied stage.
                    </div>
                  ) : (
                    appliedCandidates.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white rounded-[10px] border border-line p-4 space-y-3 hover:border-ink/40 transition-colors shadow-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/dashboard/applications/${app._id}`}
                              className="font-bold text-[15px] text-ink hover:underline block leading-snug"
                            >
                              {app.fullName}
                            </Link>
                            <span className="font-mono text-[11px] text-muted block mt-0.5">
                              {app.job?.title || 'Job Posting'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-muted">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-muted shrink-0 stroke-[1.5]" />
                            <a href={`mailto:${app.email}`} className="hover:underline truncate">
                              {app.email}
                            </a>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-muted shrink-0 stroke-[1.5]" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* CV attachment & Applied date */}
                        <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                          {app.cvUrl ? (
                            <a
                              href={getCvUrl(app.cvUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-ink hover:underline text-[11px]"
                            >
                              <FileCheck className="w-3 h-3 stroke-[1.5]" />
                              <span>Open CV</span>
                              <ExternalLink className="w-2.5 h-2.5 stroke-[1.5]" />
                            </a>
                          ) : (
                            <span className="font-mono text-[10px] text-muted">No resume attached</span>
                          )}

                          <span className="font-mono text-[10px] text-muted">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* 1-Click Pipeline Stage Transitions */}
                        <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="text-xs font-semibold text-muted hover:text-ink hover:underline"
                          >
                            Details &rarr;
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'shortlisted')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-primary-dark btn-compact !h-[30px] !px-2.5 text-xs font-bold"
                              title="Shortlist applicant"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'rejected')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-secondary btn-compact !h-[30px] !px-2.5 text-xs text-muted hover:text-red-700"
                              title="Reject applicant"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: SHORTLISTED */}
              <div className="bg-paper rounded-[12px] border border-line p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <CandidateDot status="shortlisted" size={9} />
                    <h3 className="font-bold text-sm text-ink">Shortlisted</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-white border border-line text-ink font-semibold">
                    {shortlistedCandidates.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {shortlistedCandidates.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted border border-dashed border-line rounded-[8px] bg-white/50">
                      No candidates currently shortlisted.
                    </div>
                  ) : (
                    shortlistedCandidates.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white rounded-[10px] border border-line p-4 space-y-3 hover:border-ink/40 transition-colors shadow-none"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/dashboard/applications/${app._id}`}
                              className="font-bold text-[15px] text-ink hover:underline block leading-snug"
                            >
                              {app.fullName}
                            </Link>
                            <span className="font-mono text-[11px] text-muted block mt-0.5">
                              {app.job?.title || 'Job Posting'}
                            </span>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-signal shrink-0 mt-1" title="Shortlisted" />
                        </div>

                        <div className="space-y-1 text-xs text-muted">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-muted shrink-0 stroke-[1.5]" />
                            <a href={`mailto:${app.email}`} className="hover:underline truncate">
                              {app.email}
                            </a>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-muted shrink-0 stroke-[1.5]" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* CV attachment & Applied date */}
                        <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                          {app.cvUrl ? (
                            <a
                              href={getCvUrl(app.cvUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-ink hover:underline text-[11px]"
                            >
                              <FileCheck className="w-3 h-3 stroke-[1.5]" />
                              <span>Open CV</span>
                              <ExternalLink className="w-2.5 h-2.5 stroke-[1.5]" />
                            </a>
                          ) : (
                            <span className="font-mono text-[10px] text-muted">No resume attached</span>
                          )}

                          <span className="font-mono text-[10px] text-muted">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* 1-Click Pipeline Stage Transitions */}
                        <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="text-xs font-semibold text-muted hover:text-ink hover:underline"
                          >
                            Details &rarr;
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'applied')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-secondary btn-compact !h-[30px] !px-2 text-xs"
                              title="Revert to Applied"
                            >
                              Revert
                            </button>
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'rejected')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-secondary btn-compact !h-[30px] !px-2 text-xs text-muted hover:text-red-700"
                              title="Reject applicant"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: REJECTED */}
              <div className="bg-paper rounded-[12px] border border-line p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <CandidateDot status="rejected" size={9} />
                    <h3 className="font-bold text-sm text-ink">Rejected</h3>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-white border border-line text-ink font-semibold">
                    {rejectedCandidates.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {rejectedCandidates.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted border border-dashed border-line rounded-[8px] bg-white/50">
                      No candidates in Rejected stage.
                    </div>
                  ) : (
                    rejectedCandidates.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white rounded-[10px] border border-line p-4 space-y-3 hover:border-ink/40 transition-colors shadow-none opacity-90"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/dashboard/applications/${app._id}`}
                              className="font-bold text-[15px] text-ink hover:underline block leading-snug"
                            >
                              {app.fullName}
                            </Link>
                            <span className="font-mono text-[11px] text-muted block mt-0.5">
                              {app.job?.title || 'Job Posting'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-muted">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-muted shrink-0 stroke-[1.5]" />
                            <a href={`mailto:${app.email}`} className="hover:underline truncate">
                              {app.email}
                            </a>
                          </div>
                        </div>

                        {/* CV attachment & Applied date */}
                        <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
                          {app.cvUrl ? (
                            <a
                              href={getCvUrl(app.cvUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-ink hover:underline text-[11px]"
                            >
                              <FileCheck className="w-3 h-3 stroke-[1.5]" />
                              <span>Open CV</span>
                              <ExternalLink className="w-2.5 h-2.5 stroke-[1.5]" />
                            </a>
                          ) : (
                            <span className="font-mono text-[10px] text-muted">No resume attached</span>
                          )}

                          <span className="font-mono text-[10px] text-muted">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* 1-Click Pipeline Stage Transitions */}
                        <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                          <Link
                            to={`/dashboard/applications/${app._id}`}
                            className="text-xs font-semibold text-muted hover:text-ink hover:underline"
                          >
                            Details &rarr;
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'applied')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-secondary btn-compact !h-[30px] !px-2 text-xs"
                              title="Revert to Applied"
                            >
                              Revert
                            </button>
                            <button
                              onClick={() => handlePipelineStatusChange(app._id, 'shortlisted')}
                              disabled={candidateUpdatingId === app._id}
                              className="btn-primary-dark btn-compact !h-[30px] !px-2 text-xs font-bold"
                              title="Shortlist applicant"
                            >
                              Shortlist
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW 2: JOB POSTINGS OVERVIEW */
        <div className="space-y-6">
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

          {/* Jobs Content */}
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
                  <>
                    <Link
                      to="/dashboard/jobs/new"
                      className="btn-primary w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 stroke-[1.5]" />
                      <span>Create job</span>
                    </Link>
                    <button
                      onClick={handleSeedDemo}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      Load sample roles
                    </button>
                  </>
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
      )}
    </div>
  );
};

export default DashboardPage;
