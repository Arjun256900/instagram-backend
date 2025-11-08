import amqplib from "amqplib";

let channel = null;
let connection = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || "user.events";

export async function getChannel() {
  if (channel) return channel;
  connection = await amqplib.connect(RABBITMQ_URL);

  channel = await connection.createConfirmChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  // shutdown handling
  const close = () => {
    try {
      if (channel) channel.close();
      if (connection) connection.close();
    } catch (err) {
      // nothing much to do here
    }
    process.on("exit", close);
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);

  return channel;
}

// Publishes an event to exchange with routing key

export async function publishEvent(routingKey, payload = {}) {
  const ch = await getChannel();
  const body = Buffer.from(JSON.stringify(payload));
  const published = ch.publish(
    process.env.RABBITMQ_EXCHANGE || EXCHANGE,
    routingKey,
    body,
    { persistent: true }
  );

  // wait for confirmation from broker that all messages are confirmed
  await ch.waitForConfirms();

  return published;
}
