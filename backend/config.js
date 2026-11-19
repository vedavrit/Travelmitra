const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be set in production.");
module.exports = { JWT_SECRET: JWT_SECRET || "development_only_change_me" };
