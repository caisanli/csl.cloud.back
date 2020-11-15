import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('test')
export class Test extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: String;

    @Column()
    name: string;
}