import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  FileSpreadsheet,
  Globe,
  GlobeLock,
  Copy,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Loader2,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Filter,
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

  // Dashboard filtering & view mode
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
            ? 'Job published to candidate portal!'
            : 'Job switched to private draft.'
        );

        // Refresh summary metrics
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
        `Are you sure you want to delete "${title}"? This will permanently delete its custom application form and candidate submissions.`
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
    showToast('Public application link copied to clipboard!');
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Status filter
        if (statusFilter !== 'all' && job.status !== statusFilter) return false;

        // Search query filter
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
    <div className="space-y-8 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>{user?.companyName || 'Hiring Workspace'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'}
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            You currently have <strong className="text-slate-800 font-semibold">{stats.publishedJobs} active postings</strong> receiving applications. Monitor candidates and pipeline statuses below.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <Link
            to="/dashboard/jobs/new"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Postings
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalJobs}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1.5">
            <span className="font-medium text-emerald-600">{stats.publishedJobs} active</span>
            <span>&bull;</span>
            <span className="font-medium text-slate-500">{stats.draftJobs || 0} drafts</span>
          </div>
        </div>

        {/* Total Applicants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Applicants
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalApplications}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1.5">
            <span className="font-medium text-purple-600">{stats.reviewPendingCount || 0} applied</span>
            <span>&bull;</span>
            <span>across all roles</span>
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {stats.shortlistedCount || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{stats.shortlistRate || 0}%</span>
            <span>qualification rate</span>
          </div>
        </div>

        {/* Live Published Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Public Acceptance
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.publishedJobs > 0 ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {stats.publishedJobs > 0 ? (
              <span className="text-emerald-600 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                Accepting submissions
              </span>
            ) : (
              <span className="text-slate-400">No published links</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar: Filter, Search, Sort & View Mode */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All Jobs', count: jobs.length },
            { key: 'published', label: 'Published', count: jobs.filter((j) => j.status === 'published').length },
            { key: 'draft', label: 'Drafts', count: jobs.filter((j) => j.status === 'draft').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key ? 'bg-slate-700 text-white' : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Sort, View Toggle */}
        <div className="flex items-center space-x-2.5">
          {/* Live Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="applications">Most Applicants</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Dense Table View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your vacancies...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 px-6 text-center max-w-md mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {jobs.length === 0 ? 'No job postings yet' : 'No matching jobs found'}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            {jobs.length === 0
              ? 'Create your first job posting to start receiving structured candidate submissions.'
              : 'Try clearing your search query or switching your status filter.'}
          </p>
          <div className="mt-6">
            {jobs.length === 0 ? (
              <Link
                to="/dashboard/jobs/new"
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Post Your First Job
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Reset Filters
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
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header & Badges */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      ></span>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {job.employmentType}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      <Link to={`/dashboard/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  {job.salary && (
                    <div className="text-xs font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 rounded-md inline-block">
                      {job.salary}
                    </div>
                  )}

                  {/* Applicant Metrics Badge */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/dashboard/jobs/${job._id}/applications`}
                      className="font-semibold text-slate-800 hover:text-emerald-700 flex items-center space-x-1.5 group/btn"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-emerald-600" />
                      <span>
                        <strong className="text-emerald-700 font-bold">{job.applicationCount || 0}</strong>{' '}
                        {job.applicationCount === 1 ? 'applicant' : 'applicants'}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>

                    <span className="text-[11px] text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {/* Copy Link Button */}
                    {isPublished && (
                      <button
                        onClick={() => handleCopyLink(job.slug)}
                        title="Copy Public Link"
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        {copiedSlug === job.slug ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Form Builder */}
                    <Link
                      to={`/dashboard/jobs/${job._id}/form`}
                      title="Manage Application Form"
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Link>

                    {/* Edit */}
                    <Link
                      to={`/dashboard/jobs/${job._id}/edit`}
                      title="Edit Job Details"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {/* Toggle publish */}
                    <button
                      onClick={() => handleTogglePublish(job._id, job.status)}
                      disabled={isActionLoading}
                      title={isPublished ? 'Unpublish (Switch to draft)' : 'Publish job'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPublished
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {isPublished ? (
                        <GlobeLock className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteJob(job._id, job.title)}
                    disabled={isActionLoading}
                    title="Delete Job"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Role Title & Company</th>
                  <th className="py-3.5 px-4">Location & Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Applicants</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-sm">
                {filteredJobs.map((job) => {
                  const isPublished = job.status === 'published';
                  const isActionLoading = actionLoadingId === job._id;

                  return (
                    <tr key={job._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          to={`/dashboard/jobs/${job._id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {job.title}
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5">{job.companyName}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {job.employmentType}
                        </span>
                        <div className="text-xs text-slate-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{job.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                            }`}
                          ></span>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/dashboard/jobs/${job._id}/applications`}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span>{job.applicationCount || 0}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isPublished && (
                            <button
                              onClick={() => handleCopyLink(job.slug)}
                              title="Copy Public URL"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              {copiedSlug === job.slug ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          <Link
                            to={`/dashboard/jobs/${job._id}/form`}
                            title="Manage Form"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/dashboard/jobs/${job._id}/edit`}
                            title="Edit"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleTogglePublish(job._id, job.status)}
                            disabled={isActionLoading}
                            title={isPublished ? 'Unpublish' : 'Publish'}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            {isPublished ? <GlobeLock className="w-4 h-4 text-amber-600" /> : <Globe className="w-4 h-4 text-emerald-600" />}
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job._id, job.title)}
                            disabled={isActionLoading}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
