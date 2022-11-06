import {MessageBroker} from "../../../domain/contracts/message-broker";
import {StepPhase} from "../../../domain/contracts/saga-message";
import {SagaDefinition} from "../saga-step-builder/saga-step-builder";
import {randomUUID} from "crypto";

export abstract class SagaOrchestrator {
    protected messageBroker: MessageBroker
    private _sagaDefinitions: SagaDefinition[]

    protected constructor(messageBroker: MessageBroker) {
        this.messageBroker = messageBroker
    }


    set sagaDefinitions(value: SagaDefinition[]) {
        this._sagaDefinitions = value;
    }

    init(){
        throw Error("Need to override this method. Define your step and start consuming here")
    }

    async startConsuming() {
        await this.messageBroker.consume(async ({saga, payload, header}) => {
               console.log("Consuming new event")
                switch (saga.phase) {
                    case StepPhase.StepForward: {
                        const stepForward = this._sagaDefinitions[saga.index].phases[StepPhase.StepForward]!.action;
                        try {
                            await stepForward();
                            await this.makeStepForward(saga.index + 1, payload, header);
                        } catch (e) {
                            await this.makeStepBackward(saga.index - 1, payload, header);
                        }
                        return;
                    }
                    case StepPhase.StepBackWard: {
                        const stepBackward = this._sagaDefinitions[saga.index].phases[StepPhase.StepBackWard]!.action;
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
        if (index >= this._sagaDefinitions.length) {
            console.log('====> Saga finished and transaction successful');
            return;
        }
        await this.messageBroker.send(
           this._sagaDefinitions[index].channelName,
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
            this._sagaDefinitions[index].channelName,
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