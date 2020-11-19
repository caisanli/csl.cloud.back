import { FileChunkEntity } from "app/entities/mongodb";
import { createFileHash, twoDecimal } from "app/helpers";
import { fileUploadOptions, mergeFile } from "app/helpers/upload";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FileChunkService } from "app/services/file.chunk.service";
import { Body, Delete, Get, JsonController, Param, Post, UploadedFile, UseBefore } from "routing-controllers";

@JsonController('/file')
// @UseBefore(UserAuthMiddleware)
export class FileController {
    private fileChunkService: FileChunkService;

    constructor() {
        this.fileChunkService = new FileChunkService();
    }

    /**
     * 个人文件上传
     * @param file 
     * @param bodyFile 
     */
    @Post("/upload")
    async upload(@UploadedFile('file', { options: fileUploadOptions }) file: any, @Body() bodyFile: FileChunkEntity) {
        const hashVal = createFileHash(bodyFile.name, bodyFile.size, bodyFile.modifyTime);
        let data: {
            process: number,
            uploaded: boolean,
        } = {
            process: 0,
            uploaded: false
        };
        if(bodyFile.chunk >= bodyFile.chunks) { // 全部分片上传完成
            mergeFile(hashVal, bodyFile.name);
            let newFileChunk = new FileChunkEntity();
            newFileChunk.id = hashVal;
            this.fileChunkService.removeByCondition(newFileChunk);
            data.process = 1;
            data.uploaded = true;
        } else { // 分片未上传完成
            const fileChunk = new FileChunkEntity();
            fileChunk.id = hashVal;
            fileChunk._id = hashVal;
            fileChunk.name = bodyFile.name;
            fileChunk.modifyTime = bodyFile.modifyTime;
            fileChunk.chunk = bodyFile.chunk;
            fileChunk.chunks = bodyFile.chunks;
            fileChunk.size = file.size;
            data.process = twoDecimal(Number(bodyFile.chunk) / Number(bodyFile.chunks));
            await this.fileChunkService.create(fileChunk);
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
}