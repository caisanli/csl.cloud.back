import { Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseFolder } from "./baseFolder";
import { Share } from "./share.entity";
import { User } from "./user.entity";

@Entity()
export class Folder extends BaseFolder {
    @ManyToOne(() => User, user => user.folders)
    @JoinColumn()
    user: User;

    @ManyToMany(() => Share, share => share.folders)
    shares: Share[] 

}