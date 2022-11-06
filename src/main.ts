import {KafkaMessageBroker} from "./shared/infrastructure/message-broker/kafka-message-broker/kafka-message-broker";
import {MessageBroker} from "./shared/domain/contracts/message-broker";
import {SagaDefinitionBuilder} from "./shared/infrastructure/saga/saga-step-builder/saga-step-builder";
import {Kafka} from "kafkajs";
import {randomInt} from "crypto";
import {SagaProcessor} from "./shared/infrastructure/saga/saga-processor/saga-processor";

async function bootstrap() {
  const kafka = new Kafka({brokers: ['localhost:9092']});
    const messageBroker : MessageBroker= await KafkaMessageBroker.init(kafka,
        ["AccountTransaction", "DeliveryTransaction"])
    const sagaStepBuilder = new  SagaDefinitionBuilder()
        .step("AccountTransaction")
        .onReply(async ()=>{
            //call api to debit account
            console.log("========> debit account")
        }).withCompensation(async ()=>{
            //call api to cancel order
            console.log("failed to debit account cancel order")
        })
        .step("DeliveryTransaction")
        .onReply(async ()=>{
            // Call the api to ask to deliver the order at the address
            if (randomInt(100) % 2){
                throw "error something happened"
            }
            console.log("======> Prepare a delivery at this address")
        }).withCompensation(async ()=>{
            //call the api to cancel the transaction
            console.log("Cancel the debit on the account")

        })

      const sagaPrecessor = new SagaProcessor(messageBroker, sagaStepBuilder.sagaDefinitions)
      await sagaPrecessor.startConsuming()
    sagaPrecessor.start({address: "118 rue de la paix",
            item: {id: "1NJJ123", price: 12, size: "M"}}
        ).then()
    /*for (let index = 0; index < 10; index++){
         sagaPrecessor.start({address: "118 rue de la paix",
             item: {id: "1NJJ123", price: 12, size: "M"}}
         ).then()
     }*/

}
bootstrap().catch((e)=>{
    console.log("An error occurred ", e)
});
