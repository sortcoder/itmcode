"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Banners = _interopRequireDefault(require("../Models/Banners"));

var _fs = _interopRequireDefault(require("fs"));

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
 *  Banner Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['title', 'description', 'image', "link", 'type'];

class BannerController {
  constructor() {
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          } // Path for uploading files


          var splitUrl = req.baseUrl.split('/');
          var folderName = splitUrl[splitUrl.length - 1];
          var dir = 'uploads/' + folderName;
          var {
            type
          } = req.body; // Check if banner exists

          var isBannerExists = yield _CommonDbController.default.findSingle(_Banners.default, {
            type,
            isDeleted: false
          }, ['_id']); // Returns error if banner exists

          if (isBannerExists) {
            // Delete related uploaded files from the folder
            if (req.file && req.file.filename && dir + req.file.filename) {
              _fs.default.unlink(dir + '/' + req.file.filename, err => {
                if (err) console.log(err);
              });
            } // Returns error if page already exists


            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.ALREADY_REGISTERED)
            });
          } // Set url path for uploaded file


          if (req.file && req.file.filename) {
            req.body.image = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          }

          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Banner

          var bannerData = yield _CommonDbController.default.create(_Banners.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            bannerData
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
          }; // Get list of all banners

          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Banners.default, currentPage, '', ['_id', 'title', 'description', 'image', "link", "type"]); // Get pagination data
          //const paginationData = pagination(totalCount, currentPage, limit);
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
          } = req.params; // Find banner data

          var bannerData = yield _CommonDbController.default.findById(_Banners.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, bannerData);
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
          } // Path for uploading files


          var splitUrl = req.baseUrl.split('/');
          var folderName = splitUrl[splitUrl.length - 1];
          var dir = 'uploads/' + folderName;
          var {
            id
          } = req.params;
          req.body.updatedBy = req.user._id; // Check if banner exists or not

          var bannerData = yield _CommonDbController.default.findById(_Banners.default, id, ['_id']); // Returns error if banner not exists

          if (!bannerData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          });

          if (req.file && req.file.filename) {
            // Delete old file if new file is there to upload
            if (bannerData && bannerData.fileUrl) {
              var splitFile = bannerData.fileUrl.split('/');
              var file = splitFile[splitFile.length - 1];

              _fs.default.unlink(dir + '/' + file, err => {
                if (err) console.log(err);
              });
            } // Set path for new file


            req.body.image = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          } // Update banner data


          var result = yield _CommonDbController.default.update(_Banners.default, {
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
          } = req.params; // Find banner data

          var bannerData = yield _CommonDbController.default.findById(_Banners.default, id, ['_id']); // Returns error if banner not exists

          if (!bannerData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Banner

          yield _CommonDbController.default.update(_Banners.default, {
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

var _default = new BannerController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0Jhbm5lckNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwiQmFubmVyQ29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsInNwbGl0VXJsIiwiYmFzZVVybCIsInNwbGl0IiwiZm9sZGVyTmFtZSIsImxlbmd0aCIsImRpciIsInR5cGUiLCJib2R5IiwiaXNCYW5uZXJFeGlzdHMiLCJDb21tb24iLCJmaW5kU2luZ2xlIiwiQmFubmVyTW9kZWwiLCJpc0RlbGV0ZWQiLCJmaWxlIiwiZmlsZW5hbWUiLCJmcyIsInVubGluayIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkFMUkVBRFlfUkVHSVNURVJFRCIsImltYWdlIiwicHJvY2VzcyIsImVudiIsIklNQUdFX1VSTCIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsInVzZXIiLCJfaWQiLCJiYW5uZXJEYXRhIiwiY3JlYXRlIiwicmVzdWx0IiwiQ1JFQVRFRCIsInF1ZXJ5TGltaXQiLCJwYWdlIiwicXVlcnkiLCJjdXJyZW50UGFnZSIsImxpbWl0IiwidG90YWxDb3VudCIsImlkIiwiZmluZEJ5SWQiLCJJTlZBTElEX0lEIiwiZmlsZVVybCIsInNwbGl0RmlsZSIsInVwZGF0ZSIsIkRFTEVURUQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsT0FBRCxFQUFVLGFBQVYsRUFBeUIsT0FBekIsRUFBbUMsTUFBbkMsRUFBMkMsTUFBM0MsQ0FBZjs7QUFFQSxNQUFNQyxnQkFBTixDQUF1QjtBQUFBO0FBQUE7QUFBQSxtQ0FLVixXQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFB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T0FBTyxnQ0FBWXZDLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBQzJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQzZCLENBQUosQ0FBTUMsbUJBQVVzQixVQUFoQjtBQUFWLFdBQTlCLENBQVAsQ0FYakIsQ0FhQTs7QUFDQSxnQkFBTW5DLDRCQUFPc0MsTUFBUCxDQUFjcEMsZ0JBQWQsRUFBMkI7QUFBQ29CLFlBQUFBLEdBQUcsRUFBRVc7QUFBTixXQUEzQixFQUFzQztBQUFDOUIsWUFBQUEsU0FBUyxFQUFFLElBQVo7QUFBa0JpQixZQUFBQSxTQUFTLEVBQUVyQyxHQUFHLENBQUNzQyxJQUFKLENBQVNDO0FBQXRDLFdBQXRDLENBQU4sQ0FkQSxDQWVBOztBQUNBLGNBQU1HLE1BQU0sR0FBRztBQUNYZCxZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUM2QixDQUFKLENBQU1DLG1CQUFVMEIsT0FBaEI7QUFERSxXQUFmO0FBR0EsaUJBQU8sZ0NBQVl2RCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCeUMsTUFBdEIsQ0FBUDtBQUNILFNBcEJELENBb0JFLE9BQU90QyxLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXJMa0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUF3TFIsSUFBSUwsZ0JBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dmFsaWRhdGlvblJlc3VsdH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IEJhbm5lck1vZGVsIGZyb20gJy4uL01vZGVscy9CYW5uZXJzJztcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7XG4gICAgcGFnaW5hdGlvbixcbiAgICBwYXJzZUN1cnJlbnRQYWdlLFxuICAgIHBhcnNlTGltaXQsXG59IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgcGFnaW5hdGlvblJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9Nb25nbyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcblxuLyoqXG4gKiAgQmFubmVyIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJywgJ2ltYWdlJyAsIFwibGlua1wiLCAndHlwZSddO1xuXG5jbGFzcyBCYW5uZXJDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBCYW5uZXJcbiAgICAgKi9cbiAgICBjcmVhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUGF0aCBmb3IgdXBsb2FkaW5nIGZpbGVzXG4gICAgICAgICAgICBjb25zdCBzcGxpdFVybCA9IHJlcS5iYXNlVXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBjb25zdCBmb2xkZXJOYW1lID0gc3BsaXRVcmxbc3BsaXRVcmwubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb25zdCBkaXIgPSAndXBsb2Fkcy8nICsgZm9sZGVyTmFtZTtcblxuICAgICAgICAgICAgY29uc3Qge3R5cGV9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBiYW5uZXIgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBpc0Jhbm5lckV4aXN0cyA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKEJhbm5lck1vZGVsLCB7dHlwZSwgaXNEZWxldGVkOiBmYWxzZX0sWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIGJhbm5lciBleGlzdHNcblxuICAgICAgICAgICAgaWYgKGlzQmFubmVyRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIHJlbGF0ZWQgdXBsb2FkZWQgZmlsZXMgZnJvbSB0aGUgZm9sZGVyXG4gICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlICYmIHJlcS5maWxlLmZpbGVuYW1lICYmIGRpciArIHJlcS5maWxlLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnVubGluayhkaXIgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZSwgKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBwYWdlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuQUxSRUFEWV9SRUdJU1RFUkVEKX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdXJsIHBhdGggZm9yIHVwbG9hZGVkIGZpbGVcbiAgICAgICAgICAgIGlmKHJlcS5maWxlICYmIHJlcS5maWxlLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmVxLmJvZHkuaW1hZ2UgPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlcS5ib2R5LmNyZWF0ZWRCeSA9IHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBCYW5uZXJcbiAgICAgICAgICAgIGNvbnN0IGJhbm5lckRhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKEJhbm5lck1vZGVsLCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkNSRUFURUQpLFxuICAgICAgICAgICAgICAgIGJhbm5lckRhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgYWxsIHRoZSBiYW5uZXJzXG4gICAgICovXG4gICAgaW5kZXggPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcXVlcnlMaW1pdCwgcGFnZSB9ID0gcmVxLnF1ZXJ5O1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBwYXJzZUN1cnJlbnRQYWdlKHBhZ2UpO1xuICAgICAgICAgICAgY29uc3QgbGltaXQgPSBwYXJzZUxpbWl0KHF1ZXJ5TGltaXQpO1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7aXNEZWxldGVkOiBmYWxzZX07XG4gICAgICAgICAgICAvLyBHZXQgbGlzdCBvZiBhbGwgYmFubmVyc1xuICAgICAgICAgICAgY29uc3QgeyByZXN1bHQsIHRvdGFsQ291bnQgfSA9IGF3YWl0IHBhZ2luYXRpb25SZXN1bHQoXG4gICAgICAgICAgICAgICAgcXVlcnksXG4gICAgICAgICAgICAgICAgQmFubmVyTW9kZWwsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgWydfaWQnLCAndGl0bGUnLCAnZGVzY3JpcHRpb24nLCAnaW1hZ2UnLCBcImxpbmtcIiwgXCJ0eXBlXCJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBHZXQgcGFnaW5hdGlvbiBkYXRhXG4gICAgICAgICAgICAvL2NvbnN0IHBhZ2luYXRpb25EYXRhID0gcGFnaW5hdGlvbih0b3RhbENvdW50LCBjdXJyZW50UGFnZSwgbGltaXQpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERldGFpbCBvZiBCYW5uZXJcbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCBiYW5uZXIgZGF0YVxuICAgICAgICAgICAgbGV0IGJhbm5lckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoQmFubmVyTW9kZWwsIGlkLCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBiYW5uZXJEYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgQmFubmVyIGRhdGFcbiAgICAgKi9cbiAgICB1cGRhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUGF0aCBmb3IgdXBsb2FkaW5nIGZpbGVzXG4gICAgICAgICAgICBjb25zdCBzcGxpdFVybCA9IHJlcS5iYXNlVXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBjb25zdCBmb2xkZXJOYW1lID0gc3BsaXRVcmxbc3BsaXRVcmwubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb25zdCBkaXIgPSAndXBsb2Fkcy8nICsgZm9sZGVyTmFtZTtcblxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSByZXEudXNlci5faWQ7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBiYW5uZXIgZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3QgYmFubmVyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChCYW5uZXJNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBiYW5uZXIgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFiYW5uZXJEYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICBpZiAocmVxLmZpbGUgJiYgcmVxLmZpbGUuZmlsZW5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWxldGUgb2xkIGZpbGUgaWYgbmV3IGZpbGUgaXMgdGhlcmUgdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgaWYgKGJhbm5lckRhdGEgJiYgYmFubmVyRGF0YS5maWxlVXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0RmlsZSA9IGJhbm5lckRhdGEuZmlsZVVybC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gc3BsaXRGaWxlW3NwbGl0RmlsZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKGRpciArICcvJyArIGZpbGUsIChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZXQgcGF0aCBmb3IgbmV3IGZpbGVcbiAgICAgICAgICAgICAgICByZXEuYm9keS5pbWFnZSA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXBkYXRlIGJhbm5lciBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKEJhbm5lck1vZGVsLCB7X2lkOiBpZH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgQmFubmVyXG4gICAgICovXG4gICAgcmVtb3ZlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIEZpbmQgYmFubmVyIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGJhbm5lckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoQmFubmVyTW9kZWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgYmFubmVyIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghYmFubmVyRGF0YSkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcblxuICAgICAgICAgICAgLy8gU29mdCBkZWxldGUgQmFubmVyXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKEJhbm5lck1vZGVsLCB7X2lkOiBpZH0sIHtpc0RlbGV0ZWQ6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkRFTEVURUQpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEJhbm5lckNvbnRyb2xsZXIoKTtcbiJdfQ==