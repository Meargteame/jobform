import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
      <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans text-ink">
        <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-50/80 border border-red-200 rounded-[12px] text-center space-y-4 font-sans text-ink">
        <AlertCircle className="w-8 h-8 text-red-700 mx-auto stroke-[1.5]" />
        <p className="text-sm font-semibold text-red-800">{error || 'Job not found.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs font-semibold text-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1 stroke-[1.5]" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isPublished = job.status === 'published';

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-ink">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">{job.title}</h1>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink">
                <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-signal' : 'bg-ink'}`} />
                <span>{isPublished ? 'Published' : 'Draft'}</span>
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">{job.companyName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isPublished && (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold bg-white hover:bg-paper-2 text-ink border border-line rounded-[8px] transition-colors"
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

          <a
            href={`/apply/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold bg-white hover:bg-paper-2 text-ink border border-line rounded-[8px] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Open application page</span>
          </a>

          <Link
            to={`/dashboard/jobs/${job._id}/form`}
            className="inline-flex items-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold bg-white hover:bg-paper-2 text-ink border border-line rounded-[8px] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Form ({job.questionCount || 0})</span>
          </Link>

          <Link
            to={`/dashboard/jobs/${job._id}/applications`}
            className="inline-flex items-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold bg-white hover:bg-paper-2 text-ink border border-line rounded-[8px] transition-colors"
          >
            <Users className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Candidates ({job.applicationCount || 0})</span>
          </Link>

          <button
            onClick={handleTogglePublish}
            disabled={actionLoading}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3.5 text-xs font-semibold rounded-[8px] transition-colors ${
              isPublished
                ? 'bg-paper text-ink border border-line hover:bg-paper-2'
                : 'bg-ink text-paper hover:bg-[#202022]'
            }`}
          >
            {isPublished ? (
              <>
                <GlobeLock className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Revert to draft</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Publish</span>
              </>
            )}
          </button>

          <Link
            to={`/dashboard/jobs/${job._id}/edit`}
            className="p-2 text-muted hover:text-ink hover:bg-paper rounded-[8px] border border-line transition-colors"
            title="Edit Details"
          >
            <Edit className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-7 rounded-[12px] border border-line space-y-6">
            <div>
              <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted border-b border-line pb-2">
                About the role
              </h2>
              <div className="mt-4 text-[15px] text-ink whitespace-pre-line leading-relaxed font-normal">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div className="pt-4 border-t border-line">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted border-b border-line pb-2">
                  Requirements & Qualifications
                </h2>
                <div className="mt-4 text-[15px] text-ink whitespace-pre-line leading-relaxed font-normal">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[12px] border border-line space-y-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
              Role Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center text-ink gap-2.5">
                <Briefcase className="w-4 h-4 text-muted stroke-[1.5]" />
                <span className="font-semibold">{job.employmentType}</span>
              </div>

              <div className="flex items-center text-ink gap-2.5">
                <MapPin className="w-4 h-4 text-muted stroke-[1.5]" />
                <span>{job.location}</span>
              </div>

              {job.salary && (
                <div className="flex items-center text-ink gap-2.5">
                  <DollarSign className="w-4 h-4 text-muted stroke-[1.5]" />
                  <span className="font-mono">{job.salary}</span>
                </div>
              )}

              {job.deadline && (
                <div className="flex items-center text-ink gap-2.5">
                  <Calendar className="w-4 h-4 text-muted stroke-[1.5]" />
                  <span className="font-mono">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-line">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Public Link Slug</span>
              <p className="font-mono text-xs text-ink mt-1 break-all bg-paper p-2 rounded-[6px] border border-line">
                {job.slug}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
