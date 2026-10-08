const crypto = require('crypto');

/**
 * Generate a unique slug from a title string.
 * Example: "Senior Full-Stack Developer" -> "senior-full-stack-developer-8f31"
 */
const generateSlug = (title) => {
  const base = (title || 'job')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to hyphens
    .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens

  const randomSuffix = crypto.randomBytes(2).toString('hex'); // 4 characters
  return `${base || 'job'}-${randomSuffix}`;
};

module.exports = { generateSlug };
