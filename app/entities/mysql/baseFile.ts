import { IsDefined, Length } from "class-validator";
import { BaseEntity, Column, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export class BaseFile extends BaseEntity {
    @PrimaryColumn({
        unique: true
    })
    id: string;

    @Column()
    @Length(2, 150)
    name: string;

    @Column()
    @IsDefined()
    size: number;

    @Column()
    @IsDefined()
    type: string;
    
    @Column()
    icon: string;

    @UpdateDateColumn()
    @IsDefined()
    modifyDate: Date;
}