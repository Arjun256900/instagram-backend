import amqplib from "amqplib";
import Profile from "../models/profile_user_model.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || "user.events";
const QUEUE = "profile-service.user-created";
const ROUTING_KEY = "user.created";

async function connectRabbitWithRetry() {
  const maxRetries = 10;
  const retryDelay = 2000;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await amqplib.connect(RABBITMQ_URL);
    } catch (err) {
      console.log(`🐇 RabbitMQ not ready yet (attempt ${i}/${maxRetries})`);
      await new Promise((res) => setTimeout(res, retryDelay));
    }
  }

  throw new Error("RabbitMQ connection failed after multiple attempts");
}

export async function startProfileConsumer() {
  const connection = await connectRabbitWithRetry();
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  console.log(`[PROFILE-SERVICE] 🟢 Listening for "${ROUTING_KEY}" events...`);

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;

      try {
        const eventPayload = JSON.parse(msg.content.toString());
        console.log("📩 Received:", eventPayload);

        const { uid, email, username, displayName, createdAt } = eventPayload;

        await Profile.updateOne(
          { uid },
          {
            $setOnInsert: {
              uid,
              email,
              username,
              displayName: displayName || username,
              bio: "",
              avatarUrl: null,
              followers: [],
              following: [],
              createdAt: createdAt ? new Date(createdAt) : new Date(),
            },
          },
          { upsert: true }
        );

        console.log(`✅ Profile ensured for uid=${uid}`);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Error processing message:", err);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}
