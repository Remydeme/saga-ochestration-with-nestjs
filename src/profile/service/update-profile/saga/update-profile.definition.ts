import {Inject, Injectable} from "@nestjs/common";
import {AuthProvider} from "../../../domain/contract/auth-provider.contract";

@Injectable()
class UpdateProfileDefinitionService {
    constructor(@Inject('AuthProvider') AuthProvider: AuthProvider) {
    }


}