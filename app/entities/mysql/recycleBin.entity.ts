import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Folder } from "./folder.entity";

@Entity()
export class RecycleBin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: 'file' | 'folder'

    @Column()
    name: string;

    @Column()
    icon: string;

    @OneToOne(() => Folder)
    parent: Folder;
}