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
const chatRoutes = require("./routes/chatRoutes");



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
app.use("/api/chat", chatRoutes);


// Frontend Pages Routes
app.use("/", pageRoutes);

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket logic
io.on("connection", (socket) => {
    socket.on("join_case", (caseId) => {
        socket.join(caseId);
        console.log(`User joined case room: ${caseId}`);
    });

    socket.on("send_message", async (data) => {
        const { caseId, senderId, content } = data;
        try {
            const Message = require("./models/Message");
            const newMessage = new Message({
                caseId,
                sender: senderId,
                content
            });
            await newMessage.save();
            const populated = await Message.findById(newMessage._id).populate("sender", "name role");
            
            // Broadcast to the specifically joined case room
            io.to(caseId).emit("new_message", populated);
        } catch (err) {
            console.error("Socket Message Error:", err);
        }
    });

    socket.on("disconnect", () => {
        // Handle disconnect
    });
});


// Attach io to app to use in controllers
app.set("io", io);

// Port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});