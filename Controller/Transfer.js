"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const es = require("es-controller");
const request = require("request-promise-native");
const UserService_1 = require("../Service/UserService");
const TransactionService_1 = require("../Service/TransactionService");
class Transfer extends es.Controller {
    constructor() {
        super(...arguments);
        this.userService = new UserService_1.default();
        this.transactionService = new TransactionService_1.default();
        this.key = 'rzp_test_BJD78hX868UODl';
        this.secret = 'LvNUnyzFO9tuDqadpQrdYr2o';
    }
    $init() {
    }
    get(param) {
        return __awaiter(this, void 0, void 0, function* () {
            let userName = param.userName;
            let amount = Number.parseInt(param.amount);
            let user = yield this.userService.getByUserName(userName);
            if (!amount && amount <= 0)
                throw 'Invalid Amount';
            return this.$view({
                key: this.key,
                userName: userName,
                fullName: user.firstName.get() + ' ' + user.lastName.get(),
                amount: amount
            });
        });
    }
    post(param, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let razorpayPaymentId = model.razorpay_payment_id;
            let amount = Number.parseInt(model.amount);
            let userName = model.userName;
            let sender = null;
            let senderDevice = null;
            let receiver = yield this.userService.getByUserName(userName);
            let receiverDevice = null;
            try {
                let q = yield request({
                    method: 'POST',
                    url: 'https://' + this.key + ':' + this.secret + '@api.razorpay.com/v1/payments/' + razorpayPaymentId + '/capture',
                    form: {
                        amount: amount
                    }
                });
                sender.balance.set(sender.balance.get() - (q.amount - q.fee));
                receiver.balance.set(receiver.balance.get() + q.amount);
                yield this.userService.save(sender);
                yield this.userService.save(receiver);
                let transaction = yield this.transactionService.save({
                    senderId: sender.id.get(),
                    senderDeviceId: senderDevice.id.get(),
                    receiverId: receiver.id.get(),
                    receiverDeviceId: receiverDevice ? receiverDevice.id.get() : null,
                    amount: amount,
                    status: "PROCESSED"
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Transfer;
