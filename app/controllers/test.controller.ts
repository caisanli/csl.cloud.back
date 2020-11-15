import { Test } from "app/entities/mysql";
import { TestService } from "app/services/test.service";
import { Request } from "koa";
import { Body, JsonController, Post, Req } from "routing-controllers";

@JsonController()
export class TestController {
    private testService: TestService;
    constructor() {
        this.testService = new TestService();
    }
    @Post('/test')
    async save(@Req() req: Request, @Body() test: Test) {
        const t = new Test();
        t.name = '测试名称'
        this.testService.create(t)
        return '保存成功';
    }
}