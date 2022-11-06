import {StepPhase} from "../../../domain/contracts/saga-message";

export type Action<P = any, RES = void> = (payload?: P) => Promise<RES>;

export type SagaDefinition = {
    channelName: string,
    phases: { [key in StepPhase]?: { action: Action } }
}


export class SagaDefinitionBuilder {
    index: number | null = null;
    sagaDefinitions: SagaDefinition[] = [];

    //step call it before define the comportment of the step
    //it enables you to define your step
    step(channelName: string): SagaDefinitionBuilder {
        this.index = this.index === null ? 0 : this.index + 1;
        this.sagaDefinitions = [...this.sagaDefinitions, {channelName, phases: {}}];
        return this;
    }


    onReply(action:  Action): SagaDefinitionBuilder {
        this.checkIndex();
        this.sagaDefinitions[this.index!].phases[StepPhase.StepForward] = {action: action};
        return this;
    }

    withCompensation(action:  Action): SagaDefinitionBuilder {
        this.checkIndex();
        this.sagaDefinitions[this.index!].phases[StepPhase.StepBackWard] = {action: action};
        return this;
    }

    private checkIndex() {
        if (this.index === null) {
            throw new Error('before build saga definition, you need to invoke step function before');
        }
    }
}