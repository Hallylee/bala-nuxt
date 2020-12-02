const Controller = require('egg').Controller;

class TestController extends Controller {
  test() {
    const { ctx } = this;

    if (!ctx.session.user) {
      ctx.session.user = {
        username: 'Dango'
      };
    }

    ctx.req.session = ctx.session;
    ctx.status = 200;
    ctx.body = {
      message: '登录成功!'
    };
  }
}

module.exports = TestController;
