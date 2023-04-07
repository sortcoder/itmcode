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
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id2, ['name', 'likes', 'gender']);
          var query = {
            _id: {
              $ne: _id2
            },
            isDeleted: false
          };
          var sort = '';
          var limit = '';

          if (type === 'best') {
            query.isSubscribed = true;
          } else if (type === 'suggest') {
            if (latitude) {
              query.location = {
                $near: {
                  $maxDistance: maxRange ? 500000 : 50000,
                  // distence in meter
                  $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                  }
                }
              };
            }
          } else {
            if (latitude) {
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
            users = yield _User.default.find(query, listParams).populate(populateFields);
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
            lastScreenTime: new Date()
          });
          var populatePrams = ['userId', 'name', 'email', 'mobile', 'profilePic', 'district', 'country', 'isProfilePicVerified', "popularity", "mailVerifyOtp", "isMailVerified"];
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
          }

          console.log(newDate, "Date");
          _user.likedBy = likeArray;
          _user.expireDate = newDate; // Send response

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
          } = req.user; // Find user details

          if (!oldPassword || !password) {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          }

          var _user2 = yield _CommonDbController.default.findById(_User.default, _id6, ['_id', 'password']); // Returns error if user not exists


          if (!_user2) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });
          if (!(0, _bcryptjs.compareSync)(oldPassword.toString(), _user2.password)) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.WRONG_PASSWORD)
          });
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
            dob
          } = req.body;
          req.body.updatedBy = _id7;

          if (dob) {
            req.body.dob = new Date(dob).getTime();
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
            yield _Notifications.default.sendNotification(notificationData);
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

            if (userData.myVisitors && userData.myVisitors.length) {
              var index = userData.myVisitors.indexOf(_id);

              if (index === -1) {
                userData.myVisitors.push(_id);
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

            if (userData.deviceToken) {
              var notificationData = {
                toUser: userId,
                fromUser: _id,
                title: " has viewed your profile.",
                message: " has viewed your profile.",
                deviceToken: userData.deviceToken,
                createdBy: _id,
                updatedBy: _id
              };
              yield _Notifications.default.sendNotification(notificationData);
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
            var notificationData = {
              toUser: userId,
              fromUser: _id11,
              title: flag ? " liked your profile." : " disliked your profile.",
              message: flag ? " liked your profile." : " disliked your profile.",
              deviceToken: otherUser.deviceToken,
              createdBy: _id11,
              updatedBy: _id11
            };
            yield _Notifications.default.sendNotification(notificationData);
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
          console.log(_id18);
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
              var tempObje = {};
              tempObje = obj.userId.toObject();
              tempObje.dob = obj.userId ? yield _CommonService.default.convertTimeToDate(obj.userId.dob) : '';
              tempObje.age = obj.userId ? obj.userId.age || (yield _CommonService.default.getAge(obj.userId.dob)) : '';
              tempObje.isLike = loggedInUser.likes.includes(obj.userId._id);
              tempObje.popularity = obj.giftId.popularity * obj.quantity; // console.log(obj.giftId.popularity,"S",obj.quantity);

              arr.push(tempObje); // arr[]
            }

            arr.sort(function (a, b) {
              return b.popularity - a.popularity;
            });
            users = arr;
          }

          var newusers = users.slice(0, 20); // Send response

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

            for (var _obj2 of users) {
              _obj2 = _obj2.toObject();
              _obj2.dob = _obj2.dob ? yield _CommonService.default.convertTimeToDate(_obj2.dob) : '';
              _obj2.age = _obj2.age || (yield _CommonService.default.getAge(_obj2.dob));
              _obj2.isLike = loggedInUser.likes.includes(_obj2._id);
              arr.push(_obj2);
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

          var _user7 = yield _CommonDbController.default.findById(_User.default, userId, ['name', 'wallet', 'popularity']);

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

            yield _CommonDbController.default.update(_User.default, {
              _id: _user7._id
            }, {
              wallet
            }); // }
          } else {
            delete req.body.planId;
          }

          if (giftId) {
            var _gift = yield _CommonDbController.default.findById(_Gifts.default, giftId, ['zole', 'popularity']);

            var data = {
              giftId,
              giftedTo: userId,
              userId: _id20,
              quantity: 1,
              createdBy: _id20,
              updatedBy: _id20
            };
            yield _CommonDbController.default.create(_SendGifts.default, data);
            var newWalletOfGift = _user7.wallet ? _user7.wallet + _gift.zole : _gift.zole; //  const newPopularity = user.popularity + gift.popularity;

            yield _CommonDbController.default.update(_User.default, {
              _id: userId
            }, {
              wallet: newWalletOfGift
              /* , popularity: newPopularity  */

            });
          } else {
            delete req.body.giftId;
          }

          if (_user7.deviceToken) {
            var notificationData = {
              toUser: userId,
              fromUser: _id20,
              title: 'Gift Received',
              message: "Admin has sent you gift of ".concat(gift.zole, " zoles"),
              deviceToken: _user7.deviceToken,
              createdBy: _id20,
              updatedBy: _id20
            };
            yield _Notifications.default.sendNotification(notificationData);
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
              title: 'KYC is approved',
              message: "your KYC request is approved ",
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
          console.log(_id28);
          var loggedInUser = yield _CommonDbController.default.findById(_User.default, _id28, ['name', 'likes']);
          var giftedBy = yield _SendGifts.default.find({
            giftedTo: id
          }).populate(['userId', "giftId"]).sort({
            'createdAt': 1
          });
          var users = [];

          if (giftedBy && giftedBy.length) {
            var arr = [];

            for (var obj of giftedBy) {
              var tempObje = {};
              tempObje = obj.userId;
              tempObje.dob = obj.userId.dob ? yield _CommonService.default.convertTimeToDate(obj.userId.dob) : '';
              tempObje.age = obj.userId.age || (yield _CommonService.default.getAge(obj.userId.dob));
              tempObje.isLike = loggedInUser.likes.includes(obj.userId._id);
              tempObje.popularity = obj.giftId.popularity * obj.quantity;
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
              "message": "one plan already actived you can not active other plan"
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
                "message": "actived successfully"
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
  }

}

var _default = new UserController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL1VzZXJDb250cm9sbGVyMTIuanMiXSwibmFtZXMiOlsicGFyYW1zIiwibGlzdFBhcmFtcyIsIlVzZXJDb250cm9sbGVyIiwicmVxIiwicmVzIiwiX2lkIiwidXNlciIsInR5cGUiLCJzZWFyY2giLCJuYW1lIiwiY291bnRyeSIsInN0YXRlIiwibWluQWdlIiwibWF4QWdlIiwiZGlzdHJpY3QiLCJnZW5kZXIiLCJyZWxpZ2lvbiIsInJlbGF0aW9uc2hpcFN0YXR1cyIsImVkdWNhdGlvbiIsImt5Y1N0YXR1cyIsImxhdGl0dWRlIiwibG9uZ2l0dWRlIiwibWF4UmFuZ2UiLCJxdWVyeSIsImxvZ2dlZEluVXNlciIsIkNvbW1vbiIsImZpbmRCeUlkIiwiVXNlck1vZGVsIiwiJG5lIiwiaXNEZWxldGVkIiwic29ydCIsImxpbWl0IiwiaXNTdWJzY3JpYmVkIiwibG9jYXRpb24iLCIkbmVhciIsIiRtYXhEaXN0YW5jZSIsIiRnZW9tZXRyeSIsImNvb3JkaW5hdGVzIiwicGFyc2VGbG9hdCIsIiRyZWdleCIsIiRvcHRpb25zIiwiYWdlIiwiJGd0ZSIsIiRsdGUiLCJsZW5ndGgiLCIkaW4iLCIkb3IiLCJtb2JpbGUiLCJlbWFpbCIsInJvbGUiLCJwb3B1bGF0ZVByYW1zIiwicG9wdWxhdGVGaWVsZHMiLCJwYXRoIiwic2VsZWN0IiwidXNlcnMiLCJhbGx1c2VycyIsImZpbmQiLCJwb3B1bGF0ZSIsInRvdGFsdXNlciIsIkF2ZyIsInNraXAiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsaXN0IiwiYXJyIiwib2JqIiwidG9PYmplY3QiLCJzZWNVc2VySWQiLCJkb2IiLCJDb21tb25TZXJ2aWNlIiwiY29udmVydFRpbWVUb0RhdGUiLCJnZXRBZ2UiLCJpc0xpa2UiLCJsaWtlcyIsImluY2x1ZGVzIiwibGlrZWRCeSIsImNoZWNrQmxvY2tVc2VyIiwiQ2hhdGJsb2NrIiwiZmluZE9uZSIsInVzZXJJZCIsImJsb2NrVXNlcklkIiwiY2hlY2tCbG9ja1VzZXIxIiwiaXNDaGF0YmxvY2siLCJtYXRjaENvdW50IiwibWF0Y2hlcyIsImZyaWVuZENvdW50IiwiZnJpZW5kIiwibGlrZSIsImRhdGEiLCJmaW5kU2luZ2xlIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsImt5Y0ltYWdlIiwiaXNQcm9maWxlUGljVmVyaWZpZWQiLCJlcnJvcnMiLCJpc0VtcHR5IiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwiaWQiLCJ1cGRhdGUiLCJsYXN0U2NyZWVuVGltZSIsIkRhdGUiLCJuZXdEYXRlIiwic3ViIiwiVXNlclN1YnNjcmlwdGlvbk1vZGVsIiwicGxhbkRhdGUiLCJjcmVhdGVkQXQiLCJkYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJwYXJzZUludCIsInBsYW5JZCIsInZhbGlkaXR5IiwiZXhwaXJlRGF0ZSIsImdldFRpbWUiLCJzdWJzY3JpcHRpb24iLCJyZXZpZXdQcm9maWxlbmV3Iiwic2V0dGluZ3MiLCJVc2VyU2V0dGluZ3NNb2RlbCIsInRvU3RyaW5nIiwicmVjZW50U2VhcmNoZXMiLCJpbmRleCIsImZpbmRJbmRleCIsImUiLCJiYW5uZXIiLCJCYW5uZXJNb2RlbCIsInRvZGF5Iiwic3VnZ2VzdGVkVXNlciIsIiRuaW4iLCJMaWtlc0FsbCIsIkxpa2UiLCJ1c2VybGlrZXRvIiwibGlrZUFycmF5IiwibGlrZXZhbCIsInVzZXJsaWtlYnkiLCJ0ZW1wT2JqIiwicHJvZmlsZVBpYyIsInBvcHVsYXJpdHkiLCJsaWtlSWQiLCJvbGRQYXNzd29yZCIsInBhc3N3b3JkIiwiYm9keSIsIm1lc3NhZ2UiLCJ0IiwiY29uc3RhbnRzIiwiSU5BREVRVUFURV9EQVRBIiwiTk9UX0VYSVNUUyIsIldST05HX1BBU1NXT1JEIiwicmVzdWx0Iiwic3BsaXRVcmwiLCJiYXNlVXJsIiwic3BsaXQiLCJmb2xkZXJOYW1lIiwiZGlyIiwidXBkYXRlZEJ5IiwiZmlsZXMiLCJmaWxlS2V5cyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwiZnMiLCJ1bmxpbmsiLCJmaWxlbmFtZSIsImVyciIsIklOVkFMSURfSUQiLCJFTUFJTF9BTFJFQURZX0VYSVNUUyIsInNwbGl0RmlsZSIsImZpbGUiLCJwcm9jZXNzIiwiZW52IiwiSU1BR0VfVVJMIiwiZGVsZXRlT25lIiwiREVMRVRFRCIsIm1hdGNoUGFyYW1zIiwic2VsZkRhdGEiLCJwYXJ0bmVySW5mbyIsInRvdGFsIiwibWF0Y2hDb3VudHMiLCJ2YWx1ZSIsImVudHJpZXMiLCJwZXJjZW50YWdlIiwidG9GaXhlZCIsImZvbGxvd0luZGV4IiwiZm9sbG93aW5ncyIsImluZGV4T2YiLCJmb2xsb3dlckluZGV4IiwiZm9sbG93ZXJzIiwiZmxhZyIsInNwbGljZSIsImRldmljZVRva2VuIiwibm90aWZpY2F0aW9uRGF0YSIsInRvVXNlciIsImZyb21Vc2VyIiwidGl0bGUiLCJjcmVhdGVkQnkiLCJOb3RpZmljYXRpb25zIiwic2VuZE5vdGlmaWNhdGlvbiIsInVzZXJEYXRhIiwibXlWaXNpdG9ycyIsInJldmlld2VkVXNlciIsIm90aGVyVXNlciIsImNoZWNrTGlrZSIsImNoZWNrTGlrZU90aGVyIiwib3RoZXJJbmRleCIsImNyZWF0ZSIsInN1YnNjcmlwdGlvbklkIiwicGxhbkRhdGEiLCJQbGFuTW9kZWwiLCJ3YWxsZXQiLCJib251cyIsInN1YnNjcmlwdGlvbkRhdGEiLCJyZWNlbnRBcnJheSIsInBvcHVsYXRlUGFyYW1zIiwiaW52aXRlUGFyYW1zIiwiSW52aXRlSGlzdG9yeU1vZGVsIiwicmVmZXJyZWRCeSIsImdpZnRlZEJ5IiwiU2VuZEdpZnRNb2RlbCIsImdpZnRlZFRvIiwidGVtcE9iamUiLCJnaWZ0SWQiLCJxdWFudGl0eSIsImEiLCJiIiwibmV3dXNlcnMiLCJzbGljZSIsIl8iLCJ1bmlxQnkiLCJpc0Jsb2NrZWQiLCJVc2VyR2lmdFBsYW4iLCJnaWZ0IiwiR2lmdE1vZGVsIiwibmV3V2FsbGV0T2ZHaWZ0Iiwiem9sZSIsIkdpdmVBd2F5TW9kZWwiLCJsaWtlRGF0YSIsIkludml0ZVJld2FyZCIsInpvbGVzIiwiVXNlckRlbGV0ZVJlcXVlc3QiLCJzZW5kR2lmdCIsInJlc3BvbnNlIiwicGxhbiIsImNoZWNrdXNlclBsYW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsUUFBbEIsRUFBNEIsV0FBNUIsRUFBeUMsUUFBekMsRUFBbUQsS0FBbkQsRUFBMEQsUUFBMUQsRUFBb0UsUUFBcEUsRUFBOEUsU0FBOUUsRUFBeUYsV0FBekYsRUFBc0csWUFBdEcsRUFDWCxZQURXLEVBQ0csUUFESCxFQUNhLGNBRGIsRUFDNkIsaUJBRDdCLEVBQ2dELGtCQURoRCxFQUNvRSxzQkFEcEUsRUFDNEYsWUFENUYsRUFDMEcsV0FEMUcsRUFFWCxZQUZXLEVBRUcsT0FGSCxFQUVZLFNBRlosRUFFdUIsT0FGdkIsRUFFZ0MsVUFGaEMsRUFFNEMsVUFGNUMsRUFFd0QsUUFGeEQsRUFFa0UsYUFGbEUsRUFFaUYsb0JBRmpGLEVBRXVHLFlBRnZHLEVBR1gsWUFIVyxFQUdHLFFBSEgsRUFHYSxVQUhiLEVBR3lCLFdBSHpCLEVBR3NDLFdBSHRDLEVBR21ELGdCQUhuRCxFQUdxRSxRQUhyRSxFQUcrRSxVQUgvRSxFQUcyRixVQUgzRixFQUd1RyxZQUh2RyxFQUlYLGNBSlcsRUFJSyxLQUpMLEVBSVksT0FKWixFQUlxQixVQUpyQixFQUlpQyxZQUpqQyxFQUkrQyxVQUovQyxFQUkyRCxXQUozRCxFQUl3RSxhQUp4RSxFQUl1RixhQUp2RixFQUlzRyxZQUp0RyxFQUtYLFVBTFcsRUFLQyxXQUxELEVBS2MsV0FMZCxFQUsyQixVQUwzQixFQUt1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RUFBc0I7QUFBRSwyQkFBVztBQUFiLGVBQXRCLENBQVA7QUFDSDtBQUNKLFdBcEJELENBc0JBOztBQUVILFNBeEJELENBd0JFLE9BQU8wRixLQUFQLEVBQWM7QUFDWkYsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksT0FBWixFQUFxQkMsS0FBckI7QUFDQSxpQkFBTyxnQ0FBWTFGLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIwRixLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXZsRGdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBNmxETixJQUFJNUYsY0FBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJ2V4cHJlc3MtdmFsaWRhdG9yJztcbmltcG9ydCBVc2VyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IEludml0ZUhpc3RvcnlNb2RlbCBmcm9tICcuLi9Nb2RlbHMvSW52aXRlSGlzdG9yeSc7XG5pbXBvcnQgVXNlclNldHRpbmdzTW9kZWwgZnJvbSAnLi4vTW9kZWxzL1VzZXJTZXR0aW5ncyc7XG5pbXBvcnQgR2l2ZUF3YXlNb2RlbCBmcm9tICcuLi9Nb2RlbHMvR2l2ZUF3YXknO1xuaW1wb3J0IEdpZnRNb2RlbCBmcm9tICcuLi9Nb2RlbHMvR2lmdHMnO1xuaW1wb3J0IFNlbmRHaWZ0TW9kZWwgZnJvbSAnLi4vTW9kZWxzL1NlbmRHaWZ0cyc7XG5pbXBvcnQgVXNlclN1YnNjcmlwdGlvbk1vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyU3Vic2NyaXB0aW9uJztcbmltcG9ydCBQbGFuTW9kZWwgZnJvbSAnLi4vTW9kZWxzL01lbWJlcnNoaXBQbGFucyc7XG5pbXBvcnQgQmFubmVyTW9kZWwgZnJvbSAnLi4vTW9kZWxzL0Jhbm5lcnMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBidWlsZFJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IGNvbXBhcmVTeW5jLCBoYXNoU3luYyB9IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IENvbW1vblNlcnZpY2UgZnJvbSAnLi4vU2VydmljZS9Db21tb25TZXJ2aWNlJztcbmltcG9ydCBOb3RpZmljYXRpb25zIGZyb20gJy4uL1NlcnZpY2UvTm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgTGlrZSBmcm9tICcuLi9Nb2RlbHMvTGlrZSc7XG5pbXBvcnQgSW52aXRlUmV3YXJkIGZyb20gJy4uL01vZGVscy9JbnZpdGVSZXdhcmRzJztcbmltcG9ydCBVc2VyRGVsZXRlUmVxdWVzdCBmcm9tICcuLi9Nb2RlbHMvVXNlckRlbGV0ZVJlcXVlc3QnO1xuaW1wb3J0IFVzZXJHaWZ0UGxhbiBmcm9tICcuLi9Nb2RlbHMvVXNlckdpZnRQbGFuJztcbmltcG9ydCBDaGF0YmxvY2sgZnJvbSAnLi4vTW9kZWxzL0NoYXRibG9jayc7XG5cbi8qKlxuICogIFVzZXIgQ29udHJvbGxlciBDbGFzc1xuICogIEBhdXRob3IgTml0aXNoYSBLaGFuZGVsd2FsIDxuaXRpc2hhLmtoYW5kZWx3YWxAanBsb2Z0LmluPlxuICovXG5cbmNvbnN0IHBhcmFtcyA9IFsnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncmVmZXJDb2RlJywgJ2dlbmRlcicsICdkb2InLCAnc3RhdHVzJywgJ3Ntb2tlcicsICdkcnVua2VyJywgJ2NyZWF0ZWRBdCcsICdwcm9maWxlUGljJyxcbiAgICAncG9wdWxhcml0eScsICd3YWxsZXQnLCAnaXNTdWJzY3JpYmVkJywgJ2lzRW1haWxWZXJpZmllZCcsICdpc01vYmlsZVZlcmlmaWVkJywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ215VmlzaXRvcnMnLCAnZm9sbG93ZXJzJyxcbiAgICAnZm9sbG93aW5ncycsICdsaWtlcycsICdjb3VudHJ5JywgJ3N0YXRlJywgJ2Rpc3RyaWN0JywgJ3JlbGlnaW9uJywgJ3N0YXR1cycsICdhYm91dFN0YXR1cycsICdyZWxhdGlvbnNoaXBTdGF0dXMnLCAnbG9va2luZ0ZvcicsXG4gICAgJ2Jsb29kR3JvdXAnLCAnaGVpZ2h0JywgJ2JvZHlUeXBlJywgJ2VkdWNhdGlvbicsICd3b3Jrc3BhY2UnLCAncmVjZW50U2VhcmNoZXMnLCAndXNlcklkJywgJ2RldmljZUlkJywgJ3BsYXRmb3JtJywgJ2lzRGlzdHJpY3QnLFxuICAgICdpc0Jsb29kR3JvdXAnLCAnYWdlJywgJ2lzQWdlJywgJ2lzSGVpZ2h0JywgJ2lzQm9keVR5cGUnLCAnaXNTbW9rZXInLCAnaXNEcnVua2VyJywgJ2lzRWR1Y2F0aW9uJywgJ2lzV29ya3NwYWNlJywgJ3VzZXJzU3ViSWQnLFxuICAgICdsYXRpdHVkZScsICdsb25naXR1ZGUnLCAnaXNCbG9ja2VkJywgJ2t5Y0ltYWdlJywgJ2xhc3RTY3JlZW5UaW1lJywgXCJreWNTdGF0dXNcIiwgXCJtZXNzYWdlXCIsIFwibWFpbFZlcmlmeU90cFwiLCBcImlzTWFpbFZlcmlmaWVkXCJdO1xuXG5jb25zdCBsaXN0UGFyYW1zID0gWyduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICd1c2VySWQnLCAnZG9iJywgJ2FnZScsICdnZW5kZXInLCAncHJvZmlsZVBpYycsICdjb3VudHJ5JywgJ3N0YXRlJywgJ2Rpc3RyaWN0JywgJ3JlbGlnaW9uJyxcbiAgICAnaXNQcm9maWxlUGljVmVyaWZpZWQnLCAnd2FsbGV0JywgJ3BvcHVsYXJpdHknLCAndXNlcnNTdWJJZCcsICdpc1N1YnNjcmliZWQnLCAnbGF0aXR1ZGUnLCAnbG9uZ2l0dWRlJywgJ2lzQmxvY2tlZCcsICdsaWtlcycsICdreWNJbWFnZScsXG4gICAgJ2NyZWF0ZWRBdCcsICdsYXN0U2NyZWVuVGltZScsICdtZXNzYWdlJywgXCJtYWlsVmVyaWZ5T3RwXCIsIFwiaXNNYWlsVmVyaWZpZWRcIl07XG5cbmNsYXNzIFVzZXJDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIExpc3QgYWxsIHRoZSB1c2Vyc1xuICAgICAqL1xuICAgIGluZGV4ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHR5cGUsIHNlYXJjaCwgbmFtZSwgY291bnRyeSwgc3RhdGUsIG1pbkFnZSwgbWF4QWdlLCBkaXN0cmljdCwgZ2VuZGVyLCByZWxpZ2lvbiwgcmVsYXRpb25zaGlwU3RhdHVzLCBlZHVjYXRpb24sIGt5Y1N0YXR1cywgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgbWF4UmFuZ2UgfSA9IHJlcS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGxvZ2dlZEluVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJywgJ2xpa2VzJywgJ2dlbmRlciddKTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBfaWQ6IHsgJG5lOiBfaWQgfSwgaXNEZWxldGVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgY29uc3Qgc29ydCA9ICcnO1xuICAgICAgICAgICAgbGV0IGxpbWl0ID0gJyc7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2Jlc3QnKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkuaXNTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZSA9PT0gJ3N1Z2dlc3QnKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAobGF0aXR1ZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkubG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmVhcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRtYXhEaXN0YW5jZTogbWF4UmFuZ2UgPyA1MDAwMDAgOiA1MDAwMCwgLy8gZGlzdGVuY2UgaW4gbWV0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcGFyc2VGbG9hdChsb25naXR1ZGUpLCBwYXJzZUZsb2F0KGxhdGl0dWRlKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChsYXRpdHVkZSkge1xuICAgICAgICAgICAgICAgICAgICBxdWVyeS5sb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRuZWFyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJG1heERpc3RhbmNlOiA1MDAwMCwgLy8gZGlzdGVuY2UgaW4gbWV0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJQb2ludFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW3BhcnNlRmxvYXQobGF0aXR1ZGUpLCBwYXJzZUZsb2F0KGxvbmdpdHVkZSldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5hbWUpXG4gICAgICAgICAgICAgICAgcXVlcnkubmFtZSA9IHsgJHJlZ2V4OiBuYW1lLCAkb3B0aW9uczogXCJpXCIgfTtcblxuICAgICAgICAgICAgaWYgKG1pbkFnZSA+IDAgJiYgbWF4QWdlID4gMClcbiAgICAgICAgICAgICAgICBxdWVyeS5hZ2UgPSB7ICRndGU6IG1pbkFnZSwgJGx0ZTogbWF4QWdlIH07XG5cbiAgICAgICAgICAgIGlmIChjb3VudHJ5KVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmNvdW50cnkgPSBjb3VudHJ5O1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUpXG4gICAgICAgICAgICAgICAgcXVlcnkuc3RhdGUgPSBzdGF0ZTtcblxuICAgICAgICAgICAgaWYgKGRpc3RyaWN0KVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmRpc3RyaWN0ID0gZGlzdHJpY3Q7XG5cbiAgICAgICAgICAgIGlmIChnZW5kZXIpXG4gICAgICAgICAgICAgICAgcXVlcnkuZ2VuZGVyID0gZ2VuZGVyO1xuXG4gICAgICAgICAgICBpZiAocmVsaWdpb24pXG4gICAgICAgICAgICAgICAgcXVlcnkucmVsaWdpb24gPSByZWxpZ2lvbjtcblxuICAgICAgICAgICAgaWYgKHJlbGF0aW9uc2hpcFN0YXR1cyAmJiByZWxhdGlvbnNoaXBTdGF0dXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnJlbGF0aW9uc2hpcFN0YXR1cyA9IHsgJGluOiByZWxhdGlvbnNoaXBTdGF0dXMgfTtcblxuICAgICAgICAgICAgaWYgKGVkdWNhdGlvbilcbiAgICAgICAgICAgICAgICBxdWVyeS5lZHVjYXRpb24gPSBlZHVjYXRpb247XG5cbiAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgICBxdWVyeVsnJGFuZCddID0gW3tcbiAgICAgICAgICAgICAgICAgICAgJG9yOiBbeyBuYW1lOiB7ICRyZWdleDogc2VhcmNoLCAkb3B0aW9uczogXCJpXCIgfSB9LFxuICAgICAgICAgICAgICAgICAgICB7IG1vYmlsZTogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBlbWFpbDogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXJ5LnJvbGUgPSBcInVzZXJcIjtcbiAgICAgICAgICAgIGlmIChreWNTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5reWNTdGF0dXMgPSBreWNTdGF0dXM7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVQcmFtcyA9IFsndXNlcklkJywgJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCcsICdnZW5kZXInLCAnaXNTdWJzY3JpYmVkJ107XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IHsgcGF0aDogJ2xpa2VzJywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH07XG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3VnZ2VzdCcpIHtcblxuICAgICAgICAgICAgICAgIGxldCBhbGx1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICAgICAgbGV0IHRvdGFsdXNlciA9IGFsbHVzZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBsZXQgQXZnID0gdG90YWx1c2VyIC8gMjtcbiAgICAgICAgICAgICAgICBsZXQgc2tpcCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEF2Zyk7XG5cbiAgICAgICAgICAgICAgICB1c2VycyA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHF1ZXJ5LCBsaXN0UGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlID09PSAnYmVzdCcpIHtcbiAgICAgICAgICAgICAgICBsZXQgYWxsdXNlcnMgPSBhd2FpdCBVc2VyTW9kZWwuZmluZChxdWVyeSwgbGlzdFBhcmFtcykucG9wdWxhdGUocG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgICAgIGxldCB0b3RhbHVzZXIgPSBhbGx1c2Vycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgbGV0IEF2ZyA9IHRvdGFsdXNlciAvIDI7XG4gICAgICAgICAgICAgICAgbGV0IHNraXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBBdmcpO1xuXG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhd2FpdCBVc2VyTW9kZWwuZmluZChxdWVyeSwgbGlzdFBhcmFtcykucG9wdWxhdGUocG9wdWxhdGVGaWVsZHMpLnNraXAoc2tpcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB1c2VycyA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgcXVlcnksIGxpc3RQYXJhbXMsIHBvcHVsYXRlRmllbGRzLCBzb3J0LCBsaW1pdCk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiB1c2Vycykge1xuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmoudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlY1VzZXJJZCA9IG9iai5faWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgb2JqLmRvYiA9IG9iai5kb2IgPyBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKG9iai5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5hZ2UgPSBvYmouYWdlIHx8IGF3YWl0IENvbW1vblNlcnZpY2UuZ2V0QWdlKG9iai5kb2IpO1xuICAgICAgICAgICAgICAgICAgICBvYmouaXNMaWtlID0gbG9nZ2VkSW5Vc2VyLmxpa2VzLmluY2x1ZGVzKG9iai5faWQpO1xuICAgICAgICAgICAgICAgICAgICBvYmoubGlrZWRCeSA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgeyBsaWtlczogeyAkaW46IG9iai5faWQgfSB9LCBwb3B1bGF0ZVByYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrQmxvY2tVc2VyID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyB1c2VySWQ6IF9pZCwgYmxvY2tVc2VySWQ6IHNlY1VzZXJJZCwgaXNEZWxldGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoZWNrQmxvY2tVc2VyMSA9IGF3YWl0IENoYXRibG9jay5maW5kT25lKHsgYmxvY2tVc2VySWQ6IF9pZCwgdXNlcklkOiBzZWNVc2VySWQsIGlzRGVsZXRlZDogZmFsc2UgfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICBvYmoubGF0aXR1ZGUgPSBvYmoubGF0aXR1ZGUgPT09IDAgPyAxLjEgOiBvYmoubGF0aXR1ZGU7XG4gICAgICAgICAgICAgICAgICAgIG9iai5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlID09PSAwID8gMS4xIDogb2JqLmxvbmdpdHVkZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9ja1VzZXIxID8gdHJ1ZSA6IChjaGVja0Jsb2NrVXNlciA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gW107XG4gICAgICAgICAgICAgICAgICAgIG9iai5mcmllbmQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5saWtlcyAmJiBvYmoubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpa2Ugb2Ygb2JqLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGxpa2UuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWtlczogeyAkaW46IFtvYmouX2lkXSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgWydfaWQnLCAnZ2VuZGVyJywgJ25hbWUnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZENvdW50ID0gb2JqLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmouZnJpZW5kLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG9iai5nZW5kZXIsIFwiLVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQgJiYgZGF0YS5nZW5kZXIgJiYgb2JqLmdlbmRlciAhPT0gZGF0YS5nZW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLm1hdGNoQ291bnQgPSBvYmoubWF0Y2hDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzLnB1c2gobGlrZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHVzZXJzID0gYXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB1c2Vycyk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaW5kZXhvbGQgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgdHlwZSwgc2VhcmNoLCBuYW1lLCBjb3VudHJ5LCBzdGF0ZSwgbWluQWdlLCBtYXhBZ2UsIGRpc3RyaWN0LCBnZW5kZXIsIHJlbGlnaW9uLCByZWxhdGlvbnNoaXBTdGF0dXMsIGVkdWNhdGlvbiwga3ljU3RhdHVzIH0gPSByZXEucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcycsICdnZW5kZXInXSk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHsgX2lkOiB7ICRuZTogX2lkIH0sIGlzRGVsZXRlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIGNvbnN0IHNvcnQgPSAnJztcbiAgICAgICAgICAgIGxldCBsaW1pdCA9ICcnO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdiZXN0Jykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmlzU3Vic2NyaWJlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3VnZ2VzdCcpIHtcblxuXG4gICAgICAgICAgICAgICAgLy8gY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIC8vIHF1ZXJ5LmNyZWF0ZWRBdCA9IHskbHRlOiBuZXcgRGF0ZSgpLnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMzApfTtcbiAgICAgICAgICAgICAgICAvLyBxdWVyeS5jcmVhdGVkQXQgPSB7JGx0ZTogbmV3IERhdGUoXCIyMDIxLTBcIikuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAzMCl9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmFtZSlcbiAgICAgICAgICAgICAgICBxdWVyeS5uYW1lID0geyAkcmVnZXg6IG5hbWUsICRvcHRpb25zOiBcImlcIiB9O1xuXG4gICAgICAgICAgICBpZiAobWluQWdlID4gMCAmJiBtYXhBZ2UgPiAwKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmFnZSA9IHsgJGd0ZTogbWluQWdlLCAkbHRlOiBtYXhBZ2UgfTtcblxuICAgICAgICAgICAgaWYgKGNvdW50cnkpXG4gICAgICAgICAgICAgICAgcXVlcnkuY291bnRyeSA9IGNvdW50cnk7XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZSlcbiAgICAgICAgICAgICAgICBxdWVyeS5zdGF0ZSA9IHN0YXRlO1xuXG4gICAgICAgICAgICBpZiAoZGlzdHJpY3QpXG4gICAgICAgICAgICAgICAgcXVlcnkuZGlzdHJpY3QgPSBkaXN0cmljdDtcblxuICAgICAgICAgICAgaWYgKGdlbmRlcilcbiAgICAgICAgICAgICAgICBxdWVyeS5nZW5kZXIgPSBnZW5kZXI7XG5cbiAgICAgICAgICAgIGlmIChyZWxpZ2lvbilcbiAgICAgICAgICAgICAgICBxdWVyeS5yZWxpZ2lvbiA9IHJlbGlnaW9uO1xuXG4gICAgICAgICAgICBpZiAocmVsYXRpb25zaGlwU3RhdHVzICYmIHJlbGF0aW9uc2hpcFN0YXR1cy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcXVlcnkucmVsYXRpb25zaGlwU3RhdHVzID0geyAkaW46IHJlbGF0aW9uc2hpcFN0YXR1cyB9O1xuXG4gICAgICAgICAgICBpZiAoZWR1Y2F0aW9uKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmVkdWNhdGlvbiA9IGVkdWNhdGlvbjtcblxuICAgICAgICAgICAgaWYgKHNlYXJjaCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5WyckYW5kJ10gPSBbe1xuICAgICAgICAgICAgICAgICAgICAkb3I6IFt7IG5hbWU6IHsgJHJlZ2V4OiBzZWFyY2gsICRvcHRpb25zOiBcImlcIiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHsgbW9iaWxlOiB7ICRyZWdleDogc2VhcmNoLCAkb3B0aW9uczogXCJpXCIgfSB9LFxuICAgICAgICAgICAgICAgICAgICB7IGVtYWlsOiB7ICRyZWdleDogc2VhcmNoLCAkb3B0aW9uczogXCJpXCIgfSB9XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVlcnkucm9sZSA9IFwidXNlclwiO1xuICAgICAgICAgICAgaWYgKGt5Y1N0YXR1cykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lmt5Y1N0YXR1cyA9IGt5Y1N0YXR1cztcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVByYW1zID0gWyd1c2VySWQnLCAnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJywgJ2dlbmRlcicsICdpc1N1YnNjcmliZWQnXTtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0geyBwYXRoOiAnbGlrZXMnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfTtcbiAgICAgICAgICAgIGxldCB1c2VycyA9IFtdO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzdWdnZXN0Jykge1xuXG4gICAgICAgICAgICAgICAgbGV0IGFsbHVzZXJzID0gYXdhaXQgVXNlck1vZGVsLmZpbmQocXVlcnksIGxpc3RQYXJhbXMpLnBvcHVsYXRlKHBvcHVsYXRlRmllbGRzKTtcbiAgICAgICAgICAgICAgICBsZXQgdG90YWx1c2VyID0gYWxsdXNlcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCBBdmcgPSB0b3RhbHVzZXIgLyAyO1xuICAgICAgICAgICAgICAgIGxldCBza2lwID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogQXZnKTtcblxuICAgICAgICAgICAgICAgIHVzZXJzID0gYXdhaXQgVXNlck1vZGVsLmZpbmQocXVlcnksIGxpc3RQYXJhbXMpLnBvcHVsYXRlKHBvcHVsYXRlRmllbGRzKS5za2lwKHNraXApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhd2FpdCBDb21tb24ubGlzdChVc2VyTW9kZWwsIHF1ZXJ5LCBsaXN0UGFyYW1zLCBwb3B1bGF0ZUZpZWxkcywgc29ydCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGlmICh1c2VycyAmJiB1c2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgdXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5kb2IgPSBvYmouZG9iID8gYXdhaXQgQ29tbW9uU2VydmljZS5jb252ZXJ0VGltZVRvRGF0ZShvYmouZG9iKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBvYmouYWdlID0gb2JqLmFnZSB8fCBhd2FpdCBDb21tb25TZXJ2aWNlLmdldEFnZShvYmouZG9iKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmlzTGlrZSA9IGxvZ2dlZEluVXNlci5saWtlcy5pbmNsdWRlcyhvYmouX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmxpa2VkQnkgPSBhd2FpdCBDb21tb24ubGlzdChVc2VyTW9kZWwsIHsgbGlrZXM6IHsgJGluOiBvYmouX2lkIH0gfSwgcG9wdWxhdGVQcmFtcyk7XG5cblxuICAgICAgICAgICAgICAgICAgICBvYmoubGF0aXR1ZGUgPSBvYmoubGF0aXR1ZGUgPT09IDAgPyAxLjEgOiBvYmoubGF0aXR1ZGU7XG4gICAgICAgICAgICAgICAgICAgIG9iai5sb25naXR1ZGUgPSBvYmoubG9uZ2l0dWRlID09PSAwID8gMS4xIDogb2JqLmxvbmdpdHVkZTtcblxuICAgICAgICAgICAgICAgICAgICBvYmoubWF0Y2hDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIG9iai5mcmllbmRDb3VudCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBvYmouZnJpZW5kID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoubGlrZXMgJiYgb2JqLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaWtlIG9mIG9iai5saWtlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBsaWtlLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlrZXM6IHsgJGluOiBbb2JqLl9pZF0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFsnX2lkJywgJ2dlbmRlcicsICduYW1lJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5mcmllbmRDb3VudCA9IG9iai5tYXRjaENvdW50ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmZyaWVuZC5wdXNoKGxpa2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhvYmouZ2VuZGVyLCBcIi1cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkICYmIGRhdGEuZ2VuZGVyICYmIG9iai5nZW5kZXIgIT09IGRhdGEuZ2VuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gb2JqLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoubWF0Y2hlcy5wdXNoKGxpa2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1c2VycyA9IGFycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgdXNlcnMpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBreWNyZXF1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHR5cGUsIHNlYXJjaCwgbmFtZSwgY291bnRyeSwgc3RhdGUsIG1pbkFnZSwgbWF4QWdlLCBkaXN0cmljdCwgZ2VuZGVyLCByZWxpZ2lvbiwgcmVsYXRpb25zaGlwU3RhdHVzLCBlZHVjYXRpb24sIGt5Y1N0YXR1cyB9ID0gcmVxLnF1ZXJ5O1xuICAgICAgICAgICAgY29uc3QgbG9nZ2VkSW5Vc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ25hbWUnLCAnbGlrZXMnXSk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHsgX2lkOiB7ICRuZTogX2lkIH0sIGt5Y0ltYWdlOiB7ICRuZTogbnVsbCB9LCBpc1Byb2ZpbGVQaWNWZXJpZmllZDogZmFsc2UsIGlzRGVsZXRlZDogZmFsc2UsIGt5Y1N0YXR1czogXCJwZW5kaW5nXCIgfTtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdiZXN0Jykge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmlzU3Vic2NyaWJlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3VnZ2VzdCcpIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgLy8gcXVlcnkuY3JlYXRlZEF0ID0geyRsdGU6IG5ldyBEYXRlKCkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSAzMCl9O1xuICAgICAgICAgICAgICAgIC8vIHF1ZXJ5LmNyZWF0ZWRBdCA9IHskbHRlOiBuZXcgRGF0ZShcIjIwMjEtMFwiKS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIDMwKX07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgICAgIHF1ZXJ5Lm5hbWUgPSB7ICRyZWdleDogbmFtZSwgJG9wdGlvbnM6IFwiaVwiIH07XG5cbiAgICAgICAgICAgIGlmIChtaW5BZ2UgPiAwICYmIG1heEFnZSA+IDApXG4gICAgICAgICAgICAgICAgcXVlcnkuYWdlID0geyAkZ3RlOiBtaW5BZ2UsICRsdGU6IG1heEFnZSB9O1xuXG4gICAgICAgICAgICBpZiAoY291bnRyeSlcbiAgICAgICAgICAgICAgICBxdWVyeS5jb3VudHJ5ID0gY291bnRyeTtcblxuICAgICAgICAgICAgaWYgKHN0YXRlKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnN0YXRlID0gc3RhdGU7XG5cbiAgICAgICAgICAgIGlmIChkaXN0cmljdClcbiAgICAgICAgICAgICAgICBxdWVyeS5kaXN0cmljdCA9IGRpc3RyaWN0O1xuXG4gICAgICAgICAgICBpZiAoZ2VuZGVyKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LmdlbmRlciA9IGdlbmRlcjtcblxuICAgICAgICAgICAgaWYgKHJlbGlnaW9uKVxuICAgICAgICAgICAgICAgIHF1ZXJ5LnJlbGlnaW9uID0gcmVsaWdpb247XG5cbiAgICAgICAgICAgIGlmIChyZWxhdGlvbnNoaXBTdGF0dXMgJiYgcmVsYXRpb25zaGlwU3RhdHVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICBxdWVyeS5yZWxhdGlvbnNoaXBTdGF0dXMgPSB7ICRpbjogcmVsYXRpb25zaGlwU3RhdHVzIH07XG5cbiAgICAgICAgICAgIGlmIChlZHVjYXRpb24pXG4gICAgICAgICAgICAgICAgcXVlcnkuZWR1Y2F0aW9uID0gZWR1Y2F0aW9uO1xuXG4gICAgICAgICAgICBpZiAoc2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgcXVlcnlbJyRhbmQnXSA9IFt7XG4gICAgICAgICAgICAgICAgICAgICRvcjogW3sgbmFtZTogeyAkcmVnZXg6IHNlYXJjaCwgJG9wdGlvbnM6IFwiaVwiIH0gfSxcbiAgICAgICAgICAgICAgICAgICAgeyBtb2JpbGU6IHsgJHJlZ2V4OiBzZWFyY2gsICRvcHRpb25zOiBcImlcIiB9IH0sXG4gICAgICAgICAgICAgICAgICAgIHsgZW1haWw6IHsgJHJlZ2V4OiBzZWFyY2gsICRvcHRpb25zOiBcImlcIiB9IH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoa3ljU3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgcXVlcnkua3ljU3RhdHVzID0ga3ljU3RhdHVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVlcnkucm9sZSA9IFwidXNlclwiO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocXVlcnkpO1xuXG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZVByYW1zID0gWyd1c2VySWQnLCAnbmFtZScsICdlbWFpbCcsICdtb2JpbGUnLCAncHJvZmlsZVBpYycsICdkaXN0cmljdCcsICdjb3VudHJ5JywgJ2lzUHJvZmlsZVBpY1ZlcmlmaWVkJ107XG4gICAgICAgICAgICBjb25zdCBwb3B1bGF0ZUZpZWxkcyA9IHsgcGF0aDogJ2xpa2VzJywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH07XG4gICAgICAgICAgICBsZXQgdXNlcnMgPSBhd2FpdCBDb21tb24ubGlzdChVc2VyTW9kZWwsIHF1ZXJ5LCBsaXN0UGFyYW1zLCBwb3B1bGF0ZUZpZWxkcyk7XG4gICAgICAgICAgICBpZiAodXNlcnMgJiYgdXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXJyID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIHVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iai50b09iamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBvYmouZG9iID0gb2JqLmRvYiA/IGF3YWl0IENvbW1vblNlcnZpY2UuY29udmVydFRpbWVUb0RhdGUob2JqLmRvYikgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLmFnZSA9IG9iai5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2Uob2JqLmRvYik7XG4gICAgICAgICAgICAgICAgICAgIG9iai5pc0xpa2UgPSBsb2dnZWRJblVzZXIubGlrZXMuaW5jbHVkZXMob2JqLl9pZCk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5saWtlZEJ5ID0gYXdhaXQgQ29tbW9uLmxpc3QoVXNlck1vZGVsLCB7IGxpa2VzOiB7ICRpbjogb2JqLl9pZCB9IH0sIHBvcHVsYXRlUHJhbXMpO1xuICAgICAgICAgICAgICAgICAgICBvYmoubWF0Y2hDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaGVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmoubGlrZXMgJiYgb2JqLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaWtlIG9mIG9iai5saWtlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBsaWtlLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlrZXM6IHsgJGluOiBbb2JqLl9pZF0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFsnX2lkJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5tYXRjaENvdW50ID0gb2JqLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoubWF0Y2hlcy5wdXNoKGxpa2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1c2VycyA9IGFycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgdXNlcnMpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluZCBkZXRhaWwgb2YgcmVxdWVzdGVkIHVzZXJcbiAgICAgKi9cbiAgICBzaW5nbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEVycm9ycyBvZiB0aGUgZXhwcmVzcyB2YWxpZGF0b3JzIGZyb20gcm91dGVcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IF9pZCB9LCB7IGxhc3RTY3JlZW5UaW1lOiBuZXcgRGF0ZSgpIH0pO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVQcmFtcyA9IFsndXNlcklkJywgJ25hbWUnLCAnZW1haWwnLCAnbW9iaWxlJywgJ3Byb2ZpbGVQaWMnLCAnZGlzdHJpY3QnLCAnY291bnRyeScsICdpc1Byb2ZpbGVQaWNWZXJpZmllZCcsIFwicG9wdWxhcml0eVwiLCBcIm1haWxWZXJpZnlPdHBcIiwgXCJpc01haWxWZXJpZmllZFwiXTtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0gW1xuICAgICAgICAgICAgICAgIHsgcGF0aDogJ3JlY2VudFNlYXJjaGVzJywgc2VsZWN0OiBwb3B1bGF0ZVByYW1zIH0sXG4gICAgICAgICAgICAgICAgeyBwYXRoOiAnbXlWaXNpdG9ycycsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9LFxuICAgICAgICAgICAgICAgIHsgcGF0aDogJ2ZvbGxvd2VycycsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9LFxuICAgICAgICAgICAgICAgIHsgcGF0aDogJ2ZvbGxvd2luZ3MnLCBzZWxlY3Q6IHBvcHVsYXRlUHJhbXMgfSxcbiAgICAgICAgICAgICAgICB7IHBhdGg6ICdsaWtlcycsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIgPSBhd2FpdCBDaGF0YmxvY2suZmluZE9uZSh7IHVzZXJJZDogX2lkLCBibG9ja1VzZXJJZDogaWQsIGlzRGVsZXRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBsZXQgY2hlY2tCbG9ja1VzZXIxID0gYXdhaXQgQ2hhdGJsb2NrLmZpbmRPbmUoeyBibG9ja1VzZXJJZDogX2lkLCB1c2VySWQ6IGlkLCBpc0RlbGV0ZWQ6IGZhbHNlIH0pO1xuXG5cblxuICAgICAgICAgICAgLy8gRmluZCB1c2VyIGRldGFpbHNcbiAgICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgaWQsIHBhcmFtcywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgdXNlciA9IHVzZXIudG9PYmplY3QoKTtcbiAgICAgICAgICAgIHVzZXIuYWdlID0gdXNlci5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2UodXNlci5kb2IpO1xuICAgICAgICAgICAgdXNlci5kb2IgPSBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKHVzZXIuZG9iKTtcbiAgICAgICAgICAgIHVzZXIubGlrZWRCeSA9IGF3YWl0IENvbW1vbi5saXN0KFVzZXJNb2RlbCwgeyBsaWtlczogeyAkaW46IHVzZXIuX2lkIH0gfSwgcG9wdWxhdGVQcmFtcyk7XG4gICAgICAgICAgICB1c2VyLmlzQ2hhdGJsb2NrID0gY2hlY2tCbG9ja1VzZXIxID8gdHJ1ZSA6IChjaGVja0Jsb2NrVXNlciA/IHRydWUgOiBmYWxzZSk7XG4gICAgICAgICAgICB1c2VyLm1hdGNoQ291bnQgPSAwO1xuICAgICAgICAgICAgdXNlci5tYXRjaGVzID0gW107XG5cbiAgICAgICAgICAgIHVzZXIuZnJpZW5kQ291bnQgPSAwO1xuICAgICAgICAgICAgdXNlci5mcmllbmQgPSBbXTtcblxuICAgICAgICAgICAgbGV0IG5ld0RhdGUgPSAnJztcbiAgICAgICAgICAgIGlmICh1c2VyLmxpa2VzICYmIHVzZXIubGlrZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBvYmogb2YgdXNlci5saWtlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IF9pZDogb2JqLl9pZCwgbGlrZXM6IHsgJGluOiBbaWRdIH0gfSwgWydfaWQnLCBcImdlbmRlclwiXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmZyaWVuZENvdW50ID0gdXNlci5mcmllbmRDb3VudCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmZyaWVuZC5wdXNoKG9iaik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQgJiYgZGF0YS5nZW5kZXIgJiYgdXNlci5nZW5kZXIgIT09IGRhdGEuZ2VuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLm1hdGNoQ291bnQgPSB1c2VyLm1hdGNoQ291bnQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlci5tYXRjaGVzLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VyLmlzU3Vic2NyaWJlZCkge1xuXG4gICAgICAgICAgICAgICAgbGV0IHN1YiA9IGF3YWl0IFVzZXJTdWJzY3JpcHRpb25Nb2RlbC5maW5kKHsgdXNlcklkOiBpZCB9KS5wb3B1bGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGg6ICdwbGFuSWQnLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Q6ICduYW1lIGFtb3VudCB2YWxpZGl0eSBib251cyBjcmVhdGVkQXQnXG4gICAgICAgICAgICAgICAgfSkuc29ydCh7IFwiY3JlYXRlZEF0XCI6IC0xIH0pLmxpbWl0KDEpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGUgPSBuZXcgRGF0ZShzdWJbMF0uY3JlYXRlZEF0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gcGxhbkRhdGUuc2V0RGF0ZShwbGFuRGF0ZS5nZXREYXRlKCkgKyBwYXJzZUludChzdWJbMF0ucGxhbklkLnZhbGlkaXR5LCAxMCkpO1xuICAgICAgICAgICAgICAgIG5ld0RhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgICAgICAgICBzdWJbMF0uZXhwaXJlRGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgICAgICAgICAgLy9pZiBwYWNrYWdlIGlzIGV4cGlyZVxuXG4gICAgICAgICAgICAgICAgaWYgKG5ld0RhdGUuZ2V0VGltZSgpIDwgbmV3IERhdGUoKS5nZXRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlci5zdWJzY3JpcHRpb24gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdXNlci5pc1N1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIuc3Vic2NyaXB0aW9uID0gc3ViO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJldmlld1Byb2ZpbGVuZXcoaWQsIF9pZCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coMSlcblxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VyLnNldHRpbmdzID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlclNldHRpbmdzTW9kZWwsIHsgdXNlcklkOiB1c2VyLl9pZCB9KTtcbiAgICAgICAgICAgIGxldCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsncmVjZW50U2VhcmNoZXMnLCAnbGlrZXMnXSk7XG4gICAgICAgICAgICBpZiAoaWQudG9TdHJpbmcoKSAhPT0gX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZWRJblVzZXIgPSBsb2dnZWRJblVzZXIudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAobG9nZ2VkSW5Vc2VyICYmIGxvZ2dlZEluVXNlci5yZWNlbnRTZWFyY2hlcyAmJiBsb2dnZWRJblVzZXIucmVjZW50U2VhcmNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbG9nZ2VkSW5Vc2VyLnJlY2VudFNlYXJjaGVzLmZpbmRJbmRleChlID0+IGUudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlZEluVXNlci5yZWNlbnRTZWFyY2hlcy5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlZEluVXNlci5yZWNlbnRTZWFyY2hlcyA9IFtpZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZCB9LCB7IHJlY2VudFNlYXJjaGVzOiBsb2dnZWRJblVzZXIucmVjZW50U2VhcmNoZXMgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXIuYmFubmVyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoQmFubmVyTW9kZWwsIHsgdHlwZTogJzMgTGluZSBCYW5uZXInLCBpc0RlbGV0ZWQ6IGZhbHNlIH0sIFsnbGluaycsICdpbWFnZSddKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpIC0gMzApKTtcbiAgICAgICAgICAgIHVzZXIuc3VnZ2VzdGVkVXNlciA9IGF3YWl0IFVzZXJNb2RlbC5maW5kKHtcbiAgICAgICAgICAgICAgICBfaWQ6IHsgJG5pbjogW19pZCwgaWRdIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7ICRndGU6IGRhdGUgfSxcbiAgICAgICAgICAgICAgICBpc0RlbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCBsaXN0UGFyYW1zKTtcbiAgICAgICAgICAgIHVzZXIuaXNMaWtlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgbG9nZ2VkSW5Vc2VyLmxpa2VzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iai50b1N0cmluZygpID09PSB1c2VyLl9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXIuaXNMaWtlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IExpa2VzQWxsID0gYXdhaXQgQ29tbW9uLmxpc3QoTGlrZSwge1xuICAgICAgICAgICAgICAgIHVzZXJsaWtldG86IF9pZCxcbiAgICAgICAgICAgICAgICBpc0RlbGV0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCJcbiAgICAgICAgICAgIH0sIHBhcmFtcywgeyBwYXRoOiAndXNlcmxpa2VieScsIHNlbGVjdDogcG9wdWxhdGVQcmFtcyB9KTtcbiAgICAgICAgICAgIGxldCBsaWtlQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGxpa2V2YWwgb2YgTGlrZXNBbGwpIHtcbiAgICAgICAgICAgICAgICBpZiAobGlrZXZhbC51c2VybGlrZWJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wT2JqID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNQcm9maWxlUGljVmVyaWZpZWQ6IGxpa2V2YWwudXNlcmxpa2VieSA/IGxpa2V2YWwudXNlcmxpa2VieS5pc1Byb2ZpbGVQaWNWZXJpZmllZCA6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBsaWtldmFsLnVzZXJsaWtlYnkuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9iaWxlOiBsaWtldmFsLnVzZXJsaWtlYnkubW9iaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbGlrZXZhbC51c2VybGlrZWJ5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogbGlrZXZhbC51c2VybGlrZWJ5LmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBsaWtldmFsLnVzZXJsaWtlYnkudXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRyeTogbGlrZXZhbC51c2VybGlrZWJ5LmNvdW50cnksXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0cmljdDogbGlrZXZhbC51c2VybGlrZWJ5LmRpc3RyaWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZVBpYzogbGlrZXZhbC51c2VybGlrZWJ5LnByb2ZpbGVQaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3B1bGFyaXR5OiBsaWtldmFsLnVzZXJsaWtlYnkucG9wdWxhcml0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpa2VJZDogbGlrZXZhbC5faWRcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBsaWtlQXJyYXkucHVzaCh0ZW1wT2JqKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5ld0RhdGUsIFwiRGF0ZVwiKTtcbiAgICAgICAgICAgIHVzZXIubGlrZWRCeSA9IGxpa2VBcnJheTtcbiAgICAgICAgICAgIHVzZXIuZXhwaXJlRGF0ZSA9IG5ld0RhdGU7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHVzZXIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBQYXNzd29yZFxuICAgICAqL1xuICAgIGNoYW5nZVBhc3N3b3JkID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IG9sZFBhc3N3b3JkLCBwYXNzd29yZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICAvLyBGaW5kIHVzZXIgZGV0YWlsc1xuICAgICAgICAgICAgaWYgKCFvbGRQYXNzd29yZCB8fCAhcGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5BREVRVUFURV9EQVRBKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ19pZCcsICdwYXNzd29yZCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuICAgICAgICAgICAgaWYgKCFjb21wYXJlU3luYyhvbGRQYXNzd29yZC50b1N0cmluZygpLCB1c2VyLnBhc3N3b3JkKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuV1JPTkdfUEFTU1dPUkQpIH0pO1xuICAgICAgICAgICAgcmVxLmJvZHkucGFzc3dvcmQgPSBoYXNoU3luYyhwYXNzd29yZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyBwYXNzd29yZDogcmVxLmJvZHkucGFzc3dvcmQgfSk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1Bhc3N3b3JkIENoYW5nZWQnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgc2VsZWN0ZWQgdXNlclxuICAgICAqL1xuICAgIHVwZGF0ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IGVtYWlsLCBkb2IgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgcmVxLmJvZHkudXBkYXRlZEJ5ID0gX2lkO1xuXG4gICAgICAgICAgICBpZiAoZG9iKSB7XG4gICAgICAgICAgICAgICAgcmVxLmJvZHkuZG9iID0gbmV3IERhdGUoZG9iKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB1c2VyIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnX2lkJywgJ3Byb2ZpbGVQaWMnLCAna3ljSW1hZ2UnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgaWQgaXMgaW52YWxpZFxuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlS2V5cyA9IE9iamVjdC5rZXlzKHJlcS5maWxlcyk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlc1trZXldICYmIHJlcS5maWxlc1trZXldLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZzLnVubGluayhkaXIgKyAnLycgKyByZXEuZmlsZXNba2V5XVswXS5maWxlbmFtZSwgKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVtYWlsKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgdXNlciBleGlzdHMgb3Igbm90IGZvciB0aGUgZW1haWxcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IGVtYWlsLCBfaWQ6IHsgJG5lOiBfaWQgfSwgaXNEZWxldGVkOiBmYWxzZSB9LCAnX2lkJyk7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBlbWFpbCBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuRU1BSUxfQUxSRUFEWV9FWElTVFMpIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcS5maWxlcyAmJiBPYmplY3Qua2V5cyhyZXEuZmlsZXMpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVLZXlzID0gT2JqZWN0LmtleXMocmVxLmZpbGVzKTtcbiAgICAgICAgICAgICAgICBmaWxlS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcS5maWxlc1trZXldICYmIHJlcS5maWxlc1trZXldLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2t5Y0ltYWdlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5ib2R5LmlzUHJvZmlsZVBpY1ZlcmlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdEZpbGUgPSB1c2VyW2tleV0uc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gc3BsaXRGaWxlW3NwbGl0RmlsZS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsoZGlyICsgJy8nICsgZmlsZSwgKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxLmJvZHlba2V5XSA9IHByb2Nlc3MuZW52LklNQUdFX1VSTCArIGZvbGRlck5hbWUgKyAnLycgKyByZXEuZmlsZXNba2V5XVswXS5maWxlbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcS5ib2R5LmxvbmdpdHVkZSkge1xuICAgICAgICAgICAgICAgIHJlcS5ib2R5LmxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlBvaW50XCIsXG4gICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcGFyc2VGbG9hdChyZXEuYm9keS5sb25naXR1ZGUpLCBwYXJzZUZsb2F0KHJlcS5ib2R5LmxhdGl0dWRlKV1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBjb25zb2xlLmxvZyhyZXEuYm9keS5sb2NhdGlvbik7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB1c2VyIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZCB9LCByZXEuYm9keSk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXN1bHQubWVzc2FnZSA9IHJlcS50KHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB1cGRhdGVVc2VyQnlBZG1pbiA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQYXRoIGZvciB1cGxvYWRpbmcgZmlsZXNcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0VXJsID0gcmVxLmJhc2VVcmwuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IGRpciA9ICd1cGxvYWRzLycgKyBmb2xkZXJOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBlbWFpbCwgZG9iIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIHJlcS5ib2R5LnVwZGF0ZWRCeSA9IF9pZDtcblxuICAgICAgICAgICAgaWYgKGRvYikge1xuICAgICAgICAgICAgICAgIHJlcS5ib2R5LmRvYiA9IG5ldyBEYXRlKGRvYikuZ2V0VGltZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdXNlciBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgaWQsIFsnX2lkJywgJ3Byb2ZpbGVQaWMnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgaWQgaXMgaW52YWxpZFxuICAgICAgICAgICAgaWYgKCF1c2VyKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9JRCkgfSk7XG4gICAgICAgICAgICBpZiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayB1c2VyIGV4aXN0cyBvciBub3QgZm9yIHRoZSBlbWFpbFxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHsgZW1haWwsIF9pZDogeyAkbmU6IGlkIH0sIGlzRGVsZXRlZDogZmFsc2UgfSwgJ19pZCcpO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgZW1haWwgYWxyZWFkeSBleGlzdHNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkVNQUlMX0FMUkVBRFlfRVhJU1RTKSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXEuZmlsZSAmJiByZXEuZmlsZS5maWxlbmFtZSkge1xuICAgICAgICAgICAgICAgIC8vIERlbGV0ZSBvbGQgZmlsZSBpZiBuZXcgZmlsZSBpcyB0aGVyZSB0byB1cGxvYWRcbiAgICAgICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyLnByb2ZpbGVQaWMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BsaXRGaWxlID0gdXNlci5wcm9maWxlUGljLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBzcGxpdEZpbGVbc3BsaXRGaWxlLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICBmcy51bmxpbmsoZGlyICsgJy8nICsgZmlsZSwgKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNldCBwYXRoIGZvciBuZXcgZmlsZVxuICAgICAgICAgICAgICAgIHJlcS5ib2R5LnByb2ZpbGVQaWMgPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSB1c2VyIGRhdGFcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogaWQgfSwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2UgPSByZXEudChyZXN1bHQubWVzc2FnZSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgc2VsZWN0ZWQgdXNlclxuICAgICAqL1xuICAgIHJlbW92ZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIEZpbmQgdXNlciBkZXRhaWxzXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgaWQsIFsnX2lkJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlzIGludmFsaWRcbiAgICAgICAgICAgIGlmICghdXNlcikgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOVkFMSURfSUQpIH0pO1xuICAgICAgICAgICAgLy8gU29mdCBkZWxldGUgdXNlclxuICAgICAgICAgICAgLy8gYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBpZCB9LCB7IGlzRGVsZXRlZDogdHJ1ZSwgdXBkYXRlZEJ5OiByZXEudXNlci5faWQgfSk7XG4gICAgICAgICAgICBhd2FpdCBVc2VyTW9kZWwuZGVsZXRlT25lKHsgX2lkOiBpZCB9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiByZXEudChjb25zdGFudHMuREVMRVRFRClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUHJvZmlsZSBNYXRjaGluZ1xuICAgICAqL1xuICAgIG1hdGNoUHJvZmlsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB1c2VySWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCBtYXRjaFBhcmFtcyA9IFsncmVsYXRpb25zaGlwU3RhdHVzJywgJ2xvb2tpbmdGb3InLCAnYmxvb2RHcm91cCcsICdoZWlnaHQnLCAnYm9keVR5cGUnLCAnc21va2VyJyxcbiAgICAgICAgICAgICAgICAnZHJ1bmtlcicsICdlZHVjYXRpb24nLCAnd29ya3NwYWNlJywgJ2NvdW50cnknLCAnc3RhdGUnLCAnZGlzdHJpY3QnXTtcbiAgICAgICAgICAgIGxldCBzZWxmRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgbWF0Y2hQYXJhbXMpO1xuICAgICAgICAgICAgbGV0IHBhcnRuZXJJbmZvID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBtYXRjaFBhcmFtcyk7XG4gICAgICAgICAgICBzZWxmRGF0YSA9IHNlbGZEYXRhLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICBwYXJ0bmVySW5mbyA9IHBhcnRuZXJJbmZvLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICBjb25zdCB0b3RhbCA9IE9iamVjdC5rZXlzKHNlbGZEYXRhKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgbGV0IG1hdGNoQ291bnRzID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNlbGZEYXRhKSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09IFwiX2lkXCIgJiYgcGFydG5lckluZm9ba2V5XSA9PT0gdmFsdWUpIG1hdGNoQ291bnRzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gKG1hdGNoQ291bnRzIC8gdG90YWwgKiAxMDApLnRvRml4ZWQoMikgKyAnJSc7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogXCJQcm9maWxlIE1hdGNoZWRcIiwgcGVyY2VudGFnZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRm9sbG93IC8gVW5mb2xsb3cgVXNlclxuICAgICAqL1xuICAgIGZvbGxvd1VuZm9sbG93VXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB1c2VySWQgfSA9IHJlcS5wYXJhbXM7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBsZXQgc2VsZkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdmb2xsb3dpbmdzJ10pO1xuICAgICAgICAgICAgbGV0IHBhcnRuZXJJbmZvID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBbJ25hbWUnLCAnZm9sbG93ZXJzJywgJ2RldmljZVRva2VuJ10pO1xuICAgICAgICAgICAgY29uc3QgZm9sbG93SW5kZXggPSBzZWxmRGF0YS5mb2xsb3dpbmdzLmluZGV4T2YocGFydG5lckluZm8uX2lkKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGxvd2VySW5kZXggPSBwYXJ0bmVySW5mby5mb2xsb3dlcnMuaW5kZXhPZihzZWxmRGF0YS5faWQpO1xuICAgICAgICAgICAgc2VsZkRhdGEgPSBzZWxmRGF0YS50b09iamVjdCgpO1xuICAgICAgICAgICAgcGFydG5lckluZm8gPSBwYXJ0bmVySW5mby50b09iamVjdCgpO1xuICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgICAgICAgIGxldCBmbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChmb2xsb3dJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBzZWxmRGF0YS5mb2xsb3dpbmdzLnB1c2gocGFydG5lckluZm8uX2lkKTtcbiAgICAgICAgICAgICAgICBwYXJ0bmVySW5mby5mb2xsb3dlcnMucHVzaChzZWxmRGF0YS5faWQpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgWW91IGFyZSBmb2xsb3dpbmcgJHtwYXJ0bmVySW5mby5uYW1lfWA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGZEYXRhLmZvbGxvd2luZ3Muc3BsaWNlKGZvbGxvd0luZGV4LCAxKTtcbiAgICAgICAgICAgICAgICBwYXJ0bmVySW5mby5mb2xsb3dlcnMuc3BsaWNlKGZvbGxvd2VySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgWW91IGFyZSB1bmZvbGxvd2luZyAke3BhcnRuZXJJbmZvLm5hbWV9YDtcbiAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHNlbGZEYXRhLl9pZCB9LCB7IGZvbGxvd2luZ3M6IHNlbGZEYXRhLmZvbGxvd2luZ3MgfSk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHBhcnRuZXJJbmZvLl9pZCB9LCB7IGZvbGxvd2VyczogcGFydG5lckluZm8uZm9sbG93ZXJzIH0pO1xuXG4gICAgICAgICAgICBpZiAocGFydG5lckluZm8uZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGZsYWcgPyBgIGhhcyBzdGFydGVkIGZvbGxvd2luZyB5b3UuYCA6IGAgaXMgbm93IG5vdCBmb2xsb3dpbmcgeW91LmAsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGZsYWcgPyBgIGhhcyBzdGFydGVkIGZvbGxvd2luZyB5b3UuYCA6IGAgaXMgbm93IG5vdCBmb2xsb3dpbmcgeW91LmAsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiBwYXJ0bmVySW5mby5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEJ5OiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXZpZXcgUHJvZmlsZVxuICAgICAqL1xuICAgIHJldmlld1Byb2ZpbGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgdXNlcklkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgbGV0IGxvZ2dlZEluVXNlciA9IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJ10pO1xuICAgICAgICAgICAgbGV0IHVzZXJEYXRhID0gQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBbJ215VmlzaXRvcnMnLCAnZGV2aWNlVG9rZW4nXSk7XG4gICAgICAgICAgICBpZiAodXNlckRhdGEubXlWaXNpdG9ycyAmJiB1c2VyRGF0YS5teVZpc2l0b3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdXNlckRhdGEubXlWaXNpdG9ycy5pbmRleE9mKF9pZCk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzLnB1c2goX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVzZXJEYXRhLm15VmlzaXRvcnMgPSBbX2lkXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VySWQgfSwgeyBteVZpc2l0b3JzOiB1c2VyRGF0YS5teVZpc2l0b3JzIH0pO1xuICAgICAgICAgICAgY29uc3QgcmV2aWV3ZWRVc2VyID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBwYXJhbXMpO1xuXG4gICAgICAgICAgICBpZiAodXNlckRhdGEuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGAgaGFzIHZpZXdlZCB5b3VyIHByb2ZpbGUuYCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYCBoYXMgdmlld2VkIHlvdXIgcHJvZmlsZS5gLFxuICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlckRhdGEuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ1Jldmlld2VkIFByb2ZpbGUnLCByZXZpZXdlZFVzZXIgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXZpZXdQcm9maWxlbmV3ID0gYXN5bmMgKHVzZXJJZCwgX2lkKSA9PiB7XG4gICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgIGlmICh1c2VySWQudG9TdHJpbmcoKSAhPT0gX2lkLnRvU3RyaW5nKCkpIHtcblxuICAgICAgICAgICAgICAgIGxldCB1c2VyRGF0YSA9IGF3YWl0IFVzZXJNb2RlbC5maW5kQnlJZCh1c2VySWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhLm15VmlzaXRvcnMgJiYgdXNlckRhdGEubXlWaXNpdG9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB1c2VyRGF0YS5teVZpc2l0b3JzLmluZGV4T2YoX2lkKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5teVZpc2l0b3JzLnB1c2goX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhLm15VmlzaXRvcnMgPSBbX2lkXTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcklkIH0sIHsgbXlWaXNpdG9yczogdXNlckRhdGEubXlWaXNpdG9ycyB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXZpZXdlZFVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCB1c2VySWQsIHBhcmFtcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAodXNlckRhdGEuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVXNlcjogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBgIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgIGhhcyB2aWV3ZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogdXNlckRhdGEuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogX2lkXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMaWtlICYgRGlzbGlrZSBVc2VyXG4gICAgICovXG4gICAgbGlrZURpc2xpa2VVc2VyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHVzZXJJZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGxldCB1c2VyRGF0YSA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJywgJ2xpa2VzJ10pO1xuICAgICAgICAgICAgbGV0IG90aGVyVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIHVzZXJJZCwgWydkZXZpY2VUb2tlbicsIFsnbGlrZXMnXV0pO1xuICAgICAgICAgICAgbGV0IGNoZWNrTGlrZSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKExpa2UsIHsgdXNlcmxpa2VieTogX2lkLCB1c2VybGlrZXRvOiB1c2VySWQsIGlzRGVsZXRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBsZXQgY2hlY2tMaWtlT3RoZXIgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShMaWtlLCB7IHVzZXJsaWtlYnk6IHVzZXJJZCwgdXNlcmxpa2V0bzogX2lkLCBpc0RlbGV0ZWQ6IGZhbHNlLCBzdGF0dXM6IFwicGVuZGluZ1wiIH0pO1xuXG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgbGV0IGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHVzZXJEYXRhICYmIHVzZXJEYXRhLmxpa2VzICYmIHVzZXJEYXRhLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaWZcIilcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHVzZXJEYXRhLmxpa2VzLmluZGV4T2YodXNlcklkKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEYXRhLmxpa2VzLnB1c2godXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9ICdVc2VyIGxpa2VkJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGF0YS5saWtlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgZGlzbGlrZWQnO1xuICAgICAgICAgICAgICAgICAgICBmbGFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmlnaHQgcGxhY2VcIik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvdGhlclVzZXIgJiYgb3RoZXJVc2VyLmxpa2VzICYmIG90aGVyVXNlci5saWtlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmlnaHQgY29uZGl0aW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJJbmRleCA9IG90aGVyVXNlci5saWtlcy5pbmRleE9mKF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImluZGV4XCIsIG90aGVySW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVySW5kZXggPT09IC0xKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3RoZXJVc2VyLmxpa2VzLnNwbGljZShvdGhlckluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib3RoZXIgZGF0YVwiLCBvdGhlclVzZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IG90aGVyVXNlci5faWQgfSwgeyBsaWtlczogb3RoZXJVc2VyLmxpa2VzIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrTGlrZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTGlrZSwgeyBfaWQ6IGNoZWNrTGlrZS5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmxpa2VieTogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmxpa2V0bzogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0RlbGV0ZWQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2tMaWtlT3RoZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShMaWtlLCB7IF9pZDogY2hlY2tMaWtlT3RoZXIuX2lkIH0sIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcImFjY2VwdGVkXCIsXG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmxhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShMaWtlLCB7IHVzZXJsaWtlYnk6IF9pZCwgdXNlcmxpa2V0bzogdXNlcklkLCBzdGF0dXM6IFwicGVuZGluZ1wiIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJlbHNlXCIpXG4gICAgICAgICAgICAgICAgdXNlckRhdGEubGlrZXMgPSBbdXNlcklkXTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJ1VzZXIgbGlrZWQnO1xuXG5cbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tMaWtlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZSAtIGlmXCIpXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTGlrZSwgeyBfaWQ6IGNoZWNrTGlrZS5faWQgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmxpa2VieTogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmxpa2V0bzogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInJlamVjdGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0RlbGV0ZWQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hlY2tMaWtlT3RoZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJlbHNlIC0gZWxzZSBpZlwiKVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKExpa2UsIHsgX2lkOiBjaGVja0xpa2VPdGhlci5faWQgfSwge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIixcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZSAtIGVsc2UgXCIpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGZsYWcpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmbGFnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKExpa2UsIHsgdXNlcmxpa2VieTogX2lkLCB1c2VybGlrZXRvOiB1c2VySWQsIHN0YXR1czogXCJwZW5kaW5nXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG90aGVyVXNlci5kZXZpY2VUb2tlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRvVXNlcjogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZmxhZyA/IGAgbGlrZWQgeW91ciBwcm9maWxlLmAgOiBgIGRpc2xpa2VkIHlvdXIgcHJvZmlsZS5gLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBmbGFnID8gYCBsaWtlZCB5b3VyIHByb2ZpbGUuYCA6IGAgZGlzbGlrZWQgeW91ciBwcm9maWxlLmAsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiBvdGhlclVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXJEYXRhLl9pZCB9LCB7IGxpa2VzOiB1c2VyRGF0YS5saWtlcyB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZSBVc2VyXG4gICAgICovXG4gICAgc3Vic2NyaWJlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHN1YnNjcmlwdGlvbklkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ2lzU3Vic2NyaWJlZCcsICd3YWxsZXQnXSk7XG4gICAgICAgICAgICBpZiAodXNlckRhdGEgJiYgdXNlckRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHBsYW5JZDogc3Vic2NyaXB0aW9uSWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYW5EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFBsYW5Nb2RlbCwgc3Vic2NyaXB0aW9uSWQsIFsnYm9udXMnXSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gdXNlckRhdGEud2FsbGV0ID8gdXNlckRhdGEud2FsbGV0ICsgcGxhbkRhdGEuYm9udXMgOiBwbGFuRGF0YS5ib251cztcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU3Vic2NyaXB0aW9uTW9kZWwsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25EYXRhICYmIHN1YnNjcmlwdGlvbkRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlckRhdGEuX2lkIH0sIHsgaXNTdWJzY3JpYmVkOiB0cnVlLCB3YWxsZXQgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiU3Vic2NyaXB0aW9uIHN1Y2Nlc3NmdWxseSBkb25lXCJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlIFVzZXIgQnkgQWRtaW4gKEdpdmUgYXdheSlcbiAgICAgKi9cbiAgICBzdWJzY3JpYmVCeUFkbWluID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHBsYW5JZCwgdXNlcklkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgdXNlcklkLCBbJ2lzU3Vic2NyaWJlZCcsICd3YWxsZXQnXSk7XG4gICAgICAgICAgICBpZiAodXNlckRhdGEgJiYgdXNlckRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICBwbGFuSWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYW5EYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFBsYW5Nb2RlbCwgcGxhbklkLCBbJ2JvbnVzJ10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhbGxldCA9IHVzZXJEYXRhLndhbGxldCA/IHVzZXJEYXRhLndhbGxldCArIHBsYW5EYXRhLmJvbnVzIDogcGxhbkRhdGEuYm9udXM7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uRGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoVXNlclN1YnNjcmlwdGlvbk1vZGVsLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uRGF0YSAmJiBzdWJzY3JpcHRpb25EYXRhLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXJEYXRhLl9pZCB9LCB7IGlzU3Vic2NyaWJlZDogdHJ1ZSwgd2FsbGV0IH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcInBsYW4gc3VjY2Vzc2Z1bGx5IGRvbmVcIlxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVc2VycyB3aG8gaGF2ZSB2aXNpdGVkIG1lXG4gICAgICovXG4gICAgbXlWaXNpdG9ycyA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ215VmlzaXRvcnMnLFxuICAgICAgICAgICAgICAgIHNlbGVjdDogWyduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ215VmlzaXRvcnMnXSwgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG15VmlzaXRvcnM6IHVzZXJEYXRhLm15VmlzaXRvcnMgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE15IEJlc3QgTWF0Y2hlc1xuICAgICAqL1xuICAgIG15QmVzdE1hdGNoZXMgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0ge1xuICAgICAgICAgICAgICAgIHBhdGg6ICdsaWtlcycsXG4gICAgICAgICAgICAgICAgc2VsZWN0OiBbJ3VzZXJJZCcsICduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnLCBcImdlbmRlclwiXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ2xpa2VzJywgXCJnZW5kZXJcIl0sIHBvcHVsYXRlRmllbGRzKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSBbXTtcblxuICAgICAgICAgICAgY29uc3QgZnJpZW5kID0gW107XG5cbiAgICAgICAgICAgIGlmICh1c2VyRGF0YSAmJiB1c2VyRGF0YS5saWtlcyAmJiB1c2VyRGF0YS5saWtlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiB1c2VyRGF0YS5saWtlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IF9pZDogb2JqLl9pZCwgbGlrZXM6IHsgJGluOiBbX2lkXSB9IH0sIFsnX2lkJywgXCJnZW5kZXJcIl0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJpZW5kLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhfaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLl9pZCAmJiBkYXRhLmdlbmRlciAmJiB1c2VyRGF0YS5nZW5kZXIgIT09IGRhdGEuZ2VuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2gob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtYXRjaGVzLCBmcmllbmQgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBzaW5nbGUgdXNlciBpbiByZWNlbnQgbGlzdFxuICAgICAqL1xuICAgIHJlY2VudFNpbmdsZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhID0gYXdhaXQgQ29tbW9uLmZpbmRCeUlkKFVzZXJNb2RlbCwgX2lkLCBbJ3JlY2VudFNlYXJjaGVzJ10pO1xuICAgICAgICAgICAgY29uc3QgcmVjZW50QXJyYXkgPSB1c2VyRGF0YS5yZWNlbnRTZWFyY2hlcztcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcmVjZW50QXJyYXkuZmluZEluZGV4KGUgPT4gZS50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZWNlbnRBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkIH0sIHsgcmVjZW50U2VhcmNoZXM6IHJlY2VudEFycmF5IH0pO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgcmVjZW50IGxpc3RcbiAgICAgKi9cbiAgICByZWNlbnREZWxldGVBbGwgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZCB9LCB7IHJlY2VudFNlYXJjaGVzOiBbXSB9KTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlzdCBmb3IgbXkgSW52aXRlIEhpc3RvcnlcbiAgICAgKi9cbiAgICBteUludml0ZUhpc3RvcnkgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlUGFyYW1zID0gWyduYW1lJywgJ2VtYWlsJywgJ21vYmlsZScsICdwcm9maWxlUGljJywgJ2Rpc3RyaWN0JywgJ2NvdW50cnknLCAnaXNQcm9maWxlUGljVmVyaWZpZWQnXTtcbiAgICAgICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0gW3tcbiAgICAgICAgICAgICAgICBwYXRoOiAncmVmZXJyZWRCeScsIHNlbGVjdDogcG9wdWxhdGVQYXJhbXNcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBwYXRoOiAncmVmZXJyZWRUbycsIHNlbGVjdDogcG9wdWxhdGVQYXJhbXNcbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgY29uc3QgaW52aXRlUGFyYW1zID0gWydyZWZlcnJlZEJ5JywgJ3JlZmVycmVkVG8nLCAnY3JlYXRlZEF0J107XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24ubGlzdChJbnZpdGVIaXN0b3J5TW9kZWwsIHsgcmVmZXJyZWRCeTogX2lkIH0sIGludml0ZVBhcmFtcywgcG9wdWxhdGVGaWVsZHMpO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNeSB0b3AgZmFuc1xuICAgICAqL1xuICAgIG15VG9wRmFucyA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCwgdHlwZSB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKF9pZCk7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcblxuICAgICAgICAgICAgbGV0IGdpZnRlZEJ5ID0gYXdhaXQgU2VuZEdpZnRNb2RlbC5maW5kKHsgZ2lmdGVkVG86IGlkIH0pLnBvcHVsYXRlKFsndXNlcklkJywgXCJnaWZ0SWRcIl0pLnNvcnQoeyAnX2lkJzogMSB9KTtcblxuICAgICAgICAgICAgbGV0IHVzZXJzID0gW107XG4gICAgICAgICAgICAvKiAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAvLyBnaWZ0ZWRCeSA9IF8udW5pcUJ5KGdpZnRlZEJ5LCAndXNlcklkLl9pZCcpO1xuICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICAgdXNlcnMucHVzaChvYmoudXNlcklkKTtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0gKi9cblxuICAgICAgICAgICAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wT2JqZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZSA9IG9iai51c2VySWQudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUuZG9iID0gb2JqLnVzZXJJZCA/IGF3YWl0IENvbW1vblNlcnZpY2UuY29udmVydFRpbWVUb0RhdGUob2JqLnVzZXJJZC5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmFnZSA9IG9iai51c2VySWQgPyBvYmoudXNlcklkLmFnZSB8fCBhd2FpdCBDb21tb25TZXJ2aWNlLmdldEFnZShvYmoudXNlcklkLmRvYikgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUuaXNMaWtlID0gbG9nZ2VkSW5Vc2VyLmxpa2VzLmluY2x1ZGVzKG9iai51c2VySWQuX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUucG9wdWxhcml0eSA9IG9iai5naWZ0SWQucG9wdWxhcml0eSAqIG9iai5xdWFudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cob2JqLmdpZnRJZC5wb3B1bGFyaXR5LFwiU1wiLG9iai5xdWFudGl0eSk7XG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKHRlbXBPYmplKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXJyW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXJyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGIucG9wdWxhcml0eSAtIGEucG9wdWxhcml0eSB9KTtcblxuXG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbmV3dXNlcnMgPSB1c2Vycy5zbGljZSgwLCAyMCk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIG5ld3VzZXJzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIG15VG9wRmFuc29sZCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IGxvZ2dlZEluVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIF9pZCwgWyduYW1lJywgJ2xpa2VzJ10pO1xuXG4gICAgICAgICAgICBsZXQgZ2lmdGVkQnkgPSBhd2FpdCBDb21tb24ubGlzdChTZW5kR2lmdE1vZGVsLCB7IGdpZnRlZFRvOiBpZCB9LCBbJ3VzZXJJZCddLCB7XG4gICAgICAgICAgICAgICAgcGF0aDogJ3VzZXJJZCcsXG4gICAgICAgICAgICAgICAgc2VsZWN0OiBsaXN0UGFyYW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGdpZnRlZEJ5KVxuICAgICAgICAgICAgbGV0IHVzZXJzID0gW107XG4gICAgICAgICAgICBpZiAoZ2lmdGVkQnkgJiYgZ2lmdGVkQnkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZ2lmdGVkQnkgPSBfLnVuaXFCeShnaWZ0ZWRCeSwgJ3VzZXJJZC5faWQnKTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuICAgICAgICAgICAgICAgICAgICB1c2Vycy5wdXNoKG9iai51c2VySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiB1c2Vycykge1xuICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmoudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLmRvYiA9IG9iai5kb2IgPyBhd2FpdCBDb21tb25TZXJ2aWNlLmNvbnZlcnRUaW1lVG9EYXRlKG9iai5kb2IpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5hZ2UgPSBvYmouYWdlIHx8IGF3YWl0IENvbW1vblNlcnZpY2UuZ2V0QWdlKG9iai5kb2IpO1xuICAgICAgICAgICAgICAgICAgICBvYmouaXNMaWtlID0gbG9nZ2VkSW5Vc2VyLmxpa2VzLmluY2x1ZGVzKG9iai5faWQpO1xuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChvYmopO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB1c2VycyA9IGFycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgdXNlcnMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBibG9ja1VuYmxvY2tVc2VyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIGlkLCBbJ2lzQmxvY2tlZCddKTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogaWQgfSwgeyBpc0Jsb2NrZWQ6ICF1c2VyLmlzQmxvY2tlZCB9KTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiAnVXNlciAnICsgKHVzZXIuaXNCbG9ja2VkID8gJ1VuYmxvY2tlZCcgOiAnQmxvY2tlZCcpIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBnaXZlQXdheVRvVXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyB1c2VySWQsIGdpZnRJZCwgcGxhbklkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCB1c2VySWQsIFsnbmFtZScsICd3YWxsZXQnLCAncG9wdWxhcml0eSddKTtcblxuICAgICAgICAgICAgaWYgKHBsYW5JZCkge1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcGxhbkRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoUGxhbk1vZGVsLCBwbGFuSWQsIFsnYm9udXMnXSk7XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKFVzZXJHaWZ0UGxhbiwgeyB1c2VySWQ6IHVzZXJJZCwgcGxhbklkOiBwbGFuSWQsIHN0YXR1czogXCJwZW5kaW5nXCIgfSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0ID0gdXNlci53YWxsZXQgPyB1c2VyLndhbGxldCArIHBsYW5EYXRhLmJvbnVzIDogcGxhbkRhdGEuYm9udXM7XG4gICAgICAgICAgICAgICAgLy8gY29uc3Qgc3Vic2NyaXB0aW9uRGF0YSA9IGF3YWl0IENvbW1vbi5jcmVhdGUoVXNlclN1YnNjcmlwdGlvbk1vZGVsLCB7IHVzZXJJZCwgcGxhbklkIH0pO1xuICAgICAgICAgICAgICAgIC8vIGlmIChzdWJzY3JpcHRpb25EYXRhICYmIHN1YnNjcmlwdGlvbkRhdGEuX2lkKSB7XG4gICAgICAgICAgICAgICAgLy8gYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VyLl9pZCB9LCB7IGlzU3Vic2NyaWJlZDogdHJ1ZSwgd2FsbGV0IH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyB3YWxsZXQgfSk7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVxLmJvZHkucGxhbklkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdpZnRJZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdpZnQgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoR2lmdE1vZGVsLCBnaWZ0SWQsIFsnem9sZScsICdwb3B1bGFyaXR5J10pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGdpZnRJZCxcbiAgICAgICAgICAgICAgICAgICAgZ2lmdGVkVG86IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHF1YW50aXR5OiAxLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi5jcmVhdGUoU2VuZEdpZnRNb2RlbCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3V2FsbGV0T2ZHaWZ0ID0gdXNlci53YWxsZXQgPyB1c2VyLndhbGxldCArIGdpZnQuem9sZSA6IGdpZnQuem9sZTtcbiAgICAgICAgICAgICAgICAvLyAgY29uc3QgbmV3UG9wdWxhcml0eSA9IHVzZXIucG9wdWxhcml0eSArIGdpZnQucG9wdWxhcml0eTtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXJJZCB9LCB7IHdhbGxldDogbmV3V2FsbGV0T2ZHaWZ0LyogLCBwb3B1bGFyaXR5OiBuZXdQb3B1bGFyaXR5ICAqLyB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVxLmJvZHkuZ2lmdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdHaWZ0IFJlY2VpdmVkJyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYEFkbWluIGhhcyBzZW50IHlvdSBnaWZ0IG9mICR7Z2lmdC56b2xlfSB6b2xlc2AsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiB1c2VyLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcS5ib2R5LmNyZWF0ZWRCeSA9IHJlcS5ib2R5LnVwZGF0ZWRCeSA9IF9pZDtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi5jcmVhdGUoR2l2ZUF3YXlNb2RlbCwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2U6ICdHaXZlIEF3YXkgc2VudCBTdWNjZXNzZnVsbHkgdG8gdXNlciAnICsgdXNlci5uYW1lIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGdpdmVBd2F5TGlzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbeyBwYXRoOiAncGxhbklkJywgc2VsZWN0OiAnbmFtZScgfSwgeyBwYXRoOiAnZ2lmdElkJywgc2VsZWN0OiAnem9sZScgfSwge1xuICAgICAgICAgICAgICAgIHBhdGg6ICd1c2VySWQnLFxuICAgICAgICAgICAgICAgIHNlbGVjdDogJ25hbWUgdXNlcklkJ1xuICAgICAgICAgICAgfV07XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24ubGlzdChHaXZlQXdheU1vZGVsLCB7IGNyZWF0ZWRCeTogX2lkIH0sIFsncGxhbklkJywgJ2dpZnRJZCcsICd1c2VySWQnLCAnY3JlYXRlZEF0J10sIHBvcHVsYXRlRmllbGRzKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmVyaWZ5VXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogaWQgfSwgeyBpc1Byb2ZpbGVQaWNWZXJpZmllZDogdHJ1ZSwga3ljU3RhdHVzOiBcImNvbXBsZXRlZFwiIH0pO1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgaWYgKHVzZXIuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25EYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0b1VzZXI6IGlkLFxuICAgICAgICAgICAgICAgICAgICBmcm9tVXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ0tZQyBpcyBhcHByb3ZlZCcsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGB5b3VyIEtZQyByZXF1ZXN0IGlzIGFwcHJvdmVkIGAsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZVRva2VuOiB1c2VyLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZEJ5OiBfaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE5vdGlmaWNhdGlvbihub3RpZmljYXRpb25EYXRhKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2U6ICdVc2VyIFZlcmlmaWVkJyB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYWNjZXB0TGlrZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCwgc3RhdHVzIH0gPSByZXEucGFyYW1zO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgbGV0IGxpa2VEYXRhID0gYXdhaXQgTGlrZS5maW5kQnlJZChpZCk7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IFwiYWNjZXB0ZWRcIikge1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoTGlrZSwgeyBfaWQ6IGlkIH0sIHsgc3RhdHVzOiBzdGF0dXMgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKExpa2UsIHsgX2lkOiBpZCB9LCB7IHN0YXR1czogc3RhdHVzLCBpc0RlbGV0ZWQ6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHVzZXJJZCA9IGxpa2VEYXRhLnVzZXJsaWtlYnk7XG4gICAgICAgICAgICBjb25zdCBfaWQgPSBsaWtlRGF0YS51c2VybGlrZXRvO1xuICAgICAgICAgICAgbGV0IG90aGVyVXNlciA9IGF3YWl0IENvbW1vbi5maW5kQnlJZChVc2VyTW9kZWwsIGxpa2VEYXRhLnVzZXJsaWtlYnksIFsnbGlrZXMnXSk7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSBcImFjY2VwdGVkXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgdXNlckRhdGEgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBsaWtlRGF0YS51c2VybGlrZXRvLCBbJ25hbWUnLCAnbGlrZXMnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXJEYXRhICYmIHVzZXJEYXRhLmxpa2VzICYmIHVzZXJEYXRhLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHVzZXJEYXRhLmxpa2VzLmluZGV4T2YodXNlcklkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEubGlrZXMucHVzaCh1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlckRhdGEubGlrZXMgPSBbdXNlcklkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBsaWtlRGF0YS51c2VybGlrZXRvIH0sIHsgbGlrZXM6IHVzZXJEYXRhLmxpa2VzIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG90aGVyVXNlciAmJiBvdGhlclVzZXIubGlrZXMgJiYgb3RoZXJVc2VyLmxpa2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdGhlckluZGV4ID0gb3RoZXJVc2VyLmxpa2VzLmluZGV4T2YoX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG90aGVySW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdGhlclVzZXIubGlrZXMuc3BsaWNlKG90aGVySW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogb3RoZXJVc2VyLl9pZCB9LCB7IGxpa2VzOiBvdGhlclVzZXIubGlrZXMgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2U6ICdTdGF0dXMgVXBkYXRlZCcgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGludml0ZXNFYXJuID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKF9pZCk7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBsZXQgbGlrZURhdGEgPSBhd2FpdCBJbnZpdGVSZXdhcmQuZmluZE9uZSh7IGlzRGVsZXRlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsaWtlRGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgem9sZXM6IGxpa2VEYXRhLnpvbGUgPyBsaWtlRGF0YS56b2xlIDogMCwgcG9wdWxhcml0eTogbGlrZURhdGEucG9wdWxhcml0eSA/IGxpa2VEYXRhLnBvcHVsYXJpdHkgOiAwLCBtZXNzYWdlOiBsaWtlRGF0YS5tZXNzYWdlID8gbGlrZURhdGEubWVzc2FnZSA6IDAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGt5Y0ltYWdlVXBsb2FkID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG5cblxuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB1c2VyIGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnX2lkJywgJ3Byb2ZpbGVQaWMnLCAna3ljSW1hZ2UnLCAna3ljU3RhdHVzJ10pO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlkIGlzIGludmFsaWRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLmt5Y1N0YXR1cyA9PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgXCJtZXNzYWdlXCI6IFwiVmVyaWZpY2F0aW9uIFByb2Nlc3MgaXMgcGVuZGluZyBcIiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLyogICAgaWYodXNlci5reWNTdGF0dXM9PVwicmVqZWN0ZWRcIilcbiAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwge1wibWVzc2FnZVwiOlwiWW91ciBreWMgaXMgcmVqZWN0ZWQucGxlYXNlIHVwbG9hZCBhZ2FpblwifSk7XG4gICAgICAgICAgICAgICAgICAgfSAqL1xuICAgICAgICAgICAgICAgIGlmIChyZXEuZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzcGxpdFVybCA9IHJlcS5iYXNlVXJsLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlck5hbWUgPSBzcGxpdFVybFtzcGxpdFVybC5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgcmVxLmJvZHkua3ljSW1hZ2UgPSBwcm9jZXNzLmVudi5JTUFHRV9VUkwgKyBmb2xkZXJOYW1lICsgJy8nICsgcmVxLmZpbGUuZmlsZW5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5ib2R5Lmt5Y1N0YXR1cyA9IFwicGVuZGluZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQgfSwgcmVxLmJvZHkpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQubWVzc2FnZSA9IHJlcS50KHJlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBcIm1lc3NhZ2VcIjogXCJpbnZhbGlkIHVzZXIgaWRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVqZWN0VXNlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyTW9kZWwuZmluZEJ5SWQoaWQpO1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBpZCB9LCB7IGlzUHJvZmlsZVBpY1ZlcmlmaWVkOiBmYWxzZSwga3ljU3RhdHVzOiBcInJlamVjdGVkXCIgfSk7XG5cbiAgICAgICAgICAgIGlmICh1c2VyLmRldmljZVRva2VuKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG9Vc2VyOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZnJvbVVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdLWUMgaXMgcmVqZWN0ZWQnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgeW91ciBLWUMgcmVxdWVzdCBpcyByZWplY3RlZCBwbGVhc2UgdXBsb2FkIGFnYWluYCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IHVzZXIuZGV2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogX2lkLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IF9pZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ1VzZXIgVmVyaWZpZWQnIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVsZXRlUmVxdWVzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgVXNlckRlbGV0ZVJlcXVlc3QuZmluZE9uZSh7IFwidXNlcklkXCI6IGlkIH0pO1xuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMSwgeyBtZXNzYWdlOiAncmVxdWVzdCBhbHJlYWR5IHNlbnQgLiBwbGVhc2Ugd2FpdCBmb3IgYXBycm92YWwnLCBkYXRhOiB1c2VyIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyRGVsZXRlUmVxdWVzdCwgeyB1c2VySWQ6IGlkLCBzdGF0dXM6IFwicGVuZGluZ1wiIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ3JlcXVlc3Qgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseScgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB1cGRhdGVEZWxldGVSZXF1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkLCBzdGF0dXMgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgLy8gU2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc29sZS5sb2coaWQpO1xuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IFVzZXJEZWxldGVSZXF1ZXN0LmZpbmRCeUlkKGlkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJEZWxldGVSZXF1ZXN0LCB7IF9pZDogaWQgfSwgeyBzdGF0dXM6IHN0YXR1cyB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogJ3N0YXR1cyB1cGRhdGVkIHN1Y2NlZnVsbHknIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAxLCB7IG1lc3NhZ2U6ICdyZXF1ZXN0IGFscmVhZHkgc2VudCAuIHBsZWFzZSB3YWl0IGZvciBhcHJyb3ZhbCcgfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVjZW50RmFucyA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBpZCwgdHlwZSB9ID0gcmVxLnBhcmFtcztcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKF9pZCk7XG4gICAgICAgICAgICBjb25zdCBsb2dnZWRJblVzZXIgPSBhd2FpdCBDb21tb24uZmluZEJ5SWQoVXNlck1vZGVsLCBfaWQsIFsnbmFtZScsICdsaWtlcyddKTtcblxuICAgICAgICAgICAgbGV0IGdpZnRlZEJ5ID0gYXdhaXQgU2VuZEdpZnRNb2RlbC5maW5kKHsgZ2lmdGVkVG86IGlkIH0pLnBvcHVsYXRlKFsndXNlcklkJywgXCJnaWZ0SWRcIl0pLnNvcnQoeyAnY3JlYXRlZEF0JzogMSB9KTtcblxuICAgICAgICAgICAgbGV0IHVzZXJzID0gW107XG5cblxuICAgICAgICAgICAgaWYgKGdpZnRlZEJ5ICYmIGdpZnRlZEJ5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyciA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IG9iaiBvZiBnaWZ0ZWRCeSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZW1wT2JqZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZSA9IG9iai51c2VySWQ7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLmRvYiA9IG9iai51c2VySWQuZG9iID8gYXdhaXQgQ29tbW9uU2VydmljZS5jb252ZXJ0VGltZVRvRGF0ZShvYmoudXNlcklkLmRvYikgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUuYWdlID0gb2JqLnVzZXJJZC5hZ2UgfHwgYXdhaXQgQ29tbW9uU2VydmljZS5nZXRBZ2Uob2JqLnVzZXJJZC5kb2IpO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS5pc0xpa2UgPSBsb2dnZWRJblVzZXIubGlrZXMuaW5jbHVkZXMob2JqLnVzZXJJZC5faWQpO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS5wb3B1bGFyaXR5ID0gb2JqLmdpZnRJZC5wb3B1bGFyaXR5ICogb2JqLnF1YW50aXR5O1xuXG4gICAgICAgICAgICAgICAgICAgIGFyci5wdXNoKHRlbXBPYmplKTtcblxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAgICAgdXNlcnMgPSBhcnI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgdXNlcnMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgYWRtaW5HaWZ0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xuXG4gICAgICAgICAgICBsZXQgc2VuZEdpZnQgPSBhd2FpdCBVc2VyR2lmdFBsYW4uZmluZCh7IHVzZXJJZDogaWQsIHN0YXR1czogeyAkaW46IFsncGVuZGluZycsICdhY3RpdmUnXSB9IH0pLnBvcHVsYXRlKFsndXNlcklkJywgXCJwbGFuSWRcIl0pLnNvcnQoeyAnY3JlYXRlZEF0JzogMSB9KTtcblxuICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gW107XG5cbiAgICAgICAgICAgIGlmIChzZW5kR2lmdCAmJiBzZW5kR2lmdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhcnIgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2Ygc2VuZEdpZnQpIHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcE9iamUgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUuaWQgPSBvYmouX2lkO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wT2JqZS51c2VyID0gb2JqLnVzZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iamUucGxhbiA9IG9iai5wbGFuSWQ7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBPYmplLnN0YXR1cyA9IG9iai5zdGF0dXM7XG5cbiAgICAgICAgICAgICAgICAgICAgYXJyLnB1c2godGVtcE9iamUpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gYXJyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3BvbnNlKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHVzZUdpZnRQbGFuID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGxldCBzZW5kR2lmdCA9IGF3YWl0IFVzZXJHaWZ0UGxhbi5maW5kT25lKHsgdXNlcklkOiBfaWQsIHN0YXR1czogJ2FjdGl2ZScgfSk7XG4gICAgICAgICAgICBpZiAoc2VuZEdpZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDEsIHsgXCJtZXNzYWdlXCI6IFwib25lIHBsYW4gYWxyZWFkeSBhY3RpdmVkIHlvdSBjYW4gbm90IGFjdGl2ZSBvdGhlciBwbGFuXCIgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh7IHVzZXJJZDogX2lkLCBpZDogaWQgfSlcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2t1c2VyUGxhbiA9IGF3YWl0IFVzZXJHaWZ0UGxhbi5maW5kT25lKHsgdXNlcklkOiBfaWQsIF9pZDogaWQgfSk7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrdXNlclBsYW4pIHtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU3Vic2NyaXB0aW9uTW9kZWwsIHsgdXNlcklkOiBfaWQsIHBsYW5JZDogY2hlY2t1c2VyUGxhbi5wbGFuSWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogX2lkIH0sIHsgaXNTdWJzY3JpYmVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJHaWZ0UGxhbiwgeyBfaWQ6IGlkIH0sIHsgc3RhdHVzOiAnYWN0aXZlJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IFwibWVzc2FnZVwiOiBcImFjdGl2ZWQgc3VjY2Vzc2Z1bGx5XCIgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDEsIHsgXCJtZXNzYWdlXCI6IFwic29tZXRoaW5nIHdlbnRzIHdyb25nXCIgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZW5kIHJlc3BvbnNlXG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBVc2VyQ29udHJvbGxlcigpO1xuIl19