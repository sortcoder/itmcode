"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _lodash = _interopRequireDefault(require("lodash"));

var _User = _interopRequireDefault(require("../Models/User"));

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

var _Gifts = _interopRequireDefault(require("../Models/Gifts"));

var _SendGifts = _interopRequireDefault(require("../Models/SendGifts"));

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

/**
 *  Gift Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['zole', 'popularity', 'giftImg'];
var userParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId'];

class GiftController {
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
            zole,
            popularity
          } = req.body; // Check if gift exists

          var isGiftExists = yield _CommonDbController.default.findSingle(_Gifts.default, {
            zole,
            popularity
          }, ['_id']); // Returns error if gift exists

          if (isGiftExists) {
            // Delete related uploaded files from the folder
            if (req.file.filename && dir + req.file.filename) {
              fs.unlink(dir + '/' + req.file.filename, err => {
                if (err) console.log(err);
              });
            } // Returns error if page already exists


            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.ALREADY_REGISTERED)
            });
          } // Set url path for uploaded file


          req.body.giftImg = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          req.body.createdBy = req.body.updatedBy = req.user._id; // Create Gift

          var giftData = yield _CommonDbController.default.create(_Gifts.default, req.body); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            giftData
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
          }; // Get list of all gifts

          var {
            result,
            totalCount
          } = yield (0, _Mongo.paginationResult)(query, _Gifts.default, currentPage, '', ['_id', 'zole', 'popularity', 'giftImg']); // Get pagination data
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
          } = req.params; // Find gift data

          var giftData = yield _CommonDbController.default.findById(_Gifts.default, id, params); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, giftData);
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
          req.body.updatedBy = req.user._id; // Check if gift exists or not

          var giftData = yield _CommonDbController.default.findById(_Gifts.default, id, ['_id']); // Returns error if gift not exists

          if (!giftData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          });

          if (req.file && req.file.filename) {
            // Delete old file if new file is there to upload
            if (giftData && giftData.fileUrl) {
              var splitFile = giftData.fileUrl.split('/');
              var file = splitFile[splitFile.length - 1];
              fs.unlink(dir + '/' + file, err => {
                if (err) console.log(err);
              });
            } // Set path for new file


            req.body.giftImg = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          } // Update gift data


          var result = yield _CommonDbController.default.update(_Gifts.default, {
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
          } = req.params; // Find gift data

          var giftData = yield _CommonDbController.default.findById(_Gifts.default, id, ['_id']); // Returns error if gift not exists

          if (!giftData) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete Gift

          yield _CommonDbController.default.update(_Gifts.default, {
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

    _defineProperty(this, "sendGift", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            giftId,
            quantity,
            giftedTo
          } = req.body;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id, ['name', 'wallet', 'popularity']);
          req.body.createdBy = req.body.updatedBy = req.body.userId = _id;
          var gift = yield _CommonDbController.default.findById(_Gifts.default, giftId, ['zole', 'popularity']);
          var result = yield _CommonDbController.default.create(_SendGifts.default, req.body);
          var newWallet = loggedInUser.wallet - gift.zole * quantity;
          var giftedUser = yield _CommonDbController.default.findById(_User.default, giftedTo, ['deviceToken', 'wallet', 'popularity']); // const newWalletOfGift = giftedUser.wallet ? giftedUser.wallet + (gift.zole * quantity) : gift.zole * quantity;

          var newPopularity = giftedUser.popularity ? giftedUser.popularity + gift.popularity * quantity : gift.popularity ? gift.popularity * quantity : 0;
          console.log(newPopularity);
          yield _CommonDbController.default.update(_User.default, {
            _id
          }, {
            wallet: newWallet
          });
          /*     await Common.update(UserModel, {_id: giftedTo}, {wallet: newWalletOfGift, popularity: newPopularity}); */

          yield _CommonDbController.default.update(_User.default, {
            _id: giftedTo
          }, {
            popularity: newPopularity
          });

          if (giftedUser.deviceToken) {
            var receiverSetting = yield _UserSettings.default.findOne({
              userId: giftedUser._id
            });
            var notificationData = {
              toUser: giftedUser._id,
              fromUser: _id,
              title: 'Gift Received',
              message: " has sent you gift of ".concat(gift.popularity * quantity, " popularity"),
              deviceToken: giftedUser.deviceToken,
              createdBy: _id,
              updatedBy: _id
            };

            if (receiverSetting.giftShow == true) {
              yield _Notifications.default.sendNotification(notificationData);
            }
          }

          if (loggedInUser.deviceToken) {
            var _notificationData = {
              toUser: loggedInUser._id,
              fromUser: _id,
              title: 'Gift',
              message: " you have spend ".concat(gift.zole * quantity, " zoles "),
              deviceToken: loggedInUser.deviceToken,
              createdBy: _id,
              updatedBy: _id
            };
            var sendoerSetting = yield _UserSettings.default.findOne({
              userId: loggedInUser._id
            });

            if (sendoerSetting.giftShow == true) {
              yield _Notifications.default.sendNotification(_notificationData);
            }
          }

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

    _defineProperty(this, "userGifts", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;
          var populateField = [{
            path: 'giftId',
            select: ['giftImg']
          }];
          var gifts = yield _CommonDbController.default.list(_SendGifts.default, {
            giftedTo: id
          }, ['giftId', 'quantity'], populateField);
          var giftArr = [];

          if (gifts && gifts.length) {
            gifts = _lodash.default.groupBy(gifts, 'giftId._id');

            var _loop = function _loop(key, value) {
              for (var obj of value) {
                if (giftArr && giftArr.length) {
                  var index = giftArr.findIndex(obj => obj.giftId === key);

                  if (index === -1) {
                    giftArr.push({
                      giftId: key,
                      giftImage: obj.giftId ? obj.giftId.giftImg : '',
                      quantity: obj.quantity
                    });
                  } else {
                    giftArr[index].quantity = giftArr[index].quantity + obj.quantity;
                  }
                } else {
                  giftArr.push({
                    giftId: key,
                    giftImage: obj.giftId ? obj.giftId.giftImg : '',
                    quantity: obj.quantity
                  });
                }
              }
            };

            for (var [key, value] of Object.entries(gifts)) {
              _loop(key, value);
            }

            gifts = giftArr;
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            gifts
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }());
  }

}

var _default = new GiftController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0dpZnRDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsInVzZXJQYXJhbXMiLCJHaWZ0Q29udHJvbGxlciIsInJlcSIsInJlcyIsImVycm9ycyIsImlzRW1wdHkiLCJlcnJvciIsImFycmF5Iiwic3RhdHVzIiwianNvbiIsInNwbGl0VXJsIiwiYmFzZVVybCIsInNwbGl0IiwiZm9sZGVyTmFtZSIsImxlbmd0aCIsImRpciIsInpvbGUiLCJwb3B1bGFyaXR5IiwiYm9keSIsImlzR2lmdEV4aXN0cyIsIkNvbW1vbiIsImZpbmRTaW5nbGUiLCJHaWZ0TW9kZWwiLCJmaWxlIiwiZmlsZW5hbWUiLCJmcyIsInVubGluayIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIkFMUkVBRFlfUkVHSVNURVJFRCIsImdpZnRJbWciLCJwcm9jZXNzIiwiZW52IiwiSU1BR0VfVVJMIiwiY3JlYXRlZEJ5IiwidXBkYXRlZEJ5IiwidXNlciIsIl9pZCIsImdpZnREYXRhIiwiY3JlYXRlIiwicmVzdWx0IiwiQ1JFQVRFRCIsInF1ZXJ5TGltaXQiLCJwYWdlIiwicXVlcnkiLCJjdXJyZW50UGFnZSIsImxpbWl0IiwiaXNEZWxldGVkIiwidG90YWxDb3VudCIsImlkIiwiZmluZEJ5SWQiLCJJTlZBTElEX0lEIiwiZmlsZVVybCIsInNwbGl0RmlsZSIsInVwZGF0ZSIsIkRFTEVURUQiLCJnaWZ0SWQiLCJxdWFudGl0eSIsImdpZnRlZFRvIiwibG9nZ2VkSW5Vc2VyIiwiVXNlck1vZGVsIiwidXNlcklkIiwiZ2lmdCIsIlNlbmRHaWZ0TW9kZWwiLCJuZXdXYWxsZXQiLCJ3YWxsZXQiLCJnaWZ0ZWRVc2VyIiwibmV3UG9wdWxhcml0eSIsImRldmljZVRva2VuIiwicmVjZWl2ZXJTZXR0aW5nIiwiVXNlclNldHRpbmdzIiwiZmluZE9uZSIsIm5vdGlmaWNhdGlvbkRhdGEiLCJ0b1VzZXIiLCJmcm9tVXNlciIsInRpdGxlIiwiZ2lmdFNob3ciLCJOb3RpZmljYXRpb25zIiwic2VuZE5vdGlmaWNhdGlvbiIsInNlbmRvZXJTZXR0aW5nIiwicG9wdWxhdGVGaWVsZCIsInBhdGgiLCJzZWxlY3QiLCJnaWZ0cyIsImxpc3QiLCJnaWZ0QXJyIiwiXyIsImdyb3VwQnkiLCJrZXkiLCJ2YWx1ZSIsIm9iaiIsImluZGV4IiwiZmluZEluZGV4IiwicHVzaCIsImdpZnRJbWFnZSIsIk9iamVjdCIsImVudHJpZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsTUFBRCxFQUFTLFlBQVQsRUFBdUIsU0FBdkIsQ0FBZjtBQUNBLElBQU1DLFVBQVUsR0FBRyxDQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLFFBQWxCLEVBQTRCLFlBQTVCLEVBQTBDLFVBQTFDLEVBQXNELFNBQXRELEVBQWlFLHNCQUFqRSxFQUF5RixRQUF6RixDQUFuQjs7QUFFQSxNQUFNQyxjQUFOLENBQXFCO0FBQUE7QUFBQTtBQUFBLG1DQUtSLFdBQU9DLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN6QixZQUFJO0FBQ0E7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUJILEtBQXJCLENBQVA7QUFDSCxXQU5ELENBUUE7OztBQUNBLGNBQU1JLFFBQVEsR0FBR1IsR0FBRyxDQUFDUyxPQUFKLENBQVlDLEtBQVosQ0FBa0IsR0FBbEIsQ0FBakI7QUFDQSxj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QUFBQTs7ZUEwUk4sSUFBSUwsY0FBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHt2YWxpZGF0aW9uUmVzdWx0fSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgVXNlclNldHRpbmdzIGZyb20gJy4uL01vZGVscy9Vc2VyU2V0dGluZ3MnO1xuaW1wb3J0IEdpZnRNb2RlbCBmcm9tICcuLi9Nb2RlbHMvR2lmdHMnO1xuaW1wb3J0IFNlbmRHaWZ0TW9kZWwgZnJvbSAnLi4vTW9kZWxzL1NlbmRHaWZ0cyc7XG5pbXBvcnQge3BhcnNlQ3VycmVudFBhZ2UsIHBhcnNlTGltaXR9IGZyb20gJy4uL0hlbHBlci9QYWdpbmF0aW9uJztcbmltcG9ydCB7YnVpbGRSZXN1bHR9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7cGFnaW5hdGlvblJlc3VsdH0gZnJvbSAnLi4vSGVscGVyL01vbmdvJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IE5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vU2VydmljZS9Ob3RpZmljYXRpb25zJztcblxuLyoqXG4gKiAgR2lmdCBDb250cm9sbGVyIENsYXNzXG4gKiAgQGF1dGhvciBOaXRpc2hhIEtoYW5kZWx3YWwgPG5pdGlzaGEua2hhbmRlbHdhbEBqcGxvZnQuaW4+XG4gKi9cblxuY29uc3QgcGFyYW1zID0gWyd6b2xlJywgJ3BvcHVsYXJpdHknLCAnZ2lmdEltZyddO1xuY29uc3QgdXNlclBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3VzZXJJZCddO1xuXG5jbGFzcyBHaWZ0Q29udHJvbGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZ2lmdFxuICAgICAqL1xuICAgIGNyZWF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB7em9sZSwgcG9wdWxhcml0eX0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGdpZnQgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBpc0dpZnRFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShHaWZ0TW9kZWwsIHt6b2xlLCBwb3B1bGFyaXR5fSwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIGdpZnQgZXhpc3RzXG5cbiAgICAgICAgICAgIGlmIChpc0dpZnRFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWxldGUgcmVsYXRlZCB1cGxvYWRlZCBmaWxlcyBmcm9tIHRoZSBmb2xkZXJcbiAgICAgICAgICAgICAgICBpZiAocmVxLmZpbGUuZmlsZW5hbWUgJiYgZGlyICsgcmVxLmZpbGUuZmlsZW5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKGRpciArICcvJyArIHJlcS5maWxlLmZpbGVuYW1lLCAoZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBwYWdlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHttZXNzYWdlOiByZXEudChjb25zdGFudHMuQUxSRUFEWV9SRUdJU1RFUkVEKX0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdXJsIHBhdGggZm9yIHVwbG9hZGVkIGZpbGVcbiAgICAgICAgICAgIHJlcS5ib2R5LmdpZnRJbWcgPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG5cbiAgICAgICAgICAgIHJlcS5ib2R5LmNyZWF0ZWRCeSA9IHJlcS5ib2R5LnVwZGF0ZWRCeSA9IHJlcS51c2VyLl9pZDtcbiAgICAgICAgICAgIC8vIENyZWF0ZSBHaWZ0XG4gICAgICAgICAgICBjb25zdCBnaWZ0RGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoR2lmdE1vZGVsLCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkNSRUFURUQpLFxuICAgICAgICAgICAgICAgIGdpZnREYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgZ2lmdHNcbiAgICAgKi9cbiAgICBpbmRleCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qge3F1ZXJ5TGltaXQsIHBhZ2V9ID0gcmVxLnF1ZXJ5O1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFBhZ2UgPSBwYXJzZUN1cnJlbnRQYWdlKHBhZ2UpO1xuICAgICAgICAgICAgY29uc3QgbGltaXQgPSBwYXJzZUxpbWl0KHF1ZXJ5TGltaXQpO1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7aXNEZWxldGVkOiBmYWxzZX07XG4gICAgICAgICAgICAvLyBHZXQgbGlzdCBvZiBhbGwgZ2lmdHNcbiAgICAgICAgICAgIGNvbnN0IHtyZXN1bHQsIHRvdGFsQ291bnR9ID0gYXdhaXQgcGFnaW5hdGlvblJlc3VsdChcbiAgICAgICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgICAgICBHaWZ0TW9kZWwsXG4gICAgICAgICAgICAgICAgY3VycmVudFBhZ2UsXG4gICAgICAgICAgICAgICAgJycsXG4gICAgICAgICAgICAgICAgWydfaWQnLCAnem9sZScsICdwb3B1bGFyaXR5JywgJ2dpZnRJbWcnXVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgLy8gR2V0IHBhZ2luYXRpb24gZGF0YVxuICAgICAgICAgICAgLy9jb25zdCBwYWdpbmF0aW9uRGF0YSA9IHBhZ2luYXRpb24odG90YWxDb3VudCwgY3VycmVudFBhZ2UsIGxpbWl0KTtcbiAgICAgICAgICAgIC8vIFNlbmQgUmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRhaWwgb2YgR2lmdFxuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qge2lkfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIGdpZnQgZGF0YVxuICAgICAgICAgICAgbGV0IGdpZnREYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKEdpZnRNb2RlbCwgaWQsIHBhcmFtcyk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdpZnREYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgR2lmdCBkYXRhXG4gICAgICovXG4gICAgdXBkYXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFBhdGggZm9yIHVwbG9hZGluZyBmaWxlc1xuICAgICAgICAgICAgY29uc3Qgc3BsaXRVcmwgPSByZXEuYmFzZVVybC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgY29uc3QgZm9sZGVyTmFtZSA9IHNwbGl0VXJsW3NwbGl0VXJsLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgY29uc3QgZGlyID0gJ3VwbG9hZHMvJyArIGZvbGRlck5hbWU7XG5cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgcmVxLmJvZHkudXBkYXRlZEJ5ID0gcmVxLnVzZXIuX2lkO1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZ2lmdCBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCBnaWZ0RGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChHaWZ0TW9kZWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgZ2lmdCBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIWdpZnREYXRhKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwge21lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKX0pO1xuXG4gICAgICAgICAgICBpZiAocmVxLmZpbGUgJiYgcmVxLmZpbGUuZmlsZW5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWxldGUgb2xkIGZpbGUgaWYgbmV3IGZpbGUgaXMgdGhlcmUgdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgaWYgKGdpZnREYXRhICYmIGdpZnREYXRhLmZpbGVVcmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BsaXRGaWxlID0gZ2lmdERhdGEuZmlsZVVybC5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gc3BsaXRGaWxlW3NwbGl0RmlsZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKGRpciArICcvJyArIGZpbGUsIChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZXQgcGF0aCBmb3IgbmV3IGZpbGVcbiAgICAgICAgICAgICAgICByZXEuYm9keS5naWZ0SW1nID0gcHJvY2Vzcy5lbnYuSU1BR0VfVVJMICsgZm9sZGVyTmFtZSArICcvJyArIHJlcS5maWxlLmZpbGVuYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGRhdGUgZ2lmdCBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKEdpZnRNb2RlbCwge19pZDogaWR9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIEdpZnRcbiAgICAgKi9cbiAgICByZW1vdmUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gRmluZCBnaWZ0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGdpZnREYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKEdpZnRNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBnaWZ0IG5vdCBleGlzdHNcbiAgICAgICAgICAgIGlmICghZ2lmdERhdGEpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7bWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpfSk7XG5cbiAgICAgICAgICAgIC8vIFNvZnQgZGVsZXRlIEdpZnRcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoR2lmdE1vZGVsLCB7X2lkOiBpZH0sIHtpc0RlbGV0ZWQ6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkRFTEVURUQpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNlbmRHaWZ0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7X2lkfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3Qge2dpZnRJZCwgcXVhbnRpdHksIGdpZnRlZFRvfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgbG9nZ2VkSW5Vc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ25hbWUnLCAnd2FsbGV0JywgJ3BvcHVsYXJpdHknXSk7XG4gICAgICAgICAgICByZXEuYm9keS5jcmVhdGVkQnkgPSByZXEuYm9keS51cGRhdGVkQnkgPSByZXEuYm9keS51c2VySWQgPSBfaWQ7XG4gICAgICAgICAgICBjb25zdCBnaWZ0ID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKEdpZnRNb2RlbCwgZ2lmdElkLCBbJ3pvbGUnLCAncG9wdWxhcml0eSddKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi5jcmVhdGUoU2VuZEdpZnRNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgY29uc3QgbmV3V2FsbGV0ID0gbG9nZ2VkSW5Vc2VyLndhbGxldCAtIChnaWZ0LnpvbGUgKiBxdWFudGl0eSk7XG4gICAgICAgICAgICBjb25zdCBnaWZ0ZWRVc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgZ2lmdGVkVG8sIFsnZGV2aWNlVG9rZW4nLCAnd2FsbGV0JywncG9wdWxhcml0eSddKTtcbiAgICAgICAgXG5cbiAgICAgICAgICAgIC8vIGNvbnN0IG5ld1dhbGxldE9mR2lmdCA9IGdpZnRlZFVzZXIud2FsbGV0ID8gZ2lmdGVkVXNlci53YWxsZXQgKyAoZ2lmdC56b2xlICogcXVhbnRpdHkpIDogZ2lmdC56b2xlICogcXVhbnRpdHk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IG5ld1BvcHVsYXJpdHkgPSBnaWZ0ZWRVc2VyLnBvcHVsYXJpdHkgPyBnaWZ0ZWRVc2VyLnBvcHVsYXJpdHkgKyAoZ2lmdC5wb3B1bGFyaXR5ICogcXVhbnRpdHkpOiAoZ2lmdC5wb3B1bGFyaXR5ID8gKGdpZnQucG9wdWxhcml0eSAqIHF1YW50aXR5KSA6IDApO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobmV3UG9wdWxhcml0eSk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZH0sIHt3YWxsZXQ6IG5ld1dhbGxldH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIC8qICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwge19pZDogZ2lmdGVkVG99LCB7d2FsbGV0OiBuZXdXYWxsZXRPZkdpZnQsIHBvcHVsYXJpdHk6IG5ld1BvcHVsYXJpdHl9KTsgKi9cbiAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHtfaWQ6IGdpZnRlZFRvfSwgeyBwb3B1bGFyaXR5OiBuZXdQb3B1bGFyaXR5fSk7XG4gICAgICAgICAgICBpZiAoZ2lmdGVkVXNlci5kZXZpY2VUb2tlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY2VpdmVyU2V0dGluZyA9IGF3YWl0IFVzZXJTZXR0aW5ncy5maW5kT25lKHsgdXNlcklkOiBnaWZ0ZWRVc2VyLl9pZCB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IGdpZnRlZFVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0dpZnQgUmVjZWl2ZWQnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgIGhhcyBzZW50IHlvdSBnaWZ0IG9mICR7Z2lmdC5wb3B1bGFyaXR5ICogcXVhbnRpdHl9IHBvcHVsYXJpdHlgLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogZ2lmdGVkVXNlci5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZihyZWNlaXZlclNldHRpbmcuZ2lmdFNob3c9PXRydWUpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9nZ2VkSW5Vc2VyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiBsb2dnZWRJblVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0dpZnQnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgIHlvdSBoYXZlIHNwZW5kICR7Z2lmdC56b2xlICogcXVhbnRpdHl9IHpvbGVzIGAsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiBsb2dnZWRJblVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VuZG9lclNldHRpbmcgPSBhd2FpdCBVc2VyU2V0dGluZ3MuZmluZE9uZSh7IHVzZXJJZDogbG9nZ2VkSW5Vc2VyLl9pZCB9KTtcbiAgICAgICAgICAgICAgICBpZihzZW5kb2VyU2V0dGluZy5naWZ0U2hvdz09dHJ1ZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1c2VyR2lmdHMgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHtpZH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZCA9IFt7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2dpZnRJZCcsXG4gICAgICAgICAgICAgICAgc2VsZWN0OiBbJ2dpZnRJbWcnXVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgICBsZXQgZ2lmdHMgPSBhd2FpdCBDb21tb24ubGlzdChTZW5kR2lmdE1vZGVsLCB7Z2lmdGVkVG86IGlkfSwgWydnaWZ0SWQnLCAncXVhbnRpdHknXSwgcG9wdWxhdGVGaWVsZCk7XG4gICAgICAgICAgICBjb25zdCBnaWZ0QXJyID0gW107XG4gICAgICAgICAgICBpZiAoZ2lmdHMgJiYgZ2lmdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZ2lmdHMgPSBfLmdyb3VwQnkoZ2lmdHMsICdnaWZ0SWQuX2lkJyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZ2lmdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdpZnRBcnIgJiYgZ2lmdEFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGdpZnRBcnIuZmluZEluZGV4KG9iaiA9PiBvYmouZ2lmdElkID09PSBrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEFyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRJZDoga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEltYWdlOiAgb2JqLmdpZnRJZCA/IG9iai5naWZ0SWQuZ2lmdEltZyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVhbnRpdHk6IG9iai5xdWFudGl0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0QXJyW2luZGV4XS5xdWFudGl0eSA9IGdpZnRBcnJbaW5kZXhdLnF1YW50aXR5ICsgb2JqLnF1YW50aXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdEFyci5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2lmdElkOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRJbWFnZTogb2JqLmdpZnRJZCA/IG9iai5naWZ0SWQuZ2lmdEltZyA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFudGl0eTogb2JqLnF1YW50aXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBnaWZ0cyA9IGdpZnRBcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHtnaWZ0c30pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgR2lmdENvbnRyb2xsZXIoKTtcbiJdfQ==