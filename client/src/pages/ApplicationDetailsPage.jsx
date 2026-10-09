import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CandidateStatusBadge from '../components/CandidateStatus';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  AlertCircle,
  Loader2,
  FileCheck,
  X,
  Send,
  Copy,
  Check,
} from 'lucide-react';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Outreach Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('interview');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const res = await api.patch(`/applications/${id}/notes`, { notes });
      if (res.data.success) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save evaluation notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.data);
        setNotes(res.data.data.notes || '');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load candidate application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setStatusFeedback('');
      const res = await api.patch(`/applications/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setApplication(res.data.data);
        setStatusFeedback(`Candidate marked as ${newStatus}.`);
        setTimeout(() => setStatusFeedback(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const applyEmailTemplate = (templateKey, app = application) => {
    setSelectedTemplate(templateKey);
    const candidateName = app?.fullName || 'Candidate';
    const jobTitle = app?.job?.title || 'the open role';
    const company = app?.job?.companyName || user?.companyName || 'our company';
    const recruiterName = user?.name || 'The Hiring Team';

    if (templateKey === 'interview') {
      setEmailSubject(`Invitation to Interview: ${jobTitle} at ${company}`);
      setEmailBody(
        `Hi ${candidateName},\n\n` +
        `Thank you for applying for the ${jobTitle} role at ${company}.\n\n` +
        `We were very impressed by your background and experience, and would like to invite you to an introductory 30-minute screening conversation with our team.\n\n` +
        `Please let us know what times later this week or next week work well for you.\n\n` +
        `We look forward to speaking with you!\n\n` +
        `Best regards,\n${recruiterName}\n${company}`
      );
    } else if (templateKey === 'assessment') {
      setEmailSubject(`Next Steps: Technical Evaluation for ${jobTitle} - ${company}`);
      setEmailBody(
        `Hi ${candidateName},\n\n` +
        `Thank you for your application for the ${jobTitle} position at ${company}.\n\n` +
        `We'd love to proceed to the next stage of our evaluation process. Could you please share links to relevant projects or portfolio repositories you have worked on?\n\n` +
        `Feel free to reach out if you have any questions.\n\n` +
        `Best regards,\n${recruiterName}\n${company}`
      );
    } else if (templateKey === 'rejection') {
      setEmailSubject(`Update regarding your application for ${jobTitle} at ${company}`);
      setEmailBody(
        `Dear ${candidateName},\n\n` +
        `Thank you for taking the time to apply for the ${jobTitle} role at ${company} and for your interest in joining our team.\n\n` +
        `After reviewing your application alongside other candidates, we have decided to move forward with applicants whose experience more closely matches our immediate requirements.\n\n` +
        `We truly appreciate your interest and wish you the very best in your search.\n\n` +
        `Sincerely,\n${recruiterName}\n${company}`
      );
    }
  };

  const handleOpenEmailModal = (initialTemplate = 'interview') => {
    applyEmailTemplate(initialTemplate, application);
    setEmailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans text-ink">
        <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">Loading candidate details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-red-50/80 border border-red-200 rounded-[12px] text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto stroke-[1.5]" />
        <p className="text-sm font-semibold text-red-800">{error || 'Application not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-ink hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1 stroke-[1.5]" />
          Return to previous view
        </button>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  const fullCvUrl = application.cvUrl?.startsWith('http')
    ? application.cvUrl
    : `${backendBase}${application.cvUrl}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-ink">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to={application.job ? `/dashboard/jobs/${application.job._id}/applications` : '/dashboard'}
            className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                {application.fullName}
              </h1>
              <CandidateStatusBadge status={application.status} />
            </div>
            <p className="text-xs text-muted mt-1">
              Applicant for{' '}
              <span className="font-semibold text-ink">
                {application.job?.title || 'Job Posting'}
              </span>
            </p>
          </div>
        </div>

        {/* Status Pipeline Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-[8px] border border-line bg-paper p-1 gap-1">
            <button
              onClick={() => handleStatusChange('applied')}
              disabled={updatingStatus}
              className={`h-[34px] px-3.5 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                application.status === 'applied'
                  ? 'bg-ink text-paper border border-ink'
                  : 'text-muted hover:text-ink hover:bg-paper-2 border border-transparent'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${application.status === 'applied' ? 'bg-paper' : 'bg-ink'}`} />
              <span>Applied</span>
            </button>

            <button
              onClick={() => handleStatusChange('shortlisted')}
              disabled={updatingStatus}
              className={`h-[34px] px-3.5 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                application.status === 'shortlisted'
                  ? 'bg-signal text-ink border border-signal font-bold'
                  : 'text-muted hover:text-ink hover:bg-paper-2 border border-transparent'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${application.status === 'shortlisted' ? 'bg-ink' : 'bg-signal'}`} />
              <span>Shortlist</span>
            </button>

            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={updatingStatus}
              className={`h-[34px] px-3.5 inline-flex items-center gap-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                application.status === 'rejected'
                  ? 'bg-white border border-ink text-ink'
                  : 'text-muted hover:text-red-700 hover:bg-paper-2 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full border border-current bg-transparent" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3 bg-white border border-line text-ink text-xs font-medium rounded-[8px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* Candidate Profile Card */}
      <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted pb-3 border-b border-line">
          Contact Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Email</p>
            <a
              href={`mailto:${application.email}`}
              className="font-medium text-ink hover:underline break-all mt-1 inline-flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
              <span>{application.email}</span>
            </a>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Phone</p>
            <p className="font-medium text-ink mt-1 flex items-center gap-1.5 font-mono text-xs">
              <Phone className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
              <span>{application.phone}</span>
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">Date Applied</p>
            <p className="font-medium text-ink mt-1 flex items-center gap-1.5 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-muted stroke-[1.5]" />
              <span>{new Date(application.submittedAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* CV Document Box */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-paper flex items-center justify-center text-ink border border-line">
              <FileCheck className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Curriculum Vitae</p>
              <p className="font-mono text-[11px] text-muted">Attached by candidate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenEmailModal('interview')}
              className="btn-secondary btn-compact"
              title="Compose message or interview invite with templates"
            >
              <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Email candidate</span>
            </button>

            <a
              href={fullCvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-compact"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Open CV document</span>
            </a>
          </div>
        </div>
      </div>

      {/* Screening Questions Card */}
      <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
            Screening Answers ({application.answers?.length || 0})
          </h2>
        </div>

        {(!application.answers || application.answers.length === 0) ? (
          <p className="text-xs text-muted py-4 text-center">
            No custom screening answers recorded for this candidate.
          </p>
        ) : (
          <div className="space-y-4">
            {application.answers.map((ans, idx) => {
              const isUrl = ans.type === 'url' || String(ans.answer).startsWith('http');
              const isArray = Array.isArray(ans.answer);

              return (
                <div key={idx} className="p-4 bg-paper rounded-[8px] border border-line space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      Question {idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                      {ans.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-ink">{ans.label}</h3>

                  <div className="text-sm text-ink pt-1">
                    {isArray ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ans.answer.map((item, i) => (
                          <span
                            key={i}
                            className="font-mono text-xs px-2.5 py-1 bg-white border border-line text-ink rounded-[4px]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : isUrl ? (
                      <a
                        href={ans.answer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline"
                      >
                        <span>{ans.answer}</span>
                        <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                      </a>
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed text-xs text-ink bg-white p-3 rounded-[6px] border border-line">
                        {ans.answer !== undefined && ans.answer !== '' ? String(ans.answer) : '(No response provided)'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Internal Recruiter Notes Card */}
      <div className="bg-white rounded-[12px] border border-line p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
              Internal Evaluation Notes
            </h2>
            <p className="text-xs text-muted mt-0.5">Private to hiring team. Not visible to candidate.</p>
          </div>
          {notesSaved && (
            <span className="font-mono text-[11px] text-ink uppercase tracking-[0.12em] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-signal" />
              <span>Notes saved</span>
            </span>
          )}
        </div>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down interview assessment, salary discussion, impressions, or hiring team feedback..."
          className="w-full p-3.5 rounded-[8px] border border-line bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink placeholder:text-muted/60"
        />

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="btn-primary btn-compact"
          >
            {savingNotes ? 'Saving notes...' : 'Save evaluation notes'}
          </button>
        </div>
      </div>

      {/* Candidate Email Outreach Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-line max-w-xl w-full p-6 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Candidate Communication
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-ink mt-1">
                  Email {application.fullName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="p-1.5 text-muted hover:text-ink hover:bg-paper rounded-[6px] transition-colors"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted block">
                Quick Template
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'interview', label: 'Interview Invitation' },
                  { id: 'assessment', label: 'Technical / Portfolio' },
                  { id: 'rejection', label: 'Polite Rejection' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyEmailTemplate(tpl.id)}
                    className={`h-[32px] px-3 rounded-[6px] text-xs font-semibold transition-colors ${
                      selectedTemplate === tpl.id
                        ? 'bg-ink text-paper'
                        : 'bg-paper hover:bg-paper-2 text-ink border border-line'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Subject
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="bf-input w-full text-xs font-medium"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Email Message Body
              </label>
              <textarea
                rows={7}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full p-3 font-sans text-xs bg-paper text-ink rounded-[8px] border border-line focus:outline-none focus:ring-2 focus:ring-signal focus:border-ink leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
                  setEmailCopied(true);
                  setTimeout(() => setEmailCopied(false), 2500);
                }}
                className="btn-secondary btn-compact"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Message copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Copy message</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="btn-secondary btn-compact"
                >
                  Cancel
                </button>

                <a
                  href={`mailto:${application.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  onClick={() => setEmailModalOpen(false)}
                  className="btn-primary btn-compact"
                >
                  <Send className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Open in email app</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsPage;
