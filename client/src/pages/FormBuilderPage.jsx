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
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Eye,
  Settings2,
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
        // Update question
        const res = await api.put(`/questions/${editingQuestionId}`, payload);
        if (res.data.success) {
          setQuestions((prev) =>
            prev.map((q) => (q._id === editingQuestionId ? res.data.data : q))
          );
          setShowModal(false);
        }
      } else {
        // Add question
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
    if (!window.confirm('Are you sure you want to delete this question?')) {
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
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading application form builder...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Application Form Builder
              </h1>
              {job?.status === 'published' && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Published
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Customize candidate application questions for{' '}
              <span className="font-semibold text-gray-800">{job?.title}</span>.
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center space-x-2">
          {job?.slug && (
            <a
              href={`/apply/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Candidate Link</span>
            </a>
          )}

          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'builder'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'builder' ? (
        <div className="space-y-6">
          {/* Section: Default Built-in Questions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Standard Application Questions (Always Included)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  These 4 essential fields are automatically captured on every candidate application.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Full Name</p>
                  <p className="text-xs text-gray-400">Single Line Text</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                  Required
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Email Address</p>
                  <p className="text-xs text-gray-400">Email format</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                  Required
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Phone Number</p>
                  <p className="text-xs text-gray-400">Phone format</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                  Required
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Resume / CV File</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX up to 5MB</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                  Required
                </span>
              </div>
            </div>
          </div>

          {/* Section: Custom Questions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Custom Application Questions ({questions.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add role-specific questions like experience, portfolios, tech stack, or screening essays.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No custom questions added yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Click "Add Question" to include customized prompts such as "Years of Experience", "GitHub URL", or screening queries.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Question</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-gray-900">{q.label}</h4>
                        {q.required ? (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            Optional
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-[11px]">
                          type: {q.type}
                        </span>
                        {q.options && q.options.length > 0 && (
                          <span>
                            Options: {q.options.slice(0, 3).join(', ')}
                            {q.options.length > 3 ? ` (+${q.options.length - 3} more)` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls: Move Up, Move Down, Edit, Delete */}
                    <div className="flex items-center space-x-1 self-end sm:self-auto">
                      <button
                        onClick={() => handleMoveOrder(q._id, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveOrder(q._id, 'down')}
                        disabled={idx === questions.length - 1}
                        title="Move Down"
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <div className="w-px h-4 bg-gray-200 mx-1"></div>

                      <button
                        onClick={() => openEditModal(q)}
                        title="Edit Question"
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        title="Delete Question"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Form Preview Section */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Live Preview
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              Apply for {job?.title || 'Position'}
            </h2>
            <p className="text-xs text-gray-500">{job?.companyName} &bull; {job?.location}</p>
          </div>

          <div className="space-y-5 opacity-90 pointer-events-none">
            {/* Standard fields preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled
                placeholder="Jane Doe"
                className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  disabled
                  placeholder="jane@example.com"
                  className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  disabled
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Resume / CV <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
              </div>
            </div>

            {/* Custom questions preview */}
            {questions.map((q) => (
              <div key={q._id} className="pt-2">
                <label className="block text-sm font-medium text-gray-700">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </label>

                {q.type === 'textarea' ? (
                  <textarea
                    disabled
                    rows={3}
                    className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    placeholder="Candidate enters detailed response here..."
                  ></textarea>
                ) : q.type === 'select' ? (
                  <select
                    disabled
                    className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  >
                    <option>Select an option...</option>
                    {q.options?.map((opt, i) => (
                      <option key={i}>{opt}</option>
                    ))}
                  </select>
                ) : q.type === 'radio' ? (
                  <div className="mt-2 space-y-2">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                        <input type="radio" disabled name={`preview_${q._id}`} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : q.type === 'checkbox' ? (
                  <div className="mt-2 space-y-2">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                        <input type="checkbox" disabled />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={q.type}
                    disabled
                    placeholder={`Enter ${q.label.toLowerCase()}...`}
                    className="mt-1 block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Question */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingQuestionId ? 'Edit Application Question' : 'Add Custom Question'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Question Label / Prompt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Years of Professional Experience"
                  value={modalFormData.label}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, label: e.target.value })
                  }
                  className="mt-1.5 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Question Input Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalFormData.type}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, type: e.target.value })
                  }
                  className="mt-1.5 block w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="requiredCheck"
                  checked={modalFormData.required}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, required: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="requiredCheck" className="text-sm font-medium text-gray-700">
                  Candidate must answer this question (Required)
                </label>
              </div>

              {/* Options field for select, radio, checkbox */}
              {['select', 'radio', 'checkbox'].includes(modalFormData.type) && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Answer Choices / Options <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addOptionField}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {modalFormData.options.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                        {modalFormData.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionField(i)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center space-x-1"
                >
                  {modalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>{editingQuestionId ? 'Update Question' : 'Add Question'}</span>
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
