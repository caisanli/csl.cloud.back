import { IsDefined, Length } from "class-validator";
import { BaseEntity, Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { GroupFile } from "./groupFile.entity";
import { GroupFolder } from "./groupFolder.entity";
import { GroupRole } from "./groupRole.entity";
import { User } from "./user.entity";

@Entity()
export class Group extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(2, 20)
    name: string;

    @Column()
    description: string;

    @OneToOne(() => User)
    @JoinColumn()
    @IsDefined()
    user: User;

    @Column()
    @IsDefined()
    size: Number;

    @OneToMany(() => GroupRole, role => role.group)
    roles: GroupRole[];

    @OneToMany(() => GroupFile, file => file.group)
    files: GroupFile[];

    @OneToMany(() => GroupFolder, folder => folder.group)
    folders: GroupFolder[]

    @ManyToMany(() => User, user => user.groups)
    @JoinTable()
    users: User[];
}