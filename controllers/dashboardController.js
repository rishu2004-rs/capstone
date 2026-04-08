const Case = require('../models/Case');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private/Admin/CourtStaff
const getDashboardStats = async (req, res) => {
    try {
        const totalCases = await Case.countDocuments();
        const pendingCases = await Case.countDocuments({ status: 'Pending' });
        const closedCases = await Case.countDocuments({ status: 'Closed' });
        const inProgressCases = await Case.countDocuments({ status: 'In Progress' });
        const hearingScheduledCases = await Case.countDocuments({ status: 'Hearing Scheduled' });
        const dismissedCases = await Case.countDocuments({ status: 'Dismissed' });

        res.json({
            totalCases,
            pendingCases,
            closedCases,
            inProgressCases,
            hearingScheduledCases,
            dismissedCases
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
