"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _InviteRewards = _interopRequireDefault(require("../Models/InviteRewards"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Invite Reward Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['zole', 'popularity', "message"];

class InviteRewardController {
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

          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Invite Reward

          var rewardData = yield _CommonDbController.default.create(_InviteRewards.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            rewardData
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
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
        try {
          var {
            queryLimit,
            page
          } = req.query;
          var currentPage = (0, _Pagination.parseCurrentPage)(page);
          var limit = (0, _Pagination.parseLimit)(queryLimit);
          var query = {
            isDeleted: false
          }; // Get list of all invite rewards

          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _InviteRewards.default, currentPage, limit, ['_id', 'zole', 'popularity', "message"]); // Get pagination data

          var paginationData = (0, _Pagination.pagination)(totalCount, currentPage, limit); // Send Response

          return (0, _RequestHelper.buildResult)(res, 200, result, paginationData);
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
          } = req.params; // Find Invite Reward data

          var rewardData = yield _CommonDbController.default.findById(_InviteRewards.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, rewardData);
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
          req.body.updatedBy = req.user._id; // Check if reward exists or not

          var rewardData = yield _CommonDbController.default.findById(_InviteRewards.default, id, ['_id']); // Returns error if Invite Reward not exists

          if (!rewardData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update Invite Reward data

          var result = yield _CommonDbController.default.update(_InviteRewards.default, {
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
  }

}

var _default = new InviteRewardController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0ludml0ZVJld2FyZENvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwiSW52aXRlUmV3YXJkQ29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsImJvZHkiLCJjcmVhdGVkQnkiLCJ1cGRhdGVkQnkiLCJ1c2VyIiwiX2lkIiwicmV3YXJkRGF0YSIsIkNvbW1vbiIsImNyZWF0ZSIsIlJld2FyZE1vZGVsIiwicmVzdWx0IiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJDUkVBVEVEIiwicXVlcnlMaW1pdCIsInBhZ2UiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpc0RlbGV0ZWQiLCJ0b3RhbENvdW50IiwicGFnaW5hdGlvbkRhdGEiLCJpZCIsImZpbmRCeUlkIiwiSU5WQUxJRF9JRCIsInVwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxNQUFNLEdBQUcsQ0FBQyxNQUFELEVBQVMsWUFBVCxFQUFzQixTQUF0QixDQUFmOztBQUVBLE1BQU1DLHNCQUFOLENBQTZCO0FBQUE7QUFBQTtBQUFBLG1DQUtoQixXQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDekIsWUFBSTtBQUNBO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFyQixDQUFQO0FBQ0g7O0FBRURKLFVBQUFBLEdB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LGlCQUFPLGdDQUFZUCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCZ0IsTUFBdEIsQ0FBUDtBQUNILFNBakJELENBaUJFLE9BQU9iLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BeEd3Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQTRHZCxJQUFJTCxzQkFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgUmV3YXJkTW9kZWwgZnJvbSAnLi4vTW9kZWxzL0ludml0ZVJld2FyZHMnO1xuaW1wb3J0IHtcbiAgICBwYWdpbmF0aW9uLFxuICAgIHBhcnNlQ3VycmVudFBhZ2UsXG4gICAgcGFyc2VMaW1pdCxcbn0gZnJvbSAnLi4vSGVscGVyL1BhZ2luYXRpb24nO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBwYWdpbmF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuXG4vKipcbiAqICBJbnZpdGUgUmV3YXJkIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ3pvbGUnLCAncG9wdWxhcml0eScsXCJtZXNzYWdlXCJdO1xuXG5jbGFzcyBJbnZpdGVSZXdhcmRDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBJbnZpdGUgUmV3YXJkXG4gICAgICovXG4gICAgY3JlYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcS5ib2R5LmNyZWF0ZWRCeSA9IHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBJbnZpdGUgUmV3YXJkXG4gICAgICAgICAgICBjb25zdCByZXdhcmREYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShSZXdhcmRNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICByZXdhcmREYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgSW52aXRlIFJld2FyZHNcbiAgICAgKi9cbiAgICBpbmRleCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBxdWVyeUxpbWl0LCBwYWdlIH0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHBhcnNlQ3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlTGltaXQocXVlcnlMaW1pdCk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgICAgIC8vIEdldCBsaXN0IG9mIGFsbCBpbnZpdGUgcmV3YXJkc1xuICAgICAgICAgICAgY29uc3QgeyByZXN1bHQsIHRvdGFsQ291bnQgfSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgUmV3YXJkTW9kZWwsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICAgICAgbGltaXQsXG4gICAgICAgICAgICAgICAgWydfaWQnLCAnem9sZScsICdwb3B1bGFyaXR5JyxcIm1lc3NhZ2VcIl1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEdldCBwYWdpbmF0aW9uIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSwgbGltaXQpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQsIHBhZ2luYXRpb25EYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRhaWwgb2YgSW52aXRlIFJld2FyZFxuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIEludml0ZSBSZXdhcmQgZGF0YVxuICAgICAgICAgICAgbGV0IHJld2FyZERhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUmV3YXJkTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXdhcmREYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgSW52aXRlIFJld2FyZCBkYXRhXG4gICAgICovXG4gICAgdXBkYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHJld2FyZCBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCByZXdhcmREYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFJld2FyZE1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIEludml0ZSBSZXdhcmQgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFyZXdhcmREYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuICAgICAgICAgICAgLy8gVXBkYXRlIEludml0ZSBSZXdhcmQgZGF0YVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShSZXdhcmRNb2RlbCwge19pZDogaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBJbnZpdGVSZXdhcmRDb250cm9sbGVyKCk7XG4iXX0=