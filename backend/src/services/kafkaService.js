const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer();
const connect = async () => await producer.connect();
const send = async (topic, message) => {
  await producer.send({ topic, messages: [{ value: JSON.stringify(message) }] });
};
module.exports = { connect, send };
