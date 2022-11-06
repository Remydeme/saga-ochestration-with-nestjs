import {MessageBroker} from "../../../domain/contracts/message-broker";
import {StepPhase} from "../../../domain/contracts/saga-message";
import {SagaDefinition} from "../saga-step-builder/saga-step-builder";
import {randomUUID} from "crypto";

export class SagaProcessor {
    messageBroker: MessageBroker
    sagaDefinitions: SagaDefinition[]

    constructor(messageBroker: MessageBroker,sagaDefinitions: SagaDefinition[]) {
        this.messageBroker = messageBroker
        this.sagaDefinitions = sagaDefinitions
    }

    static init(messageBroker: MessageBroker, sagaDefinitions: SagaDefinition[]): SagaProcessor{
        return new SagaProcessor(messageBroker, sagaDefinitions)
    }

    async startConsuming() {
        await this.messageBroker.consume(async ({saga, payload, header}) => {
               console.log("Consuming new event")
                switch (saga.phase) {
                    case StepPhase.StepForward: {
                        const stepForward = this.sagaDefinitions[saga.index].phases[StepPhase.StepForward]!.action;
                        try {
                            await stepForward();
                            await this.makeStepForward(saga.index + 1, payload, header);
                        } catch (e) {
                            await this.makeStepBackward(saga.index - 1, payload, header);
                        }
                        return;
                    }
                    case StepPhase.StepBackWard: {
                        const stepBackward = this.sagaDefinitions[saga.index].phases[StepPhase.StepBackWard]!.action;
                        await stepBackward();
                        await this.makeStepBackward(saga.index - 1, payload, header);
                        return;
                    }
                    default: {
                        console.log('UNAVAILBLE SAGA PHASE');
                    }
                }
            }
        );
    }

    async makeStepForward(index: number, payload: any, header: {traceId: string}) {
        if (index >= this.sagaDefinitions.length) {
            console.log('====> Saga finished and transaction successful');
            return;
        }
        await this.messageBroker.send(
           this.sagaDefinitions[index].channelName,
            {
                payload,
                header,
                saga: {
                index: index,
                    phase: StepPhase.StepForward
            }
            });
    }

    async makeStepBackward(index: number,payload: any, header: {traceId: string}) {
        if (index < 0) {
            console.log('===> Saga finished and transaction rolled back');
            return;
        }
        await this.messageBroker.send(
            this.sagaDefinitions[index].channelName,
            {
                payload,
                header,
                saga: {
                    index: index,
                    phase: StepPhase.StepBackWard
                }
            });
    }


    async start(payload: any) {
        await this.makeStepForward(0, payload, {traceId: randomUUID()});
    }
}