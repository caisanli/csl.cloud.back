import { Folder, User } from "app/entities/mysql";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { UserService } from "app/services";
import { FolderService } from "app/services/folder.service";
import { Body, BodyParam, JsonController, Post, Session, UseBefore } from "routing-controllers";

@JsonController('/folder')
export class FolderController {
    private userService: UserService;
    private folderService: FolderService;

    constructor() {
        this.userService = new UserService();
        this.folderService = new FolderService();
    }
    @Post()
    @UseBefore(UserAuthMiddleware)
    async create(@Session() session: any, @Body() folder: Folder, @BodyParam('parentId') parentId: string) {
        const user: User = session.user;
        if(parentId !== '0') {
            let parentFolder = await this.folderService.getFolderByUserAndParent(user.id, parentId);
            if(!parentFolder)
                return { message: '父级文件夹不存在', code: 2 }
        }
        folder.user = user;
        folder.parentId = parentId;
        await this.folderService.create(folder);
        return { message: '创建成功', code: 1 }
    }
}