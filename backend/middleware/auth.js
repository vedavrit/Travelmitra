const jwt = require("jsonwebtoken");
const db = require("../db");
module.exports = function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ message: "Please log in to continue." });
    const payload = jwt.verify(token, require("../config").JWT_SECRET);
    const user = db.users.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Account not found." });
    const { password, ...safe } = user;
    req.user = safe;
    next();
  } catch {
    res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};
