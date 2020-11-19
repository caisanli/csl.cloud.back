import { BaseEntity, Column, Entity, ObjectIdColumn } from "typeorm";

@Entity()
export class FileChunkEntity extends BaseEntity {
    @ObjectIdColumn()
    id!: string;
  
    @ObjectIdColumn({ name: 'id' })
    _id!: string;
    
    @Column()
    name: string;

    @Column()
    size: string;

    @Column()
    modifyTime: string;

    @Column()
    chunk: string;

    @Column()
    chunks: string;
}