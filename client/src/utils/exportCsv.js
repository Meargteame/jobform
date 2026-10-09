/**
 * BetterForm Candidate CSV Export Utility
 * Generates standards-compliant UTF-8 CSV with Excel BOM for instant opening in spreadsheets.
 */
export function exportCandidatesCsv(candidates, filename = 'betterform_candidates.csv') {
  if (!candidates || candidates.length === 0) {
    alert('No candidate records to export.');
    return;
  }

  const headers = [
    'Candidate Name',
    'Email Address',
    'Phone Number',
    'Hiring Status',
    'Job Role',
    'Submission Date',
    'CV Link',
    'Screening Answers Summary',
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = candidates.map((c) => {
    const answersSummary = (c.answers || [])
      .map((a) => `${a.label}: ${Array.isArray(a.answer) ? a.answer.join(', ') : a.answer}`)
      .join(' | ');

    return [
      escapeCsv(c.fullName),
      escapeCsv(c.email),
      escapeCsv(c.phone),
      escapeCsv(c.status),
      escapeCsv(c.job?.title || 'Job Posting'),
      escapeCsv(new Date(c.submittedAt).toISOString().split('T')[0]),
      escapeCsv(c.cvUrl || 'None'),
      escapeCsv(answersSummary),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
