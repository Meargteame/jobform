import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Briefcase,
  Users,
  CheckCircle,
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
} from 'lucide-react';

const DashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    publishedJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [error, setError] = useState('');

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

  const handleTogglePublish = async (jobId, currentStatus) => {
    try {
      setActionLoadingId(jobId);
      const res = await api.patch(`/jobs/${jobId}/publish`);
      if (res.data.success) {
        setJobs((prev) =>
          prev.map((job) =>
            job._id === jobId ? { ...job, status: res.data.data.status } : job
          )
        );
        // Refresh stats count
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
        `Are you sure you want to delete "${title}"? This will also remove its application form and all candidate submissions.`
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(jobId);
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
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
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Recruiter Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor active vacancies, customize forms, and evaluate incoming candidate applications.
          </p>
        </div>
        <Link
          to="/dashboard/jobs/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Job Postings
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalJobs}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Published Jobs
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {stats.publishedJobs}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Applications
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalApplications}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Job Postings</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your jobs, edit custom questions, and check applicant submissions.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm font-medium">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 px-4 text-center max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No jobs yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first job posting and start receiving candidate applications.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/jobs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Job Details</th>
                  <th className="py-3.5 px-4">Type & Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Applications</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {jobs.map((job) => {
                  const isPublished = job.status === 'published';
                  const isActionLoading = actionLoadingId === job._id;

                  return (
                    <tr key={job._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 hover:text-emerald-700">
                          <Link to={`/dashboard/jobs/${job._id}`}>{job.title}</Link>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {job.companyName}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-700 bg-gray-100 inline-block px-2 py-0.5 rounded">
                          {job.employmentType}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{job.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <Link
                          to={`/dashboard/jobs/${job._id}/applications`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          <span className="font-bold">{job.applicationCount}</span>
                          <span className="ml-1 text-gray-500">applicants</span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          {/* Copy Link Button */}
                          {isPublished ? (
                            <button
                              onClick={() => handleCopyLink(job.slug)}
                              title="Copy Public Application Link"
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              {copiedSlug === job.slug ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          ) : null}

                          {/* Public preview link */}
                          <a
                            href={`/apply/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Public Page"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Form Builder */}
                          <Link
                            to={`/dashboard/jobs/${job._id}/form`}
                            title="Manage Application Form"
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </Link>

                          {/* Edit Job */}
                          <Link
                            to={`/dashboard/jobs/${job._id}/edit`}
                            title="Edit Job Posting"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Toggle Publish */}
                          <button
                            onClick={() => handleTogglePublish(job._id, job.status)}
                            disabled={isActionLoading}
                            title={isPublished ? 'Unpublish Job' : 'Publish Job'}
                            className={`p-1.5 rounded transition-colors ${
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

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteJob(job._id, job.title)}
                            disabled={isActionLoading}
                            title="Delete Job"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
