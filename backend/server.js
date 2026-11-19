require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
require("./db"); // loads (or creates) data/db.json
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const destinationRoutes = require("./routes/destinations");
const feedbackRoutes = require("./routes/feedback");
const { seedDestinations } = require("./seed");

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "TravelMitra API" }));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", (_req, res) => res.status(404).json({ message: "API route not found." }));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));
app.use((err, _req, res, _next) => {
  if (err.status !== 400) console.error(err);
  res.status(err.status || 500).json({ message: err.status === 400 ? "Invalid request body." : "Something went wrong." });
});

seedDestinations();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TravelMitra running at http://localhost:${PORT}`));
