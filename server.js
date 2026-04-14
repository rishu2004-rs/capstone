const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const caseRoutes = require("./routes/caseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const pageRoutes = require("./routes/pageRoutes");


// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Frontend Pages Routes
app.use("/", pageRoutes);

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});