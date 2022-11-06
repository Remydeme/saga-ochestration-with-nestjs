import {MessageBroker} from "../../../domain/contracts/message-broker";
import {Kafka, Consumer, Producer, Admin, ITopicConfig, Partitioners} from 'kafkajs';
import {SagaMessage} from "../../../domain/contracts/saga-message";


export class KafkaMessageBroker implements MessageBroker{
    producer : Producer
    consumer : Consumer
    admin: Admin

    constructor(producer: Producer, consumer: Consumer, admin: Admin) {
       this.consumer = consumer
        this.producer = producer
        this.admin = admin
    }

    static async init(kafka: Kafka, topics: string[]): Promise<KafkaMessageBroker> {
        const admin = kafka.admin()
        const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
        const consumer = kafka.consumer({groupId: 'saga'})
        await admin.connect()
        await producer.connect()
        await consumer.connect()

        for (let topic of topics) {
            await consumer.subscribe({topic});
        }

        return new KafkaMessageBroker(producer, consumer, admin)
    }

    async send(topic:string, message: SagaMessage) {
        await this.producer.send({
            topic: topic,
            messages: [
                {value: JSON.stringify(message)}
            ]
        });
    }

    async consume(onEachMessage: (message: SagaMessage)=> Promise<void>){
        await this.consumer.run({eachMessage: async ({message}) =>{
                const sagaMessage = JSON.parse(message.value!.toString()) as SagaMessage;
                console.log("message read", sagaMessage)
                onEachMessage(sagaMessage).catch((error)=>{
                     console.log(error)
                })
            }})
    }
}