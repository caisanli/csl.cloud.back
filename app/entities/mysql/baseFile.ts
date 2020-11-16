import { BaseEntity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

export class BaseFile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
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