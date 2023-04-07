"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Tasks = _interopRequireDefault(require("../Models/Tasks"));

var _User = _interopRequireDefault(require("../Models/User"));

var _ViewTasks = _interopRequireDefault(require("../Models/ViewTasks"));

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
 *  Task Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['title', 'reward', 'link', 'rewardType'];

class TaskController {
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
          } = req.body; // Check if task exists

          var isTaskExists = yield _CommonDbController.default.findSingle(_Tasks.default, {
            title,
            isDeleted: false
          }, ['_id']); // Returns error if task exists

          if (isTaskExists) {
            // Returns error if page already exists
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.ALREADY_REGISTERED)
            });
          } // Set url path for uploaded file


          req.body.image = req.file && req.file.filename ? process.env.IMAGE_URL + folderName + '/' + req.file.filename : '';
          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Task

          var taskData = yield _CommonDbController.default.create(_Tasks.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            taskData
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
            _id
          } = req.user;
          var {
            queryLimit,
            page
          } = req.query;
          var currentPage = (0, _Pagination.parseCurrentPage)(page);
          var limit = (0, _Pagination.parseLimit)(queryLimit);
          var query = {
            isDeleted: false
          }; // Get list of all tasks

          /*  let { result } = await paginationResult(
               query,
               TaskModel,
               currentPage,
               limit,
               ['_id', 'title', 'reward', 'link', 'rewardType']
           ); */

          var result = yield _Tasks.default.find(query).sort({
            'createdAt': 1
          });

          if (result && result.length) {
            var arr = [];

            for (var obj of result) {
              obj = obj.toObject();
              obj.isViewed = false;
              var data = yield _CommonDbController.default.findSingle(_ViewTasks.default, {
                task: obj._id,
                user: _id
              }, ['_id']);

              if (data && data._id) {
                obj.isViewed = true;
              }

              obj.type = "weekly";

              if (obj.rewardType == "reward" && obj.title == "Watch Video") {
                obj.type = "video";
              }

              if (obj.rewardType == "reward" && obj.title == "AD Impression") {
                obj.type = "ad";
              }

              arr.push(obj);
            }

            result = arr;
          }

          console.log(result); // Send Response

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
          } = req.params; // Find task data

          var taskData = yield _CommonDbController.default.findById(_Tasks.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, taskData);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "addReward", /*#__PURE__*/function () {
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
          } = req.user; // Find task data

          var taskData = yield _CommonDbController.default.findById(_Tasks.default, id);
          yield _CommonDbController.default.create(_ViewTasks.default, {
            task: id,
            user: _id
          });
          var userData = yield _CommonDbController.default.findById(_User.default, _id, ['popularity', "message", "wallet"]); // const popularity = userData.popularity ? userData.popularity + taskData.reward : taskData.reward;

          if (taskData.rewardType == "reward") {
            var message = userData.message ? userData.message + taskData.reward : taskData.reward;
            yield _CommonDbController.default.update(_User.default, {
              _id
            }, {
              message
            });
          } else {
            var wallet = userData.wallet ? userData.wallet + taskData.reward : taskData.reward;
            yield _CommonDbController.default.update(_User.default, {
              _id
            }, {
              wallet
            });
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Reward Added'
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "update", /*#__PURE__*/function () {
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
          } = req.params;
          req.body.updatedBy = req.user._id; // Check if task exists or not

          var taskData = yield _CommonDbController.default.findById(_Tasks.default, id, ['_id']);
          yield _ViewTasks.default.deleteMany({
            task: id
          }); // Returns error if task not exists

          if (!taskData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Update task data

          var result = yield _CommonDbController.default.update(_Tasks.default, {
            _id: id
          }, req.body); // Send response

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

    _defineProperty(this, "remove", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            id
          } = req.params; // Find task data

          var taskData = yield _CommonDbController.default.findById(_Tasks.default, id, ['_id']); // Returns error if task not exists

          if (!taskData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Task

          yield _CommonDbController.default.update(_Tasks.default, {
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

      return function (_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }());
  }

}

var _default = new TaskController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1Rhc2tDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIlRhc2tDb250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwidGl0bGUiLCJib2R5IiwiaXNUYXNrRXhpc3RzIiwiQ29tbW9uIiwiZmluZFNpbmdsZSIsIlRhc2tNb2RlbCIsImlzRGVsZXRlZCIsIm1lc3NhZ2UiLCJ0IiwiY29uc3RhbnRzIiwiQUxSRUFEWV9SRUdJU1RFUkVEIiwiaW1hZ2UiLCJmaWxlIiwiZmlsZW5hbWUiLCJwcm9jZXNzIiwiZW52IiwiSU1BR0VfVVJMIiwiZm9sZGVyTmFtZSIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsInVzZXIiLCJfaWQiLCJ0YXNrRGF0YSIsImNyZWF0ZSIsInJlc3VsdCIsIkNSRUFURUQiLCJxdWVyeUxpbWl0IiwicGFnZSIsInF1ZXJ5IiwiY3VycmVudFBhZ2UiLCJsaW1pdCIsImZpbmQiLCJzb3J0IiwibGVuZ3RoIiwiYXJyIiwib2JqIiwidG9PYmplY3QiLCJpc1ZpZXdlZCIsImRhdGEiLCJWaWV3VGFza01vZGVsIiwidGFzayIsInR5cGUiLCJyZXdhcmRUeXBlIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJpZCIsImZpbmRCeUlkIiwidXNlckRhdGEiLCJVc2VyTW9kZWwiLCJyZXdhcmQiLCJ1cGRhdGUiLCJ3YWxsZXQiLCJkZWxldGVNYW55IiwiSU5WQUxJRF9JRCIsIkRFTEVURUQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsT0FBRCxFQUFVLFFBQVYsRUFBb0IsTUFBcEIsRUFBNEIsWUFBNUIsQ0FBZjs7QUFFQSxNQUFNQyxjQUFO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QUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBb05OLElBQUlMLGNBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dmFsaWRhdGlvblJlc3VsdH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IFRhc2tNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVGFza3MnO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgVmlld1Rhc2tNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVmlld1Rhc2tzJztcbmltcG9ydCB7XG4gICAgcGFnaW5hdGlvbixcbiAgICBwYXJzZUN1cnJlbnRQYWdlLFxuICAgIHBhcnNlTGltaXQsXG59IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgcGFnaW5hdGlvblJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcblxuLyoqXG4gKiAgVGFzayBDb250cm9sbGVyIENsYXNzXG4gKiAgQGF1dGhvciBOaXRpc2hhIEtoYW5kZWx3YWwgPG5pdGlzaGEua2hhbmRlbHdhbEBqcGxvZnQuaW4+XG4gKi9cblxuY29uc3QgcGFyYW1zID0gWyd0aXRsZScsICdyZXdhcmQnLCAnbGluaycsICdyZXdhcmRUeXBlJ107XG5cbmNsYXNzIFRhc2tDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0YXNrXG4gICAgICovXG4gICAgY3JlYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHt0aXRsZX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRhc2sgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBpc1Rhc2tFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShUYXNrTW9kZWwsIHt0aXRsZSwgaXNEZWxldGVkOiBmYWxzZX0sWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHRhc2sgZXhpc3RzXG5cbiAgICAgICAgICAgIGlmIChpc1Rhc2tFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHBhZ2UgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5BTFJFQURZX1JFR0lTVEVSRUQpfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNldCB1cmwgcGF0aCBmb3IgdXBsb2FkZWQgZmlsZVxuICAgICAgICAgICAgcmVxLmJvZHkuaW1hZ2UgPSByZXEuZmlsZSAmJiByZXEuZmlsZS5maWxlbmFtZSA/IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZSA6ICcnO1xuXG4gICAgICAgICAgICByZXEuYm9keS5jcmVhdGVkQnkgPSByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICAvLyBDcmVhdGUgVGFza1xuICAgICAgICAgICAgY29uc3QgdGFza0RhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKFRhc2tNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICB0YXNrRGF0YSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBhbGwgdGhlIHRhc2tzXG4gICAgICovXG4gICAgaW5kZXggPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHtfaWR9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHF1ZXJ5TGltaXQsIHBhZ2UgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gcGFyc2VDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbWl0ID0gcGFyc2VMaW1pdChxdWVyeUxpbWl0KTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0ge2lzRGVsZXRlZDogZmFsc2V9O1xuICAgICAgICAgICAgLy8gR2V0IGxpc3Qgb2YgYWxsIHRhc2tzXG4gICAgICAgICAgIC8qICBsZXQgeyByZXN1bHQgfSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgVGFza01vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgIGxpbWl0LFxuICAgICAgICAgICAgICAgIFsnX2lkJywgJ3RpdGxlJywgJ3Jld2FyZCcsICdsaW5rJywgJ3Jld2FyZFR5cGUnXVxuICAgICAgICAgICAgKTsgKi9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IFRhc2tNb2RlbC5maW5kKHF1ZXJ5KS5zb3J0KHsnY3JlYXRlZEF0JzogMX0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmoudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzVmlld2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShWaWV3VGFza01vZGVsLCB7dGFzazogb2JqLl9pZCwgdXNlcjogX2lkfSwgWydfaWQnXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmouaXNWaWV3ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9iai50eXBlPVwid2Vla2x5XCI7XG4gICAgICAgICAgICAgICAgICAgIGlmKG9iai5yZXdhcmRUeXBlPT1cInJld2FyZFwiICYmIG9iai50aXRsZT09XCJXYXRjaCBWaWRlb1wiKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmoudHlwZT1cInZpZGVvXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYob2JqLnJld2FyZFR5cGU9PVwicmV3YXJkXCIgJiYgb2JqLnRpdGxlPT1cIkFEIEltcHJlc3Npb25cIilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnR5cGU9XCJhZFwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBhcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0YWlsIG9mIFRhc2tcbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCB0YXNrIGRhdGFcbiAgICAgICAgICAgIGxldCB0YXNrRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChUYXNrTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB0YXNrRGF0YSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYWRkUmV3YXJkID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3Qge19pZH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIC8vIEZpbmQgdGFzayBkYXRhXG4gICAgICAgICAgICBsZXQgdGFza0RhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVGFza01vZGVsLCBpZCk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKFZpZXdUYXNrTW9kZWwsIHt0YXNrOiBpZCwgdXNlcjogX2lkfSk7XG4gICAgICAgICAgICBjb25zdCB1c2VyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWydwb3B1bGFyaXR5JyxcIm1lc3NhZ2VcIixcIndhbGxldFwiXSk7XG4gICAgICAgICAgICAvLyBjb25zdCBwb3B1bGFyaXR5ID0gdXNlckRhdGEucG9wdWxhcml0eSA/IHVzZXJEYXRhLnBvcHVsYXJpdHkgKyB0YXNrRGF0YS5yZXdhcmQgOiB0YXNrRGF0YS5yZXdhcmQ7XG4gICAgICAgICAgICBpZih0YXNrRGF0YS5yZXdhcmRUeXBlPT1cInJld2FyZFwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB1c2VyRGF0YS5tZXNzYWdlID8gdXNlckRhdGEubWVzc2FnZSArIHRhc2tEYXRhLnJld2FyZCA6IHRhc2tEYXRhLnJld2FyZDtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZH0sIHttZXNzYWdlfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhbGxldCA9IHVzZXJEYXRhLndhbGxldCA/IHVzZXJEYXRhLndhbGxldCArIHRhc2tEYXRhLnJld2FyZCA6IHRhc2tEYXRhLnJld2FyZDtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZH0sIHt3YWxsZXR9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIFxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7bWVzc2FnZTogJ1Jld2FyZCBBZGRlZCd9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgVGFzayBkYXRhXG4gICAgICovXG4gICAgdXBkYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLnVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGFzayBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB0YXNrRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChUYXNrTW9kZWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgIGF3YWl0IFZpZXdUYXNrTW9kZWwuZGVsZXRlTWFueSh7dGFzazppZH0pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB0YXNrIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghdGFza0RhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0YXNrIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoVGFza01vZGVsLCB7X2lkOiBpZH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgVGFza1xuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIHRhc2sgZGF0YVxuICAgICAgICAgICAgY29uc3QgdGFza0RhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVGFza01vZGVsLCBpZCwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHRhc2sgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCF0YXNrRGF0YSkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcblxuICAgICAgICAgICAgLy8gU29mdCBkZWxldGUgVGFza1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShUYXNrTW9kZWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZDogdHJ1ZSwgdXBkYXRlZEJ5OiByZXEudXNlci5faWR9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuREVMRVRFRClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgVGFza0NvbnRyb2xsZXIoKTtcbiJdfQ==