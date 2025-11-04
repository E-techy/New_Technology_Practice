const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'topic-metadata-checker',
    brokers: ["localhost:9092", "localhost:9093"]
})

const admin = kafka.admin();

const checkPartitions = async (topicName) => {
    try {
        await admin.connect();
        
        // Fetch metadata for the specified topic
        const metadata = await admin.fetchTopicMetadata({ topics: [topicName] });
        
        // The partition count is the length of the 'partitions' array for the topic
        const topicMetadata = metadata.topics.find(t => t.name === topicName);
        
        if (topicMetadata) {
            const partitionCount = topicMetadata.partitions.length;
            console.log(`✅ Topic '${topicName}' has ${partitionCount} partitions.`);
            // You can also see the details for each partition:
            // console.log(topicMetadata.partitions);
        } else {
            console.log(`Topic '${topicName}' not found.`);
        }

    } catch (e) {
        console.error('Error fetching topic metadata:', e);
    } finally {
        await admin.disconnect();
    }
};

checkPartitions('Orders123');