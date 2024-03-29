import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./file.entity";
import { Folder } from "./folder.entity";
import { User } from "./user.entity";

@Entity()
export class Share extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: 'person' | 'link';

    @Column()
    name: string;

    @Column()
    count: number;

    @Column()
    userId: string;

    @CreateDateColumn()
    date: Date;

    @ManyToMany(() => File, file => file.shares)
    @JoinTable()
    files: File[];

    @ManyToMany(() => Folder, folder => folder.shares)
    @JoinTable()
    folders: Folder[];

    @ManyToMany(() => User, user => user.shares)
    @JoinTable()
    users: User[];
}