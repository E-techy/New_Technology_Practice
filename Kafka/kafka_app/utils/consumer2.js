const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: "Aman holla",
    brokers: ['localhost:9092', 'localhost:9093']
})

const consumer = kafka.consumer({
    groupId: "order modify"
})



const receiveDataFromProducer = async (topics) => {
    try {

        // wait for the consumer client to connect to the kafka cluster
        await consumer.connect();

        console.log("Started listening to the kafka cluster")

        // Subscribe to a particular topic which is being produced by the producer
        consumer.subscribe({
        topics: topics,
        fromBeginning: true
        })

        console.log("Started listening to the topic", topics);

        // Starting the consumer to start receiving the messages from the brokers
        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {

                const key = message.key.toString();
                const value = message.value.toString();

                console.log(`✅ MESSAGE RECEIVED!`);
                console.log(`Topic: ${topic} is this , Partition: ${partition} is this, Offset: ${message.offset}`);
                console.log(`Key: ${key}`);
                console.log(`Value: ${value}`);
            }
        })

        
    } catch (error) {
        console.log("Error running the consumer", error)

        // Disconnection the connection only when there is an error;
        await consumer.disconnect();
    }
}

receiveDataFromProducer(["Orders123"]);