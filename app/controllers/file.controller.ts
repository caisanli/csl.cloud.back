import { FileChunkEntity } from "app/entities/mongodb";
import { File, User } from "app/entities/mysql";
import { createFileHash, createUUID, twoDecimal } from "app/helpers";
import { clearChunkDir, fileUploadOptions, mergeFile, getFileMimeType } from "app/helpers/upload";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FileChunkService } from "app/services/file.chunk.service";
import { FilService } from "app/services/file.service";
import { FolderService } from "app/services/folder.service";
import { FileTypeResult } from "file-type";
import { Body, BodyParam, Delete, Get, JsonController, Param, Post, Session, UploadedFile, UseBefore } from "routing-controllers";

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
            let fileId = createUUID();
            let diskFileName: string = fileId + '_' + name;
            mergeFile(hashVal, diskFileName);
            let fileTypeResult: FileTypeResult = await getFileMimeType(diskFileName);
            file.id = fileId;
            file.name = name;
            file.size = size;
            file.modifyDate = new Date(modifyDate / 1);
            file.folderId = folderId;
            file.user = user;
            file.type = fileTypeResult ? fileTypeResult.ext : 'other';
            file.icon = fileTypeResult ? fileTypeResult.ext : 'other';
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