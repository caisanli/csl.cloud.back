import { KoaMiddlewareInterface } from "routing-controllers";
import { Context } from "vm";

export class UserAdminAuthMiddleware implements KoaMiddlewareInterface {
    use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
        return next().then(() => {
            if(!context.session.user && !context.session.admin)
                throw new Error()
        }).catch(() => {
            context.status = 401;
            context.body = { message: '未登录', code: 3 };
        });
    }
}