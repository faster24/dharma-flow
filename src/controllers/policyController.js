const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_LOCALE = 'en-US';
const POLICIES_PATH = path.resolve(process.cwd(), 'src/content/policies.json');

const loadPolicies = () => {
  if (!fs.existsSync(POLICIES_PATH)) {
    throw new Error('Policy source file not found');
  }

  const raw = fs.readFileSync(POLICIES_PATH, 'utf8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Policy source is invalid');
  }

  return parsed;
};

const resolvePolicy = (policyEntry, requestedLocale) => {
  if (!policyEntry || typeof policyEntry !== 'object') {
    throw new Error('Policy entry is missing');
  }

  const normalizedLocale = typeof requestedLocale === 'string' && requestedLocale.trim()
    ? requestedLocale.trim()
    : DEFAULT_LOCALE;

  const localizedPolicies = typeof policyEntry.locales === 'object' ? policyEntry.locales : null;

  const hasRequestedLocale = Boolean(localizedPolicies?.[normalizedLocale]);
  const resolvedLocale = hasRequestedLocale ? normalizedLocale : DEFAULT_LOCALE;

  const resolvedPolicy = localizedPolicies
    ? localizedPolicies[resolvedLocale] || localizedPolicies[DEFAULT_LOCALE]
    : policyEntry;

  if (!resolvedPolicy || typeof resolvedPolicy !== 'object') {
    throw new Error('Resolved policy is invalid');
  }

  return {
    locale: resolvedLocale,
    policy: {
      ...resolvedPolicy,
      locale: resolvedLocale,
    },
  };
};

const getPrivacyPolicy = (req, res) => {
  try {
    const policies = loadPolicies();
    const payload = resolvePolicy(policies.privacy, req.query?.locale);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load privacy policy', error: err.message });
  }
};

const getTermsPolicy = (req, res) => {
  try {
    const policies = loadPolicies();
    const payload = resolvePolicy(policies.terms, req.query?.locale);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load terms policy', error: err.message });
  }
};

module.exports = {
  getPrivacyPolicy,
  getTermsPolicy,
};
