"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Gif = _interopRequireDefault(require("../Models/Gif"));

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
var params = ['image'];

class GifController {
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
          var dir = 'uploads/' + folderName; // Check if banner exists
          // Set url path for uploaded file

          if (req.file && req.file.filename) {
            req.body.image = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          } // Create Banner


          var GifData = yield _CommonDbController.default.create(_Gif.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            GifData
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
          } = yield (0, _Mongo.paginationResult)(query, _Gif.default, currentPage, ''); // Get pagination data
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

          var bannerData = yield _CommonDbController.default.findById(_Gif.default, id, params); // Send response

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
          } = req.body; // Check if banner exists or not

          var bannerData = yield _CommonDbController.default.findById(_Gif.default, id, ['_id']); // Returns error if banner not exists

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


          var result = yield _CommonDbController.default.update(_Gif.default, {
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
          } = req.body; // Find banner data

          var bannerData = yield _CommonDbController.default.findById(_Gif.default, id, ['_id']); // Returns error if banner not exists

          if (!bannerData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Banner

          yield _CommonDbController.default.update(_Gif.default, {
            _id: id
          }, {
            isDeleted: true
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

var _default = new GifController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0dpZkNvbnRyb2xsZXIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwiR2lmQ29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsInNwbGl0VXJsIiwiYmFzZVVybCIsInNwbGl0IiwiZm9sZGVyTmFtZSIsImxlbmd0aCIsImRpciIsImZpbGUiLCJmaWxlbmFtZSIsImJvZHkiLCJpbWFnZSIsInByb2Nlc3MiLCJlbnYiLCJJTUFHRV9VUkwiLCJHaWZEYXRhIiwiQ29tbW9uIiwiY3JlYXRlIiwiR2lmTW9kZWwiLCJyZXN1bHQiLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkNSRUFURUQiLCJxdWVyeUxpbWl0IiwicGFnZSIsInF1ZXJ5IiwiY3VycmVudFBhZ2UiLCJsaW1pdCIsImlzRGVsZXRlZCIsInRvdGFsQ291bnQiLCJpZCIsImJhbm5lckRhdGEiLCJmaW5kQnlJZCIsIklOVkFMSURfSUQiLCJmaWxlVXJsIiwic3BsaXRGaWxlIiwiZnMiLCJ1bmxpbmsiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlIiwiX2lkIiwiREVMRVRFRCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxNQUFNLEdBQUcsQ0FBRSxPQUFGLENBQWY7O0FBRUEsTUFBTUMsYUFBTixDQUFvQjtBQUFBO0FBQUE7QUFBQSxtQ0FLUCxXQUFPQyxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDekIsWUFBSTtBQUNBO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFyQixDQUFQO0FBQ0gsV0FORCxDQVFBOzs7QUFDQSxjQUFNSSxRQUFRLEdBQUdSLEdBQUcsQ0FBQ1MsT0FBSixDQUFZQyxLQUFaLENBQWtCLEdBQWxCLENBQWpCO0FBQ0EsY0FBTUMsVUFBVSxHQUFHSCxRQUFRLENBQUNBLFFBQVEsQ0FBQ0ksTUFBVCxHQUFrQixDQUFuQixDQUEzQjtBQUNBLGNBQU1DLEdBQUcsR0FBRyxhQUFhRixVQUF6QixDQVhBLENBY0E7QUFHQTs7QUFDQSxjQUFHWCxHQUFHLENBQUNjLElBQUosSUFBWWQsR0FBRyxDQUFDYyxJQUFKLENBQVNDLFFBQXhCLEVBQWtDO0FBQzlCZixZQUFBQSxHQUFHLENBQUNnQixJQUFKLENBQVNDLEtBQVQsR0FBaUJDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxTQUFaLEdBQXdCVCxVQUF4QixHQUFxQyxHQUFyQyxHQUEyQ1gsR0FBRyxDQUFDYyxJQUFKLENBQVNDLFFBQXJFO0FBQ0gsV0FwQkQsQ0F1QkE7OztBQUNBLGNBQU1NLE9BQU8sU0FBU0MsNEJBQU9DLE1BQVAsQ0FBY0MsWUFBZCxFQUF3QnhCLEdBQUcsQ0FBQ2dCLElBQTVCLENBQXRCLENBeEJBLENBeUJBOztBQUNBLGNBQU1TLE1BQU0sR0FBRztBQUNYQyxZQUFBQSxPQUFPLEVBQUUxQixHQUFHLENBQUMyQixDQUFKLENBQU1DLG1CQUFVQyxPQUFoQixDQURFO0FBRVhSLFlBQUFBO0FBRlcsV0FBZjtBQUlBLGlCQUFPLGdDQUFZcEIsR0FBWixFQUFpQixHQUFqQixFQUFzQndCLE1BQXRCLENBQVA7QUFDSCxTQS9CRCxDQStCRSxPQUFPckIsS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0F6Q2U7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0E4Q1IsV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQ3hCLFlBQUk7QUFDQSxjQUFNO0FBQUU2QixZQUFBQSxVQUFGO0FBQWNDLFlBQUFBO0FBQWQsY0FBdUIvQixHQUFHLENBQUNnQyxLQUFqQztBQUNBLGNBQU1DLFdBQVcsR0FBRyxrQ0FBaUJGLElBQWpCLENBQXBCO0FBQ0EsY0FBTUcsS0FBSyxHQUFHLDRCQUFXSixVQUFYLENBQWQ7QUFDQSxjQUFNRSxLQUFLLEdBQUc7QUFBQ0csWUFBQUEsU0FBUyxFQUFFO0FBQVosV0FBZCxDQUpBLENBS0E7O0FBQ0EsY0FBTTtBQUFFVixZQUFBQSxNQUFGO0FBQVVXLFlBQUFBO0FBQVYsb0JBQStCLDZCQUNqQ0osS0FEaUMsRUFFakNSLFlBRmlDLEVBR2pDUyxXQUhpQyxFQUlqQyxFQUppQyxDQUFyQyxDQU5BLENBY0E7QUFDQTtBQUNBOztBQUNBLGlCQUFPLGdDQUFZaEMsR0FBWixFQUFpQixHQUFqQixFQUFzQndCLE1BQXRCLENBQVA7QUFDSCxTQWxCRCxDQWtCRSxPQUFPckIsS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0FyRWU7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0EwRVAsV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQ3pCLFlBQUk7QUFDQTtBQUNBLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBSSxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBTCxFQUF1QjtBQUNuQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQU07QUFBQ2lDLFlBQUFBO0FBQUQsY0FBT3JDLEdBQUcsQ0FBQ0YsTUFBakIsQ0FQQSxDQVFBOztBQUNBLGNBQUl3QyxVQUFVLFNBQVNoQiw0QkFBT2lCLFFBQVAsQ0FBZ0JmLFlBQWhCLEVBQTBCYSxFQUExQixFQUE4QnZDLE1BQTlCLENBQXZCLENBVEEsQ0FVQTs7QUFDQSxpQkFBTyxnQ0FBWUcsR0FBWixFQUFpQixHQUFqQixFQUFzQnFDLFVBQXRCLENBQVA7QUFDSCxTQVpELENBWUUsT0FBT2xDLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BM0ZlOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsb0NBZ0dQLFdBQU9KLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN6QixZQUFJO0FBQ0E7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUJILEtBQXJCLENBQVA7QUFDSCxXQU5ELENBUUE7OztBQUNBLGNBQU1JLFFBQVEsR0FBR1IsR0FBRyxDQUFDUyxPQUFKLENBQVlDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBakI7QUFDQSxjQUFNQyxVQUFVLEdBQUdILFFBQVEsQ0FBQ0EsUUFBUSxDQUFDSSxNQUFULEdBQWtCLENBQW5CLENBQTNCO0FBQ0EsY0FBTUMsR0FBRyxHQUFHLGFBQWFGLFVBQXpCO0FBRUEsY0FBTTtBQUFDMEIsWUFBQUE7QUFBRCxjQUFPckMsR0FBRyxDQUFDZ0IsSUFBakIsQ0FiQSxDQWVBOztBQUNBLGNBQU1zQixVQUFVLFNBQVNoQiw0QkFBT2lCLFFBQVAsQ0FBZ0JmLFlBQWhCLEVBQTBCYSxFQUExQixFQUE4QixDQUFDLEtBQUQsQ0FBOUIsQ0FBekIsQ0FoQkEsQ0FpQkE7O0FBQ0EsY0FBSSxDQUFDQyxVQUFMLEVBQWlCLE9BQU8sZ0NBQVlyQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUN5QixZQUFBQSxPQUFPLEVBQUUxQixHQUFHLENBQUMyQixDQUFKLENBQU1DLG1CQUFVWSxVQUFoQjtBQUFWLFdBQTlCLENBQVA7O0FBRWpCLGNBQUl4QyxHQUFHLENBQUNjLElBQUosSUFBWWQsR0FBRyxDQUFDYyxJQUFKLENBQVNDLFFBQXpCLEVBQW1DO0FBQy9CO0FBQ0EsZ0JBQUl1QixVQUFVLElBQUlBLFVBQVUsQ0FBQ0csT0FBN0IsRUFBc0M7QUFDbEMsa0JBQU1DLFNBQVMsR0FBR0osVUFBVSxDQUFDRyxPQUFYLENBQW1CL0IsS0FBbkIsQ0FBeUIsR0FBekIsQ0FBbEI7QUFDQSxrQkFBTUksSUFBSSxHQUFHNEIsU0FBUyxDQUFDQSxTQUFTLENBQUM5QixNQUFWLEdBQW1CLENBQXBCLENBQXRCOztBQUNBK0IsMEJBQUdDLE1BQUgsQ0FBVS9CLEdBQUcsR0FBRyxHQUFOLEdBQVlDLElBQXRCLEVBQTZCK0IsR0FBRyxJQUFJO0FBQ2hDLG9CQUFJQSxHQUFKLEVBQVNDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixHQUFaO0FBQ1osZUFGRDtBQUdILGFBUjhCLENBUy9COzs7QUFDQTdDLFlBQUFBLEdBQUcsQ0FBQ2dCLElBQUosQ0FBU0MsS0FBVCxHQUFpQkMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFNBQVosR0FBd0JULFVBQXhCLEdBQXFDLEdBQXJDLEdBQTJDWCxHQUFHLENBQUNjLElBQUosQ0FBU0MsUUFBckU7QUFDSCxXQS9CRCxDQWlDQTs7O0FBQ0EsY0FBTVUsTUFBTSxTQUFTSCw0QkFBTzBCLE1BQVAsQ0FBY3hCLFlBQWQsRUFBd0I7QUFBQ3lCLFlBQUFBLEdBQUcsRUFBRVo7QUFBTixXQUF4QixFQUFtQ3JDLEdBQUcsQ0FBQ2dCLElBQXZDLENBQXJCLENBbENBLENBbUNBOztBQUNBLGlCQUFPLGdDQUFZZixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCd0IsTUFBdEIsQ0FBUDtBQUNILFNBckNELENBcUNFLE9BQU9yQixLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQTFJZTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG9DQStJUCxXQUFPSixHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDekIsWUFBSTtBQUNBO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFyQixDQUFQO0FBQ0g7O0FBQ0QsY0FBTTtBQUFDaUMsWUFBQUE7QUFBRCxjQUFPckMsR0FBRyxDQUFDZ0IsSUFBakIsQ0FQQSxDQVFBOztBQUNBLGNBQU1zQixVQUFVLFNBQVNoQiw0QkFBT2lCLFFBQVAsQ0FBZ0JmLFlBQWhCLEVBQTBCYSxFQUExQixFQUE4QixDQUFDLEtBQUQsQ0FBOUIsQ0FBekIsQ0FUQSxDQVVBOztBQUNBLGNBQUksQ0FBQ0MsVUFBTCxFQUFpQixPQUFPLGdDQUFZckMsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFDeUIsWUFBQUEsT0FBTyxFQUFFMUIsR0FBRyxDQUFDMkIsQ0FBSixDQUFNQyxtQkFBVVksVUFBaEI7QUFBVixXQUE5QixDQUFQLENBWGpCLENBYUE7O0FBQ0EsZ0JBQU1sQiw0QkFBTzBCLE1BQVAsQ0FBY3hCLFlBQWQsRUFBd0I7QUFBQ3lCLFlBQUFBLEdBQUcsRUFBRVo7QUFBTixXQUF4QixFQUFtQztBQUFDRixZQUFBQSxTQUFTLEVBQUU7QUFBWixXQUFuQyxDQUFOLENBZEEsQ0FlQTs7QUFDQSxjQUFNVixNQUFNLEdBQUc7QUFDWEMsWUFBQUEsT0FBTyxFQUFFMUIsR0FBRyxDQUFDMkIsQ0FBSixDQUFNQyxtQkFBVXNCLE9BQWhCO0FBREUsV0FBZjtBQUdBLGlCQUFPLGdDQUFZakQsR0FBWixFQUFpQixHQUFqQixFQUFzQndCLE1BQXRCLENBQVA7QUFDSCxTQXBCRCxDQW9CRSxPQUFPckIsS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0F4S2U7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUEyS0wsSUFBSUwsYUFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgR2lmTW9kZWwgZnJvbSAnLi4vTW9kZWxzL0dpZic7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQgeyBidWlsZFJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IHBhZ2luYXRpb25SZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvTW9uZ28nO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vRGJDb250cm9sbGVyL0NvbW1vbkRiQ29udHJvbGxlcic7XG5cbi8qKlxuICogIEJhbm5lciBDb250cm9sbGVyIENsYXNzXG4gKiAgQGF1dGhvciBOaXRpc2hhIEtoYW5kZWx3YWwgPG5pdGlzaGEua2hhbmRlbHdhbEBqcGxvZnQuaW4+XG4gKi9cblxuY29uc3QgcGFyYW1zID0gWyAnaW1hZ2UnIF07XG5cbmNsYXNzIEdpZkNvbnRyb2xsZXIge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIEJhbm5lclxuICAgICAqL1xuICAgIGNyZWF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiBiYW5uZXIgZXhpc3RzXG4gICAgICAgICAgXG5cbiAgICAgICAgICAgIC8vIFNldCB1cmwgcGF0aCBmb3IgdXBsb2FkZWQgZmlsZVxuICAgICAgICAgICAgaWYocmVxLmZpbGUgJiYgcmVxLmZpbGUuZmlsZW5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXEuYm9keS5pbWFnZSA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgXG4gICAgICAgICAgICAvLyBDcmVhdGUgQmFubmVyXG4gICAgICAgICAgICBjb25zdCBHaWZEYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShHaWZNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCBSZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgICAgICBHaWZEYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgYmFubmVyc1xuICAgICAqL1xuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHF1ZXJ5TGltaXQsIHBhZ2UgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gcGFyc2VDdXJyZW50UGFnZShwYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbWl0ID0gcGFyc2VMaW1pdChxdWVyeUxpbWl0KTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0ge2lzRGVsZXRlZDogZmFsc2V9O1xuICAgICAgICAgICAgLy8gR2V0IGxpc3Qgb2YgYWxsIGJhbm5lcnNcbiAgICAgICAgICAgIGNvbnN0IHsgcmVzdWx0LCB0b3RhbENvdW50IH0gPSBhd2FpdCBwYWdpbmF0aW9uUmVzdWx0KFxuICAgICAgICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgICAgICAgIEdpZk1vZGVsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYWdlLFxuICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIC8vIEdldCBwYWdpbmF0aW9uIGRhdGFcbiAgICAgICAgICAgIC8vY29uc3QgcGFnaW5hdGlvbkRhdGEgPSBwYWdpbmF0aW9uKHRvdGFsQ291bnQsIGN1cnJlbnRQYWdlLCBsaW1pdCk7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGV0YWlsIG9mIEJhbm5lclxuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIGJhbm5lciBkYXRhXG4gICAgICAgICAgICBsZXQgYmFubmVyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChHaWZNb2RlbCwgaWQsIHBhcmFtcyk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGJhbm5lckRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBCYW5uZXIgZGF0YVxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB7aWR9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgYmFubmVyIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IGJhbm5lckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoR2lmTW9kZWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgYmFubmVyIG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghYmFubmVyRGF0YSkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCl9KTtcblxuICAgICAgICAgICAgaWYgKHJlcS5maWxlICYmIHJlcS5maWxlLmZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgICAgLy8gRGVsZXRlIG9sZCBmaWxlIGlmIG5ldyBmaWxlIGlzIHRoZXJlIHRvIHVwbG9hZFxuICAgICAgICAgICAgICAgIGlmIChiYW5uZXJEYXRhICYmIGJhbm5lckRhdGEuZmlsZVVybCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdEZpbGUgPSBiYW5uZXJEYXRhLmZpbGVVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHNwbGl0RmlsZVtzcGxpdEZpbGUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgIGZzLnVubGluayhkaXIgKyAnLycgKyBmaWxlLCAoZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2V0IHBhdGggZm9yIG5ldyBmaWxlXG4gICAgICAgICAgICAgICAgcmVxLmJvZHkuaW1hZ2UgPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBiYW5uZXIgZGF0YVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShHaWZNb2RlbCwge19pZDogaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIEJhbm5lclxuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgLy8gRmluZCBiYW5uZXIgZGF0YVxuICAgICAgICAgICAgY29uc3QgYmFubmVyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChHaWZNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBiYW5uZXIgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCFiYW5uZXJEYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICAvLyBTb2Z0IGRlbGV0ZSBCYW5uZXJcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoR2lmTW9kZWwsIHtfaWQ6IGlkfSwge2lzRGVsZXRlZDogdHJ1ZX0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5ERUxFVEVEKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBHaWZDb250cm9sbGVyKCk7XG4iXX0=