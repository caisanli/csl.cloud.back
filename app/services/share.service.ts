import { Share } from "app/entities/mysql";
import { BaseService } from "./base";

export default class ShareService extends BaseService<Share> {
    constructor() {
        super(Share);
    }
    getByUser(userId: string):Promise<Share[]> {
        return this.repository.createQueryBuilder('share')
                    // .leftJoinAndSelect('share.files', 'file', 'file.category = :category', { category: '4' })
                    .where('share.userId = :userId', { userId })
                    .getMany();
    }

    getToMeByUser(userId: string):Promise<Share[]> {
        return this.repository.createQueryBuilder('share')
                .innerJoinAndSelect('share.users', 'user', 'user.id = :userId', { userId })
                .getMany();
    }

    getDetail(id: string): Promise<Share> {
        return this.repository.createQueryBuilder('share')
                .leftJoinAndSelect('share.files', 'file')
                .leftJoinAndSelect('share.folders', 'folder')
                .where('share.id = :id', { id })
                .getOne();
    }
}