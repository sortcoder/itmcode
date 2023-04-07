"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _MembershipPlans = _interopRequireDefault(require("../Models/MembershipPlans"));

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
 *  Plan Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['name', 'amount', 'validity', 'bonus', 'apple_id'];

class PlanController {
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
            name
          } = req.body; // Check if plan exists

          var isPlanExists = yield _CommonDbController.default.findSingle(_MembershipPlans.default, {
            name,
            isDeleted: false
          }, ['_id']); // Returns error if plan exists

          if (isPlanExists) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ALREADY_REGISTERED)
          });
          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Plan

          var planData = yield _CommonDbController.default.create(_MembershipPlans.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            planData
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
          }; // Get list of all plans

          var {
            result
          } = yield (0, _Mongo.paginationResult)(query, _MembershipPlans.default, currentPage, '', ['_id', 'name', 'amount', 'validity', 'bonus', 'apple_id']);
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

          var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, id, params); // Send response

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
          req.body.updatedBy = req.user._id;
          console.log(req.body); // Check if plan exists or not

          var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, id, ['_id']); // Returns error if plan not exists

          if (!planData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update plan data

          var result = yield _CommonDbController.default.update(_MembershipPlans.default, {
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

          var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, id, ['_id']); // Returns error if plan not exists

          if (!planData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Plan

          yield _CommonDbController.default.update(_MembershipPlans.default, {
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

var _default = new PlanController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1BsYW5Db250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIlBsYW5Db250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwibmFtZSIsImJvZHkiLCJpc1BsYW5FeGlzdHMiLCJDb21tb24iLCJmaW5kU2luZ2xlIiwiUGxhbk1vZGVsIiwiaXNEZWxldGVkIiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJBTFJFQURZX1JFR0lTVEVSRUQiLCJjcmVhdGVkQnkiLCJ1cGRhdGVkQnkiLCJ1c2VyIiwiX2lkIiwicGxhbkRhdGEiLCJjcmVhdGUiLCJyZXN1bHQiLCJDUkVBVEVEIiwicXVlcnlMaW1pdCIsInBhZ2UiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpZCIsImZpbmRCeUlkIiwiY29uc29sZSIsImxvZyIsIklOVkFMSURfSUQiLCJ1cGRhdGUiLCJERUxFVEVEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLElBQU1BLE1BQU0sR0FBRyxDQUFDLE1BQUQsRUFBUSxRQUFSLEVBQWtCLFVBQWxCLEVBQThCLE9BQTlCLEVBQXNDLFVBQXRDLENBQWY7O0FBRUEsTUFBTUMsY0FBTixDQUFxQjtBQUFBO0FBQUE7QUFBQSxtQ0FLUixXQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDekIsWUFBSTtBQUNBO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdB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akIsQ0FQQSxDQVFBOztBQUNBLGNBQU15QixRQUFRLFNBQVNaLDRCQUFPc0IsUUFBUCxDQUFnQnBCLHdCQUFoQixFQUEyQm1CLEVBQTNCLEVBQStCLENBQUMsS0FBRCxDQUEvQixDQUF2QixDQVRBLENBVUE7O0FBQ0EsY0FBSSxDQUFDVCxRQUFMLEVBQWUsT0FBTyxnQ0FBWXRCLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBQ2MsWUFBQUEsT0FBTyxFQUFFZixHQUFHLENBQUNnQixDQUFKLENBQU1DLG1CQUFVbUIsVUFBaEI7QUFBVixXQUE5QixDQUFQLENBWGYsQ0FhQTs7QUFDQSxnQkFBTXpCLDRCQUFPMEIsTUFBUCxDQUFjeEIsd0JBQWQsRUFBeUI7QUFBQ1MsWUFBQUEsR0FBRyxFQUFFVTtBQUFOLFdBQXpCLEVBQW9DO0FBQUNsQixZQUFBQSxTQUFTLEVBQUUsSUFBWjtBQUFrQk0sWUFBQUEsU0FBUyxFQUFFcEIsR0FBRyxDQUFDcUIsSUFBSixDQUFTQztBQUF0QyxXQUFwQyxDQUFOLENBZEEsQ0FlQTs7QUFDQSxjQUFNRyxNQUFNLEdBQUc7QUFDWFYsWUFBQUEsT0FBTyxFQUFFZixHQUFHLENBQUNnQixDQUFKLENBQU1DLG1CQUFVcUIsT0FBaEI7QUFERSxXQUFmO0FBR0EsaUJBQU8sZ0NBQVlyQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCd0IsTUFBdEIsQ0FBUDtBQUNILFNBcEJELENBb0JFLE9BQU9yQixLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXpJZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUE0SU4sSUFBSUwsY0FBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgUGxhbk1vZGVsIGZyb20gJy4uL01vZGVscy9NZW1iZXJzaGlwUGxhbnMnO1xuaW1wb3J0IHtcbiAgICBwYWdpbmF0aW9uLFxuICAgIHBhcnNlQ3VycmVudFBhZ2UsXG4gICAgcGFyc2VMaW1pdCxcbn0gZnJvbSAnLi4vSGVscGVyL1BhZ2luYXRpb24nO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBwYWdpbmF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuXG4vKipcbiAqICBQbGFuIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ25hbWUnLCdhbW91bnQnLCAndmFsaWRpdHknLCAnYm9udXMnLCdhcHBsZV9pZCddO1xuXG5jbGFzcyBQbGFuQ29udHJvbGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGxhblxuICAgICAqL1xuICAgIGNyZWF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge25hbWV9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwbGFuIGV4aXN0c1xuICAgICAgICAgICAgY29uc3QgaXNQbGFuRXhpc3RzID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoUGxhbk1vZGVsLCB7bmFtZSwgaXNEZWxldGVkOiBmYWxzZX0sWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBsYW4gZXhpc3RzXG4gICAgICAgICAgICBpZiAoaXNQbGFuRXhpc3RzKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5BTFJFQURZX1JFR0lTVEVSRUQpfSk7XG5cbiAgICAgICAgICAgIHJlcS5ib2R5LmNyZWF0ZWRCeSA9IHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBQbGFuXG4gICAgICAgICAgICBjb25zdCBwbGFuRGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoUGxhbk1vZGVsLCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkNSRUFURUQpLFxuICAgICAgICAgICAgICAgIHBsYW5EYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgcGxhbnNcbiAgICAgKi9cbiAgICBpbmRleCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBxdWVyeUxpbWl0LCBwYWdlIH0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHBhcnNlQ3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlTGltaXQocXVlcnlMaW1pdCk7ICAgXG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgICAgIC8vIEdldCBsaXN0IG9mIGFsbCBwbGFuc1xuICAgICAgICAgICAgY29uc3QgeyByZXN1bHQgfSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgUGxhbk1vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ25hbWUnLCdhbW91bnQnLCAndmFsaWRpdHknLCAnYm9udXMnLCdhcHBsZV9pZCddXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0YWlsIG9mIFBsYW5cbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCBwbGFuIGRhdGFcbiAgICAgICAgICAgIGxldCBwbGFuRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChQbGFuTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBwbGFuRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIFBsYW4gZGF0YVxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXEuYm9keSlcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHBsYW4gZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBsYW4gbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFwbGFuRGF0YSkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBwbGFuIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoUGxhbk1vZGVsLCB7X2lkOiBpZH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgUGxhblxuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIHBsYW4gZGF0YVxuICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBsYW4gbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFwbGFuRGF0YSkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcblxuICAgICAgICAgICAgLy8gU29mdCBkZWxldGUgUGxhblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShQbGFuTW9kZWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZDogdHJ1ZSwgdXBkYXRlZEJ5OiByZXEudXNlci5faWR9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuREVMRVRFRClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgUGxhbkNvbnRyb2xsZXIoKTtcbiJdfQ==