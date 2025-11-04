const {Kafka, Partitioners} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'node-order-producer',
    brokers: ['localhost:9092', 'localhost:9093']
})

const producer = kafka.producer({
    createPartitioner : Partitioners.DefaultPartitioner
})

const addData = async (key, value) => {
    try {
        await producer.connect();
        console.log("Connected to the Kafka cluster successfully");

        const result = await producer.send({
            topic: "Orders123",
            messages: [
                {
                    key,
                    value
                }
            ],
            acks: -1
        })

        console.log(`Added order successfully`, { 
            topic: result[0].topicName,
            partition: result[0].partition,
            offset: result[0].baseOffset,
        });

        
    } catch (e) {
        console.log("Error adding order", e);
        
    } finally {
       await producer.disconnect();
       console.log('Disconnected from the Kafka cluster successfully');
    }
    
}


addData("rman1234", JSON.stringify({ event: 'OrderCreated', timestamp: new Date().toISOString() }));