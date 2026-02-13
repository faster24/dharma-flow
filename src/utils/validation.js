const parseBirthday = (birthday) => {
  if (!birthday) return undefined;
  const date = new Date(birthday);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? tags.map((tag) => (tag || '').toString().trim().toLowerCase()).filter(Boolean)
    : [];

module.exports = {
  parseBirthday,
  normalizeTags,
};
