const router = require("express").Router();
const db = require("../db");
const str = v => (typeof v === "string" ? v.trim() : "");

router.post("/", (req, res) => {
  const name = str(req.body.name), email = str(req.body.email), message = str(req.body.message), rating = Number(req.body.rating) || 5;
  if (!name || !email || !message) return res.status(400).json({ message: "Please complete all fields." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Please enter a valid email address." });
  if (name.length > 60 || email.length > 120 || message.length > 1000)
    return res.status(400).json({ message: "Could not submit feedback. Check field lengths and try again." });
  db.feedback.insert({ name, email, message, rating: Math.min(5, Math.max(1, Math.round(rating))) });
  res.status(201).json({ message: "Thanks! Your feedback has been received." });
});
module.exports = router;
