import { Group } from "app/entities/mysql";
import { AdminAuthMiddleware } from "app/middlewares/adminAuth";
import { UserAdminAuthMiddleware } from "app/middlewares/userAdminAuth";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { UserService } from "app/services";
import { GroupService } from "app/services/group.service";
import { Body, BodyParam, Delete, Get, JsonController, Param, Post, Put, QueryParam, Session, UseBefore } from "routing-controllers";

@JsonController('/group')
export class GroupController {
    private groupService: GroupService;
    private userService:UserService;
    constructor() {
        this.groupService = new GroupService();
        this.userService = new UserService();
    }

    /**
     * 创建团队
     * @param group 
     * @param userId 
     */
    @Post()
    @UseBefore(AdminAuthMiddleware)
    async create(@Body({
        validate: true,
        required: true
    }) group: Group, @BodyParam('user') userId: string) {
        const user = await this.userService.getById(userId);
        if(!user) 
            return { message: '用户不存在', code: 2 }
        group.user = user;
        await this.groupService.create(group);
        return { message: '创建成功', code: 1 }
    }
    
    /**
     * 更新团队信息
     * @param id 
     * @param group 
     */
    @Put('/:id')
    @UseBefore(AdminAuthMiddleware)
    async update(@Param('id') id: string, @Body({
        validate: true
    }) group: Group) {
        const oldGroup = await this.groupService.getById(id);
        if(!oldGroup) 
            return { message: '当前团队不存在', code: 2 }
        await this.groupService.update(id, group);
        return { message: '更新成功', code: 1 }
    }
    
    /**
     * 更新团队基本信息
     * @param id 
     * @param name 
     * @param description 
     */
    @Put('/base/:id')
    @UseBefore(UserAuthMiddleware)
    async updateBase(@Param('id') id: string, @BodyParam('name', {
        required: true
    }) name: string, @BodyParam('description', {
        required: true
    }) description: string) {
        const group = await this.groupService.getById(id);
        if(!group)
            return { message: '当前团队不存在', code: 2 }
        group.name = name;
        group.description = description;
        await this.groupService.update(id, group);
    }
    
    /**
     * 删除团队
     * @param id 
     */
    @Delete('/:id')
    @UseBefore(AdminAuthMiddleware)
    async remove(@Param('id') id: string) {
        const oldGroup = await this.groupService.getById(id);
        if(!oldGroup) 
            return { message: '当前团队不存在', code: 2 }
        await this.groupService.remove(id);
        return { message: '删除成功', code: 1 }
    }

    /**
     * 根据ID查询团队
     * @param id 
     */
    @Get('/:id')
    @UseBefore(UserAdminAuthMiddleware)
    async getById(@Param('id') id: string) {
        const group = await this.groupService.getById(id);
        return { message: '查询成功', data: group, code: 1 }
    }

    /**
     * 根据用户ID查询所属团队
     * @param userId 
     */
    @Get('/query/byUser')
    @UseBefore(UserAuthMiddleware)
    async getByUser(
        @Session() session: any
    ) {
        const userId = session.user.id;
        const ownerGroups = await this.groupService.getByUserId(userId)
        const userGroups = await this.userService.getGroups(userId)
        return { message: '查询成功', data: ownerGroups.concat(userGroups), code: 1 }
    }

    /**
     * 查询全部团队 可按名称模糊查询
     * @param name?: string
     */
    @Get()
    @UseBefore(UserAdminAuthMiddleware)
    async getAll(@QueryParam('name') name: string) {
        let result: Group[] = [];
        result = await this.groupService.query(name);
        console.log(result)
        return { message: '获取成功', data: result, code: 1 }
    }
    
    /**
     * 根据ID获取团队下的用户
     * @param id 
     */
    @Get('/users/:id')
    @UseBefore(UserAuthMiddleware)
    async getUsers(@QueryParam('id') id: string) {
        const group = await this.groupService.getById(id);
        if(!group)
            return { message: '团队不存在', code: 2 }
        const users = await this.groupService.findUsersById(id);
        return { message: '查询成功', data: users, code: 1 }
    }

    /**
     * 根据ID获取团队下的角色
     * @param id 
     */
    @Get('/roles/:id')
    @UseBefore(UserAuthMiddleware)
    async getRoles(@QueryParam('id') id: string) {
        const group = await this.groupService.getById(id);
        if(!group)
            return { message: '团队不存在', code: 2 }
        const roles = await this.groupService.findRolesById(id);
        return { message: '查询成功', data: roles, code: 1 }
    }

}