import { File } from "app/entities/mysql";
import { Service } from "typedi";
import { BaseService } from "./base";
@Service()
export class FilService extends BaseService<File> {
    constructor() {
        super(File);
    }
}