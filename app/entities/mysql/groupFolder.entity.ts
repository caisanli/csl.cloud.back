import { Entity, ManyToOne, TreeChildren, TreeParent } from "typeorm";
import { BaseFolder } from "./baseFolder";
import { Group } from "./group.entity";

@Entity()
export class GroupFolder extends BaseFolder {
    @ManyToOne(() => Group, group => group.folders)
    group: string;

    @TreeChildren()
    children: GroupFolder[];
}
