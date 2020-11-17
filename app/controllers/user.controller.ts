import { User } from "app/entities/mysql";
import { AdminAuthMiddleware } from "app/middlewares/adminAuth";
import { UserAdminAuthMiddleware } from "app/middlewares/userAdminAuth";
import { UserService } from "app/services";
import { Body, Delete, Get, JsonController, Param, Post, Put, UseBefore } from "routing-controllers";
@JsonController('/user')
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    @Post()
    @UseBefore(AdminAuthMiddleware)
    async create(@Body({
        required: true,
        validate: true
    }) user: User) {
        const errors = await UserController.validate(user);
        if(errors.length) 
            return {message: errors, code: 2};
        await this.userService.create(user);
        return  {message: '保存成功', code: 1};
    }
    
    @Put('/:id')
    @UseBefore(AdminAuthMiddleware)
    async update(@Param('id') id: string, @Body({
        validate: false
    }) user: User) {
        const oldUser = await this.userService.getById(id);
        if(!oldUser) 
            return {message: '当前用户不存在', code: 2}
        const newUser: User = Object.assign({}, oldUser, user)
        const errors = await UserController.validate(newUser);
        if(errors.length) 
            return {message: errors, code: 2};
        await this.userService.update(id, newUser);
        return  {message: '保存成功', code: 1};
    }

    @Get()
    @UseBefore(UserAdminAuthMiddleware)
    async getAll() {
        const result = await this.userService.getAll();
        return {message: '获取成功', data: result, code: 1};
    }

    @Delete('/:id')
    @UseBefore(AdminAuthMiddleware)
    async remove(@Param('id') id: string) {
        const oldUser = await this.userService.getById(id);
        if(!oldUser) 
            return {message: '当前用户不存在', code: 2}
        await this.userService.remove(id);
        return {message: '删除成功', code: 1};
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