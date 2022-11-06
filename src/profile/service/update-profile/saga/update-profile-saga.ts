import {SagaOrchestrator} from "../../../../shared/infrastructure/saga/saga-processor/saga-orchestrator";
import {
    SagaDefinitionBuilder
} from "../../../../shared/infrastructure/saga/saga-step-builder/saga-step-builder";
import {randomInt} from "crypto";
import {MessageBroker} from "../../../../shared/domain/contracts/message-broker";
import {Inject} from "@nestjs/common";
import {AuthProvider} from "../../../domain/contract/auth.contract";
import {UserProvider} from "../../../domain/contract/user.contract";

export class UpdateProfileSaga extends SagaOrchestrator {
    constructor(@Inject('MessageBroker')
                protected readonly messageBroker: MessageBroker,
                @Inject('AuthProvider')
                protected  readonly authProvider: AuthProvider,
                @Inject('UserProvider')
                protected  readonly userProvider: UserProvider
    ) {
        super(messageBroker)
        this.init().then()
    }

    //configure and start the saga
    async init(){
        const sagaStepBuilder = new  SagaDefinitionBuilder()
            .step("AuthService")
            .onReply(async (payload)=>{
              //await this.authProvider.updateProfile(payload)
                console.log("Profile updated in auth database ", payload)
            }).withCompensation(async (payload)=>{
                //call api to cancel profile update in user service database
                await this.userProvider.UpdateProfile(payload)
                console.log("failed to update profile in auth database")
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