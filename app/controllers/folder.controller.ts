import { Folder, User } from "app/entities/mysql";
import { createRepeatName } from "app/helpers";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { UserService } from "app/services";
import { FolderService } from "app/services/folder.service";
import { Body, BodyParam, Delete, Get, JsonController, Param, Post, Put, Session, UseBefore } from "routing-controllers";
import { threadId } from "worker_threads";

@JsonController('/folder')
@UseBefore(UserAuthMiddleware)
export class FolderController {
    private folderService: FolderService;

    constructor() {
        this.folderService = new FolderService();
    }

    /**
     * 创建文件夹
     * @param session 
     * @param folder 
     * @param parentId 
     */
    @Post()
    async create(
        @Session() session: any, 
        @Body() folder: Folder, 
        @BodyParam('parentId') parentId: string
    ) {
        const user: User = session.user;
        if(parentId !== '0') {
            let parentFolder = await this.folderService.getFoldersByUserOrParentOrName(user.id, parentId);
            if(!parentFolder)
                return { message: '父级文件夹不存在', code: 2 }
        }
        const repeatFolder = await this.folderService.getFoldersByUserOrParentOrName(user.id, parentId, folder.name);
        if(repeatFolder.length) {
            folder.name = createRepeatName(folder.name);
        }
        folder.user = user;
        folder.parentId = parentId;
        await this.folderService.create(folder);
        return { message: '创建成功', code: 1 }
    }

    /**
     * 更新文件夹
     * @param session 
     * @param id 
     * @param name 
     * @param description 
     */
    @Put('/:id')
    async update(
        @Session() session: any, 
        @Param('id') id: string, 
        @BodyParam('name', {
            required: true
        }) name: string,
        @BodyParam('description', {
            required: true
        }) description: string
    ) {
        const oldFolder = await this.folderService.getById(id);
        const user: User = session.user;
        if(!oldFolder)
            return  { message: '文件夹不存在', code: 2 };
        const repeatFolder = await this.folderService.getFoldersByUserOrParentOrName(user.id, oldFolder.parentId, name);
        if(repeatFolder.length) 
            name = createRepeatName(name);
        
        oldFolder.name = name;
        oldFolder.description = description;
        await this.folderService.update(id, oldFolder);
        return { message: '更新成功', code: 1 }
    }

    /**
     * 删除文件夹
     * @param id 
     */
    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const oldFolder = await this.folderService.getById(id);
        if(!oldFolder)
            return  { message: '文件夹不存在', code: 2 };
        await this.folderService.remove(id);
        return { message: '删除成功', code: 1 }
    }

    /**
     * 根据文件夹ID获取文件夹信息
     * @param id 
     */
    @Get('/:id')
    async getById(@Param('id') id: string) {
        const folder = await this.folderService.getById(id);
        return { message: '获取成功', data: folder, code: 1 } 
    }

    /**
     * 根据id获取子文件夹
     * @param session 
     * @param id 
     */
    @Get('/:id/children')
    async getChildren(@Session() session: any, @Param('id') id: string) {
        let folders: Folder[] = [], parents: Folder[] = [];
        if(id === '0') {
            let userId = session.user.id;
            folders = await this.folderService.getFoldersByUserOrParentOrName(userId, id);
        } else {
            folders = await this.folderService.getFoldersByUserOrParentOrName(null, id);
            parents = await this.folderService.getParents(id);
        }
        return { message: '获取成功', data: { folders, crumbs: parents }, code: 1 }
    }
}