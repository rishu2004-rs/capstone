const express = require('express');
const router = express.Router();
const { 
    getCases, 
    createCase, 
    getCaseById, 
    updateCaseStatus, 
    uploadDocument,
    deleteCase, 
    searchCases,
    searchByCaseNumber,
    getCaseQRCode
} = require('../controllers/caseController');
const { protect, admin, courtStaff } = require('../middleware/authMiddleware');

router.route('/')
    .get(getCases)
    .post(protect, admin, createCase);

router.get('/search/:query', searchCases);
router.get('/search-number/:caseNumber', searchByCaseNumber);

router.route('/:id')
    .get(getCaseById)
    .delete(protect, admin, deleteCase);

router.get('/:id/qr', getCaseQRCode);

router.put('/update-status/:id', protect, courtStaff, updateCaseStatus);
router.post('/:id/documents', protect, courtStaff, uploadDocument);


module.exports = router;
