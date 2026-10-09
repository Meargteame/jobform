import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'text', label: 'Single Line Text (text)' },
  { value: 'textarea', label: 'Long Answer (textarea)' },
  { value: 'number', label: 'Numeric (number)' },
  { value: 'email', label: 'Email Address (email)' },
  { value: 'phone', label: 'Phone Number (phone)' },
  { value: 'url', label: 'Website / Profile URL (url)' },
  { value: 'select', label: 'Dropdown Selection (select)' },
  { value: 'radio', label: 'Single Choice Radio (radio)' },
  { value: 'checkbox', label: 'Multiple Choice Checkbox (checkbox)' },
  { value: 'file', label: 'Additional File Attachment (file)' },
];

const QUESTION_PRESETS = [
  {
    label: 'Years of Professional Experience',
    type: 'number',
    required: true,
    options: [],
  },
  {
    label: 'Notice Period',
    type: 'select',
    required: true,
    options: ['Immediate', '2 Weeks', '1 Month', '2+ Months'],
  },
  {
    label: 'Work Authorization',
    type: 'radio',
    required: true,
    options: ['Citizen / Permanent Resident', 'Work Visa', 'Sponsorship Required'],
  },
  {
    label: 'Portfolio or GitHub URL',
    type: 'url',
    required: false,
    options: [],
  },
  {
    label: 'LinkedIn Profile',
    type: 'url',
    required: false,
    options: [],
  },
  {
    label: 'Salary Expectation (Annual)',
    type: 'text',
    required: false,
    options: [],
  },
];

const FormBuilderPage = () => {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' or 'preview'

  // Modal / Form state for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [modalFormData, setModalFormData] = useState({
    label: '',
    type: 'text',
    required: false,
    options: [''],
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [jobRes, qRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/questions`),
      ]);

      if (jobRes.data.success) {
        setJob(jobRes.data.data);
      }
      if (qRes.data.success) {
        setQuestions(qRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load form builder data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const openAddModal = () => {
    setEditingQuestionId(null);
    setModalFormData({
      label: '',
      type: 'text',
      required: false,
      options: ['Option 1', 'Option 2'],
    });
    setModalError('');
    setShowModal(true);
  };

  const handleApplyPreset = (preset) => {
    setEditingQuestionId(null);
    setModalFormData({
      label: preset.label,
      type: preset.type,
      required: preset.required,
      options: preset.options && preset.options.length > 0 ? [...preset.options] : ['Option 1', 'Option 2'],
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestionId(q._id);
    setModalFormData({
      label: q.label,
      type: q.type,
      required: q.required,
      options: q.options && q.options.length > 0 ? [...q.options] : ['Option 1', 'Option 2'],
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...modalFormData.options];
    updated[index] = value;
    setModalFormData({ ...modalFormData, options: updated });
  };

  const addOptionField = () => {
    setModalFormData({
      ...modalFormData,
      options: [...modalFormData.options, `Option ${modalFormData.options.length + 1}`],
    });
  };

  const removeOptionField = (index) => {
    const updated = modalFormData.options.filter((_, i) => i !== index);
    setModalFormData({ ...modalFormData, options: updated });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!modalFormData.label.trim()) {
      setModalError('Please enter a question label.');
      return;
    }

    const needsOptions = ['select', 'radio', 'checkbox'].includes(modalFormData.type);
    let cleanedOptions = [];
    if (needsOptions) {
      cleanedOptions = modalFormData.options.map((o) => o.trim()).filter(Boolean);
      if (cleanedOptions.length === 0) {
        setModalError('Please provide at least one option for this choice type.');
        return;
      }
    }

    try {
      setModalLoading(true);

      const payload = {
        label: modalFormData.label.trim(),
        type: modalFormData.type,
        required: modalFormData.required,
        options: cleanedOptions,
      };

      if (editingQuestionId) {
        const res = await api.put(`/questions/${editingQuestionId}`, payload);
        if (res.data.success) {
          setQuestions((prev) =>
            prev.map((q) => (q._id === editingQuestionId ? res.data.data : q))
          );
          setShowModal(false);
        }
      } else {
        const res = await api.post(`/jobs/${jobId}/questions`, payload);
        if (res.data.success) {
          setQuestions((prev) => [...prev, res.data.data]);
          setShowModal(false);
        }
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this screening question?')) {
      return;
    }

    try {
      const res = await api.delete(`/questions/${questionId}`);
      if (res.data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleMoveOrder = async (questionId, direction) => {
    try {
      const res = await api.patch(`/questions/${questionId}/order`, { direction });
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reorder question.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 font-sans text-ink">
        <Loader2 className="w-6 h-6 text-ink animate-spin stroke-[1.5]" />
        <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
          Loading builder...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-ink">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">
                Form builder
              </h1>
              {job?.status === 'published' && (
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] bg-paper px-2 py-0.5 rounded-[4px] border border-line text-ink">
                  Published
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1">
              Custom application form for <strong className="text-ink font-semibold">{job?.title}</strong>
            </p>
          </div>
        </div>

        {/* View Switch & Public Link */}
        <div className="flex items-center gap-2">
          {job?.slug && (
            <a
              href={`/apply/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-compact"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Public link</span>
            </a>
          )}

          <div className="inline-flex rounded-[8px] border border-line bg-paper p-0.5">
            <button
              onClick={() => setActiveTab('builder')}
              className={`h-[32px] px-3 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-ink text-paper'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`h-[32px] px-3 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-ink text-paper'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0 stroke-[1.5]" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'builder' ? (
        <div className="space-y-6">
          {/* Section: Standard Built-in Fields */}
          <div className="bg-white rounded-[12px] border border-line p-6 space-y-4">
            <div className="pb-3 border-b border-line">
              <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-muted">
                Standard Questions (Included by Default)
              </h3>
              <p className="text-xs text-muted mt-1">
                Captured automatically on every candidate application.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Full Name', format: 'Single Line Text', required: true },
                { title: 'Email Address', format: 'Email format', required: true },
                { title: 'Phone Number', format: 'Phone format', required: true },
                { title: 'Resume / CV', format: 'PDF, DOC, DOCX up to 5MB', required: true },
              ].map((field, i) => (
                <div key={i} className="p-3.5 bg-paper border border-line rounded-[8px] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink">{field.title}</p>
                    <p className="font-mono text-[11px] text-muted mt-0.5">{field.format}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    Required
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Custom Questions */}
          <div className="bg-white rounded-[12px] border border-line p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-line">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Custom Questions ({questions.length})
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Tailored prompts: text, dropdown, radio, number, or portfolio links.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="btn-primary btn-compact"
              >
                <Plus className="w-4 h-4 stroke-[1.5]" />
                <span>Add question</span>
              </button>
            </div>

            {/* Quick Question Presets Chips */}
            <div className="p-3.5 bg-paper rounded-[8px] border border-line space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted block">
                Quick Question Presets (Click to add)
              </span>
              <div className="flex flex-wrap gap-2">
                {QUESTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="h-[30px] px-2.5 rounded-[6px] text-xs font-semibold bg-white hover:bg-paper-2 border border-line text-ink transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[1.5] text-muted" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="py-12 px-4 text-center border border-dashed border-line rounded-[8px] bg-paper">
                <p className="text-xs font-semibold text-ink">No custom questions added yet</p>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  Click below to add vacancy-specific questions like years of experience, work authorization, or portfolio URLs.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-4 btn-secondary btn-compact"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Add first question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="p-4 rounded-[8px] border border-line bg-paper flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted">#{idx + 1}</span>
                        <h4 className="text-xs font-semibold text-ink">{q.label}</h4>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          {q.required ? '(Required)' : '(Optional)'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                          type: {q.type}
                        </span>
                        {q.options && q.options.length > 0 && (
                          <span>
                            &bull; choices: {q.options.slice(0, 3).join(', ')}
                            {q.options.length > 3 ? ` (+${q.options.length - 3})` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ordering, Edit, Delete */}
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => handleMoveOrder(q._id, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[1.5]" />
                      </button>

                      <button
                        onClick={() => handleMoveOrder(q._id, 'down')}
                        disabled={idx === questions.length - 1}
                        title="Move Down"
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                      </button>

                      <button
                        onClick={() => openEditModal(q)}
                        title="Edit question"
                        className="p-1.5 text-muted hover:text-ink"
                      >
                        <Edit2 className="w-4 h-4 stroke-[1.5]" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        title="Delete question"
                        className="p-1.5 text-muted hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preview Tab */
        <div className="bg-white rounded-[12px] border border-line p-8 space-y-6">
          <div className="border-b border-line pb-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Live Preview
            </span>
            <h2 className="text-2xl font-bold text-ink mt-1">
              Apply for {job?.title || 'Position'}
            </h2>
            <p className="text-xs text-muted">{job?.companyName} &bull; {job?.location}</p>
          </div>

          <div className="space-y-5 opacity-90 pointer-events-none">
            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Full name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                disabled
                placeholder="Jane Doe"
                className="w-full h-[44px] px-3.5 bg-paper border border-line rounded-[8px] text-sm text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Email address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  disabled
                  placeholder="jane@example.com"
                  className="w-full h-[44px] px-3.5 bg-paper border border-line rounded-[8px] text-sm text-ink"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Phone number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  disabled
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-[44px] px-3.5 bg-paper border border-line rounded-[8px] text-sm text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-ink mb-1.5">
                Resume / CV <span className="text-red-600">*</span>
              </label>
              <div className="border border-dashed border-line rounded-[8px] p-4 text-center bg-paper">
                <p className="font-mono text-xs text-muted">PDF, DOC, DOCX up to 5MB</p>
              </div>
            </div>

            {questions.map((q) => (
              <div key={q._id} className="pt-2">
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  {q.label} {q.required && <span className="text-red-600">*</span>}
                </label>

                {q.type === 'textarea' ? (
                  <textarea
                    disabled
                    rows={3}
                    className="w-full p-3 bg-paper border border-line rounded-[8px] text-sm text-ink"
                    placeholder="Candidate response here..."
                  />
                ) : (
                  <input
                    type={q.type}
                    disabled
                    placeholder={`Enter ${q.label.toLowerCase()}...`}
                    className="w-full h-[44px] px-3.5 bg-paper border border-line rounded-[8px] text-sm text-ink"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 border border-line relative animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-ink">
                {editingQuestionId ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink p-1 rounded"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-[8px] bg-red-50/80 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.5]" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4">
              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Question label <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Years of Professional Experience"
                  value={modalFormData.label}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, label: e.target.value })
                  }
                  className="bf-input w-full"
                />
              </div>

              <div>
                <label className="block text-[14px] font-semibold text-ink mb-1.5">
                  Question input type <span className="text-red-600">*</span>
                </label>
                <select
                  value={modalFormData.type}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, type: e.target.value })
                  }
                  className="bf-input w-full cursor-pointer"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="requiredCheck"
                  checked={modalFormData.required}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, required: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0B0B0C] border-line rounded"
                />
                <label htmlFor="requiredCheck" className="text-xs font-semibold text-ink cursor-pointer">
                  Required question
                </label>
              </div>

              {['select', 'radio', 'checkbox'].includes(modalFormData.type) && (
                <div className="pt-3 border-t border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      Choice Options
                    </label>
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="text-xs font-semibold text-ink hover:underline cursor-pointer"
                    >
                      + Add choice
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {modalFormData.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="bf-input h-[36px] text-xs flex-1"
                        />
                        {modalFormData.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionField(i)}
                            className="p-1 text-muted hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-tertiary btn-compact"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="btn-primary btn-compact"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 stroke-[1.5]" />}
                  <span>{editingQuestionId ? 'Update question' : 'Save question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
