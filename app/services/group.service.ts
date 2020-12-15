import { Group, GroupRole, User } from "app/entities/mysql";
import { BaseService } from "./base";

export class GroupService extends BaseService<Group> {
    constructor() {
        super(Group)
    }

    query(name?: string): Promise<Group []> {
        const query = this.repository.createQueryBuilder('group');
        if(name) query.where('group.name LIKE :name', { name: `%${ name }%` });
        query.leftJoinAndSelect("group.user", "user"); // .select(["user.id", "user.name"]);
        return query.getMany();
    }

    async findUsersById(id: string): Promise<User []> {
        const { users } = await this.repository.createQueryBuilder('group')
            .leftJoinAndSelect('group.users', 'user')
            .where('group.id = :id', { id })
            .getOne();
        return Promise.resolve(users);
    }

    async findRolesById(id: string): Promise<GroupRole []> {
        const { roles } = await this.repository.createQueryBuilder('group')
            .leftJoinAndSelect('group.roles', 'role')
            .where('group.id = :id', { id })
            .getOne();
        return Promise.resolve(roles);
    }

    async getByUserId(userId: string): Promise<Group []> {
        return this.repository.createQueryBuilder('group')
                    .where('group.userId = :userId', { userId })
                    .getMany();
    }
}