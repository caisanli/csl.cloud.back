import { Folder } from "app/entities/mysql";
import { Console } from "console";
import { Service } from "typedi";
import { BaseService } from "./base";

@Service()
export class FolderService extends BaseService<Folder> {
    constructor() {
        super(Folder)
    }

    getFolderByUserAndParent(userId?: string, parentId?: string, name?: string): Promise<Folder []> {
        const wheres:string [] = [];
        if(userId)
            wheres.push('group.userId = :userId');
        if(parentId)
            wheres.push('group.parentId = :parentId');
        if(name)
            wheres.push('group.name = :name');
        console.log(wheres.join(' AND '));
        return this.repository.createQueryBuilder()
            .where(wheres.join(' AND '), { userId, parentId, name })
            .getMany();
    }
}