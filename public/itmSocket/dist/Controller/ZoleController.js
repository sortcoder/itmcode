"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Zoles = _interopRequireDefault(require("../Models/Zoles"));

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
 *  Zole Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['zole', 'price', 'bonus'];

class ZoleController {
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
            zole
          } = req.body; // Check if zole exists

          var isZoleExists = yield _CommonDbController.default.findSingle(_Zoles.default, {
            zole
          }, ['_id']); // Returns error if zole exists

          if (isZoleExists) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ALREADY_REGISTERED)
          });
          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Zole

          var zoleData = yield _CommonDbController.default.create(_Zoles.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            zoleData
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
          }; // Get list of all zoles

          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Zoles.default, currentPage, '', ['_id', 'zole', 'price', 'bonus']); // Get pagination data
          //const paginationData = pagination(totalCount, currentPage);
          // Send Response

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
          } = req.params; // Find zole data

          var zoleData = yield _CommonDbController.default.findById(_Zoles.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, zoleData);
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
          req.body.updatedBy = req.user._id; // Check if zole exists or not

          var zoleData = yield _CommonDbController.default.findById(_Zoles.default, id, ['_id']); // Returns error if zole not exists

          if (!zoleData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update zole data

          var result = yield _CommonDbController.default.update(_Zoles.default, {
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
          } = req.params; // Find zole data

          var zoleData = yield _CommonDbController.default.findById(_Zoles.default, id, ['_id']); // Returns error if zole not exists

          if (!zoleData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Zole

          yield _CommonDbController.default.update(_Zoles.default, {
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

var _default = new ZoleController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1pvbGVDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIlpvbGVDb250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwiem9sZSIsImJvZHkiLCJpc1pvbGVFeGlzdHMiLCJDb21tb24iLCJmaW5kU2luZ2xlIiwiWm9sZU1vZGVsIiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJBTFJFQURZX1JFR0lTVEVSRUQiLCJjcmVhdGVkQnkiLCJ1cGRhdGVkQnkiLCJ1c2VyIiwiX2lkIiwiem9sZURhdGEiLCJjcmVhdGUiLCJyZXN1bHQiLCJDUkVBVEVEIiwicXVlcnlMaW1pdCIsInBhZ2UiLCJxdWVyeSIsImN1cnJlbnRQYWdlIiwibGltaXQiLCJpc0RlbGV0ZWQiLCJ0b3RhbENvdW50IiwiaWQiLCJmaW5kQnlJZCIsIklOVkFMSURfSUQiLCJ1cGRhdGUiLCJERUxFVEVEIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLElBQU1BLE1BQU0sR0FBRyxDQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLE9BQWxCLENBQWY7O0FBRUEsTUFBTUMsY0FBTixDQUFxQjtBQUFBO0FBQUE7QUFBQSxtQ0FLUixXQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDekIsWUFBSTtBQUNBO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFy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QUF2QixDQVRBLENBVUE7O0FBQ0EsY0FBSSxDQUFDWCxRQUFMLEVBQWUsT0FBTyxnQ0FBWXJCLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBQ2EsWUFBQUEsT0FBTyxFQUFFZCxHQUFHLENBQUNlLENBQUosQ0FBTUMsbUJBQVVtQixVQUFoQjtBQUFWLFdBQTlCLENBQVAsQ0FYZixDQWFBOztBQUNBLGdCQUFNeEIsNEJBQU95QixNQUFQLENBQWN2QixjQUFkLEVBQXlCO0FBQUNRLFlBQUFBLEdBQUcsRUFBRVk7QUFBTixXQUF6QixFQUFvQztBQUFDRixZQUFBQSxTQUFTLEVBQUUsSUFBWjtBQUFrQlosWUFBQUEsU0FBUyxFQUFFbkIsR0FBRyxDQUFDb0IsSUFBSixDQUFTQztBQUF0QyxXQUFwQyxDQUFOLENBZEEsQ0FlQTs7QUFDQSxjQUFNRyxNQUFNLEdBQUc7QUFDWFYsWUFBQUEsT0FBTyxFQUFFZCxHQUFHLENBQUNlLENBQUosQ0FBTUMsbUJBQVVxQixPQUFoQjtBQURFLFdBQWY7QUFHQSxpQkFBTyxnQ0FBWXBDLEdBQVosRUFBaUIsR0FBakIsRUFBc0J1QixNQUF0QixDQUFQO0FBQ0gsU0FwQkQsQ0FvQkUsT0FBT3BCLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BM0lnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQThJTixJQUFJTCxjQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZhbGlkYXRpb25SZXN1bHR9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBab2xlTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1pvbGVzJztcbmltcG9ydCB7XG4gICAgcGFnaW5hdGlvbixcbiAgICBwYXJzZUN1cnJlbnRQYWdlLFxuICAgIHBhcnNlTGltaXQsXG59IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgcGFnaW5hdGlvblJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcblxuLyoqXG4gKiAgWm9sZSBDb250cm9sbGVyIENsYXNzXG4gKiAgQGF1dGhvciBOaXRpc2hhIEtoYW5kZWx3YWwgPG5pdGlzaGEua2hhbmRlbHdhbEBqcGxvZnQuaW4+XG4gKi9cblxuY29uc3QgcGFyYW1zID0gWyd6b2xlJywgJ3ByaWNlJywgJ2JvbnVzJ107XG5cbmNsYXNzIFpvbGVDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB6b2xlXG4gICAgICovXG4gICAgY3JlYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7em9sZX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHpvbGUgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBpc1pvbGVFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShab2xlTW9kZWwsIHt6b2xlfSxbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgem9sZSBleGlzdHNcbiAgICAgICAgICAgIGlmIChpc1pvbGVFeGlzdHMpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkFMUkVBRFlfUkVHSVNURVJFRCl9KTtcblxuICAgICAgICAgICAgcmVxLmJvZHkuY3JlYXRlZEJ5ID0gcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLnVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gQ3JlYXRlIFpvbGVcbiAgICAgICAgICAgIGNvbnN0IHpvbGVEYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShab2xlTW9kZWwsIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgUmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuQ1JFQVRFRCksXG4gICAgICAgICAgICAgICAgem9sZURhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgYWxsIHRoZSB6b2xlc1xuICAgICAqL1xuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHF1ZXJ5TGltaXQsIHBhZ2UgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gcGFyc2VDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbWl0ID0gcGFyc2VMaW1pdChxdWVyeUxpbWl0KTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0ge2lzRGVsZXRlZDogZmFsc2V9O1xuICAgICAgICAgICAgLy8gR2V0IGxpc3Qgb2YgYWxsIHpvbGVzXG4gICAgICAgICAgICBjb25zdCB7IHJlc3VsdCwgdG90YWxDb3VudCB9ID0gYXdhaXQgcGFnaW5hdGlvblJlc3VsdChcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBab2xlTW9kZWwsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgWydfaWQnLCAnem9sZScsICdwcmljZScsICdib251cyddXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBHZXQgcGFnaW5hdGlvbiBkYXRhXG4gICAgICAgICAgICAvL2NvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSk7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0YWlsIG9mIFpvbGVcbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCB6b2xlIGRhdGFcbiAgICAgICAgICAgIGxldCB6b2xlRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChab2xlTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB6b2xlRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIFpvbGUgZGF0YVxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB6b2xlIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHpvbGVEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFpvbGVNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB6b2xlIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghem9sZURhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgem9sZSBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFpvbGVNb2RlbCwge19pZDogaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIFpvbGVcbiAgICAgKi9cbiAgICByZW1vdmUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCB6b2xlIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHpvbGVEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFpvbGVNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB6b2xlIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghem9sZURhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG5cbiAgICAgICAgICAgIC8vIFNvZnQgZGVsZXRlIFpvbGVcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoWm9sZU1vZGVsLCB7X2lkOiBpZH0sIHtpc0RlbGV0ZWQ6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkRFTEVURUQpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFpvbGVDb250cm9sbGVyKCk7XG4iXX0=