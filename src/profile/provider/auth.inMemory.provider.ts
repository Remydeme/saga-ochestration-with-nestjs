import {AuthProvider} from "../domain/contract/auth.contract";
import {Injectable} from "@nestjs/common";

@Injectable()
export class AuthInMemoryProvider implements AuthProvider{
    updateProfile(profile: any): Promise<void> {
        console.log("Auth provider has update profile")
        return Promise.resolve();
    }
}