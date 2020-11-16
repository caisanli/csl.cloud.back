import { Folder } from "app/entities/mysql";
import { Service } from "typedi";
import { BaseService } from "./base";

@Service()
export class FolderService extends BaseService<Folder> {
    constructor() {
        super(Folder)
    }
}