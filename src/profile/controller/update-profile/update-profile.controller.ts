import {UpdateProfileService} from "../../service/update-profile/update-profile.service";
import {Body, Controller, Post} from "@nestjs/common";

@Controller('')
export class UpdateProfileController {
    constructor(private readonly service: UpdateProfileService) {
    }

    @Post('/profiles')
    async update(@Body() profile: any){
       await this.service.update(profile)
    }
}