import * as passport from 'passport';
import * as passportHttpBearer from "passport-http-bearer";

import UserService from './Service/UserService';

async function findUser(token: string) {
	let userService: UserService = new UserService();
	let user = await userService.single({ accessToken: token });
	return user;
}

passport.use(new passportHttpBearer.Strategy(
	async function (token, done) {
		let user = await findUser(token);
		done(null, user);
	}
));

export default passport.authenticate('bearer', { session: false });
