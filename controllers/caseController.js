const Case = require('../models/Case');
const QRCode = require('qrcode');

// @desc    Get all cases
// @route   GET /api/cases
// @access  Public
const getCases = async (req, res) => {
    const cases = await Case.find({}).populate('createdBy', 'name email');
    res.json(cases);
};

// @desc    Create a case
// @route   POST /api/cases
// @access  Private/Admin
const createCase = async (req, res) => {
    const { caseNumber, title, petitioner, respondent, courtName, advocate, hearingDate, description, lawyer, client } = req.body;

    const caseExists = await Case.findOne({ caseNumber });

    if (caseExists) {
        return res.status(400).json({ message: 'Case already exists with this case number' });
    }

    const caseItem = new Case({
        caseNumber,
        title,
        petitioner,
        respondent,
        courtName,
        advocate,
        lawyer,
        client: client || req.user._id, // Default client to creator if not specified
        hearingDate,
        description,
        createdBy: req.user._id
    });

    const createdCase = await caseItem.save();
    res.status(201).json(createdCase);
};

// @desc    Get case by ID
// @route   GET /api/cases/:id
// @access  Public
const getCaseById = async (req, res) => {
    const caseItem = await Case.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('lawyer', 'name email')
        .populate('client', 'name email');

    if (caseItem) {
        res.json(caseItem);
    } else {
        res.status(404).json({ message: 'Case not found' });
    }
};

// @desc    Update case status
// @route   PUT /api/cases/update-status/:id
// @access  Private/Admin/CourtStaff
const updateCaseStatus = async (req, res) => {
    const { status, hearingDate, lawyer, client } = req.body;

    const caseItem = await Case.findById(req.params.id);

    if (caseItem) {
        caseItem.status = status || caseItem.status;
        caseItem.hearingDate = hearingDate || caseItem.hearingDate;
        if (lawyer) caseItem.lawyer = lawyer;
        if (client) caseItem.client = client;

        // Add to history
        caseItem.history.push({
            status: caseItem.status,
            hearingDate: caseItem.hearingDate,
            updatedBy: req.user._id
        });

        const updatedCase = await caseItem.save();
        res.json(updatedCase);
    } else {
        res.status(404).json({ message: 'Case not found' });
    }
};


// @desc    Upload documents to a case
// @route   POST /api/cases/:id/documents
// @access  Private/Admin/CourtStaff
const uploadDocument = async (req, res) => {
    const { name, url } = req.body;

    const caseItem = await Case.findById(req.params.id);

    if (caseItem) {
        caseItem.documents.push({ name, url });
        const updatedCase = await caseItem.save();
        res.json(updatedCase);
    } else {
        res.status(404).json({ message: 'Case not found' });
    }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private/Admin
const deleteCase = async (req, res) => {
    const caseItem = await Case.findById(req.params.id);

    if (caseItem) {
        await caseItem.deleteOne();
        res.json({ message: 'Case removed' });
    } else {
        res.status(404).json({ message: 'Case not found' });
    }
};

// @desc    Search cases
// @route   GET /api/cases/search/:query
// @access  Public
const searchCases = async (req, res) => {
    const query = req.params.query;
    const cases = await Case.find({
        $or: [
            { caseNumber: { $regex: query, $options: 'i' } },
            { petitioner: { $regex: query, $options: 'i' } },
            { respondent: { $regex: query, $options: 'i' } },
            { advocate: { $regex: query, $options: 'i' } }
        ]
    });

    res.json(cases);
};

// @desc    Search case by case number (specific for prompt requirements)
// @route   GET /api/cases/search-number/:caseNumber
// @access  Public
const searchByCaseNumber = async (req, res) => {
    const caseItem = await Case.findOne({ caseNumber: req.params.caseNumber });

    if (caseItem) {
        res.json({
            caseNumber: caseItem.caseNumber,
            title: caseItem.title,
            status: caseItem.status,
            hearingDate: caseItem.hearingDate,
            history: caseItem.history,
            documents: caseItem.documents
        });
    } else {
        res.status(404).json({ message: 'Case not found' });
    }
};

// @desc    Get QR code for case access
// @route   GET /api/cases/:id/qr
// @access  Public
const getCaseQRCode = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const protocol = req.protocol;
        const host = req.get('host');
        const caseUrl = `${protocol}://${host}/cases/${caseItem._id}`;

        const qrImage = await QRCode.toDataURL(caseUrl);
        res.json({ qrCode: qrImage, url: caseUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error generating QR code', error: error.message });
    }
};

module.exports = { 
    getCases, 
    createCase, 
    getCaseById, 
    updateCaseStatus, 
    uploadDocument,
    deleteCase, 
    searchCases,
    searchByCaseNumber,
    getCaseQRCode
};

