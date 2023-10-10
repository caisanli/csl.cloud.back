import { User } from "app/entities/mysql";
import { AdminAuthMiddleware } from "app/middlewares/adminAuth";
import { UserAdminAuthMiddleware } from "app/middlewares/userAdminAuth";
import { UserService } from "app/services";
import md5 from "md5";
import { Body, BodyParam, Delete, Get, JsonController, Param, Post, Put, QueryParam, UseBefore } from "routing-controllers";
@JsonController('/user')
export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * 创建用户
     * @returns
     * @memberof UserController
     * @param name
     * @param phone
     * @param email
     */
    @Post()
    @UseBefore(AdminAuthMiddleware)
    async create(
        @BodyParam('name', {
            required: true
        }) name: string,
        @BodyParam('phone') phone: string,
        @BodyParam('email') email: string
    ) {
        const user = new User();
        user.name = name;
        user.password = 'Aa123456!';
        user.phone = phone;
        user.email = email;
        const errors = await UserController.validate(user);
        if(errors.length)
            return {message: errors[0].message, code: 2};
        await this.userService.create(user);
        return  {message: '保存成功', code: 1};
    }

    /**
     * 更新用户信息
     * @param {string} id
     * @param {string} name
     * @param {string} phone
     * @param {string} email
     * @returns
     * @memberof UserController
     */
    @Put('/:id')
    @UseBefore(AdminAuthMiddleware)
    async update(
        @Param('id') id: string,
        @BodyParam('name', {
            required: true
        }) name: string,
        @BodyParam('phone') phone: string,
        @BodyParam('email') email: string
    ) {
        const user = await this.userService.getById(id);
        if(!user)
            return {message: '当前用户不存在', code: 2}
        user.name = name;
        user.phone = phone;
        user.email = email;
        const errors = await UserController.validate(user, true);
        if(errors.length)
            return {message: errors[0].message, code: 2};
        await this.userService.update(id, user);
        return  {message: '保存成功', code: 1};
    }

    /**
     * 更新用户密码
     * @param id
     * @param {string} oldPwd
     * @param {string} newPwd
     * @memberof UserController
     */
    @Put('/password/:id')
    async updatePassword(
        @Param('id') id: string,
        @BodyParam('oldPwd', {
            required: true
        }) oldPwd: string,
        @BodyParam('newPwd', {
            required: true
        }) newPwd: string
    ) {
        const user = await this.userService.getPasswordUserById(id);
        if(!user) return { message: '用户不存在', code: 2 }

        if( md5(oldPwd) !== user.password)
            return { message: '旧密码有误', code: 2 }
        user.password = newPwd;
        const errors = await UserController.validate(user);
        if(errors.length)
            return { message: errors[0].message, code: 2 }
        user.password = md5(user.password);
        await this.userService.update(id, user);
        return { message: '更新密码成功', code: 1 }
    }

    /**
     * 查询用户列表（可根据名称模糊查询
     * @param {string} name
     * @returns
     * @memberof UserController
     */
    @Get()
    @UseBefore(UserAdminAuthMiddleware)
    async getAll(
        @QueryParam('name') name: string
    ) {
        const result = await this.userService.query(name);
        return {message: '获取成功', data: result, code: 1};
    }

    /**
     * 删除用户
     * @param {string} id
     * @returns
     * @memberof UserController
     */
    @Delete('/:id')
    @UseBefore(AdminAuthMiddleware)
    async remove(@Param('id') id: string) {
        const oldUser = await this.userService.getById(id);
        if(!oldUser)
            return {message: '当前用户不存在', code: 2}
        await this.userService.remove(id);
        return { message: '删除成功', code: 1 };
    }

    /**
     * 根据ID查询用户
     * @param {string} id
     * @returns
     * @memberof UserController
     */
    @Get('/:id')
    async getById(@Param('id') id: string) {
        const user = await this.userService.getById(id);
        return {message: '查询成功', data: user, code: 1}
    }

    /**
     * 根据ID查询带密码的用户
     * @param id
     */
    // @Get('/password/:id')
    async getPassword(@Param('id') id: string) {
        const user = await this.userService.getPasswordUserById(id);
        return { message: '查询成功', data: user, code: 1 }
    }

    static validate(user: User, isUpdate?: boolean): Promise<any []> {
        const { name, password, phone, email } = user;
        const errors = [],
            pswReg = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/,
            phoneReg = /^1[\d]{10}$/,
            emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if(name.length < 2 || name.length > 20) {
            errors.push({prop: 'name', message: '用户名长度在2-20之间'})
        }
        if(!isUpdate && password.length < 6) {
            errors.push({prop: 'password', message: '密码长度不能小于6'})
        }
        if(!isUpdate && !pswReg.test(password)) {
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
