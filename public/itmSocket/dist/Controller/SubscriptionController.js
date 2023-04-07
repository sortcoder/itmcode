"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Subscription = _interopRequireDefault(require("../Models/Subscription"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var params = ['timePeriod', 'amount', 'features'];

class SubscriptionController {
  constructor() {
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var subscriptionData = yield _CommonDbController.default.create(_Subscription.default, req.body);
          var result = {
            message: req.t(_constants.default.CREATED),
            subscriptionData
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "index", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            queryLimit,
            page
          } = req.query;
          var currentPage = (0, _Pagination.parseCurrentPage)(page);
          var limit = (0, _Pagination.parseLimit)(queryLimit);
          var query = {
            isDeleted: false
          };
          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Subscription.default, currentPage, '', ['_id', 'timePeriod', 'amount', 'features']); //const paginationData = pagination(totalCount, currentPage, limit);

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
          } = req.params; // Find plan data

          var subscriptionData = yield _CommonDbController.default.findById(_Subscription.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, subscriptionData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "update", /*#__PURE__*/function () {
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
          req.body.updatedBy = req.user._id; // Check if plan exists or not

          var subscriptionData = yield _CommonDbController.default.findById(_Subscription.default, id, ['_id']); // Returns error if plan not exists

          if (!subscriptionData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update plan data

          var result = yield _CommonDbController.default.update(_Subscription.default, {
            _id: id
          }, req.body); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "remove", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            id
          } = req.params; // Find plan data

          var subscriptionData = yield _CommonDbController.default.findById(_Subscription.default, id, ['_id']); // Returns error if plan not exists

          if (!subscriptionData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Plan

          yield _CommonDbController.default.update(_Subscription.default, {
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

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());
  }

}

var _default = new SubscriptionController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1N1YnNjcmlwdGlvbkNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwiU3Vic2NyaXB0aW9uQ29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsInN1YnNjcmlwdGlvbkRhdGEiLCJDb21tb24iLCJjcmVhdGUiLCJTdWJzY3JpcHRpb25Nb2RlbCIsImJvZHkiLCJyZXN1bHQiLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkNSRUFURUQiLCJxdWVyeUxpbWl0IiwicGFnZSIsInF1ZXJ5IiwiY3VycmVudFBhZ2UiLCJsaW1pdCIsImlzRGVsZXRlZCIsInRvdGFsQ291bnQiLCJpZCIsImZpbmRCeUlkIiwidXBkYXRlZEJ5IiwidXNlciIsIl9pZCIsIklOVkFMSURfSUQiLCJ1cGRhdGUiLCJERUxFVEVEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFHQSxJQUFNQSxNQUFNLEdBQUcsQ0FBQyxZQUFELEVBQWUsUUFBZixFQUF5QixVQUF6QixDQUFmOztBQUVBLE1BQU1DLHNCQUFOLENBQTZCO0FBQUE7QUFBQTtBQUFBLG1DQUVoQixXQUFNQyxHQUFOLEVBQVdDLEdBQVgsRUFBaUI7QUFDdEIsWUFBRztBQUNDLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBRyxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBSixFQUFxQjtBQUNqQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQU1JLGdCQUFnQixTQUFTQyw0QkFBT0MsTUFBUCxDQUFjQyxxQkFB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QVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9Bbkh3Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQXVIZCxJQUFJTCxzQkFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgIHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tIFwiZXhwcmVzcy12YWxpZGF0b3JcIjtcbmltcG9ydCAgU3Vic2NyaXB0aW9uTW9kZWwgZnJvbSBcIi4uL01vZGVscy9TdWJzY3JpcHRpb25cIjtcbmltcG9ydCB7XG4gICAgcGFnaW5hdGlvbixcbiAgICBwYXJzZUN1cnJlbnRQYWdlLFxuICAgIHBhcnNlTGltaXQsXG59IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgcGFnaW5hdGlvblJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcblxuXG5jb25zdCBwYXJhbXMgPSBbJ3RpbWVQZXJpb2QnLCAnYW1vdW50JywgJ2ZlYXR1cmVzJ107XG5cbmNsYXNzIFN1YnNjcmlwdGlvbkNvbnRyb2xsZXIge1xuXG4gICAgY3JlYXRlID0gYXN5bmMocmVxLCByZXMpPT57XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKVxuICAgICAgICAgICAgaWYoIWVycm9ycy5pc0VtcHR5KCkpe1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbkRhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKFN1YnNjcmlwdGlvbk1vZGVsLCByZXEuYm9keSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTpyZXEudChjb25zdGFudHMuQ1JFQVRFRCksXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KVxuXG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3Ipe1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwICwge30se30sIGVycm9yKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGluZGV4ID0gYXN5bmMgKHJlcSxyZXMpPT57XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGNvbnN0IHsgcXVlcnlMaW1pdCwgcGFnZSB9ID0gcmVxLnF1ZXJ5O1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBwYXJzZUN1cnJlbnRQYWdlKHBhZ2UpO1xuICAgICAgICAgICAgY29uc3QgbGltaXQgPSBwYXJzZUxpbWl0KHF1ZXJ5TGltaXQpO1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7aXNEZWxldGVkOiBmYWxzZX07XG5cbiAgICAgICAgICAgIGNvbnN0IHsgcmVzdWx0LCB0b3RhbENvdW50IH0gPSBhd2FpdCBwYWdpbmF0aW9uUmVzdWx0KFxuICAgICAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgICAgIFN1YnNjcmlwdGlvbk1vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ3RpbWVQZXJpb2QnLCAnYW1vdW50JywgJ2ZlYXR1cmVzJ11cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vY29uc3QgcGFnaW5hdGlvbkRhdGEgPSBwYWdpbmF0aW9uKHRvdGFsQ291bnQsIGN1cnJlbnRQYWdlLCBsaW1pdCk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG5cbiAgICAgICAgfWNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIHBsYW4gZGF0YVxuICAgICAgICAgICAgbGV0IHN1YnNjcmlwdGlvbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoU3Vic2NyaXB0aW9uTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBzdWJzY3JpcHRpb25EYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLnVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgcGxhbiBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFN1YnNjcmlwdGlvbk1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBsYW4gbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25EYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIHBsYW4gZGF0YVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShTdWJzY3JpcHRpb25Nb2RlbCwge19pZDogaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVtb3ZlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIEZpbmQgcGxhbiBkYXRhXG4gICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFN1YnNjcmlwdGlvbk1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBsYW4gbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25EYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICAvLyBTb2Z0IGRlbGV0ZSBQbGFuXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFN1YnNjcmlwdGlvbk1vZGVsLCB7X2lkOiBpZH0sIHtpc0RlbGV0ZWQ6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkRFTEVURUQpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU3Vic2NyaXB0aW9uQ29udHJvbGxlcigpOyJdfQ==