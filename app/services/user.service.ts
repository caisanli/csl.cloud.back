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
}