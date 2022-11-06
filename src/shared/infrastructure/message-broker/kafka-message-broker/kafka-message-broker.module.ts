import {DynamicModule, Global, Module} from "@nestjs/common";
import {Kafka, Partitioners} from "kafkajs";
import {KafkaMessageBroker} from "./kafka-message-broker";


@Module({})
@Global()
export class KafkaMessageBrokerModule {
    static async asyncBuild(topics: string[]): Promise<DynamicModule> {
        const kafka = new Kafka({brokers: ['localhost:9092']});
        const admin = kafka.admin()
        const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
        const consumer = kafka.consumer({groupId: 'saga'})
        await admin.connect()
        await producer.connect()
        await consumer.connect()
        return {
            module: KafkaMessageBrokerModule,
            providers: [
                {
                    provide: 'MessageBroker',
                    useFactory: () => KafkaMessageBroker.init(kafka, topics)
                }
            ],
            exports: ['MessageBroker']
        }
    }
}