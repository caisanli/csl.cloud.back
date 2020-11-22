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
    category: string;
    
    @Column()
    thumbnail: string;

    @UpdateDateColumn()
    @IsDefined()
    modifyDate: Date;
}