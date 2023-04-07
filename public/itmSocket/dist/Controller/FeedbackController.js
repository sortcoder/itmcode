"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Mail = _interopRequireDefault(require("../Helper/Mail"));

var _User = _interopRequireDefault(require("../Models/User"));

var _Feedback = _interopRequireDefault(require("../Models/Feedback"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class FeedbackController {
  constructor() {
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            _id
          } = req.user;
          req.body.reportedby = _id;
          var feedbackData = yield _CommonDbController.default.create(_Feedback.default, req.body);
          var result = {
            message: req.t(_constants.default.CREATED),
            feedbackData
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
          var populateFields = {
            path: 'reportedby',
            select: 'userId email mobile name'
          };
          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Feedback.default, currentPage, limit, ['_id', 'title', 'description', 'status', 'adminRemark', 'createdAt'], populateFields); // Get pagination data

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
          } = req.params; // Find plan data

          var populateFields = {
            path: 'reportedby',
            select: 'userId email mobile name'
          };
          var feedbackData = yield _CommonDbController.default.findById(_Feedback.default, id, [], populateFields); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, feedbackData);
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
          var {
            _id
          } = req.user;
          req.body.updatedBy = _id; // Check if plan exists or not

          var feedbackData = yield _CommonDbController.default.findById(_Feedback.default, id, ['_id', 'reportedby']); // Returns error if feedback not exists

          if (!feedbackData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update plan data

          var user = yield _CommonDbController.default.findById(_User.default, feedbackData.reportedby, ['email', 'name', 'deviceToken']);
          var result = yield _CommonDbController.default.update(_Feedback.default, {
            _id: id
          }, req.body); // result.message = `Your feedback is remarked by admin`;

          var remark = req.body.adminRemark ? req.body.adminRemark : "Your query is ".concat(req.body.status);

          if (user && user.email) {
            _Mail.default.send(user.email, "Your query is ".concat(req.body.status), "".concat(remark), user.name);
          }

          if (user.deviceToken) {
            var notificationData = {
              toUser: user._id,
              fromUser: _id,
              title: 'Feedback Remark',
              message: "Your query has ".concat(req.body.status, ", please check your mail "),
              deviceToken: user.deviceToken,
              createdBy: _id,
              updatedBy: _id
            };
            yield _Notifications.default.sendNotification(notificationData);
          } // Send response


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

var _default = new FeedbackController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0ZlZWRiYWNrQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJGZWVkYmFja0NvbnRyb2xsZXIiLCJyZXEiLCJyZXMiLCJlcnJvcnMiLCJpc0VtcHR5IiwiZXJyb3IiLCJhcnJheSIsInN0YXR1cyIsImpzb24iLCJfaWQiLCJ1c2VyIiwiYm9keSIsInJlcG9ydGVkYnkiLCJmZWVkYmFja0RhdGEiLCJDb21tb24iLCJjcmVhdGUiLCJGZWVkYmFja01vZGVsIiwicmVzdWx0IiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJDUkVBVEVEIiwicXVlcnlMaW1pdCIsInBhZ2UiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpc0RlbGV0ZWQiLCJwb3B1bGF0ZUZpZWxkcyIsInBhdGgiLCJzZWxlY3QiLCJ0b3RhbENvdW50IiwicGFnaW5hdGlvbkRhdGEiLCJpZCIsInBhcmFtcyIsImZpbmRCeUlkIiwidXBkYXRlZEJ5IiwiSU5WQUxJRF9JRCIsIlVzZXJNb2RlbCIsInVwZGF0ZSIsInJlbWFyayIsImFkbWluUmVtYXJrIiwiZW1haWwiLCJNYWlsIiwic2VuZCIsIm5hbWUiLCJkZXZpY2VUb2tlbiIsIm5vdGlmaWNhdGlvbkRhdGEiLCJ0b1VzZXIiLCJmcm9tVXNlciIsInRpdGxlIiwiY3JlYXRlZEJ5IiwiTm90aWZpY2F0aW9ucyIsInNlbmROb3RpZmljYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLGtCQUFOLENBQXlCO0FBQUE7QUFBQTtBQUFBLG1DQUNaLFdBQU9DLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN6QixZQUFJO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVC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LEdBRlc7QUFHckJ5QyxjQUFBQSxLQUFLLEVBQUUsaUJBSGM7QUFJckJoQyxjQUFBQSxPQUFPLDJCQUFvQmpCLEdBQUcsQ0FBQ1UsSUFBSixDQUFTSixNQUE3Qiw4QkFKYztBQUtyQnVDLGNBQUFBLFdBQVcsRUFBRXBDLElBQUksQ0FBQ29DLFdBTEc7QUFNckJLLGNBQUFBLFNBQVMsRUFBRTFDLEdBTlU7QUFPckIyQixjQUFBQSxTQUFTLEVBQUUzQjtBQVBVLGFBQXpCO0FBU0Esa0JBQU0yQyx1QkFBY0MsZ0JBQWQsQ0FBK0JOLGdCQUEvQixDQUFOO0FBQ0gsV0FsQ0QsQ0FtQ0E7OztBQUNBLGlCQUFPLGdDQUFZN0MsR0FBWixFQUFpQixHQUFqQixFQUFzQmUsTUFBdEIsQ0FBUDtBQUNILFNBckNELENBcUNFLE9BQU9aLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BaEhvQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQW1IVixJQUFJTCxrQkFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgTWFpbCBmcm9tICcuLi9IZWxwZXIvTWFpbCc7XG5pbXBvcnQgVXNlck1vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyJztcbmltcG9ydCBGZWVkYmFja01vZGVsIGZyb20gJy4uL01vZGVscy9GZWVkYmFjayc7XG5pbXBvcnQge3BhZ2luYXRpb24sIHBhcnNlQ3VycmVudFBhZ2UsIHBhcnNlTGltaXR9IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7YnVpbGRSZXN1bHR9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7cGFnaW5hdGlvblJlc3VsdH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IE5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vU2VydmljZS9Ob3RpZmljYXRpb25zJztcblxuY2xhc3MgRmVlZGJhY2tDb250cm9sbGVyIHtcbiAgICBjcmVhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICByZXEuYm9keS5yZXBvcnRlZGJ5ID0gX2lkO1xuXG4gICAgICAgICAgICBjb25zdCBmZWVkYmFja0RhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKEZlZWRiYWNrTW9kZWwsIHJlcS5ib2R5KTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICBmZWVkYmFja0RhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7cXVlcnlMaW1pdCwgcGFnZX0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHBhcnNlQ3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlTGltaXQocXVlcnlMaW1pdCk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0ge3BhdGg6ICdyZXBvcnRlZGJ5Jywgc2VsZWN0OiAndXNlcklkIGVtYWlsIG1vYmlsZSBuYW1lJ307XG5cbiAgICAgICAgICAgIGNvbnN0IHtyZXN1bHQsIHRvdGFsQ291bnR9ID0gYXdhaXQgcGFnaW5hdGlvblJlc3VsdChcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBGZWVkYmFja01vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgIGxpbWl0LFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJywgJ3N0YXR1cycsICdhZG1pblJlbWFyaycsICdjcmVhdGVkQXQnXSxcbiAgICAgICAgICAgICAgICBwb3B1bGF0ZUZpZWxkc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIC8vIEdldCBwYWdpbmF0aW9uIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSwgbGltaXQpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQsIHBhZ2luYXRpb25EYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCBwbGFuIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0ge3BhdGg6ICdyZXBvcnRlZGJ5Jywgc2VsZWN0OiAndXNlcklkIGVtYWlsIG1vYmlsZSBuYW1lJ307XG5cbiAgICAgICAgICAgIGxldCBmZWVkYmFja0RhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoRmVlZGJhY2tNb2RlbCwgaWQsIFtdLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGZlZWRiYWNrRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdXBkYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSBfaWQ7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwbGFuIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IGZlZWRiYWNrRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChGZWVkYmFja01vZGVsLCBpZCwgWydfaWQnLCAncmVwb3J0ZWRieSddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgZmVlZGJhY2sgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFmZWVkYmFja0RhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBwbGFuIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBmZWVkYmFja0RhdGEucmVwb3J0ZWRieSwgWydlbWFpbCcsICduYW1lJywgJ2RldmljZVRva2VuJ10pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShGZWVkYmFja01vZGVsLCB7X2lkOiBpZH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIHJlc3VsdC5tZXNzYWdlID0gYFlvdXIgZmVlZGJhY2sgaXMgcmVtYXJrZWQgYnkgYWRtaW5gO1xuICAgICAgICAgICAgY29uc3QgcmVtYXJrID0gcmVxLmJvZHkuYWRtaW5SZW1hcmsgPyByZXEuYm9keS5hZG1pblJlbWFyayA6IGBZb3VyIHF1ZXJ5IGlzICR7cmVxLmJvZHkuc3RhdHVzfWA7XG4gICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyLmVtYWlsKSB7XG4gICAgICAgICAgICAgICAgTWFpbC5zZW5kKHVzZXIuZW1haWwsIGBZb3VyIHF1ZXJ5IGlzICR7cmVxLmJvZHkuc3RhdHVzfWAsIGAke3JlbWFya31gLCB1c2VyLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0ZlZWRiYWNrIFJlbWFyaycsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBZb3VyIHF1ZXJ5IGhhcyAke3JlcS5ib2R5LnN0YXR1c30sIHBsZWFzZSBjaGVjayB5b3VyIG1haWwgYCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IHVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEZlZWRiYWNrQ29udHJvbGxlcigpO1xuIl19