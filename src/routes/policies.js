const { Router } = require('express');
const { getPrivacyPolicy, getTermsPolicy } = require('../controllers/policyController');

const router = Router();

router.get('/privacy', getPrivacyPolicy);
router.get('/terms', getTermsPolicy);

module.exports = router;
