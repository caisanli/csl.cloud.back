import { Length } from "class-validator";
import { BaseEntity, Column, PrimaryColumn } from "typeorm";

export class BaseFolder extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    @Length(0, 150)
    description: string;
}