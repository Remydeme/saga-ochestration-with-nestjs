import {Module} from "@nestjs/common";
import {UpdateProfileController} from "./controller/update-profile/update-profile.controller";
import {UpdateProfileService} from "./service/update-profile/update-profile.service";
import {UpdateProfileSaga} from "./service/update-profile/saga/update-profile-saga";
import {
    KafkaMessageBrokerModule
} from "../shared/infrastructure/message-broker/kafka-message-broker/kafka-message-broker.module";
import {UserInMemoryProvider} from "./provider/user.inMemory.provider";

@Module({
    imports: [KafkaMessageBrokerModule.asyncBuild(["AuthService"])],
    controllers: [UpdateProfileController],
    providers: [
        UpdateProfileService,
        UpdateProfileSaga,
        {
            provide: 'UserProvider',
            useClass: UserInMemoryProvider,
        },
        {
            provide: 'AuthProvider',
            useClass: UserInMemoryProvider,
        },
    ],
})
export class ProfileModule {
}