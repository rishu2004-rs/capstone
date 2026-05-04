const express = require("express");
const router = express.Router();
const QRCode = require('qrcode');

// Render Pages

router.get("/", (req, res) => res.render("home"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));
router.get("/dashboard", (req, res) => res.render("dashboard"));
const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

router.get("/case/:id", async (req, res) => {
    try {
        let renderUrl = process.env.RENDER_URL;
        if (!renderUrl) {
            const host = req.get('host');
            if (host.includes('localhost')) {
                // Replace localhost with actual LAN IP so phones can connect
                renderUrl = `http://${getLocalIp()}:${process.env.PORT || 5000}`;
            } else {
                renderUrl = `${req.protocol}://${host}`;
            }
        }
        
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

