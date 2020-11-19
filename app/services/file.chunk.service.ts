import { FileChunkEntity } from "app/entities/mongodb";
import { BaseService } from "./base";

export class FileChunkService extends BaseService<FileChunkEntity> {
    constructor() {
        super(FileChunkEntity, 'mongodb')
    }
}