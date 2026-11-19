const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const FIELDS = ["title", "destination", "startDate", "endDate", "travelers", "budget", "travelStyle", "notes"];
const pick = body => Object.fromEntries(FIELDS.filter(k => body[k] !== undefined).map(k => [k, body[k]]));

// Validates and normalises trip fields; returns { error } or { value }.
function clean(data, partial = false) {
  const out = {};
  for (const k of ["title", "destination", "travelStyle", "notes"]) {
    if (data[k] === undefined) continue;
    if (typeof data[k] !== "string") return { error: "Invalid trip details." };
    out[k] = data[k].trim();
  }
  if (out.title !== undefined && !out.title) return { error: "Complete all required trip details." };
  if (out.destination !== undefined && !out.destination) return { error: "Complete all required trip details." };
  if (out.notes && out.notes.length > 1000) return { error: "Notes are too long." };
  for (const k of ["startDate", "endDate"]) {
    if (data[k] === undefined) continue;
    const d = new Date(data[k]);
    if (isNaN(d)) return { error: "Please enter valid dates." };
    out[k] = d.toISOString();
  }
  if (data.travelers !== undefined) {
    const n = Number(data.travelers);
    if (!Number.isFinite(n) || n < 1 || n > 30) return { error: "Travellers must be between 1 and 30." };
    out.travelers = Math.round(n);
  }
  if (data.budget !== undefined) {
    const n = Number(data.budget);
    if (!Number.isFinite(n) || n < 0) return { error: "Budget cannot be negative." };
    out.budget = n;
  }
  if (!partial) {
    for (const k of ["title", "destination", "startDate", "endDate"])
      if (!out[k]) return { error: "Complete all required trip details." };
  }
  return { value: out };
}

router.use(auth);

router.get("/", (req, res) => {
  const trips = db.trips.find(t => t.user === req.user._id);
  res.json(trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
});

router.post("/", (req, res) => {
  const { error, value } = clean(pick(req.body || {}));
  if (error) return res.status(400).json({ message: error });
  if (new Date(value.endDate) < new Date(value.startDate)) return res.status(400).json({ message: "End date cannot be before start date." });
  const trip = db.trips.insert({
    travelers: 1, budget: 0, travelStyle: "Adventure", notes: "", itinerary: [],
    ...value, user: req.user._id
  });
  res.status(201).json(trip);
});

router.put("/:id", (req, res) => {
  const trip = db.trips.findOne(t => t._id === req.params.id && t.user === req.user._id);
  if (!trip) return res.status(404).json({ message: "Trip not found." });
  const { error, value } = clean(pick(req.body || {}), true);
  if (error) return res.status(400).json({ message: error });
  const merged = { ...trip, ...value };
  if (new Date(merged.endDate) < new Date(merged.startDate)) return res.status(400).json({ message: "End date cannot be before start date." });
  res.json(db.trips.update(trip._id, value));
});

router.delete("/:id", (req, res) => {
  const trip = db.trips.findOne(t => t._id === req.params.id && t.user === req.user._id);
  if (!trip) return res.status(404).json({ message: "Trip not found." });
  db.trips.remove(trip._id);
  res.json({ message: "Trip deleted." });
});
module.exports = router;
