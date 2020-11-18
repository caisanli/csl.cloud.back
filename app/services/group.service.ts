import { Group, GroupRole, User } from "app/entities/mysql";
import { BaseService } from "./base";

export class GroupService extends BaseService<Group> {
    constructor() {
        super(Group)
    }

    findByName(name: string): Promise<Group []> {
        return this.repository.createQueryBuilder('group')
            .where('group.name LIKE :name')
            .setParameter('name', `%${ name }%`)
            .getMany()
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
}