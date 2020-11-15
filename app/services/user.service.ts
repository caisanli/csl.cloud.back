import { User } from "app/entities/mysql";
import { Service } from "typedi";
import { DeleteResult, getRepository, Repository, UpdateResult } from "typeorm";

@Service()
export class UserService {
    private repository: Repository<User>

    constructor() {
        this.repository = getRepository(User, 'mysql');
    }

    async create(user: User): Promise<User> {
        return this.repository.create(user);
    }

    async update(user: User): Promise<UpdateResult> {
        return this.repository.update(user.id, user);
    }

    async remove(id: string): Promise<DeleteResult> {
        return this.repository.delete(id);
    }

    async getById(id: string): Promise<User> {
        return this.repository.findOne(id);
    }

    async getAll(): Promise<User[]> {
        return this.repository.find();
    }
}