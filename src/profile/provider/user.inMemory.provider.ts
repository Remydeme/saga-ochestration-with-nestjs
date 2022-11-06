import {UserProvider} from "../domain/contract/user.contract";
import {Injectable} from "@nestjs/common";

@Injectable()
export class UserInMemoryProvider implements UserProvider{
    UpdateProfile(profile: any): Promise<void> {
        console.log("User Provider has update profile")
        return Promise.resolve();
    }
}