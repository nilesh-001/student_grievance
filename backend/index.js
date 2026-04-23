const path = require("path");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMAS =================

// Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const Student = mongoose.model("Student", studentSchema);

// Grievance Schema
const grievanceSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: {
        type: String,
        enum: ["Academic", "Hostel", "Transport", "Other"]
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["Pending", "Resolved"],
        default: "Pending"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }
});

const Grievance = mongoose.model("Grievance", grievanceSchema);

// ================= JWT AUTH MIDDLEWARE =================
const auth = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ msg: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Invalid token" });
    }
};

app.use(express.static(path.join(__dirname, "dist")));

// ================= AUTH ROUTES =================

// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Student({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.json({ msg: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Student.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= GRIEVANCE ROUTES =================

// CREATE GRIEVANCE
app.post("/api/grievances", auth, async (req, res) => {
    try {
        const grievance = new Grievance({
            ...req.body,
            userId: req.user.id
        });

        await grievance.save();
        res.json(grievance);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL GRIEVANCES
app.get("/api/grievances", auth, async (req, res) => {
    try {
        const grievances = await Grievance.find({ userId: req.user.id });
        res.json(grievances);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET GRIEVANCE BY ID
app.get("/api/grievances/:id", auth, async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id);
        res.json(grievance);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE GRIEVANCE
app.put("/api/grievances/:id", auth, async (req, res) => {
    try {
        const updated = await Grievance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE GRIEVANCE
app.delete("/api/grievances/:id", auth, async (req, res) => {
    try {
        await Grievance.findByIdAndDelete(req.params.id);
        res.json({ msg: "Grievance deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH GRIEVANCE
app.get("/api/grievances/search", auth, async (req, res) => {
    try {
        const { title } = req.query;

        const results = await Grievance.find({
            title: { $regex: title, $options: "i" },
            userId: req.user.id
        });

        res.json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


// THEN this
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});