import { IsEmail, Length } from "class-validator";
import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./file.entity";
import { Folder } from "./folder.entity";
import { Group } from "./group.entity";
import { GroupRole } from "./groupRole.entity";
import { Share } from "./share.entity";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Length(2,10)
    name: string;

    @Column()
    password: string;

    @Column()
    phone: number;

    @Column()
    @IsEmail()
    email: string;

    @OneToMany(() => File, file => file.user)
    files: File[]

    @OneToMany(() => Folder, folder => folder.user)
    folders: Folder[]

    @ManyToMany(() => Group, group => group.users)
    groups: Group[]

    @ManyToMany(() => Share, share => share.users)
    shares: Share[]
}