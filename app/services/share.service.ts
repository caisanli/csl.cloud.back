import { Share } from "app/entities/mysql";
import { BaseService } from "./base";

export default class ShareService extends BaseService<Share> {
    constructor() {
        super(Share);
    }
}