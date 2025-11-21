/**
 * Converts a string into a URL-friendly slug.
 * @param {string} text - The string to slugify.
 * @returns {string} The slugified string.
 */
function slugify(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

module.exports = { slugify };