import { FileChunkEntity } from "app/entities/mongodb";
import { Service } from "typedi";
import { BaseService } from "./base";
@Service()
export class FileChunkService extends BaseService<FileChunkEntity> {
    constructor() {
        super(FileChunkEntity, 'mongodb')
    }
}