import { Body, Get, JsonController, Post, QueryParam } from 'routing-controllers'
import Environment from '../../configs/environments'
import { SessionsService } from '../services';
import { Session } from 'app/entities/mongodb'


@JsonController()
export class SessionsController {
  constructor() {}

  @Get('/sessions')
  async get(@QueryParam('username') username: string): Promise<any> {
    return `hello on ${Environment.identity}.`
  }

  @Post('/sessions')
  async set(@Body() session: Session): Promise<any> {
      const sessionsService = new SessionsService();
      const result = await sessionsService.create(session);
      console.log(result)
      return `创建成功`;
  }
}
