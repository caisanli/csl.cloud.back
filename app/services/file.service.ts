import { File } from "app/entities/mysql";
import { ORDER } from "app/typings";
import { Service } from "typedi";
import { BaseService } from "./base";
@Service()
export class FilService extends BaseService<File> {
    constructor() {
        super(File);
    }

    query(userId: string, folderId: string, name: string, sort: string, order: ORDER, page: number, num: number): Promise<[File[], number]>{
        const query = this.repository.createQueryBuilder();
        query.andWhere('file.userId = :userId', { userId })
        query.where('file.folderId = :folderId', { folderId });
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