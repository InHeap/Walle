"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const passport = require('passport');
const passportHttpBearer = require("passport-http-bearer");
const UserService_1 = require('./Service/UserService');
function findUser(token) {
    return __awaiter(this, void 0, void 0, function* () {
        let userService = new UserService_1.default();
        let user = yield userService.single({ accessToken: token });
        return user;
    });
}
passport.use(new passportHttpBearer.Strategy(function (token, done) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = yield findUser(token);
        done(null, user);
    });
}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = passport.authenticate('bearer', { session: false });
