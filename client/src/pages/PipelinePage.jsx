import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CandidateDot } from '../components/CandidateStatus';
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
  Mail,
  Phone,
  FileCheck,
  Users,
  Briefcase,
} from 'lucide-react';

const PipelinePage = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [candidateUpdatingId, setCandidateUpdatingId] = useState(null);

  // Filters
  const [pipelineRoleFilter, setPipelineRoleFilter] = useState('all');
  const [pipelineSearch, setPipelineSearch] = useState('');

  const fetchPipelineData = async () => {
    try {
      setLoading(true);
      setError('');
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs'),
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.data.applications || []);
      }
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load candidate pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      const res = await api.post('/jobs/seed-demo');
      if (res.data.success) {
        showToast('Sample posting and candidate data loaded.');
        await fetchPipelineData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load demo data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePipelineStatusChange = async (appId, newStatus) => {
    try {
      setCandidateUpdatingId(appId);
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        showToast(`Candidate moved to ${newStatus}.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setCandidateUpdatingId(null);
    }
  };

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
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

  const appliedCandidates = useMemo(
    () => filteredCandidates.filter((c) => c.status === 'applied'),
    [filteredCandidates]
  );
  const shortlistedCandidates = useMemo(
    () => filteredCandidates.filter((c) => c.status === 'shortlisted'),
    [filteredCandidates]
  );
  const rejectedCandidates = useMemo(
    () => filteredCandidates.filter((c) => c.status === 'rejected'),
    [filteredCandidates]
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
            Candidate Pipeline
          </h1>
          <p className="text-[14px] text-muted mt-1 max-w-xl">
            Track and review applicants across Applied, Shortlisted, and Rejected hiring stages in one unified workflow.
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

      {/* Pipeline Stage Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Total In Pipeline
          </span>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {applications.length}
          </div>
          <div className="mt-2 text-xs text-muted">
            Across {jobs.length} total postings
          </div>
        </div>

        {/* Applied */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Applied (New)
            </span>
            <CandidateDot status="applied" size={8} />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {appliedCandidates.length}
          </div>
          <div className="mt-2 text-xs text-muted">
            Awaiting screening review
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Shortlisted
            </span>
            <CandidateDot status="shortlisted" size={8} />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {shortlistedCandidates.length}
          </div>
          <div className="mt-2 text-xs text-muted">
            Qualified for next interview steps
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-[12px] border border-line">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Rejected
            </span>
            <CandidateDot status="rejected" size={8} />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-[-0.03em] text-ink">
            {rejectedCandidates.length}
          </div>
          <div className="mt-2 text-xs text-muted">
            Closed applications
          </div>
        </div>
      </div>

      {/* Pipeline Filter Bar */}
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

          {/* Quick Badges */}
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

        {/* Search */}
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

      {/* 3-Column Pipeline Board */}
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
            When candidates submit applications through your public links, they appear here organized by hiring stage.
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
  );
};

export default PipelinePage;
