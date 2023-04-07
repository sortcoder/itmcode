"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _User = _interopRequireDefault(require("../Models/User"));

var _InviteHistory = _interopRequireDefault(require("../Models/InviteHistory"));

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

var _GiveAway = _interopRequireDefault(require("../Models/GiveAway"));

var _Gifts = _interopRequireDefault(require("../Models/Gifts"));

var _SendGifts = _interopRequireDefault(require("../Models/SendGifts"));

var _UserSubscription = _interopRequireDefault(require("../Models/UserSubscription"));

var _MembershipPlans = _interopRequireDefault(require("../Models/MembershipPlans"));

var _Banners = _interopRequireDefault(require("../Models/Banners"));

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _RequestHelper = require("../Helper/RequestHelper");

var _bcryptjs = require("bcryptjs");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _CommonService = _interopRequireDefault(require("../Service/CommonService"));

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

var _Like = _interopRequireDefault(require("../Models/Like"));

var _InviteRewards = _interopRequireDefault(require("../Models/InviteRewards"));

var _UserDeleteRequest = _interopRequireDefault(require("../Models/UserDeleteRequest"));

var _UserGiftPlan = _interopRequireDefault(require("../Models/UserGiftPlan"));

var _Chatblock = _interopRequireDefault(require("../Models/Chatblock"));

var _Chat = _interopRequireDefault(require("../Models/Chat"));

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  User Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['name', 'email', 'mobile', 'referCode', 'gender', 'dob', 'status', 'smoker', 'drunker', 'createdAt', 'profilePic', 'popularity', 'wallet', 'isSubscribed', 'isEmailVerified', 'isMobileVerified', 'isProfilePicVerified', 'myVisitors', 'followers', 'followings', 'likes', 'country', 'state', 'district', 'religion', 'status', 'aboutStatus', 'relationshipStatus', 'lookingFor', 'bloodGroup', 'height', 'bodyType', 'education', 'workspace', 'recentSearches', 'userId', 'deviceId', 'platform', 'isDistrict', 'isBloodGroup', 'age', 'isAge', 'isHeight', 'isBodyType', 'isSmoker', 'isDrunker', 'isEducation', 'isWorkspace', 'usersSubId', 'latitude', 'longitude', 'isBlocked', 'kycImage', 'lastScreenTime', "kycStatus", "message", "mailVerifyOtp", "isMailVerified"];
var listParams = ['name', 'email', 'mobile', 'userId', 'dob', 'age', 'gender', 'profilePic', 'country', 'state', 'district', 'religion', 'isProfilePicVerified', 'wallet', 'popularity', 'usersSubId', 'isSubscribed', 'latitude', 'longitude', 'isBlocked', 'likes', 'kycImage', 'createdAt', 'lastScreenTime', 'message', "mailVerifyOtp", "isMailVerified"];

class UserController {
  constructor() {
    var _this = this;

    _defineProperty(this, "index", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id2
          } = req.user;
          var {
            type,
            search,
            name,
            country,
            state,
            minAge,
            maxAge,
            district,
            gender,
            religion,
            relationshipStatus,
            education,
            kycStatus,
            latitude,
            longitude,
            maxRange
          } = req.query;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id2, ['name', 'likes', 'gender', 'role']);
          var query = {
            _id: {
              $ne: _id2
            },
            isDeleted: false
          };
          var sort = '';
          var limit = '';
          var loginUserId = _id2;
          yield _CommonDbController.default.update(_User.default, {
            _id: _id2
          }, {
            chatOnlineStatus: true,
            chatTime: new Date()
          });
          var chatlastmessage = yield _Chat.default.findOne({
            'receiver': loginUserId,
            isRead: 0
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

          if (type === 'best') {
            query.isSubscribed = true;
          } else if (type === 'suggest') {
            /*   if (latitude) {
                  query.location = {
                      $near: {
                          $maxDistance: maxRange ? 500000 : 50000, // distence in meter
                          $geometry: {
                              type: "Point",
                                 coordinates: [parseFloat(latitude), parseFloat(longitude)]
                          }
                      }
                  };
                 } */
          } else {
            if (latitude) {
              var location = {
                type: "Point",
                coordinates: [parseFloat(latitude), parseFloat(longitude)]
              };
              yield _CommonDbController.default.update(_User.default, {
                _id: _id2
              }, {
                location: location,
                latitude: latitude,
                longitude: longitude
              });
              query.location = {
                $near: {
                  $maxDistance: 50000,
                  // distence in meter
                  $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(latitude), parseFloat(longitude)]
                  }
                }
              };
            }
          }

          if (name) query.name = {
            $regex: name,
            $options: "i"
          };

          if (maxAge > 0) {
            var dateS = new Date();
            var date = new Date();
            date.setFullYear(date.getFullYear() - maxAge);
            var maxTime = date.getTime();
            dateS.setFullYear(dateS.getFullYear() - minAge);
            var minTime = dateS.getTime();
            query.dob = {
              $gte: maxTime,
              $lte: minTime
            };
          } // if (country)
          //     query.country = country;
          // if (state)
          //     query.state = state;
          // if (district)
          //     query.district = district;


          if (gender) {
            query.gender = gender;
          } else if (loggedInUser.role == "admin") {} else if (name) {} else {
            query.gender = {
              $ne: loggedInUser.gender
            };
          }

          if (religion) query.religion = religion;
          if (relationshipStatus && relationshipStatus.length) query.relationshipStatus = {
            $in: relationshipStatus
          };
          if (education) query.education = education;

          if (search) {
            query['$and'] = [{
              $or: [{
                name: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                mobile: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                email: {
                  $regex: search,
                  $options: "i"
                }
              }]
            }];
          }

          query.role = "user";

          if (kycStatus) {
            query.kycStatus = kycStatus;
          }

          console.log(query, "query");
          var populatePrams = ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'gender', 'isSubscribed'];
          var populateFields = {
            path: 'likes',
            select: populatePrams
          };
          var users = [];

          if (type === 'suggest') {
            var allusers = yield _User.default.find(query, listParams).populate(populateFields);
            var totaluser = allusers.length;
            var Avg = totaluser / 2;
            var skip = Math.floor(Math.random() * Avg);
            users = yield _User.default.find(query, listParams).populate(populateFields).skip(skip);
          } else if (type === 'best') {
            var _allusers = yield _User.default.find(query, listParams).populate(populateFields);

            var _totaluser = _allusers.length;

            var _Avg = _totaluser / 2;

            var _skip = Math.floor(Math.random() * _Avg);

            users = yield _User.default.find(query, listParams).populate(populateFields).skip(_skip);
          } else {
            users = yield _CommonDbController.default.list(_User.default, query, listParams, populateFields, sort, limit);
          }

          if (users && users.length) {
            var arr = [];

            for (var obj of users) {
              obj = obj.toObject();
              var secUserId = obj._id;
              obj.dob = obj.dob ? yield _CommonService.default.convertTimeToDate(obj.dob) : '';
              obj.age = obj.age || (yield _CommonService.default.getAge(obj.dob));
              obj.isLike = loggedInUser.likes.includes(obj._id);
              obj.likedBy = yield _CommonDbController.default.list(_User.default, {
                likes: {
                  $in: obj._id
                }
              }, populatePrams);
              var checkBlockUser = yield _Chatblock.default.findOne({
                userId: _id2,
                blockUserId: secUserId,
                isDeleted: false
              });
              var checkBlockUser1 = yield _Chatblock.default.findOne({
                blockUserId: _id2,
                userId: secUserId,
                isDeleted: false
              });
              obj.latitude = obj.latitude === 0 ? 1.1 : obj.latitude;
              obj.userUniqueId = obj.userId;
              obj.longitude = obj.longitude === 0 ? 1.1 : obj.longitude;
              obj.isChatblock = checkBlockUser1 ? true : checkBlockUser ? true : false;
              obj.matchCount = 0;
              obj.matches = [];
              obj.friendCount = [];
              obj.friend = [];

              if (obj.likes && obj.likes.length) {
                for (var like of obj.likes) {
                  var data = yield _CommonDbController.default.findSingle(_User.default, {
                    _id: like._id,
                    likes: {
                      $in: [obj._id]
                    }
                  }, ['_id', 'gender', 'name']);

                  if (data && data._id) {
                    obj.friendCount = obj.matchCount + 1;
                    obj.friend.push(like);
                  }

                  console.log(obj.gender, "-");
                  console.log(data);

                  if (data && data._id && data.gender && obj.gender !== data.gender) {
                    obj.matchCount = obj.matchCount + 1;
                    obj.matches.push(like);
                  }
                }
              }

              arr.push(obj);
            }

            users = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, users);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "indexold", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id3
          } = req.user;
          var {
            type,
            search,
            name,
            country,
            state,
            minAge,
            maxAge,
            district,
            gender,
            religion,
            relationshipStatus,
            education,
            kycStatus
          } = req.query;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id3, ['name', 'likes', 'gender']);
          var query = {
            _id: {
              $ne: _id3
            },
            isDeleted: false
          };
          var sort = '';
          var limit = '';

          if (type === 'best') {
            query.isSubscribed = true;
          }

          if (type === 'suggest') {// const today = new Date();
            // query.createdAt = {$lte: new Date().setDate(today.getDate() - 30)};
            // query.createdAt = {$lte: new Date("2021-0").setDate(today.getDate() - 30)};
          }

          if (name) query.name = {
            $regex: name,
            $options: "i"
          };
          if (minAge > 0 && maxAge > 0) query.age = {
            $gte: minAge,
            $lte: maxAge
          };
          if (country) query.country = country;
          if (state) query.state = state;
          if (district) query.district = district;
          if (gender) query.gender = gender;
          if (religion) query.religion = religion;
          if (relationshipStatus && relationshipStatus.length) query.relationshipStatus = {
            $in: relationshipStatus
          };
          if (education) query.education = education;

          if (search) {
            query['$and'] = [{
              $or: [{
                name: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                mobile: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                email: {
                  $regex: search,
                  $options: "i"
                }
              }]
            }];
          }

          query.role = "user";

          if (kycStatus) {
            query.kycStatus = kycStatus;
          }

          var populatePrams = ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', 'gender', 'isSubscribed'];
          var populateFields = {
            path: 'likes',
            select: populatePrams
          };
          var users = [];

          if (type === 'suggest') {
            var allusers = yield _User.default.find(query, listParams).populate(populateFields);
            var totaluser = allusers.length;
            var Avg = totaluser / 2;
            var skip = Math.floor(Math.random() * Avg);
            users = yield _User.default.find(query, listParams).populate(populateFields).skip(skip);
          } else {
            users = yield _CommonDbController.default.list(_User.default, query, listParams, populateFields, sort, limit);
          }

          if (users && users.length) {
            var arr = [];

            for (var obj of users) {
              obj = obj.toObject();
              obj.dob = obj.dob ? yield _CommonService.default.convertTimeToDate(obj.dob) : '';
              obj.age = obj.age || (yield _CommonService.default.getAge(obj.dob));
              obj.isLike = loggedInUser.likes.includes(obj._id);
              obj.likedBy = yield _CommonDbController.default.list(_User.default, {
                likes: {
                  $in: obj._id
                }
              }, populatePrams);
              obj.latitude = obj.latitude === 0 ? 1.1 : obj.latitude;
              obj.longitude = obj.longitude === 0 ? 1.1 : obj.longitude;
              obj.matchCount = 0;
              obj.matches = [];
              obj.friendCount = [];
              obj.friend = [];

              if (obj.likes && obj.likes.length) {
                for (var like of obj.likes) {
                  var data = yield _CommonDbController.default.findSingle(_User.default, {
                    _id: like._id,
                    likes: {
                      $in: [obj._id]
                    }
                  }, ['_id', 'gender', 'name']);

                  if (data && data._id) {
                    obj.friendCount = obj.matchCount + 1;
                    obj.friend.push(like);
                  }

                  console.log(obj.gender, "-");
                  console.log(data);

                  if (data && data._id && data.gender && obj.gender !== data.gender) {
                    obj.matchCount = obj.matchCount + 1;
                    obj.matches.push(like);
                  }
                }
              }

              arr.push(obj);
            }

            users = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, users);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "kycrequest", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id4
          } = req.user;
          var {
            type,
            search,
            name,
            country,
            state,
            minAge,
            maxAge,
            district,
            gender,
            religion,
            relationshipStatus,
            education,
            kycStatus
          } = req.query;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id4, ['name', 'likes']);
          var query = {
            _id: {
              $ne: _id4
            },
            kycImage: {
              $ne: null
            },
            isProfilePicVerified: false,
            isDeleted: false,
            kycStatus: "pending"
          };

          if (type === 'best') {
            query.isSubscribed = true;
          }

          if (type === 'suggest') {// const today = new Date();
            // query.createdAt = {$lte: new Date().setDate(today.getDate() - 30)};
            // query.createdAt = {$lte: new Date("2021-0").setDate(today.getDate() - 30)};
          }

          if (name) query.name = {
            $regex: name,
            $options: "i"
          };
          if (minAge > 0 && maxAge > 0) query.age = {
            $gte: minAge,
            $lte: maxAge
          };
          if (country) query.country = country;
          if (state) query.state = state;
          if (district) query.district = district;
          if (gender) query.gender = gender;
          if (religion) query.religion = religion;
          if (relationshipStatus && relationshipStatus.length) query.relationshipStatus = {
            $in: relationshipStatus
          };
          if (education) query.education = education;

          if (search) {
            query['$and'] = [{
              $or: [{
                name: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                mobile: {
                  $regex: search,
                  $options: "i"
                }
              }, {
                email: {
                  $regex: search,
                  $options: "i"
                }
              }]
            }];
          }

          if (kycStatus) {
            query.kycStatus = kycStatus;
          }

          query.role = "user";
          console.log(query);
          var populatePrams = ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified'];
          var populateFields = {
            path: 'likes',
            select: populatePrams
          };
          var users = yield _CommonDbController.default.list(_User.default, query, listParams, populateFields);

          if (users && users.length) {
            var arr = [];

            for (var obj of users) {
              obj = obj.toObject();
              obj.dob = obj.dob ? yield _CommonService.default.convertTimeToDate(obj.dob) : '';
              obj.age = obj.age || (yield _CommonService.default.getAge(obj.dob));
              obj.isLike = loggedInUser.likes.includes(obj._id);
              obj.likedBy = yield _CommonDbController.default.list(_User.default, {
                likes: {
                  $in: obj._id
                }
              }, populatePrams);
              obj.matchCount = 0;
              obj.matches = [];

              if (obj.likes && obj.likes.length) {
                for (var like of obj.likes) {
                  var data = yield _CommonDbController.default.findSingle(_User.default, {
                    _id: like._id,
                    likes: {
                      $in: [obj._id]
                    }
                  }, ['_id']);

                  if (data && data._id) {
                    obj.matchCount = obj.matchCount + 1;
                    obj.matches.push(like);
                  }
                }
              }

              arr.push(obj);
            }

            users = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, users);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "single", /*#__PURE__*/function () {
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
            _id: _id5
          } = req.user;
          yield _CommonDbController.default.update(_User.default, {
            _id: _id5
          }, {
            lastScreenTime: new Date(),
            chatOnlineStatus: true,
            chatTime: new Date()
          });
          var populatePrams = ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', "popularity", "mailVerifyOtp", "isMailVerified", 'isMobileVerified'];
          var populateFields = [{
            path: 'recentSearches',
            select: populatePrams
          }, {
            path: 'myVisitors',
            select: populatePrams
          }, {
            path: 'followers',
            select: populatePrams
          }, {
            path: 'followings',
            select: populatePrams
          }, {
            path: 'likes',
            select: populatePrams
          }];
          var checkBlockUser = yield _Chatblock.default.findOne({
            userId: _id5,
            blockUserId: id,
            isDeleted: false
          });
          var checkBlockUser1 = yield _Chatblock.default.findOne({
            blockUserId: _id5,
            userId: id,
            isDeleted: false
          }); // Find user details

          var _user = yield _CommonDbController.default.findById(_User.default, id, params, populateFields);

          _user = _user.toObject();
          _user.age = _user.age || (yield _CommonService.default.getAge(_user.dob));
          _user.dob = yield _CommonService.default.convertTimeToDate(_user.dob);
          _user.likedBy = yield _CommonDbController.default.list(_User.default, {
            likes: {
              $in: _user._id
            }
          }, populatePrams);
          _user.isChatblock = checkBlockUser1 ? true : checkBlockUser ? true : false;
          _user.matchCount = 0;
          _user.matches = [];
          _user.friendCount = 0;
          _user.friend = [];
          var newDate = '';

          if (_user.likes && _user.likes.length) {
            for (var obj of _user.likes) {
              var data = yield _CommonDbController.default.findSingle(_User.default, {
                _id: obj._id,
                likes: {
                  $in: [id]
                }
              }, ['_id', "gender"]);

              if (data && data._id) {
                _user.friendCount = _user.friendCount + 1;

                _user.friend.push(obj);
              }

              if (data && data._id && data.gender && _user.gender !== data.gender) {
                _user.matchCount = _user.matchCount + 1;

                _user.matches.push(obj);
              }
            }
          }

          if (_user.isSubscribed) {
            var sub = yield _UserSubscription.default.find({
              userId: id
            }).populate({
              path: 'planId',
              select: 'name amount validity bonus createdAt'
            }).sort({
              "createdAt": -1
            }).limit(1);
            var planDate = new Date(sub[0].createdAt);

            var _date = planDate.setDate(planDate.getDate() + parseInt(sub[0].planId.validity, 10));

            newDate = new Date(_date);
            sub[0].expireDate = newDate; //if package is expire

            if (newDate.getTime() < new Date().getTime()) {
              _user.subscription = [];
              _user.isSubscribed = false;
            } else {
              _user.subscription = sub;
            }

            yield _this.reviewProfilenew(id, _id5);
            console.log(1);
          } else {
            yield _this.reviewProfilenewUnsub(id, _id5);
          }

          _user.settings = yield _CommonDbController.default.findSingle(_UserSettings.default, {
            userId: _user._id
          });
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id5, ['recentSearches', 'likes']);

          if (id.toString() !== _id5.toString()) {
            loggedInUser = loggedInUser.toObject();

            if (loggedInUser && loggedInUser.recentSearches && loggedInUser.recentSearches.length) {
              var index = loggedInUser.recentSearches.findIndex(e => e.toString() === id.toString());

              if (index === -1) {
                loggedInUser.recentSearches.push(id);
              }
            } else {
              loggedInUser.recentSearches = [id];
            }

            yield _CommonDbController.default.update(_User.default, {
              _id: _id5
            }, {
              recentSearches: loggedInUser.recentSearches
            });
          } else {
            _user.banner = yield _CommonDbController.default.findSingle(_Banners.default, {
              type: '3 Line Banner',
              isDeleted: false
            }, ['link', 'image']);
          }

          var today = new Date();
          var date = new Date(new Date().setDate(today.getDate() - 30));
          _user.suggestedUser = yield _User.default.find({
            _id: {
              $nin: [_id5, id]
            },
            createdAt: {
              $gte: date
            },
            isDeleted: false
          }, listParams);
          _user.isLike = false;

          for (var _obj of loggedInUser.likes) {
            if (_obj.toString() === _user._id.toString()) {
              _user.isLike = true;
              break;
            }
          }

          var LikesAll = yield _CommonDbController.default.list(_Like.default, {
            userliketo: _id5,
            isDeleted: false,
            status: "pending"
          }, params, {
            path: 'userlikeby',
            select: populatePrams
          });
          var likeArray = [];

          for (var likeval of LikesAll) {
            if (likeval.userlikeby) {
              var tempObj = {
                isProfilePicVerified: likeval.userlikeby ? likeval.userlikeby.isProfilePicVerified : false,
                _id: likeval.userlikeby._id,
                mobile: likeval.userlikeby.mobile,
                name: likeval.userlikeby.name,
                email: likeval.userlikeby.email,
                userId: likeval.userlikeby.userId,
                country: likeval.userlikeby.country,
                district: likeval.userlikeby.district,
                profilePic: likeval.userlikeby.profilePic,
                popularity: likeval.userlikeby.popularity,
                likeId: likeval._id
              };
              likeArray.push(tempObj);
            }
          } // get expire time string


          var startTime = new Date(newDate);
          var currenttime = (0, _momentTimezone.default)(new Date());
          var packageExpireDate = (0, _momentTimezone.default)(startTime);

          var duration = _momentTimezone.default.duration(packageExpireDate.diff(currenttime));

          var days = duration.asDays();
          var expireText = "EXPIRED";

          if (days >= 0) {
            days = parseInt(days);
            expireText = days + " Day Left";
          } // get onlin time string


          var onlineTime = new Date(_user.lastScreenTime);
          var onlineTimeMoment = (0, _momentTimezone.default)(onlineTime);

          var durationOnline = _momentTimezone.default.duration(currenttime.diff(onlineTimeMoment));

          var daysOnline = durationOnline.asDays();
          var minOnline = durationOnline.asMinutes();
          var hourOnline = durationOnline.asHours();
          var secOnline = durationOnline.asSeconds();
          var OnlineFinalTime = 'Online';
          console.log(daysOnline);
          daysOnline = parseInt(daysOnline);
          hourOnline = parseInt(hourOnline);
          minOnline = parseInt(minOnline);

          if (daysOnline > 0) {
            OnlineFinalTime = daysOnline + " day ago";
          } else if (hourOnline > 0) {
            OnlineFinalTime = hourOnline + " hour ago";
          } else if (minOnline > 1) {
            OnlineFinalTime = minOnline + " min ago";
          }
          /* else if(secOnline > 30)
          {
              secOnline=parseInt(secOnline);
              OnlineFinalTime=secOnline+ " sec ago";
          } */


          console.log(daysOnline, "daysOnline");
          console.log(minOnline, "minOnline");
          console.log(_user.lastScreenTime, "user.lastScreenTime");
          console.log(OnlineFinalTime, "OnlineFinalTime");
          _user.lastScreenTime = OnlineFinalTime;
          _user.likedBy = likeArray;
          _user.expireDate = expireText;
          _user.country = _user.country ? _user.country : 'India'; // Send response

          return (0, _RequestHelper.buildResult)(res, 200, _user);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "changePassword", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            oldPassword,
            password
          } = req.body;
          var {
            _id: _id6
          } = req.user;
          console.log(_id6); // Find user details

          var _user2 = yield _CommonDbController.default.findById(_User.default, _id6, ['_id', 'password', 'role']);

          if (_user2.role != "admin") {
            if (!oldPassword || !password) {
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: req.t(_constants.default.INADEQUATE_DATA)
              });
            }
          } // Returns error if user not exists


          if (!_user2) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          if (_user2.role != "admin") {
            if (!(0, _bcryptjs.compareSync)(oldPassword.toString(), _user2.password)) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.WRONG_PASSWORD)
            });
          }

          req.body.password = (0, _bcryptjs.hashSync)(password.toString());
          yield _CommonDbController.default.update(_User.default, {
            _id: _user2._id
          }, {
            password: req.body.password
          });
          var result = {
            message: 'Password Changed'
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "update", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
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
            _id: _id7
          } = req.user;
          var {
            email,
            dob,
            userId
          } = req.body;
          req.body.updatedBy = _id7;

          if (dob) {
            req.body.dob = new Date(dob).getTime();
          }

          if (userId) {
            var myquery = {
              userId: userId,
              _id: {
                $ne: _id7
              }
            };
            console.log(myquery);
            var letcheckUserName = yield _User.default.findOne(myquery);

            if (letcheckUserName) {
              return (0, _RequestHelper.buildResult)(res, 600, {}, {}, {
                message: "Username Already In Use. Please Choose Another Username"
              });
            }
          } // Check if user exists or not


          var _user3 = yield _CommonDbController.default.findById(_User.default, _id7, ['_id', 'profilePic', 'kycImage']); // Returns error if user id is invalid


          if (!_user3) {
            if (req.files) {
              var fileKeys = Object.keys(req.files);
              fileKeys.forEach(function (key) {
                if (req.files[key] && req.files[key].length) {
                  _fs.default.unlink(dir + '/' + req.files[key][0].filename, err => {
                    if (err) console.log(err);
                  });
                }
              });
            }

            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INVALID_ID)
            });
          }

          if (email) {
            // Check user exists or not for the email
            var data = yield _CommonDbController.default.findSingle(_User.default, {
              email,
              _id: {
                $ne: _id7
              },
              isDeleted: false
            }, '_id');

            if (data && data._id) {
              // Returns error if email already exists
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: req.t(_constants.default.EMAIL_ALREADY_EXISTS)
              });
            }
          }

          if (req.files && Object.keys(req.files).length) {
            var _fileKeys = Object.keys(req.files);

            _fileKeys.forEach(function (key) {
              if (req.files[key] && req.files[key].length) {
                if (key === 'kycImage') {
                  req.body.isProfilePicVerified = false;
                }

                if (_user3 && _user3[key]) {
                  var splitFile = _user3[key].split('/');

                  var file = splitFile[splitFile.length - 1];

                  _fs.default.unlink(dir + '/' + file, err => {
                    if (err) console.log(err);
                  });
                }

                req.body[key] = process.env.IMAGE_URL + folderName + '/' + req.files[key][0].filename;
              }
            });
          }

          if (req.body.longitude) {
            req.body.location = {
              type: "Point",
              coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
            };
          }

          console.log(req.body.location); // Update user data

          var result = yield _CommonDbController.default.update(_User.default, {
            _id: _id7
          }, req.body); // Send response

          result.message = req.t(result.message);
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

    _defineProperty(this, "updateUserByAdmin", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
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
          var {
            email,
            dob
          } = req.body;
          req.body.updatedBy = _id;

          if (dob) {
            req.body.dob = new Date(dob).getTime();
          } // Check if user exists or not


          var _user4 = yield _CommonDbController.default.findById(_User.default, id, ['_id', 'profilePic']); // Returns error if user id is invalid


          if (!_user4) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          });

          if (email) {
            // Check user exists or not for the email
            var data = yield _CommonDbController.default.findSingle(_User.default, {
              email,
              _id: {
                $ne: id
              },
              isDeleted: false
            }, '_id');

            if (data && data._id) {
              // Returns error if email already exists
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: req.t(_constants.default.EMAIL_ALREADY_EXISTS)
              });
            }
          }

          if (req.file && req.file.filename) {
            // Delete old file if new file is there to upload
            if (_user4 && _user4.profilePic) {
              var splitFile = _user4.profilePic.split('/');

              var file = splitFile[splitFile.length - 1];

              _fs.default.unlink(dir + '/' + file, err => {
                if (err) console.log(err);
              });
            } // Set path for new file


            req.body.profilePic = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
          } // Update user data


          var result = yield _CommonDbController.default.update(_User.default, {
            _id: id
          }, req.body); // Send response

          result.message = req.t(result.message);
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }());

    _defineProperty(this, "remove", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* (req, res) {
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

          var _user5 = yield _CommonDbController.default.findById(_User.default, id, ['_id']); // Returns error if user is invalid


          if (!_user5) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_ID)
          }); // Soft delete user
          // await Common.update(UserModel, { _id: id }, { isDeleted: true, updatedBy: req.user._id });

          yield _User.default.deleteOne({
            _id: id
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

      return function (_x15, _x16) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "matchProfile", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            userId
          } = req.params;
          var {
            _id: _id8
          } = req.user;
          var matchParams = ['relationshipStatus', 'lookingFor', 'bloodGroup', 'height', 'bodyType', 'smoker', 'drunker', 'education', 'workspace', 'country', 'state', 'district'];
          var selfData = yield _CommonDbController.default.findById(_User.default, _id8, matchParams);
          var partnerInfo = yield _CommonDbController.default.findById(_User.default, userId, matchParams);
          selfData = selfData.toObject();
          partnerInfo = partnerInfo.toObject();
          var total = Object.keys(selfData).length - 1;
          var matchCounts = 0;

          for (var [key, value] of Object.entries(selfData)) {
            if (key !== "_id" && partnerInfo[key] === value) matchCounts++;
          }

          var percentage = (matchCounts / total * 100).toFixed(2) + '%';
          return (0, _RequestHelper.buildResult)(res, 200, {
            message: "Profile Matched",
            percentage
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x17, _x18) {
        return _ref9.apply(this, arguments);
      };
    }());

    _defineProperty(this, "followUnfollowUser", /*#__PURE__*/function () {
      var _ref10 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            userId
          } = req.params;
          var {
            _id: _id9
          } = req.user;
          var selfData = yield _CommonDbController.default.findById(_User.default, _id9, ['name', 'followings']);
          var partnerInfo = yield _CommonDbController.default.findById(_User.default, userId, ['name', 'followers', 'deviceToken']);
          var followIndex = selfData.followings.indexOf(partnerInfo._id);
          var followerIndex = partnerInfo.followers.indexOf(selfData._id);
          selfData = selfData.toObject();
          partnerInfo = partnerInfo.toObject();
          var message = '';
          var flag = true;

          if (followIndex === -1) {
            selfData.followings.push(partnerInfo._id);
            partnerInfo.followers.push(selfData._id);
            message = "You are following ".concat(partnerInfo.name);
          } else {
            selfData.followings.splice(followIndex, 1);
            partnerInfo.followers.splice(followerIndex, 1);
            message = "You are unfollowing ".concat(partnerInfo.name);
            flag = false;
          }

          yield _CommonDbController.default.update(_User.default, {
            _id: selfData._id
          }, {
            followings: selfData.followings
          });
          yield _CommonDbController.default.update(_User.default, {
            _id: partnerInfo._id
          }, {
            followers: partnerInfo.followers
          });

          if (partnerInfo.deviceToken) {
            var notificationData = {
              toUser: userId,
              fromUser: _id9,
              title: flag ? " has started following you." : " is now not following you.",
              message: flag ? " has started following you." : " is now not following you.",
              deviceToken: partnerInfo.deviceToken,
              createdBy: _id9,
              updatedBy: _id9
            };
            yield _Notifications.default.sendNotification(notificationData);
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x19, _x20) {
        return _ref10.apply(this, arguments);
      };
    }());

    _defineProperty(this, "reviewProfile", /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            userId
          } = req.params;
          var {
            _id: _id10
          } = req.user;

          var loggedInUser = _CommonDbController.default.findById(_User.default, _id10, ['name']);

          var userData = _CommonDbController.default.findById(_User.default, userId, ['myVisitors', 'deviceToken']);

          if (userData.myVisitors && userData.myVisitors.length) {
            var index = userData.myVisitors.indexOf(_id10);

            if (index === -1) {
              userData.myVisitors.push(_id10);
            }
          } else {
            userData.myVisitors = [_id10];
          }

          yield _CommonDbController.default.update(_User.default, {
            _id: userId
          }, {
            myVisitors: userData.myVisitors
          });
          var reviewedUser = yield _CommonDbController.default.findById(_User.default, userId, params);
          var receiverSetting = yield _CommonDbController.default.findSingle(_UserSettings.default, {
            userId: userId
          });

          if (userData.deviceToken) {
            var notificationData = {
              toUser: userId,
              fromUser: _id10,
              title: " has viewed your profile.",
              message: " has viewed your profile.",
              deviceToken: userData.deviceToken,
              createdBy: _id10,
              updatedBy: _id10
            };

            if (receiverSetting.newVisitors == true) {
              yield _Notifications.default.sendNotification(notificationData);
            }
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Reviewed Profile',
            reviewedUser
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x21, _x22) {
        return _ref11.apply(this, arguments);
      };
    }());

    _defineProperty(this, "reviewProfilenew", /*#__PURE__*/function () {
      var _ref12 = _asyncToGenerator(function* (userId, _id) {
        try {
          if (userId.toString() !== _id.toString()) {
            var userData = yield _User.default.findById(userId);
            var firstTime = 1;

            if (userData.myVisitors && userData.myVisitors.length) {
              var index = userData.myVisitors.indexOf(_id);

              if (index === -1) {
                userData.myVisitors.push(_id);
              } else {
                firstTime = 0;
              }
            } else {
              userData.myVisitors = [_id];
            }

            yield _CommonDbController.default.update(_User.default, {
              _id: userId
            }, {
              myVisitors: userData.myVisitors
            }); // const reviewedUser = await Common.findById(UserModel, userId, params);

            var receiverSetting = yield _UserSettings.default.findOne({
              userId: userId
            });

            if (userData.deviceToken && firstTime == 1) {
              var notificationData = {
                toUser: userId,
                fromUser: _id,
                title: " has viewed your profile.",
                message: " has viewed your profile.",
                deviceToken: userData.deviceToken,
                createdBy: _id,
                updatedBy: _id
              };

              if (receiverSetting.newVisitors == true) {
                yield _Notifications.default.sendNotification(notificationData);
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      });

      return function (_x23, _x24) {
        return _ref12.apply(this, arguments);
      };
    }());

    _defineProperty(this, "likeDislikeUser", /*#__PURE__*/function () {
      var _ref13 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            userId
          } = req.params;
          var {
            _id: _id11
          } = req.user;
          var userData = yield _CommonDbController.default.findById(_User.default, _id11, ['name', 'likes']);
          var otherUser = yield _CommonDbController.default.findById(_User.default, userId, ['deviceToken', ['likes']]);
          var checkLike = yield _CommonDbController.default.findSingle(_Like.default, {
            userlikeby: _id11,
            userliketo: userId,
            isDeleted: false
          });
          var checkLikeOther = yield _CommonDbController.default.findSingle(_Like.default, {
            userlikeby: userId,
            userliketo: _id11,
            isDeleted: false,
            status: "pending"
          });
          var message = '';
          var flag = true;

          if (userData && userData.likes && userData.likes.length) {
            console.log("if");
            var index = userData.likes.indexOf(userId);

            if (index === -1) {
              userData.likes.push(userId);
              message = 'User liked';
            } else {
              userData.likes.splice(index, 1);
              message = 'User disliked';
              flag = false;
              console.log("right place");

              if (otherUser && otherUser.likes && otherUser.likes.length) {
                console.log("right condition");
                var otherIndex = otherUser.likes.indexOf(_id11);
                console.log("index", otherIndex);

                if (otherIndex === -1) {} else {
                  otherUser.likes.splice(otherIndex, 1);
                }

                console.log("other data", otherUser);
                yield _CommonDbController.default.update(_User.default, {
                  _id: otherUser._id
                }, {
                  likes: otherUser.likes
                });
              }
            }

            if (checkLike) {
              yield _CommonDbController.default.update(_Like.default, {
                _id: checkLike._id
              }, {
                userlikeby: _id11,
                userliketo: userId,
                status: "rejected",
                isDeleted: true
              });
            } else if (checkLikeOther) {
              yield _CommonDbController.default.update(_Like.default, {
                _id: checkLikeOther._id
              }, {
                status: "accepted"
              });
            } else {
              if (flag) {
                yield _CommonDbController.default.create(_Like.default, {
                  userlikeby: _id11,
                  userliketo: userId,
                  status: "pending"
                });
              }
            }
          } else {
            console.log("else");
            userData.likes = [userId];
            message = 'User liked';

            if (checkLike) {
              console.log("else - if");
              yield _CommonDbController.default.update(_Like.default, {
                _id: checkLike._id
              }, {
                userlikeby: _id11,
                userliketo: userId,
                status: "rejected",
                isDeleted: true
              });
            } else if (checkLikeOther) {
              console.log("else - else if");
              yield _CommonDbController.default.update(_Like.default, {
                _id: checkLikeOther._id
              }, {
                status: "accepted"
              });
            } else {
              console.log("else - else ");
              console.log(flag);

              if (flag) {
                yield _CommonDbController.default.create(_Like.default, {
                  userlikeby: _id11,
                  userliketo: userId,
                  status: "pending"
                });
              }
            }
          }

          if (otherUser.deviceToken) {
            var receiverSetting = yield _CommonDbController.default.findSingle(_UserSettings.default, {
              userId: userId
            });
            var notificationData = {
              toUser: userId,
              fromUser: _id11,
              title: flag ? "liked your profile." : "disliked your profile.",
              message: flag ? "liked your profile." : "disliked your profile.",
              deviceToken: otherUser.deviceToken,
              createdBy: _id11,
              updatedBy: _id11
            };

            if (receiverSetting.profileLikeShow == true) {
              yield _Notifications.default.sendNotification(notificationData);
            }
          }

          yield _CommonDbController.default.update(_User.default, {
            _id: userData._id
          }, {
            likes: userData.likes
          });
          return (0, _RequestHelper.buildResult)(res, 200, {
            message
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x25, _x26) {
        return _ref13.apply(this, arguments);
      };
    }());

    _defineProperty(this, "subscribe", /*#__PURE__*/function () {
      var _ref14 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id12
          } = req.user;
          var {
            subscriptionId
          } = req.body;
          var userData = yield _CommonDbController.default.findById(_User.default, _id12, ['isSubscribed', 'wallet']);

          if (userData && userData._id) {
            var data = {
              userId: _id12,
              planId: subscriptionId
            };
            var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, subscriptionId, ['bonus']);
            var wallet = userData.wallet ? userData.wallet + planData.bonus : planData.bonus;
            var subscriptionData = yield _CommonDbController.default.create(_UserSubscription.default, data);

            if (subscriptionData && subscriptionData._id) {
              yield _CommonDbController.default.update(_User.default, {
                _id: userData._id
              }, {
                isSubscribed: true,
                wallet
              });
              var result = {
                message: "Subscription successfully done"
              };
              return (0, _RequestHelper.buildResult)(res, 200, result);
            }
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x27, _x28) {
        return _ref14.apply(this, arguments);
      };
    }());

    _defineProperty(this, "subscribeByAdmin", /*#__PURE__*/function () {
      var _ref15 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            planId,
            userId
          } = req.body;
          var userData = yield _CommonDbController.default.findById(_User.default, userId, ['isSubscribed', 'wallet']);

          if (userData && userData._id) {
            var data = {
              userId,
              planId
            };
            var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, planId, ['bonus']);
            var wallet = userData.wallet ? userData.wallet + planData.bonus : planData.bonus;
            var subscriptionData = yield _CommonDbController.default.create(_UserSubscription.default, data);

            if (subscriptionData && subscriptionData._id) {
              yield _CommonDbController.default.update(_User.default, {
                _id: userData._id
              }, {
                isSubscribed: true,
                wallet
              });
              var result = {
                message: "plan successfully done"
              };
              return (0, _RequestHelper.buildResult)(res, 200, result);
            }
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x29, _x30) {
        return _ref15.apply(this, arguments);
      };
    }());

    _defineProperty(this, "myVisitors", /*#__PURE__*/function () {
      var _ref16 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id13
          } = req.user;
          var populateFields = {
            path: 'myVisitors',
            select: ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified']
          };
          var userData = yield _CommonDbController.default.findById(_User.default, _id13, ['myVisitors'], populateFields);
          return (0, _RequestHelper.buildResult)(res, 200, {
            myVisitors: userData.myVisitors
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x31, _x32) {
        return _ref16.apply(this, arguments);
      };
    }());

    _defineProperty(this, "myBestMatches", /*#__PURE__*/function () {
      var _ref17 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id14
          } = req.user;
          var populateFields = {
            path: 'likes',
            select: ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', "gender"]
          };
          var userData = yield _CommonDbController.default.findById(_User.default, _id14, ['likes', "gender"], populateFields);
          var matches = [];
          var friend = [];

          if (userData && userData.likes && userData.likes.length) {
            for (var obj of userData.likes) {
              var data = yield _CommonDbController.default.findSingle(_User.default, {
                _id: obj._id,
                likes: {
                  $in: [_id14]
                }
              }, ['_id', "gender"]);

              if (data && data._id) {
                friend.push(obj);
              }

              console.log(_id14);

              if (data && data._id && data.gender && userData.gender !== data.gender) {
                matches.push(obj);
              }
            }
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            matches,
            friend
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x33, _x34) {
        return _ref17.apply(this, arguments);
      };
    }());

    _defineProperty(this, "recentSingle", /*#__PURE__*/function () {
      var _ref18 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;
          var {
            _id: _id15
          } = req.user;
          var userData = yield _CommonDbController.default.findById(_User.default, _id15, ['recentSearches']);
          var recentArray = userData.recentSearches;
          var index = recentArray.findIndex(e => e.toString() === id.toString());

          if (index !== -1) {
            recentArray.splice(index, 1);
          }

          var result = yield _CommonDbController.default.update(_User.default, {
            _id: _id15
          }, {
            recentSearches: recentArray
          }); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x35, _x36) {
        return _ref18.apply(this, arguments);
      };
    }());

    _defineProperty(this, "recentDeleteAll", /*#__PURE__*/function () {
      var _ref19 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id16
          } = req.user;
          var result = yield _CommonDbController.default.update(_User.default, {
            _id: _id16
          }, {
            recentSearches: []
          }); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x37, _x38) {
        return _ref19.apply(this, arguments);
      };
    }());

    _defineProperty(this, "myInviteHistory", /*#__PURE__*/function () {
      var _ref20 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id17
          } = req.user;
          var populateParams = ['name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified'];
          var populateFields = [{
            path: 'referredBy',
            select: populateParams
          }, {
            path: 'referredTo',
            select: populateParams
          }];
          var inviteParams = ['referredBy', 'referredTo', 'createdAt'];
          var result = yield _CommonDbController.default.list(_InviteHistory.default, {
            referredBy: _id17
          }, inviteParams, populateFields); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x39, _x40) {
        return _ref20.apply(this, arguments);
      };
    }());

    _defineProperty(this, "myTopFans", /*#__PURE__*/function () {
      var _ref21 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id,
            type
          } = req.params;
          var {
            _id: _id18
          } = req.user;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id18, ['name', 'likes']);
          var giftedBy = yield _SendGifts.default.find({
            giftedTo: id
          }).populate(['userId', "giftId"]).sort({
            '_id': 1
          });
          var users = [];
          /*  if (giftedBy && giftedBy.length) {
               // giftedBy = _.uniqBy(giftedBy, 'userId._id');
               for (const obj of giftedBy) {
                   users.push(obj.userId);
               }
           } */

          if (giftedBy && giftedBy.length) {
            var arr = [];

            for (var obj of giftedBy) {
              if (!obj.userId) {
                continue;
              }

              if (obj.userId.role == "admin") {
                continue;
              } // if (obj.userId._id.toString() == _id.toString()) {
              //     continue;
              // }


              var tempObje = {};
              tempObje = obj.userId.toObject();
              tempObje.dob = obj.userId ? yield _CommonService.default.convertTimeToDate(obj.userId.dob) : '';
              tempObje.age = obj.userId ? obj.userId.age || (yield _CommonService.default.getAge(obj.userId.dob)) : '';
              tempObje.isLike = loggedInUser.likes.includes(obj.userId._id);

              if (obj.giftId && obj.giftId.popularity) {
                tempObje.popularity = obj.giftId.popularity * obj.quantity;
              } else {
                tempObje.popularity = 0;
              }

              arr.push(tempObje);
            }

            arr.sort(function (a, b) {
              return b.popularity - a.popularity;
            });
            users = arr;
          }

          users = _lodash.default.groupBy(users, "_id");
          var finalArray = [];

          for (var [key, value] of Object.entries(users)) {
            var finalTemp = {};
            var totalPopularity = 0;

            for (var _obj2 of value) {
              finalTemp = _obj2;
              totalPopularity = parseInt(totalPopularity) + parseInt(_obj2.popularity);
            }

            finalTemp.popularity = totalPopularity;
            finalArray.push(finalTemp);
          } // console.log(finalArray);


          finalArray.sort(function (a, b) {
            return b.popularity - a.popularity;
          });
          var newusers = finalArray.slice(0, 20); // Send response

          return (0, _RequestHelper.buildResult)(res, 200, newusers);
        } catch (error) {
          console.log('error', error);
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x41, _x42) {
        return _ref21.apply(this, arguments);
      };
    }());

    _defineProperty(this, "myTopFansold", /*#__PURE__*/function () {
      var _ref22 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;
          var {
            _id: _id19
          } = req.user;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id19, ['name', 'likes']);
          var giftedBy = yield _CommonDbController.default.list(_SendGifts.default, {
            giftedTo: id
          }, ['userId'], {
            path: 'userId',
            select: listParams
          });
          console.log(giftedBy);
          var users = [];

          if (giftedBy && giftedBy.length) {
            giftedBy = _lodash.default.uniqBy(giftedBy, 'userId._id');

            for (var obj of giftedBy) {
              users.push(obj.userId);
            }
          }

          if (users && users.length) {
            var arr = [];

            for (var _obj3 of users) {
              _obj3 = _obj3.toObject();
              _obj3.dob = _obj3.dob ? yield _CommonService.default.convertTimeToDate(_obj3.dob) : '';
              _obj3.age = _obj3.age || (yield _CommonService.default.getAge(_obj3.dob));
              _obj3.isLike = loggedInUser.likes.includes(_obj3._id);
              arr.push(_obj3);
            }

            users = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, users);
        } catch (error) {
          console.log('error', error);
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x43, _x44) {
        return _ref22.apply(this, arguments);
      };
    }());

    _defineProperty(this, "blockUnblockUser", /*#__PURE__*/function () {
      var _ref23 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;

          var _user6 = yield _CommonDbController.default.findById(_User.default, id, ['isBlocked']); // Send response


          yield _CommonDbController.default.update(_User.default, {
            _id: id
          }, {
            isBlocked: !_user6.isBlocked
          });
          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'User ' + (_user6.isBlocked ? 'Unblocked' : 'Blocked')
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x45, _x46) {
        return _ref23.apply(this, arguments);
      };
    }());

    _defineProperty(this, "giveAwayToUser", /*#__PURE__*/function () {
      var _ref24 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id20
          } = req.user;
          var {
            userId,
            giftId,
            planId
          } = req.body;

          var _user7 = yield _CommonDbController.default.findById(_User.default, userId);

          if (planId) {
            var planData = yield _CommonDbController.default.findById(_MembershipPlans.default, planId, ['bonus']);
            yield _CommonDbController.default.create(_UserGiftPlan.default, {
              userId: userId,
              planId: planId,
              status: "pending"
            });
            var wallet = _user7.wallet ? _user7.wallet + planData.bonus : planData.bonus; // const subscriptionData = await Common.create(UserSubscriptionModel, { userId, planId });
            // if (subscriptionData && subscriptionData._id) {
            // await Common.update(UserModel, { _id: user._id }, { isSubscribed: true, wallet });

            if (_user7.deviceToken) {
              var notificationData = {
                toUser: _user7._id,
                fromUser: _id20,
                title: 'Gift Received',
                message: "Admin has sent you a free membership",
                deviceToken: _user7.deviceToken,
                createdBy: _id20,
                updatedBy: _id20
              };
              yield _Notifications.default.sendNotification(notificationData);
            }

            yield _CommonDbController.default.update(_User.default, {
              _id: _user7._id
            }, {
              wallet
            }); // }
          } else {
            delete req.body.planId;
          }

          if (giftId) {
            /*  const gift = await Common.findById(GiftModel, giftId, ['zole', 'popularity']);
             if(gift)
             {
                 const data = {
                     giftId,
                     giftedTo: userId,
                     userId: _id,
                     quantity: 1,
                     createdBy: _id,
                     updatedBy: _id
                 };
                 await Common.create(SendGiftModel, data);
             }
             else
             { */
            var data = {
              zole: giftId,
              giftedTo: userId,
              userId: _id20,
              quantity: 1,
              createdBy: _id20,
              updatedBy: _id20
            };
            yield _CommonDbController.default.create(_SendGifts.default, data);
            /*  } */

            var newWalletOfGift = _user7.wallet ? parseInt(_user7.wallet) + parseInt(giftId) : giftId; //  const newPopularity = user.popularity + gift.popularity;

            yield _CommonDbController.default.update(_User.default, {
              _id: userId
            }, {
              wallet: newWalletOfGift
              /* , popularity: newPopularity  */

            });
            delete req.body.giftId;
            req.body.zole = giftId;
          } else {
            delete req.body.giftId;
          }

          if (_user7.deviceToken) {
            var _notificationData = {
              toUser: userId,
              fromUser: _id20,
              title: 'Gift Received',
              message: "Admin has sent you gift of ".concat(giftId, " zoles"),
              deviceToken: _user7.deviceToken,
              createdBy: _id20,
              updatedBy: _id20
            };
            yield _Notifications.default.sendNotification(_notificationData);
          }

          req.body.createdBy = req.body.updatedBy = _id20;
          yield _CommonDbController.default.create(_GiveAway.default, req.body);
          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Give Away sent Successfully to user ' + _user7.name
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x47, _x48) {
        return _ref24.apply(this, arguments);
      };
    }());

    _defineProperty(this, "giveAwayList", /*#__PURE__*/function () {
      var _ref25 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id21
          } = req.user;
          var populateFields = [{
            path: 'planId',
            select: 'name'
          }, {
            path: 'giftId',
            select: 'zole'
          }, {
            path: 'userId',
            select: 'name userId'
          }];
          var result = yield _CommonDbController.default.list(_GiveAway.default, {
            createdBy: _id21
          }, ['planId', 'giftId', 'userId', 'createdAt'], populateFields);
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x49, _x50) {
        return _ref25.apply(this, arguments);
      };
    }());

    _defineProperty(this, "verifyUser", /*#__PURE__*/function () {
      var _ref26 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params; // Send response

          yield _CommonDbController.default.update(_User.default, {
            _id: id
          }, {
            isProfilePicVerified: true,
            kycStatus: "completed"
          });
          var {
            _id: _id22
          } = req.user;

          if (user.deviceToken) {
            var notificationData = {
              toUser: id,
              fromUser: _id22,
              title: 'Congratulations',
              message: " Your Profile Verification Complete ",
              deviceToken: user.deviceToken,
              createdBy: _id22,
              updatedBy: _id22
            };
            yield _Notifications.default.sendNotification(notificationData);
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'User Verified'
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x51, _x52) {
        return _ref26.apply(this, arguments);
      };
    }());

    _defineProperty(this, "acceptLike", /*#__PURE__*/function () {
      var _ref27 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id,
            status
          } = req.params; // Send response

          var likeData = yield _Like.default.findById(id);

          if (status == "accepted") {
            yield _CommonDbController.default.update(_Like.default, {
              _id: id
            }, {
              status: status
            });
          } else {
            yield _CommonDbController.default.update(_Like.default, {
              _id: id
            }, {
              status: status,
              isDeleted: true
            });
          }

          var userId = likeData.userlikeby;
          var _id23 = likeData.userliketo;
          var otherUser = yield _CommonDbController.default.findById(_User.default, likeData.userlikeby, ['likes']);

          if (status === "accepted") {
            var userData = yield _CommonDbController.default.findById(_User.default, likeData.userliketo, ['name', 'likes']);

            if (userData && userData.likes && userData.likes.length) {
              var index = userData.likes.indexOf(userId);

              if (index === -1) {
                userData.likes.push(userId);
              }
            } else {
              userData.likes = [userId];
            }

            yield _CommonDbController.default.update(_User.default, {
              _id: likeData.userliketo
            }, {
              likes: userData.likes
            });
          } else {
            if (otherUser && otherUser.likes && otherUser.likes.length) {
              var otherIndex = otherUser.likes.indexOf(_id23);

              if (otherIndex !== -1) {
                otherUser.likes.splice(otherIndex, 1);
              }

              yield _CommonDbController.default.update(_User.default, {
                _id: otherUser._id
              }, {
                likes: otherUser.likes
              });
            }
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'Status Updated'
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x53, _x54) {
        return _ref27.apply(this, arguments);
      };
    }());

    _defineProperty(this, "invitesEarn", /*#__PURE__*/function () {
      var _ref28 = _asyncToGenerator(function* (req, res) {
        var {
          _id
        } = req.user;

        try {
          console.log(_id); // Send response

          var likeData = yield _InviteRewards.default.findOne({
            isDeleted: false
          });
          console.log(likeData);
          return (0, _RequestHelper.buildResult)(res, 200, {
            zoles: likeData.zole ? likeData.zole : 0,
            popularity: likeData.popularity ? likeData.popularity : 0,
            message: likeData.message ? likeData.message : 0
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x55, _x56) {
        return _ref28.apply(this, arguments);
      };
    }());

    _defineProperty(this, "kycImageUpload", /*#__PURE__*/function () {
      var _ref29 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id: _id24
          } = req.user; // Check if user exists or not

          var _user8 = yield _CommonDbController.default.findById(_User.default, _id24, ['_id', 'profilePic', 'kycImage', 'kycStatus']); // Returns error if user id is invalid


          console.log(_user8);

          if (_user8) {
            if (_user8.kycStatus == "pending") {
              return (0, _RequestHelper.buildResult)(res, 200, {
                "message": "Verification Process is pending "
              });
            }
            /*    if(user.kycStatus=="rejected")
               {
                   return buildResult(res, 200, {"message":"Your kyc is rejected.please upload again"});
               } */


            if (req.file) {
              var splitUrl = req.baseUrl.split('/');
              var folderName = splitUrl[splitUrl.length - 1];
              req.body.kycImage = process.env.IMAGE_URL + folderName + '/' + req.file.filename;
              req.body.kycStatus = "pending";
              var result = yield _CommonDbController.default.update(_User.default, {
                _id: _id24
              }, req.body);
              result.message = req.t(result.message);
              return (0, _RequestHelper.buildResult)(res, 200, result);
            }
          } else {
            return (0, _RequestHelper.buildResult)(res, 200, {
              "message": "invalid user id"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x57, _x58) {
        return _ref29.apply(this, arguments);
      };
    }());

    _defineProperty(this, "rejectUser", /*#__PURE__*/function () {
      var _ref30 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;
          var {
            _id: _id25
          } = req.user; // Send response

          var _user9 = yield _User.default.findById(id);

          yield _CommonDbController.default.update(_User.default, {
            _id: id
          }, {
            isProfilePicVerified: false,
            kycStatus: "rejected"
          });

          if (_user9.deviceToken) {
            var notificationData = {
              toUser: id,
              fromUser: _id25,
              title: 'KYC is rejected',
              message: "your KYC request is rejected please upload again",
              deviceToken: _user9.deviceToken,
              createdBy: _id25,
              updatedBy: _id25
            };
            yield _Notifications.default.sendNotification(notificationData);
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'User Verified'
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x59, _x60) {
        return _ref30.apply(this, arguments);
      };
    }());

    _defineProperty(this, "deleteRequest", /*#__PURE__*/function () {
      var _ref31 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.body;
          var {
            _id: _id26
          } = req.user; // Send response

          var _user10 = yield _UserDeleteRequest.default.findOne({
            "userId": id
          });

          if (_user10) {
            return (0, _RequestHelper.buildResult)(res, 201, {
              message: 'request already sent . please wait for aprroval',
              data: _user10
            });
          } else {
            yield _CommonDbController.default.create(_UserDeleteRequest.default, {
              userId: id,
              status: "pending"
            });
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            message: 'request submitted successfully'
          });
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x61, _x62) {
        return _ref31.apply(this, arguments);
      };
    }());

    _defineProperty(this, "updateDeleteRequest", /*#__PURE__*/function () {
      var _ref32 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id,
            status
          } = req.body;
          var {
            _id: _id27
          } = req.user; // Send response

          console.log(id);

          var _user11 = yield _UserDeleteRequest.default.findById(id);

          console.log(_user11);

          if (_user11) {
            yield _CommonDbController.default.update(_UserDeleteRequest.default, {
              _id: id
            }, {
              status: status
            });
            return (0, _RequestHelper.buildResult)(res, 200, {
              message: 'status updated succefully'
            });
          } else {
            return (0, _RequestHelper.buildResult)(res, 201, {
              message: 'request already sent . please wait for aprroval'
            });
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x63, _x64) {
        return _ref32.apply(this, arguments);
      };
    }());

    _defineProperty(this, "recentFans", /*#__PURE__*/function () {
      var _ref33 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id,
            type
          } = req.params;
          var {
            _id: _id28
          } = req.user;
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id28, ['name', 'likes']);
          var giftedBy = yield _SendGifts.default.find({
            giftedTo: id
          }).populate(['userId', "giftId"]).sort({
            'createdAt': -1
          });
          var users = [];

          if (giftedBy && giftedBy.length) {
            var arr = [];

            for (var obj of giftedBy) {
              if (!obj.userId) {
                continue;
              }

              if (obj.userId.role == "admin") {
                continue;
              } // if (obj.userId._id.toString() == _id.toString()) {
              //     continue;
              // }


              var tempObje = {};
              tempObje = obj.userId.toObject();
              delete tempObje.popularity;
              tempObje.dob = obj.userId.dob ? yield _CommonService.default.convertTimeToDate(obj.userId.dob) : '';
              tempObje.age = obj.userId.age || (yield _CommonService.default.getAge(obj.userId.dob));
              tempObje.isLike = loggedInUser.likes.includes(obj.userId._id);

              if (obj.giftId && obj.giftId.popularity) {
                tempObje.popularity = obj.giftId.popularity * obj.quantity;
              } else {
                tempObje.popularity = 0;
              }

              arr.push(tempObje);
            }

            users = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, users);
        } catch (error) {
          console.log('error', error);
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x65, _x66) {
        return _ref33.apply(this, arguments);
      };
    }());

    _defineProperty(this, "adminGift", /*#__PURE__*/function () {
      var _ref34 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.params;
          var sendGift = yield _UserGiftPlan.default.find({
            userId: id,
            status: {
              $in: ['pending', 'active']
            }
          }).populate(['userId', "planId"]).sort({
            'createdAt': 1
          });
          var response = [];

          if (sendGift && sendGift.length) {
            var arr = [];

            for (var obj of sendGift) {
              var tempObje = {};
              tempObje.id = obj._id;
              tempObje.user = obj.userId;
              tempObje.plan = obj.planId;
              tempObje.status = obj.status;
              arr.push(tempObje);
            }

            response = arr;
          } // Send response


          return (0, _RequestHelper.buildResult)(res, 200, response);
        } catch (error) {
          console.log('error', error);
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x67, _x68) {
        return _ref34.apply(this, arguments);
      };
    }());

    _defineProperty(this, "useGiftPlan", /*#__PURE__*/function () {
      var _ref35 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            id
          } = req.body;
          var {
            _id: _id29
          } = req.user;
          var sendGift = yield _UserGiftPlan.default.findOne({
            userId: _id29,
            status: 'active'
          });

          if (sendGift) {
            return (0, _RequestHelper.buildResult)(res, 201, {
              "message": "You already have an active subscription plan"
            });
          } else {
            console.log({
              userId: _id29,
              id: id
            });
            var checkuserPlan = yield _UserGiftPlan.default.findOne({
              userId: _id29,
              _id: id
            });

            if (checkuserPlan) {
              var subscriptionData = yield _CommonDbController.default.create(_UserSubscription.default, {
                userId: _id29,
                planId: checkuserPlan.planId
              });
              yield _CommonDbController.default.update(_User.default, {
                _id: _id29
              }, {
                isSubscribed: true
              });
              yield _CommonDbController.default.update(_UserGiftPlan.default, {
                _id: id
              }, {
                status: 'active'
              });
              return (0, _RequestHelper.buildResult)(res, 200, {
                "message": "Plan activated successfully"
              });
            } else {
              return (0, _RequestHelper.buildResult)(res, 201, {
                "message": "something wents wrong"
              });
            }
          } // Send response

        } catch (error) {
          console.log('error', error);
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x69, _x70) {
        return _ref35.apply(this, arguments);
      };
    }());

    _defineProperty(this, "reviewProfilenewUnsub", /*#__PURE__*/function () {
      var _ref36 = _asyncToGenerator(function* (userId, _id) {
        try {
          if (userId.toString() !== _id.toString()) {
            var userData = yield _User.default.findById(userId);
            var firstTime = 1;

            if (userData.myVisitors && userData.myVisitors.length) {
              var index = userData.myVisitors.indexOf(_id);

              if (index === -1) {
                userData.myVisitors.push(_id);
              } else {
                firstTime = 0;
              }
            } else {
              userData.myVisitors = [_id];
            }

            yield _CommonDbController.default.update(_User.default, {
              _id: userId
            }, {
              myVisitors: userData.myVisitors
            });
            var reviewedUser = yield _CommonDbController.default.findById(_User.default, userId, params);

            if (userData.deviceToken && firstTime == 1) {
              var notificationData = {
                toUser: userId,
                fromUser: _id,
                title: "Someone has viewed your profile.",
                message: "Someone has viewed your profile.",
                deviceToken: userData.deviceToken,
                isUnsubscribe: true,
                createdBy: _id,
                updatedBy: _id
              };
              yield _Notifications.default.sendNotificationDirect(notificationData);
            }
          }
        } catch (error) {
          console.log(error);
        }
      });

      return function (_x71, _x72) {
        return _ref36.apply(this, arguments);
      };
    }());
  }

}

var _default = new UserController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1VzZXJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsImxpc3RQYXJhbXMiLCJVc2VyQ29udHJvbGxlciIsInJlcSIsInJlcyIsIl9pZCIsInVzZXIiLCJ0eXBlIiwic2VhcmNoIiwibmFtZSIsImNvdW50cnkiLCJzdGF0ZSIsIm1pbkFnZSIsIm1heEFnZSIsImRpc3RyaWN0IiwiZ2VuZGVyIiwicmVsaWdpb24iLCJyZWxhdGlvbnNoaXBTdGF0dXMiLCJlZHVjYXRpb24iLCJreWNTdGF0dXMiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsIm1heFJhbmdlIiwicXVlcnkiLCJsb2dnZWRJblVzZXIiLCJDb21tb24iLCJmaW5kQnlJZCIsIlVzZXJNb2RlbCIsIiRuZSIsImlzRGVsZXRlZCIsInNvcnQiLCJsaW1pdCIsImxvZ2luVXNlcklkIiwidXBkYXRlIiwiY2hhdE9ubGluZVN0YXR1cyIsImNoYXRUaW1lIiwiRGF0ZSIsImNoYXRsYXN0bWVzc2FnZSIsIkNoYXQiLCJmaW5kT25lIiwiaXNSZWFkIiwiY3JlYXRlZEF0IiwiaXNTdWJzY3JpYmVkIiwibG9jYXRpb24iLCJjb29yZGluYXRlcyIsInBhcnNlRmxvYXQiLCIkbmVhciIsIiRtYXhEaXN0YW5jZSIsIiRnZW9tZXRyeSIsIiRyZWdleCIsIiRvcHRpb25zIiwiZGF0ZVMiLCJkYXRlIiwic2V0RnVsbFllYXIiLCJnZXRGdWxsWWVhciIsIm1heFRpbWUiLCJnZXRUaW1lIiwibWluVGltZSIsImRvYiIsIiRndGUiLCIkbHRlIiwicm9sZSIsImxlbmd0aCIsIiRpbiIsIiRvciIsIm1vYmlsZSIsImVtYWlsIiwiY29uc29sZSIsImxvZyIsInBvcHVsYXRlUHJhbXMiLCJwb3B1bGF0ZUZpZWxkcyIsInBhdGgiLCJzZWxlY3QiLCJ1c2VycyIsImFsbHVzZXJzIiwiZmluZCIsInBvcHVsYXRlIiwidG90YWx1c2VyIiwiQXZnIiwic2tpcCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxpc3QiLCJhcnIiLCJvYmoiLCJ0b09iamVjdCIsInNlY1VzZXJJZCIsIkNvbW1vblNlcnZpY2UiLCJjb252ZXJ0VGltZVRvRGF0ZSIsImFnZSIsImdldEFnZSIsImlzTGlrZSIsImxpa2VzIiwiaW5jbHVkZXMiLCJsaWtlZEJ5IiwiY2hlY2tCbG9ja1VzZXIiLCJDaGF0YmxvY2siLCJ1c2VySWQiLCJibG9ja1VzZXJJZCIsImNoZWNrQmxvY2tVc2VyMSIsInVzZXJVbmlxdWVJZCIsImlzQ2hhdGJsb2NrIiwibWF0Y2hDb3VudCIsIm1hdGNoZXMiLCJmcmllbmRDb3VudCIsImZyaWVuZCIsImxpa2UiLCJkYXRhIiwiZmluZFNpbmdsZSIsInB1c2giLCJlcnJvciIsImt5Y0ltYWdlIiwiaXNQcm9maWxlUGljVmVyaWZpZWQiLCJlcnJvcnMiLCJpc0VtcHR5IiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwiaWQiLCJsYXN0U2NyZWVuVGltZSIsIm5ld0RhdGUiLCJzdWIiLCJVc2VyU3Vic2NyaXB0aW9uTW9kZWwiLCJwbGFuRGF0ZSIsInNldERhdGUiLCJnZXREYXRlIiwicGFyc2VJbnQiLCJwbGFuSWQiLCJ2YWxpZGl0eSIsImV4cGlyZURhdGUiLCJzdWJzY3JpcHRpb24iLCJyZXZpZXdQcm9maWxlbmV3IiwicmV2aWV3UHJvZmlsZW5ld1Vuc3ViIiwic2V0dGluZ3MiLCJVc2VyU2V0dGluZ3NNb2RlbCIsInRvU3RyaW5nIiwicmVjZW50U2VhcmNoZXMiLCJpbmRleCIsImZpbmRJbmRleCIsImUiLCJiYW5uZXIiLCJCYW5uZXJNb2RlbCIsInRvZGF5Iiwic3VnZ2VzdGVkVXNlciIsIiRuaW4iLCJMaWtlc0FsbCIsIkxpa2UiLCJ1c2VybGlrZXRvIiwibGlrZUFycmF5IiwibGlrZXZhbCIsInVzZXJsaWtlYnkiLCJ0ZW1wT2JqIiwicHJvZmlsZVBpYyIsInBvcHVsYXJpdHkiLCJsaWtlSWQiLCJzdGFydFRpbWUiLCJjdXJyZW50dGltZSIsInBhY2thZ2VFeHBpcmVEYXRlIiwiZHVyYXRpb24iLCJtb21lbnQiLCJkaWZmIiwiZGF5cyIsImFzRGF5cyIsImV4cGlyZVRleHQiLCJvbmxpbmVUaW1lIiwib25saW5lVGltZU1vbWVudCIsImR1cmF0aW9uT25saW5lIiwiZGF5c09ubGluZSIsIm1pbk9ubGluZSIsImFzTWludXRlcyIsImhvdXJPbmxpbmUiLCJhc0hvdXJzIiwic2VjT25saW5lIiwiYXNTZWNvbmRzIiwiT25saW5lRmluYWxUaW1lIiwib2xkUGFzc3dvcmQiLCJwYXNzd29yZCIsImJvZHkiLCJtZXNzYWdlIiwidCIsImNvbnN0YW50cyIsIklOQURFUVVBVEVfREFUQSIsIk5PVF9FWElTVFMiLCJXUk9OR19QQVNTV09SRCIsInJlc3VsdCIsInNwbGl0VXJsIiwiYmFzZVVybCIsInNwbGl0IiwiZm9sZGVyTmFtZSIsImRpciIsInVwZGF0ZWRCeSIsIm15cXVlcnkiLCJsZXRjaGVja1VzZXJOYW1lIiwiZmlsZXMiLCJmaWxlS2V5cyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiZnMiLCJ1bmxpbmsiLCJmaWxlbmFtZSIsImVyciIsIklOVkFMSURfSUQiLCJFTUFJTF9BTFJFQURZX0VYSVNUUyIsInNwbGl0RmlsZSIsImZpbGUiLCJwcm9jZXNzIiwiZW52IiwiSU1BR0VfVVJMIiwiZGVsZXRlT25lIiwiREVMRVRFRCIsIm1hdGNoUGFyYW1zIiwic2VsZkRhdGEiLCJwYXJ0bmVySW5mbyIsInRvdGFsIiwibWF0Y2hDb3VudHMiLCJ2YWx1ZSIsImVudHJpZXMiLCJwZXJjZW50YWdlIiwidG9GaXhlZCIsImZvbGxvd0luZGV4IiwiZm9sbG93aW5ncyIsImluZGV4T2YiLCJmb2xsb3dlckluZGV4IiwiZm9sbG93ZXJzIiwiZmxhZyIsInNwbGljZSIsImRldmljZVRva2VuIiwibm90aWZpY2F0aW9uRGF0YSIsInRvVXNlciIsImZyb21Vc2VyIiwidGl0bGUiLCJjcmVhdGVkQnkiLCJOb3RpZmljYXRpb25zIiwic2VuZE5vdGlmaWNhdGlvbiIsInVzZXJEYXRhIiwibXlWaXNpdG9ycyIsInJldmlld2VkVXNlciIsInJlY2VpdmVyU2V0dGluZyIsIm5ld1Zpc2l0b3JzIiwiZmlyc3RUaW1lIiwib3RoZXJVc2VyIiwiY2hlY2tMaWtlIiwiY2hlY2tMaWtlT3RoZXIiLCJvdGhlckluZGV4IiwiY3JlYXRlIiwicHJvZmlsZUxpa2VTaG93Iiwic3Vic2NyaXB0aW9uSWQiLCJwbGFuRGF0YSIsIlBsYW5Nb2RlbCIsIndhbGxldCIsImJvbnVzIiwic3Vic2NyaXB0aW9uRGF0YSIsInJlY2VudEFycmF5IiwicG9wdWxhdGVQYXJhbXMiLCJpbnZpdGVQYXJhbXMiLCJJbnZpdGVIaXN0b3J5TW9kZWwiLCJyZWZlcnJlZEJ5IiwiZ2lmdGVkQnkiLCJTZW5kR2lmdE1vZGVsIiwiZ2lmdGVkVG8iLCJ0ZW1wT2JqZSIsImdpZnRJZCIsInF1YW50aXR5IiwiYSIsImIiLCJfIiwiZ3JvdXBCeSIsImZpbmFsQXJyYXkiLCJmaW5hbFRlbXAiLCJ0b3RhbFBvcHVsYXJpdHkiLCJuZXd1c2VycyIsInNsaWNlIiwidW5pcUJ5IiwiaXNCbG9ja2VkIiwiVXNlckdpZnRQbGFuIiwiem9sZSIsIm5ld1dhbGxldE9mR2lmdCIsIkdpdmVBd2F5TW9kZWwiLCJsaWtlRGF0YSIsIkludml0ZVJld2FyZCIsInpvbGVzIiwiVXNlckRlbGV0ZVJlcXVlc3QiLCJzZW5kR2lmdCIsInJlc3BvbnNlIiwicGxhbiIsImNoZWNrdXNlclBsYW4iLCJpc1Vuc3Vic2NyaWJlIiwic2VuZE5vdGlmaWNhdGlvbkRpcmVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxJQUFNQSxNQUFNLEdBQUcsQ0FBQyxNQUFE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QUFRLENBQUNSLFdBQVQsSUFBd0JhLFNBQVMsSUFBSSxDQUF6QyxFQUE0QztBQUN4QyxrQkFBTVosZ0JBQWdCLEdBQUc7QUFDckJDLGdCQUFBQSxNQUFNLEVBQUVySSxNQURhO0FBRXJCc0ksZ0JBQUFBLFFBQVEsRUFBRW5PLEdBRlc7QUFHckJvTyxnQkFBQUEsS0FBSyxvQ0FIZ0I7QUFJckJ0RCxnQkFBQUEsT0FBTyxvQ0FKYztBQUtyQmtELGdCQUFBQSxXQUFXLEVBQUVRLFFBQVEsQ0FBQ1IsV0FMRDtBQU1yQjRELGdCQUFBQSxhQUFhLEVBQUUsSUFOTTtBQU9yQnZELGdCQUFBQSxTQUFTLEVBQUVyTyxHQVBVO0FBUXJCMEwsZ0JBQUFBLFNBQVMsRUFBRTFMO0FBUlUsZUFBekI7QUFVQSxvQkFBTXNPLHVCQUFjdUQsc0JBQWQsQ0FBcUM1RCxnQkFBckMsQ0FBTjtBQUNIO0FBQ0o7QUFFSixTQXRDRCxDQXNDRSxPQUFPdkgsS0FBUCxFQUFjO0FBQ1o1QyxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTJDLEtBQVo7QUFDSDtBQUNKLE9BOTBEZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7ZUFzMUROLElBQUk3RyxjQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgSW52aXRlSGlzdG9yeU1vZGVsIGZyb20gJy4uL01vZGVscy9JbnZpdGVIaXN0b3J5JztcbmltcG9ydCBVc2VyU2V0dGluZ3NNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlclNldHRpbmdzJztcbmltcG9ydCBHaXZlQXdheU1vZGVsIGZyb20gJy4uL01vZGVscy9HaXZlQXdheSc7XG5pbXBvcnQgR2lmdE1vZGVsIGZyb20gJy4uL01vZGVscy9HaWZ0cyc7XG5pbXBvcnQgU2VuZEdpZnRNb2RlbCBmcm9tICcuLi9Nb2RlbHMvU2VuZEdpZnRzJztcbmltcG9ydCBVc2VyU3Vic2NyaXB0aW9uTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXJTdWJzY3JpcHRpb24nO1xuaW1wb3J0IFBsYW5Nb2RlbCBmcm9tICcuLi9Nb2RlbHMvTWVtYmVyc2hpcFBsYW5zJztcbmltcG9ydCBCYW5uZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvQmFubmVycyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGJ1aWxkUmVzdWx0IH0gZnJvbSAnLi4vSGVscGVyL1JlcXVlc3RIZWxwZXInO1xuaW1wb3J0IHsgY29tcGFyZVN5bmMsIGhhc2hTeW5jIH0gZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vRGJDb250cm9sbGVyL0NvbW1vbkRiQ29udHJvbGxlcic7XG5pbXBvcnQgQ29tbW9uU2VydmljZSBmcm9tICcuLi9TZXJ2aWNlL0NvbW1vblNlcnZpY2UnO1xuaW1wb3J0IE5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vU2VydmljZS9Ob3RpZmljYXRpb25zJztcbmltcG9ydCBMaWtlIGZyb20gJy4uL01vZGVscy9MaWtlJztcbmltcG9ydCBJbnZpdGVSZXdhcmQgZnJvbSAnLi4vTW9kZWxzL0ludml0ZVJld2FyZHMnO1xuaW1wb3J0IFVzZXJEZWxldGVSZXF1ZXN0IGZyb20gJy4uL01vZGVscy9Vc2VyRGVsZXRlUmVxdWVzdCc7XG5pbXBvcnQgVXNlckdpZnRQbGFuIGZyb20gJy4uL01vZGVscy9Vc2VyR2lmdFBsYW4nO1xuaW1wb3J0IENoYXRibG9jayBmcm9tICcuLi9Nb2RlbHMvQ2hhdGJsb2NrJztcbmltcG9ydCBDaGF0IGZyb20gJy4uL01vZGVscy9DaGF0JztcbmltcG9ydCBtb21lbnQgZnJvbSBcIm1vbWVudC10aW1lem9uZVwiO1xuXG4vKipcbiAqICBVc2VyIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3JlZmVyQ29kZScsICdnZW5kZXInLCAnZG9iJywgJ3N0YXR1cycsICdzbW9rZXInLCAnZHJ1bmtlcicsICdjcmVhdGVkQXQnLCAncHJvZmlsZVBpYycsXG4gICAgJ3BvcHVsYXJpdHknLCAnd2FsbGV0JywgJ2lzU3Vic2NyaWJlZCcsICdpc0VtYWlsVmVyaWZpZWQnLCAnaXNNb2JpbGVWZXJpZmllZCcsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCcsICdteVZpc2l0b3JzJywgJ2ZvbGxvd2VycycsXG4gICAgJ2ZvbGxvd2luZ3MnLCAnbGlrZXMnLCAnY291bnRyeScsICdzdGF0ZScsICdkaXN0cmljdCcsICdyZWxpZ2lvbicsICdzdGF0dXMnLCAnYWJvdXRTdGF0dXMnLCAncmVsYXRpb25zaGlwU3RhdHVzJywgJ2xvb2tpbmdGb3InLFxuICAgICdibG9vZEdyb3VwJywgJ2hlaWdodCcsICdib2R5VHlwZScsICdlZHVjYXRpb24nLCAnd29ya3NwYWNlJywgJ3JlY2VudFNlYXJjaGVzJywgJ3VzZXJJZCcsICdkZXZpY2VJZCcsICdwbGF0Zm9ybScsICdpc0Rpc3RyaWN0JyxcbiAgICAnaXNCbG9vZEdyb3VwJywgJ2FnZScsICdpc0FnZScsICdpc0hlaWdodCcsICdpc0JvZHlUeXBlJywgJ2lzU21va2VyJywgJ2lzRHJ1bmtlcicsICdpc0VkdWNhdGlvbicsICdpc1dvcmtzcGFjZScsICd1c2Vyc1N1YklkJyxcbiAgICAnbGF0aXR1ZGUnLCAnbG9uZ2l0dWRlJywgJ2lzQmxvY2tlZCcsICdreWNJbWFnZScsICdsYXN0U2NyZWVuVGltZScsIFwia3ljU3RhdHVzXCIsIFwibWVzc2FnZVwiLCBcIm1haWxWZXJpZnlPdHBcIiwgXCJpc01haWxWZXJpZmllZFwiXTtcblxuY29uc3QgbGlzdFBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAndXNlcklkJywgJ2RvYicsICdhZ2UnLCAnZ2VuZGVyJywgJ3Byb2ZpbGVQaWMnLCAnY291bnRyeScsICdzdGF0ZScsICdkaXN0cmljdCcsICdyZWxpZ2lvbicsXG4gICAgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ3dhbGxldCcsICdwb3B1bGFyaXR5JywgJ3VzZXJzU3ViSWQnLCAnaXNTdWJzY3JpYmVkJywgJ2xhdGl0dWRlJywgJ2xvbmdpdHVkZScsICdpc0Jsb2NrZWQnLCAnbGlrZXMnLCAna3ljSW1hZ2UnLFxuICAgICdjcmVhdGVkQXQnLCAnbGFzdFNjcmVlblRpbWUnLCAnbWVzc2FnZScsIFwibWFpbFZlcmlmeU90cFwiLCBcImlzTWFpbFZlcmlmaWVkXCJdO1xuXG5jbGFzcyBVc2VyQ29udHJvbGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCB0aGUgdXNlcnNcbiAgICAgKi9cbiAgICBpbmRleCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyB0eXBlLCBzZWFyY2gsIG5hbWUsIGNvdW50cnksIHN0YXRlLCBtaW5BZ2UsIG1heEFnZSwgZGlzdHJpY3QsIGdlbmRlciwgcmVsaWdpb24sIHJlbGF0aW9uc2hpcFN0YXR1cywgZWR1Y2F0aW9uLCBreWNTdGF0dXMsIGxhdGl0dWRlLCBsb25naXR1ZGUsIG1heFJhbmdlIH0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcycsICdnZW5kZXInLCAncm9sZSddKTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBfaWQ6IHsgJG5lOiBfaWQgfSwgaXNEZWxldGVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgY29uc3Qgc29ydCA9ICcnO1xuICAgICAgICAgICAgbGV0IGxpbWl0ID0gJyc7XG4gICAgICAgICAgICBsZXQgbG9naW5Vc2VySWQgPSBfaWQ7XG5cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogX2lkIH0sIHsgY2hhdE9ubGluZVN0YXR1czogdHJ1ZSwgY2hhdFRpbWU6IG5ldyBEYXRlKCkgfSk7XG4gICAgICAgICAgICBsZXQgY2hhdGxhc3RtZXNzYWdlID0gYXdhaXQgQ2hhdC5maW5kT25lKHsgJ3JlY2VpdmVyJzogbG9naW5Vc2VySWQsIGlzUmVhZDogMCB9KS5zb3J0KHsgY3JlYXRlZEF0OiAtMSB9KTtcblxuICAgICAgICAgICAgaWYgKGNoYXRsYXN0bWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoQ2hhdCwgeyAncmVjZWl2ZXInOiBsb2dpblVzZXJJZCwgaXNSZWFkOiAwIH0sIHsgaXNSZWFkOiAxIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Jlc3QnKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkuaXNTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3N1Z2dlc3QnKSB7XG5cbiAgICAgICAgICAgICAgICAvKiAgIGlmIChsYXRpdHVkZSkge1xuICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAkbmVhcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJG1heERpc3RhbmNlOiBtYXhSYW5nZSA/IDUwMDAwMCA6IDUwMDAwLCAvLyBkaXN0ZW5jZSBpbiBtZXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGdlb21ldHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW3BhcnNlRmxvYXQobGF0aXR1ZGUpLCBwYXJzZUZsb2F0KGxvbmdpdHVkZSldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICBcbiAgICAgICAgICAgICAgICAgIH0gKi9cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGxhdGl0dWRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcGFyc2VGbG9hdChsYXRpdHVkZSksIHBhcnNlRmxvYXQobG9uZ2l0dWRlKV1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBfaWQgfSwgeyBsb2NhdGlvbjogbG9jYXRpb24sIGxhdGl0dWRlOiBsYXRpdHVkZSwgbG9uZ2l0dWRlOiBsb25naXR1ZGUgfSk7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJG5lYXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkbWF4RGlzdGFuY2U6IDUwMDAwLCAvLyBkaXN0ZW5jZSBpbiBtZXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRnZW9tZXRyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcGFyc2VGbG9hdChsYXRpdHVkZSksIHBhcnNlRmxvYXQobG9uZ2l0dWRlKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgICAgICBxdWVyeS5uYW1lID0geyAkcmVnZXg6IG5hbWUsICRvcHRpb25zOiBcImlcIiB9O1xuXG4gICAgICAgICAgICBpZiAobWF4QWdlID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCBkYXRlUyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpIC0gbWF4QWdlKTtcbiAgICAgICAgICAgICAgICBsZXQgbWF4VGltZSA9IGRhdGUuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgZGF0ZVMuc2V0RnVsbFllYXIoZGF0ZVMuZ2V0RnVsbFllYXIoKSAtIG1pbkFnZSk7XG4gICAgICAgICAgICAgICAgbGV0IG1pblRpbWUgPSBkYXRlUy5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBxdWVyeS5kb2IgPSB7ICRndGU6IG1heFRpbWUsICRsdGU6IG1pblRpbWUgfTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvLyBpZiAoY291bnRyeSlcbiAgICAgICAgICAgIC8vICAgICBxdWVyeS5jb3VudHJ5ID0gY291bnRyeTtcblxuICAgICAgICAgICAgLy8gaWYgKHN0YXRlKVxuICAgICAgICAgICAgLy8gICAgIHF1ZXJ5LnN0YXRlID0gc3RhdGU7XG5cbiAgICAgICAgICAgIC8vIGlmIChkaXN0cmljdClcbiAgICAgICAgICAgIC8vICAgICBxdWVyeS5kaXN0cmljdCA9IGRpc3RyaWN0O1xuXG4gICAgICAgICAgICBpZiAoZ2VuZGVyKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkuZ2VuZGVyID0gZ2VuZGVyO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChsb2dnZWRJblVzZXIucm9sZSA9PSBcImFkbWluXCIpIHtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmFtZSkge1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5nZW5kZXIgPSB7ICRuZTogbG9nZ2VkSW5Vc2VyLmdlbmRlciB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVsaWdpb24pXG4gICAgICAgICAgICAgICAgcXVlcnkucmVsaWdpb24gPSByZWxpZ2lvbjtcblxuICAgICAgICAgICAgaWYgKHJlbGF0aW9uc2hpcFN0YXR1cyAmJiByZWxhdGlvbnNoaXBTdGF0dXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnJlbGF0aW9uc2hpcFN0YXR1cyA9IHsgJGluOiByZWxhdGlvbnNoaXBTdGF0dXMgfTtcblxuICAgICAgICAgICAgaWYgKGVkdWNhdGlvbilcbiAgICAgICAgICAgICAgICBxdWVyeS5lZHVjYXRpb24gPSBlZHVjYXRpb247XG5cbiAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgICBxdWVyeVsnJGFuZCddID0gW3tcbiAgICAgICAgICAgICAgICAgICAgJG9yOiBbeyBuYW1lOiB7ICRyZWdleDogc2VhcmNoLCAkb3B0aW9uczogXCJpXCIgfSB9LFxuICAgICAgICAgICAgICAgICAgICB7IG1vYmlsZTogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbDogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXJ5LnJvbGUgPSBcInVzZXJcIjtcbiAgICAgICAgICAgIGlmIChreWNTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5reWNTdGF0dXMgPSBreWNTdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSwgXCJxdWVyeVwiKTtcblxuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVQcmFtcyA9IFsndXNlcklkJywgJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCcsICdnZW5kZXInLCAnaXNTdWJzY3JpYmVkJ107XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IHsgcGF0aDogJ2xpa2VzJywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH07XG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3VnZ2VzdCcpIHtcblxuICAgICAgICAgICAgICAgIGxldCBhbGx1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsdXNlciA9IGFsbHVzZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgQXZnID0gdG90YWx1c2VyIC8gMjtcbiAgICAgICAgICAgICAgICBsZXQgc2tpcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEF2Zyk7XG5cbiAgICAgICAgICAgICAgICB1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcykuc2tpcChza2lwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT09ICdiZXN0Jykge1xuICAgICAgICAgICAgICAgIGxldCBhbGx1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsdXNlciA9IGFsbHVzZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgQXZnID0gdG90YWx1c2VyIC8gMjtcbiAgICAgICAgICAgICAgICBsZXQgc2tpcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEF2Zyk7XG5cbiAgICAgICAgICAgICAgICB1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcykuc2tpcChza2lwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXJzID0gYXdhaXQgQ29tbW9uLmxpc3QoVXNlck1vZGVsLCBxdWVyeSwgbGlzdFBhcmFtcywgcG9wdWxhdGVGaWVsZHMsIHNvcnQsIGxpbWl0KTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBpZiAodXNlcnMgJiYgdXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIHVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iai50b09iamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VjVXNlcklkID0gb2JqLl9pZDtcblxuICAgICAgICAgICAgICAgICAgICBvYmouZG9iID0gb2JqLmRvYiA/IGF3YWl0IENvbW1vblNlcnZpY2UuY29udmVydFRpbWVUb0RhdGUob2JqLmRvYikgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLmFnZSA9IG9iai5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2Uob2JqLmRvYik7XG4gICAgICAgICAgICAgICAgICAgIG9iai5pc0xpa2UgPSBsb2dnZWRJblVzZXIubGlrZXMuaW5jbHVkZXMob2JqLl9pZCk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5saWtlZEJ5ID0gYXdhaXQgQ29tbW9uLmxpc3QoVXNlck1vZGVsLCB7IGxpa2VzOiB7ICRpbjogb2JqLl9pZCB9IH0sIHBvcHVsYXRlUHJhbXMpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogX2lkLCBibG9ja1VzZXJJZDogc2VjVXNlcklkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIxID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyBibG9ja1VzZXJJZDogX2lkLCB1c2VySWQ6IHNlY1VzZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIG9iai5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZSA9PT0gMCA/IDEuMSA6IG9iai5sYXRpdHVkZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnVzZXJVbmlxdWVJZCA9IG9iai51c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgIG9iai5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlID09PSAwID8gMS4xIDogb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9ja1VzZXIxID8gdHJ1ZSA6IChjaGVja0Jsb2NrVXNlciA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gW107XG4gICAgICAgICAgICAgICAgICAgIG9iai5mcmllbmQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5saWtlcyAmJiBvYmoubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpa2Ugb2Ygb2JqLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGxpa2UuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWtlczogeyAkaW46IFtvYmouX2lkXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgWydfaWQnLCAnZ2VuZGVyJywgJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gb2JqLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouZnJpZW5kLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iai5nZW5kZXIsIFwiLVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQgJiYgZGF0YS5nZW5kZXIgJiYgb2JqLmdlbmRlciAhPT0gZGF0YS5nZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoQ291bnQgPSBvYmoubWF0Y2hDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVzZXJzID0gYXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHVzZXJzKTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBpbmRleG9sZCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyB0eXBlLCBzZWFyY2gsIG5hbWUsIGNvdW50cnksIHN0YXRlLCBtaW5BZ2UsIG1heEFnZSwgZGlzdHJpY3QsIGdlbmRlciwgcmVsaWdpb24sIHJlbGF0aW9uc2hpcFN0YXR1cywgZWR1Y2F0aW9uLCBreWNTdGF0dXMgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGxvZ2dlZEluVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJywgJ2xpa2VzJywgJ2dlbmRlciddKTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBfaWQ6IHsgJG5lOiBfaWQgfSwgaXNEZWxldGVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgY29uc3Qgc29ydCA9ICcnO1xuICAgICAgICAgICAgbGV0IGxpbWl0ID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Jlc3QnKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkuaXNTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdWdnZXN0Jykge1xuXG5cbiAgICAgICAgICAgICAgICAvLyBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgLy8gcXVlcnkuY3JlYXRlZEF0ID0geyRsdGU6IG5ldyBEYXRlKCkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAzMCl9O1xuICAgICAgICAgICAgICAgIC8vIHF1ZXJ5LmNyZWF0ZWRBdCA9IHskbHRlOiBuZXcgRGF0ZShcIjIwMjEtMFwiKS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIDMwKX07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgICAgIHF1ZXJ5Lm5hbWUgPSB7ICRyZWdleDogbmFtZSwgJG9wdGlvbnM6IFwiaVwiIH07XG5cbiAgICAgICAgICAgIGlmIChtaW5BZ2UgPiAwICYmIG1heEFnZSA+IDApXG4gICAgICAgICAgICAgICAgcXVlcnkuYWdlID0geyAkZ3RlOiBtaW5BZ2UsICRsdGU6IG1heEFnZSB9O1xuXG4gICAgICAgICAgICBpZiAoY291bnRyeSlcbiAgICAgICAgICAgICAgICBxdWVyeS5jb3VudHJ5ID0gY291bnRyeTtcblxuICAgICAgICAgICAgaWYgKHN0YXRlKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnN0YXRlID0gc3RhdGU7XG5cbiAgICAgICAgICAgIGlmIChkaXN0cmljdClcbiAgICAgICAgICAgICAgICBxdWVyeS5kaXN0cmljdCA9IGRpc3RyaWN0O1xuXG4gICAgICAgICAgICBpZiAoZ2VuZGVyKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmdlbmRlciA9IGdlbmRlcjtcblxuICAgICAgICAgICAgaWYgKHJlbGlnaW9uKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnJlbGlnaW9uID0gcmVsaWdpb247XG5cbiAgICAgICAgICAgIGlmIChyZWxhdGlvbnNoaXBTdGF0dXMgJiYgcmVsYXRpb25zaGlwU3RhdHVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICBxdWVyeS5yZWxhdGlvbnNoaXBTdGF0dXMgPSB7ICRpbjogcmVsYXRpb25zaGlwU3RhdHVzIH07XG5cbiAgICAgICAgICAgIGlmIChlZHVjYXRpb24pXG4gICAgICAgICAgICAgICAgcXVlcnkuZWR1Y2F0aW9uID0gZWR1Y2F0aW9uO1xuXG4gICAgICAgICAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgcXVlcnlbJyRhbmQnXSA9IFt7XG4gICAgICAgICAgICAgICAgICAgICRvcjogW3sgbmFtZTogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBtb2JpbGU6IHsgJHJlZ2V4OiBzZWFyY2gsICRvcHRpb25zOiBcImlcIiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZW1haWw6IHsgJHJlZ2V4OiBzZWFyY2gsICRvcHRpb25zOiBcImlcIiB9IH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWVyeS5yb2xlID0gXCJ1c2VyXCI7XG4gICAgICAgICAgICBpZiAoa3ljU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkua3ljU3RhdHVzID0ga3ljU3RhdHVzO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlUHJhbXMgPSBbJ3VzZXJJZCcsICduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnLCAnZ2VuZGVyJywgJ2lzU3Vic2NyaWJlZCddO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSB7IHBhdGg6ICdsaWtlcycsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9O1xuICAgICAgICAgICAgbGV0IHVzZXJzID0gW107XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3N1Z2dlc3QnKSB7XG5cbiAgICAgICAgICAgICAgICBsZXQgYWxsdXNlcnMgPSBhd2FpdCBVc2VyTW9kZWwuZmluZChxdWVyeSwgbGlzdFBhcmFtcykucG9wdWxhdGUocG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgICAgIGxldCB0b3RhbHVzZXIgPSBhbGx1c2Vycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IEF2ZyA9IHRvdGFsdXNlciAvIDI7XG4gICAgICAgICAgICAgICAgbGV0IHNraXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBBdmcpO1xuXG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhd2FpdCBVc2VyTW9kZWwuZmluZChxdWVyeSwgbGlzdFBhcmFtcykucG9wdWxhdGUocG9wdWxhdGVGaWVsZHMpLnNraXAoc2tpcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VycyA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgcXVlcnksIGxpc3RQYXJhbXMsIHBvcHVsYXRlRmllbGRzLCBzb3J0LCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiB1c2Vycykge1xuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmoudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRvYiA9IG9iai5kb2IgPyBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKG9iai5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5hZ2UgPSBvYmouYWdlIHx8IGF3YWl0IENvbW1vblNlcnZpY2UuZ2V0QWdlKG9iai5kb2IpO1xuICAgICAgICAgICAgICAgICAgICBvYmouaXNMaWtlID0gbG9nZ2VkSW5Vc2VyLmxpa2VzLmluY2x1ZGVzKG9iai5faWQpO1xuICAgICAgICAgICAgICAgICAgICBvYmoubGlrZWRCeSA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgeyBsaWtlczogeyAkaW46IG9iai5faWQgfSB9LCBwb3B1bGF0ZVByYW1zKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIG9iai5sYXRpdHVkZSA9IG9iai5sYXRpdHVkZSA9PT0gMCA/IDEuMSA6IG9iai5sYXRpdHVkZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxvbmdpdHVkZSA9IG9iai5sb25naXR1ZGUgPT09IDAgPyAxLjEgOiBvYmoubG9uZ2l0dWRlO1xuXG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gW107XG4gICAgICAgICAgICAgICAgICAgIG9iai5mcmllbmQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5saWtlcyAmJiBvYmoubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpa2Ugb2Ygb2JqLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGxpa2UuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWtlczogeyAkaW46IFtvYmouX2lkXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgWydfaWQnLCAnZ2VuZGVyJywgJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gb2JqLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouZnJpZW5kLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iai5nZW5kZXIsIFwiLVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQgJiYgZGF0YS5nZW5kZXIgJiYgb2JqLmdlbmRlciAhPT0gZGF0YS5nZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoQ291bnQgPSBvYmoubWF0Y2hDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVzZXJzID0gYXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB1c2Vycyk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIGt5Y3JlcXVlc3QgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgdHlwZSwgc2VhcmNoLCBuYW1lLCBjb3VudHJ5LCBzdGF0ZSwgbWluQWdlLCBtYXhBZ2UsIGRpc3RyaWN0LCBnZW5kZXIsIHJlbGlnaW9uLCByZWxhdGlvbnNoaXBTdGF0dXMsIGVkdWNhdGlvbiwga3ljU3RhdHVzIH0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBfaWQ6IHsgJG5lOiBfaWQgfSwga3ljSW1hZ2U6IHsgJG5lOiBudWxsIH0sIGlzUHJvZmlsZVBpY1ZlcmlmaWVkOiBmYWxzZSwgaXNEZWxldGVkOiBmYWxzZSwga3ljU3RhdHVzOiBcInBlbmRpbmdcIiB9O1xuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Jlc3QnKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkuaXNTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdWdnZXN0Jykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAvLyBxdWVyeS5jcmVhdGVkQXQgPSB7JGx0ZTogbmV3IERhdGUoKS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIDMwKX07XG4gICAgICAgICAgICAgICAgLy8gcXVlcnkuY3JlYXRlZEF0ID0geyRsdGU6IG5ldyBEYXRlKFwiMjAyMS0wXCIpLnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMzApfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5hbWUpXG4gICAgICAgICAgICAgICAgcXVlcnkubmFtZSA9IHsgJHJlZ2V4OiBuYW1lLCAkb3B0aW9uczogXCJpXCIgfTtcblxuICAgICAgICAgICAgaWYgKG1pbkFnZSA+IDAgJiYgbWF4QWdlID4gMClcbiAgICAgICAgICAgICAgICBxdWVyeS5hZ2UgPSB7ICRndGU6IG1pbkFnZSwgJGx0ZTogbWF4QWdlIH07XG5cbiAgICAgICAgICAgIGlmIChjb3VudHJ5KVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmNvdW50cnkgPSBjb3VudHJ5O1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUpXG4gICAgICAgICAgICAgICAgcXVlcnkuc3RhdGUgPSBzdGF0ZTtcblxuICAgICAgICAgICAgaWYgKGRpc3RyaWN0KVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmRpc3RyaWN0ID0gZGlzdHJpY3Q7XG5cbiAgICAgICAgICAgIGlmIChnZW5kZXIpXG4gICAgICAgICAgICAgICAgcXVlcnkuZ2VuZGVyID0gZ2VuZGVyO1xuXG4gICAgICAgICAgICBpZiAocmVsaWdpb24pXG4gICAgICAgICAgICAgICAgcXVlcnkucmVsaWdpb24gPSByZWxpZ2lvbjtcblxuICAgICAgICAgICAgaWYgKHJlbGF0aW9uc2hpcFN0YXR1cyAmJiByZWxhdGlvbnNoaXBTdGF0dXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnJlbGF0aW9uc2hpcFN0YXR1cyA9IHsgJGluOiByZWxhdGlvbnNoaXBTdGF0dXMgfTtcblxuICAgICAgICAgICAgaWYgKGVkdWNhdGlvbilcbiAgICAgICAgICAgICAgICBxdWVyeS5lZHVjYXRpb24gPSBlZHVjYXRpb247XG5cbiAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgICBxdWVyeVsnJGFuZCddID0gW3tcbiAgICAgICAgICAgICAgICAgICAgJG9yOiBbeyBuYW1lOiB7ICRyZWdleDogc2VhcmNoLCAkb3B0aW9uczogXCJpXCIgfSB9LFxuICAgICAgICAgICAgICAgICAgICB7IG1vYmlsZTogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbDogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChreWNTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5reWNTdGF0dXMgPSBreWNTdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWVyeS5yb2xlID0gXCJ1c2VyXCI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhxdWVyeSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlUHJhbXMgPSBbJ3VzZXJJZCcsICduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnXTtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0geyBwYXRoOiAnbGlrZXMnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfTtcbiAgICAgICAgICAgIGxldCB1c2VycyA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgcXVlcnksIGxpc3RQYXJhbXMsIHBvcHVsYXRlRmllbGRzKTtcbiAgICAgICAgICAgIGlmICh1c2VycyAmJiB1c2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgdXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kb2IgPSBvYmouZG9iID8gYXdhaXQgQ29tbW9uU2VydmljZS5jb252ZXJ0VGltZVRvRGF0ZShvYmouZG9iKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBvYmouYWdlID0gb2JqLmFnZSB8fCBhd2FpdCBDb21tb25TZXJ2aWNlLmdldEFnZShvYmouZG9iKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzTGlrZSA9IGxvZ2dlZEluVXNlci5saWtlcy5pbmNsdWRlcyhvYmouX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxpa2VkQnkgPSBhd2FpdCBDb21tb24ubGlzdChVc2VyTW9kZWwsIHsgbGlrZXM6IHsgJGluOiBvYmouX2lkIH0gfSwgcG9wdWxhdGVQcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5saWtlcyAmJiBvYmoubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpa2Ugb2Ygb2JqLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGxpa2UuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWtlczogeyAkaW46IFtvYmouX2lkXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgWydfaWQnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoQ291bnQgPSBvYmoubWF0Y2hDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVzZXJzID0gYXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB1c2Vycyk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGRldGFpbCBvZiByZXF1ZXN0ZWQgdXNlclxuICAgICAqL1xuICAgIHNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBfaWQgfSwgeyBsYXN0U2NyZWVuVGltZTogbmV3IERhdGUoKSwgY2hhdE9ubGluZVN0YXR1czogdHJ1ZSwgY2hhdFRpbWU6IG5ldyBEYXRlKCkgfSk7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVByYW1zID0gWyd1c2VySWQnLCAnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgXCJwb3B1bGFyaXR5XCIsIFwibWFpbFZlcmlmeU90cFwiLCBcImlzTWFpbFZlcmlmaWVkXCIsICdpc01vYmlsZVZlcmlmaWVkJ107XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IFtcbiAgICAgICAgICAgICAgICB7IHBhdGg6ICdyZWNlbnRTZWFyY2hlcycsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9LFxuICAgICAgICAgICAgICAgIHsgcGF0aDogJ215VmlzaXRvcnMnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfSxcbiAgICAgICAgICAgICAgICB7IHBhdGg6ICdmb2xsb3dlcnMnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfSxcbiAgICAgICAgICAgICAgICB7IHBhdGg6ICdmb2xsb3dpbmdzJywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH0sXG4gICAgICAgICAgICAgICAgeyBwYXRoOiAnbGlrZXMnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogX2lkLCBibG9ja1VzZXJJZDogaWQsIGlzRGVsZXRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIxID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyBibG9ja1VzZXJJZDogX2lkLCB1c2VySWQ6IGlkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuXG5cblxuICAgICAgICAgICAgLy8gRmluZCB1c2VyIGRldGFpbHNcbiAgICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgaWQsIHBhcmFtcywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgdXNlciA9IHVzZXIudG9PYmplY3QoKTtcbiAgICAgICAgICAgIHVzZXIuYWdlID0gdXNlci5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2UodXNlci5kb2IpO1xuICAgICAgICAgICAgdXNlci5kb2IgPSBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKHVzZXIuZG9iKTtcbiAgICAgICAgICAgIHVzZXIubGlrZWRCeSA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgeyBsaWtlczogeyAkaW46IHVzZXIuX2lkIH0gfSwgcG9wdWxhdGVQcmFtcyk7XG4gICAgICAgICAgICB1c2VyLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9ja1VzZXIxID8gdHJ1ZSA6IChjaGVja0Jsb2NrVXNlciA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgICAgICB1c2VyLm1hdGNoQ291bnQgPSAwO1xuICAgICAgICAgICAgdXNlci5tYXRjaGVzID0gW107XG5cbiAgICAgICAgICAgIHVzZXIuZnJpZW5kQ291bnQgPSAwO1xuICAgICAgICAgICAgdXNlci5mcmllbmQgPSBbXTtcblxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSAnJztcbiAgICAgICAgICAgIGlmICh1c2VyLmxpa2VzICYmIHVzZXIubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdXNlci5saWtlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IF9pZDogb2JqLl9pZCwgbGlrZXM6IHsgJGluOiBbaWRdIH0gfSwgWydfaWQnLCBcImdlbmRlclwiXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmZyaWVuZENvdW50ID0gdXNlci5mcmllbmRDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmZyaWVuZC5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQgJiYgZGF0YS5nZW5kZXIgJiYgdXNlci5nZW5kZXIgIT09IGRhdGEuZ2VuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLm1hdGNoQ291bnQgPSB1c2VyLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5tYXRjaGVzLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VyLmlzU3Vic2NyaWJlZCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IHN1YiA9IGF3YWl0IFVzZXJTdWJzY3JpcHRpb25Nb2RlbC5maW5kKHsgdXNlcklkOiBpZCB9KS5wb3B1bGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdwbGFuSWQnLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Q6ICduYW1lIGFtb3VudCB2YWxpZGl0eSBib251cyBjcmVhdGVkQXQnXG4gICAgICAgICAgICAgICAgfSkuc29ydCh7IFwiY3JlYXRlZEF0XCI6IC0xIH0pLmxpbWl0KDEpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGUgPSBuZXcgRGF0ZShzdWJbMF0uY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gcGxhbkRhdGUuc2V0RGF0ZShwbGFuRGF0ZS5nZXREYXRlKCkgKyBwYXJzZUludChzdWJbMF0ucGxhbklkLnZhbGlkaXR5LCAxMCkpO1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgICAgICAgICBzdWJbMF0uZXhwaXJlRGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgICAgICAgICAgLy9pZiBwYWNrYWdlIGlzIGV4cGlyZVxuXG4gICAgICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0VGltZSgpIDwgbmV3IERhdGUoKS5nZXRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlci5zdWJzY3JpcHRpb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdXNlci5pc1N1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIuc3Vic2NyaXB0aW9uID0gc3ViO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJldmlld1Byb2ZpbGVuZXcoaWQsIF9pZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSlcblxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJldmlld1Byb2ZpbGVuZXdVbnN1YihpZCwgX2lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXIuc2V0dGluZ3MgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyU2V0dGluZ3NNb2RlbCwgeyB1c2VySWQ6IHVzZXIuX2lkIH0pO1xuICAgICAgICAgICAgbGV0IGxvZ2dlZEluVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWydyZWNlbnRTZWFyY2hlcycsICdsaWtlcyddKTtcbiAgICAgICAgICAgIGlmIChpZC50b1N0cmluZygpICE9PSBfaWQudG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlZEluVXNlciA9IGxvZ2dlZEluVXNlci50b09iamVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChsb2dnZWRJblVzZXIgJiYgbG9nZ2VkSW5Vc2VyLnJlY2VudFNlYXJjaGVzICYmIGxvZ2dlZEluVXNlci5yZWNlbnRTZWFyY2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBsb2dnZWRJblVzZXIucmVjZW50U2VhcmNoZXMuZmluZEluZGV4KGUgPT4gZS50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLnJlY2VudFNlYXJjaGVzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VyLnJlY2VudFNlYXJjaGVzID0gW2lkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkIH0sIHsgcmVjZW50U2VhcmNoZXM6IGxvZ2dlZEluVXNlci5yZWNlbnRTZWFyY2hlcyB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlci5iYW5uZXIgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShCYW5uZXJNb2RlbCwgeyB0eXBlOiAnMyBMaW5lIEJhbm5lcicsIGlzRGVsZXRlZDogZmFsc2UgfSwgWydsaW5rJywgJ2ltYWdlJ10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAzMCkpO1xuICAgICAgICAgICAgdXNlci5zdWdnZXN0ZWRVc2VyID0gYXdhaXQgVXNlck1vZGVsLmZpbmQoe1xuICAgICAgICAgICAgICAgIF9pZDogeyAkbmluOiBbX2lkLCBpZF0gfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHsgJGd0ZTogZGF0ZSB9LFxuICAgICAgICAgICAgICAgIGlzRGVsZXRlZDogZmFsc2VcbiAgICAgICAgICAgIH0sIGxpc3RQYXJhbXMpO1xuICAgICAgICAgICAgdXNlci5pc0xpa2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBsb2dnZWRJblVzZXIubGlrZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqLnRvU3RyaW5nKCkgPT09IHVzZXIuX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlci5pc0xpa2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgTGlrZXNBbGwgPSBhd2FpdCBDb21tb24ubGlzdChMaWtlLCB7XG4gICAgICAgICAgICAgICAgdXNlcmxpa2V0bzogX2lkLFxuICAgICAgICAgICAgICAgIGlzRGVsZXRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIlxuICAgICAgICAgICAgfSwgcGFyYW1zLCB7IHBhdGg6ICd1c2VybGlrZWJ5Jywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH0pO1xuICAgICAgICAgICAgbGV0IGxpa2VBcnJheSA9IFtdO1xuICAgICAgICAgICAgZm9yIChsZXQgbGlrZXZhbCBvZiBMaWtlc0FsbCkge1xuICAgICAgICAgICAgICAgIGlmIChsaWtldmFsLnVzZXJsaWtlYnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBPYmogPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Byb2ZpbGVQaWNWZXJpZmllZDogbGlrZXZhbC51c2VybGlrZWJ5ID8gbGlrZXZhbC51c2VybGlrZWJ5LmlzUHJvZmlsZVBpY1ZlcmlmaWVkIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGxpa2V2YWwudXNlcmxpa2VieS5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2JpbGU6IGxpa2V2YWwudXNlcmxpa2VieS5tb2JpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBsaWtldmFsLnVzZXJsaWtlYnkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBsaWtldmFsLnVzZXJsaWtlYnkuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IGxpa2V2YWwudXNlcmxpa2VieS51c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiBsaWtldmFsLnVzZXJsaWtlYnkuY291bnRyeSAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0cmljdDogbGlrZXZhbC51c2VybGlrZWJ5LmRpc3RyaWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZVBpYzogbGlrZXZhbC51c2VybGlrZWJ5LnByb2ZpbGVQaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3B1bGFyaXR5OiBsaWtldmFsLnVzZXJsaWtlYnkucG9wdWxhcml0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpa2VJZDogbGlrZXZhbC5faWRcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBsaWtlQXJyYXkucHVzaCh0ZW1wT2JqKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGdldCBleHBpcmUgdGltZSBzdHJpbmdcbiAgICAgICAgICAgIGxldCBzdGFydFRpbWUgPSBuZXcgRGF0ZShuZXdEYXRlKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50dGltZSA9IG1vbWVudChuZXcgRGF0ZSk7XG4gICAgICAgICAgICBsZXQgcGFja2FnZUV4cGlyZURhdGUgPSBtb21lbnQoc3RhcnRUaW1lKTtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IG1vbWVudC5kdXJhdGlvbihwYWNrYWdlRXhwaXJlRGF0ZS5kaWZmKGN1cnJlbnR0aW1lKSk7XG4gICAgICAgICAgICBsZXQgZGF5cyA9IGR1cmF0aW9uLmFzRGF5cygpO1xuXG4gICAgICAgICAgICBsZXQgZXhwaXJlVGV4dCA9IFwiRVhQSVJFRFwiO1xuICAgICAgICAgICAgaWYgKGRheXMgPj0gMCkge1xuICAgICAgICAgICAgICAgIGRheXMgPSBwYXJzZUludChkYXlzKTtcbiAgICAgICAgICAgICAgICBleHBpcmVUZXh0ID0gZGF5cyArIFwiIERheSBMZWZ0XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGdldCBvbmxpbiB0aW1lIHN0cmluZ1xuXG4gICAgICAgICAgICBsZXQgb25saW5lVGltZSA9IG5ldyBEYXRlKHVzZXIubGFzdFNjcmVlblRpbWUpO1xuXG4gICAgICAgICAgICBsZXQgb25saW5lVGltZU1vbWVudCA9IG1vbWVudChvbmxpbmVUaW1lKTtcbiAgICAgICAgICAgIGxldCBkdXJhdGlvbk9ubGluZSA9IG1vbWVudC5kdXJhdGlvbihjdXJyZW50dGltZS5kaWZmKG9ubGluZVRpbWVNb21lbnQpKTtcbiAgICAgICAgICAgIGxldCBkYXlzT25saW5lID0gZHVyYXRpb25PbmxpbmUuYXNEYXlzKCk7XG4gICAgICAgICAgICBsZXQgbWluT25saW5lID0gZHVyYXRpb25PbmxpbmUuYXNNaW51dGVzKCk7XG4gICAgICAgICAgICBsZXQgaG91ck9ubGluZSA9IGR1cmF0aW9uT25saW5lLmFzSG91cnMoKTtcbiAgICAgICAgICAgIGxldCBzZWNPbmxpbmUgPSBkdXJhdGlvbk9ubGluZS5hc1NlY29uZHMoKTtcbiAgICAgICAgICAgIGxldCBPbmxpbmVGaW5hbFRpbWUgPSAnT25saW5lJztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRheXNPbmxpbmUpO1xuICAgICAgICAgICAgZGF5c09ubGluZSA9IHBhcnNlSW50KGRheXNPbmxpbmUpO1xuICAgICAgICAgICAgaG91ck9ubGluZSA9IHBhcnNlSW50KGhvdXJPbmxpbmUpO1xuICAgICAgICAgICAgbWluT25saW5lID0gcGFyc2VJbnQobWluT25saW5lKTtcbiAgICAgICAgICAgIGlmIChkYXlzT25saW5lID4gMCkge1xuICAgICAgICAgICAgICAgIE9ubGluZUZpbmFsVGltZSA9IGRheXNPbmxpbmUgKyBcIiBkYXkgYWdvXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChob3VyT25saW5lID4gMCkge1xuICAgICAgICAgICAgICAgIE9ubGluZUZpbmFsVGltZSA9IGhvdXJPbmxpbmUgKyBcIiBob3VyIGFnb1wiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtaW5PbmxpbmUgPiAxKSB7XG4gICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lID0gbWluT25saW5lICsgXCIgbWluIGFnb1wiO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIC8qIGVsc2UgaWYoc2VjT25saW5lID4gMzApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2VjT25saW5lPXBhcnNlSW50KHNlY09ubGluZSk7XG4gICAgICAgICAgICAgICAgT25saW5lRmluYWxUaW1lPXNlY09ubGluZSsgXCIgc2VjIGFnb1wiO1xuICAgICAgICAgICAgfSAqL1xuXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRheXNPbmxpbmUsIFwiZGF5c09ubGluZVwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1pbk9ubGluZSwgXCJtaW5PbmxpbmVcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh1c2VyLmxhc3RTY3JlZW5UaW1lLCBcInVzZXIubGFzdFNjcmVlblRpbWVcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhPbmxpbmVGaW5hbFRpbWUsIFwiT25saW5lRmluYWxUaW1lXCIpO1xuICAgICAgICAgICAgdXNlci5sYXN0U2NyZWVuVGltZSA9IE9ubGluZUZpbmFsVGltZTtcbiAgICAgICAgICAgIHVzZXIubGlrZWRCeSA9IGxpa2VBcnJheTtcbiAgICAgICAgICAgIHVzZXIuZXhwaXJlRGF0ZSA9IGV4cGlyZVRleHQ7XG4gICAgICAgICAgICB1c2VyLmNvdW50cnkgPSB1c2VyLmNvdW50cnkgPyB1c2VyLmNvdW50cnkgOiAnSW5kaWEnO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHVzZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBQYXNzd29yZFxuICAgICAqL1xuICAgIGNoYW5nZVBhc3N3b3JkID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IG9sZFBhc3N3b3JkLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhfaWQpO1xuICAgICAgICAgICAgLy8gRmluZCB1c2VyIGRldGFpbHNcbiAgICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ19pZCcsICdwYXNzd29yZCcsJ3JvbGUnXSk7XG4gICAgICAgICAgICBpZiAodXNlci5yb2xlICE9IFwiYWRtaW5cIikge1xuICAgICAgICAgICAgICAgIGlmICghb2xkUGFzc3dvcmQgfHwgIXBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTkFERVFVQVRFX0RBVEEpIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuICAgICAgICAgICAgaWYgKHVzZXIucm9sZSAhPSBcImFkbWluXCIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBhcmVTeW5jKG9sZFBhc3N3b3JkLnRvU3RyaW5nKCksIHVzZXIucGFzc3dvcmQpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuV1JPTkdfUEFTU1dPUkQpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxLmJvZHkucGFzc3dvcmQgPSBoYXNoU3luYyhwYXNzd29yZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyBwYXNzd29yZDogcmVxLmJvZHkucGFzc3dvcmQgfSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIENoYW5nZWQnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2VsZWN0ZWQgdXNlclxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IGVtYWlsLCBkb2IsIHVzZXJJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSBfaWQ7XG5cbiAgICAgICAgICAgIGlmIChkb2IpIHtcbiAgICAgICAgICAgICAgICByZXEuYm9keS5kb2IgPSBuZXcgRGF0ZShkb2IpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VySWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgbXlxdWVyeSA9IHsgdXNlcklkOiB1c2VySWQsIF9pZDogeyAkbmU6IF9pZCB9IH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobXlxdWVyeSlcbiAgICAgICAgICAgICAgICBsZXQgbGV0Y2hlY2tVc2VyTmFtZSA9IGF3YWl0IFVzZXJNb2RlbC5maW5kT25lKG15cXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmIChsZXRjaGVja1VzZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDYwMCwge30sIHt9LCB7IG1lc3NhZ2U6IFwiVXNlcm5hbWUgQWxyZWFkeSBJbiBVc2UuIFBsZWFzZSBDaG9vc2UgQW5vdGhlciBVc2VybmFtZVwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ19pZCcsICdwcm9maWxlUGljJywgJ2t5Y0ltYWdlJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlkIGlzIGludmFsaWRcbiAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICAgIGlmIChyZXEuZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZUtleXMgPSBPYmplY3Qua2V5cyhyZXEuZmlsZXMpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXEuZmlsZXNba2V5XSAmJiByZXEuZmlsZXNba2V5XS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsoZGlyICsgJy8nICsgcmVxLmZpbGVzW2tleV1bMF0uZmlsZW5hbWUsIChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIHVzZXIgZXhpc3RzIG9yIG5vdCBmb3IgdGhlIGVtYWlsXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwgeyBlbWFpbCwgX2lkOiB7ICRuZTogX2lkIH0sIGlzRGVsZXRlZDogZmFsc2UgfSwgJ19pZCcpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgZW1haWwgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkVNQUlMX0FMUkVBRFlfRVhJU1RTKSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXEuZmlsZXMgJiYgT2JqZWN0LmtleXMocmVxLmZpbGVzKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlS2V5cyA9IE9iamVjdC5rZXlzKHJlcS5maWxlcyk7XG4gICAgICAgICAgICAgICAgZmlsZUtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXEuZmlsZXNba2V5XSAmJiByZXEuZmlsZXNba2V5XS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICdreWNJbWFnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXEuYm9keS5pc1Byb2ZpbGVQaWNWZXJpZmllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIgJiYgdXNlcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BsaXRGaWxlID0gdXNlcltrZXldLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHNwbGl0RmlsZVtzcGxpdEZpbGUubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKGRpciArICcvJyArIGZpbGUsIChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5ib2R5W2tleV0gPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGVzW2tleV1bMF0uZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXEuYm9keS5sb25naXR1ZGUpIHtcbiAgICAgICAgICAgICAgICByZXEuYm9keS5sb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW3BhcnNlRmxvYXQocmVxLmJvZHkubG9uZ2l0dWRlKSwgcGFyc2VGbG9hdChyZXEuYm9keS5sYXRpdHVkZSldXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY29uc29sZS5sb2cocmVxLmJvZHkubG9jYXRpb24pO1xuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdXNlciBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQgfSwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2UgPSByZXEudChyZXN1bHQubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdXBkYXRlVXNlckJ5QWRtaW4gPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUGF0aCBmb3IgdXBsb2FkaW5nIGZpbGVzXG4gICAgICAgICAgICBjb25zdCBzcGxpdFVybCA9IHJlcS5iYXNlVXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICBjb25zdCBmb2xkZXJOYW1lID0gc3BsaXRVcmxbc3BsaXRVcmwubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjb25zdCBkaXIgPSAndXBsb2Fkcy8nICsgZm9sZGVyTmFtZTtcblxuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgZW1haWwsIGRvYiB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICByZXEuYm9keS51cGRhdGVkQnkgPSBfaWQ7XG5cbiAgICAgICAgICAgIGlmIChkb2IpIHtcbiAgICAgICAgICAgICAgICByZXEuYm9keS5kb2IgPSBuZXcgRGF0ZShkb2IpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHVzZXIgZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIGlkLCBbJ19pZCcsICdwcm9maWxlUGljJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlkIGlzIGludmFsaWRcbiAgICAgICAgICAgIGlmICghdXNlcikgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpIH0pO1xuICAgICAgICAgICAgaWYgKGVtYWlsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdXNlciBleGlzdHMgb3Igbm90IGZvciB0aGUgZW1haWxcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IGVtYWlsLCBfaWQ6IHsgJG5lOiBpZCB9LCBpc0RlbGV0ZWQ6IGZhbHNlIH0sICdfaWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIGVtYWlsIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5FTUFJTF9BTFJFQURZX0VYSVNUUykgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVxLmZpbGUgJiYgcmVxLmZpbGUuZmlsZW5hbWUpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWxldGUgb2xkIGZpbGUgaWYgbmV3IGZpbGUgaXMgdGhlcmUgdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgaWYgKHVzZXIgJiYgdXNlci5wcm9maWxlUGljKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0RmlsZSA9IHVzZXIucHJvZmlsZVBpYy5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gc3BsaXRGaWxlW3NwbGl0RmlsZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgZnMudW5saW5rKGRpciArICcvJyArIGZpbGUsIChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZXQgcGF0aCBmb3IgbmV3IGZpbGVcbiAgICAgICAgICAgICAgICByZXEuYm9keS5wcm9maWxlUGljID0gcHJvY2Vzcy5lbnYuSU1BR0VfVVJMICsgZm9sZGVyTmFtZSArICcvJyArIHJlcS5maWxlLmZpbGVuYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBVcGRhdGUgdXNlciBkYXRhXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IGlkIH0sIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlID0gcmVxLnQocmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIHNlbGVjdGVkIHVzZXJcbiAgICAgKi9cbiAgICByZW1vdmUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBGaW5kIHVzZXIgZGV0YWlsc1xuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIGlkLCBbJ19pZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBpcyBpbnZhbGlkXG4gICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTlZBTElEX0lEKSB9KTtcbiAgICAgICAgICAgIC8vIFNvZnQgZGVsZXRlIHVzZXJcbiAgICAgICAgICAgIC8vIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogaWQgfSwgeyBpc0RlbGV0ZWQ6IHRydWUsIHVwZGF0ZWRCeTogcmVxLnVzZXIuX2lkIH0pO1xuICAgICAgICAgICAgYXdhaXQgVXNlck1vZGVsLmRlbGV0ZU9uZSh7IF9pZDogaWQgfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkRFTEVURUQpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFByb2ZpbGUgTWF0Y2hpbmdcbiAgICAgKi9cbiAgICBtYXRjaFByb2ZpbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdXNlcklkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hQYXJhbXMgPSBbJ3JlbGF0aW9uc2hpcFN0YXR1cycsICdsb29raW5nRm9yJywgJ2Jsb29kR3JvdXAnLCAnaGVpZ2h0JywgJ2JvZHlUeXBlJywgJ3Ntb2tlcicsXG4gICAgICAgICAgICAgICAgJ2RydW5rZXInLCAnZWR1Y2F0aW9uJywgJ3dvcmtzcGFjZScsICdjb3VudHJ5JywgJ3N0YXRlJywgJ2Rpc3RyaWN0J107XG4gICAgICAgICAgICBsZXQgc2VsZkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIG1hdGNoUGFyYW1zKTtcbiAgICAgICAgICAgIGxldCBwYXJ0bmVySW5mbyA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIHVzZXJJZCwgbWF0Y2hQYXJhbXMpO1xuICAgICAgICAgICAgc2VsZkRhdGEgPSBzZWxmRGF0YS50b09iamVjdCgpO1xuICAgICAgICAgICAgcGFydG5lckluZm8gPSBwYXJ0bmVySW5mby50b09iamVjdCgpO1xuICAgICAgICAgICAgY29uc3QgdG90YWwgPSBPYmplY3Qua2V5cyhzZWxmRGF0YSkubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIGxldCBtYXRjaENvdW50cyA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZWxmRGF0YSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSBcIl9pZFwiICYmIHBhcnRuZXJJbmZvW2tleV0gPT09IHZhbHVlKSBtYXRjaENvdW50cysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IChtYXRjaENvdW50cyAvIHRvdGFsICogMTAwKS50b0ZpeGVkKDIpICsgJyUnO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2U6IFwiUHJvZmlsZSBNYXRjaGVkXCIsIHBlcmNlbnRhZ2UgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZvbGxvdyAvIFVuZm9sbG93IFVzZXJcbiAgICAgKi9cbiAgICBmb2xsb3dVbmZvbGxvd1VzZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdXNlcklkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgbGV0IHNlbGZEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ25hbWUnLCAnZm9sbG93aW5ncyddKTtcbiAgICAgICAgICAgIGxldCBwYXJ0bmVySW5mbyA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIHVzZXJJZCwgWyduYW1lJywgJ2ZvbGxvd2VycycsICdkZXZpY2VUb2tlbiddKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd0luZGV4ID0gc2VsZkRhdGEuZm9sbG93aW5ncy5pbmRleE9mKHBhcnRuZXJJbmZvLl9pZCk7XG4gICAgICAgICAgICBjb25zdCBmb2xsb3dlckluZGV4ID0gcGFydG5lckluZm8uZm9sbG93ZXJzLmluZGV4T2Yoc2VsZkRhdGEuX2lkKTtcbiAgICAgICAgICAgIHNlbGZEYXRhID0gc2VsZkRhdGEudG9PYmplY3QoKTtcbiAgICAgICAgICAgIHBhcnRuZXJJbmZvID0gcGFydG5lckluZm8udG9PYmplY3QoKTtcbiAgICAgICAgICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgICAgICAgICBsZXQgZmxhZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZm9sbG93SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgc2VsZkRhdGEuZm9sbG93aW5ncy5wdXNoKHBhcnRuZXJJbmZvLl9pZCk7XG4gICAgICAgICAgICAgICAgcGFydG5lckluZm8uZm9sbG93ZXJzLnB1c2goc2VsZkRhdGEuX2lkKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYFlvdSBhcmUgZm9sbG93aW5nICR7cGFydG5lckluZm8ubmFtZX1gO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmRGF0YS5mb2xsb3dpbmdzLnNwbGljZShmb2xsb3dJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgcGFydG5lckluZm8uZm9sbG93ZXJzLnNwbGljZShmb2xsb3dlckluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gYFlvdSBhcmUgdW5mb2xsb3dpbmcgJHtwYXJ0bmVySW5mby5uYW1lfWA7XG4gICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBzZWxmRGF0YS5faWQgfSwgeyBmb2xsb3dpbmdzOiBzZWxmRGF0YS5mb2xsb3dpbmdzIH0pO1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBwYXJ0bmVySW5mby5faWQgfSwgeyBmb2xsb3dlcnM6IHBhcnRuZXJJbmZvLmZvbGxvd2VycyB9KTtcblxuICAgICAgICAgICAgaWYgKHBhcnRuZXJJbmZvLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmbGFnID8gYCBoYXMgc3RhcnRlZCBmb2xsb3dpbmcgeW91LmAgOiBgIGlzIG5vdyBub3QgZm9sbG93aW5nIHlvdS5gLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmbGFnID8gYCBoYXMgc3RhcnRlZCBmb2xsb3dpbmcgeW91LmAgOiBgIGlzIG5vdyBub3QgZm9sbG93aW5nIHlvdS5gLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogcGFydG5lckluZm8uZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV2aWV3IFByb2ZpbGVcbiAgICAgKi9cbiAgICByZXZpZXdQcm9maWxlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHVzZXJJZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGxldCBsb2dnZWRJblVzZXIgPSBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZSddKTtcbiAgICAgICAgICAgIGxldCB1c2VyRGF0YSA9IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIHVzZXJJZCwgWydteVZpc2l0b3JzJywgJ2RldmljZVRva2VuJ10pO1xuICAgICAgICAgICAgaWYgKHVzZXJEYXRhLm15VmlzaXRvcnMgJiYgdXNlckRhdGEubXlWaXNpdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHVzZXJEYXRhLm15VmlzaXRvcnMuaW5kZXhPZihfaWQpO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEubXlWaXNpdG9ycy5wdXNoKF9pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzID0gW19pZF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcklkIH0sIHsgbXlWaXNpdG9yczogdXNlckRhdGEubXlWaXNpdG9ycyB9KTtcbiAgICAgICAgICAgIGNvbnN0IHJldmlld2VkVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIHVzZXJJZCwgcGFyYW1zKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY2VpdmVyU2V0dGluZyA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJTZXR0aW5nc01vZGVsLCB7IHVzZXJJZDogdXNlcklkIH0pO1xuICAgICAgICAgICAgaWYgKHVzZXJEYXRhLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBgIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAgaGFzIHZpZXdlZCB5b3VyIHByb2ZpbGUuYCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IHVzZXJEYXRhLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlclNldHRpbmcubmV3VmlzaXRvcnMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAnUmV2aWV3ZWQgUHJvZmlsZScsIHJldmlld2VkVXNlciB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldmlld1Byb2ZpbGVuZXcgPSBhc3luYyAodXNlcklkLCBfaWQpID0+IHtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgaWYgKHVzZXJJZC50b1N0cmluZygpICE9PSBfaWQudG9TdHJpbmcoKSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IHVzZXJEYXRhID0gYXdhaXQgVXNlck1vZGVsLmZpbmRCeUlkKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0VGltZSA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhLm15VmlzaXRvcnMgJiYgdXNlckRhdGEubXlWaXNpdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB1c2VyRGF0YS5teVZpc2l0b3JzLmluZGV4T2YoX2lkKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzLnB1c2goX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzID0gW19pZF07XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXJJZCB9LCB7IG15VmlzaXRvcnM6IHVzZXJEYXRhLm15VmlzaXRvcnMgfSk7XG4gICAgICAgICAgICAgICAgLy8gY29uc3QgcmV2aWV3ZWRVc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY2VpdmVyU2V0dGluZyA9IGF3YWl0IFVzZXJTZXR0aW5nc01vZGVsLmZpbmRPbmUoeyB1c2VySWQ6IHVzZXJJZCB9KTtcbiAgICAgICAgICAgICAgICBpZiAodXNlckRhdGEuZGV2aWNlVG9rZW4gJiYgZmlyc3RUaW1lID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVXNlcjogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBgIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlckRhdGEuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlclNldHRpbmcubmV3VmlzaXRvcnMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlrZSAmIERpc2xpa2UgVXNlclxuICAgICAqL1xuICAgIGxpa2VEaXNsaWtlVXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB1c2VySWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBsZXQgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcbiAgICAgICAgICAgIGxldCBvdGhlclVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCB1c2VySWQsIFsnZGV2aWNlVG9rZW4nLCBbJ2xpa2VzJ11dKTtcbiAgICAgICAgICAgIGxldCBjaGVja0xpa2UgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShMaWtlLCB7IHVzZXJsaWtlYnk6IF9pZCwgdXNlcmxpa2V0bzogdXNlcklkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgbGV0IGNoZWNrTGlrZU90aGVyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoTGlrZSwgeyB1c2VybGlrZWJ5OiB1c2VySWQsIHVzZXJsaWtldG86IF9pZCwgaXNEZWxldGVkOiBmYWxzZSwgc3RhdHVzOiBcInBlbmRpbmdcIiB9KTtcblxuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YSAmJiB1c2VyRGF0YS5saWtlcyAmJiB1c2VyRGF0YS5saWtlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImlmXCIpXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB1c2VyRGF0YS5saWtlcy5pbmRleE9mKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5saWtlcy5wdXNoKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAnVXNlciBsaWtlZCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEubGlrZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdVc2VyIGRpc2xpa2VkJztcbiAgICAgICAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJpZ2h0IHBsYWNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXJVc2VyICYmIG90aGVyVXNlci5saWtlcyAmJiBvdGhlclVzZXIubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJpZ2h0IGNvbmRpdGlvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG90aGVySW5kZXggPSBvdGhlclVzZXIubGlrZXMuaW5kZXhPZihfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpbmRleFwiLCBvdGhlckluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvdGhlckluZGV4ID09PSAtMSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyVXNlci5saWtlcy5zcGxpY2Uob3RoZXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm90aGVyIGRhdGFcIiwgb3RoZXJVc2VyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBvdGhlclVzZXIuX2lkIH0sIHsgbGlrZXM6IG90aGVyVXNlci5saWtlcyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjaGVja0xpa2UpIHtcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKExpa2UsIHsgX2lkOiBjaGVja0xpa2UuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJsaWtlYnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJsaWtldG86IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEZWxldGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrTGlrZU90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTGlrZSwgeyBfaWQ6IGNoZWNrTGlrZU90aGVyLl9pZCB9LCB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJhY2NlcHRlZFwiLFxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi5jcmVhdGUoTGlrZSwgeyB1c2VybGlrZWJ5OiBfaWQsIHVzZXJsaWtldG86IHVzZXJJZCwgc3RhdHVzOiBcInBlbmRpbmdcIiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZVwiKVxuICAgICAgICAgICAgICAgIHVzZXJEYXRhLmxpa2VzID0gW3VzZXJJZF07XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdVc2VyIGxpa2VkJztcblxuXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrTGlrZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVsc2UgLSBpZlwiKVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKExpa2UsIHsgX2lkOiBjaGVja0xpa2UuX2lkIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJsaWtlYnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJsaWtldG86IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNEZWxldGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrTGlrZU90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZSAtIGVsc2UgaWZcIilcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShMaWtlLCB7IF9pZDogY2hlY2tMaWtlT3RoZXIuX2lkIH0sIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCIsXG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVsc2UgLSBlbHNlIFwiKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmbGFnKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShMaWtlLCB7IHVzZXJsaWtlYnk6IF9pZCwgdXNlcmxpa2V0bzogdXNlcklkLCBzdGF0dXM6IFwicGVuZGluZ1wiIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvdGhlclVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWNlaXZlclNldHRpbmcgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyU2V0dGluZ3NNb2RlbCwgeyB1c2VySWQ6IHVzZXJJZCB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGZsYWcgPyBgbGlrZWQgeW91ciBwcm9maWxlLmAgOiBgZGlzbGlrZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZsYWcgPyBgbGlrZWQgeW91ciBwcm9maWxlLmAgOiBgZGlzbGlrZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiBvdGhlclVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVyU2V0dGluZy5wcm9maWxlTGlrZVNob3cgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlckRhdGEuX2lkIH0sIHsgbGlrZXM6IHVzZXJEYXRhLmxpa2VzIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIFVzZXJcbiAgICAgKi9cbiAgICBzdWJzY3JpYmUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgc3Vic2NyaXB0aW9uSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnaXNTdWJzY3JpYmVkJywgJ3dhbGxldCddKTtcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YSAmJiB1c2VyRGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgcGxhbklkOiBzdWJzY3JpcHRpb25JZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBzdWJzY3JpcHRpb25JZCwgWydib251cyddKTtcbiAgICAgICAgICAgICAgICBjb25zdCB3YWxsZXQgPSB1c2VyRGF0YS53YWxsZXQgPyB1c2VyRGF0YS53YWxsZXQgKyBwbGFuRGF0YS5ib251cyA6IHBsYW5EYXRhLmJvbnVzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbkRhdGEgPSBhd2FpdCBDb21tb24uY3JlYXRlKFVzZXJTdWJzY3JpcHRpb25Nb2RlbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbkRhdGEgJiYgc3Vic2NyaXB0aW9uRGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VyRGF0YS5faWQgfSwgeyBpc1N1YnNjcmliZWQ6IHRydWUsIHdhbGxldCB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJTdWJzY3JpcHRpb24gc3VjY2Vzc2Z1bGx5IGRvbmVcIlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgVXNlciBCeSBBZG1pbiAoR2l2ZSBhd2F5KVxuICAgICAqL1xuICAgIHN1YnNjcmliZUJ5QWRtaW4gPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgcGxhbklkLCB1c2VySWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCB1c2VySWQsIFsnaXNTdWJzY3JpYmVkJywgJ3dhbGxldCddKTtcbiAgICAgICAgICAgIGlmICh1c2VyRGF0YSAmJiB1c2VyRGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIHBsYW5JZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBwbGFuSWQsIFsnYm9udXMnXSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gdXNlckRhdGEud2FsbGV0ID8gdXNlckRhdGEud2FsbGV0ICsgcGxhbkRhdGEuYm9udXMgOiBwbGFuRGF0YS5ib251cztcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU3Vic2NyaXB0aW9uTW9kZWwsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25EYXRhICYmIHN1YnNjcmlwdGlvbkRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlckRhdGEuX2lkIH0sIHsgaXNTdWJzY3JpYmVkOiB0cnVlLCB3YWxsZXQgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwicGxhbiBzdWNjZXNzZnVsbHkgZG9uZVwiXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVzZXJzIHdobyBoYXZlIHZpc2l0ZWQgbWVcbiAgICAgKi9cbiAgICBteVZpc2l0b3JzID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IHtcbiAgICAgICAgICAgICAgICBwYXRoOiAnbXlWaXNpdG9ycycsXG4gICAgICAgICAgICAgICAgc2VsZWN0OiBbJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCddXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbXlWaXNpdG9ycyddLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbXlWaXNpdG9yczogdXNlckRhdGEubXlWaXNpdG9ycyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTXkgQmVzdCBNYXRjaGVzXG4gICAgICovXG4gICAgbXlCZXN0TWF0Y2hlcyA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ2xpa2VzJyxcbiAgICAgICAgICAgICAgICBzZWxlY3Q6IFsndXNlcklkJywgJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCcsIFwiZ2VuZGVyXCJdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbGlrZXMnLCBcImdlbmRlclwiXSwgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IFtdO1xuXG4gICAgICAgICAgICBjb25zdCBmcmllbmQgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHVzZXJEYXRhICYmIHVzZXJEYXRhLmxpa2VzICYmIHVzZXJEYXRhLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgb2JqIG9mIHVzZXJEYXRhLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHsgX2lkOiBvYmouX2lkLCBsaWtlczogeyAkaW46IFtfaWRdIH0gfSwgWydfaWQnLCBcImdlbmRlclwiXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmllbmQucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKF9pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkICYmIGRhdGEuZ2VuZGVyICYmIHVzZXJEYXRhLmdlbmRlciAhPT0gZGF0YS5nZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZXMucHVzaChvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1hdGNoZXMsIGZyaWVuZCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVsZXRlIHNpbmdsZSB1c2VyIGluIHJlY2VudCBsaXN0XG4gICAgICovXG4gICAgcmVjZW50U2luZ2xlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsncmVjZW50U2VhcmNoZXMnXSk7XG4gICAgICAgICAgICBjb25zdCByZWNlbnRBcnJheSA9IHVzZXJEYXRhLnJlY2VudFNlYXJjaGVzO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSByZWNlbnRBcnJheS5maW5kSW5kZXgoZSA9PiBlLnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlY2VudEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQgfSwgeyByZWNlbnRTZWFyY2hlczogcmVjZW50QXJyYXkgfSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSByZWNlbnQgbGlzdFxuICAgICAqL1xuICAgIHJlY2VudERlbGV0ZUFsbCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkIH0sIHsgcmVjZW50U2VhcmNoZXM6IFtdIH0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaXN0IGZvciBteSBJbnZpdGUgSGlzdG9yeVxuICAgICAqL1xuICAgIG15SW52aXRlSGlzdG9yeSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVQYXJhbXMgPSBbJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCddO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbe1xuICAgICAgICAgICAgICAgIHBhdGg6ICdyZWZlcnJlZEJ5Jywgc2VsZWN0OiBwb3B1bGF0ZVBhcmFtc1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHBhdGg6ICdyZWZlcnJlZFRvJywgc2VsZWN0OiBwb3B1bGF0ZVBhcmFtc1xuICAgICAgICAgICAgfV07XG4gICAgICAgICAgICBjb25zdCBpbnZpdGVQYXJhbXMgPSBbJ3JlZmVycmVkQnknLCAncmVmZXJyZWRUbycsICdjcmVhdGVkQXQnXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi5saXN0KEludml0ZUhpc3RvcnlNb2RlbCwgeyByZWZlcnJlZEJ5OiBfaWQgfSwgaW52aXRlUGFyYW1zLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE15IHRvcCBmYW5zXG4gICAgICovXG4gICAgbXlUb3BGYW5zID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcblxuICAgICAgICAgICAgbGV0IGdpZnRlZEJ5ID0gYXdhaXQgU2VuZEdpZnRNb2RlbC5maW5kKHsgZ2lmdGVkVG86IGlkIH0pLnBvcHVsYXRlKFsndXNlcklkJywgXCJnaWZ0SWRcIl0pLnNvcnQoeyAnX2lkJzogMSB9KTtcblxuICAgICAgICAgICAgbGV0IHVzZXJzID0gW107XG4gICAgICAgICAgICAvKiAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAvLyBnaWZ0ZWRCeSA9IF8udW5pcUJ5KGdpZnRlZEJ5LCAndXNlcklkLl9pZCcpO1xuICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICAgdXNlcnMucHVzaChvYmoudXNlcklkKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0gKi9cblxuICAgICAgICAgICAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW9iai51c2VySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoudXNlcklkLnJvbGUgPT0gXCJhZG1pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChvYmoudXNlcklkLl9pZC50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuXG5cblxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcE9iamUgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUgPSBvYmoudXNlcklkLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmRvYiA9IG9iai51c2VySWQgPyBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKG9iai51c2VySWQuZG9iKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS5hZ2UgPSBvYmoudXNlcklkID8gb2JqLnVzZXJJZC5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2Uob2JqLnVzZXJJZC5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmlzTGlrZSA9IGxvZ2dlZEluVXNlci5saWtlcy5pbmNsdWRlcyhvYmoudXNlcklkLl9pZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmouZ2lmdElkICYmIG9iai5naWZ0SWQucG9wdWxhcml0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUucG9wdWxhcml0eSA9IG9iai5naWZ0SWQucG9wdWxhcml0eSAqIG9iai5xdWFudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLnBvcHVsYXJpdHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2godGVtcE9iamUpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXJyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGIucG9wdWxhcml0eSAtIGEucG9wdWxhcml0eSB9KTtcbiAgICAgICAgICAgICAgICB1c2VycyA9IGFycjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlcnMgPSBfLmdyb3VwQnkodXNlcnMsIFwiX2lkXCIpO1xuICAgICAgICAgICAgbGV0IGZpbmFsQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHVzZXJzKSkge1xuICAgICAgICAgICAgICAgIGxldCBmaW5hbFRlbXAgPSB7fTtcbiAgICAgICAgICAgICAgICBsZXQgdG90YWxQb3B1bGFyaXR5ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxUZW1wID0gb2JqO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbFBvcHVsYXJpdHkgPSBwYXJzZUludCh0b3RhbFBvcHVsYXJpdHkpICsgcGFyc2VJbnQob2JqLnBvcHVsYXJpdHkpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbmFsVGVtcC5wb3B1bGFyaXR5ID0gdG90YWxQb3B1bGFyaXR5O1xuICAgICAgICAgICAgICAgIGZpbmFsQXJyYXkucHVzaChmaW5hbFRlbXApO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmaW5hbEFycmF5KTtcbiAgICAgICAgICAgIGZpbmFsQXJyYXkuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYi5wb3B1bGFyaXR5IC0gYS5wb3B1bGFyaXR5IH0pO1xuXG5cbiAgICAgICAgICAgIGxldCBuZXd1c2VycyA9IGZpbmFsQXJyYXkuc2xpY2UoMCwgMjApO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBuZXd1c2Vycyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBteVRvcEZhbnNvbGQgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcblxuICAgICAgICAgICAgbGV0IGdpZnRlZEJ5ID0gYXdhaXQgQ29tbW9uLmxpc3QoU2VuZEdpZnRNb2RlbCwgeyBnaWZ0ZWRUbzogaWQgfSwgWyd1c2VySWQnXSwge1xuICAgICAgICAgICAgICAgIHBhdGg6ICd1c2VySWQnLFxuICAgICAgICAgICAgICAgIHNlbGVjdDogbGlzdFBhcmFtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhnaWZ0ZWRCeSlcbiAgICAgICAgICAgIGxldCB1c2VycyA9IFtdO1xuICAgICAgICAgICAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGdpZnRlZEJ5ID0gXy51bmlxQnkoZ2lmdGVkQnksICd1c2VySWQuX2lkJyk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgZ2lmdGVkQnkpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcnMucHVzaChvYmoudXNlcklkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VycyAmJiB1c2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgdXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kb2IgPSBvYmouZG9iID8gYXdhaXQgQ29tbW9uU2VydmljZS5jb252ZXJ0VGltZVRvRGF0ZShvYmouZG9iKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBvYmouYWdlID0gb2JqLmFnZSB8fCBhd2FpdCBDb21tb25TZXJ2aWNlLmdldEFnZShvYmouZG9iKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzTGlrZSA9IGxvZ2dlZEluVXNlci5saWtlcy5pbmNsdWRlcyhvYmouX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHVzZXJzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYmxvY2tVbmJsb2NrVXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBpZCwgWydpc0Jsb2NrZWQnXSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IGlkIH0sIHsgaXNCbG9ja2VkOiAhdXNlci5pc0Jsb2NrZWQgfSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ1VzZXIgJyArICh1c2VyLmlzQmxvY2tlZCA/ICdVbmJsb2NrZWQnIDogJ0Jsb2NrZWQnKSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZ2l2ZUF3YXlUb1VzZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgdXNlcklkLCBnaWZ0SWQsIHBsYW5JZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkKTtcblxuICAgICAgICAgICAgaWYgKHBsYW5JZCkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBwbGFuSWQsIFsnYm9udXMnXSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKFVzZXJHaWZ0UGxhbiwgeyB1c2VySWQ6IHVzZXJJZCwgcGxhbklkOiBwbGFuSWQsIHN0YXR1czogXCJwZW5kaW5nXCIgfSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gdXNlci53YWxsZXQgPyB1c2VyLndhbGxldCArIHBsYW5EYXRhLmJvbnVzIDogcGxhbkRhdGEuYm9udXM7XG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgc3Vic2NyaXB0aW9uRGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoVXNlclN1YnNjcmlwdGlvbk1vZGVsLCB7IHVzZXJJZCwgcGxhbklkIH0pO1xuICAgICAgICAgICAgICAgIC8vIGlmIChzdWJzY3JpcHRpb25EYXRhICYmIHN1YnNjcmlwdGlvbkRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgLy8gYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VyLl9pZCB9LCB7IGlzU3Vic2NyaWJlZDogdHJ1ZSwgd2FsbGV0IH0pO1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnR2lmdCBSZWNlaXZlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgQWRtaW4gaGFzIHNlbnQgeW91IGEgZnJlZSBtZW1iZXJzaGlwYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiB1c2VyLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VyLl9pZCB9LCB7IHdhbGxldCB9KTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXEuYm9keS5wbGFuSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ2lmdElkKSB7XG4gICAgICAgICAgICAgICAgLyogIGNvbnN0IGdpZnQgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoR2lmdE1vZGVsLCBnaWZ0SWQsIFsnem9sZScsICdwb3B1bGFyaXR5J10pO1xuICAgICAgICAgICAgICAgICBpZihnaWZ0KVxuICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgIGdpZnRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICBnaWZ0ZWRUbzogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShTZW5kR2lmdE1vZGVsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIHsgKi9cblxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHpvbGU6IGdpZnRJZCxcbiAgICAgICAgICAgICAgICAgICAgZ2lmdGVkVG86IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi5jcmVhdGUoU2VuZEdpZnRNb2RlbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgLyogIH0gKi9cblxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1dhbGxldE9mR2lmdCA9IHVzZXIud2FsbGV0ID8gcGFyc2VJbnQodXNlci53YWxsZXQpICsgcGFyc2VJbnQoZ2lmdElkKSA6IGdpZnRJZDtcblxuICAgICAgICAgICAgICAgIC8vICBjb25zdCBuZXdQb3B1bGFyaXR5ID0gdXNlci5wb3B1bGFyaXR5ICsgZ2lmdC5wb3B1bGFyaXR5O1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcklkIH0sIHsgd2FsbGV0OiBuZXdXYWxsZXRPZkdpZnQvKiAsIHBvcHVsYXJpdHk6IG5ld1BvcHVsYXJpdHkgICovIH0pO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSByZXEuYm9keS5naWZ0SWQ7XG4gICAgICAgICAgICAgICAgcmVxLmJvZHkuem9sZSA9IGdpZnRJZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlcS5ib2R5LmdpZnRJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnR2lmdCBSZWNlaXZlZCcsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBBZG1pbiBoYXMgc2VudCB5b3UgZ2lmdCBvZiAke2dpZnRJZH0gem9sZXNgLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlci5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXEuYm9keS5jcmVhdGVkQnkgPSByZXEuYm9keS51cGRhdGVkQnkgPSBfaWQ7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKEdpdmVBd2F5TW9kZWwsIHJlcS5ib2R5KTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAnR2l2ZSBBd2F5IHNlbnQgU3VjY2Vzc2Z1bGx5IHRvIHVzZXIgJyArIHVzZXIubmFtZSB9KTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBnaXZlQXdheUxpc3QgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0gW3sgcGF0aDogJ3BsYW5JZCcsIHNlbGVjdDogJ25hbWUnIH0sIHsgcGF0aDogJ2dpZnRJZCcsIHNlbGVjdDogJ3pvbGUnIH0sIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAndXNlcklkJyxcbiAgICAgICAgICAgICAgICBzZWxlY3Q6ICduYW1lIHVzZXJJZCdcbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLmxpc3QoR2l2ZUF3YXlNb2RlbCwgeyBjcmVhdGVkQnk6IF9pZCB9LCBbJ3BsYW5JZCcsICdnaWZ0SWQnLCAndXNlcklkJywgJ2NyZWF0ZWRBdCddLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZlcmlmeVVzZXIgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IGlkIH0sIHsgaXNQcm9maWxlUGljVmVyaWZpZWQ6IHRydWUsIGt5Y1N0YXR1czogXCJjb21wbGV0ZWRcIiB9KTtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGlmICh1c2VyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdDb25ncmF0dWxhdGlvbnMnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgIFlvdXIgUHJvZmlsZSBWZXJpZmljYXRpb24gQ29tcGxldGUgYCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IHVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ1VzZXIgVmVyaWZpZWQnIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhY2NlcHRMaWtlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkLCBzdGF0dXMgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBsZXQgbGlrZURhdGEgPSBhd2FpdCBMaWtlLmZpbmRCeUlkKGlkKTtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gXCJhY2NlcHRlZFwiKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShMaWtlLCB7IF9pZDogaWQgfSwgeyBzdGF0dXM6IHN0YXR1cyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTGlrZSwgeyBfaWQ6IGlkIH0sIHsgc3RhdHVzOiBzdGF0dXMsIGlzRGVsZXRlZDogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXNlcklkID0gbGlrZURhdGEudXNlcmxpa2VieTtcbiAgICAgICAgICAgIGNvbnN0IF9pZCA9IGxpa2VEYXRhLnVzZXJsaWtldG87XG4gICAgICAgICAgICBsZXQgb3RoZXJVc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgbGlrZURhdGEudXNlcmxpa2VieSwgWydsaWtlcyddKTtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT09IFwiYWNjZXB0ZWRcIikge1xuICAgICAgICAgICAgICAgIGxldCB1c2VyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIGxpa2VEYXRhLnVzZXJsaWtldG8sIFsnbmFtZScsICdsaWtlcyddKTtcbiAgICAgICAgICAgICAgICBpZiAodXNlckRhdGEgJiYgdXNlckRhdGEubGlrZXMgJiYgdXNlckRhdGEubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdXNlckRhdGEubGlrZXMuaW5kZXhPZih1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5saWtlcy5wdXNoKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5saWtlcyA9IFt1c2VySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IGxpa2VEYXRhLnVzZXJsaWtldG8gfSwgeyBsaWtlczogdXNlckRhdGEubGlrZXMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAob3RoZXJVc2VyICYmIG90aGVyVXNlci5saWtlcyAmJiBvdGhlclVzZXIubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG90aGVySW5kZXggPSBvdGhlclVzZXIubGlrZXMuaW5kZXhPZihfaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3RoZXJJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG90aGVyVXNlci5saWtlcy5zcGxpY2Uob3RoZXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBvdGhlclVzZXIuX2lkIH0sIHsgbGlrZXM6IG90aGVyVXNlci5saWtlcyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ1N0YXR1cyBVcGRhdGVkJyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaW52aXRlc0Vhcm4gPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coX2lkKTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGxldCBsaWtlRGF0YSA9IGF3YWl0IEludml0ZVJld2FyZC5maW5kT25lKHsgaXNEZWxldGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxpa2VEYXRhKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyB6b2xlczogbGlrZURhdGEuem9sZSA/IGxpa2VEYXRhLnpvbGUgOiAwLCBwb3B1bGFyaXR5OiBsaWtlRGF0YS5wb3B1bGFyaXR5ID8gbGlrZURhdGEucG9wdWxhcml0eSA6IDAsIG1lc3NhZ2U6IGxpa2VEYXRhLm1lc3NhZ2UgPyBsaWtlRGF0YS5tZXNzYWdlIDogMCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAga3ljSW1hZ2VVcGxvYWQgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcblxuXG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHVzZXIgZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWydfaWQnLCAncHJvZmlsZVBpYycsICdreWNJbWFnZScsICdreWNTdGF0dXMnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgaWQgaXMgaW52YWxpZFxuICAgICAgICAgICAgY29uc29sZS5sb2codXNlcilcbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIua3ljU3RhdHVzID09IFwicGVuZGluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBcIm1lc3NhZ2VcIjogXCJWZXJpZmljYXRpb24gUHJvY2VzcyBpcyBwZW5kaW5nIFwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKiAgICBpZih1c2VyLmt5Y1N0YXR1cz09XCJyZWplY3RlZFwiKVxuICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7XCJtZXNzYWdlXCI6XCJZb3VyIGt5YyBpcyByZWplY3RlZC5wbGVhc2UgdXBsb2FkIGFnYWluXCJ9KTtcbiAgICAgICAgICAgICAgICAgICB9ICovXG4gICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZm9sZGVyTmFtZSA9IHNwbGl0VXJsW3NwbGl0VXJsLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICByZXEuYm9keS5reWNJbWFnZSA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZS5maWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLmJvZHkua3ljU3RhdHVzID0gXCJwZW5kaW5nXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZCB9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlID0gcmVxLnQocmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IFwibWVzc2FnZVwiOiBcImludmFsaWQgdXNlciBpZFwiIH0pO1xuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZWplY3RVc2VyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IFVzZXJNb2RlbC5maW5kQnlJZChpZCk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IGlkIH0sIHsgaXNQcm9maWxlUGljVmVyaWZpZWQ6IGZhbHNlLCBreWNTdGF0dXM6IFwicmVqZWN0ZWRcIiB9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IGlkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0tZQyBpcyByZWplY3RlZCcsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGB5b3VyIEtZQyByZXF1ZXN0IGlzIHJlamVjdGVkIHBsZWFzZSB1cGxvYWQgYWdhaW5gLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlci5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAnVXNlciBWZXJpZmllZCcgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBkZWxldGVSZXF1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyRGVsZXRlUmVxdWVzdC5maW5kT25lKHsgXCJ1c2VySWRcIjogaWQgfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAxLCB7IG1lc3NhZ2U6ICdyZXF1ZXN0IGFscmVhZHkgc2VudCAuIHBsZWFzZSB3YWl0IGZvciBhcHJyb3ZhbCcsIGRhdGE6IHVzZXIgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKFVzZXJEZWxldGVSZXF1ZXN0LCB7IHVzZXJJZDogaWQsIHN0YXR1czogXCJwZW5kaW5nXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAncmVxdWVzdCBzdWJtaXR0ZWQgc3VjY2Vzc2Z1bGx5JyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHVwZGF0ZURlbGV0ZVJlcXVlc3QgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgaWQsIHN0YXR1cyB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhpZCk7XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgVXNlckRlbGV0ZVJlcXVlc3QuZmluZEJ5SWQoaWQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlckRlbGV0ZVJlcXVlc3QsIHsgX2lkOiBpZCB9LCB7IHN0YXR1czogc3RhdHVzIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAnc3RhdHVzIHVwZGF0ZWQgc3VjY2VmdWxseScgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDEsIHsgbWVzc2FnZTogJ3JlcXVlc3QgYWxyZWFkeSBzZW50IC4gcGxlYXNlIHdhaXQgZm9yIGFwcnJvdmFsJyB9KTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZWNlbnRGYW5zID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkLCB0eXBlIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcblxuICAgICAgICAgICAgbGV0IGdpZnRlZEJ5ID0gYXdhaXQgU2VuZEdpZnRNb2RlbC5maW5kKHsgZ2lmdGVkVG86IGlkIH0pLnBvcHVsYXRlKFsndXNlcklkJywgXCJnaWZ0SWRcIl0pLnNvcnQoeyAnY3JlYXRlZEF0JzogLTEgfSk7XG5cbiAgICAgICAgICAgIGxldCB1c2VycyA9IFtdO1xuXG5cbiAgICAgICAgICAgIGlmIChnaWZ0ZWRCeSAmJiBnaWZ0ZWRCeS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgZ2lmdGVkQnkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFvYmoudXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoudXNlcklkLnJvbGUgPT0gXCJhZG1pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChvYmoudXNlcklkLl9pZC50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcE9iamUgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUgPSBvYmoudXNlcklkLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0ZW1wT2JqZS5wb3B1bGFyaXR5O1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS5kb2IgPSBvYmoudXNlcklkLmRvYiA/IGF3YWl0IENvbW1vblNlcnZpY2UuY29udmVydFRpbWVUb0RhdGUob2JqLnVzZXJJZC5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmFnZSA9IG9iai51c2VySWQuYWdlIHx8IGF3YWl0IENvbW1vblNlcnZpY2UuZ2V0QWdlKG9iai51c2VySWQuZG9iKTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUuaXNMaWtlID0gbG9nZ2VkSW5Vc2VyLmxpa2VzLmluY2x1ZGVzKG9iai51c2VySWQuX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5naWZ0SWQgJiYgb2JqLmdpZnRJZC5wb3B1bGFyaXR5KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLnBvcHVsYXJpdHkgPSBvYmouZ2lmdElkLnBvcHVsYXJpdHkgKiBvYmoucXVhbnRpdHk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLnBvcHVsYXJpdHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2godGVtcE9iamUpO1xuXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICB1c2VycyA9IGFycjtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHVzZXJzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGFkbWluR2lmdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcblxuICAgICAgICAgICAgbGV0IHNlbmRHaWZ0ID0gYXdhaXQgVXNlckdpZnRQbGFuLmZpbmQoeyB1c2VySWQ6IGlkLCBzdGF0dXM6IHsgJGluOiBbJ3BlbmRpbmcnLCAnYWN0aXZlJ10gfSB9KS5wb3B1bGF0ZShbJ3VzZXJJZCcsIFwicGxhbklkXCJdKS5zb3J0KHsgJ2NyZWF0ZWRBdCc6IDEgfSk7XG5cbiAgICAgICAgICAgIGxldCByZXNwb25zZSA9IFtdO1xuXG4gICAgICAgICAgICBpZiAoc2VuZEdpZnQgJiYgc2VuZEdpZnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIHNlbmRHaWZ0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXBPYmplID0ge307XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmlkID0gb2JqLl9pZDtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUudXNlciA9IG9iai51c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLnBsYW4gPSBvYmoucGxhbklkO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS5zdGF0dXMgPSBvYmouc3RhdHVzO1xuXG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKHRlbXBPYmplKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IGFycjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB1c2VHaWZ0UGxhbiA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBsZXQgc2VuZEdpZnQgPSBhd2FpdCBVc2VyR2lmdFBsYW4uZmluZE9uZSh7IHVzZXJJZDogX2lkLCBzdGF0dXM6ICdhY3RpdmUnIH0pO1xuICAgICAgICAgICAgaWYgKHNlbmRHaWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAxLCB7IFwibWVzc2FnZVwiOiBcIllvdSBhbHJlYWR5IGhhdmUgYW4gYWN0aXZlIHN1YnNjcmlwdGlvbiBwbGFuXCIgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh7IHVzZXJJZDogX2lkLCBpZDogaWQgfSlcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2t1c2VyUGxhbiA9IGF3YWl0IFVzZXJHaWZ0UGxhbi5maW5kT25lKHsgdXNlcklkOiBfaWQsIF9pZDogaWQgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrdXNlclBsYW4pIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU3Vic2NyaXB0aW9uTW9kZWwsIHsgdXNlcklkOiBfaWQsIHBsYW5JZDogY2hlY2t1c2VyUGxhbi5wbGFuSWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogX2lkIH0sIHsgaXNTdWJzY3JpYmVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJHaWZ0UGxhbiwgeyBfaWQ6IGlkIH0sIHsgc3RhdHVzOiAnYWN0aXZlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IFwibWVzc2FnZVwiOiBcIlBsYW4gYWN0aXZhdGVkIHN1Y2Nlc3NmdWxseVwiIH0pO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMSwgeyBcIm1lc3NhZ2VcIjogXCJzb21ldGhpbmcgd2VudHMgd3JvbmdcIiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXZpZXdQcm9maWxlbmV3VW5zdWIgPSBhc3luYyAodXNlcklkLCBfaWQpID0+IHtcbiAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgaWYgKHVzZXJJZC50b1N0cmluZygpICE9PSBfaWQudG9TdHJpbmcoKSkge1xuXG4gICAgICAgICAgICAgICAgbGV0IHVzZXJEYXRhID0gYXdhaXQgVXNlck1vZGVsLmZpbmRCeUlkKHVzZXJJZCk7XG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0VGltZSA9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhLm15VmlzaXRvcnMgJiYgdXNlckRhdGEubXlWaXNpdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB1c2VyRGF0YS5teVZpc2l0b3JzLmluZGV4T2YoX2lkKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzLnB1c2goX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VGltZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzID0gW19pZF07XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXJJZCB9LCB7IG15VmlzaXRvcnM6IHVzZXJEYXRhLm15VmlzaXRvcnMgfSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV2aWV3ZWRVc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBwYXJhbXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhLmRldmljZVRva2VuICYmIGZpcnN0VGltZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYFNvbWVvbmUgaGFzIHZpZXdlZCB5b3VyIHByb2ZpbGUuYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBTb21lb25lIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlckRhdGEuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBpc1Vuc3Vic2NyaWJlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb25EaXJlY3Qobm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFVzZXJDb250cm9sbGVyKCk7XG4iXX0=