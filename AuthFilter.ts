import * as express from 'express';
// import * as passport from 'passport';
// import * as passportHttpBearer from "passport-http-bearer";

import UserService from './Service/UserService';

// async function findUser(token: string) {
// 	let userService: UserService = new UserService();
// 	let user = await userService.single({ accessToken: token });
// 	if (user && user.expireAt.get().getTime() > (new Date()).getTime()) {
// 		return user;
// 	} else {
// 		return null;
// 	}
// }

// passport.use(new passportHttpBearer.Strategy(
// 	async function (token, done) {
// 		let user = await findUser(token);
// 		if (user) {
// 			done(null, user);
// 		} else {
// 			done('User UnAuthorized');
// 		}
// 	}
// ));

// export default passport.authenticate('bearer', { session: false });

export default async function AuthFilter(req: express.Request, res: express.Response, next: express.NextFunction) {
	try {
		let userName = req.headers['username'];
		if (!userName)
			throw 'UserName is required';

		let userService = new UserService();
		let user = await userService.getByUserName(userName);
		if (!user)
			throw 'User not found';

		let authorization = req.headers['authorization'];
		if (!authorization)
			throw 'Authorization Header is required';

		if (authorization.startsWith('Bearer '))
			throw 'Authorization token invalid';

		let token = authorization.split(' ')[1];
		if (!token || user.accessToken.get() !== token)
			throw 'Authorization token invalid';

		next();
	} catch (error) {
		next(error);
	}
}