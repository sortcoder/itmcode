"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Notifications = _interopRequireDefault(require("../Models/Notifications"));

var _User = _interopRequireDefault(require("../Models/User"));

var _Banners = _interopRequireDefault(require("../Models/Banners"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _Notifications2 = _interopRequireDefault(require("../Service/Notifications"));

var _NotificationDetail = _interopRequireDefault(require("../Models/NotificationDetail"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Notification Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['toUser', 'fromUser', 'message', 'isRead', 'title', 'createdAt', 'isUnsubscribe'];

class NotificationController {
  constructor() {
    _defineProperty(this, "index", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var {
            queryLimit,
            page
          } = req.query;
          var {
            _id
          } = req.user;
          console.log(_id);
          var currentPage = (0, _Pagination.parseCurrentPage)(page);
          var limit = (0, _Pagination.parseLimit)(queryLimit);
          var query = {
            isDeleted: false,
            toUser: _id,
            isDeletedUser: false,
            fromUser: {
              $ne: null
            }
          }; // Get list of all notifications

          var populateField = {
            path: 'fromUser',
            select: ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified']
          };
          var alldata = yield _NotificationDetail.default.find(query);
          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _NotificationDetail.default, currentPage, limit, ['_id', 'toUser', 'fromUser', 'message', 'title', 'isRead', 'createdAt', 'notification', 'isUnsubscribe'], populateField);
          var arr = [];

          for (var iterator of result) {
            var temp = {};
            temp = iterator.toObject();
            var currenttime = (0, _momentTimezone.default)(new Date());
            var onlineTime = new Date(iterator.createdAt);
            var onlineTimeMoment = (0, _momentTimezone.default)(onlineTime);

            var durationOnline = _momentTimezone.default.duration(currenttime.diff(onlineTimeMoment));

            var daysOnline = durationOnline.asDays();
            var minOnline = durationOnline.asMinutes();
            var hourOnline = durationOnline.asHours();
            var secOnline = durationOnline.asSeconds();
            var OnlineFinalTime = 'Just Now';
            daysOnline = parseInt(daysOnline);
            hourOnline = parseInt(hourOnline);
            minOnline = parseInt(minOnline);

            if (daysOnline > 0) {
              OnlineFinalTime = daysOnline + " day ago";
            } else if (hourOnline > 0) {
              OnlineFinalTime = hourOnline + " hour ago";
            } else if (minOnline > 1) {
              OnlineFinalTime = minOnline + " min ago";
            }

            temp.dateString = OnlineFinalTime;
            console.log("temp.dateString" + temp.dateString);
            arr.push(temp);
          } // Get pagination data


          var paginationData = (0, _Pagination.pagination)(totalCount, currentPage, limit);
          var banner = yield _CommonDbController.default.findSingle(_Banners.default, {
            type: 'Notification Banner',
            isDeleted: false
          }, ['link', 'image']); // Send Response

          return res.status(200).json({
            status: 200,
            message: 'success',
            data: {
              result: arr,
              banner,
              pagination: paginationData
            }
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "list", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var query = {
            isDeleted: false,
            fromUser: _id,
            isDeletedAdmin: false
          }; // Get list of all notifications

          var populateField = {
            path: 'fromUser',
            select: ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified']
          };
          var result = yield _CommonDbController.default.list(_Notifications.default, query, ['_id', 'toUsers', 'fromUser', 'message', 'title', 'isRead', 'createdAt', 'isUnsubscribe'], populateField, {
            updatedAt: -1
          }); // Send Response

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "single", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            id
          } = req.params; // Find notification data

          var notificationData = yield _CommonDbController.default.findById(_Notifications.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, notificationData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "markAsRead", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            id
          } = req.params;
          req.body.updatedBy = req.user._id; // Check if notification exists or not

          var notificationData = yield _CommonDbController.default.findById(_Notifications.default, id, ['_id']); // Returns error if notification not exists

          if (!notificationData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update notification data

          yield _CommonDbController.default.update(_Notifications.default, {
            _id: id
          }, {
            isRead: true
          });
          yield _CommonDbController.default.update(_NotificationDetail.default, {
            notification: id,
            toUser: req.user._id
          }, {
            isRead: true
          }); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Marked as read'
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendNotificationToAll", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            _id
          } = req.user;
          var {
            title,
            message
          } = req.body;
          var users = yield _CommonDbController.default.list(_User.default, {
            isDeleted: false,
            isBlocked: false,
            status: true
          }, ['deviceToken']);
          var count = 0;
          var toUsers = [],
              deviceTokens = [];
          var firstToken = '';

          if (users && users.length) {
            for (var user of users) {
              if (user.deviceToken) {
                deviceTokens.push(user.deviceToken);
                firstToken = user.deviceToken;
                toUsers.push(user._id);
                var notificationData = {
                  toUser: user._id,
                  fromUser: _id,
                  title,
                  message,
                  deviceToken: user.deviceToken,
                  createdBy: _id,
                  updatedBy: _id
                };
                count++;
                yield _Notifications2.default.sendAdminNotifications(notificationData);
              }
            }

            var data = {
              toUsers,
              fromUser: _id,
              title,
              message,
              deviceTokens,
              createdBy: _id,
              updatedBy: _id
            };
            var notificationInsertData = yield _CommonDbController.default.create(_Notifications.default, data);
            var insertArray = [];

            for (var usr of toUsers) {
              if (deviceTokens) {
                var insertObject = {
                  toUser: usr,
                  fromUser: _id,
                  title: title,
                  message: message,
                  deviceToken: firstToken,
                  createdBy: _id,
                  updatedBy: _id,
                  notification: notificationInsertData._id
                };
                insertArray.push(insertObject);
              }
            }

            yield _NotificationDetail.default.insertMany(insertArray);
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Notification sent to ' + count + ' users'
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "remove", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            id
          } = req.params; // Find notification details

          var user = yield _CommonDbController.default.findById(_Notifications.default, id, ['_id']); // Returns error if notification is invalid

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete notification

          yield _CommonDbController.default.update(_Notifications.default, {
            _id: id
          }, {
            isDeletedAdmin: true,
            updatedBy: req.user._id
          }); // Send response

          var result = {
            message: req.t(_constants.default.DELETED)
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "deleteNofitication", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id,
            type
          } = req.body;
          var {
            _id
          } = req.user;

          if (type == "all") {
            console.log(_id);
            yield _CommonDbController.default.update(_NotificationDetail.default, {
              toUser: _id
            }, {
              isDeletedUser: true,
              updatedBy: _id
            });
          } else {
            var user = yield _CommonDbController.default.findById(_NotificationDetail.default, id, ['_id']);
            if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INVALID_ID)
            });
            yield _CommonDbController.default.update(_NotificationDetail.default, {
              _id: id
            }, {
              isDeletedUser: true,
              updatedBy: req.user._id
            });
            console.log(_id, "Ss");
          } // Find notification details
          // Returns error if notification is invalid
          // Soft delete notification


          yield _CommonDbController.default.update(_Notifications.default, {
            _id: id
          }, {
            isDeleted: true,
            updatedBy: req.user._id
          }); // Send response

          var result = {
            message: req.t(_constants.default.DELETED)
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }());
  }

}

var _default = new NotificationController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL05vdGlmaWNhdGlvbkNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwiTm90aWZpY2F0aW9uQ29udHJvbGxlciIsInJlcSIsInJlcyIsInF1ZXJ5TGltaXQiLCJwYWdlIiwicXVlcnkiLCJfaWQiLCJ1c2VyIiwiY29uc29sZSIsImxvZyIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpc0RlbGV0ZWQiLCJ0b1VzZXIiLCJpc0RlbGV0ZWRVc2VyIiwiZnJvbVVzZXIiLCIkbmUiLCJwb3B1bGF0ZUZpZWxkIiwicGF0aCIsInNlbGVjdCIsImFsbGRhdGEiLCJOb3RpZmljYXRpb25EZXRhaWwiLCJmaW5kIiwicmVzdWx0IiwidG90YWxDb3VudCIsImFyciIsIml0ZXJhdG9yIiwidGVtcCIsInRvT2JqZWN0IiwiY3VycmVudHRpbWUiLCJEYXRlIiwib25saW5lVGltZSIsImNyZWF0ZWRBdCIsIm9ubGluZVRpbWVNb21lbnQiLCJkdXJhdGlvbk9ubGluZSIsIm1vbWVudCIsImR1cmF0aW9uIiwiZGlmZiIsImRheXNPbmxpbmUiLCJhc0RheXMiLCJtaW5PbmxpbmUiLCJhc01pbnV0ZXMiLCJob3VyT25saW5lIiwiYXNIb3VycyIsInNlY09ubGluZSIsImFzU2Vjb25kcyIsIk9ubGluZUZpbmFsVGltZSIsInBhcnNlSW50IiwiZGF0ZVN0cmluZyIsInB1c2giLCJwYWdpbmF0aW9uRGF0YSIsImJhbm5lciIsIkNvbW1vbiIsImZpbmRTaW5nbGUiLCJCYW5uZXJNb2RlbCIsInR5cGUiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsImRhdGEiLCJwYWdpbmF0aW9uIiwiZXJyb3IiLCJpc0RlbGV0ZWRBZG1pbiIsImxpc3QiLCJOb3RpZmljYXRpb25Nb2RlbCIsInVwZGF0ZWRBdCIsImVycm9ycyIsImlzRW1wdHkiLCJhcnJheSIsImlkIiwibm90aWZpY2F0aW9uRGF0YSIsImZpbmRCeUlkIiwiYm9keSIsInVwZGF0ZWRCeSIsInQiLCJjb25zdGFudHMiLCJJTlZBTElEX0lEIiwidXBkYXRlIiwiaXNSZWFkIiwibm90aWZpY2F0aW9uIiwidGl0bGUiLCJ1c2VycyIsIlVzZXJNb2RlbCIsImlzQmxvY2tlZCIsImNvdW50IiwidG9Vc2VycyIsImRldmljZVRva2VucyIsImZpcnN0VG9rZW4iLCJsZW5ndGgiLCJkZXZpY2VUb2tlbiIsImNyZWF0ZWRCeSIsIk5vdGlmaWNhdGlvbnMiLCJzZW5kQWRtaW5Ob3RpZmljYXRpb25zIiwibm90aWZpY2F0aW9uSW5zZXJ0RGF0YSIsImNyZWF0ZSIsImluc2VydEFycmF5IiwidXNyIiwiaW5zZXJ0T2JqZWN0IiwiaW5zZXJ0TWFueSIsIkRFTEVURUQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsUUFBRCxFQUFXLFVBQVgsRUFBdUIsU0FBdkIsRUFBa0MsUUFBbEMsRUFBNEMsT0FBNUMsRUFBcUQsV0FBckQsRUFBaUUsZUFBakUsQ0FBZjs7QUFFQSxNQUFNQyxzQkFBTixDQUE2QjtBQUFBO0FBQUE7QUFBQSxtQ0FLakIsV0FBT0MsR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQ3hCLFlBQUk7QUFDQSxjQUFNO0FBQUNDLFlBQUFBLFVBQUQ7QUFBYUMsWUFBQUE7QUFBYixjQUFxQkgsR0FBRyxDQUFDSSxLQUEvQjtBQUNBLGNBQU07QUFBQ0MsWUFBQUE7QUFBRCxjQUFRTCxHQUFHLENBQUNNLElBQWxCO0FBQ0FDLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSCxHQUFaO0FBQ0EsY0FBTUksV0FBVyxHQUFHLGtDQUFpQk4sSUFBakIsQ0FBcEI7QUFDQSxjQUFNTyxLQUFLLEdBQUcsNEJBQVdSLFVBQVgsQ0FBZDtBQUNBLGNBQU1FLEtBQUssR0FBRztBQUFDTyxZQUFBQSxTQUFT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d0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUE4UmQsSUFBSTdELHNCQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZhbGlkYXRpb25SZXN1bHR9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBOb3RpZmljYXRpb25Nb2RlbCBmcm9tICcuLi9Nb2RlbHMvTm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgVXNlck1vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyJztcbmltcG9ydCBCYW5uZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvQmFubmVycyc7XG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQge2J1aWxkUmVzdWx0fSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQge3BhZ2luYXRpb25SZXN1bHR9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcbmltcG9ydCBOb3RpZmljYXRpb25zIGZyb20gJy4uL1NlcnZpY2UvTm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgTm90aWZpY2F0aW9uRGV0YWlsIGZyb20gJy4uL01vZGVscy9Ob3RpZmljYXRpb25EZXRhaWwnO1xuaW1wb3J0IG1vbWVudCBmcm9tIFwibW9tZW50LXRpbWV6b25lXCI7XG5cbi8qKlxuICogIE5vdGlmaWNhdGlvbiBDb250cm9sbGVyIENsYXNzXG4gKiAgQGF1dGhvciBOaXRpc2hhIEtoYW5kZWx3YWwgPG5pdGlzaGEua2hhbmRlbHdhbEBqcGxvZnQuaW4+XG4gKi9cblxuY29uc3QgcGFyYW1zID0gWyd0b1VzZXInLCAnZnJvbVVzZXInLCAnbWVzc2FnZScsICdpc1JlYWQnLCAndGl0bGUnLCAnY3JlYXRlZEF0JywnaXNVbnN1YnNjcmliZSddO1xuXG5jbGFzcyBOb3RpZmljYXRpb25Db250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgYWxsIHRoZSBub3RpZmljYXRpb25zXG4gICAgICovXG4gICAgaW5kZXggPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHtxdWVyeUxpbWl0LCBwYWdlfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhfaWQpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBwYXJzZUN1cnJlbnRQYWdlKHBhZ2UpO1xuICAgICAgICAgICAgY29uc3QgbGltaXQgPSBwYXJzZUxpbWl0KHF1ZXJ5TGltaXQpO1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7aXNEZWxldGVkOiBmYWxzZSwgdG9Vc2VyOiBfaWQsaXNEZWxldGVkVXNlcjpmYWxzZSxmcm9tVXNlcjp7ICRuZSA6bnVsbH0gfTtcbiAgICAgICAgICAgIC8vIEdldCBsaXN0IG9mIGFsbCBub3RpZmljYXRpb25zXG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkID0ge1xuICAgICAgICAgICAgICAgIHBhdGg6ICdmcm9tVXNlcicsXG4gICAgICAgICAgICAgICAgc2VsZWN0OiBbJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCddXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IGFsbGRhdGEgPSBhd2FpdCBOb3RpZmljYXRpb25EZXRhaWwuZmluZChxdWVyeSk7XG5cbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBjb25zdCB7cmVzdWx0LCB0b3RhbENvdW50fSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgTm90aWZpY2F0aW9uRGV0YWlsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgIGxpbWl0LFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ3RvVXNlcicsICdmcm9tVXNlcicsICdtZXNzYWdlJywgJ3RpdGxlJywgJ2lzUmVhZCcsICdjcmVhdGVkQXQnLCdub3RpZmljYXRpb24nLCdpc1Vuc3Vic2NyaWJlJ10sXG4gICAgICAgICAgICAgICAgcG9wdWxhdGVGaWVsZFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdG9yIG9mIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0ge307XG4gICAgICAgICAgICAgICAgdGVtcCA9IGl0ZXJhdG9yLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnR0aW1lID0gbW9tZW50KG5ldyBEYXRlKTtcbiAgICAgICAgICAgICAgICBsZXQgb25saW5lVGltZSA9IG5ldyBEYXRlKGl0ZXJhdG9yLmNyZWF0ZWRBdCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgb25saW5lVGltZU1vbWVudCA9IG1vbWVudChvbmxpbmVUaW1lKTtcbiAgICAgICAgICAgICAgICBsZXQgZHVyYXRpb25PbmxpbmUgPSBtb21lbnQuZHVyYXRpb24oY3VycmVudHRpbWUuZGlmZihvbmxpbmVUaW1lTW9tZW50KSk7XG4gICAgICAgICAgICAgICAgbGV0IGRheXNPbmxpbmUgPSBkdXJhdGlvbk9ubGluZS5hc0RheXMoKTtcbiAgICAgICAgICAgICAgICBsZXQgbWluT25saW5lID0gZHVyYXRpb25PbmxpbmUuYXNNaW51dGVzKCk7XG4gICAgICAgICAgICAgICAgbGV0IGhvdXJPbmxpbmUgPSBkdXJhdGlvbk9ubGluZS5hc0hvdXJzKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNlY09ubGluZSA9IGR1cmF0aW9uT25saW5lLmFzU2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIGxldCBPbmxpbmVGaW5hbFRpbWUgPSAnSnVzdCBOb3cnO1xuICAgICAgICAgICAgICAgIGRheXNPbmxpbmUgPSBwYXJzZUludChkYXlzT25saW5lKTtcbiAgICAgICAgICAgICAgICBob3VyT25saW5lID0gcGFyc2VJbnQoaG91ck9ubGluZSk7XG4gICAgICAgICAgICAgICAgbWluT25saW5lID0gcGFyc2VJbnQobWluT25saW5lKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF5c09ubGluZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lID0gZGF5c09ubGluZSArIFwiIGRheSBhZ29cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaG91ck9ubGluZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lID0gaG91ck9ubGluZSArIFwiIGhvdXIgYWdvXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtaW5PbmxpbmUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIE9ubGluZUZpbmFsVGltZSA9IG1pbk9ubGluZSArIFwiIG1pbiBhZ29cIjtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIHRlbXAuZGF0ZVN0cmluZyA9IE9ubGluZUZpbmFsVGltZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXAuZGF0ZVN0cmluZ1wiK3RlbXAuZGF0ZVN0cmluZyk7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGVtcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZXQgcGFnaW5hdGlvbiBkYXRhXG4gICAgICAgICAgICBjb25zdCBwYWdpbmF0aW9uRGF0YSA9IHBhZ2luYXRpb24odG90YWxDb3VudCwgY3VycmVudFBhZ2UsIGxpbWl0KTtcblxuICAgICAgICAgICAgY29uc3QgYmFubmVyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoQmFubmVyTW9kZWwsIHt0eXBlOiAnTm90aWZpY2F0aW9uIEJhbm5lcicsaXNEZWxldGVkOmZhbHNlfSwgWydsaW5rJywgJ2ltYWdlJ10pO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgICAgICAgICAgICBzdGF0dXM6IDIwMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQ6YXJyLFxuICAgICAgICAgICAgICAgICAgICBiYW5uZXIsXG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb246IHBhZ2luYXRpb25EYXRhXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGlzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qge19pZH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0ge2lzRGVsZXRlZDogZmFsc2UsIGZyb21Vc2VyOiBfaWQsIGlzRGVsZXRlZEFkbWluOiBmYWxzZX07XG4gICAgICAgICAgICAvLyBHZXQgbGlzdCBvZiBhbGwgbm90aWZpY2F0aW9uc1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZCA9IHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnZnJvbVVzZXInLFxuICAgICAgICAgICAgICAgIHNlbGVjdDogWyduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi5saXN0KE5vdGlmaWNhdGlvbk1vZGVsLCBxdWVyeSxcbiAgICAgICAgICAgICAgICBbJ19pZCcsICd0b1VzZXJzJywgJ2Zyb21Vc2VyJywgJ21lc3NhZ2UnLCAndGl0bGUnLCAnaXNSZWFkJywgJ2NyZWF0ZWRBdCcsJ2lzVW5zdWJzY3JpYmUnXSwgcG9wdWxhdGVGaWVsZCwge3VwZGF0ZWRBdDogLTF9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgUmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRhaWwgb2YgTm90aWZpY2F0aW9uXG4gICAgICovXG4gICAgc2luZ2xlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIEZpbmQgbm90aWZpY2F0aW9uIGRhdGFcbiAgICAgICAgICAgIGxldCBub3RpZmljYXRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKE5vdGlmaWNhdGlvbk1vZGVsLCBpZCwgcGFyYW1zKTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgbm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIE5vdGlmaWNhdGlvbiBkYXRhXG4gICAgICovXG4gICAgbWFya0FzUmVhZCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBub3RpZmljYXRpb24gZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChOb3RpZmljYXRpb25Nb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBub3RpZmljYXRpb24gbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFub3RpZmljYXRpb25EYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIG5vdGlmaWNhdGlvbiBkYXRhXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKE5vdGlmaWNhdGlvbk1vZGVsLCB7X2lkOiBpZH0sIHtpc1JlYWQ6IHRydWV9KTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTm90aWZpY2F0aW9uRGV0YWlsLCB7bm90aWZpY2F0aW9uOiBpZCx0b1VzZXI6cmVxLnVzZXIuX2lkfSwge2lzUmVhZDogdHJ1ZX0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7bWVzc2FnZTogJ01hcmtlZCBhcyByZWFkJ30pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNlbmROb3RpZmljYXRpb25Ub0FsbCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge19pZH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHt0aXRsZSwgbWVzc2FnZX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJzID0gYXdhaXQgQ29tbW9uLmxpc3QoVXNlck1vZGVsLCB7aXNEZWxldGVkOiBmYWxzZSwgaXNCbG9ja2VkOiBmYWxzZSwgc3RhdHVzOiB0cnVlfSwgWydkZXZpY2VUb2tlbiddKTtcbiAgICAgICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgICAgICBjb25zdCB0b1VzZXJzID0gW10sIGRldmljZVRva2VucyA9IFtdO1xuICAgICAgICBsZXQgZmlyc3RUb2tlbj0nJztcbiAgICAgICAgICAgIGlmICh1c2VycyAmJiB1c2Vycy5sZW5ndGgpIHtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHVzZXIgb2YgdXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZVRva2Vucy5wdXNoKHVzZXIuZGV2aWNlVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VG9rZW49dXNlci5kZXZpY2VUb2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVXNlcnMucHVzaCh1c2VyLl9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvVXNlcjogdXNlci5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiB1c2VyLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZEFkbWluTm90aWZpY2F0aW9ucyhub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRvVXNlcnMsXG4gICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbnMsXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGxldCBub3RpZmljYXRpb25JbnNlcnREYXRhPSAgYXdhaXQgQ29tbW9uLmNyZWF0ZShOb3RpZmljYXRpb25Nb2RlbCwgZGF0YSk7XG4gICAgICAgICAgICAgIGxldCBpbnNlcnRBcnJheT1bXTtcbiAgICAgICAgICAgICAgZm9yIChsZXQgdXNyIG9mIHRvVXNlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGV2aWNlVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbnNlcnRPYmplY3Q9e1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiAgdXNyLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6bWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiBmaXJzdFRva2VuICxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbkluc2VydERhdGEuX2lkLFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QXJyYXkucHVzaChpbnNlcnRPYmplY3QpO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9uRGV0YWlsLmluc2VydE1hbnkoaW5zZXJ0QXJyYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7bWVzc2FnZTogJ05vdGlmaWNhdGlvbiBzZW50IHRvICcgKyBjb3VudCArICcgdXNlcnMnfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIHNlbGVjdGVkIE5vdGlmaWNhdGlvblxuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIG5vdGlmaWNhdGlvbiBkZXRhaWxzXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKE5vdGlmaWNhdGlvbk1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIG5vdGlmaWNhdGlvbiBpcyBpbnZhbGlkXG4gICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG4gICAgICAgICAgICAvLyBTb2Z0IGRlbGV0ZSBub3RpZmljYXRpb25cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTm90aWZpY2F0aW9uTW9kZWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZEFkbWluOiB0cnVlLCB1cGRhdGVkQnk6IHJlcS51c2VyLl9pZH0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5ERUxFVEVEKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVsZXRlTm9maXRpY2F0aW9uPWFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qge2lkLCB0eXBlfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3Qge19pZH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGlmKHR5cGU9PVwiYWxsXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coX2lkKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKE5vdGlmaWNhdGlvbkRldGFpbCwge3RvVXNlcjogX2lkfSwge2lzRGVsZXRlZFVzZXI6IHRydWUsIHVwZGF0ZWRCeTogX2lkfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChOb3RpZmljYXRpb25EZXRhaWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShOb3RpZmljYXRpb25EZXRhaWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZFVzZXI6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkfSk7XG4gICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfaWQsXCJTc1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZpbmQgbm90aWZpY2F0aW9uIGRldGFpbHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBub3RpZmljYXRpb24gaXMgaW52YWxpZFxuICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNvZnQgZGVsZXRlIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShOb3RpZmljYXRpb25Nb2RlbCwge19pZDogaWR9LCB7aXNEZWxldGVkOiB0cnVlLCB1cGRhdGVkQnk6IHJlcS51c2VyLl9pZH0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5ERUxFVEVEKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE5vdGlmaWNhdGlvbkNvbnRyb2xsZXIoKTtcbiJdfQ==