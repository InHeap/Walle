"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const UserService_1 = require('./Service/UserService');
function AuthFilter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let userName = req.headers['username'];
            if (!userName)
                throw 'UserName is required';
            let userService = new UserService_1.default();
            let user = yield userService.getByUserName(userName);
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
        }
        catch (error) {
            next(error);
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthFilter;
