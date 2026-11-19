const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../config");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tokenFor = user => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
const publicUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const str = v => (typeof v === "string" ? v.trim() : "");

router.post("/register", async (req, res) => {
  try {
    const name = str(req.body.name), email = str(req.body.email).toLowerCase(), password = typeof req.body.password === "string" ? req.body.password : "";
    if (!name || name.length > 60 || !EMAIL_RE.test(email) || password.length < 6 || password.length > 72)
      return res.status(400).json({ message: "Enter your name, a valid email and a password of 6–72 characters." });
    if (db.users.findOne(u => u.email === email)) return res.status(409).json({ message: "An account with this email already exists." });
    const user = db.users.insert({ name, email, password: await bcrypt.hash(password, 12), role: "user" });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { console.error(err); res.status(500).json({ message: "Could not create account." }); }
});

router.post("/login", async (req, res) => {
  try {
    const email = str(req.body.email).toLowerCase();
    const user = db.users.findOne(u => u.email === email);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Email or password is incorrect." });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (err) { console.error(err); res.status(500).json({ message: "Login failed." }); }
});

router.get("/me", require("../middleware/auth"), (req, res) => res.json({ user: req.user }));
module.exports = router;
