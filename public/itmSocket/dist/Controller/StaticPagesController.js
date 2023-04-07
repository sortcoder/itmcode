"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _StaticPages = _interopRequireDefault(require("../Models/StaticPages"));

var _RequestHelper = require("../Helper/RequestHelper");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Static Pages Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['title', 'slug', 'subTitle', 'description'];

class StaticPagesController {
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
            title
          } = req.body;
          req.body.slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); // Check if staticPages exists

          var isStaticPagesExists = yield _CommonDbController.default.findSingle(_StaticPages.default, {
            slug: req.body.slug
          }, ['_id']); // Returns error if staticPages exists

          if (isStaticPagesExists) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ALREADY_REGISTERED)
          });
          req.body.createdBy = req.body.updatedBy = req.user._id; // Create StaticPages

          var staticPagesData = yield _CommonDbController.default.create(_StaticPages.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            staticPagesData
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
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          } // Find staticPages


          var staticPagesData = yield _CommonDbController.default.list(_StaticPages.default, {
            isDeleted: false
          }, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, staticPagesData);
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
            slug
          } = req.params; // Find staticPages data

          var staticPagesData = yield _CommonDbController.default.findSingle(_StaticPages.default, {
            slug
          }, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, staticPagesData);
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
          req.body.updatedBy = req.user._id; // Check if staticPages exists or not

          var staticPagesData = yield _CommonDbController.default.findById(_StaticPages.default, id, ['_id']); // Returns error if staticPages not exists

          if (!staticPagesData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update staticPages data

          var result = yield _CommonDbController.default.update(_StaticPages.default, {
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
          } = req.params; // Find user details

          var pageData = yield _CommonDbController.default.findById(_StaticPages.default, id, ['_id']); // Returns error if user is invalid

          if (!pageData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete user

          yield _CommonDbController.default.update(_StaticPages.default, {
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

var _default = new StaticPagesController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1N0YXRpY1BhZ2VzQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJwYXJhbXMiLCJTdGF0aWNQYWdlc0NvbnRyb2xsZXIiLCJyZXEiLCJyZXMiLCJlcnJvcnMiLCJpc0VtcHR5IiwiZXJyb3IiLCJhcnJheSIsInN0YXR1cyIsImpzb24iLCJ0aXRsZSIsImJvZHkiLCJzbHVnIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiaXNTdGF0aWNQYWdlc0V4aXN0cyIsIkNvbW1vbiIsImZpbmRTaW5nbGUiLCJTdGF0aWNQYWdlc01vZGVsIiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJBTFJFQURZX1JFR0lTVEVSRUQiLCJjcmVhdGVkQnkiLCJ1cGRhdGVkQnkiLCJ1c2VyIiwiX2lkIiwic3RhdGljUGFnZXNEYXRhIiwiY3JlYXRlIiwicmVzdWx0IiwiQ1JFQVRFRCIsImxpc3QiLCJpc0RlbGV0ZWQiLCJpZCIsImZpbmRCeUlkIiwiSU5WQUxJRF9JRCIsInVwZGF0ZSIsInBhZ2VEYXRhIiwiREVMRVRFRCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxNQUFNLEdBQUcsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixVQUFsQixFQUE4QixhQUE5QixDQUFmOztBQUVBLE1BQU1DLHFCQUFOLENBQTRCO0FBQUE7QUFBQTtBQUFBLG1DQUtmLFdBQU9DLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN6QixZQUFJO0FBQ0E7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxF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b3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgU3RhdGljUGFnZXNNb2RlbCBmcm9tICcuLi9Nb2RlbHMvU3RhdGljUGFnZXMnO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcblxuLyoqXG4gKiAgU3RhdGljIFBhZ2VzIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ3RpdGxlJywgJ3NsdWcnLCAnc3ViVGl0bGUnLCAnZGVzY3JpcHRpb24nXTtcblxuY2xhc3MgU3RhdGljUGFnZXNDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBTdGF0aWMgUGFnZXNcbiAgICAgKi9cbiAgICBjcmVhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qge3RpdGxlfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgcmVxLmJvZHkuc2x1ZyA9IHRpdGxlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvIC9nLCAnLScpLnJlcGxhY2UoL1teXFx3LV0rL2csICcnKTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHN0YXRpY1BhZ2VzIGV4aXN0c1xuICAgICAgICAgICAgY29uc3QgaXNTdGF0aWNQYWdlc0V4aXN0cyA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFN0YXRpY1BhZ2VzTW9kZWwsIHtzbHVnOiByZXEuYm9keS5zbHVnfSxbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgc3RhdGljUGFnZXMgZXhpc3RzXG4gICAgICAgICAgICBpZiAoaXNTdGF0aWNQYWdlc0V4aXN0cykgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuQUxSRUFEWV9SRUdJU1RFUkVEKX0pO1xuXG4gICAgICAgICAgICByZXEuYm9keS5jcmVhdGVkQnkgPSByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICAvLyBDcmVhdGUgU3RhdGljUGFnZXNcbiAgICAgICAgICAgIGNvbnN0IHN0YXRpY1BhZ2VzRGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoU3RhdGljUGFnZXNNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICBzdGF0aWNQYWdlc0RhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGaW5kIHN0YXRpY1BhZ2VzXG4gICAgICAgICAgICBsZXQgc3RhdGljUGFnZXNEYXRhID0gYXdhaXQgQ29tbW9uLmxpc3QoU3RhdGljUGFnZXNNb2RlbCwge2lzRGVsZXRlZDogZmFsc2V9LCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBzdGF0aWNQYWdlc0RhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGFpbCBvZiBTdGF0aWNQYWdlc1xuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge3NsdWd9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIEZpbmQgc3RhdGljUGFnZXMgZGF0YVxuICAgICAgICAgICAgbGV0IHN0YXRpY1BhZ2VzRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFN0YXRpY1BhZ2VzTW9kZWwsIHtzbHVnfSwgcGFyYW1zKTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgc3RhdGljUGFnZXNEYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgU3RhdGljUGFnZXMgZGF0YVxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHN0YXRpY1BhZ2VzIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHN0YXRpY1BhZ2VzRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChTdGF0aWNQYWdlc01vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHN0YXRpY1BhZ2VzIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghc3RhdGljUGFnZXNEYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgc3RhdGljUGFnZXMgZGF0YVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShTdGF0aWNQYWdlc01vZGVsLCB7X2lkOiBpZH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgc2VsZWN0ZWQgcGFnZVxuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIHVzZXIgZGV0YWlsc1xuICAgICAgICAgICAgY29uc3QgcGFnZURhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoU3RhdGljUGFnZXNNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlzIGludmFsaWRcbiAgICAgICAgICAgIGlmICghcGFnZURhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG4gICAgICAgICAgICAvLyBTb2Z0IGRlbGV0ZSB1c2VyXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFN0YXRpY1BhZ2VzTW9kZWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZDogdHJ1ZSwgdXBkYXRlZEJ5OiByZXEudXNlci5faWR9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuREVMRVRFRClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBTdGF0aWNQYWdlc0NvbnRyb2xsZXIoKTtcbiJdfQ==