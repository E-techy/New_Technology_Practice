// consumer_manual_commit.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'manual-commit-consumer',
    brokers: ['localhost:9092', 'localhost:9093']
});

// Use a new Group ID to start reading from the beginning or from the last uncommitted offset
const consumer = kafka.consumer({ 
    groupId: 'order-commit-group', 
    // CRITICAL: Disable automatic commits
    allowAutoTopicCreation: false,
    autoCommit: false 
});

const runConsumer = async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'Orders123', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const offset = message.offset;
                const value = message.value.toString();
                
                console.log(`\n--- Received: P${partition}, Offset: ${offset} ---`);
                
                try {
                    // 1. Process Message and Persist to Downstream DB (Placeholder)
                    const processedData = JSON.parse(value);
                    
                    // Simulate processing time and a database write
                    // If this save operation fails, the offset should NOT be committed.
                    console.log(`Processing Order ID ${message.key.toString()}...`);
                    // await database.saveOrder(processedData); 

                    // 2. Commit the Offset MANUALLY (Only on success)
                    // We commit the OFFSET + 1, because the offset committed is the NEXT message 
                    // the consumer should read.
                    const nextOffset = (BigInt(offset) + BigInt(1)).toString();
                    
                    await consumer.commitOffsets([{
                        topic,
                        partition,
                        offset: nextOffset,
                    }]);

                    console.log(`SUCCESS: Manually committed offset ${nextOffset} for Partition ${partition}.`);

                } catch (e) {
                    // If any error occurs (e.g., DB failure, JSON parse error), 
                    // the offset is NOT committed. The consumer will retry this message 
                    // after a restart or on the next poll cycle.
                    console.error(`FAILURE: Processing failed for message at offset ${offset}. Offset NOT committed.`, e);
                }
            },
        });

    } catch (error) {
        console.error('Fatal consumer error:', error);
    }
};

runConsumer();