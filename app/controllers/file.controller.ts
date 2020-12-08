import { FileChunkEntity } from "app/entities/mongodb";
import { File, Folder, User } from "app/entities/mysql";
import { createFileHash, createUUID, twoDecimal } from "app/helpers";
import { clearChunkDir, fileUploadOptions, mergeFile, getFileMimeType, removeFile, getCategory, copyFile, getFileStat, getFileMime, getFileBuffer, zip } from "app/helpers/upload";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FileChunkService } from "app/services/file.chunk.service";
import { FilService } from "app/services/file.service";
import { FolderService } from "app/services/folder.service";
import { ORDER } from "app/typings";
import { Request } from "koa";
import { Body, BodyParam, Ctx, Delete, Get, JsonController, OnUndefined, Param, Post, Put, QueryParam, Req, Res, Session, UploadedFile, UseBefore } from "routing-controllers";
import { Context } from "vm";
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

    /**
     *
     * 获取文件列表
     * @param {*} session
     * @param {string} folderId
     * @param {string} name
     * @param {string} sort
     * @param {ORDER} sort
     * @param {number} page
     * @param {number} num
     * @returns
     * @memberof FileController
     */
    @Get()
    async query(
        @Session() session: any,
        @QueryParam('folderId', {
            required: true
        }) folderId: string,
        @QueryParam('name') name: string,
        @QueryParam('sort', {
            required: true,
            validate: true
        }) sort: string,
        @QueryParam('order', {
            required: true,
            validate: true
        }) order: ORDER,
        @QueryParam('page', {
            required: true
        }) page: number,
        @QueryParam('num', {
            required: true
        }) num: number
    ) {
        const userId = session.user.id;
        const [files, total] = await this.fileService.query(userId, folderId, name, sort, order, page, num);
        let folders: Folder[] = [];
        if (folderId === '0') {
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
                count: Math.ceil(total / num),
                page,
                total
            }
        }
        return { message: '获取成功', data: result, code: 1 }
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
        if (folderId !== '0') {
            let folder = await this.folderService.getById(folderId);
            if (!folder) {
                clearChunkDir(hashVal);
                return { message: '文件夹不存在', code: 2 };
            }
        }
        // 检测分片文件是否传完
        if (chunk / 1 >= chunks / 1) { // 分片文件传完
            let newFileChunk = new FileChunkEntity();
            newFileChunk.id = hashVal;
            // 删除记录的切片文件
            this.fileChunkService.removeByCondition(newFileChunk);
            // 初始化文件
            let file = new File();
            let fileId: string = createUUID(name);
            let diskFileName: string = fileId; // + (extname ? '.' + extname : '');
            mergeFile(hashVal, diskFileName, name);
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
     *
     * 获取文件分片上传进度
     * @param {string} name
     * @param {number} size
     * @param {number} modifyDate
     * @returns
     * @memberof FileController
     */
    @Post('/chunk/process')
    async getChunkProcess(
        @BodyParam('name', {
            required: true
        }) name: string,
        @BodyParam('size', {
            required: true
        }) size: number,
        @BodyParam('modifyDate', {
            required: true
        }) modifyDate: number
    ) {
        const query = new FileChunkEntity();
        const hashVal = createFileHash(name, size, modifyDate);
        query._id = hashVal;
        query.id = hashVal;
        const chunkFiles = await this.fileChunkService.find(query);
        return { message: '获取成功', data: chunkFiles[0], code: 1 }
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
        if (!file)
            return { message: '文件不存在', code: 2 };
        file.name = name;
        file.category = getCategory(name);
        this.fileService.update(id, file);
        return { message: '更新成功', code: 1 }
    }

    /**
     * 批量删除文件、文件夹
     * @param ids 
     */
    @Delete('')
    async delete(
        @QueryParam('fileIds') fileIds: string, 
        @QueryParam('folderIds') folderIds: string
    ) {
        let newFolderIds: string[] = folderIds ? folderIds.split(',') : [];
        for(let i = 0; i < newFolderIds.length; i++) {
            let id = newFolderIds[i];
            if(!id) continue;
            const folder = await this.folderService.getById(id);
            if(!folder) continue;
            let folderCount = await this.folderService.getChildrenCount(id);
            if(folderCount > 0) continue;
            let fileCount = await this.fileService.getFileCount(id);
            if(fileCount > 0) continue;
            await this.folderService.remove(id);
        }

        let newFileIds:string[] = fileIds ? fileIds.split(',') : [];
        for(let i = 0; i < newFileIds.length; i++) {
            let id = newFileIds[i];
            if(!id) continue;
            const file = await this.fileService.getById(id);
            if (!file) continue;
            removeFile('./' + id + '_' + file.name);
            this.fileService.remove(id);
        }
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
        if (folderId !== '0') {
            const folder = await this.folderService.getById(folderId);
            if (!folder)
                return { message: '文件夹不存在', code: 2 }
        }
        // 判断文件是否存在
        const idArr: string[] = ids.split(',');
        let result = {
            notFound: [],
            already: []
        }
        for (let i = 0; i < idArr.length; i++) {
            const id = idArr[i];
            const file = await this.fileService.getById(id);
            if (!file) {
                result.notFound.push(id);
                continue;
            }
            // 判断文件是否已存在目标目录
            const queryFile = new File();
            queryFile.folderId = folderId;
            queryFile.id = id;
            const files: File[] = await this.fileService.find(queryFile);
            if (files.length) {
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
    @Put('/copy')
    async copy(
        @BodyParam('ids') ids: string,
        @BodyParam('folderId') folderId: string
    ) {
        // 判断文件夹是否存在
        if (folderId !== '0') {
            const folder = await this.folderService.getById(folderId);
            if (!folder)
                return { message: '文件夹不存在', code: 2 }
        }
        // 判断文件是否存在
        const idArr: string[] = ids.split(',');
        let result = {
            notFound: [],
            already: []
        }
        for (let i = 0; i < idArr.length; i++) {
            const id = idArr[i];
            const file = await this.fileService.getById(id);
            if (!file) {
                result.notFound.push(id);
                continue;
            }
            // 判断文件是否已存在目标目录
            const queryFile = new File();
            queryFile.folderId = folderId;
            queryFile.id = id;
            const files: File[] = await this.fileService.find(queryFile);
            if (files.length) {
                result.already.push(id);
                continue;
            }
            const newId = createUUID(file.name);
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
        return { message: '获取成功', data: file, code: 1 }
    }

    /**
     * 预览文件
     * @param id 
     */
    @Get('/preview/:id')
    @OnUndefined(206)
    async preview(
        @Param('id') id: string,
        @Req() req: Request,
        @Ctx() ctx: Context
    ) {
        try {
            const file = await this.fileService.getById(id);
            if (!file) {
                ctx.body = ctx.body = { message: '找不到文件', code: 2 };;
                return ;
            }
            const filePath = './' + id ;
            const stat = getFileStat(filePath);
            const range: string = req.headers.range;
            const type = getFileMime(file.name);
            if (!range) {
                const fileBuffer = await getFileBuffer(filePath, { start: 0, end: stat.size - 1 });
                ctx.type = type;
                ctx.body = fileBuffer;
            } else {
                const positions = range.replace(/bytes=/, '').split('-');
                const start = parseInt(positions[0], 10);
                const end = positions[1] ? parseInt(positions[1], 10) : stat.size - 1;
                const chunkSize = (end - start) + 1;
                const fileBuffer = await getFileBuffer(filePath, { start, end });
                const head = {
                    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': type
                }
                ctx.set(head);
                ctx.body = fileBuffer;
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     *
     * 下载文件和文件夹
     * @param {string} id
     * @memberof FileController
     */
    @Get('/folder/download')
    @OnUndefined(200)
    async download(
        @QueryParam('files') files: string,
        @Ctx() ctx: Context
    ) {
        try {
            let fileIds = files ? files.split(',') : [];
            if(!fileIds.length) 
                return { message: '请选择文件', code: 2 }
            
            if(fileIds.length === 1) {
                let id = fileIds[0];
                const file = await this.fileService.getById(id);
                if (!file) 
                    return { message: '找不到文件', code: 2 };
                
                const filePath = './' + id ;
                const stat = getFileStat(filePath);
                const type = getFileMime(file.name);
                const fileBuffer = await getFileBuffer(filePath, { start: 0, end: stat.size - 1 });
                ctx.type = type;
                ctx.attachment(file.name);
                ctx.body = fileBuffer;
            } else {
                let files: File[] = [];
                for(let i = 0; i < fileIds.length; i++) {
                    let id = fileIds[i];
                    if(!id) return ;
                    let file = await this.fileService.getById(id);
                    if(file) files.push(file);
                }
                const zipBuffer = await zip(files);
                ctx.type = 'application/zip';
                ctx.attachment('附件.zip');
                ctx.body = zipBuffer;
            }
        } catch (error) {
            console.log(error);
        }
    }

    @Get('/chunk/:id')
    async getFileChunkById(@Param('id') id: string) {
        const query = new FileChunkEntity();
        query._id = id;
        query.id = id;
        const result = await this.fileChunkService.find(query);
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