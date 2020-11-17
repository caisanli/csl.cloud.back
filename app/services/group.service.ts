import { Group } from "app/entities/mysql";
import { BaseService } from "./base";

export class GroupService extends BaseService<Group> {
    constructor() {
        super(Group)
    }
}