import { Length } from "class-validator";
import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class BaseFolder extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    @Length(0, 150)
    description: string;
}