import * as express from 'express';

import UserService from './Service/UserService';
import DeviceService from './Service/DeviceService';

export default async function AuthFilter(req: express.Request & { device }, res: express.Response, next: express.NextFunction) {
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

		if (!authorization.startsWith('Bearer '))
			throw 'Authorization token invalid';

		let token = authorization.split(' ')[1];
		if (!token || user.accessToken.get() !== token)
			throw 'Authorization token invalid';

		let deviceId = Number.parseInt(req.headers['deviceid']);
		if (!deviceId)
			throw 'Device Id is required';

		let deviceService = new DeviceService();
		let device = await deviceService.get(deviceId);
		if (device.userId.get() !== user.id.get())
			throw 'UnAuthorized Device Access';

		req.user = user;
		req.device = device;
		next();
	} catch (error) {
		res.status(401);
		next(error);
	}
}