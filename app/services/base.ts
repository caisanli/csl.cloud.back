import { DeleteResult, FindConditions, FindManyOptions, getRepository, Repository, UpdateResult } from "typeorm";

export class BaseService<T> {
    public repository: Repository<T>

    constructor(entityClass: any) {
        this.repository = getRepository(entityClass, 'mysql');
    }

    create(entity: T): Promise<T> {
        const newEntity = this.repository.create(entity);
        return this.repository.save(newEntity);
    }

    update(id: string | number, entity: T): Promise<UpdateResult> {
        return this.repository.update(id, entity);
    }

    remove(id: string | number): Promise<DeleteResult> {
        return this.repository.delete(id);
    }

    getById(id: string | number): Promise<T> {
        return this.repository.findOne(id);
    }

    getAll(): Promise<T []> {
        return this.repository.find();
    }

    find(options?: FindManyOptions<T> | FindConditions<T>): Promise<T []> {
        return this.repository.find(options);
    }
}