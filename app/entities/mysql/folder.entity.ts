import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseFolder } from "./baseFolder";
import { File } from "./file.entity";
import { Share } from "./share.entity";
import { User } from "./user.entity";

@Entity()
export class Folder extends BaseFolder {
    @ManyToOne(() => User, user => user.folders)
    @JoinColumn()
    user: User;

    @OneToMany(() => File, file => file.folder)
    files: File[];

    @ManyToMany(() => Share, share => share.folders)
    shares: Share[] 

}