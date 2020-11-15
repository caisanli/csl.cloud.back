import { BaseEntity, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./file.entity";
import { Folder } from "./folder.entity";
import { User } from "./user.entity";

@Entity()
export class Share extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: 'person' | 'link'

    @ManyToMany(() => File, file => file.shares)
    @JoinTable()
    files: File[];

    @ManyToMany(() => File, file => file.shares)
    @JoinTable()
    folders: Folder[];

    @ManyToMany(() => User, user => user.shares)
    @JoinTable()
    users: User[];
}