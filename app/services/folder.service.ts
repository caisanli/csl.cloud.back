import { Folder } from "app/entities/mysql";
import { Console } from "console";
import { Service } from "typedi";
import { BaseService } from "./base";

@Service()
export class FolderService extends BaseService<Folder> {
    constructor() {
        super(Folder)
    }

    getFoldersByUserOrParentOrName(userId?: string, parentId?: string, name?: string): Promise<Folder []> {
        const wheres:string [] = [];
        if(userId)
            wheres.push('folder.userId = :userId');
        if(parentId)
            wheres.push('folder.parentId = :parentId');
        if(name)
            wheres.push('folder.name = :name');
        return this.repository.createQueryBuilder()
            .where(wheres.join(' AND '), { userId, parentId, name })
            .getMany();
    }

    async getParents(id: string): Promise<Folder []> {
        let folders: Folder[] = [];
        let parent = await this.repository.findOne(id);
        id = parent ? parent.id : null;
        while(id !== '0' && id) {
            let folder = await this.repository.createQueryBuilder()
                                    .where("folder.id = :id", { id })
                                    .getOne();
            folders.unshift(folder)
            id = folder.parentId;
        }
        const rootFolder: Folder = new Folder();
        rootFolder.id = '0';
        rootFolder.name = '根目录';
        folders.unshift(rootFolder)
        return Promise.resolve(folders);
    }
}