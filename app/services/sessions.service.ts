import { Repository, getRepository } from 'typeorm'
import { Service } from 'typedi'
import { Session } from 'app/entities/mongodb'

@Service()
export class SessionsService {
  repository: Repository<Session>

  constructor() {
    this.repository = getRepository(Session, 'mongodb')
  }

  async create(session: Session): Promise<Session> {
    return await this.repository.save(session)
  }
}
