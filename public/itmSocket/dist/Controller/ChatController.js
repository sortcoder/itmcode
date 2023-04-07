"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Chat = _interopRequireDefault(require("../Models/Chat"));

var _fs = _interopRequireDefault(require("fs"));

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _Chatblock = _interopRequireDefault(require("../Models/Chatblock"));

var _User = _interopRequireDefault(require("../Models/User"));

var _lodash = _interopRequireDefault(require("lodash"));

var _Chatclear = _interopRequireDefault(require("../Models/Chatclear"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _ChatUserDelete = _interopRequireDefault(require("../Models/ChatUserDelete"));

var _ChatMessageDelete = _interopRequireDefault(require("../Models/ChatMessageDelete"));

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var params = ['title', 'description', 'image', "link", 'type'];

class ChatController {
  constructor() {
    var _this = this;

    _defineProperty(this, "send", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var {
            senderId,
            receiverId,
            message,
            gif
          } = req.body;
          var checkSubscription = yield _User.default.findById(senderId);

          if (checkSubscription.isSubscribed == false) {
            if (checkSubscription.message < 1) {
              return (0, _RequestHelper.buildResult)(res, 500, {
                "message": "Insufficient balance"
              });
            } else {
              var totalMessge = checkSubscription.message - 1;
              yield _CommonDbController.default.update(_User.default, {
                '_id': senderId
              }, {
                message: totalMessge
              });
            }
          }

          yield _CommonDbController.default.update(_ChatUserDelete.default, {
            senderId: receiverId,
            receiverId: senderId
          }, {
            isDeleted: true
          });
          yield _CommonDbController.default.update(_ChatUserDelete.default, {
            senderId: senderId,
            receiverId: receiverId
          }, {
            isDeleted: true
          });
          var receiver = yield _CommonDbController.default.findById(_User.default, {
            _id: receiverId
          }, ['deviceToken', 'wallet', 'popularity']);
          var receiverSetting = yield _UserSettings.default.findOne({
            userId: receiverId
          });
          var ChatDetail = '';

          if (message) {
            var insertData = {
              sender: senderId,
              receiver: receiverId,
              message: message,
              type: "message"
            };
            ChatDetail = yield _CommonDbController.default.create(_Chat.default, insertData);

            if (receiver.deviceToken) {
              var notificationData = {
                toUser: receiver._id,
                fromUser: senderId,
                title: checkSubscription.name,
                message: message,
                deviceToken: receiver.deviceToken,
                createdBy: senderId,
                updatedBy: senderId
              };

              if (receiverSetting.newMessages == true) {
                yield _Notifications.default.sendNotificationDirect(notificationData, "chat");
              }
            }
          }

          if (req.file && req.file.filename) {
            var image = process.env.IMAGE_URL + "chat" + '/' + req.file.filename;
            var _insertData = {
              sender: senderId,
              receiver: receiverId,
              message: image,
              isRead: 0,
              type: "image"
            };
            ChatDetail = yield _CommonDbController.default.create(_Chat.default, _insertData);

            if (receiver.deviceToken) {
              var _notificationData = {
                toUser: receiver._id,
                fromUser: senderId,
                title: checkSubscription.name,
                message: "Image",
                deviceToken: receiver.deviceToken,
                createdBy: senderId,
                updatedBy: senderId
              };

              if (receiverSetting.newMessages == true) {
                yield _Notifications.default.sendNotificationDirect(_notificationData, "chat");
              } // await Notifications.sendNotificationDirect(notificationData);

            }
          }

          if (gif) {
            var _insertData2 = {
              sender: senderId,
              receiver: receiverId,
              message: gif,
              isRead: 0,
              type: "image"
            };
            ChatDetail = yield _CommonDbController.default.create(_Chat.default, _insertData2);

            if (receiver.deviceToken) {
              var _notificationData2 = {
                toUser: receiver._id,
                fromUser: senderId,
                title: checkSubscription.name,
                message: "GIF",
                deviceToken: receiver.deviceToken,
                createdBy: senderId,
                updatedBy: senderId
              };

              if (receiverSetting.newMessages == true) {
                yield _Notifications.default.sendNotificationDirect(_notificationData2, "chat");
              }
            }
          }
          /*   const populateParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified'];
            const populateFields = [{
                path: 'sender', select: populateParams
            }, {
                path: 'receiver', select: populateParams
            }];
            const allchat = await Common.list(Chat, { $or: [{ 'sender': senderId }, { 'sender': receiverId }, { 'receiver': senderId }, { 'receiver': receiverId }], isDeleted: false }, '', populateFields); */


          var response = yield _this.chatBodyNew(senderId, receiverId); // Send Response

          var result = {
            message: req.t(_constants.default.CREATED),
            response
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

    _defineProperty(this, "chatlist", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var populateParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified'];
          var populateFields = [{
            path: 'sender',
            select: populateParams
          }, {
            path: 'receiver',
            select: populateParams
          }];
          var {
            senderId,
            receiverId
          } = req.body;
          var response = yield _this.chatBodyNew(senderId, receiverId);
          return (0, _RequestHelper.buildResult)(res, 200, response);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "delete", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        var {
          messageId,
          loginUserId
        } = req.body;
        var insertData = {
          deletedByUser: loginUserId,
          chat: messageId
        };
        var ChatDetail = yield _CommonDbController.default.create(_ChatMessageDelete.default, insertData);
        var result = {
          message: req.t(_constants.default.DELETED)
        };
        return (0, _RequestHelper.buildResult)(res, 200, result);
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "blockChat", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (req, res) {
        var {
          loginUserId,
          blockUserId
        } = req.body;
        var checkBlockUser = yield _Chatblock.default.findOne({
          userId: loginUserId,
          blockUserId: blockUserId,
          isDeleted: false
        });

        if (checkBlockUser) {
          yield _CommonDbController.default.update(_Chatblock.default, {
            '_id': checkBlockUser._id
          }, {
            isDeleted: true
          });
          return (0, _RequestHelper.buildResult)(res, 200, {
            "message": "User Unblocked Successfully"
          });
        } else {
          var insertData = {
            userId: loginUserId,
            blockUserId: blockUserId
          };
          var ChatDetail = yield _CommonDbController.default.create(_Chatblock.default, insertData);
          return (0, _RequestHelper.buildResult)(res, 200, {
            "message": "User blocked Successfully"
          });
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "chatUserList", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        var {
          loginUserId
        } = req.body;

        try {
          yield _CommonDbController.default.update(_User.default, {
            _id: loginUserId
          }, {
            chatTime: new Date(),
            chatOnlineStatus: true
          });
          var userlist = yield _Chat.default.find({
            $or: [{
              'sender': loginUserId
            }, {
              'receiver': loginUserId
            }]
          });
          var userIds = [];

          for (var iterator of userlist) {
            if (iterator.sender.toString() != loginUserId) userIds.push(iterator.sender.toString());
            if (iterator.receiver.toString() != loginUserId) userIds.push(iterator.receiver.toString());
          }

          var newArray = _lodash.default.uniq(userIds);

          var alluserlist = yield _User.default.find({
            "_id": {
              $in: newArray
            }
          });
          var allchatMessage = yield _ChatMessageDelete.default.find({
            deletedByUser: loginUserId
          }).select("chat"); // console.log(allchatMessage);

          var allDeletedMessage = [];

          for (var msgid of allchatMessage) {
            allDeletedMessage.push(msgid.chat);
          }

          var responseArray = []; // list of all unique user

          for (var user of alluserlist) {
            var secUserId = user._id;
            var chatlastmessage = yield _Chat.default.findOne({
              "sender": {
                $in: [loginUserId, secUserId]
              },
              "receiver": {
                $in: [loginUserId, secUserId]
              },
              "_id": {
                $nin: allDeletedMessage
              },
              isDeleted: false
            }).sort({
              createdAt: -1
            });

            if (chatlastmessage) {
              yield _CommonDbController.default.update(_Chat.default, {
                'receiver': loginUserId,
                isRead: 0
              }, {
                isRead: 1
              });
            }

            var checkUserDelete = yield _ChatUserDelete.default.findOne({
              senderId: loginUserId,
              receiverId: secUserId,
              isDeleted: false
            });

            if (checkUserDelete) {
              continue;
            } // make offline after 1 min


            var startTime = new Date(user.chatTime);
            var currenttime = (0, _momentTimezone.default)(new Date());

            var duration = _momentTimezone.default.duration(currenttime.diff(startTime));

            var min = duration.asSeconds();

            if (min > 15) {
              yield _CommonDbController.default.update(_User.default, {
                _id: user._id
              }, {
                chatOnlineStatus: false
              });
            }

            var checkclear = yield _Chatclear.default.findOne({
              senderId: loginUserId,
              receiverId: secUserId
            }).sort({
              "createdAt": "-1"
            });
            var ChatclearFlag = false;

            if (checkclear && new Date(checkclear.createdAt).getTime() > new Date(chatlastmessage.createdAt).getTime()) {
              ChatclearFlag = true;
            }
            /*   let chatlastmessage = await Chat.findOne({ $or: [{ 'sender': loginUserId }, { 'receiver': secUserId }], $or: [{ 'sender': secUserId }, { 'receiver': loginUserId },], isDeleted: false }).sort({ createdAt: -1 }); */


            var totalUnreadMessage = yield _Chat.default.find({
              'receiver': loginUserId,
              isDeleted: false,
              isRead: 1,
              sender: secUserId
            }).sort({
              createdAt: -1
            });
            var checkBlockUser = yield _Chatblock.default.findOne({
              userId: loginUserId,
              blockUserId: secUserId,
              isDeleted: false
            });
            var checkBlockUser1 = yield _Chatblock.default.findOne({
              blockUserId: loginUserId,
              userId: secUserId,
              isDeleted: false
            });
            var tempObj = {};
            tempObj.userId = user._id;
            tempObj.uniqueId = user.userId;
            tempObj.name = user.name;
            tempObj.popularity = user.popularity;
            tempObj.email = user.email;
            tempObj.chatOnlineStatus = user.chatOnlineStatus;
            tempObj.profilePic = user.profilePic ? user.profilePic : '';
            tempObj.messageAvailable = user.message ? user.message : 0;
            tempObj.isSubscribed = user.isSubscribed;
            tempObj.isChatblock = checkBlockUser1 ? true : checkBlockUser ? true : false;
            tempObj.isSelfBlock = checkBlockUser ? true : false;
            tempObj.lastMessage = chatlastmessage ? ChatclearFlag == false ? chatlastmessage.message : '' : '';
            tempObj.messageId = chatlastmessage ? chatlastmessage._id : '';
            tempObj.isRead = chatlastmessage ? chatlastmessage.isRead : 0;
            tempObj.senderId = chatlastmessage ? chatlastmessage.sender : '';
            tempObj.online = user.lastScreenTime ? user.lastScreenTime : '';
            tempObj.lastMessageType = chatlastmessage ? chatlastmessage.type : '';
            tempObj.lastmessageTime = chatlastmessage ? (0, _momentTimezone.default)(chatlastmessage.createdAt).tz("Asia/Kolkata").format("h:mm a") : '';
            tempObj.unreadMessageCount = totalUnreadMessage.length;
            tempObj.createdAt = chatlastmessage && chatlastmessage.createdAt ? chatlastmessage.createdAt : "";
            responseArray.push(tempObj);
            console.log("inner", responseArray);
          }

          responseArray = _lodash.default.orderBy(responseArray, ['createdAt'], ['desc']);
          return (0, _RequestHelper.buildResult)(res, 200, responseArray);
        } catch (error) {
          // Returns unspecified exceptions
          console.log("ddd", error);
        }
      });

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "chatBody", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (senderId, receiverId) {
        try {
          var userDetail = yield _User.default.findById(senderId);
          var receiverDetail = yield _User.default.findById(receiverId);
          yield _CommonDbController.default.update(_User.default, {
            _id: senderId
          }, {
            chatTime: new Date(),
            chatOnlineStatus: true
          });
          var populateParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId'];
          var populateFields = [{
            path: 'sender',
            select: populateParams
          }, {
            path: 'receiver',
            select: populateParams
          }];
          yield _CommonDbController.default.update(_Chat.default, {
            'sender': receiverId,
            'receiver': senderId
          }, {
            isRead: 2
          }); // const result = await Common.list(Chat, { $or: [{ 'sender': senderId }, { 'sender': receiverId }, { 'receiver': senderId }, { 'receiver': receiverId }], isDeleted: false }, '', populateFields);

          var result = yield _CommonDbController.default.list(_Chat.default, {
            "sender": {
              $in: [receiverId, senderId]
            },
            "receiver": {
              $in: [receiverId, senderId]
            },
            isDeleted: false
          }, '', populateFields);
          var checkBlockUser = yield _Chatblock.default.findOne({
            userId: senderId,
            blockUserId: receiverId,
            isDeleted: false
          });
          var checkBlockUser1 = yield _Chatblock.default.findOne({
            blockUserId: senderId,
            userId: receiverId,
            isDeleted: false
          });
          var responseArray = [];

          for (var iterator of result) {
            var checkclear = yield _Chatclear.default.findOne({
              senderId: senderId,
              receiverId: receiverId
            }).sort({
              "createdAt": "-1"
            });

            if (checkclear && new Date(checkclear.createdAt).getTime() > new Date(iterator.createdAt).getTime()) {
              continue;
            }

            var tempObj = {};
            tempObj.isRead = iterator.isRead;
            tempObj.isDeleted = iterator.isDeleted;
            tempObj._id = iterator._id;
            tempObj.sender = iterator.sender ? iterator.sender : {};
            tempObj.receiver = iterator.receiver ? iterator.receiver : {};
            tempObj.message = iterator.message;
            tempObj.chatTime = receiverDetail.chatTime;
            tempObj.isChatblock = checkBlockUser1 ? true : checkBlockUser ? true : false;
            tempObj.chatOnlineStatus = receiverDetail.chatOnlineStatus;
            tempObj.type = iterator.type;
            tempObj.createdAt = (0, _momentTimezone.default)(iterator.createdAt).tz("Asia/Kolkata").format("h:mm a");
            responseArray.push(tempObj);
          }

          var userArray = {
            messageAvailable: userDetail.message ? userDetail.message : 0,
            isSubscribed: userDetail.isSubscribed,
            chatTime: receiverDetail.chatTime,
            chatOnlineStatus: receiverDetail.chatOnlineStatus
          };
          return {
            chatlist: responseArray,
            user: userArray
          };
        } catch (error) {
          // Returns unspecified exceptions
          return error;
        }
      });

      return function (_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "clearchat", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
        var {
          senderId,
          receiverId
        } = req.body;
        var insertData = {
          senderId: senderId,
          receiverId: receiverId
        };
        var ChatDetail = yield _CommonDbController.default.create(_Chatclear.default, insertData);
        var result = {
          message: req.t(_constants.default.CREATED),
          ChatDetail
        };
        return (0, _RequestHelper.buildResult)(res, 200, result);
      });

      return function (_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }());

    _defineProperty(this, "chatBodyNew", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* (senderId, receiverId) {
        try {
          var userDetail = yield _User.default.findById(senderId);
          var receiverDetail = yield _User.default.findById(receiverId);
          yield _CommonDbController.default.update(_User.default, {
            _id: senderId
          }, {
            chatTime: new Date(),
            chatOnlineStatus: true
          });
          var populateParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'userId'];
          var populateFields = [{
            path: 'sender',
            select: populateParams
          }, {
            path: 'receiver',
            select: populateParams
          }];
          yield _CommonDbController.default.update(_Chat.default, {
            'sender': receiverId,
            'receiver': senderId
          }, {
            isRead: 2
          }); // const result = await Common.list(Chat, { $or: [{ 'sender': senderId }, { 'sender': receiverId }, { 'receiver': senderId }, { 'receiver': receiverId }], isDeleted: false }, '', populateFields);

          var result = yield _CommonDbController.default.list(_Chat.default, {
            "sender": {
              $in: [receiverId, senderId]
            },
            "receiver": {
              $in: [receiverId, senderId]
            },
            isDeleted: false
          }, '', populateFields);
          var checkBlockUser = yield _Chatblock.default.findOne({
            userId: senderId,
            blockUserId: receiverId,
            isDeleted: false
          });
          var checkBlockUser1 = yield _Chatblock.default.findOne({
            blockUserId: senderId,
            userId: receiverId,
            isDeleted: false
          });
          var responseArray = [];
          var checkBlock = false;
          var isSelfBlock = false;
          checkBlock = checkBlockUser1 ? true : checkBlockUser ? true : false;
          isSelfBlock = checkBlockUser ? true : false;

          for (var iterator of result) {
            var checkclear = yield _Chatclear.default.findOne({
              senderId: senderId,
              receiverId: receiverId
            }).sort({
              "createdAt": "-1"
            });

            if (checkclear && new Date(checkclear.createdAt).getTime() > new Date(iterator.createdAt).getTime()) {
              continue;
            }

            var tempObj = {};
            var checkDeleteMessage = yield _ChatMessageDelete.default.findOne({
              "chat": iterator._id,
              deletedByUser: senderId
            }); // console.log("chat_id",iterator._id)

            if (checkDeleteMessage) {
              // console.log("D");
              continue;
            }

            tempObj.isRead = iterator.isRead;
            tempObj.isDeleted = iterator.isDeleted;
            tempObj._id = iterator._id;
            tempObj.sender = iterator.sender ? iterator.sender : {};
            tempObj.receiver = iterator.receiver ? iterator.receiver : {};
            tempObj.message = iterator.message;
            tempObj.chatTime = receiverDetail.chatTime;
            tempObj.isChatblock = checkBlock;
            tempObj.isSelfBlock = isSelfBlock;
            tempObj.chatOnlineStatus = receiverDetail.chatOnlineStatus;
            tempObj.type = iterator.type;
            tempObj.createdAt = (0, _momentTimezone.default)(iterator.createdAt).tz("Asia/Kolkata").format("h:mm a");
            tempObj.createdDate = (0, _momentTimezone.default)(iterator.createdAt).format("YYYY-MM-DD");
            responseArray.push(tempObj);
          }

          var newArray = _lodash.default.groupBy(responseArray, "createdDate");

          var finalArray = [];

          for (var [key, value] of Object.entries(newArray)) {
            var tempObj1 = {};
            tempObj1.date = key;
            tempObj1.chat = value;
            finalArray.push(tempObj1);
          }

          var userArray = {
            messageAvailable: userDetail.message ? userDetail.message : 0,
            isSubscribed: userDetail.isSubscribed,
            chatTime: receiverDetail.chatTime,
            chatOnlineStatus: receiverDetail.chatOnlineStatus,
            isChatblock: checkBlock,
            isSelfBlock: isSelfBlock
          };
          return {
            chatlist: finalArray,
            user: userArray
          }; //    return buildResult(res, 200, finalArray);
        } catch (error) {
          // Returns unspecified exceptions
          return error; // return buildResult(res, 500, {}, {}, error);
        }
      });

      return function (_x15, _x16) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "deleteUserFromChatUserlist", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(function* (req, res) {
        var {
          senderId,
          receiverId
        } = req.body;
        var insertData = {
          senderId: senderId,
          receiverId: receiverId
        };
        var ChatDetail1 = yield _CommonDbController.default.create(_Chatclear.default, insertData);
        var ChatDetail = yield _CommonDbController.default.create(_ChatUserDelete.default, insertData);
        var result = {
          message: req.t(_constants.default.CREATED),
          ChatDetail
        };
        return (0, _RequestHelper.buildResult)(res, 200, result);
      });

      return function (_x17, _x18) {
        return _ref9.apply(this, arguments);
      };
    }());
  }

}

var _default = new ChatController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0NoYXRDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIkNoYXRDb250cm9sbGVyIiwicmVxIiwicmVzIiwic2VuZGVySWQiLCJyZWNlaXZlcklkIiwibWVzc2FnZSIsImdpZiIsImJvZHkiLCJjaGVja1N1YnNjcmlwdGlvbiIsIlVzZXIiLCJmaW5kQnlJZCIsImlzU3Vic2NyaWJlZCIsInRvdGFsTWVzc2dlIiwiQ29tbW9uIiwidXBkYXRlIiwiQ2hhdFVzZXJEZWxldGUiLCJpc0RlbGV0ZWQiLCJyZWNlaXZlciIsIl9pZCIsInJlY2VpdmVyU2V0dGluZyIsIlVzZXJTZXR0aW5ncyIsImZpbmRPbmUiLCJ1c2VySWQiLCJDaGF0RGV0YWlsIiwiaW5zZXJ0RGF0YSIsInNlbmRlciIsInR5cGUiLCJjcmVhdGUiLCJDaGF0IiwiZGV2aWNlVG9rZW4iLCJub3RpZmljYXRpb25EYXRhIiwidG9Vc2VyIiwiZnJvbVVzZXIiLCJ0aXRsZSIsIm5hbWUiLCJjcmVhdGVkQnkiLCJ1cGRhdGVkQnkiLCJuZXdNZXNzYWdlcyIsIk5vdGlmaWNhdGlvbnMiLCJzZW5kTm90aWZpY2F0aW9uRGlyZWN0IiwiZmlsZSIsImZpbGVuYW1lIiwiaW1hZ2UiLCJwcm9jZXNzIiwiZW52IiwiSU1BR0VfVVJMIiwiaXNSZWFkIiwicmVzcG9uc2UiLCJjaGF0Qm9keU5ldyIsInJlc3VsdCIsInQiLCJjb25zdGFudHMiLCJDUkVBVEVEIiwiZXJyb3IiLCJwb3B1bGF0ZVBhcmFtcyIsInBvcHVsYXRlRmllbGRzIiwicGF0aCIsInNlbGVjdCIsIm1lc3NhZ2VJZCIsImxvZ2luVXNlcklkIiwiZGVsZXRlZEJ5VXNlciIsImNoYXQiLCJDaGF0TWVzc2FnZURlbGV0ZSIsIkRFTEVURUQiLCJibG9ja1VzZXJJZCIsImNoZWNrQmxvY2tVc2VyIiwiQ2hhdGJsb2NrIiwiY2hhdFRpbWUiLCJEYXRlIiwiY2hhdE9ubGluZVN0YXR1cyIsInVzZXJsaXN0IiwiZmluZCIsIiRvciIsInVzZXJJZHMiLCJpdGVyYXRvciIsInRvU3RyaW5nIiwicHVzaCIsIm5ld0FycmF5IiwiXyIsInVuaXEiLCJhbGx1c2VybGlzdCIsIiRpbiIsImFsbGNoYXRNZXNzYWdlIiwiYWxsRGVsZXRlZE1lc3NhZ2UiLCJtc2dpZCIsInJlc3BvbnNlQXJyYXkiLCJ1c2VyIiwic2VjVXNlcklkIiwiY2hhdGxhc3RtZXNzYWdlIiwiJG5pbiIsInNvcnQiLCJjcmVhdGVkQXQiLCJjaGVja1VzZXJEZWxldGUiLCJzdGFydFRpbWUiLCJjdXJyZW50dGltZSIsImR1cmF0aW9uIiwibW9tZW50IiwiZGlmZiIsIm1pbiIsImFzU2Vjb25kcyIsImNoZWNrY2xlYXIiLCJDaGF0Y2xlYXIiLCJDaGF0Y2xlYXJGbGFnIiwiZ2V0VGltZSIsInRvdGFsVW5yZWFkTWVzc2FnZSIsImNoZWNrQmxvY2tVc2VyMSIsInRlbXBPYmoiLCJ1bmlxdWVJZCIsInBvcHVsYXJpdHkiLCJlbWFpbCIsInByb2ZpbGVQaWMiLCJtZXNzYWdlQXZhaWxhYmxlIiwiaXNDaGF0YmxvY2siLCJpc1NlbGZCbG9jayIsImxhc3RNZXNzYWdlIiwib25saW5lIiwibGFzdFNjcmVlblRpbWUiLCJsYXN0TWVzc2FnZVR5cGUiLCJsYXN0bWVzc2FnZVRpbWUiLCJ0eiIsImZvcm1hdCIsInVucmVhZE1lc3NhZ2VDb3VudCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJvcmRlckJ5IiwidXNlckRldGFpbCIsInJlY2VpdmVyRGV0YWlsIiwibGlzdCIsInVzZXJBcnJheSIsImNoYXRsaXN0IiwiY2hlY2tCbG9jayIsImNoZWNrRGVsZXRlTWVzc2FnZSIsImNyZWF0ZWREYXRlIiwiZ3JvdXBCeSIsImZpbmFsQXJyYXkiLCJrZXkiLCJ2YWx1ZSIsIk9iamVjdCIsImVudHJpZXMiLCJ0ZW1wT2JqMSIsImRhdGUiLCJDaGF0RGV0YWlsMSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUtBOztBQUNBOztBQUNB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LXZhbGlkYXRvcic7XG5pbXBvcnQgQ2hhdCBmcm9tICcuLi9Nb2RlbHMvQ2hhdCc7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQgeyBidWlsZFJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IHBhZ2luYXRpb25SZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvTW9uZ28nO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vRGJDb250cm9sbGVyL0NvbW1vbkRiQ29udHJvbGxlcic7XG5pbXBvcnQgQ2hhdGJsb2NrIGZyb20gJy4uL01vZGVscy9DaGF0YmxvY2snO1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBDaGF0Y2xlYXIgZnJvbSAnLi4vTW9kZWxzL0NoYXRjbGVhcic7XG5pbXBvcnQgbW9tZW50IGZyb20gXCJtb21lbnQtdGltZXpvbmVcIjtcbmltcG9ydCBDaGF0VXNlckRlbGV0ZSBmcm9tICcuLi9Nb2RlbHMvQ2hhdFVzZXJEZWxldGUnO1xuaW1wb3J0IENoYXRNZXNzYWdlRGVsZXRlIGZyb20gJy4uL01vZGVscy9DaGF0TWVzc2FnZURlbGV0ZSc7XG5pbXBvcnQgTm90aWZpY2F0aW9ucyBmcm9tICcuLi9TZXJ2aWNlL05vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IFVzZXJTZXR0aW5ncyBmcm9tICcuLi9Nb2RlbHMvVXNlclNldHRpbmdzJztcblxuXG5jb25zdCBwYXJhbXMgPSBbJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJywgJ2ltYWdlJywgXCJsaW5rXCIsICd0eXBlJ107XG5cbmNsYXNzIENoYXRDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBCYW5uZXJcbiAgICAgKi9cbiAgICBzZW5kID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG5cblxuICAgICAgICAgICAgY29uc3QgeyBzZW5kZXJJZCwgcmVjZWl2ZXJJZCwgbWVzc2FnZSwgZ2lmIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGxldCBjaGVja1N1YnNjcmlwdGlvbiA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoc2VuZGVySWQpO1xuXG4gICAgICAgICAgICBpZiAoY2hlY2tTdWJzY3JpcHRpb24uaXNTdWJzY3JpYmVkID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrU3Vic2NyaXB0aW9uLm1lc3NhZ2UgPCAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwgeyBcIm1lc3NhZ2VcIjogXCJJbnN1ZmZpY2llbnQgYmFsYW5jZVwiIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdG90YWxNZXNzZ2UgPSBjaGVja1N1YnNjcmlwdGlvbi5tZXNzYWdlIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyLCB7ICdfaWQnOiBzZW5kZXJJZCB9LCB7IG1lc3NhZ2U6IHRvdGFsTWVzc2dlIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShDaGF0VXNlckRlbGV0ZSwgeyBzZW5kZXJJZDogcmVjZWl2ZXJJZCwgcmVjZWl2ZXJJZDogc2VuZGVySWQgfSwgeyBpc0RlbGV0ZWQ6IHRydWUgfSk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKENoYXRVc2VyRGVsZXRlLCB7IHNlbmRlcklkOiBzZW5kZXJJZCwgcmVjZWl2ZXJJZDogcmVjZWl2ZXJJZCB9LCB7IGlzRGVsZXRlZDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgY29uc3QgcmVjZWl2ZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlciwgeyBfaWQ6IHJlY2VpdmVySWQgfSwgWydkZXZpY2VUb2tlbicsICd3YWxsZXQnLCAncG9wdWxhcml0eSddKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY2VpdmVyU2V0dGluZyA9IGF3YWl0IFVzZXJTZXR0aW5ncy5maW5kT25lKHsgdXNlcklkOiByZWNlaXZlcklkIH0pO1xuXG4gICAgICAgICAgICBsZXQgQ2hhdERldGFpbCA9ICcnO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXI6IHJlY2VpdmVySWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBDaGF0RGV0YWlsID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShDaGF0LCBpbnNlcnREYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlci5kZXZpY2VUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiByZWNlaXZlci5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogc2VuZGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogY2hlY2tTdWJzY3JpcHRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogcmVjZWl2ZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IHNlbmRlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBzZW5kZXJJZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVjZWl2ZXJTZXR0aW5nLm5ld01lc3NhZ2VzID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbkRpcmVjdChub3RpZmljYXRpb25EYXRhLCBcImNoYXRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXEuZmlsZSAmJiByZXEuZmlsZS5maWxlbmFtZSkge1xuICAgICAgICAgICAgICAgIGxldCBpbWFnZSA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIFwiY2hhdFwiICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG5cbiAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXI6IHJlY2VpdmVySWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGltYWdlLFxuICAgICAgICAgICAgICAgICAgICBpc1JlYWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2VcIixcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgQ2hhdERldGFpbCA9IGF3YWl0IENvbW1vbi5jcmVhdGUoQ2hhdCwgaW5zZXJ0RGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHJlY2VpdmVyLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBzZW5kZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBjaGVja1N1YnNjcmlwdGlvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJJbWFnZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IHJlY2VpdmVyLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBzZW5kZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogc2VuZGVySWRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVyU2V0dGluZy5uZXdNZXNzYWdlcyA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb25EaXJlY3Qobm90aWZpY2F0aW9uRGF0YSwgXCJjaGF0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbkRpcmVjdChub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ2lmKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBzZW5kZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXI6IHJlY2VpdmVySWQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGdpZixcbiAgICAgICAgICAgICAgICAgICAgaXNSZWFkOiAwLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImltYWdlXCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIENoYXREZXRhaWwgPSBhd2FpdCBDb21tb24uY3JlYXRlKENoYXQsIGluc2VydERhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlci5kZXZpY2VUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiByZWNlaXZlci5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogc2VuZGVySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogY2hlY2tTdWJzY3JpcHRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiR0lGXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogcmVjZWl2ZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IHNlbmRlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBzZW5kZXJJZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVjZWl2ZXJTZXR0aW5nLm5ld01lc3NhZ2VzID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbkRpcmVjdChub3RpZmljYXRpb25EYXRhLCBcImNoYXRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICAvKiAgIGNvbnN0IHBvcHVsYXRlUGFyYW1zID0gWyduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnXTtcbiAgICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbe1xuICAgICAgICAgICAgICAgICAgcGF0aDogJ3NlbmRlcicsIHNlbGVjdDogcG9wdWxhdGVQYXJhbXNcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgcGF0aDogJ3JlY2VpdmVyJywgc2VsZWN0OiBwb3B1bGF0ZVBhcmFtc1xuICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgY29uc3QgYWxsY2hhdCA9IGF3YWl0IENvbW1vbi5saXN0KENoYXQsIHsgJG9yOiBbeyAnc2VuZGVyJzogc2VuZGVySWQgfSwgeyAnc2VuZGVyJzogcmVjZWl2ZXJJZCB9LCB7ICdyZWNlaXZlcic6IHNlbmRlcklkIH0sIHsgJ3JlY2VpdmVyJzogcmVjZWl2ZXJJZCB9XSwgaXNEZWxldGVkOiBmYWxzZSB9LCAnJywgcG9wdWxhdGVGaWVsZHMpOyAqL1xuXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmNoYXRCb2R5TmV3KHNlbmRlcklkLCByZWNlaXZlcklkKVxuXG4gICAgICAgICAgICAvLyBTZW5kIFJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkNSRUFURUQpLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IG9mIGFsbCB0aGUgYmFubmVyc1xuICAgICAqL1xuICAgIGNoYXRsaXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJ107XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IFt7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3NlbmRlcicsIHNlbGVjdDogcG9wdWxhdGVQYXJhbXNcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAncmVjZWl2ZXInLCBzZWxlY3Q6IHBvcHVsYXRlUGFyYW1zXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICAgIGNvbnN0IHsgc2VuZGVySWQsIHJlY2VpdmVySWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5jaGF0Qm9keU5ldyhzZW5kZXJJZCwgcmVjZWl2ZXJJZClcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIGNvbXBsZXRlbHR5IGRlbGV0ZSBtZXNzYWdlXG4gICAgLyogIGRlbGV0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKENoYXQsIHsgJ19pZCc6IGlkIH0sIHsgaXNEZWxldGVkOiB0cnVlIH0pO1xuICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5ERUxFVEVEKSxcbiBcbiAgICAgICAgIH07XG4gICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgIH0gKi9cbiAgICBkZWxldGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlSWQsIGxvZ2luVXNlcklkIH0gPSByZXEuYm9keTtcblxuICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgIGRlbGV0ZWRCeVVzZXI6IGxvZ2luVXNlcklkLFxuICAgICAgICAgICAgY2hhdDogbWVzc2FnZUlkXG4gICAgICAgIH1cbiAgICAgICAgbGV0IENoYXREZXRhaWwgPSBhd2FpdCBDb21tb24uY3JlYXRlKENoYXRNZXNzYWdlRGVsZXRlLCBpbnNlcnREYXRhKTtcblxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5ERUxFVEVEKSxcblxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgfVxuICAgIGJsb2NrQ2hhdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBjb25zdCB7IGxvZ2luVXNlcklkLCBibG9ja1VzZXJJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgIGxldCBjaGVja0Jsb2NrVXNlciA9IGF3YWl0IENoYXRibG9jay5maW5kT25lKHsgdXNlcklkOiBsb2dpblVzZXJJZCwgYmxvY2tVc2VySWQ6IGJsb2NrVXNlcklkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuXG4gICAgICAgIGlmIChjaGVja0Jsb2NrVXNlcikge1xuXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKENoYXRibG9jaywgeyAnX2lkJzogY2hlY2tCbG9ja1VzZXIuX2lkIH0sIHsgaXNEZWxldGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IFwibWVzc2FnZVwiOiBcIlVzZXIgVW5ibG9ja2VkIFN1Y2Nlc3NmdWxseVwiIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICB1c2VySWQ6IGxvZ2luVXNlcklkLFxuICAgICAgICAgICAgICAgIGJsb2NrVXNlcklkOiBibG9ja1VzZXJJZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IENoYXREZXRhaWwgPSBhd2FpdCBDb21tb24uY3JlYXRlKENoYXRibG9jaywgaW5zZXJ0RGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgXCJtZXNzYWdlXCI6IFwiVXNlciBibG9ja2VkIFN1Y2Nlc3NmdWxseVwiIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNoYXRVc2VyTGlzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBjb25zdCB7IGxvZ2luVXNlcklkIH0gPSByZXEuYm9keTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlciwgeyBfaWQ6IGxvZ2luVXNlcklkIH0sIHsgY2hhdFRpbWU6IG5ldyBEYXRlKCksIGNoYXRPbmxpbmVTdGF0dXM6IHRydWUgfSk7XG5cblxuICAgICAgICAgICAgbGV0IHVzZXJsaXN0ID0gYXdhaXQgQ2hhdC5maW5kKHsgJG9yOiBbeyAnc2VuZGVyJzogbG9naW5Vc2VySWQgfSwgeyAncmVjZWl2ZXInOiBsb2dpblVzZXJJZCB9XSB9KTtcbiAgICAgICAgICAgIGxldCB1c2VySWRzID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdG9yIG9mIHVzZXJsaXN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZXJhdG9yLnNlbmRlci50b1N0cmluZygpICE9IGxvZ2luVXNlcklkKVxuICAgICAgICAgICAgICAgICAgICB1c2VySWRzLnB1c2goaXRlcmF0b3Iuc2VuZGVyLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVyYXRvci5yZWNlaXZlci50b1N0cmluZygpICE9IGxvZ2luVXNlcklkKVxuICAgICAgICAgICAgICAgICAgICB1c2VySWRzLnB1c2goaXRlcmF0b3IucmVjZWl2ZXIudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbmV3QXJyYXkgPSBfLnVuaXEodXNlcklkcyk7XG5cblxuXG4gICAgICAgICAgICBsZXQgYWxsdXNlcmxpc3QgPSBhd2FpdCBVc2VyLmZpbmQoeyBcIl9pZFwiOiB7ICRpbjogbmV3QXJyYXkgfSB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBhbGxjaGF0TWVzc2FnZSA9IGF3YWl0IENoYXRNZXNzYWdlRGVsZXRlLmZpbmQoeyBkZWxldGVkQnlVc2VyOiBsb2dpblVzZXJJZCB9KS5zZWxlY3QoXCJjaGF0XCIpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYWxsY2hhdE1lc3NhZ2UpO1xuICAgICAgICAgICAgbGV0IGFsbERlbGV0ZWRNZXNzYWdlID0gW107XG4gICAgICAgICAgICBmb3IgKGxldCBtc2dpZCBvZiBhbGxjaGF0TWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGFsbERlbGV0ZWRNZXNzYWdlLnB1c2gobXNnaWQuY2hhdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZXNwb25zZUFycmF5ID0gW107XG4gICAgICAgICBcblxuICAgICAgICAgICAgLy8gbGlzdCBvZiBhbGwgdW5pcXVlIHVzZXJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdXNlciBvZiBhbGx1c2VybGlzdCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IHNlY1VzZXJJZCA9IHVzZXIuX2lkO1xuXG4gICAgICAgICAgICAgICAgbGV0IGNoYXRsYXN0bWVzc2FnZSA9IGF3YWl0IENoYXQuZmluZE9uZSh7XG4gICAgICAgICAgICAgICAgICAgIFwic2VuZGVyXCI6IHsgJGluOiBbbG9naW5Vc2VySWQsIHNlY1VzZXJJZF0gfSxcbiAgICAgICAgICAgICAgICAgICAgXCJyZWNlaXZlclwiOiB7ICRpbjogW2xvZ2luVXNlcklkLCBzZWNVc2VySWRdIH0sXG4gICAgICAgICAgICAgICAgICAgIFwiX2lkXCI6IHsgJG5pbjogYWxsRGVsZXRlZE1lc3NhZ2UgfSxcbiAgICAgICAgICAgICAgICAgICAgaXNEZWxldGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pLnNvcnQoeyBjcmVhdGVkQXQ6IC0xIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjaGF0bGFzdG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShDaGF0LCB7ICdyZWNlaXZlcic6IGxvZ2luVXNlcklkLCBpc1JlYWQ6IDAgfSwgeyBpc1JlYWQ6IDEgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrVXNlckRlbGV0ZSA9IGF3YWl0IENoYXRVc2VyRGVsZXRlLmZpbmRPbmUoeyBzZW5kZXJJZDogbG9naW5Vc2VySWQsIHJlY2VpdmVySWQ6IHNlY1VzZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tVc2VyRGVsZXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSBvZmZsaW5lIGFmdGVyIDEgbWluXG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKHVzZXIuY2hhdFRpbWUpO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50dGltZSA9IG1vbWVudChuZXcgRGF0ZSk7XG4gICAgICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gbW9tZW50LmR1cmF0aW9uKGN1cnJlbnR0aW1lLmRpZmYoc3RhcnRUaW1lKSk7XG4gICAgICAgICAgICAgICAgdmFyIG1pbiA9IGR1cmF0aW9uLmFzU2Vjb25kcygpO1xuICAgICAgICAgICAgICAgIGlmIChtaW4gPiAxNSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXIsIHsgX2lkOiB1c2VyLl9pZCB9LCB7IGNoYXRPbmxpbmVTdGF0dXM6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjaGVja2NsZWFyID0gYXdhaXQgQ2hhdGNsZWFyLmZpbmRPbmUoeyBzZW5kZXJJZDogbG9naW5Vc2VySWQsIHJlY2VpdmVySWQ6IHNlY1VzZXJJZCB9KS5zb3J0KHsgXCJjcmVhdGVkQXRcIjogXCItMVwiIH0pO1xuXG4gICAgICAgICAgICAgICAgbGV0IENoYXRjbGVhckZsYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tjbGVhciAmJiBuZXcgRGF0ZShjaGVja2NsZWFyLmNyZWF0ZWRBdCkuZ2V0VGltZSgpID4gbmV3IERhdGUoY2hhdGxhc3RtZXNzYWdlLmNyZWF0ZWRBdCkuZ2V0VGltZSgpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgQ2hhdGNsZWFyRmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLyogICBsZXQgY2hhdGxhc3RtZXNzYWdlID0gYXdhaXQgQ2hhdC5maW5kT25lKHsgJG9yOiBbeyAnc2VuZGVyJzogbG9naW5Vc2VySWQgfSwgeyAncmVjZWl2ZXInOiBzZWNVc2VySWQgfV0sICRvcjogW3sgJ3NlbmRlcic6IHNlY1VzZXJJZCB9LCB7ICdyZWNlaXZlcic6IGxvZ2luVXNlcklkIH0sXSwgaXNEZWxldGVkOiBmYWxzZSB9KS5zb3J0KHsgY3JlYXRlZEF0OiAtMSB9KTsgKi9cblxuICAgICAgICAgICAgICAgIGxldCB0b3RhbFVucmVhZE1lc3NhZ2UgPSBhd2FpdCBDaGF0LmZpbmQoeyAncmVjZWl2ZXInOiBsb2dpblVzZXJJZCwgaXNEZWxldGVkOiBmYWxzZSwgaXNSZWFkOiAxLCBzZW5kZXI6IHNlY1VzZXJJZCB9KS5zb3J0KHsgY3JlYXRlZEF0OiAtMSB9KTtcblxuICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogbG9naW5Vc2VySWQsIGJsb2NrVXNlcklkOiBzZWNVc2VySWQsIGlzRGVsZXRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrQmxvY2tVc2VyMSA9IGF3YWl0IENoYXRibG9jay5maW5kT25lKHsgYmxvY2tVc2VySWQ6IGxvZ2luVXNlcklkLCB1c2VySWQ6IHNlY1VzZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcE9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHRlbXBPYmoudXNlcklkID0gdXNlci5faWQ7XG4gICAgICAgICAgICAgICAgdGVtcE9iai51bmlxdWVJZCA9IHVzZXIudXNlcklkO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoubmFtZSA9IHVzZXIubmFtZTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLnBvcHVsYXJpdHkgPSB1c2VyLnBvcHVsYXJpdHk7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5lbWFpbCA9IHVzZXIuZW1haWw7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5jaGF0T25saW5lU3RhdHVzID0gdXNlci5jaGF0T25saW5lU3RhdHVzO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoucHJvZmlsZVBpYyA9IHVzZXIucHJvZmlsZVBpYyA/IHVzZXIucHJvZmlsZVBpYyA6ICcnO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoubWVzc2FnZUF2YWlsYWJsZSA9IHVzZXIubWVzc2FnZSA/IHVzZXIubWVzc2FnZSA6IDA7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5pc1N1YnNjcmliZWQgPSB1c2VyLmlzU3Vic2NyaWJlZDtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9ja1VzZXIxID8gdHJ1ZSA6IChjaGVja0Jsb2NrVXNlciA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5pc1NlbGZCbG9jayA9IGNoZWNrQmxvY2tVc2VyID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoubGFzdE1lc3NhZ2UgPSBjaGF0bGFzdG1lc3NhZ2UgPyAoQ2hhdGNsZWFyRmxhZyA9PSBmYWxzZSA/IGNoYXRsYXN0bWVzc2FnZS5tZXNzYWdlIDogJycpIDogJyc7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5tZXNzYWdlSWQgPSBjaGF0bGFzdG1lc3NhZ2UgPyBjaGF0bGFzdG1lc3NhZ2UuX2lkIDogJyc7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5pc1JlYWQgPSBjaGF0bGFzdG1lc3NhZ2UgPyBjaGF0bGFzdG1lc3NhZ2UuaXNSZWFkIDogMDtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLnNlbmRlcklkID0gY2hhdGxhc3RtZXNzYWdlID8gY2hhdGxhc3RtZXNzYWdlLnNlbmRlciA6ICcnO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoub25saW5lID0gdXNlci5sYXN0U2NyZWVuVGltZSA/IHVzZXIubGFzdFNjcmVlblRpbWUgOiAnJztcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLmxhc3RNZXNzYWdlVHlwZSA9IGNoYXRsYXN0bWVzc2FnZSA/IGNoYXRsYXN0bWVzc2FnZS50eXBlIDogJyc7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5sYXN0bWVzc2FnZVRpbWUgPSBjaGF0bGFzdG1lc3NhZ2UgPyBtb21lbnQoY2hhdGxhc3RtZXNzYWdlLmNyZWF0ZWRBdCkudHooXCJBc2lhL0tvbGthdGFcIikuZm9ybWF0KFwiaDptbSBhXCIpIDogJyc7XG4gICAgICAgICAgICAgICAgdGVtcE9iai51bnJlYWRNZXNzYWdlQ291bnQgPSB0b3RhbFVucmVhZE1lc3NhZ2UubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouY3JlYXRlZEF0ID1jaGF0bGFzdG1lc3NhZ2UgJiYgY2hhdGxhc3RtZXNzYWdlLmNyZWF0ZWRBdCA/IGNoYXRsYXN0bWVzc2FnZS5jcmVhdGVkQXQgOiBcIlwiO1xuXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VBcnJheS5wdXNoKHRlbXBPYmopO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW5uZXJcIiwgcmVzcG9uc2VBcnJheSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgICAgXG4gICAgICAgICAgICByZXNwb25zZUFycmF5ID0gXy5vcmRlckJ5KHJlc3BvbnNlQXJyYXksIFsnY3JlYXRlZEF0J10sIFsnZGVzYyddKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzcG9uc2VBcnJheSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGRkXCIsIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIGNoYXRCb2R5ID0gYXN5bmMgKHNlbmRlcklkLCByZWNlaXZlcklkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoc2VuZGVySWQpO1xuICAgICAgICAgICAgbGV0IHJlY2VpdmVyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChyZWNlaXZlcklkKTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlciwgeyBfaWQ6IHNlbmRlcklkIH0sIHsgY2hhdFRpbWU6IG5ldyBEYXRlKCksIGNoYXRPbmxpbmVTdGF0dXM6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3VzZXJJZCddO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdzZW5kZXInLCBzZWxlY3Q6IHBvcHVsYXRlUGFyYW1zXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3JlY2VpdmVyJywgc2VsZWN0OiBwb3B1bGF0ZVBhcmFtc1xuICAgICAgICAgICAgfV07XG5cblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShDaGF0LCB7ICdzZW5kZXInOiByZWNlaXZlcklkLCAncmVjZWl2ZXInOiBzZW5kZXJJZCB9LCB7IGlzUmVhZDogMiB9KTtcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi5saXN0KENoYXQsIHsgJG9yOiBbeyAnc2VuZGVyJzogc2VuZGVySWQgfSwgeyAnc2VuZGVyJzogcmVjZWl2ZXJJZCB9LCB7ICdyZWNlaXZlcic6IHNlbmRlcklkIH0sIHsgJ3JlY2VpdmVyJzogcmVjZWl2ZXJJZCB9XSwgaXNEZWxldGVkOiBmYWxzZSB9LCAnJywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLmxpc3QoQ2hhdCwge1xuICAgICAgICAgICAgICAgIFwic2VuZGVyXCI6IHsgJGluOiBbcmVjZWl2ZXJJZCwgc2VuZGVySWRdIH0sXG4gICAgICAgICAgICAgICAgXCJyZWNlaXZlclwiOiB7ICRpbjogW3JlY2VpdmVySWQsIHNlbmRlcklkXSB9LCBpc0RlbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCAnJywgcG9wdWxhdGVGaWVsZHMpO1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogc2VuZGVySWQsIGJsb2NrVXNlcklkOiByZWNlaXZlcklkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIxID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyBibG9ja1VzZXJJZDogc2VuZGVySWQsIHVzZXJJZDogcmVjZWl2ZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgbGV0IHJlc3BvbnNlQXJyYXkgPSBbXTtcblxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdG9yIG9mIHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrY2xlYXIgPSBhd2FpdCBDaGF0Y2xlYXIuZmluZE9uZSh7IHNlbmRlcklkOiBzZW5kZXJJZCwgcmVjZWl2ZXJJZDogcmVjZWl2ZXJJZCB9KS5zb3J0KHsgXCJjcmVhdGVkQXRcIjogXCItMVwiIH0pO1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tjbGVhciAmJiBuZXcgRGF0ZShjaGVja2NsZWFyLmNyZWF0ZWRBdCkuZ2V0VGltZSgpID4gbmV3IERhdGUoaXRlcmF0b3IuY3JlYXRlZEF0KS5nZXRUaW1lKCkpIHtcblxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHRlbXBPYmogPSB7fTtcblxuXG4gICAgICAgICAgICAgICAgdGVtcE9iai5pc1JlYWQgPSBpdGVyYXRvci5pc1JlYWQ7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5pc0RlbGV0ZWQgPSBpdGVyYXRvci5pc0RlbGV0ZWQ7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5faWQgPSBpdGVyYXRvci5faWQ7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5zZW5kZXIgPSBpdGVyYXRvci5zZW5kZXIgPyBpdGVyYXRvci5zZW5kZXIgOiB7fTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLnJlY2VpdmVyID0gaXRlcmF0b3IucmVjZWl2ZXIgPyBpdGVyYXRvci5yZWNlaXZlciA6IHt9O1xuICAgICAgICAgICAgICAgIHRlbXBPYmoubWVzc2FnZSA9IGl0ZXJhdG9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5jaGF0VGltZSA9IHJlY2VpdmVyRGV0YWlsLmNoYXRUaW1lO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouaXNDaGF0YmxvY2sgPSBjaGVja0Jsb2NrVXNlcjEgPyB0cnVlIDogKGNoZWNrQmxvY2tVc2VyID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLmNoYXRPbmxpbmVTdGF0dXMgPSByZWNlaXZlckRldGFpbC5jaGF0T25saW5lU3RhdHVzO1xuICAgICAgICAgICAgICAgIHRlbXBPYmoudHlwZSA9IGl0ZXJhdG9yLnR5cGU7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5jcmVhdGVkQXQgPSBtb21lbnQoaXRlcmF0b3IuY3JlYXRlZEF0KS50eihcIkFzaWEvS29sa2F0YVwiKS5mb3JtYXQoXCJoOm1tIGFcIik7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2VBcnJheS5wdXNoKHRlbXBPYmopXG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBsZXQgdXNlckFycmF5ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VBdmFpbGFibGU6IHVzZXJEZXRhaWwubWVzc2FnZSA/IHVzZXJEZXRhaWwubWVzc2FnZSA6IDAsXG4gICAgICAgICAgICAgICAgaXNTdWJzY3JpYmVkOiB1c2VyRGV0YWlsLmlzU3Vic2NyaWJlZCxcbiAgICAgICAgICAgICAgICBjaGF0VGltZTogcmVjZWl2ZXJEZXRhaWwuY2hhdFRpbWUsXG4gICAgICAgICAgICAgICAgY2hhdE9ubGluZVN0YXR1czogcmVjZWl2ZXJEZXRhaWwuY2hhdE9ubGluZVN0YXR1cyxcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4geyBjaGF0bGlzdDogcmVzcG9uc2VBcnJheSwgdXNlcjogdXNlckFycmF5IH07XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY2xlYXJjaGF0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgc2VuZGVySWQsIHJlY2VpdmVySWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICBsZXQgaW5zZXJ0RGF0YSA9IHtcbiAgICAgICAgICAgIHNlbmRlcklkOiBzZW5kZXJJZCxcbiAgICAgICAgICAgIHJlY2VpdmVySWQ6IHJlY2VpdmVySWQsXG4gICAgICAgIH1cbiAgICAgICAgbGV0IENoYXREZXRhaWwgPSBhd2FpdCBDb21tb24uY3JlYXRlKENoYXRjbGVhciwgaW5zZXJ0RGF0YSk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5DUkVBVEVEKSxcbiAgICAgICAgICAgIENoYXREZXRhaWwsXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICB9XG4gICAgY2hhdEJvZHlOZXcgPSBhc3luYyAoc2VuZGVySWQsIHJlY2VpdmVySWQpID0+IHtcblxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdXNlckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoc2VuZGVySWQpO1xuICAgICAgICAgICAgbGV0IHJlY2VpdmVyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChyZWNlaXZlcklkKTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlciwgeyBfaWQ6IHNlbmRlcklkIH0sIHsgY2hhdFRpbWU6IG5ldyBEYXRlKCksIGNoYXRPbmxpbmVTdGF0dXM6IHRydWUgfSk7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3VzZXJJZCddO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdzZW5kZXInLCBzZWxlY3Q6IHBvcHVsYXRlUGFyYW1zXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3JlY2VpdmVyJywgc2VsZWN0OiBwb3B1bGF0ZVBhcmFtc1xuICAgICAgICAgICAgfV07XG5cblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShDaGF0LCB7ICdzZW5kZXInOiByZWNlaXZlcklkLCAncmVjZWl2ZXInOiBzZW5kZXJJZCB9LCB7IGlzUmVhZDogMiB9KTtcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi5saXN0KENoYXQsIHsgJG9yOiBbeyAnc2VuZGVyJzogc2VuZGVySWQgfSwgeyAnc2VuZGVyJzogcmVjZWl2ZXJJZCB9LCB7ICdyZWNlaXZlcic6IHNlbmRlcklkIH0sIHsgJ3JlY2VpdmVyJzogcmVjZWl2ZXJJZCB9XSwgaXNEZWxldGVkOiBmYWxzZSB9LCAnJywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLmxpc3QoQ2hhdCwge1xuICAgICAgICAgICAgICAgIFwic2VuZGVyXCI6IHsgJGluOiBbcmVjZWl2ZXJJZCwgc2VuZGVySWRdIH0sXG4gICAgICAgICAgICAgICAgXCJyZWNlaXZlclwiOiB7ICRpbjogW3JlY2VpdmVySWQsIHNlbmRlcklkXSB9LCBpc0RlbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCAnJywgcG9wdWxhdGVGaWVsZHMpO1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogc2VuZGVySWQsIGJsb2NrVXNlcklkOiByZWNlaXZlcklkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIxID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyBibG9ja1VzZXJJZDogc2VuZGVySWQsIHVzZXJJZDogcmVjZWl2ZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgbGV0IHJlc3BvbnNlQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGxldCBjaGVja0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICBsZXQgaXNTZWxmQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIGNoZWNrQmxvY2sgPSBjaGVja0Jsb2NrVXNlcjEgPyB0cnVlIDogKGNoZWNrQmxvY2tVc2VyID8gdHJ1ZSA6IGZhbHNlKTtcbiAgICAgICAgICAgIGlzU2VsZkJsb2NrID0gY2hlY2tCbG9ja1VzZXIgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdG9yIG9mIHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrY2xlYXIgPSBhd2FpdCBDaGF0Y2xlYXIuZmluZE9uZSh7IHNlbmRlcklkOiBzZW5kZXJJZCwgcmVjZWl2ZXJJZDogcmVjZWl2ZXJJZCB9KS5zb3J0KHsgXCJjcmVhdGVkQXRcIjogXCItMVwiIH0pO1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tjbGVhciAmJiBuZXcgRGF0ZShjaGVja2NsZWFyLmNyZWF0ZWRBdCkuZ2V0VGltZSgpID4gbmV3IERhdGUoaXRlcmF0b3IuY3JlYXRlZEF0KS5nZXRUaW1lKCkpIHtcblxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IHRlbXBPYmogPSB7fTtcblxuICAgICAgICAgICAgICAgIGxldCBjaGVja0RlbGV0ZU1lc3NhZ2UgPSBhd2FpdCBDaGF0TWVzc2FnZURlbGV0ZS5maW5kT25lKHsgXCJjaGF0XCI6IGl0ZXJhdG9yLl9pZCwgZGVsZXRlZEJ5VXNlcjogc2VuZGVySWQgfSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJjaGF0X2lkXCIsaXRlcmF0b3IuX2lkKVxuICAgICAgICAgICAgICAgIGlmIChjaGVja0RlbGV0ZU1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJEXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIHRlbXBPYmouaXNSZWFkID0gaXRlcmF0b3IuaXNSZWFkO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouaXNEZWxldGVkID0gaXRlcmF0b3IuaXNEZWxldGVkO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouX2lkID0gaXRlcmF0b3IuX2lkO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouc2VuZGVyID0gaXRlcmF0b3Iuc2VuZGVyID8gaXRlcmF0b3Iuc2VuZGVyIDoge307XG4gICAgICAgICAgICAgICAgdGVtcE9iai5yZWNlaXZlciA9IGl0ZXJhdG9yLnJlY2VpdmVyID8gaXRlcmF0b3IucmVjZWl2ZXIgOiB7fTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLm1lc3NhZ2UgPSBpdGVyYXRvci5tZXNzYWdlO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouY2hhdFRpbWUgPSByZWNlaXZlckRldGFpbC5jaGF0VGltZTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9jaztcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLmlzU2VsZkJsb2NrID0gaXNTZWxmQmxvY2s7XG4gICAgICAgICAgICAgICAgdGVtcE9iai5jaGF0T25saW5lU3RhdHVzID0gcmVjZWl2ZXJEZXRhaWwuY2hhdE9ubGluZVN0YXR1cztcbiAgICAgICAgICAgICAgICB0ZW1wT2JqLnR5cGUgPSBpdGVyYXRvci50eXBlO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouY3JlYXRlZEF0ID0gbW9tZW50KGl0ZXJhdG9yLmNyZWF0ZWRBdCkudHooXCJBc2lhL0tvbGthdGFcIikuZm9ybWF0KFwiaDptbSBhXCIpO1xuICAgICAgICAgICAgICAgIHRlbXBPYmouY3JlYXRlZERhdGUgPSBtb21lbnQoaXRlcmF0b3IuY3JlYXRlZEF0KS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlQXJyYXkucHVzaCh0ZW1wT2JqKVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbmV3QXJyYXkgPSBfLmdyb3VwQnkocmVzcG9uc2VBcnJheSwgXCJjcmVhdGVkRGF0ZVwiKTtcbiAgICAgICAgICAgIGxldCBmaW5hbEFycmF5ID0gW107XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhuZXdBcnJheSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgdGVtcE9iajEgPSB7fTtcbiAgICAgICAgICAgICAgICB0ZW1wT2JqMS5kYXRlID0ga2V5O1xuICAgICAgICAgICAgICAgIHRlbXBPYmoxLmNoYXQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmaW5hbEFycmF5LnB1c2godGVtcE9iajEpO1xuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgbGV0IHVzZXJBcnJheSA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlQXZhaWxhYmxlOiB1c2VyRGV0YWlsLm1lc3NhZ2UgPyB1c2VyRGV0YWlsLm1lc3NhZ2UgOiAwLFxuICAgICAgICAgICAgICAgIGlzU3Vic2NyaWJlZDogdXNlckRldGFpbC5pc1N1YnNjcmliZWQsXG4gICAgICAgICAgICAgICAgY2hhdFRpbWU6IHJlY2VpdmVyRGV0YWlsLmNoYXRUaW1lLFxuICAgICAgICAgICAgICAgIGNoYXRPbmxpbmVTdGF0dXM6IHJlY2VpdmVyRGV0YWlsLmNoYXRPbmxpbmVTdGF0dXMsXG4gICAgICAgICAgICAgICAgaXNDaGF0YmxvY2s6IGNoZWNrQmxvY2ssXG4gICAgICAgICAgICAgICAgaXNTZWxmQmxvY2s6IGlzU2VsZkJsb2NrLFxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7IGNoYXRsaXN0OiBmaW5hbEFycmF5LCB1c2VyOiB1c2VyQXJyYXkgfTtcbiAgICAgICAgICAgIC8vICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgZmluYWxBcnJheSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcblxuICAgICAgICB9XG4gICAgfTtcbiAgICBkZWxldGVVc2VyRnJvbUNoYXRVc2VybGlzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBjb25zdCB7IHNlbmRlcklkLCByZWNlaXZlcklkIH0gPSByZXEuYm9keTtcbiAgICAgICAgbGV0IGluc2VydERhdGEgPSB7XG4gICAgICAgICAgICBzZW5kZXJJZDogc2VuZGVySWQsXG4gICAgICAgICAgICByZWNlaXZlcklkOiByZWNlaXZlcklkLFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IENoYXREZXRhaWwxID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShDaGF0Y2xlYXIsIGluc2VydERhdGEpO1xuICAgICAgICBsZXQgQ2hhdERldGFpbCA9IGF3YWl0IENvbW1vbi5jcmVhdGUoQ2hhdFVzZXJEZWxldGUsIGluc2VydERhdGEpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuQ1JFQVRFRCksXG4gICAgICAgICAgICBDaGF0RGV0YWlsLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgfVxuXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IENoYXRDb250cm9sbGVyKCk7XG4iXX0=