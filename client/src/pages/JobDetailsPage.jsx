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
  Share2,
  Code2,
  X,
} from 'lucide-react';

const JobDetailsPage = () => {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
              className="btn-secondary btn-compact"
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

          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="btn-secondary btn-compact"
            title="Share or embed application form"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Share & Embed</span>
          </button>

          <a
            href={`/apply/${job.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary btn-compact"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Open application page</span>
          </a>

          <Link
            to={`/dashboard/jobs/${job._id}/form`}
            className="btn-secondary btn-compact"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Form ({job.questionCount || 0})</span>
          </Link>

          <Link
            to={`/dashboard/jobs/${job._id}/applications`}
            className="btn-secondary btn-compact"
          >
            <Users className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Candidates ({job.applicationCount || 0})</span>
          </Link>

          <button
            onClick={handleTogglePublish}
            disabled={actionLoading}
            className={isPublished ? 'btn-secondary btn-compact' : 'btn-primary btn-compact'}
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
            className="btn-secondary btn-compact !px-2.5"
            title="Edit Details"
          >
            <Edit className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>
      </div>

      {/* Distribution & Public Link Banner */}
      {isPublished && (
        <div className="bg-white p-6 rounded-[12px] border border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal" />
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Public Application Link Active
              </span>
            </div>
            <p className="font-mono text-xs text-ink break-all">
              {`${window.location.origin}/apply/${job.slug}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="btn-primary btn-compact"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`/apply/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-compact"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Preview Form</span>
            </a>
          </div>
        </div>
      )}

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

      {/* Share & Embed Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-line max-w-lg w-full p-6 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Distribution & Embed
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-ink mt-1">
                  Share & Embed Application
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Direct URL */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Direct Applicant URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/apply/${job.slug}`}
                  className="bf-input flex-1 text-xs font-mono select-all bg-paper"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-secondary whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 stroke-[1.5]" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Iframe Embed Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  Embed HTML Iframe Snippet
                </label>
                <span className="text-[10px] text-muted font-sans">
                  Webflow, Notion, WordPress
                </span>
              </div>
              <textarea
                readOnly
                rows={3}
                value={`<iframe src="${window.location.origin}/apply/${job.slug}" width="100%" height="780" frameborder="0" style="border: 1px solid #E4E3DD; border-radius: 8px;"></iframe>`}
                className="w-full p-2.5 font-mono text-xs bg-paper text-ink rounded-[8px] border border-line select-all"
              />
              <button
                type="button"
                onClick={() => {
                  const snippet = `<iframe src="${window.location.origin}/apply/${job.slug}" width="100%" height="780" frameborder="0" style="border: 1px solid #E4E3DD; border-radius: 8px;"></iframe>`;
                  navigator.clipboard.writeText(snippet);
                  setEmbedCopied(true);
                  setTimeout(() => setEmbedCopied(false), 2500);
                }}
                className="btn-primary w-full"
              >
                {embedCopied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2]" />
                    <span>Embed snippet copied</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-4 h-4 stroke-[1.5]" />
                    <span>Copy HTML embed code</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Sharing Quick Actions */}
            <div className="pt-2 border-t border-line space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted block">
                Share to Hiring Channels
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/apply/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-compact flex-1 text-center"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`We are hiring! Apply for ${job.title} at ${job.companyName}: `)}&url=${encodeURIComponent(`${window.location.origin}/apply/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-compact flex-1 text-center"
                >
                  Twitter / X
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this role: ${job.title} at ${job.companyName} ${window.location.origin}/apply/${job.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-compact flex-1 text-center"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
