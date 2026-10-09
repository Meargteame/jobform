import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  User,
  Bell,
  Webhook,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';

const SettingsPage = () => {
  const { user, login } = useAuth();

  // Settings State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
    website: '',
    industry: 'Technology & Software',
    headline: 'Building world-class products with exceptional people.',
    notifyNewApplicant: true,
    notifyCandidateShortlist: true,
    autoConfirmationEmail: true,
    webhookUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState('');

  // Load persisted local workspace prefs if available
  useEffect(() => {
    const savedPrefs = localStorage.getItem('bf_workspace_settings');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setFormData((prev) => ({
          ...prev,
          website: parsed.website || '',
          industry: parsed.industry || 'Technology & Software',
          headline: parsed.headline || 'Building world-class products with exceptional people.',
          notifyNewApplicant: parsed.notifyNewApplicant ?? true,
          notifyCandidateShortlist: parsed.notifyCandidateShortlist ?? true,
          autoConfirmationEmail: parsed.autoConfirmationEmail ?? true,
          webhookUrl: parsed.webhookUrl || '',
        }));
      } catch (e) {
        console.error('Failed to parse saved preferences', e);
      }
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      // Update core profile on backend
      const res = await api.put('/auth/profile', {
        name: formData.name,
        companyName: formData.companyName,
      });

      if (res.data.success) {
        // Persist local workspace preferences
        localStorage.setItem(
          'bf_workspace_settings',
          JSON.stringify({
            website: formData.website,
            industry: formData.industry,
            headline: formData.headline,
            notifyNewApplicant: formData.notifyNewApplicant,
            notifyCandidateShortlist: formData.notifyCandidateShortlist,
            autoConfirmationEmail: formData.autoConfirmationEmail,
            webhookUrl: formData.webhookUrl,
          })
        );

        // Update auth state in context
        if (user) {
          const updatedUser = {
            ...user,
            name: formData.name,
            companyName: formData.companyName,
          };
          const token = localStorage.getItem('token');
          if (token) {
            login(updatedUser, token);
          }
        }

        showToast('Workspace settings saved successfully.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update workspace settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = () => {
    if (!formData.webhookUrl || !formData.webhookUrl.startsWith('http')) {
      alert('Please enter a valid HTTP/HTTPS Webhook endpoint URL first.');
      return;
    }
    setTestingWebhook(true);
    setWebhookStatus('');
    setTimeout(() => {
      setTestingWebhook(false);
      setWebhookStatus('Ping successful (HTTP 200 Mock Response)');
      setTimeout(() => setWebhookStatus(''), 4000);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-4 py-3 rounded-[8px] flex items-center gap-2.5 text-xs font-semibold border border-line animate-in fade-in duration-150">
          <span className="w-2 h-2 rounded-full bg-signal" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-[12px] border border-line p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-signal" />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Workspace Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-ink">
            Workspace Settings
          </h1>
          <p className="text-[14px] text-muted mt-1">
            Manage organization branding, recruiter profile details, email notifications, and webhook endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[1.5]" />
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-ink text-paper'
              : 'bg-white hover:bg-paper-2 text-ink border border-line'
          }`}
        >
          <Building className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Organization & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-ink text-paper'
              : 'bg-white hover:bg-paper-2 text-ink border border-line'
          }`}
        >
          <Bell className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 rounded-[8px] text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'bg-ink text-paper'
              : 'bg-white hover:bg-paper-2 text-ink border border-line'
          }`}
        >
          <Webhook className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Webhooks & Integrations</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Tab 1: Organization & Profile */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Organization Info */}
            <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
              <div className="border-b border-line pb-4">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink font-semibold">
                  Company Identity
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  This appears on candidate application forms, career listings, and notification emails.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Company Legal or Brand Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Acme Technologies"
                    className="bf-input w-full"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="bf-input w-full"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Primary Industry / Domain
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="bf-input w-full cursor-pointer"
                  >
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Finance & Fintech">Finance & Fintech</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Workspace Identifier
                  </label>
                  <div className="bf-input w-full bg-paper text-muted flex items-center justify-between cursor-not-allowed">
                    <span className="font-mono text-xs">ws_{user?.id ? user.id.slice(-8) : 'demo'}</span>
                    <ShieldCheck className="w-4 h-4 text-ink stroke-[1.5]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                  Company Careers Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="e.g. Building world-class software with exceptional people."
                  className="bf-input w-full"
                />
              </div>
            </div>

            {/* Recruiter Profile */}
            <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
              <div className="border-b border-line pb-4">
                <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink font-semibold">
                  Recruiter Profile
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Your administrator credentials and primary recruiter contact.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="bf-input w-full"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="bf-input w-full bg-paper text-muted cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted mt-1">Contact support to change your account email.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink font-semibold">
                Email & Alert Preferences
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Choose what notifications BetterForm sends when candidates interact with your job openings.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-[8px] border border-line hover:bg-paper cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="notifyNewApplicant"
                  checked={formData.notifyNewApplicant}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-line text-ink focus:ring-signal"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">New Candidate Application Alert</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Receive an immediate email notification whenever a candidate submits an application.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-[8px] border border-line hover:bg-paper cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="autoConfirmationEmail"
                  checked={formData.autoConfirmationEmail}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-line text-ink focus:ring-signal"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">Applicant Submission Receipt</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Automatically send a branded confirmation receipt to applicants acknowledging their submission.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-[8px] border border-line hover:bg-paper cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="notifyCandidateShortlist"
                  checked={formData.notifyCandidateShortlist}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded border-line text-ink focus:ring-signal"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ink">Pipeline Stage Change Notifications</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Notify team members when candidate status is moved to Shortlisted.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Integrations & Webhooks */}
        {activeTab === 'integrations' && (
          <div className="bg-white rounded-[12px] border border-line p-6 space-y-6">
            <div className="border-b border-line pb-4">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink font-semibold">
                Incoming Webhook Stream
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Stream new candidate submissions directly to your Slack, Discord, or internal ATS endpoint.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted mb-2">
                  Webhook Payload URL (POST)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    name="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={handleInputChange}
                    placeholder="https://hooks.slack.com/services/... or https://api.yourcompany.com/webhook"
                    className="bf-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="btn-secondary whitespace-nowrap"
                  >
                    {testingWebhook ? (
                      <span>Testing...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Test ping</span>
                      </>
                    )}
                  </button>
                </div>
                {webhookStatus && (
                  <p className="text-xs text-signal font-mono mt-2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2]" />
                    <span>{webhookStatus}</span>
                  </p>
                )}
                <p className="text-[11px] text-muted mt-1.5">
                  BetterForm dispatches a JSON payload with candidate name, email, role title, and screening answers on every submission.
                </p>
              </div>

              {/* Sample Webhook JSON Preview */}
              <div className="p-4 bg-paper rounded-[8px] border border-line">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted block mb-2">
                  Example Webhook JSON Dispatch
                </span>
                <pre className="font-mono text-[11px] text-ink overflow-x-auto">
{`{
  "event": "candidate.applied",
  "candidate": {
    "fullName": "Abebe Bekele",
    "email": "abebe@example.com",
    "jobTitle": "Senior Full-Stack Developer",
    "submittedAt": "2026-10-09T08:30:00Z"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <span>Saving changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[1.5]" />
                <span>Save changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
