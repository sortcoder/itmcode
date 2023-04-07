"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _InstalledDevices = _interopRequireDefault(require("../Models/InstalledDevices"));

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _RequestHelper = require("../Helper/RequestHelper");

var _Pagination = require("../Helper/Pagination");

var _Mongo = require("../Helper/Mongo");

var _User = _interopRequireDefault(require("../Models/User"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class InstalledDevicesController {
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
            deviceId,
            platform
          } = req.body;
          var isDeviceExists = yield _CommonDbController.default.findSingle(_InstalledDevices.default, {
            deviceId,
            platform
          }, ['_id']);
          if (isDeviceExists) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ALREADY_REGISTERED)
          });
          var deviceData = yield _CommonDbController.default.create(_InstalledDevices.default, req.body);
          var result = {
            message: req.t(_constants.default.CREATED),
            deviceData
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
          } = yield (0, _Mongo.paginationResult)(query, _InstalledDevices.default, currentPage, limit, ['_id', 'deviceId', 'platform']);
          var device = [];

          for (var type of result) {
            device.push(type._id);
          }

          var paginationData = (0, _Pagination.pagination)(totalCount, currentPage, limit);
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

    _defineProperty(this, "dashboard", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          // const {id} = req._id;
          // console.log(req);
          // get year
          var totaluser = yield _User.default.find({
            isDeleted: false
          });
          totaluser = _lodash.default.groupBy(totaluser, "deviceId");
          var newwe = Object.entries(totaluser);
          var installed = newwe.length;
          console.log(installed);
          var activeUser = yield _User.default.countDocuments({
            isDeleted: false
          });
          var subscribedUsers = yield _CommonDbController.default.count(_User.default, {
            isSubscribed: true,
            isDeleted: false
          });
          return (0, _RequestHelper.buildResult)(res, 200, {
            installed,
            activeUser,
            subscribedUsers
          });
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

var _default = new InstalledDevicesController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0luc3RhbGxlZERldmljZXNDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIkluc3RhbGxlZERldmljZXNDb250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwiZGV2aWNlSWQiLCJwbGF0Zm9ybSIsImJvZHkiLCJpc0RldmljZUV4aXN0cyIsIkNvbW1vbiIsImZpbmRTaW5nbGUiLCJJbnN0YWxsZWREZXZpY2VzTW9kZWwiLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkFMUkVBRFlfUkVHSVNURVJFRCIsImRldmljZURhdGEiLCJjcmVhdGUiLCJyZXN1bHQiLCJDUkVBVEVEIiwicXVlcnlMaW1pdCIsInBhZ2UiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpc0RlbGV0ZWQiLCJ0b3RhbENvdW50IiwiZGV2aWNlIiwidHlwZSIsInB1c2giLCJfaWQiLCJwYWdpbmF0aW9uRGF0YSIsInRvdGFsdXNlciIsIlVzZXJNb2RlbCIsImZpbmQiLCJfIiwiZ3JvdXBCeSIsIm5ld3dlIiwiT2JqZWN0IiwiZW50cmllcyIsImluc3RhbGxlZCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJhY3RpdmVVc2VyIiwiY291bnREb2N1bWVudHMiLCJzdWJzY3JpYmVkVXNlcnMiLCJjb3VudCIsImlzU3Vic2NyaWJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBR0EsTUFBTUEsMEJBQU4sQ0FBZ0M7QUFBQTtBQUFBO0FBQUEsbUNBQ25CLFdBQU1DLEdBQU4sRUFBV0MsR0FBWCxFQUFrQjtBQUN2QixZQUFHO0FBQ0MsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxF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Q0FBZTtBQUFDVCxZQUFBQSxTQUFTLEVBQUU7QUFBWixXQUFmLENBQXRCO0FBQ0NPLFVBQUFBLFNBQVMsR0FBQ0csZ0JBQUVDLE9BQUYsQ0FBVUosU0FBVixFQUFvQixVQUFwQixDQUFWO0FBQ0EsY0FBSUssS0FBSyxHQUFDQyxNQUFNLENBQUNDLE9BQVAsQ0FBZVAsU0FBZixDQUFWO0FBQ0csY0FBSVEsU0FBUyxHQUFDSCxLQUFLLENBQUNJLE1BQXBCO0FBQ0FDLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSCxTQUFaO0FBQ0osY0FBTUksVUFBVSxTQUFTWCxjQUFVWSxjQUFWLENBQXlCO0FBQUNwQixZQUFBQSxTQUFTLEVBQUU7QUFBWixXQUF6QixDQUF6QjtBQUNBLGNBQU1xQixlQUFlLFNBQVNyQyw0QkFBT3NDLEtBQVAsQ0FBYWQsYUFBYixFQUF3QjtBQUFDZSxZQUFBQSxZQUFZLEVBQUUsSUFBZjtBQUFxQnZCLFlBQUFBLFNBQVMsRUFBRTtBQUFoQyxXQUF4QixDQUE5QjtBQUNBLGlCQUFPLGdDQUFZM0IsR0FBWixFQUFpQixHQUFqQixFQUFzQjtBQUFDMEMsWUFBQUEsU0FBRDtBQUFZSSxZQUFBQSxVQUFaO0FBQXdCRSxZQUFBQTtBQUF4QixXQUF0QixDQUFQO0FBQ0gsU0FiRCxDQWNBLE9BQU83QyxLQUFQLEVBQWM7QUFDVjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFHSixPQWpGMkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUF3RmpCLElBQUlMLDBCQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZhbGlkYXRpb25SZXN1bHR9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBJbnN0YWxsZWREZXZpY2VzTW9kZWwgZnJvbSAnLi4vTW9kZWxzL0luc3RhbGxlZERldmljZXMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tb24gZnJvbSBcIi4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXJcIlxuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQgeyBwYWdpbmF0aW9uUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBVc2VyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuXG5jbGFzcyBJbnN0YWxsZWREZXZpY2VzQ29udHJvbGxlcntcbiAgICBjcmVhdGUgPSBhc3luYyhyZXEsIHJlcykgPT57XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qge2RldmljZUlkLCBwbGF0Zm9ybX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IGlzRGV2aWNlRXhpc3RzID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoSW5zdGFsbGVkRGV2aWNlc01vZGVsLHtkZXZpY2VJZCwgcGxhdGZvcm19LFsnX2lkJ10pXG4gICAgICAgICAgICAgICAgaWYoaXNEZXZpY2VFeGlzdHMpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkFMUkVBRFlfUkVHSVNURVJFRCl9KTtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZURhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKEluc3RhbGxlZERldmljZXNNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICBkZXZpY2VEYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKXtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG5cbiAgICBcbiAgICAgICAgfVxuICAgIH0gXG5cbiAgICBpbmRleCA9IGFzeW5jKHJlcSwgcmVzKT0+e1xuICAgICAgICB0cnl7XG4gICAgICAgICAgICBjb25zdCB7cXVlcnlMaW1pdCwgcGFnZSB9PSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHBhcnNlQ3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlTGltaXQocXVlcnlMaW1pdCk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB7IHJlc3VsdCwgdG90YWxDb3VudCB9ID0gYXdhaXQgcGFnaW5hdGlvblJlc3VsdChcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBJbnN0YWxsZWREZXZpY2VzTW9kZWwsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICAgICAgbGltaXQsXG4gICAgICAgICAgICAgICAgWydfaWQnLCAnZGV2aWNlSWQnLCAncGxhdGZvcm0nXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IFtdXG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiByZXN1bHQpIHsgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRldmljZS5wdXNoKHR5cGUuX2lkKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSwgbGltaXQpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQsIHBhZ2luYXRpb25EYXRhKTtcblxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG5cblxuICAgIH07XG5cbiAgICBkYXNoYm9hcmQgPSBhc3luYyhyZXEsIHJlcyk9PntcbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgLy8gY29uc3Qge2lkfSA9IHJlcS5faWQ7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXEpO1xuICAgICAgICAgICAgLy8gZ2V0IHllYXJcbiAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdG90YWx1c2VyID0gYXdhaXQgVXNlck1vZGVsLmZpbmQoe2lzRGVsZXRlZDogZmFsc2V9KTtcbiAgICAgICAgICAgICB0b3RhbHVzZXI9Xy5ncm91cEJ5KHRvdGFsdXNlcixcImRldmljZUlkXCIpO1xuICAgICAgICAgICAgIGxldCBuZXd3ZT1PYmplY3QuZW50cmllcyh0b3RhbHVzZXIpXG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbGxlZD1uZXd3ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5zdGFsbGVkKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVVzZXIgPSBhd2FpdCBVc2VyTW9kZWwuY291bnREb2N1bWVudHMoe2lzRGVsZXRlZDogZmFsc2V9KTtcbiAgICAgICAgICAgIGNvbnN0IHN1YnNjcmliZWRVc2VycyA9IGF3YWl0IENvbW1vbi5jb3VudChVc2VyTW9kZWwsIHtpc1N1YnNjcmliZWQ6IHRydWUsIGlzRGVsZXRlZDogZmFsc2V9KTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwge2luc3RhbGxlZCwgYWN0aXZlVXNlciwgc3Vic2NyaWJlZFVzZXJzfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cblxuXG4gICAgfVxuXG5cbn1cblxuXG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBJbnN0YWxsZWREZXZpY2VzQ29udHJvbGxlcigpO1xuIl19