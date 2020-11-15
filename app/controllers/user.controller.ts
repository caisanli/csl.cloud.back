import { User } from "app/entities/mysql";
import { UserService } from "app/services";
import { Body, JsonController, Post } from "routing-controllers";

@JsonController()
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    @Post('/user')
    async create(@Body() user: User) {
        const result = await this.userService.create(user);
        console.log('result', result);
        return '保存成功';
    }
}