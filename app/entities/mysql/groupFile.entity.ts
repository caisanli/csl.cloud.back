import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseFile } from "./baseFile";
import { Group } from "./group.entity";

@Entity()
export class GroupFile extends BaseFile {
    @ManyToOne(() => Group, group => group.files)
    group: Group;

    @Column()
    folderId: string;
}
