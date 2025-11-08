import app from "./app.js";
import mongoose from "mongoose";
import { startProfileConsumer } from "./messaging/rabbitmq_consumer.js";

const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/profile-service";

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🗄️  Profile-service connected to MongoDB");

    await startProfileConsumer();

    app.listen(PORT, () => {
      console.log(`👤 Profile-service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting profile service:", err);
  }
}

start();
