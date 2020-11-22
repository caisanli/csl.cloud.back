import { FileChunkEntity } from "app/entities/mongodb";
import { File, Folder, User } from "app/entities/mysql";
import { createFileHash, createUUID, twoDecimal } from "app/helpers";
import { clearChunkDir, fileUploadOptions, mergeFile, getFileMimeType, removeFile, getExtName, getCategory, copyFile } from "app/helpers/upload";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FileChunkService } from "app/services/file.chunk.service";
import { FilService } from "app/services/file.service";
import { FolderService } from "app/services/folder.service";
import { ORDER } from "app/typings";
import session from "koa-session";
import { Body, BodyParam, Delete, Get, JsonController, Param, Post, Put, Session, UploadedFile, UseBefore } from "routing-controllers";
@JsonController('/file')
@UseBefore(UserAuthMiddleware)
export class FileController {
    private fileChunkService: FileChunkService;
    private fileService: FilService;
    private folderService: FolderService;
    constructor() {
        this.fileChunkService = new FileChunkService();
        this.fileService = new FilService();
        this.folderService = new FolderService();
    }
    
    @Get('')
    async query(
        @Session() session: any,
        @BodyParam('folderId', {
            required: true
        }) folderId: string,
        @BodyParam('name') name: string,
        @BodyParam('sort', {
            required: true,
            validate: true
        }) sort: string,
        @BodyParam('order', {
            required: true,
            validate: true
        }) order: ORDER,
        @BodyParam('page', {
            required: true
        }) page: number,
        @BodyParam('num', {
            required: true
        }) num: number
    ) {
        const userId = session.user.id;
        const [ files, total ] = await this.fileService.query(userId, folderId, name, sort, order, page, num);
        let folders: Folder[] = [];
        if(folderId === '0') {
            folders = await this.folderService.getFoldersByUserOrParentOrName(userId, folderId);
        } else {
            folders = await this.folderService.getFoldersByUserOrParentOrName(null, folderId);
        }
        const crumbs = await this.folderService.getParents(folderId);
        const result = {
            files,
            folders,
            crumbs,
            page: {
                count: files.length,
                page,
                total
            }
        }
        return { message: '获取成功', data: result, code: 1}
    }
    /**
     * 个人文件上传
     * @param file 
     * @param bodyFile 
     */
    @Post("/upload")
    async upload(
        @Session() session: any,
        @UploadedFile('file', { 
            options: fileUploadOptions, required: true 
        }) file: any, 
        @Body({
            required: true
        }) bodyFile: FileChunkEntity,
        @BodyParam('folder', {
            required: true
        }) folderId: string
    ) {
        const { name, size, modifyDate, chunk, chunks } = bodyFile;
        const hashVal = createFileHash(name, size, modifyDate);
        const user = session.user as User;
        let data: {
            process: number,
            uploaded: boolean
        } = {
            process: 0,
            uploaded: false
        };

        // 查询文件夹
        if(folderId !== '0')  {
            let folder = await this.folderService.getById(folderId);
            if(!folder) {
                clearChunkDir(hashVal);
                return { message: '文件夹不存在', code: 2 };
            }
        }
        if(chunk >= chunks) { // 全部分片上传完成
            let newFileChunk = new FileChunkEntity();
            newFileChunk.id = hashVal;
            // 删除记录的切片文件
            this.fileChunkService.removeByCondition(newFileChunk);
            // 初始化文件
            let file = new File();
            let fileId: string = createUUID();
            let diskFileName: string = fileId; // + (extname ? '.' + extname : '');
            mergeFile(hashVal, diskFileName);
            file.id = fileId;
            file.name = name;
            file.size = size;
            file.modifyDate = new Date(modifyDate / 1);
            file.folderId = folderId;
            file.user = user;
            file.category = getCategory(name);
            file.thumbnail = '';
            // 创建文件
            await this.fileService.create(file);
            data.process = 1;
            data.uploaded = true;
        } else { // 分片未上传完成
            bodyFile.id = hashVal;
            bodyFile._id = hashVal;
            // 设置进度
            data.process = twoDecimal(chunk / chunks);
            // 记录切片文件进度
            await this.fileChunkService.create(bodyFile);
        }
        return { message: '上传成功', data: data, code: 1 }
    }

    /**
     * 更新文件
     * @param id 
     */
    @Put('/rename/:id')
    async rename(
        @Param('id') id: string, 
        @BodyParam('name', { required: true }) name: string
    ) {
        const file = await this.fileService.getById(id);
        if(!file) 
            return { message: '文件不存在', code: 2 };
        file.name = name;
        file.category = getCategory(name);
        this.fileService.update(id, file);
        return { message: '更新成功', code: 1 }
    }

    /**
     * 删除文件
     * @param id 
     */
    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const file = await this.fileService.getById(id)
        if(!file) 
            return { message: '文件不存在', code: 2 };
        removeFile('./' + id + '_' + file.name);
        this.fileService.remove(id);
        return { message: '删除成功', code: 1 }
    }

    /**
     * 移动文件
     * @param session 
     * @param ids 
     * @param folderId 
     */
    @Put('/move')
    async moveTo(
        @BodyParam('ids', {
            required: true
        }) ids: string, 
        @BodyParam('folderId', {
            required: true
        }) folderId: string
    ) {
        // 判断文件夹是否存在
        if(folderId !== '0') {
            const folder = await this.folderService.getById(folderId);
            if(!folder)
                return { message: '文件夹不存在', code: 2 }
        }
        // 判断文件是否存在
        const idArr: string[] = ids.split(',');
        let result = {
            notFound: [],
            already:[]
        }
        for(let i = 0; i < idArr.length; i++) {
            const id = idArr[i];
            const file = await this.fileService.getById(id);
            if(!file) {
                result.notFound.push(id);
                continue;
            }
            // 判断文件是否已存在目标目录
            const queryFile = new File();
            queryFile.folderId = folderId;
            queryFile.id = id;
            const files: File[] = await this.fileService.find(queryFile);
            if(files.length) {
                result.already.push(id);
                continue;
            }
            file.folderId = folderId;
            await this.fileService.update(id, file);
        }
        return { message: '移动成功', data: result, code: 1 }
    }

    /**
     * 拷贝文件
     * @param id 
     * @param folderId 
     */
    @Post('/copy')
    async copy(
        @BodyParam('ids') ids: string, 
        @BodyParam('folderId') folderId: string
    ) {
        // 判断文件夹是否存在
        if(folderId !== '0') {
            const folder = await this.folderService.getById(folderId);
            if(!folder)
                return { message: '文件夹不存在', code: 2 }
        }
        // 判断文件是否存在
        const idArr: string[] = ids.split(',');
        let result = {
            notFound: [],
            already:[]
        }
        for(let i = 0; i < idArr.length; i++) {
            const id = idArr[i];
            const file = await this.fileService.getById(id);
            if(!file) {
                result.notFound.push(id);
                continue;
            }
            // 判断文件是否已存在目标目录
            const queryFile = new File();
            queryFile.folderId = folderId;
            queryFile.id = id;
            const files: File[] = await this.fileService.find(queryFile);
            if(files.length) {
                result.already.push(id);
                continue;
            }
            const newId = createUUID();
            file.folderId = folderId;
            file.id = newId;
            copyFile('./' + id, './' + newId);
            await this.fileService.create(file);
        }
        return { message: '拷贝成功', data: result, code: 1 }
    }

    /**
     * 获取文件信息
     * @param id 
     */
    @Get('/:id')
    async getById(@Param('id') id: string) {
        const file = await this.fileService.getById(id);
        return { message: '获取成功', data: file, code: 2 }
    }

    @Get('/chunk/:id')
    async getFileChunkById(@Param('id') id: string) {
        const result = await this.fileChunkService.getById(id);
        return { message: '查询成功', data: result, code: 1 }
    }

    @Delete('/chunk')
    async deleteFileChunkById() {
        let newFileChunk = new FileChunkEntity();
        newFileChunk.id = '421d0f38361a50d759ac0e9a0d87e2ba';
        this.fileChunkService.removeByCondition(newFileChunk);
    }

    @Post('/type')
    async getFileType(@UploadedFile('file', { 
        options: {
            dest: 'uploads/type/'
        },
        required: true 
    }) file: any) {
        const result = await getFileMimeType('./type/' + file.filename)
        return { message: '获取成功', data: result, code: 1 }
    }
}