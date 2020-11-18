import { IsDefined, Length, MaxLength } from "class-validator";
import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class BaseFolder extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Length(2,20)
    name: string;

    @Column()
    @MaxLength(150)
    description: string;

    @Column()
    @IsDefined()
    parentId: string;
}