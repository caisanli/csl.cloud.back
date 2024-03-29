import { KoaMiddlewareInterface, Middleware } from 'routing-controllers'
import { Context } from 'vm'

@Middleware({ type: 'before' })
export class HeaderMiddleware implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => any): Promise<any> {
    context.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,POST,DELETE,PATCH')
    context.set(
      'Access-Control-Allow-Origin',
      context.request.header.origin || context.request.origin,
    )
    context.set('Access-Control-Expose-Headers', 'content-disposition')
    context.set('Access-Control-Allow-Headers', ['Content-Type', 'Accept-Ranges', 'Content-Range', 'Content-Length'])
    context.set('Access-Control-Allow-Credentials', true)
    context.set('Content-Type', 'application/json; charset=utf-8')
    return next()
  }
}

@Middleware({ type: 'before' })
export class URLMiddleware implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => any): Promise<any> {
    context.request.url = decodeURIComponent(context.request.url)
    return next()
  }
}
