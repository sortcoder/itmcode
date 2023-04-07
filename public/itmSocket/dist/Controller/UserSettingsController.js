"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

var _Feedback = _interopRequireDefault(require("../Models/Feedback"));

var _PaymentHistory = _interopRequireDefault(require("../Models/PaymentHistory"));

var _Notifications = _interopRequireDefault(require("../Models/Notifications"));

var _RequestHelper = require("../Helper/RequestHelper");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _User = _interopRequireDefault(require("../Models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  User Settings Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
class UserSettingsController {
  constructor() {
    _defineProperty(this, "update", /*#__PURE__*/function () {
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
          req.body.updatedBy = req.user._id; // Check if user exists or not

          var settings = yield _CommonDbController.default.findSingle(_UserSettings.default, {
            userId: _id
          });
          var userData = yield _CommonDbController.default.findSingle(_User.default, {
            _id: _id
          }); // Returns error if user id is invalid

          if (!settings) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update user settings data

          var result = yield _CommonDbController.default.update(_UserSettings.default, {
            userId: _id
          }, req.body); // Send response

          result.data = settings;
          result.userData = userData;
          result.message = req.t(result.message);
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

    _defineProperty(this, "deleteBackup", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            type,
            time
          } = req.body;
          var d = new Date();
          d.setMonth(d.getMonth() - time);
          var date = d.toLocaleDateString();
          var Model = type === 'feedback' ? _Feedback.default : type === 'payment' ? _PaymentHistory.default : _Notifications.default;
          var data = yield _CommonDbController.default.deleteMultiple(Model, {
            createdAt: {
              $gte: new Date(date)
            }
          });
          return (0, _RequestHelper.buildResult)(res, 200, data);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }

}

var _default = new UserSettingsController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1VzZXJTZXR0aW5nc0NvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsiVXNlclNldHRpbmdzQ29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsIl9pZCIsInVzZXIiLCJib2R5IiwidXBkYXRlZEJ5Iiwic2V0dGluZ3MiLCJDb21tb24iLCJmaW5kU2luZ2xlIiwiVXNlclNldHRpbmdzTW9kZWwiLCJ1c2VySWQiLCJ1c2VyRGF0YSIsIlVzZXJNb2RlbCIsIm1lc3NhZ2UiLCJ0IiwiY29uc3RhbnRzIiwiSU5WQUxJRF9JRCIsInJlc3VsdCIsInVwZGF0ZSIsImRhdGEiLCJ0eXBlIiwidGltZSIsImQiLCJEYXRlIiwic2V0TW9udGgiLCJnZXRNb250aCIsImRhdGUiLCJ0b0xvY2FsZURhdGVTdHJpbmciLCJNb2RlbCIsIkZlZWRiYWNrTW9kZWwiLCJQYXltZW50SGlzdG9yeU1vZGVsIiwiTm90aWZpY2F0aW9uTW9kZWwiLCJkZWxldGVNdWx0aXBsZSIsImNyZWF0ZWRBdCIsIiRndGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsTUFBTUEsc0JBQU4sQ0FBNkI7QUFBQTtBQUFBO0FBQUEsbUNBSWhCLFdBQU9DLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN6QixZQUFJO0FBQ0E7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIs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QixDQUFQO0FBQ0gsU0FkRCxDQWNFLE9BQU9yQixLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXJEd0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUF5RGQsSUFBSUwsc0JBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dmFsaWRhdGlvblJlc3VsdH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IFVzZXJTZXR0aW5nc01vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyU2V0dGluZ3MnO1xuXG5pbXBvcnQgRmVlZGJhY2tNb2RlbCBmcm9tICcuLi9Nb2RlbHMvRmVlZGJhY2snO1xuaW1wb3J0IFBheW1lbnRIaXN0b3J5TW9kZWwgZnJvbSAnLi4vTW9kZWxzL1BheW1lbnRIaXN0b3J5JztcbmltcG9ydCBOb3RpZmljYXRpb25Nb2RlbCBmcm9tICcuLi9Nb2RlbHMvTm90aWZpY2F0aW9ucyc7XG5pbXBvcnQge2J1aWxkUmVzdWx0fSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcbmltcG9ydCBVc2VyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuXG4vKipcbiAqICBVc2VyIFNldHRpbmdzIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jbGFzcyBVc2VyU2V0dGluZ3NDb250cm9sbGVyIHtcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgVXNlciBTZXR0aW5nc1xuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB7X2lkfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLnVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJTZXR0aW5nc01vZGVsLCB7dXNlcklkOiBfaWR9KTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7X2lkOiBfaWR9KTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBpZCBpcyBpbnZhbGlkXG4gICAgICAgICAgICBpZiAoIXNldHRpbmdzKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdXNlciBzZXR0aW5ncyBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJTZXR0aW5nc01vZGVsLCB7dXNlcklkOiBfaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXN1bHQuZGF0YT1zZXR0aW5ncztcbiAgICAgICAgICAgIHJlc3VsdC51c2VyRGF0YT11c2VyRGF0YTtcbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlID0gcmVxLnQocmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRlbGV0ZUJhY2t1cCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge3R5cGUsIHRpbWV9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQgZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICBkLnNldE1vbnRoKGQuZ2V0TW9udGgoKSAtIHRpbWUpO1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IGQudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICBjb25zdCBNb2RlbCA9IHR5cGUgPT09ICdmZWVkYmFjaycgPyBGZWVkYmFja01vZGVsIDogIHR5cGUgPT09ICdwYXltZW50JyA/IFBheW1lbnRIaXN0b3J5TW9kZWwgOiBOb3RpZmljYXRpb25Nb2RlbDtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZGVsZXRlTXVsdGlwbGUoTW9kZWwsIHtjcmVhdGVkQXQ6IHskZ3RlOiBuZXcgRGF0ZShkYXRlKX19KTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgZGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBVc2VyU2V0dGluZ3NDb250cm9sbGVyKCk7XG4iXX0=