import { Entity, ManyToMany, ManyToOne } from "typeorm"
import { BaseFile } from "./baseFile";
import { Folder } from "./folder.entity";
import { Share } from "./share.entity";
import { User } from "./user.entity";

@Entity()
export class File extends BaseFile {
    @ManyToOne(() => User, user => user.files)
    user: User

    @ManyToOne(() => Folder, folder => folder.files)
    folder: Folder;

    @ManyToMany(() => Share, share => share.files)
    shares: Share[] 
}