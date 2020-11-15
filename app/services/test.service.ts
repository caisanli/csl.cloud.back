import { Test } from "app/entities/mysql";
import { Service } from "typedi";
import { getRepository, Repository } from "typeorm";

@Service()
export class TestService {
    repository: Repository<Test>;

    constructor() {
        this.repository = getRepository(Test, 'mysql')
    }

    async create(test: Test): Promise<Test> {
        return await this.repository.save(test);
    }
}