"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsonwebtoken = require("jsonwebtoken");

var _User = _interopRequireDefault(require("../Models/User"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _RequestHelper = require("../Helper/RequestHelper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 *  Extract token from request
 * @param req  express.Request
 */
var extractToken = req => {
  if (req.headers.authorization) {
    var header = req.headers.authorization.split(' ');
    var type = header[0]; // Bearer

    var token = header[1]; // jwt token

    if (type === 'Bearer') {
      return token;
    }

    return null;
  } else if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
};
/**
 *  jwt verify middleware
 * @param req  express.Request
 * @param res  express.Response
 * @param next  express.NextFunction
 */


var jwtVerify = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (req, res, next) {
    if (req.query.token || req.headers.authorization) {
      try {
        var token = extractToken(req);
        var appSecret = process.env.JWT_SECRET;
        var isTokenVerified = (0, _jsonwebtoken.verify)(token, appSecret); // verify token
        // Returns error if token is not valid

        if (!isTokenVerified) return (0, _RequestHelper.buildResult)(res, 401, {}, {}, {
          message: req.t(_constants.default.INVALID_TOKEN)
        });
        var decodedToken = (0, _jsonwebtoken.decode)(token); // decode

        var {
          uid,
          scope
        } = decodedToken; // destructure
        // Find details of logged in user

        var user = yield _CommonDbController.default.findSingle(_User.default, {
          _id: uid
        }, ['firstName', 'lastName', 'role', 'isDeleted', 'isBlocked']); // Returns JWT error if user not exists

        if (!user) return (0, _RequestHelper.buildResult)(res, 403, {}, {}, {
          message: req.t(_constants.default.JWT_TOKEN_ERROR)
        });
        if (user.isDeleted) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
          message: req.t(_constants.default.ACCOUNT_NOT_EXISTS)
        });
        if (user.isBlocked) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
          message: "You are blocked by Admin"
        });
        req.token = token;
        req.uid = uid;
        req.scope = scope;
        req.user = user;
        next();
      } catch (error) {
        // Returns unspecified exceptions
        return (0, _RequestHelper.buildResult)(res, 500, {}, {}, {
          message: error.message
        });
      }
    } else {
      // Returns error if token not found
      return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
        message: req.t(_constants.default.TOKEN_NOT_FOUND)
      });
    }
  });

  return function jwtVerify(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _default = jwtVerify;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9NaWRkbGV3YXJlcy9Kd3RWZXJpZnkuanMiXSwibmFtZXMiOlsiZXh0cmFjdFRva2VuIiwicmVxIiwiaGVhZGVycyIsImF1dGhvcml6YXRpb24iLCJoZWFkZXIiLCJzcGxpdCIsInR5cGUiLCJ0b2tlbiIsInF1ZXJ5Iiwiand0VmVyaWZ5IiwicmVzIiwibmV4dCIsImFwcFNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiaXNUb2tlblZlcmlmaWVkIiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJJTlZBTElEX1RPS0VOIiwiZGVjb2RlZFRva2VuIiwidWlkIiwic2NvcGUiLCJ1c2VyIiwiQ29tbW9uIiwiZmluZFNpbmdsZSIsIlVzZXJNb2RlbCIsIl9pZCIsIkpXVF9UT0tFTl9FUlJPUiIsImlzRGVsZXRlZCIsIkFDQ09VTlRfTk9UX0VYSVNUUyIsImlzQmxvY2tlZCIsImVycm9yIiwiVE9LRU5fTk9UX0ZPVU5EIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxZQUFZLEdBQUdDLEdBQUcsSUFBSTtBQUN4QixNQUFJQSxHQUFHLENBQUNDLE9BQUosQ0FBWUMsYUFBaEIsRUFBK0I7QUFDM0IsUUFBTUMsTUFBTSxHQUFHSCxHQUFHLENBQUNDLE9BQUosQ0FBWUMsYUFBWixDQUEwQkUsS0FBMUIsQ0FBZ0MsR0FBaEMsQ0FBZjtBQUNBLFFBQU1DLElBQUksR0FBR0YsTUFBTSxDQUFDLENBQUQsQ0FBbkIsQ0FGMkIsQ0FFSDs7QUFDeEIsUUFBTUcsS0FBSyxHQUFHSCxNQUFNLENBQUMsQ0FBRCxDQUFwQixDQUgyQixDQUdGOztBQUN6QixRQUFJRSxJQUFJLEtBQUssUUFBYixFQUF1QjtBQUNuQixhQUFPQyxLQUFQO0FBQ0g7O0FBQ0QsV0FBTyxJQUFQO0FBQ0gsR0FSRCxNQVFPLElBQUlOLEdBQUcsQ0FBQ08sS0FB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RUFBMUIsRUFBOEI7QUFBQ08sUUFBQUEsT0FBTyxFQUFFaEIsR0FBRyxDQUFDaUIsQ0FBSixDQUFNQyxtQkFBVWUsZUFBaEI7QUFBVixPQUE5QixDQUFQO0FBQ0g7QUFDSixHQXBDYzs7QUFBQSxrQkFBVHpCLFNBQVM7QUFBQTtBQUFBO0FBQUEsR0FBZjs7ZUFzQ2VBLFMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZlcmlmeSwgZGVjb2RlfSBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuXG4vKipcbiAqICBFeHRyYWN0IHRva2VuIGZyb20gcmVxdWVzdFxuICogQHBhcmFtIHJlcSAgZXhwcmVzcy5SZXF1ZXN0XG4gKi9cbmNvbnN0IGV4dHJhY3RUb2tlbiA9IHJlcSA9PiB7XG4gICAgaWYgKHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24pIHtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbi5zcGxpdCgnICcpO1xuICAgICAgICBjb25zdCB0eXBlID0gaGVhZGVyWzBdOyAvLyBCZWFyZXJcbiAgICAgICAgY29uc3QgdG9rZW4gPSBoZWFkZXJbMV07IC8vIGp3dCB0b2tlblxuICAgICAgICBpZiAodHlwZSA9PT0gJ0JlYXJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHJlcS5xdWVyeSAmJiByZXEucXVlcnkudG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIHJlcS5xdWVyeS50b2tlbjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vKipcbiAqICBqd3QgdmVyaWZ5IG1pZGRsZXdhcmVcbiAqIEBwYXJhbSByZXEgIGV4cHJlc3MuUmVxdWVzdFxuICogQHBhcmFtIHJlcyAgZXhwcmVzcy5SZXNwb25zZVxuICogQHBhcmFtIG5leHQgIGV4cHJlc3MuTmV4dEZ1bmN0aW9uXG4gKi9cbmNvbnN0IGp3dFZlcmlmeSA9IGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgIGlmIChyZXEucXVlcnkudG9rZW4gfHwgcmVxLmhlYWRlcnMuYXV0aG9yaXphdGlvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBleHRyYWN0VG9rZW4ocmVxKTtcbiAgICAgICAgICAgIGNvbnN0IGFwcFNlY3JldCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQ7XG4gICAgICAgICAgICBjb25zdCBpc1Rva2VuVmVyaWZpZWQgPSB2ZXJpZnkodG9rZW4sIGFwcFNlY3JldCk7IC8vIHZlcmlmeSB0b2tlblxuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB0b2tlbiBpcyBub3QgdmFsaWRcbiAgICAgICAgICAgIGlmICghaXNUb2tlblZlcmlmaWVkKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMSwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfVE9LRU4pfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlY29kZWRUb2tlbiA9IGRlY29kZSh0b2tlbik7IC8vIGRlY29kZVxuICAgICAgICAgICAgY29uc3Qge3VpZCwgc2NvcGV9ID0gZGVjb2RlZFRva2VuOyAvLyBkZXN0cnVjdHVyZVxuICAgICAgICAgICAgLy8gRmluZCBkZXRhaWxzIG9mIGxvZ2dlZCBpbiB1c2VyXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7X2lkOiB1aWR9LCBbJ2ZpcnN0TmFtZScsICdsYXN0TmFtZScsICdyb2xlJywgJ2lzRGVsZXRlZCcsICdpc0Jsb2NrZWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIEpXVCBlcnJvciBpZiB1c2VyIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghdXNlcilcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDMsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5KV1RfVE9LRU5fRVJST1IpfSk7XG4gICAgICAgICAgICBpZiAodXNlci5pc0RlbGV0ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuQUNDT1VOVF9OT1RfRVhJU1RTKX0pO1xuICAgICAgICAgICAgaWYgKHVzZXIuaXNCbG9ja2VkKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogXCJZb3UgYXJlIGJsb2NrZWQgYnkgQWRtaW5cIn0pO1xuXG4gICAgICAgICAgICByZXEudG9rZW4gPSB0b2tlbjtcbiAgICAgICAgICAgIHJlcS51aWQgPSB1aWQ7XG4gICAgICAgICAgICByZXEuc2NvcGUgPSBzY29wZTtcbiAgICAgICAgICAgIHJlcS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgIG5leHQoKTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwge21lc3NhZ2U6IGVycm9yLm1lc3NhZ2V9KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdG9rZW4gbm90IGZvdW5kXG4gICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLlRPS0VOX05PVF9GT1VORCl9KTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBqd3RWZXJpZnk7XG4iXX0=