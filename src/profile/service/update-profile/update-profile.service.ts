import {Inject, Injectable} from "@nestjs/common";
import {UpdateProfileSaga} from "./saga/update-profile-saga";
import {UserProvider} from "../../domain/contract/user.contract";

@Injectable()
export class UpdateProfileService {
    constructor(
        private readonly saga: UpdateProfileSaga,
        @Inject('UserProvider')
        private readonly hublerProvider: UserProvider
    ) {
    }

    async update(profile: any): Promise<void>{
        //first we update the profile
        await this.hublerProvider.UpdateProfile(profile)

        // start the saga
       await this.saga.start(profile).then()
    }
}