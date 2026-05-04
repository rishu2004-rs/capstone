const express = require("express");
const router = express.Router();
const QRCode = require('qrcode');

// Render Pages

router.get("/", (req, res) => res.render("home"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));
router.get("/dashboard", (req, res) => res.render("dashboard"));
router.get("/case/:id", async (req, res) => {
    try {
        // Force the Render URL even when testing locally so the QR code works on mobile
        const renderUrl = process.env.RENDER_URL || 'https://ecourt-backend.onrender.com';
        const caseUrl = `${renderUrl}/case/${req.params.id}`;
        const qrCode = await QRCode.toDataURL(caseUrl);
        res.render("case-details", { caseId: req.params.id, renderUrl, qrCode });
    } catch (err) {
        console.error("QR Code generation error:", err);
        res.render("case-details", { caseId: req.params.id, renderUrl: null, qrCode: null });
    }
});
router.get("/admin", (req, res) => res.render("admin"));
router.get("/search", (req, res) => res.render("search"));

module.exports = router;

