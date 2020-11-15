import { Entity, ManyToMany, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseFolder } from "./baseFolder";
import { File } from "./file.entity";
import { Share } from "./share.entity";
import { User } from "./user.entity";

@Entity()
@Tree("closure-table")
export class Folder extends BaseFolder {
    @ManyToOne(() => User, user => user.folders)
    user: string;

    @OneToMany(() => File, file => file.folder)
    files: File[];

    @TreeChildren()
    children: Folder[];

    @TreeParent()
    parent: Folder;

    @ManyToMany(() => Share, share => share.folders)
    shares: Share[] 

}