import { User } from "app/entities/mysql";
import { UserService } from "app/services";
import { Body, Get, JsonController, Post } from "routing-controllers";

@JsonController('/user')
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    @Post()
    async create(@Body() user: User) {
        const result = await this.userService.create(user);
        console.log('result', result);
        return '保存成功';
    }

    @Get()
    async getAll() {
        const result = await this.userService.getAll();
        console.log('result', result);
        return '获取成功';
    }
}