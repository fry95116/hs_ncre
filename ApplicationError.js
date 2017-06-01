/**
 * Created by tastycarb on 2017/2/22.
 */

var util = require('util');

var AbstractError = function (msg, constr) {
    Error.captureStackTrace(this, constr ||  this.constructor);
    this.message = msg || 'Error'
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

//InvalidDataError
var InvalidDataError = function (msg) {
    InvalidDataError.super_.call(this, msg, this.constructor)
};
util.inherits(InvalidDataError, AbstractError);
InvalidDataError.prototype.name = 'Invalid Data';

//RepeatInfoError
var RepeatInfoError = function (msg) {
    RepeatInfoError.super_.call(this, msg, this.constructor)
};
util.inherits(RepeatInfoError, AbstractError);
RepeatInfoError.prototype.name = 'Repeat info';

//CountOverFlowError
var CountOverFlowError = function (msg) {
    CountOverFlowError.super_.call(this, msg, this.constructor)
};
util.inherits(CountOverFlowError, AbstractError);
CountOverFlowError.prototype.name = 'count overflow';

//BlacklistError
var BlacklistError = function (msg) {
    BlacklistError.super_.call(this, msg, this.constructor)
};
util.inherits(BlacklistError, AbstractError);
BlacklistError.prototype.name = 'Blacklist';

//CountCheckError
var CountCheckError = function (msg) {
    CountCheckError.super_.call(this, msg, this.constructor)
};
util.inherits(CountCheckError, AbstractError);
CountCheckError.prototype.name = 'count check';

module.exports = {
    InvalidDataError: InvalidDataError,
    RepeatInfoError:RepeatInfoError,
    CountOverFlowError:CountOverFlowError,
    BlacklistError:BlacklistError,
    CountCheckError:CountCheckError
};
