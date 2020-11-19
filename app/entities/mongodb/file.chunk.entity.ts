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
    size: number;

    @Column()
    start: number;

    @Column()
    end: number;

    @Column()
    chunk: number;

    @Column()
    chunks: number;
}