import {SagaProcessor} from "../../../../shared/infrastructure/saga/saga-processor/saga-processor";
import {SagaDefinitionBuilder} from "../../../../shared/infrastructure/saga/saga-step-builder/saga-step-builder";
import {randomInt} from "crypto";
import {MessageBroker} from "../../../../shared/domain/contracts/message-broker";

export abstract class Saga {
    private readonly sagaProcessor: SagaProcessor
    protected constructor(protected readonly messageBroker : MessageBroker) {
    }

    async init(){
        throw Error("You need to override this method and implement your own one")
    }

    async start(payload: any){
        await this.sagaProcessor.start(payload)
    }
}

export class UpdateProfileSaga extends Saga {
    constructor(protected readonly messageBroker : MessageBroker) {
        super(messageBroker)
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
        const sagaPrecessor = new SagaProcessor(this.messageBroker, sagaStepBuilder.sagaDefinitions)
        await sagaPrecessor.startConsuming()
    }


    async start(payload: any): Promise<void> {
        await super.start(payload);
    }
}