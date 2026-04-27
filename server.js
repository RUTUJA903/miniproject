const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection (IMPORTANT: project DB)
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rsd18",
    database: "project"
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
    } else {
        console.log("✅ MySQL Connected");
    }
});

// ✅ TEST
app.get("/", (req, res) => {
    res.send("Server working ✅");
});


// ================= REGISTER =================
app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    console.log("📩 Register Hit:", email, password);

    if (!email || !password) {
        return res.json({ success: false, message: "Missing fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.log("❌ SQL Error:", err);
                    return res.json({ success: false, message: "User already exists" });
                }

                console.log("✅ User Inserted");
                res.json({ success: true });
            }
        );
    } catch (err) {
        console.log("❌ Server Error:", err);
        res.json({ success: false });
    }
});


// ================= LOGIN =================
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("🔐 Login Hit:", email);

    if (!email || !password) {
        return res.json({ success: false });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ success: false });
            }

            if (result.length === 0) {
                return res.json({ success: false, message: "User not found" });
            }

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (match) {
                console.log("✅ Login Success");
                res.json({ success: true });
            } else {
                res.json({ success: false, message: "Wrong password" });
            }
        }
    );
});

// ================= SERVER =================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
