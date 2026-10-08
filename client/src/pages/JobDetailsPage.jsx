import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  FileSpreadsheet,
  Users,
  Edit,
  Globe,
  GlobeLock,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleTogglePublish = async () => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/jobs/${id}/publish`);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!job?.slug) return;
    const url = `${window.location.origin}/apply/${job.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-base font-semibold text-red-700">{error || 'Job not found.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isPublished = job.status === 'published';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{job.title}</h1>
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
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Copy Public Link</span>
                </>
              )}
            </button>
          )}

          <a
            href={`/apply/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <span>Open Candidate Page</span>
          </a>

          <Link
            to={`/dashboard/jobs/${job._id}/form`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Manage Form ({job.questionCount || 0} Questions)</span>
          </Link>

          <Link
            to={`/dashboard/jobs/${job._id}/applications`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Applications ({job.applicationCount || 0})</span>
          </Link>

          <button
            onClick={handleTogglePublish}
            disabled={actionLoading}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isPublished
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
            }`}
          >
            {isPublished ? (
              <>
                <GlobeLock className="w-4 h-4" />
                <span>Unpublish</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Publish Job</span>
              </>
            )}
          </button>

          <Link
            to={`/dashboard/jobs/${job._id}/edit`}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            title="Edit Details"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Job Description */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                About the Role
              </h2>
              <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Requirements & Qualifications
                </h2>
                <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Role Metadata
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-4 h-4 mr-2.5 text-gray-400" />
                <span className="font-medium">{job.employmentType}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2.5 text-gray-400" />
                <span>{job.location}</span>
              </div>

              {job.salary && (
                <div className="flex items-center text-gray-700">
                  <DollarSign className="w-4 h-4 mr-2.5 text-gray-400" />
                  <span>{job.salary}</span>
                </div>
              )}

              {job.deadline && (
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2.5 text-gray-400" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <span>Public Slug:</span>
                <p className="font-mono text-gray-800 mt-0.5 break-all">{job.slug}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
