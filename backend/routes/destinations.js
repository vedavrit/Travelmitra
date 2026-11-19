const router = require("express").Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const region = typeof req.query.region === "string" ? req.query.region : "";
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60).toLowerCase() : "";
    const list = db.destinations.find(d => {
      if (region && region !== "All" && d.region !== region) return false;
      if (!q) return true;
      return [d.name, d.state, ...(d.tags || [])].some(v => String(v || "").toLowerCase().includes(q));
    });
    res.json(list.sort((a, b) => (b.rating || 0) - (a.rating || 0)));
  } catch (err) { console.error(err); res.status(500).json({ message: "Could not load destinations." }); }
});

router.get("/:id", (req, res) => {
  const item = db.destinations.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Destination not found." });
  res.json(item);
});
module.exports = router;
