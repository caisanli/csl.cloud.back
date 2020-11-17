import { User } from "app/entities/mysql";
import { UserService } from "app/services";
import md5 from "md5";
import { BodyParam, Ctx, Delete, JsonController, Post } from "routing-controllers";
import { Context } from "vm";

@JsonController('/login')
export class LoginController {
    private userService: UserService;
    constructor() {
        this.userService = new UserService();
    } 
    @Post('/admin')
    async admin(@BodyParam('password') password: string) {
        const ADMIN_PASSWORD = 'Aa123456!';
        if(password !== ADMIN_PASSWORD) 
            return { message: '密码错误', code: 2 }
        return { message: '登录成功', code: 1 };
    }

    @Post()
    async user(@BodyParam('name', {
        required: true
    }) name: string, @BodyParam('password', {
        required: true
    }) password: string, @Ctx() ctx: Context) {
        const user = new User();
        user.name = name;
        user.password = md5(password);
        const results = await this.userService.find(user);
        if(!results.length)
            return { message: '用户名、密码有误', code: 2 };
        ctx.session.user = {currentTime: Date.now()};
        return {message: '登录成功', code: 1}
    }

    @Delete('/out')
    async out(@Ctx() ctx: Context) {
        ctx.session.user = null;
        return {message: '退出成功', code: 1}
    }
}