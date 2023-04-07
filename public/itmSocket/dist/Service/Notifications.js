"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _firebaseConfig = require("../../firebase-config");

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _NotificationDetail = _interopRequireDefault(require("../Models/NotificationDetail"));

var _Notifications = _interopRequireDefault(require("../Models/Notifications"));

var _User = _interopRequireDefault(require("../Models/User"));

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};

class Notifications {
  constructor() {
    _defineProperty(this, "sendNotification", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (notificationData) {
        var toUsers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var role = arguments.length > 2 ? arguments[2] : undefined;

        try {
          var userData = yield _User.default.findById(notificationData.fromUser);
          var message = {
            notification: {
              title: userData.name + ' ' + notificationData.title,
              body: userData.name + ' ' + notificationData.message
            }
          };
          var result = yield _firebaseConfig.admin.messaging().sendToDevice(notificationData.deviceToken, message, notification_options);
          var notificationInsertData = yield _CommonDbController.default.create(_Notifications.default, notificationData);
          var insertObject = {
            toUser: notificationData.toUser,
            fromUser: notificationData.fromUser,
            title: notificationData.title,
            message: notificationData.message,
            deviceToken: notificationData.deviceToken,
            createdBy: notificationData.createdBy,
            updatedBy: notificationData.updatedBy,
            notification: notificationInsertData._id
          };
          yield _CommonDbController.default.create(_NotificationDetail.default, insertObject);
          return result;
        } catch (error) {
          throw error;
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendAdminNotifications", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (notificationData) {
        try {
          var message = {
            notification: {
              title: notificationData.title,
              body: notificationData.message
            }
          };
          return yield _firebaseConfig.admin.messaging().sendToDevice(notificationData.deviceToken, message, notification_options);
        } catch (error) {
          throw error;
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendNotificationDirect", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (notificationData, from) {
        try {
          var userData = yield _User.default.findById(notificationData.fromUser);
          var message = {};

          if (from == "chat") {
            message = {
              notification: {
                title: notificationData.title,
                body: notificationData.message
              },
              data: {
                messageSound: "chat"
              }
            };
          } else {
            message = {
              notification: {
                title: notificationData.title,
                body: notificationData.message
              }
            };
          }

          var result = yield _firebaseConfig.admin.messaging().sendToDevice(notificationData.deviceToken, message, notification_options);
          var notificationInsertData = yield _CommonDbController.default.create(_Notifications.default, notificationData);
          var insertObject = {
            toUser: notificationData.toUser,
            fromUser: notificationData.fromUser,
            title: notificationData.title,
            message: notificationData.message,
            deviceToken: notificationData.deviceToken,
            isUnsubscribe: true,
            createdBy: notificationData.createdBy,
            updatedBy: notificationData.updatedBy,
            notification: notificationInsertData._id
          };
          yield _CommonDbController.default.create(_NotificationDetail.default, insertObject);
          return result;
        } catch (error) {
          throw error;
        }
      });

      return function (_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendOTPSms", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (mobile, otp, name) {
        try {
          mobile = "91" + mobile;
          var options = {
            "method": "GET",
            "hostname": "api.msg91.com",
            "port": null,
            "path": "/api/v5/otp?template_id=6268df85b30b745e582d7fdf&mobile=" + mobile + "&authkey=371004ArHiEoNdSW61c31933P1&otp=" + otp + "",
            "headers": {
              "Content-Type": "application/json"
            }
          };
          console.log(options);

          var req = _https.default.request(options, function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
            res.on("end", function () {
              var body = Buffer.concat(chunks);
              console.log(body.toString());
            });
          });

          console.log(req);
          req.end();
        } catch (error) {
          throw error;
        }
      });

      return function (_x5, _x6, _x7) {
        return _ref4.apply(this, arguments);
      };
    }());
  }

}

var _default = new Notifications();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TZXJ2aWNlL05vdGlmaWNhdGlvbnMuanMiXSwibmFtZXMiOlsibm90aWZpY2F0aW9uX29wdGlvbnMiLCJwcmlvcml0eSIsInRpbWVUb0xpdmUiLCJOb3RpZmljYXRpb25zIiwibm90aWZpY2F0aW9uRGF0YSIsInRvVXNlcnMiLCJyb2xlIiwidXNlckRhdGEiLCJVc2VyIiwiZmluZEJ5SWQiLCJmcm9tVXNlciIsIm1lc3NhZ2UiLCJub3RpZmljYXRpb24iLCJ0aXRsZSIsIm5hbWUiLCJib2R5IiwicmVzdWx0IiwiYWRtaW4iLCJtZXNzYWdpbmciLCJzZW5kVG9EZXZpY2UiLCJkZXZpY2VUb2tlbiIsIm5vdGlmaWNhdGlvbkluc2VydERhdGEiLCJDb21tb24iLCJjcmVhdGUiLCJOb3RpZmljYXRpb25Nb2RlbCIsImluc2VydE9iamVjdCIsInRvVXNlciIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsIl9pZCIsIk5vdGlmaWNhdGlvbkRldGFpbCIsImVycm9yIiwiZnJvbSIsImRhdGEiLCJtZXNzYWdlU291bmQiLCJpc1Vuc3Vic2NyaWJlIiwibW9iaWxlIiwib3RwIiwib3B0aW9ucyIsImNvbnNvbGUiLCJsb2ciLCJyZXEiLCJodHRwIiwicmVxdWVzdCIsInJlcyIsImNodW5rcyIsIm9uIiwiY2h1bmsiLCJwdXNoIiwiQnVmZmVyIiwiY29uY2F0IiwidG9TdHJpbmciLCJlbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUdBLElBQU1BLG9CQUFvQixHQUFHO0FBQ3pCQyxFQUFBQSxRQUFRLEVBQUUsTUFEZTtBQUV6QkMsRUFBQUEsVUFBVSxFQUFFLEtBQUssRUFBTCxHQUFVO0FBRkcsQ0FBN0I7O0FBS0EsTUFBTUMsYUFBTixDQUFvQjtBQUFBO0FBQUE7QUFBQSxtQ0FDRyxXQUFPQyxnQkFBUCxFQUFnRDtBQUFBLFlBQXZCQyxPQUF1Qix1RUFBYixFQUFhO0FBQUEs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aW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcbmltcG9ydCBOb3RpZmljYXRpb25EZXRhaWwgZnJvbSAnLi4vTW9kZWxzL05vdGlmaWNhdGlvbkRldGFpbCc7XG5pbXBvcnQgTm90aWZpY2F0aW9uTW9kZWwgZnJvbSAnLi4vTW9kZWxzL05vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cHMnO1xuXG5cbmNvbnN0IG5vdGlmaWNhdGlvbl9vcHRpb25zID0ge1xuICAgIHByaW9yaXR5OiBcImhpZ2hcIixcbiAgICB0aW1lVG9MaXZlOiA2MCAqIDYwICogMjRcbn07XG5cbmNsYXNzIE5vdGlmaWNhdGlvbnMge1xuICAgIHNlbmROb3RpZmljYXRpb24gPSBhc3luYyAobm90aWZpY2F0aW9uRGF0YSwgdG9Vc2VycyA9IFtdLCByb2xlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGF3YWl0IFVzZXIuZmluZEJ5SWQobm90aWZpY2F0aW9uRGF0YS5mcm9tVXNlcik7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdXNlckRhdGEubmFtZSArICcgJyArIG5vdGlmaWNhdGlvbkRhdGEudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IHVzZXJEYXRhLm5hbWUgKyAnICcgKyBub3RpZmljYXRpb25EYXRhLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhZG1pbi5tZXNzYWdpbmcoKS5zZW5kVG9EZXZpY2Uobm90aWZpY2F0aW9uRGF0YS5kZXZpY2VUb2tlbiwgbWVzc2FnZSwgbm90aWZpY2F0aW9uX29wdGlvbnMpO1xuXG4gICAgICAgICAgICBsZXQgbm90aWZpY2F0aW9uSW5zZXJ0RGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoTm90aWZpY2F0aW9uTW9kZWwsIG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgbGV0IGluc2VydE9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICB0b1VzZXI6IG5vdGlmaWNhdGlvbkRhdGEudG9Vc2VyLFxuICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBub3RpZmljYXRpb25EYXRhLmZyb21Vc2VyLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBub3RpZmljYXRpb25EYXRhLnRpdGxlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG5vdGlmaWNhdGlvbkRhdGEubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogbm90aWZpY2F0aW9uRGF0YS5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IG5vdGlmaWNhdGlvbkRhdGEuY3JlYXRlZEJ5LFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogbm90aWZpY2F0aW9uRGF0YS51cGRhdGVkQnksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uOiBub3RpZmljYXRpb25JbnNlcnREYXRhLl9pZCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi5jcmVhdGUoTm90aWZpY2F0aW9uRGV0YWlsLCBpbnNlcnRPYmplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNlbmRBZG1pbk5vdGlmaWNhdGlvbnMgPSBhc3luYyAobm90aWZpY2F0aW9uRGF0YSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IG5vdGlmaWNhdGlvbkRhdGEudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IG5vdGlmaWNhdGlvbkRhdGEubWVzc2FnZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBhZG1pbi5tZXNzYWdpbmcoKS5zZW5kVG9EZXZpY2Uobm90aWZpY2F0aW9uRGF0YS5kZXZpY2VUb2tlbiwgbWVzc2FnZSwgbm90aWZpY2F0aW9uX29wdGlvbnMpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHNlbmROb3RpZmljYXRpb25EaXJlY3QgPSBhc3luYyAobm90aWZpY2F0aW9uRGF0YSwgZnJvbSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKG5vdGlmaWNhdGlvbkRhdGEuZnJvbVVzZXIpO1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSB7fTtcbiAgICAgICAgICAgIGlmIChmcm9tID09IFwiY2hhdFwiKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbm90aWZpY2F0aW9uRGF0YS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG5vdGlmaWNhdGlvbkRhdGEubWVzc2FnZSxcblxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlU291bmQ6IFwiY2hhdFwiLFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogbm90aWZpY2F0aW9uRGF0YS50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IG5vdGlmaWNhdGlvbkRhdGEubWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhZG1pbi5tZXNzYWdpbmcoKS5zZW5kVG9EZXZpY2Uobm90aWZpY2F0aW9uRGF0YS5kZXZpY2VUb2tlbiwgbWVzc2FnZSwgbm90aWZpY2F0aW9uX29wdGlvbnMpO1xuXG4gICAgICAgICAgICBsZXQgbm90aWZpY2F0aW9uSW5zZXJ0RGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoTm90aWZpY2F0aW9uTW9kZWwsIG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgbGV0IGluc2VydE9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICB0b1VzZXI6IG5vdGlmaWNhdGlvbkRhdGEudG9Vc2VyLFxuICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBub3RpZmljYXRpb25EYXRhLmZyb21Vc2VyLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBub3RpZmljYXRpb25EYXRhLnRpdGxlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG5vdGlmaWNhdGlvbkRhdGEubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogbm90aWZpY2F0aW9uRGF0YS5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICBpc1Vuc3Vic2NyaWJlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogbm90aWZpY2F0aW9uRGF0YS5jcmVhdGVkQnksXG4gICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBub3RpZmljYXRpb25EYXRhLnVwZGF0ZWRCeSxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbkluc2VydERhdGEuX2lkLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShOb3RpZmljYXRpb25EZXRhaWwsIGluc2VydE9iamVjdCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbmRPVFBTbXMgPSBhc3luYyAobW9iaWxlLCBvdHAsIG5hbWUpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG1vYmlsZT1cIjkxXCIrbW9iaWxlO1xuICAgICAgICAgICBcblxuXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIFwibWV0aG9kXCI6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgXCJob3N0bmFtZVwiOiBcImFwaS5tc2c5MS5jb21cIixcbiAgICAgICAgICAgICAgICBcInBvcnRcIjogbnVsbCxcbiAgICAgICAgICAgICAgICBcInBhdGhcIjogXCIvYXBpL3Y1L290cD90ZW1wbGF0ZV9pZD02MjY4ZGY4NWIzMGI3NDVlNTgyZDdmZGYmbW9iaWxlPVwiK21vYmlsZStcIiZhdXRoa2V5PTM3MTAwNEFySGlFb05kU1c2MWMzMTkzM1AxJm90cD1cIitvdHArXCJcIixcbiAgICAgICAgICAgICAgICBcImhlYWRlcnNcIjoge1xuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zKVxuXG4gICAgICAgICAgICBjb25zdCByZXEgPSBodHRwLnJlcXVlc3Qob3B0aW9ucywgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgcmVzLm9uKFwiZGF0YVwiLCBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtzLnB1c2goY2h1bmspO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmVzLm9uKFwiZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEJ1ZmZlci5jb25jYXQoY2h1bmtzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYm9keS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXEuZW5kKCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBOb3RpZmljYXRpb25zKCk7Il19