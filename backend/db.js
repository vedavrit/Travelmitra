// Tiny file-based database (no MongoDB needed).
// Data is kept in memory and saved to data/db.json after every change.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const NAMES = ["users", "destinations", "trips", "feedback"];

let data = Object.fromEntries(NAMES.map(n => [n, []]));

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) return save();
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    for (const n of NAMES) data[n] = Array.isArray(parsed[n]) ? parsed[n] : [];
  } catch (err) {
    const backup = DB_FILE + ".corrupt-" + Date.now();
    fs.renameSync(DB_FILE, backup);
    console.error(`db.json was unreadable; saved a copy as ${path.basename(backup)} and started fresh.`);
    save();
  }
}

function save() {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_FILE); // atomic replace, avoids half-written files
}

function collection(name) {
  return {
    all: () => data[name].map(d => ({ ...d })),
    find: fn => data[name].filter(fn).map(d => ({ ...d })),
    findOne: fn => { const d = data[name].find(fn); return d ? { ...d } : null; },
    findById: id => { const d = data[name].find(x => x._id === id); return d ? { ...d } : null; },
    count: () => data[name].length,
    insert(doc) {
      const now = new Date().toISOString();
      const item = { _id: crypto.randomUUID(), ...doc, createdAt: now, updatedAt: now };
      data[name].push(item); save();
      return { ...item };
    },
    insertMany(docs) { return docs.map(d => this.insert(d)); },
    update(id, patch) {
      const i = data[name].findIndex(x => x._id === id);
      if (i === -1) return null;
      data[name][i] = { ...data[name][i], ...patch, _id: id, updatedAt: new Date().toISOString() };
      save();
      return { ...data[name][i] };
    },
    remove(id) {
      const i = data[name].findIndex(x => x._id === id);
      if (i === -1) return false;
      data[name].splice(i, 1); save();
      return true;
    }
  };
}

load();
module.exports = Object.fromEntries(NAMES.map(n => [n, collection(n)]));
