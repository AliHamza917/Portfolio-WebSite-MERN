const mongoose = require("mongoose");

// Cache the connection so serverless functions (Vercel) reuse it
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

const DBconnection = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to your environment variables.");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log(`MongoDB Connected Successfully: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next request
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = DBconnection;
