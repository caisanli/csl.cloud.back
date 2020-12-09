import { File, Folder, Share, User } from "app/entities/mysql";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FilService, FolderService, UserService } from "app/services";
import ShareService from "app/services/share.service";
import { BodyParam, JsonController, Post, UseBefore } from "routing-controllers";

@JsonController('/share')
@UseBefore(UserAuthMiddleware)
export class shareController {
    private shareService:ShareService;
    private fileService: FilService;
    private folderService: FolderService;
    private userService: UserService;
    constructor() {
        this.shareService = new ShareService();
        this.fileService = new FilService();
        this.folderService = new FolderService();
        this.userService = new UserService();
    }

    /**
     *  分享
     * @param {string} files
     * @param {string} folders
     * @memberof FileController
     */
    @Post('')
    async create(
        @BodyParam('files') fileIds: string,
        @BodyParam('folders') folderIds: string,
        @BodyParam('users') userIds: string
    ) {
        if(!userIds)
            return { code: 2, message: '请选择用户' }
        let users: User[] = [];

        let userIds2: string[] = userIds.split(',');
        for(let i = 0; i < userIds2.length; i++) {
            let id = userIds2[i];
            let user = await this.userService.getById(id);
            if(user) users.push(user)
        }
        
        if(!users.length)
            return { code: 2, message: '请选择用户' }

        let files:File[] = [], folders: Folder[] = [];
        let fileIds2 = (fileIds ? fileIds.split(',') : []);
        for(let i = 0; i < fileIds2.length; i++) {
            let id = fileIds2[i];
            let file = await this.fileService.getById(id);
            if(file) files.push(file);
        }
        
        let folderIds2 = (folderIds ? folderIds.split(',') : []);
        for(let i = 0; i < folderIds2.length; i++) {
            let id = folderIds2[i];
            let folder = await this.folderService.getById(id);
            if(folder) folders.push(folder);
        }
        if(!files.length && !folders.length) 
            return { code: 2, message: '请选择要分享的文件/文件夹' }
        let share: Share = new Share();
        
        share.files = files;
        share.folders = folders;
        share.users = users;
        share.type = "person";
        await this.shareService.create(share);
        return { code: 1, message: '分享成功' };
    }
}