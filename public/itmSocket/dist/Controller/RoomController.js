"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _fs = _interopRequireDefault(require("fs"));

var _generateOtp = _interopRequireDefault(require("generate-otp"));

var _Room = _interopRequireDefault(require("../Models/Room"));

var _User = _interopRequireDefault(require("../Models/User"));

var _RequestHelper = require("../Helper/RequestHelper");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _Pagination = require("../Helper/Pagination");

var _Mongo = require("../Helper/Mongo");

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Room Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['title', 'hostedBy', 'roomImg', 'guests', 'isLive', 'roomId'];

class RoomController {
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
          var {
            _id
          } = req.user; // Path for uploading files

          var splitUrl = req.baseUrl.split('/');
          var folderName = splitUrl[splitUrl.length - 1];
          var dir = 'uploads/' + folderName; // Check if room exists

          var isRoomExists = yield _CommonDbController.default.findSingle(_Room.default, {
            title,
            isLive: true
          }, ['_id']); // Returns error if room exists

          if (isRoomExists) {
            // Delete related uploaded files from the folder
            if (req.file && req.file.filename && dir + req.file.filename) {
              _fs.default.unlink(dir + '/' + req.file.filename, err => {
                if (err) console.log(err);
              });
            } // Returns error if page already exists


            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.ALREADY_REGISTERED)
            });
          }

          req.body.roomId = _generateOtp.default.generate(6); // Set url path for uploaded file

          if (req.file && req.file.filename) {
            req.body.roomImg = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          } // Create Room


          req.body.hostedBy = req.body.createdBy = req.body.updatedBy = _id;
          var roomData = yield _CommonDbController.default.create(_Room.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            roomData
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

    _defineProperty(this, "single", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
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
          var populateFields = [{
            path: 'hostedBy',
            select: 'name email profilePic'
          }, {
            path: 'guests',
            select: 'name email profilePic'
          }]; // Find room data

          var roomData = yield _CommonDbController.default.findById(_Room.default, id, params, populateFields); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, roomData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "addRemoveGuest", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            roomId,
            guestId
          } = req.body; // Find room data

          var roomData = yield _CommonDbController.default.findSingle(_Room.default, {
            _id: roomId,
            hostedBy: _id
          }, ['_id', 'title', 'guests']); // Returns error if room not exists

          if (!roomData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          });
          var hostData = yield _CommonDbController.default.findById(_User.default, _id, ['name']);
          var guestData = yield _CommonDbController.default.findById(_User.default, guestId, ['deviceToken']);
          roomData = roomData.toObject();
          var message = '';

          if (roomData.guests && roomData.guests.length) {
            var index = roomData.guests.indexOf(guestId);

            if (index === -1) {
              roomData.guests.push(guestId);
              message = 'Guest added';
            } else {
              roomData.guests.splice(index, 1);
              message = 'Guest removed';
            }
          } else {
            roomData.guests = [guestId];
            message = 'Guest added';
          }

          yield _CommonDbController.default.update(_Room.default, {
            _id: roomData._id
          }, {
            guests: roomData.guests
          });

          if (guestData.deviceToken) {
            var title = message === 'Guest added' ? "Invited to the room ".concat(roomData.title) : "Removed from the room ".concat(roomData.title);
            var msg = message === 'Guest added' ? "You have received invitation from ".concat(hostData.name, " for room ").concat(roomData.title) : "You have been removed from room ".concat(roomData.title);
            var notificationData = {
              toUser: guestId,
              fromUser: _id,
              title,
              message: msg,
              deviceToken: guestData.deviceToken,
              createdBy: _id,
              updatedBy: _id
            };
            yield _Notifications.default.sendNotification(notificationData);
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message
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

    _defineProperty(this, "index", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (req, res) {
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
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Room.default, currentPage, limit, params); // Get pagination data

          var paginationData = (0, _Pagination.pagination)(totalCount, currentPage, limit); // Send Response

          return (0, _RequestHelper.buildResult)(res, 200, result, paginationData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "endLive", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            id
          } = req.params; // Find room data

          var roomData = yield _CommonDbController.default.findById(_Room.default, id, ['_id']); // Returns error if room not exists

          if (!roomData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Room

          yield _CommonDbController.default.update(_Room.default, {
            _id: id
          }, {
            isLive: false,
            updatedBy: _id
          }); // Send response

          var result = {
            message: 'Room Unlive'
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

var _default = new RoomController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1Jvb21Db250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIlJvb21Db250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwidGl0bGUiLCJib2R5IiwiX2lkIiwidXNlciIsInNwbGl0VXJsIiwiYmFzZVVybCIsInNwbGl0IiwiZm9sZGVyTmFtZSIsImxlbmd0aCIsImRpciIsImlzUm9vbUV4aXN0cyIsIkNvbW1vbiIsImZpbmRTaW5nbGUiLCJSb29tTW9kZWwiLCJpc0xpdmUiLCJmaWxlIiwiZmlsZW5hbWUiLCJmcyIsInVubGluayIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkFMUkVBRFlfUkVHSVNURVJFRCIsInJvb21JZCIsIm90cEdlbmVyYXRvciIsImdlbmVyYXRlIiwicm9vbUltZyIsInByb2Nlc3MiLCJlbnYiLCJJTUFHRV9VUkwiLCJob3N0ZWRCeSIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsInJvb21EYXRhIiwiY3JlYXRlIiwicmVzdWx0IiwiQ1JFQVRFRCIsImlkIiwicG9wdWxhdGVGaWVsZHMiLCJwYXRoIiwic2VsZWN0IiwiZmluZEJ5SWQiLCJndWVzdElkIiwiSU5WQUxJRF9JRCIsImhvc3REYXRhIiwiVXNlck1vZGVsIiwiZ3Vlc3REYXRhIiwidG9PYmplY3QiLCJndWVzdHMiLCJpbmRleCIsImluZGV4T2YiLCJwdXNoIiwic3BsaWNlIiwidXBkYXRlIiwiZGV2aWNlVG9rZW4iLCJtc2ciLCJuYW1lIiwibm90aWZpY2F0aW9uRGF0YSIsInRvVXNlciIsImZyb21Vc2VyIiwiTm90aWZpY2F0aW9ucyIsInNlbmROb3RpZmljYXRpb24iLCJxdWVyeUxpbWl0IiwicGFnZSIsInF1ZXJ5IiwiY3VycmVudFBhZ2UiLCJsaW1pdCIsImlzRGVsZXRlZCIsInRvdGFsQ291bnQi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Q0FBWTNDLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBQzZCLFlBQUFBLE9BQU8sRUFBRTlCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVzQixVQUFoQjtBQUFWLFdBQTlCLENBQVAsQ0FOZixDQU9BOztBQUNBLGdCQUFNbkMsNEJBQU82QyxNQUFQLENBQWMzQyxhQUFkLEVBQXlCO0FBQUNYLFlBQUFBLEdBQUcsRUFBRXNDO0FBQU4sV0FBekIsRUFBb0M7QUFBQzFCLFlBQUFBLE1BQU0sRUFBRSxLQUFUO0FBQWdCcUIsWUFBQUEsU0FBUyxFQUFFakM7QUFBM0IsV0FBcEMsQ0FBTixDQVJBLENBU0E7O0FBQ0EsY0FBTW9DLE1BQU0sR0FBRztBQUNYaEIsWUFBQUEsT0FBTyxFQUFFO0FBREUsV0FBZjtBQUdBLGlCQUFPLGdDQUFZN0IsR0FBWixFQUFpQixHQUFqQixFQUFzQjZDLE1BQXRCLENBQVA7QUFDSCxTQWRELENBY0UsT0FBTzFDLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BN0xnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQWdNTixJQUFJTCxjQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3ZhbGlkYXRpb25SZXN1bHR9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgb3RwR2VuZXJhdG9yIGZyb20gJ2dlbmVyYXRlLW90cCc7XG5pbXBvcnQgUm9vbU1vZGVsIGZyb20gJy4uL01vZGVscy9Sb29tJztcbmltcG9ydCBVc2VyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IHtidWlsZFJlc3VsdH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vRGJDb250cm9sbGVyL0NvbW1vbkRiQ29udHJvbGxlcic7XG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQge3BhZ2luYXRpb25SZXN1bHR9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgTm90aWZpY2F0aW9ucyBmcm9tICcuLi9TZXJ2aWNlL05vdGlmaWNhdGlvbnMnO1xuXG4vKipcbiAqICBSb29tIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ3RpdGxlJywgJ2hvc3RlZEJ5JywgJ3Jvb21JbWcnLCAnZ3Vlc3RzJywgJ2lzTGl2ZScsICdyb29tSWQnXTtcblxuY2xhc3MgUm9vbUNvbnRyb2xsZXIge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHJvb21cbiAgICAgKi9cbiAgICBjcmVhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHt0aXRsZX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG5cbiAgICAgICAgICAgIC8vIFBhdGggZm9yIHVwbG9hZGluZyBmaWxlc1xuICAgICAgICAgICAgY29uc3Qgc3BsaXRVcmwgPSByZXEuYmFzZVVybC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgY29uc3QgZm9sZGVyTmFtZSA9IHNwbGl0VXJsW3NwbGl0VXJsLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgZGlyID0gJ3VwbG9hZHMvJyArIGZvbGRlck5hbWU7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHJvb20gZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBpc1Jvb21FeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShSb29tTW9kZWwsIHt0aXRsZSwgaXNMaXZlOiB0cnVlfSwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHJvb20gZXhpc3RzXG4gICAgICAgICAgICBpZiAoaXNSb29tRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIHJlbGF0ZWQgdXBsb2FkZWQgZmlsZXMgZnJvbSB0aGUgZm9sZGVyXG4gICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlICYmIHJlcS5maWxlLmZpbGVuYW1lICYmIGRpciArIHJlcS5maWxlLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnVubGluayhkaXIgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZSwgKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgcGFnZSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkFMUkVBRFlfUkVHSVNURVJFRCl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcS5ib2R5LnJvb21JZCA9IG90cEdlbmVyYXRvci5nZW5lcmF0ZSg2KTtcbiAgICAgICAgICAgIC8vIFNldCB1cmwgcGF0aCBmb3IgdXBsb2FkZWQgZmlsZVxuICAgICAgICAgICAgaWYgKHJlcS5maWxlICYmIHJlcS5maWxlLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmVxLmJvZHkucm9vbUltZyA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ3JlYXRlIFJvb21cbiAgICAgICAgICAgIHJlcS5ib2R5Lmhvc3RlZEJ5ID0gcmVxLmJvZHkuY3JlYXRlZEJ5ID0gcmVxLmJvZHkudXBkYXRlZEJ5ID0gX2lkO1xuICAgICAgICAgICAgY29uc3Qgcm9vbURhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKFJvb21Nb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICByb29tRGF0YVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRhaWwgb2YgUm9vbVxuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IFt7cGF0aDogJ2hvc3RlZEJ5Jywgc2VsZWN0OiAnbmFtZSBlbWFpbCBwcm9maWxlUGljJ30sIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnZ3Vlc3RzJyxcbiAgICAgICAgICAgICAgICBzZWxlY3Q6ICduYW1lIGVtYWlsIHByb2ZpbGVQaWMnXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIC8vIEZpbmQgcm9vbSBkYXRhXG4gICAgICAgICAgICBsZXQgcm9vbURhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUm9vbU1vZGVsLCBpZCwgcGFyYW1zLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJvb21EYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEFkZCBvciBSZW1vdmUgR3Vlc3QgZnJvbSB0aGUgUm9vbVxuICAgICAqIEBwYXJhbSByZXFcbiAgICAgKiBAcGFyYW0gcmVzXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPHZvaWQ+fVxuICAgICAqL1xuICAgIGFkZFJlbW92ZUd1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7X2lkfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3Qge3Jvb21JZCwgZ3Vlc3RJZH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIC8vIEZpbmQgcm9vbSBkYXRhXG4gICAgICAgICAgICBsZXQgcm9vbURhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShSb29tTW9kZWwsIHtfaWQ6IHJvb21JZCwgaG9zdGVkQnk6IF9pZH0sIFsnX2lkJywgJ3RpdGxlJywgJ2d1ZXN0cyddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgcm9vbSBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXJvb21EYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICBjb25zdCBob3N0RGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJ10pO1xuICAgICAgICAgICAgY29uc3QgZ3Vlc3REYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgZ3Vlc3RJZCwgWydkZXZpY2VUb2tlbiddKTtcblxuICAgICAgICAgICAgcm9vbURhdGEgPSByb29tRGF0YS50b09iamVjdCgpO1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgICAgICAgIGlmIChyb29tRGF0YS5ndWVzdHMgJiYgcm9vbURhdGEuZ3Vlc3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcm9vbURhdGEuZ3Vlc3RzLmluZGV4T2YoZ3Vlc3RJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByb29tRGF0YS5ndWVzdHMucHVzaChndWVzdElkKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdHdWVzdCBhZGRlZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vbURhdGEuZ3Vlc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnR3Vlc3QgcmVtb3ZlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByb29tRGF0YS5ndWVzdHMgPSBbZ3Vlc3RJZF07XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdHdWVzdCBhZGRlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFJvb21Nb2RlbCwge19pZDogcm9vbURhdGEuX2lkfSwge2d1ZXN0czogcm9vbURhdGEuZ3Vlc3RzfSk7XG4gICAgICAgICAgICBpZiAoZ3Vlc3REYXRhLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBtZXNzYWdlID09PSAnR3Vlc3QgYWRkZWQnID8gYEludml0ZWQgdG8gdGhlIHJvb20gJHtyb29tRGF0YS50aXRsZX1gIDogYFJlbW92ZWQgZnJvbSB0aGUgcm9vbSAke3Jvb21EYXRhLnRpdGxlfWA7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNnID0gbWVzc2FnZSA9PT0gJ0d1ZXN0IGFkZGVkJyA/IGBZb3UgaGF2ZSByZWNlaXZlZCBpbnZpdGF0aW9uIGZyb20gJHtob3N0RGF0YS5uYW1lfSBmb3Igcm9vbSAke3Jvb21EYXRhLnRpdGxlfWAgOlxuICAgICAgICAgICAgICAgICAgICBgWW91IGhhdmUgYmVlbiByZW1vdmVkIGZyb20gcm9vbSAke3Jvb21EYXRhLnRpdGxlfWA7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiBndWVzdElkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogZ3Vlc3REYXRhLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7bWVzc2FnZX0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7cXVlcnlMaW1pdCwgcGFnZX0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGFnZSA9IHBhcnNlQ3VycmVudFBhZ2UocGFnZSk7XG4gICAgICAgICAgICBjb25zdCBsaW1pdCA9IHBhcnNlTGltaXQocXVlcnlMaW1pdCk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHtpc0RlbGV0ZWQ6IGZhbHNlfTtcbiAgICAgICAgICAgIC8vIEdldCBsaXN0IG9mIGFsbCBwbGFuc1xuICAgICAgICAgICAgY29uc3Qge3Jlc3VsdCwgdG90YWxDb3VudH0gPSBhd2FpdCBwYWdpbmF0aW9uUmVzdWx0KFxuICAgICAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgICAgIFJvb21Nb2RlbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50UGFnZSxcbiAgICAgICAgICAgICAgICBsaW1pdCxcbiAgICAgICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEdldCBwYWdpbmF0aW9uIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSwgbGltaXQpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQsIHBhZ2luYXRpb25EYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFbmQgbGl2ZSBvZiByb29tXG4gICAgICogQHBhcmFtIHJlcVxuICAgICAqIEBwYXJhbSByZXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48dm9pZD59XG4gICAgICovXG4gICAgZW5kTGl2ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qge19pZH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCByb29tIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJvb21EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFJvb21Nb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiByb29tIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghcm9vbURhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG4gICAgICAgICAgICAvLyBTb2Z0IGRlbGV0ZSBSb29tXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFJvb21Nb2RlbCwge19pZDogaWR9LCB7aXNMaXZlOiBmYWxzZSwgdXBkYXRlZEJ5OiBfaWR9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUm9vbSBVbmxpdmUnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgUm9vbUNvbnRyb2xsZXIoKTtcbiJdfQ==