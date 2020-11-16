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
        const errors = await UserController.validate(user);
        if(errors.length) {

            return ;
        }
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

    static validate(user: User): Promise<any []> {
        const { name, password, phone, email } = user;
        const errors = [], 
            pswReg = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/,
            phoneReg = /^1[\d]{10}$/,
            emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if(name.length < 2 || name.length > 20) {
            errors.push({prop: 'name', message: '用户名长度在2-20之间'})
        }
        if(password.length < 6) {
            errors.push({prop: 'password', message: '密码长度不能小于6'})
        }
        if(!pswReg.test(password)) {
            errors.push({prop: 'password', message: '密码至少包含1个大写字母，1个小写字母，1个数字，1个特殊字符'})
        }
        if(phone && !phoneReg.test(phone)) {
            errors.push({prop: 'phone', message: '手机格式不正确'})
        }
        if(email && !emailReg.test(email)) {
            errors.push({prop: 'email', message: '邮箱格式不正确'})
        }
        return Promise.resolve(errors);
    }
}