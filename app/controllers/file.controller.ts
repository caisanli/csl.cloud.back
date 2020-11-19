import { FileChunkEntity } from "app/entities/mongodb";
import { createFileHash } from "app/helpers";
import { fileUploadOptions, mergeFile } from "app/helpers/upload";
import { UserAuthMiddleware } from "app/middlewares/userAuth";
import { FileChunkService } from "app/services/file.chunk.service";
import { Body, Get, JsonController, Param, Post, UploadedFile, UseBefore } from "routing-controllers";

@JsonController('/file')
// @UseBefore(UserAuthMiddleware)
export class FileController {
    private fileChunkService: FileChunkService;

    constructor() {
        this.fileChunkService = new FileChunkService();
    }

    @Post("/upload")
    async upload(@UploadedFile('file', { options: fileUploadOptions }) file: any, @Body() bodyFile: any) {
        const hashVal = createFileHash(bodyFile.name, bodyFile.size, bodyFile.modifyTime);
        if(bodyFile.chunk >= bodyFile.chunks) { // 全部分片上传完成
            mergeFile(hashVal, bodyFile.name);
        } else { // 分片未上传完成
            const fileChunk = new FileChunkEntity();
            fileChunk._id = hashVal;
            fileChunk.id = hashVal;
            fileChunk.name = bodyFile.name;
            fileChunk.start = bodyFile.start;
            fileChunk.end = bodyFile.end;
            fileChunk.chunk = bodyFile.chunk;
            fileChunk.chunks = bodyFile.chunks;
            fileChunk.size = file.size;
            await this.fileChunkService.create(fileChunk);
        }
        return { message: '上传成功', data: {  }, code: 1 }
    }

    @Get('/chunk/:id')
    async getFileChunkById(@Param('id') id: string) {
        const result = await this.fileChunkService.getById(id);
        return { message: '查询成功', data: result, code: 1 }
    }
}