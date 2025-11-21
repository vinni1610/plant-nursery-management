const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔐 Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "nursery_secret", { expiresIn: "1d" });
};

// ✅ Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //console.log("🟢 Register attempt:", req.body);

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    //console.log("✅ Registered user:", user.email);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (err) {
    //console.error("❌ Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// ✅ Login user
router.post("/login", async (req, res) => {
  try {
    //console.log("🟢 Login attempt:", req.body);

    const { email, password } = req.body;

    // validate request body
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ where: { email } });
    //console.log("🟡 Found user:", user ? user.email : "none");

    if (!user)
      return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    //console.log("🧩 Password match:", isMatch);

    if (!isMatch)
      return res.status(401).json({ error: "Invalid password" });

    //console.log("✅ Login successful:", user.email);
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (err) {
    //console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// 🧩 fallback to ensure valid JSON
router.use((req, res) => {
  console.log("⚠️ Unhandled auth route:", req.method, req.originalUrl);
  res.status(404).json({ error: "Not found" });
});

module.exports = router;
