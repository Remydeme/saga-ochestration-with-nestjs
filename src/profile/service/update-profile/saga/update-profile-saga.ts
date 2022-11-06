import {SagaOrchestrator} from "../../../../shared/infrastructure/saga/saga-processor/saga-orchestrator";
import {
    SagaDefinitionBuilder
} from "../../../../shared/infrastructure/saga/saga-step-builder/saga-step-builder";
import {randomInt} from "crypto";
import {MessageBroker} from "../../../../shared/domain/contracts/message-broker";
import {Inject} from "@nestjs/common";

export class UpdateProfileSaga extends SagaOrchestrator {
    constructor(@Inject('MessageBroker')
                protected readonly messageBroker: MessageBroker
    ) {
        super(messageBroker)
        this.init().then()
    }

    //configure and start the saga
    async init(){
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
        this.sagaDefinitions = sagaStepBuilder.sagaDefinitions
        await this.startConsuming()
    }

    async startConsuming(){
        await super.startConsuming()
    }


    async start(payload: any): Promise<void> {
        await super.start(payload);
    }
}