export enum StepPhase {
    StepForward = 'STEP_FORWARD',
    StepBackWard = 'STEP_BACKWARD'
}

export type SagaMessage<P = any> = {
    payload: P,
    header: {
        traceId: string
    }
    saga: {
        index: number,
        phase: StepPhase
    }
}