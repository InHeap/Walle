import * as router from 'koa-router';

var mainRouter = new router();

mainRouter.get('/', async (ctx) => {
	ctx.body = 'Hello';
});

mainRouter.use('/user', AuthFilter);
mainRouter.use('/pay', AuthFilter);
mainRouter.use('/device', AuthFilter);
mainRouter.use('/auth/logout', AuthFilter);

export default mainRouter;
