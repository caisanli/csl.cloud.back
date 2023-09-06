import { GroupFolder } from "app/entities/mysql";
import { Service } from "typedi";
import { BaseService } from "./base";

@Service()
export class GroupFolderService extends BaseService<GroupFolder> {
    constructor() {
        super(GroupFolder)
    }

    getFoldersByGroupOrParentOrName(groupId?: string, parentId?: string, name?: string): Promise<GroupFolder []> {
        const wheres:string [] = [];
        if (groupId)
            wheres.push('groupFolder.groupId = :groupId');
        if (parentId)
            wheres.push('groupFolder.parentId = :parentId');
        if (name)
            wheres.push('groupFolder.name = :name');
        return this.repository.createQueryBuilder()
            .where(wheres.join(' AND '), { groupId, parentId, name })
            .getMany();
    }

    async getParents(id: string): Promise<GroupFolder []> {
        let folders: GroupFolder[] = [];
        let parent = await this.repository.findOne(id);
        id = parent ? parent.id : null;
        while(id !== '0' && id) {
            let folder = await this.repository.createQueryBuilder()
                                    .where("groupFolder.id = :id", { id })
                                    .getOne();
            folders.unshift(folder)
            id = folder.parentId;
        }
        const rootFolder: GroupFolder = new GroupFolder();
        rootFolder.id = '0';
        rootFolder.parentId = '-1';
        rootFolder.name = '根目录';
        folders.unshift(rootFolder)
        return Promise.resolve(folders);
    }

    getChildrenCount(id: string):Promise<number> {
        return this.repository.createQueryBuilder()
            .where("groupFolder.parentId = :id", { id })
            .getCount();
    }
}
