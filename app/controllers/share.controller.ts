import { File, Folder, Share, User } from "app/entities/mysql";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FilService, FolderService, UserService } from "app/services";
import ShareService from "app/services/share.service";
import { BodyParam, JsonController, Post, UseBefore, Session, Get, QueryParam, Param } from "routing-controllers";

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
        @Session() session: any,
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
        let names: string[] = []
        let files:File[] = [], folders: Folder[] = [];
        let folderIds2 = (folderIds ? folderIds.split(',') : []);
        for(let i = 0; i < folderIds2.length; i++) {
            let id = folderIds2[i];
            let folder = await this.folderService.getById(id);
            if(folder) {
                folders.push(folder);
                names.push(folder.name)
            }
        }
        
        let fileIds2 = (fileIds ? fileIds.split(',') : []);
        for(let i = 0; i < fileIds2.length; i++) {
            let id = fileIds2[i];
            let file = await this.fileService.getById(id);
            if(file) {
                files.push(file);
                names.push(file.name);
            }
        }
        
        if(!files.length && !folders.length) 
            return { code: 2, message: '请选择要分享的文件/文件夹' }
        let share: Share = new Share();
        share.userId = session.user.id;
        share.files = files;
        share.folders = folders;
        share.users = users;
        share.type = "person";
        share.count = names.length;
        share.name = names.length === 1 ? names[0] : names[0] + '等';
        await this.shareService.create(share);
        return { code: 1, message: '分享成功' };
    }

    /**
     * 获取我的分享
     * @param {*} session
     * @returns
     * @memberof shareController
     */
    @Get()
    async query(
        @Session() session: any
    ) {
        let userId = session.user.id;
        let shares = await this.shareService.getByUser(userId);
        return { message: '获取成功', code: 1, data: shares }
    }

    /**
     * 获取分享给我的
     * @param {*} session
     * @returns
     * @memberof shareController
     */
    @Get('/toMe')
    async queryToMe(
        @Session() session: any
    ) {
        let userId = session.user.id;
        let shares = await this.shareService.getToMeByUser(userId);
        return { message: '获取成功', code: 1, data: shares }
    }

    /**
     * 获取分享的详情
     * @param {string} id
     * @returns
     * @memberof shareController
     */
    @Get('/:id/detail')
    async getDetail(
        @Param('id') id: string
    ) {
        let data = await this.shareService.getDetail(id);
        return { message: '获取成功', code: 1, data }
    }
}