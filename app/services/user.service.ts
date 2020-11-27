import { User } from "app/entities/mysql";
import { Service } from "typedi";
import { BaseService } from "./base";
import md5 from "md5";
@Service()
export class UserService extends BaseService<User> {
    constructor() {
        super(User)
    }
    create(user: User): Promise<User> {
        user.password = md5(user.password);
        const newUser = this.repository.create(user);
        return this.repository.save(newUser);
    }

    query(name?: string): Promise<User []> {
        const query = this.repository.createQueryBuilder();
        if(name) query.where('user.name LIKE :name', { name: `%${ name }%` })
        return query.getMany();
    }

    getPasswordUserById(id: string): Promise<User> {
        return this.repository.createQueryBuilder('user')
                .select("user.id")
                .addSelect("user.password")
                .addSelect("user.email")
                .addSelect("user.phone")
                .addSelect("user.name")
                .where('user.id = :id', { id })
                .getOne();
    }
}