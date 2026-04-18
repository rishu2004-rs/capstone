const express = require("express");
const router = express.Router();
// Render Pages

router.get("/", (req, res) => res.render("home"));
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));
router.get("/dashboard", (req, res) => res.render("dashboard"));
router.get("/case/:id", (req, res) => res.render("case-details", { caseId: req.params.id }));
router.get("/admin", (req, res) => res.render("admin"));
router.get("/search", (req, res) => res.render("search"));

module.exports = router;
