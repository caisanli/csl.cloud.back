import { GroupFile } from "app/entities/mysql";
import { CATEGORY, ORDER } from "app/types";
import { Service } from "typedi";
import { BaseService } from "./base";
@Service()
export class GroupFileService extends BaseService<GroupFile> {
    constructor() {
        super(GroupFile);
    }
    /**
     * 多条件查询
     * @param {string} groupId
     * @param {string} name
     * @param {string} sort
     * @param {ORDER} order
     * @param {number} page
     * @param {number} num
     * @param {string} [folderId]
     * @param {CATEGORY} [category]
     * @returns {Promise<[File[], number]>}
     * @memberof FilService
     */
    query(groupId: string, name: string, sort: string, order: ORDER, page: number, num: number, folderId?: string, category?: CATEGORY): Promise<[GroupFile[], number]>{
        const query = this.repository.createQueryBuilder();
        query.where('groupFile.groupId = :groupId', { groupId })
        if (folderId) {
            query.andWhere('groupFile.folderId = :folderId', { folderId });
        }
        if (category) {
            query.andWhere('groupFile.category = :category', { category });
        }

        if (name) {
            query.andWhere('groupFile.name LIKE :name', { name: `%${ name }%` });
        }

        query.addOrderBy(sort, order)
        return query.skip(num * ( page - 1 ))
            .take(num)
            .getManyAndCount();
    }


    getFileCount(folderId: string): Promise<number> {
        return this.repository.createQueryBuilder()
                .where('file.folderId = :folderId', { folderId })
                .getCount();
    }
}
