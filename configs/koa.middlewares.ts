import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import Environment from './environments'
import session  from 'koa-session'

export const useMiddlewares = <T extends Koa>(app: T): T => {
  Environment.identity !== 'test' && app.use(logger())
  const SESSION_CONFIG = {
    key: 'koa.sess',
    // maxAge: 1000 * 60 * 60 * 2 // 2个小时
    maxAge: 1000 * 10 // 10秒
  }
  app.keys = ['some secret hurr'];
  app.use(session(SESSION_CONFIG, app))
  app.use(bodyParser())
  return app
}
