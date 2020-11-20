import { IsDefined } from "class-validator";
import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class FileChunkEntity extends BaseEntity {
    @ObjectIdColumn()
    id!: string;
  
    @ObjectIdColumn({ name: 'id' })
    _id!: string;
    
    @Column()
    @IsDefined()
    name: string;

    @Column()
    @IsDefined()
    size: number;

    @Column()
    @IsDefined()
    modifyDate: number;

    @Column()
    @IsDefined()
    chunk: number;

    @Column()
    @IsDefined()
    chunks: number;
}