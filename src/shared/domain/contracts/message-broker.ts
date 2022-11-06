import {SagaMessage} from "./saga-message";

export interface MessageBroker {
    send(topic:string,message: SagaMessage)
    consume(onEachMessage: (message: SagaMessage)=> Promise<void>)
}