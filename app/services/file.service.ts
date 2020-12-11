import { File } from "app/entities/mysql";
import { CATEGORY, ORDER } from "app/typings";
import { Service } from "typedi";
import { BaseService } from "./base";
@Service()
export class FilService extends BaseService<File> {
    constructor() {
        super(File);
    }
    /**
     * 多条件查询
     * @param {string} userId
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
    query(userId: string, name: string, sort: string, order: ORDER, page: number, num: number, folderId?: string, category?: CATEGORY): Promise<[File[], number]>{
        const query = this.repository.createQueryBuilder();
        query.where('file.userId = :userId', { userId })
        if(folderId) {
            query.where('file.folderId = :folderId', { folderId });
        }  
        if(category) {
            query.where('file.category = :category', { category });
        }
        
        if(name) query.andWhere('file.name LIKE :name', { name: `%${ name }%` });
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