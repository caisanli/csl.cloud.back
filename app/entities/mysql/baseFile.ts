import { BaseEntity, Column, PrimaryColumn, UpdateDateColumn } from "typeorm"

export class BaseFile extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    size: number;

    @Column()
    type: string;
    
    @Column()
    icon: string;

    @UpdateDateColumn()
    modifyDate: Date;
}