"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../Models/User"));

var _MembershipPlans = _interopRequireDefault(require("../Models/MembershipPlans"));

var _Zoles = _interopRequireDefault(require("../Models/Zoles"));

var _PaymentHistory = _interopRequireDefault(require("../Models/PaymentHistory"));

var _UserSubscription = _interopRequireDefault(require("../Models/UserSubscription"));

var _UserZoles = _interopRequireDefault(require("../Models/UserZoles"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Payment History Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['deviceId', 'platform', 'paymentId', 'status', 'amount', 'userId', 'planId', 'zoleId', 'paymentType', 'createdAt'];

class PaymentController {
  constructor() {
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
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
            planId,
            zoleId
          } = req.body;
          var userData = yield _CommonDbController.default.findById(_User.default, _id, ['isSubscribed', 'wallet']);

          if (userData && userData._id) {
            if (planId) {
              var data = {
                userId: _id,
                planId
              };
              var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, planId, ['bonus']);
              var wallet = userData.wallet ? userData.wallet + planData.bonus : planData.bonus;
              var subscriptionData = yield _CommonDbController.default.create(_UserSubscription.default, data);

              if (subscriptionData && subscriptionData._id) {
                yield _CommonDbController.default.update(_User.default, {
                  _id: userData._id
                }, {
                  isSubscribed: true,
                  wallet
                });
              }
            } else {
              delete req.body.planId;
            }

            if (zoleId) {
              var _data = {
                userId: _id,
                zoleId
              };
              var zoleData = yield _CommonDbController.default.findById(_Zoles.default, zoleId, ['zole', 'bonus']);

              var _wallet = userData.wallet ? userData.wallet + zoleData.zole + zoleData.bonus : zoleData.zole + zoleData.bonus;

              yield _CommonDbController.default.update(_User.default, {
                _id: userData._id
              }, {
                wallet: _wallet
              });
              var userZolesData = yield _CommonDbController.default.create(_UserZoles.default, _data);

              if (userZolesData && userZolesData._id) {
                yield _CommonDbController.default.update(_User.default, {
                  _id: userData._id
                }, {
                  wallet: _wallet
                });
              }
            } else {
              delete req.body.zoleId;
            }

            req.body.createdBy = req.body.updatedBy = req.body.userId = _id; // Create Payment History

            console.log(req.body);
            console.log("-------------------------------------------------------------");
            var paymentData = yield _CommonDbController.default.create(_PaymentHistory.default, req.body);
            var result = {
              message: "Subscription successfully done",
              paymentData
            };
            return (0, _RequestHelper.buildResult)(res, 200, result);
          } else return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
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

    _defineProperty(this, "index", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        var {
          page,
          type
        } = req.query;
        var currentPage = (0, _Pagination.parseCurrentPage)(page);
        var {
          _id,
          role
        } = req.user;
        var query = {
          isDeleted: false
        };

        if (role === 'user') {
          query.userId = _id;
          if (type) query.paymentType = type;
        } // Get list of all payments


        var populateFields = [{
          path: 'userId',
          select: ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId']
        }, {
          path: 'planId',
          select: ['name', 'amount', 'validity', 'bonus']
        }, {
          path: 'zoleId',
          select: ['zole', 'price', 'bonus']
        }];
        console.log(query);
        var {
          result
        } = yield (0, _Mongo.paginationResult)(query, _PaymentHistory.default, currentPage, '', ['_id', 'deviceId', 'platform', 'paymentId', 'paymentType', 'amount', 'userId', 'planId', 'zoleId', 'createdAt'], populateFields);
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
        }

        console.log(arr); // Send Response

        return (0, _RequestHelper.buildResult)(res, 200, arr);
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
          } = req.params; // Find payment hisotry data

          var populateFields = [{
            path: 'userId',
            select: ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId']
          }, {
            path: 'planId',
            select: ['name', 'amount', 'validity', 'bonus']
          }, {
            path: 'zoleId',
            select: ['zole', 'price', 'bonus']
          }];
          var planData = yield _CommonDbController.default.findById(_PaymentHistory.default, id, params, populateFields); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, planData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());
  }

}

var _default = new PaymentController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1BheW1lbnRDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIlBheW1lbnRDb250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwiX2lkIiwidXNlciIsInBsYW5JZCIsInpvbGVJZCIsImJvZHkiLCJ1c2VyRGF0YSIsIkNvbW1vbiIsImZpbmRCeUlkIiwiVXNlck1vZGVsIiwiZGF0YSIsInVzZXJJZCIsInBsYW5EYXRhIiwiUGxhbk1vZGVsIiwid2FsbGV0IiwiYm9udXMiLCJzdWJzY3JpcHRpb25EYXRhIiwiY3JlYXRlIiwiVXNlclN1YnNjcmlwdGlvbk1vZGVsIiwidXBkYXRlIiwiaXNTdWJzY3JpYmVkIiwiem9sZURhdGEiLCJab2xlTW9kZWwiLCJ6b2xlIiwidXNlclpvbGVzRGF0YSIsIlVzZXJab2xlc01vZGVsIiwiY3JlYXRlZEJ5IiwidXBkYXRlZEJ5IiwiY29uc29sZSIsImxvZyIsInBheW1lbnREYXRhIiwiUGF5bWVudE1vZGVsIiwicmVzdWx0IiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJJTlZBTElEX0lEIiwicGFnZSIsInR5cGUiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwicm9sZSIsImlzRGVsZXRlZCIsInBheW1lbnRUeXBlIiwicG9wdWxhdGVGaWVsZHMiLCJwYXRoIiwic2VsZWN0IiwiYXJyIiwiaXRlcmF0b3IiLCJ0ZW1wIiwidG9PYmplY3QiLCJjdXJyZW50dGltZSIsIkRhdGUiLCJvbmxpbmVUaW1lIiwiY3JlYXRlZEF0Iiwib25saW5lVGltZU1vbWVudCIsImR1cmF0aW9uT25saW5lIiwibW9tZW50IiwiZHVyYXRpb24iLCJkaWZmIiwiZGF5c09ubGluZSIsImFzRGF5cyIsIm1pbk9ubGluZSIsImFzTWludXRlcyIsImhvdXJPbmxpbmUiLCJhc0hvdXJzIiwic2VjT25saW5lIiwiYXNTZWNvbmRz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R0FBakIsRUFBc0JrQixRQUF0QixDQUFQO0FBQ0gsU0FqQkQsQ0FpQkUsT0FBT2YsS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0ExSm1COztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBNkpULElBQUlMLGlCQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZhbGlkYXRpb25SZXN1bHR9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBVc2VyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IFBsYW5Nb2RlbCBmcm9tICcuLi9Nb2RlbHMvTWVtYmVyc2hpcFBsYW5zJztcbmltcG9ydCBab2xlTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1pvbGVzJztcbmltcG9ydCBQYXltZW50TW9kZWwgZnJvbSAnLi4vTW9kZWxzL1BheW1lbnRIaXN0b3J5JztcbmltcG9ydCBVc2VyU3Vic2NyaXB0aW9uTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXJTdWJzY3JpcHRpb24nO1xuaW1wb3J0IFVzZXJab2xlc01vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyWm9sZXMnO1xuaW1wb3J0IHtcbiAgICBwYWdpbmF0aW9uLFxuICAgIHBhcnNlQ3VycmVudFBhZ2UsXG4gICAgcGFyc2VMaW1pdCxcbn0gZnJvbSAnLi4vSGVscGVyL1BhZ2luYXRpb24nO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBwYWdpbmF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IG1vbWVudCBmcm9tIFwibW9tZW50LXRpbWV6b25lXCI7XG4vKipcbiAqICBQYXltZW50IEhpc3RvcnkgQ29udHJvbGxlciBDbGFzc1xuICogIEBhdXRob3IgTml0aXNoYSBLaGFuZGVsd2FsIDxuaXRpc2hhLmtoYW5kZWx3YWxAanBsb2Z0LmluPlxuICovXG5cbmNvbnN0IHBhcmFtcyA9IFsnZGV2aWNlSWQnLCAncGxhdGZvcm0nLCAncGF5bWVudElkJywgJ3N0YXR1cycsICdhbW91bnQnLCAndXNlcklkJywgJ3BsYW5JZCcsICd6b2xlSWQnLCAncGF5bWVudFR5cGUnLCAnY3JlYXRlZEF0J107XG5cbmNsYXNzIFBheW1lbnRDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBQYXltZW50IEhpc3RvcnlcbiAgICAgKi9cbiAgICBjcmVhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7cGxhbklkLCB6b2xlSWR9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWydpc1N1YnNjcmliZWQnLCAnd2FsbGV0J10pO1xuICAgICAgICAgICAgaWYgKHVzZXJEYXRhICYmIHVzZXJEYXRhLl9pZCkge1xuICAgICAgICAgICAgICAgIGlmIChwbGFuSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhbklkXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYW5EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFBsYW5Nb2RlbCwgcGxhbklkLCBbJ2JvbnVzJ10pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3YWxsZXQgPSB1c2VyRGF0YS53YWxsZXQgPyB1c2VyRGF0YS53YWxsZXQgKyBwbGFuRGF0YS5ib251cyA6IHBsYW5EYXRhLmJvbnVzO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU3Vic2NyaXB0aW9uTW9kZWwsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uRGF0YSAmJiBzdWJzY3JpcHRpb25EYXRhLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHtfaWQ6IHVzZXJEYXRhLl9pZH0sIHtpc1N1YnNjcmliZWQ6IHRydWUsIHdhbGxldH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlcS5ib2R5LnBsYW5JZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHpvbGVJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB6b2xlSWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgem9sZURhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoWm9sZU1vZGVsLCB6b2xlSWQsIFsnem9sZScsICdib251cyddKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gdXNlckRhdGEud2FsbGV0ID8gdXNlckRhdGEud2FsbGV0ICsgem9sZURhdGEuem9sZSArIHpvbGVEYXRhLmJvbnVzIDogem9sZURhdGEuem9sZSArIHpvbGVEYXRhLmJvbnVzO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZDogdXNlckRhdGEuX2lkfSwge3dhbGxldH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyWm9sZXNEYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyWm9sZXNNb2RlbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyWm9sZXNEYXRhICYmIHVzZXJab2xlc0RhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZDogdXNlckRhdGEuX2lkfSwge3dhbGxldH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlcS5ib2R5LnpvbGVJZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVxLmJvZHkuY3JlYXRlZEJ5ID0gcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLmJvZHkudXNlcklkID0gX2lkO1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBQYXltZW50IEhpc3RvcnlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXEuYm9keSlcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIilcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBheW1lbnREYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShQYXltZW50TW9kZWwsIHJlcS5ib2R5KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiU3Vic2NyaXB0aW9uIHN1Y2Nlc3NmdWxseSBkb25lXCIsXG4gICAgICAgICAgICAgICAgICAgIHBheW1lbnREYXRhXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgcGF5bWVudCBoaXN0b3J5XG4gICAgICovXG4gICAgaW5kZXggPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB7IHBhZ2UsIHR5cGUgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gcGFyc2VDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IHtfaWQsIHJvbGV9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgICAgIGlmIChyb2xlID09PSAndXNlcicpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS51c2VySWQgPSBfaWQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUpXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LnBheW1lbnRUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEdldCBsaXN0IG9mIGFsbCBwYXltZW50c1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbXG4gICAgICAgICAgICAgICAge3BhdGg6ICd1c2VySWQnLCBzZWxlY3Q6IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3VzZXJJZCddfSxcbiAgICAgICAgICAgICAgICB7cGF0aDogJ3BsYW5JZCcsIHNlbGVjdDogWyduYW1lJywgJ2Ftb3VudCcsICd2YWxpZGl0eScsICdib251cyddfSxcbiAgICAgICAgICAgICAgICB7cGF0aDogJ3pvbGVJZCcsIHNlbGVjdDogWyd6b2xlJywgJ3ByaWNlJywgJ2JvbnVzJ119XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xuICAgICAgICAgICAgY29uc3QgeyByZXN1bHQgfSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgUGF5bWVudE1vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ2RldmljZUlkJywgJ3BsYXRmb3JtJywgJ3BheW1lbnRJZCcsICdwYXltZW50VHlwZScsICdhbW91bnQnLCAndXNlcklkJywgJ3BsYW5JZCcsICd6b2xlSWQnLCAnY3JlYXRlZEF0J10sXG4gICAgICAgICAgICAgICAgcG9wdWxhdGVGaWVsZHNcbiAgICAgICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVyYXRvciBvZiByZXN1bHQpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wID0ge307XG4gICAgICAgICAgICB0ZW1wID0gaXRlcmF0b3IudG9PYmplY3QoKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50dGltZSA9IG1vbWVudChuZXcgRGF0ZSk7XG4gICAgICAgICAgICBsZXQgb25saW5lVGltZSA9IG5ldyBEYXRlKGl0ZXJhdG9yLmNyZWF0ZWRBdCk7XG5cbiAgICAgICAgICAgIGxldCBvbmxpbmVUaW1lTW9tZW50ID0gbW9tZW50KG9ubGluZVRpbWUpO1xuICAgICAgICAgICAgbGV0IGR1cmF0aW9uT25saW5lID0gbW9tZW50LmR1cmF0aW9uKGN1cnJlbnR0aW1lLmRpZmYob25saW5lVGltZU1vbWVudCkpO1xuICAgICAgICAgICAgbGV0IGRheXNPbmxpbmUgPSBkdXJhdGlvbk9ubGluZS5hc0RheXMoKTtcbiAgICAgICAgICAgIGxldCBtaW5PbmxpbmUgPSBkdXJhdGlvbk9ubGluZS5hc01pbnV0ZXMoKTtcbiAgICAgICAgICAgIGxldCBob3VyT25saW5lID0gZHVyYXRpb25PbmxpbmUuYXNIb3VycygpO1xuICAgICAgICAgICAgbGV0IHNlY09ubGluZSA9IGR1cmF0aW9uT25saW5lLmFzU2Vjb25kcygpO1xuICAgICAgICAgICAgbGV0IE9ubGluZUZpbmFsVGltZSA9ICdKdXN0IE5vdyc7XG4gICAgICAgICAgICBkYXlzT25saW5lID0gcGFyc2VJbnQoZGF5c09ubGluZSk7XG4gICAgICAgICAgICBob3VyT25saW5lID0gcGFyc2VJbnQoaG91ck9ubGluZSk7XG4gICAgICAgICAgICBtaW5PbmxpbmUgPSBwYXJzZUludChtaW5PbmxpbmUpO1xuICAgICAgICAgICAgaWYgKGRheXNPbmxpbmUgPiAwKSB7XG4gICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lID0gZGF5c09ubGluZSArIFwiIGRheSBhZ29cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGhvdXJPbmxpbmUgPiAwKSB7XG4gICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lID0gaG91ck9ubGluZSArIFwiIGhvdXIgYWdvXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1pbk9ubGluZSA+IDEpIHtcbiAgICAgICAgICAgICAgICBPbmxpbmVGaW5hbFRpbWUgPSBtaW5PbmxpbmUgKyBcIiBtaW4gYWdvXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wLmRhdGVTdHJpbmcgPSBPbmxpbmVGaW5hbFRpbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRlbXAuZGF0ZVN0cmluZ1wiICsgdGVtcC5kYXRlU3RyaW5nKTtcbiAgICAgICAgICAgIGFyci5wdXNoKHRlbXApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKGFycik7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgYXJyKTtcbiAgICAgXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGFpbCBvZiBQYXltZW50IEhpc3RvcnlcbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCBwYXltZW50IGhpc290cnkgZGF0YVxuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbXG4gICAgICAgICAgICAgICAge3BhdGg6ICd1c2VySWQnLCBzZWxlY3Q6IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3VzZXJJZCddfSxcbiAgICAgICAgICAgICAgICB7cGF0aDogJ3BsYW5JZCcsIHNlbGVjdDogWyduYW1lJywgJ2Ftb3VudCcsICd2YWxpZGl0eScsICdib251cyddfSxcbiAgICAgICAgICAgICAgICB7cGF0aDogJ3pvbGVJZCcsIHNlbGVjdDogWyd6b2xlJywgJ3ByaWNlJywgJ2JvbnVzJ119XG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgbGV0IHBsYW5EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFBheW1lbnRNb2RlbCwgaWQsIHBhcmFtcywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBwbGFuRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgUGF5bWVudENvbnRyb2xsZXIoKTtcbiJdfQ==