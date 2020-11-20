import { MinLength, IsNotEmpty } from 'class-validator'
import {
  Entity,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ObjectIdColumn,
} from 'typeorm'

/**
 * All validator can be applied to all controllers.
 * Reference document: https://github.com/typestack/class-validator
 * How to auto validaing? see: https://github.com/typestack/routing-controllers#auto-validating-action-params
 */

@Entity('sessions')
export class Session extends BaseEntity {
    @ObjectIdColumn()
    id!: string;
  
    @ObjectIdColumn({ name: 'id' })
    _id!: string;

    @MinLength(4, { message: 'username too short' })
    @IsNotEmpty({ message: 'must include username' })
    username: string

    @MinLength(10)
    token: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
