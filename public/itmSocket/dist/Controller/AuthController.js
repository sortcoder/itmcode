"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _generateOtp = _interopRequireDefault(require("generate-otp"));

var _referralCodes = _interopRequireDefault(require("referral-codes"));

var _Mail = _interopRequireDefault(require("../Helper/Mail"));

var _User = _interopRequireDefault(require("../Models/User"));

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

var _UserDeleteRequest = _interopRequireDefault(require("../Models/UserDeleteRequest"));

var _InviteHistory = _interopRequireDefault(require("../Models/InviteHistory"));

var _InviteRewards = _interopRequireDefault(require("../Models/InviteRewards"));

var _OtpVerification = _interopRequireDefault(require("../Models/OtpVerification"));

var _bcryptjs = require("bcryptjs");

var _RequestHelper = require("../Helper/RequestHelper");

var _JWT = require("../Helper/JWT");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Auth Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['_id', 'name', 'role', 'password', 'email', 'mobile', 'userId', 'isDeleted', 'isBlocked'];

class AuthController {
  constructor() {
    _defineProperty(this, "sendOtp", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            mobile: _mobile,
            userId
          } = req.body;

          var otp = _generateOtp.default.generate(6);

          var isMobileExists = yield _CommonDbController.default.findSingle(_OtpVerification.default, {
            mobile: _mobile
          }, ['_id']);

          if (isMobileExists) {
            var _result = yield _Notifications.default.sendOTPSms(_mobile, otp, isMobileExists.name);

            yield _CommonDbController.default.update(_OtpVerification.default, {
              mobile: _mobile
            }, {
              otp: otp
            });
          } else {
            yield _CommonDbController.default.create(_OtpVerification.default, {
              mobile: _mobile,
              otp
            });
          }

          if (userId) {
            yield _CommonDbController.default.update(_User.default, {
              _id: userId
            }, {
              isMobileVerified: false,
              tempMobile: _mobile
            });
          }

          var result = {
            otp,
            message: "OTP has been sent to your mobile no ".concat(_mobile)
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "verifyMobileNumber", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            mobile: _mobile2,
            otp,
            isVerified
          } = req.body;
          var data = yield _CommonDbController.default.findSingle(_OtpVerification.default, {
            mobile: _mobile2
          }, ['_id', 'otp']);
          if (!data) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          if (data && data.otp) {
            if (data.otp === otp) {
              console.log("isVerified", isVerified);

              if (!isVerified || isVerified === false) {
                console.log("D");
                var user = yield _CommonDbController.default.findSingle(_User.default, {
                  mobile: _mobile2
                }, ['_id', 'otp']);
                yield _CommonDbController.default.update(_User.default, {
                  _id: user._id
                }, {
                  isMobileVerified: true,
                  mobile: data.tempMobile
                });
              } // await Common.remove(OtpVerificationModel, { mobile });


              return (0, _RequestHelper.buildResult)(res, 200, {
                message: "OTP Verified"
              });
            } else {
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: "Wrong OTP"
              });
            }
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: "No OTP exists, please try again"
            });
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendOtpForForgetPassword", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            email,
            mobile: _mobile3
          } = req.body;
          var query = {
            isDeleted: false
          };

          if (email) {
            query.email = email;
          } else if (_mobile3) {
            query.mobile = _mobile3;
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          } // Check if email or mobile already exists or not


          var user = yield _CommonDbController.default.findSingle(_User.default, query, ['_id', 'name']); // Returns error if user not exists

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          var otp = _generateOtp.default.generate(6);

          yield _Notifications.default.sendOTPSms(_mobile3, otp, user.name);
          yield _CommonDbController.default.update(_User.default, {
            _id: user._id
          }, {
            otp
          });
          var result = {};

          if (email) {
            result.message = "OTP has been sent to ".concat(email); // Mail.send(email, `Activation Code to verify email`, `${req.t(constants.EMAIL_MSG)} <b>${otp}</b>.`, user.name);

            _Mail.default.send(email, "Activation Code to verify email", "Welcome to ZoleMate, Your OTP is : " + otp + "  by USRM NETWORK OPC PVT. LTD.", user.name);
          } else {
            result.message = "OTP has been sent to ".concat(_mobile3); // TODO Code to send SMS to Mobile no.
          }

          result.otp = otp;
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "verifyOtp", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            email,
            mobile: _mobile4,
            otp
          } = req.body;
          var query = {
            isDeleted: false
          };

          if (email) {
            query.email = email;
          } else if (_mobile4) {
            query.mobile = _mobile4;
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          } // Check if email or mobile already exists or not


          var user = yield _CommonDbController.default.findSingle(_User.default, query, ['_id', 'otp']); // Returns error if user not exists

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          if (user && user.otp) {
            if (user.otp === otp) {
              yield _CommonDbController.default.update(_User.default, {
                _id: user._id
              }, {
                isMobileVerified: true
              });
              return (0, _RequestHelper.buildResult)(res, 200, {
                message: "OTP Verified"
              });
            } else {
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: "Wrong OTP"
              });
            }
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: "No OTP exists, please try again"
            });
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "forgotPassword", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            email,
            mobile: _mobile5,
            password
          } = req.body;
          var query = {
            isDeleted: false
          };

          if (email) {
            query.email = email;
          } else if (_mobile5) {
            query.mobile = _mobile5;
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          } // Check if email or mobile already exists or not


          var user = yield _CommonDbController.default.findSingle(_User.default, query, ['_id']); // Returns error if user not exists

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });
          req.body.password = (0, _bcryptjs.hashSync)(password.toString());
          yield _CommonDbController.default.update(_User.default, {
            _id: user._id
          }, {
            password: req.body.password
          });
          var result = {
            message: 'Password Changed'
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(re, 500, {}, {}, error);
        }
      });

      return function (_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "register", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            name,
            email,
            password,
            dob,
            mobile: _mobile6,
            referringCode,
            deviceId,
            platform,
            deviceToken
          } = req.body; // Hash password

          req.body.password = (0, _bcryptjs.hashSync)(password.toString());
          var prefix = name.substring(0, 4);
          req.body.referCode = _referralCodes.default.generate({
            prefix,
            length: 5,
            charset: _referralCodes.default.charset("alphanumeric")
          })[0];
          req.body.userId = 'ZM-' + _generateOtp.default.generate(4);
          req.body.dob = new Date(dob).getTime(); // Check if email already exists or not

          var isUserExists = yield _CommonDbController.default.findSingle(_User.default, {
            email: email,
            isDeleted: false
          }, ['_id']);
          var isUserExists1 = yield _CommonDbController.default.findSingle(_User.default, {
            mobile: _mobile6,
            isDeleted: false
          }, ['_id']); // Returns error if email exists

          if (isUserExists) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: "Email already registred"
          });
          if (isUserExists1) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: "Mobile no already registred"
          });

          if (referringCode) {
            var referredBy = yield _CommonDbController.default.findSingle(_User.default, {
              referCode: referringCode
            }, ['_id', 'wallet', 'popularity', 'message']);

            if (referredBy && referredBy._id) {} else {
              var _error = "Invalid Referral Code ";
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: _error
              });
            }
          } // Create user


          var emailOtp = _generateOtp.default.generate(6);

          req.body.email = req.body.email.toLowerCase();
          req.body.mailVerifyOtp = emailOtp;
          req.body.tempEmail = email;
          req.body.tempMobile = _mobile6;
          req.body.isMobileVerified = true;
          req.body.location = {
            type: "Point",
            coordinates: [parseFloat(req.body.latitude), parseFloat(req.body.longitude)]
          };
          var user = yield _CommonDbController.default.create(_User.default, req.body);

          _Mail.default.send(email, "Activation Code to verify email", "Welcome to ZoleMate, Your OTP is : " + emailOtp + "  by USRM NETWORK OPC PVT. LTD.", user.name);

          user = user.toObject();
          user.settings = yield _CommonDbController.default.create(_UserSettings.default, {
            userId: user._id
          });
          var token = (0, _JWT.generateToken)(user._id, {
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            userId: user.userId
          });

          if (referringCode) {
            var _referredBy = yield _CommonDbController.default.findSingle(_User.default, {
              referCode: referringCode
            }, ['_id', 'wallet', 'popularity', 'message']);

            if (_referredBy && _referredBy._id) {
              var reward = yield _CommonDbController.default.findSingle(_InviteRewards.default, {}, ['zole', 'popularity', 'message']);
              var wallet = _referredBy.wallet ? _referredBy.wallet + reward.zole : reward.zole;
              var popularity = _referredBy.popularity ? _referredBy.popularity + reward.popularity : reward.popularity;
              var message = _referredBy.message ? _referredBy.message + reward.message : reward.message;
              yield _CommonDbController.default.update(_User.default, {
                _id: _referredBy._id
              }, {
                popularity,
                wallet,
                message
              });
              yield _CommonDbController.default.update(_User.default, {
                _id: user._id
              }, {
                popularity: reward.popularity,
                wallet: reward.zole,
                message: reward.message
              });
              var inviteData = {
                deviceId,
                deviceToken,
                platform,
                referredBy: _referredBy._id,
                referredTo: user._id
              };
              yield _CommonDbController.default.create(_InviteHistory.default, inviteData);
            } else {
              var _error2 = "invalid refercode";
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: _error2
              });
            }
          } // Send response


          var result = {
            message: "Congratulation! Your Account Created Successfully",
            token,
            user
          };
          return (0, _RequestHelper.buildResult)(res, 201, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "login", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            userInput,
            password,
            deviceId,
            deviceToken
          } = req.body; // Check whether email and password exists

          if (!userInput || !password || !deviceToken && !deviceId) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INADEQUATE_DATA)
          }); // Get user details

          var user = yield _CommonDbController.default.findSingle(_User.default, {
            $or: [{
              email: {
                $regex: userInput,
                $options: "i"
              }
            }, {
              mobile: userInput
            }]
          }, params); // Returns error if email not exists in DB

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NO_MATCH_WITH_INPUT)
          }); // Returns error if user is deleted

          if (user.isDeleted) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ACCOUNT_NOT_EXISTS)
          }); // Returns error if user is blocked

          if (user.isBlocked) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: 'You are blocked by Admin'
          }); // check delete account request after resume status should be rejected

          var userDeleteRequest = yield _UserDeleteRequest.default.findOne({
            "userId": user._id,
            status: {
              $in: ["accepted", "resume"]
            }
          });

          if (userDeleteRequest) {
            return (0, _RequestHelper.buildResult)(res, 600, {
              message: "your account is deleted .please request for resume your account",
              data: userDeleteRequest
            });
          } // Check whether password is correct


          if (!(0, _bcryptjs.compareSync)(password.toString(), user.password)) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_DETAILS)
          });
          user = user.toObject();
          yield _CommonDbController.default.update(_User.default, {
            _id: user._id
          }, {
            deviceToken,
            deviceId
          });
          user.settings = yield _CommonDbController.default.findSingle(_UserSettings.default, {
            userId: user._id
          }); // Generate token

          var token = (0, _JWT.generateToken)(user._id, {
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            userId: user.userId
          }); // send response

          var result = {
            message: req.t(_constants.default.LOGIN_SUCCESS),
            token,
            user
          };
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

    _defineProperty(this, "adminLogin", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* (req, res) {
        try {
          // Errors of the express validators from route
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            userInput,
            password
          } = req.body; // Check whether email and password exists

          if (!userInput || !password) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INADEQUATE_DATA)
          }); // Get user details

          var user = yield _CommonDbController.default.findSingle(_User.default, {
            $or: [{
              email: {
                $regex: userInput,
                $options: "i"
              }
            }, {
              mobile: userInput
            }],
            isDeleted: false
          }, params); // Returns error if email not exists in DB

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NO_MATCH_WITH_INPUT)
          }); // Returns error if user role is not admin

          if (user.role !== 'admin') return (0, _RequestHelper.buildResult)(res, 401, {}, {}, {
            message: req.t(_constants.default.UNAUTHORIZED)
          }); // Returns error if user is deleted

          if (user.isDeleted) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.ACCOUNT_NOT_EXISTS)
          }); // Check whether password is correct

          if (!(0, _bcryptjs.compareSync)(password.toString(), user.password)) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.INVALID_DETAILS)
          });
          user = user.toObject();
          user.settings = yield _CommonDbController.default.findSingle(_UserSettings.default, {
            userId: user._id
          }); // Generate token

          var token = (0, _JWT.generateToken)(user._id, {
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            userId: user.userId
          }); // send response

          var result = {
            message: req.t(_constants.default.LOGIN_SUCCESS),
            token,
            user
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

    _defineProperty(this, "resendVerificationMail", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            email
          } = req.body;
          var {
            _id
          } = req.user;
          var query = {
            isDeleted: false,
            _id: _id
          };

          if (email) {// query.email = email;
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          } // Check if email or mobile already exists or not


          var user = yield _CommonDbController.default.findSingle(_User.default, query, ['_id', 'name']); // Returns error if user not exists

          if (!user) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          var otp = _generateOtp.default.generate(6);

          yield _CommonDbController.default.update(_User.default, {
            _id: user._id
          }, {
            mailVerifyOtp: otp,
            tempEmail: email
          });
          var result = {};

          if (email) {
            result.message = "OTP has been sent to ".concat(email);

            _Mail.default.send(email, "Activation Code to verify email", "Welcome to ZoleMate, Your OTP is : " + otp + "  by USRM NETWORK OPC PVT. LTD.", user.name);
          } else {
            result.message = "OTP has been sent to ".concat(mobile); // TODO Code to send SMS to Mobile no.
          }

          result.otp = otp;
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x17, _x18) {
        return _ref9.apply(this, arguments);
      };
    }());

    _defineProperty(this, "verifyEmailOtp", /*#__PURE__*/function () {
      var _ref10 = _asyncToGenerator(function* (req, res) {
        try {
          var errors = (0, _expressValidator.validationResult)(req);

          if (!errors.isEmpty()) {
            var error = errors.array();
            return res.status(400).json(error);
          }

          var {
            email,
            otp
          } = req.body;
          var query = {
            isDeleted: false
          };
          var query1 = {
            isDeleted: false
          };

          if (email) {
            query.email = email;
            query1.tempEmail = email;
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: req.t(_constants.default.INADEQUATE_DATA)
            });
          } // Check if email or mobile already exists or not


          var user = yield _CommonDbController.default.findSingle(_User.default, query, ['_id', 'mailVerifyOtp', 'tempEmail']);
          var user1 = yield _CommonDbController.default.findSingle(_User.default, query1, ['_id', 'mailVerifyOtp', 'tempEmail']); // Returns error if user not exists

          if (!user && !user1) return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
            message: req.t(_constants.default.NOT_EXISTS)
          });

          if (user && user.mailVerifyOtp) {
            if (user.mailVerifyOtp == otp) {
              yield _CommonDbController.default.update(_User.default, {
                _id: user._id
              }, {
                isMailVerified: true,
                email: user.tempEmail
              });
              return (0, _RequestHelper.buildResult)(res, 200, {
                message: "OTP Verified"
              });
            } else {
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: "Wrong OTP"
              });
            }
          } else if (user1 && user1.mailVerifyOtp) {
            if (user1.mailVerifyOtp == otp) {
              yield _CommonDbController.default.update(_User.default, {
                _id: user1._id
              }, {
                isMailVerified: true,
                email: user1.tempEmail
              });
              return (0, _RequestHelper.buildResult)(res, 200, {
                message: "OTP Verified"
              });
            } else {
              return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
                message: "Wrong OTP"
              });
            }
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {}, {}, {
              message: "No OTP exists, please try again"
            });
          }
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x19, _x20) {
        return _ref10.apply(this, arguments);
      };
    }());

    _defineProperty(this, "logout", /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(function* (req, res) {
        var {
          userId
        } = req.body;
        console.log("userId", req.body);
        yield _CommonDbController.default.update(_User.default, {
          _id: userId
        }, {
          deviceToken: ''
        });
        return (0, _RequestHelper.buildResult)(res, 200, {
          "message": "Logout Successfully"
        });
      });

      return function (_x21, _x22) {
        return _ref11.apply(this, arguments);
      };
    }());

    _defineProperty(this, "testSms", /*#__PURE__*/_asyncToGenerator(function* () {
      // let result=await Notifications.sendOTPSms("918949529301","1234","chetan");
      console.log("Sdd");

      _Mail.default.send("chetan13101992@gmail.com", "Activation Code to verify email", "Welcome to ZoleMate, Your OTP is : 1255  by USRM NETWORK OPC PVT. LTD.", "chetan");
    }));
  }

}

var _default = new AuthController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0F1dGhDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIkF1dGhDb250cm9sbGVyIiwicmVxIiwicmVzIiwiZXJyb3JzIiwiaXNFbXB0eSIsImVycm9yIiwiYXJyYXkiLCJzdGF0dXMiLCJqc29uIiwibW9iaWxlIiwidXNlcklkIiwiYm9keSIsIm90cCIsIm90cEdlbmVyYXRvciIsImdlbmVyYXRlIiwiaXNNb2JpbGVFeGlzdHMiLCJDb21tb24iLCJmaW5kU2luZ2xlIiwiT3RwVmVyaWZpY2F0aW9uTW9kZWwiLCJyZXN1bHQiLCJOb3RpZmljYXRpb25zIiwic2VuZE9UUFNtcyIsIm5hbWUiLCJ1cGRhdGUiLCJjcmVhdGUiLCJVc2VyTW9kZWwiLCJfaWQiLCJpc01vYmlsZVZlcmlmaWVkIiwidGVtcE1vYmlsZSIsIm1lc3NhZ2UiLCJpc1ZlcmlmaWVkIiwiZGF0YSIsInQiLCJjb25zdGFudHMiLCJOT1RfRVhJU1RTIiwiY29uc29sZSIsImxvZyIsInVzZXIiLCJlbWFpbCIsInF1ZXJ5IiwiaXNEZWxldGVkIiwiSU5BREVRVUFURV9EQVRBIiwiTWFpbCIsInNlbmQiLCJwYXNzd29yZCIsInRvU3RyaW5nIiwicmUiLCJkb2IiLCJyZWZlcnJpbmdDb2RlIiwiZGV2aWNlSWQiLCJwbGF0Zm9ybSIsImRldmljZVRva2VuIiwicHJlZml4Iiwic3Vic3RyaW5nIiwicmVmZXJDb2RlIiwicmVmZXJyYWxDb2RlcyIsImxlbmd0aCIsImNoYXJzZXQiLCJEYXRlIiwiZ2V0VGltZSIsImlzVXNlckV4aXN0cyIsImlzVXNlckV4aXN0czEiLCJyZWZlcnJlZEJ5IiwiZW1haWxPdHAiLCJ0b0xvd2VyQ2FzZSIsIm1haWxWZXJpZnlPdHAiLCJ0ZW1wRW1haWwiLCJsb2NhdGlvbiIsInR5cGUiLCJjb29yZGluYXRlcyIsInBhcnNlRmxvYXQiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInRvT2JqZWN0Iiwic2V0dGluZ3MiLCJVc2VyU2V0dGluZ3NNb2RlbCIsInRva2VuIiwicm9sZSIsInJld2FyZCIsIkludml0ZVJld2FyZE1vZGVsIiwid2FsbGV0Iiwiem9sZSIsInBvcHVsYXJpdHkiLCJpbnZpdGVEYXRhIiwicmVmZXJyZWRUbyIsIkludml0ZUhpc3RvcnlNb2RlbCIsInVzZXJJbnB1dCIsIiRvciIsIiRyZWdleCIsIiRvcHRpb25zIiwiTk9fTUFUQ0hfV0lUSF9JTlBVVCIsIkFDQ09VTlRfTk9UX0VYSVNUUyIsImlzQmxvY2tlZCIsInVzZXJEZWxldGVSZXF1ZXN0IiwiVXNlckRlbGV0ZVJlcXVlc3QiLCJmaW5kT25lIiwiJGluIiwiSU5WQUxJRF9ERVRBSUxTIiwiTE9HSU5fU1VDQ0VTUyIsIlVOQVVUSE9SSVpFRCIsInF1ZXJ5MSIsInVzZXIxIiwiaXNNYWlsVmVyaWZpZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsS0FBRCxFQUFRLE1BQVIsRUFBZ0IsTUFBaEIsRUFBd0IsVUFBeEIsRUFBb0MsT0FBcEMsRUFBNkMsUUFBN0MsRUFBdUQsUUFBdkQsRUFBaUUsV0FBakUsRUFBOEUsV0FBOUUsQ0FBZjs7QUFFQSxNQUFNQyxjQUFOLENBQXFCO0FBQUE7QUFBQTtBQUFBLG1DQUlQLFdBQU9DLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUMxQixZQUFJO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFyQixDQUFQO0FBQ0g7O0FBQ0QsY0FBSTtBQUFFSSxZQUFBQSxNQUFNLEVBQU5BLE9BQUY7QUFBU0MsWUFBQUE7QUFBVCxjQUFvQlQsR0FBRyxDQUFDVSxJQUE1Qjs7QUFFQSxjQUFNQyxHQUFHLEdBQUdDLHFCQUFhQyxRQUFiLENBQXNCLENBQXRCLENBQVo7O0FBQ0EsY0FBTUMsY0FBYyxTQUFTQyw0QkFBT0MsVUFBUCxDQUFrQkMsd0JBQWxCLEVBQXdDO0FBQUVULFlBQUFBLE1BQU0sRUFBTkE7QUFBRixXQUF4QyxFQUFvRCxDQUFDLEtBQUQsQ0FBcEQsQ0FBN0I7O0FBQ0EsY0FBSU0sY0FBSixFQUFvQjtBQUNoQixnQkFBSUksT0FBTSxTQUFPQyx1QkFBY0MsVUFBZCxDQUF5QlosT0FBekIsRUFBZ0NHLEdBQWhDLEVBQW9DRyxjQUFjLENBQUNPLElBQW5ELENBQWpCOztBQUNBLGtCQUFNTiw0QkFBT08sTUFBUCxDQUFjTCx3QkFBZCxFQUFvQztBQUFFVCxjQUFBQSxNQUFNLEVBQUVBO0FBQVYsYUFBcEMsRUFBd0Q7QUFBRUcsY0FBQUEsR0FBRyxFQUFFQTtBQUFQLGFBQXhELENBQU47QUFFSCxXQUpELE1BSU87QUFDSCxrQkFBTUksNEJBQU9RLE1BQVAsQ0FBY04sd0JBQWQsRUFBb0M7QUFBRVQsY0FBQUEsTUFBTSxFQUFOQSxPQUFGO0FBQVVHLGNBQUFBO0FBQVYsYUFBcEMsQ0FBTjtBQUNIOztBQUNELGNBQUdGLE1BQUgsRUFDQTtBQUNJLGtCQUFNTSw0QkFBT08sTUFBUCxDQUFjRSxhQUFkLEVBQXlCO0FBQUVDLGNBQUFBLEdBQUcsRUFBRWhCO0FBQVAsYUFBekIsRUFBMEM7QUFBRWlCLGNBQUFBLGdCQUFnQixFQUFFLEtBQXBCO0FBQTBCQyxjQUFBQSxVQUFVLEVBQUNuQjtBQUFyQyxhQUExQyxDQUFOO0FBQ0g7O0FBQ0QsY0FBTVUsTUFBTSxHQUFHO0FBQ1hQLFlBQUFBLEdBRFc7QUFFWGlCLFlBQUFBLE9BQU8sZ0RBQXlDcEIsT0FBekM7QUFGSSxXQUFmO0FBSUEsaUJBQU8sZ0NBQVlQLEdBQVosRUFBaUIsR0FBakIsRUFBc0JpQixNQUF0QixDQUFQO0FBRUgsU0EzQkQsQ0EyQkUsT0FBT2QsS0FBUCxFQUFjO0FBQ1osaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BbkNnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG9DQXdDSSxXQUFPSixHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDckMsWUFBSTtBQUNBLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBSSxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBTCxFQUF1QjtBQUNuQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQUk7QUFBRUksWUFBQUEsTUFBTSxFQUFOQSxRQUFGO0FBQVVHLFlBQUFBLEdBQVY7QUFBY2tCLFlBQUFBO0FBQWQsY0FBNkI3QixHQUFHLENBQUNVLElBQXJDO0FBRUEsY0FBTW9CLElBQUksU0FBU2YsNEJBQU9DLFVBQVAsQ0FBa0JDLHdCQUFsQixFQUF3QztBQUFFVCxZQUFBQSxNQUFNLEVBQU5BO0FBQUYsV0FBeEMsRUFBb0QsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFwRCxDQUFuQjtBQUNBLGNBQUksQ0FBQ3NCLElBQUwsRUFDSSxPQUFPLGdDQUFZN0IsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsWUFBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVUMsVUFBaEI7QUFBWCxXQUE5QixDQUFQOztBQUNKLGNBQUlILElBQUksSUFBSUEsSUFBSSxDQUFDbkIsR0FBakIsRUFBc0I7QUFDbEIsZ0JBQUltQixJQUFJLENBQUNuQixHQUFMLEtBQWFBLEdBQWpCLEVBQXNCO0FBQ2xCdUIsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksWUFBWixFQUEwQk4sVUFBMUI7O0FBQ0Esa0JBQUcsQ0FBQ0EsVUFBRCxJQUFlQSxVQUFVLEtBQUcsS0FBL0IsRUFDQTtBQUNJSyxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksR0FBWjtBQUNBLG9CQUFNQyxJQUFJLFNBQVNyQiw0QkFBT0MsVUFBUCxDQUFrQlEsYUFBbEIsRUFBNkI7QUFBQ2hCLGtCQUFBQSxNQUFNLEVBQU5BO0FBQUQsaUJBQTdCLEVBQXVDLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBdkMsQ0FBbkI7QUFDQSxzQkFBTU8sNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxrQkFBQUEsR0FBRyxFQUFFVyxJQUFJLENBQUNYO0FBQVosaUJBQXpCLEVBQTRDO0FBQUVDLGtCQUFBQSxnQkFBZ0IsRUFBRSxJQUFwQjtBQUF5QmxCLGtCQUFBQSxNQUFNLEVBQUVzQixJQUFJLENBQUNIO0FBQXRDLGlCQUE1QyxDQUFOO0FBQ0gsZUFQaUIsQ0FTbEI7OztBQUNBLHFCQUFPLGdDQUFZMUIsR0FBWixFQUFpQixHQUFqQixFQUFzQjtBQUFFMkIsZ0JBQUFBLE9BQU8sRUFBRTtBQUFYLGVBQXRCLENBQVA7QUFDSCxhQVhELE1BV087QUFDSCxxQkFBTyxnQ0FBWTNCLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLGdCQUFBQSxPQUFPLEVBQUU7QUFBWCxlQUE5QixDQUFQO0FBQ0g7QUFDSixXQWZELE1BZU87QUFDSCxtQkFBTyxnQ0FBWTNCLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLGNBQUFBLE9BQU8sRUFBRTtBQUFYLGFBQTlCLENBQVA7QUFDSDtBQUNKLFNBN0JELENBNkJFLE9BQU94QixLQUFQLEVBQWM7QUFDWixpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0F6RWdCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsb0NBOEVVLFdBQU9KLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUMzQyxZQUFJO0FBQ0EsY0FBTUMsTUFBTSxHQUFHLHdDQUFpQkYsR0FBakIsQ0FBZjs7QUFDQSxjQUFJLENBQUNFLE1BQU0sQ0FBQ0MsT0FBUCxFQUFMLEVBQXVCO0FBQ25CLGdCQUFNQyxLQUFLLEdBQUdGLE1BQU0sQ0FBQ0csS0FBUCxFQUFkO0FBQ0EsbUJBQU9KLEdBQUcsQ0FBQ0ssTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCSCxLQUFyQixDQUFQO0FBQ0g7O0FBQ0QsY0FBSTtBQUFFaUMsWUFBQUEsS0FBRjtBQUFTN0IsWUFBQUEsTUFBTSxFQUFOQTtBQUFULGNBQW9CUixHQUFHLENBQUNVLElBQTVCO0FBRUEsY0FBTTRCLEtBQUssR0FBRztBQUFFQyxZQUFBQSxTQUFTLEVBQUU7QUFBYixXQUFkOztBQUNBLGNBQUlGLEtBQUosRUFBVztBQUNQQyxZQUFBQSxLQUFLLENBQUNELEtBQU4sR0FBY0EsS0FBZDtBQUNILFdBRkQsTUFFTyxJQUFJN0IsUUFBSixFQUFZO0FBQ2Y4QixZQUFBQSxLQUFLLENBQUM5QixNQUFOLEdBQWVBLFFBQWY7QUFDSCxXQUZNLE1BRUE7QUFDSCxtQkFBTyxnQ0FBWVAsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsY0FBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVVEsZUFBaEI7QUFBWCxhQUE5QixDQUFQO0FBQ0gsV0FmRCxDQWdCQTs7O0FBQ0EsY0FBTUosSUFBSSxTQUFTckIsNEJBQU9DLFVBQVAsQ0FBa0JRLGFBQWxCLEVBQTZCYyxLQUE3QixFQUFvQyxDQUFDLEtBQUQsRUFBUSxNQUFSLENBQXBDLENBQW5CLENBakJBLENBa0JBOztBQUNBLGNBQUksQ0FBQ0YsSUFBTCxFQUNJLE9BQU8sZ0NBQVluQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVQyxVQUFoQjtBQUFYLFdBQTlCLENBQVA7O0FBRUosY0FBTXRCLEdBQUcsR0FBR0MscUJBQWFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBWjs7QUFDQSxnQkFBTU0sdUJBQWNDLFVBQWQsQ0FBeUJaLFFBQXpCLEVBQWdDRyxHQUFoQyxFQUFvQ3lCLElBQUksQ0FBQ2YsSUFBekMsQ0FBTjtBQUNBLGdCQUFNTiw0QkFBT08sTUFBUCxDQUFjRSxhQUFkLEVBQXlCO0FBQUVDLFlBQUFBLEdBQUcsRUFBRVcsSUFBSSxDQUFDWDtBQUFaLFdBQXpCLEVBQTRDO0FBQUVkLFlBQUFBO0FBQUYsV0FBNUMsQ0FBTjtBQUNBLGNBQUlPLE1BQU0sR0FBRyxFQUFiOztBQUNBLGNBQUltQixLQUFKLEVBQVc7QUFDUG5CLFlBQUFBLE1BQU0sQ0FBQ1UsT0FBUCxrQ0FBeUNTLEtBQXpDLEVBRE8sQ0FFUDs7QUFDQUksMEJBQUtDLElBQUwsQ0FBVUwsS0FBVixxQ0FBb0Qsd0NBQXNDMUIsR0FBdEMsR0FBMEMsaUNBQTlGLEVBQWlJeUIsSUFBSSxDQUFDZixJQUF0STtBQUNILFdBSkQsTUFJTztBQUNISCxZQUFBQSxNQUFNLENBQUNVLE9BQVAsa0NBQXlDcEIsUUFBekMsRUFERyxDQUVIO0FBQ0g7O0FBQ0RVLFVBQUFBLE1BQU0sQ0FBQ1AsR0FBUCxHQUFhQSxHQUFiO0FBRUEsaUJBQU8sZ0NBQVlWLEdBQVosRUFBaUIsR0FBakIsRUFBc0JpQixNQUF0QixDQUFQO0FBRUgsU0F0Q0QsQ0FzQ0UsT0FBT2QsS0FBUCxFQUFjO0FBQ1osaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BeEhnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG9DQTZITCxXQUFPSixHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDNUIsWUFBSTtBQUNBLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBSSxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBTCxFQUF1QjtBQUNuQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQUk7QUFBRWlDLFlBQUFBLEtBQUY7QUFBUzdCLFlBQUFBLE1BQU0sRUFBTkEsUUFBVDtBQUFpQkcsWUFBQUE7QUFBakIsY0FBeUJYLEdBQUcsQ0FBQ1UsSUFBakM7QUFFQSxjQUFNNEIsS0FBSyxHQUFHO0FBQUVDLFlBQUFBLFNBQVMsRUFBRTtBQUFiLFdBQWQ7O0FBQ0EsY0FBSUYsS0FBSixFQUFXO0FBQ1BDLFlBQUFBLEtBQUssQ0FBQ0QsS0FBTixHQUFjQSxLQUFkO0FBQ0gsV0FGRCxNQUVPLElBQUk3QixRQUFKLEVBQVk7QUFDZjhCLFlBQUFBLEtBQUssQ0FBQzlCLE1BQU4sR0FBZUEsUUFBZjtBQUNILFdBRk0sTUFFQTtBQUNILG1CQUFPLGdDQUFZUCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixjQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVUSxlQUFoQjtBQUFYLGFBQTlCLENBQVA7QUFDSCxXQWZELENBZ0JBOzs7QUFDQSxjQUFNSixJQUFJLFNBQVNyQiw0QkFBT0MsVUFBUCxDQUFrQlEsYUFBbEIsRUFBNkJjLEtBQTdCLEVBQW9DLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBcEMsQ0FBbkIsQ0FqQkEsQ0FrQkE7O0FBQ0EsY0FBSSxDQUFDRixJQUFMLEVBQ0ksT0FBTyxnQ0FBWW5DLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVDLFVBQWhCO0FBQVgsV0FBOUIsQ0FBUDs7QUFFSixjQUFJRyxJQUFJLElBQUlBLElBQUksQ0FBQ3pCLEdBQWpCLEVBQXNCO0FBQ2xCLGdCQUFJeUIsSUFBSSxDQUFDekIsR0FBTCxLQUFhQSxHQUFqQixFQUFzQjtBQUNsQixvQkFBTUksNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxnQkFBQUEsR0FBRyxFQUFFVyxJQUFJLENBQUNYO0FBQVosZUFBekIsRUFBNEM7QUFBRUMsZ0JBQUFBLGdCQUFnQixFQUFFO0FBQXBCLGVBQTVDLENBQU47QUFDQSxxQkFBTyxnQ0FBWXpCLEdBQVosRUFBaUIsR0FBakIsRUFBc0I7QUFBRTJCLGdCQUFBQSxPQUFPLEVBQUU7QUFBWCxlQUF0QixDQUFQO0FBQ0gsYUFIRCxNQUdPO0FBQ0gscUJBQU8sZ0NBQVkzQixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixnQkFBQUEsT0FBTyxFQUFFO0FBQVgsZUFBOUIsQ0FBUDtBQUNIO0FBQ0osV0FQRCxNQU9PO0FBQ0gsbUJBQU8sZ0NBQVkzQixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixjQUFBQSxPQUFPLEVBQUU7QUFBWCxhQUE5QixDQUFQO0FBQ0g7QUFFSixTQWpDRCxDQWlDRSxPQUFPeEIsS0FBUCxFQUFjO0FBQ1osaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJHLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BbEtnQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG9DQXVLQSxXQUFPSixHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDakMsWUFBSTtBQUNBLGNBQU07QUFBRW9DLFlBQUFBLEtBQUY7QUFBUzdCLFlBQUFBLE1BQU0sRUFBTkEsUUFBVDtBQUFpQm1DLFlBQUFBO0FBQWpCLGNBQThCM0MsR0FBRyxDQUFDVSxJQUF4QztBQUNBLGNBQU00QixLQUFLLEdBQUc7QUFBRUMsWUFBQUEsU0FBUyxFQUFFO0FBQWIsV0FBZDs7QUFDQSxjQUFJRixLQUFKLEVBQVc7QUFDUEMsWUFBQUEsS0FBSyxDQUFDRCxLQUFOLEdBQWNBLEtBQWQ7QUFDSCxXQUZELE1BRU8sSUFBSTdCLFFBQUosRUFBWTtBQUNmOEIsWUFBQUEsS0FBSyxDQUFDOUIsTUFBTixHQUFlQSxRQUFmO0FBQ0gsV0FGTSxNQUVBO0FBQ0gsbUJBQU8sZ0NBQVlQLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLGNBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVRLGVBQWhCO0FBQVgsYUFBOUIsQ0FBUDtBQUNILFdBVEQsQ0FVQTs7O0FBQ0EsY0FBTUosSUFBSSxTQUFTckIsNEJBQU9DLFVBQVAsQ0FBa0JRLGFBQWxCLEVBQTZCYyxLQUE3QixFQUFvQyxDQUFDLEtBQUQsQ0FBcEMsQ0FBbkIsQ0FYQSxDQVlBOztBQUNBLGNBQUksQ0FBQ0YsSUFBTCxFQUNJLE9BQU8sZ0NBQVluQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVQyxVQUFoQjtBQUFYLFdBQTlCLENBQVA7QUFDSmpDLFVBQUFBLEdBQUcsQ0FBQ1UsSUFBSixDQUFTaUMsUUFBVCxHQUFvQix3QkFBU0EsUUFBUSxDQUFDQyxRQUFULEVBQVQsQ0FBcEI7QUFDQSxnQkFBTTdCLDRCQUFPTyxNQUFQLENBQWNFLGFBQWQsRUFBeUI7QUFBRUMsWUFBQUEsR0FBRyxFQUFFVyxJQUFJLENBQUNYO0FBQVosV0FBekIsRUFBNEM7QUFBRWtCLFlBQUFBLFFBQVEsRUFBRTNDLEdBQUcsQ0FBQ1UsSUFBSixDQUFTaUM7QUFBckIsV0FBNUMsQ0FBTjtBQUNBLGNBQU16QixNQUFNLEdBQUc7QUFDWFUsWUFBQUEsT0FBTyxFQUFFO0FBREUsV0FBZjtBQUdBLGlCQUFPLGdDQUFZM0IsR0FBWixFQUFpQixHQUFqQixFQUFzQmlCLE1BQXRCLENBQVA7QUFFSCxTQXRCRCxDQXNCRSxPQUFPZCxLQUFQLEVBQWM7QUFDWixpQkFBTyxnQ0FBWXlDLEVBQVosRUFBZ0IsR0FBaEIsRUFBcUIsRUFBckIsRUFBeUIsRUFBekIsRUFBNkJ6QyxLQUE3QixDQUFQO0FBQ0g7QUFDSixPQWpNZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0FzTU4sV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQzNCLFlBQUk7QUFDQTtBQUNBLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBSSxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBTCxFQUF1QjtBQUNuQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQUk7QUFBRWlCLFlBQUFBLElBQUY7QUFBUWdCLFlBQUFBLEtBQVI7QUFBZU0sWUFBQUEsUUFBZjtBQUF5QkcsWUFBQUEsR0FBekI7QUFBOEJ0QyxZQUFBQSxNQUFNLEVBQU5BLFFBQTlCO0FBQXNDdUMsWUFBQUEsYUFBdEM7QUFBcURDLFlBQUFBLFFBQXJEO0FBQStEQyxZQUFBQSxRQUEvRDtBQUF5RUMsWUFBQUE7QUFBekUsY0FBeUZsRCxHQUFHLENBQUNVLElBQWpHLENBUEEsQ0FTQTs7QUFDQVYsVUFBQUEsR0FBRyxDQUFDVSxJQUFKLENBQVNpQyxRQUFULEdBQW9CLHdCQUFTQSxRQUFRLENBQUNDLFFBQVQsRUFBVCxDQUFwQjtBQUVBLGNBQU1PLE1BQU0sR0FBRzlCLElBQUksQ0FBQytCLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLENBQWY7QUFDQXBELFVBQUFBLEdBQUcsQ0FBQ1UsSUFBSixDQUFTMkMsU0FBVCxHQUFzQkMsdUJBQWN6QyxRQUFkLENBQXVCO0FBQ3pDc0MsWUFBQUEsTUFEeUM7QUFFekNJLFlBQUFBLE1BQU0sRUFBRSxDQUZpQztBQUd6Q0MsWUFBQUEsT0FBTyxFQUFFRix1QkFBY0UsT0FBZCxDQUFzQixjQUF0QjtBQUhnQyxXQUF2QixDQUFELENBSWpCLENBSmlCLENBQXJCO0FBTUF4RCxVQUFBQSxHQUFHLENBQUNVLElBQUosQ0FBU0QsTUFBVCxHQUFrQixRQUFRRyxxQkFBYUMsUUFBYixDQUFzQixDQUF0QixDQUExQjtBQUVBYixVQUFBQSxHQUFHLENBQUNVLElBQUosQ0FBU29DLEdBQVQsR0FBZSxJQUFJVyxJQUFKLENBQVNYLEdBQVQsRUFBY1ksT0FBZCxFQUFmLENBckJBLENBdUJBOztBQUNBLGNBQU1DLFlBQVksU0FBUzVDLDRCQUFPQyxVQUFQLENBQWtCUSxhQUFsQixFQUE2QjtBQUNwRGEsWUFBQUEsS0FBSyxFQUFFQSxLQUQ2QztBQUVwREUsWUFBQUEsU0FBUyxFQUFFO0FBRnlDLFdBQTdCLEVBR3hCLENBQUMsS0FBRCxDQUh3QixDQUEzQjtBQUlBLGNBQU1xQixhQUFhLFNBQVM3Qyw0QkFBT0MsVUFBUCxDQUFrQlEsYUFBbEIsRUFBNkI7QUFDckRoQixZQUFBQSxNQUFNLEVBQUVBLFFBRDZDO0FBRXJEK0IsWUFBQUEsU0FBUyxFQUFFO0FBRjBDLFdBQTdCLEVBR3pCLENBQUMsS0FBRCxDQUh5QixDQUE1QixDQTVCQSxDQWdDQTs7QUFDQSxjQUFJb0IsWUFBSixFQUNJLE9BQU8sZ0NBQVkxRCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU7QUFBWCxXQUE5QixDQUFQO0FBRUosY0FBSWdDLGFBQUosRUFDSSxPQUFPLGdDQUFZM0QsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsWUFBQUEsT0FBTyxFQUFFO0FBQVgsV0FBOUIsQ0FBUDs7QUFFQSxjQUFJbUIsYUFBSixFQUFtQjtBQUNmLGdCQUFNYyxVQUFVLFNBQVM5Qyw0QkFBT0MsVUFBUCxDQUFrQlEsYUFBbEIsRUFBNkI7QUFBRTZCLGNBQUFBLFNBQVMsRUFBRU47QUFBYixhQUE3QixFQUEyRCxDQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLFlBQWxCLEVBQWdDLFNBQWhDLENBQTNELENBQXpCOztBQUNBLGdCQUFJYyxVQUFVLElBQUlBLFVBQVUsQ0FBQ3BDLEdBQTdCLEVBQWtDLENBQ2pDLENBREQsTUFFSTtBQUNBLGtCQUFJckIsTUFBSyxHQUFDLHdCQUFWO0FBQ0EscUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLGdCQUFBQSxPQUFPLEVBQUV4QjtBQUFYLGVBQTlCLENBQVA7QUFDSDtBQUNKLFdBL0NMLENBZ0RBOzs7QUFDQSxjQUFJMEQsUUFBUSxHQUFHbEQscUJBQWFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBZjs7QUFDQWIsVUFBQUEsR0FBRyxDQUFDVSxJQUFKLENBQVMyQixLQUFULEdBQWlCckMsR0FBRyxDQUFDVSxJQUFKLENBQVMyQixLQUFULENBQWUwQixXQUFmLEVBQWpCO0FBQ0EvRCxVQUFBQSxHQUFHLENBQUNVLElBQUosQ0FBU3NELGFBQVQsR0FBeUJGLFFBQXpCO0FBQ0E5RCxVQUFBQSxHQUFHLENBQUNVLElBQUosQ0FBU3VELFNBQVQsR0FBcUI1QixLQUFyQjtBQUNBckMsVUFBQUEsR0FBRyxDQUFDVSxJQUFKLENBQVNpQixVQUFULEdBQXNCbkIsUUFBdEI7QUFDQVIsVUFBQUEsR0FBRyxDQUFDVSxJQUFKLENBQVNnQixnQkFBVCxHQUE0QixJQUE1QjtBQUNBMUIsVUFBQUEsR0FBRyxDQUFDVSxJQUFKLENBQVN3RCxRQUFULEdBQW9CO0FBQ2hCQyxZQUFBQSxJQUFJLEVBQUUsT0FEVTtBQUVoQkMsWUFBQUEsV0FBVyxFQUFFLENBQUNDLFVBQVUsQ0FBQ3JFLEdBQUcsQ0FBQ1UsSUFBSixDQUFTNEQsUUFBVixDQUFYLEVBQWdDRCxVQUFVLENBQUNyRSxHQUFHLENBQUNVLElBQUosQ0FBUzZELFNBQVYsQ0FBMUM7QUFGRyxXQUFwQjtBQUtBLGNBQUluQyxJQUFJLFNBQVNyQiw0QkFBT1EsTUFBUCxDQUFjQyxhQUFkLEVBQXlCeEIsR0FBRyxDQUFDVSxJQUE3QixDQUFqQjs7QUFFQStCLHdCQUFLQyxJQUFMLENBQVVMLEtBQVYscUNBQW9ELHdDQUFzQ3lCLFFBQXRDLEdBQStDLGlDQUFuRyxFQUFzSTFCLElBQUksQ0FBQ2YsSUFBM0k7O0FBQ0FlLFVBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDb0MsUUFBTCxFQUFQO0FBRUFwQyxVQUFBQSxJQUFJLENBQUNxQyxRQUFMLFNBQXNCMUQsNEJBQU9RLE1BQVAsQ0FBY21ELHFCQUFkLEVBQWlDO0FBQUVqRSxZQUFBQSxNQUFNLEVBQUUyQixJQUFJLENBQUNYO0FBQWYsV0FBakMsQ0FBdEI7QUFFQSxjQUFNa0QsS0FBSyxHQUFHLHdCQUFjdkMsSUFBSSxDQUFDWCxHQUFuQixFQUF3QjtBQUFFSixZQUFBQSxJQUFJLEVBQUVlLElBQUksQ0FBQ2YsSUFBYjtBQUFtQmdCLFlBQUFBLEtBQUssRUFBRUQsSUFBSSxDQUFDQyxLQUEvQjtBQUFzQzdCLFlBQUFBLE1BQU0sRUFBRTRCLElBQUksQ0FBQzVCLE1BQW5EO0FBQTJEb0UsWUFBQUEsSUFBSSxFQUFFeEMsSUFBSSxDQUFDd0MsSUFBdEU7QUFBNEVuRSxZQUFBQSxNQUFNLEVBQUUyQixJQUFJLENBQUMzQjtBQUF6RixXQUF4QixDQUFkOztBQUVBLGNBQUlzQyxhQUFKLEVBQW1CO0FBQ2YsZ0JBQU1jLFdBQVUsU0FBUzlDLDRCQUFPQyxVQUFQLENBQWtCUSxhQUFsQixFQUE2QjtBQUFFNkIsY0FBQUEsU0FBUyxFQUFFTjtBQUFiLGFBQTdCLEVBQTJELENBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsWUFBbEIsRUFBZ0MsU0FBaEMsQ0FBM0QsQ0FBekI7O0FBQ0EsZ0JBQUljLFdBQVUsSUFBSUEsV0FBVSxDQUFDcEMsR0FBN0IsRUFBa0M7QUFDOUIsa0JBQU1vRCxNQUFNLFNBQVM5RCw0QkFBT0MsVUFBUCxDQUFrQjhELHNCQUFsQixFQUFxQyxFQUFyQyxFQUF5QyxDQUFDLE1BQUQsRUFBUyxZQUFULEVBQXVCLFNBQXZCLENBQXpDLENBQXJCO0FBQ0Esa0JBQU1DLE1BQU0sR0FBR2xCLFdBQVUsQ0FBQ2tCLE1BQVgsR0FBb0JsQixXQUFVLENBQUNrQixNQUFYLEdBQW9CRixNQUFNLENBQUNHLElBQS9DLEdBQXNESCxNQUFNLENBQUNHLElBQTVFO0FBQ0Esa0JBQU1DLFVBQVUsR0FBR3BCLFdBQVUsQ0FBQ29CLFVBQVgsR0FBd0JwQixXQUFVLENBQUNvQixVQUFYLEdBQXdCSixNQUFNLENBQUNJLFVBQXZELEdBQW9FSixNQUFNLENBQUNJLFVBQTlGO0FBQ0Esa0JBQU1yRCxPQUFPLEdBQUdpQyxXQUFVLENBQUNqQyxPQUFYLEdBQXFCaUMsV0FBVSxDQUFDakMsT0FBWCxHQUFxQmlELE1BQU0sQ0FBQ2pELE9BQWpELEdBQTJEaUQsTUFBTSxDQUFDakQsT0FBbEY7QUFDQSxvQkFBTWIsNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxnQkFBQUEsR0FBRyxFQUFFb0MsV0FBVSxDQUFDcEM7QUFBbEIsZUFBekIsRUFBa0Q7QUFBRXdELGdCQUFBQSxVQUFGO0FBQWNGLGdCQUFBQSxNQUFkO0FBQXNCbkQsZ0JBQUFBO0FBQXRCLGVBQWxELENBQU47QUFDQSxvQkFBTWIsNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxnQkFBQUEsR0FBRyxFQUFFVyxJQUFJLENBQUNYO0FBQVosZUFBekIsRUFBNEM7QUFBRXdELGdCQUFBQSxVQUFVLEVBQUNKLE1BQU0sQ0FBQ0ksVUFBcEI7QUFBZ0NGLGdCQUFBQSxNQUFNLEVBQUNGLE1BQU0sQ0FBQ0csSUFBOUM7QUFBb0RwRCxnQkFBQUEsT0FBTyxFQUFFaUQsTUFBTSxDQUFDakQ7QUFBcEUsZUFBNUMsQ0FBTjtBQUNBLGtCQUFNc0QsVUFBVSxHQUFHO0FBQUVsQyxnQkFBQUEsUUFBRjtBQUFZRSxnQkFBQUEsV0FBWjtBQUF5QkQsZ0JBQUFBLFFBQXpCO0FBQW1DWSxnQkFBQUEsVUFBVSxFQUFFQSxXQUFVLENBQUNwQyxHQUExRDtBQUErRDBELGdCQUFBQSxVQUFVLEVBQUUvQyxJQUFJLENBQUNYO0FBQWhGLGVBQW5CO0FBQ0Esb0JBQU1WLDRCQUFPUSxNQUFQLENBQWM2RCxzQkFBZCxFQUFrQ0YsVUFBbEMsQ0FBTjtBQUNILGFBVEQsTUFVSTtBQUNBLGtCQUFJOUUsT0FBSyxHQUFDLG1CQUFWO0FBQ0EscUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLGdCQUFBQSxPQUFPLEVBQUV4QjtBQUFYLGVBQTlCLENBQVA7QUFDSDtBQUNKLFdBckZELENBc0ZBOzs7QUFDQSxjQUFNYyxNQUFNLEdBQUc7QUFDWFUsWUFBQUEsT0FBTyxFQUFFLG1EQURFO0FBRVgrQyxZQUFBQSxLQUZXO0FBR1h2QyxZQUFBQTtBQUhXLFdBQWY7QUFLQSxpQkFBTyxnQ0FBWW5DLEdBQVosRUFBaUIsR0FBakIsRUFBc0JpQixNQUF0QixDQUFQO0FBQ0gsU0E3RkQsQ0E2RkUsT0FBT2QsS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUgsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkcsS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0F4U2dCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsb0NBNFNULFdBQU9KLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUN4QixZQUFJO0FBQ0E7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUJILEtBQXJCLENBQVA7QUFDSDs7QUFDRCxjQUFNO0FBQUVpRixZQUFBQSxTQUFGO0FBQWExQyxZQUFBQSxRQUFiO0FBQXVCSyxZQUFBQSxRQUF2QjtBQUFpQ0UsWUFBQUE7QUFBakMsY0FBaURsRCxHQUFHLENBQUNVLElBQTNELENBUEEsQ0FRQTs7QUFDQSxjQUFJLENBQUMyRSxTQUFELElBQWMsQ0FBQzFDLFFBQWYsSUFBNEIsQ0FBQ08sV0FBRCxJQUFnQixDQUFDRixRQUFqRCxFQUNJLE9BQU8sZ0NBQVkvQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVUSxlQUFoQjtBQUFYLFdBQTlCLENBQVAsQ0FWSixDQVdBOztBQUNBLGNBQUlKLElBQUksU0FBU3JCLDRCQUFPQyxVQUFQLENBQWtCUSxhQUFsQixFQUE2QjtBQUFFOEQsWUFBQUEsR0FBRyxFQUFFLENBQUM7QUFBRWpELGNBQUFBLEtBQUssRUFBRTtBQUFFa0QsZ0JBQUFBLE1BQU0sRUFBRUYsU0FBVjtBQUFxQkcsZ0JBQUFBLFFBQVEsRUFBRTtBQUEvQjtBQUFULGFBQUQsRUFBa0Q7QUFBRWhGLGNBQUFBLE1BQU0sRUFBRTZFO0FBQVYsYUFBbEQ7QUFBUCxXQUE3QixFQUFnSHZGLE1BQWhILENBQWpCLENBWkEsQ0FhQTs7QUFDQSxjQUFJLENBQUNzQyxJQUFMLEVBQVcsT0FBTyxnQ0FBWW5DLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVV5RCxtQkFBaEI7QUFBWCxXQUE5QixDQUFQLENBZFgsQ0FnQkE7O0FBQ0EsY0FBSXJELElBQUksQ0FBQ0csU0FBVCxFQUFvQixPQUFPLGdDQUFZdEMsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsWUFBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVTBELGtCQUFoQjtBQUFYLFdBQTlCLENBQVAsQ0FqQnBCLENBbUJBOztBQUNBLGNBQUl0RCxJQUFJLENBQUN1RCxTQUFULEVBQW9CLE9BQU8sZ0NBQVkxRixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU7QUFBWCxXQUE5QixDQUFQLENBcEJwQixDQXNCQTs7QUFDQSxjQUFJZ0UsaUJBQWlCLFNBQVNDLDJCQUFrQkMsT0FBbEIsQ0FBMEI7QUFBRSxzQkFBVTFELElBQUksQ0FBQ1gsR0FBakI7QUFBc0JuQixZQUFBQSxNQUFNLEVBQUU7QUFBRXlGLGNBQUFBLEdBQUcsRUFBRSxDQUFDLFVBQUQsRUFBYSxRQUFiO0FBQVA7QUFBOUIsV0FBMUIsQ0FBOUI7O0FBQ0EsY0FBSUgsaUJBQUosRUFBdUI7QUFDbkIsbUJBQU8sZ0NBQVkzRixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCO0FBQUUyQixjQUFBQSxPQUFPLEVBQUUsaUVBQVg7QUFBOEVFLGNBQUFBLElBQUksRUFBRThEO0FBQXBGLGFBQXRCLENBQVA7QUFDSCxXQTFCRCxDQTRCQTs7O0FBQ0EsY0FBSSxDQUFDLDJCQUFZakQsUUFBUSxDQUFDQyxRQUFULEVBQVosRUFBaUNSLElBQUksQ0FBQ08sUUFBdEMsQ0FBTCxFQUNJLE9BQU8sZ0NBQVkxQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVZ0UsZUFBaEI7QUFBWCxXQUE5QixDQUFQO0FBRUo1RCxVQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ29DLFFBQUwsRUFBUDtBQUNBLGdCQUFNekQsNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxZQUFBQSxHQUFHLEVBQUVXLElBQUksQ0FBQ1g7QUFBWixXQUF6QixFQUE0QztBQUFFeUIsWUFBQUEsV0FBRjtBQUFlRixZQUFBQTtBQUFmLFdBQTVDLENBQU47QUFDQVosVUFBQUEsSUFBSSxDQUFDcUMsUUFBTCxTQUFzQjFELDRCQUFPQyxVQUFQLENBQWtCMEQscUJBQWxCLEVBQXFDO0FBQUVqRSxZQUFBQSxNQUFNLEVBQUUyQixJQUFJLENBQUNYO0FBQWYsV0FBckMsQ0FBdEIsQ0FsQ0EsQ0FtQ0E7O0FBQ0EsY0FBTWtELEtBQUssR0FBRyx3QkFBY3ZDLElBQUksQ0FBQ1gsR0FBbkIsRUFBd0I7QUFBRUosWUFBQUEsSUFBSSxFQUFFZSxJQUFJLENBQUNmLElBQWI7QUFBbUJnQixZQUFBQSxLQUFLLEVBQUVELElBQUksQ0FBQ0MsS0FBL0I7QUFBc0M3QixZQUFBQSxNQUFNLEVBQUU0QixJQUFJLENBQUM1QixNQUFuRDtBQUEyRG9FLFlBQUFBLElBQUksRUFBRXhDLElBQUksQ0FBQ3dDLElBQXRFO0FBQTRFbkUsWUFBQUEsTUFBTSxFQUFFMkIsSUFBSSxDQUFDM0I7QUFBekYsV0FBeEIsQ0FBZCxDQXBDQSxDQXFDQTs7QUFDQSxjQUFNUyxNQUFNLEdBQUc7QUFDWFUsWUFBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVWlFLGFBQWhCLENBREU7QUFFWHRCLFlBQUFBLEtBRlc7QUFHWHZDLFlBQUFBO0FBSFcsV0FBZjtBQUtBLGlCQUFPLGdDQUFZbkMsR0FBWixFQUFpQixHQUFqQixFQUFzQmlCLE1BQXRCLENBQVA7QUFFSCxTQTdDRCxDQTZDRSxPQUFPZCxLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQTlWZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0FtV0osV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQzdCLFlBQUk7QUFDQTtBQUNBLGNBQU1DLE1BQU0sR0FBRyx3Q0FBaUJGLEdBQWpCLENBQWY7O0FBQ0EsY0FBSSxDQUFDRSxNQUFNLENBQUNDLE9BQVAsRUFBTCxFQUF1QjtBQUNuQixnQkFBTUMsS0FBSyxHQUFHRixNQUFNLENBQUNHLEtBQVAsRUFBZDtBQUNBLG1CQUFPSixHQUFHLENBQUNLLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQkgsS0FBckIsQ0FBUDtBQUNIOztBQUNELGNBQU07QUFBRWlGLFlBQUFBLFNBQUY7QUFBYTFDLFlBQUFBO0FBQWIsY0FBMEIzQyxHQUFHLENBQUNVLElBQXBDLENBUEEsQ0FRQTs7QUFDQSxjQUFJLENBQUMyRSxTQUFELElBQWMsQ0FBQzFDLFFBQW5CLEVBQ0ksT0FBTyxnQ0FBWTFDLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVRLGVBQWhCO0FBQVgsV0FBOUIsQ0FBUCxDQVZKLENBV0E7O0FBQ0EsY0FBSUosSUFBSSxTQUFTckIsNEJBQU9DLFVBQVAsQ0FBa0JRLGFBQWxCLEVBQTZCO0FBQUU4RCxZQUFBQSxHQUFHLEVBQUUsQ0FBQztBQUFFakQsY0FBQUEsS0FBSyxFQUFFO0FBQUVrRCxnQkFBQUEsTUFBTSxFQUFFRixTQUFWO0FBQXFCRyxnQkFBQUEsUUFBUSxFQUFFO0FBQS9CO0FBQVQsYUFBRCxFQUFrRDtBQUFFaEYsY0FBQUEsTUFBTSxFQUFFNkU7QUFBVixhQUFsRCxDQUFQO0FBQWlGOUMsWUFBQUEsU0FBUyxFQUFFO0FBQTVGLFdBQTdCLEVBQWtJekMsTUFBbEksQ0FBakIsQ0FaQSxDQWFBOztBQUNBLGNBQUksQ0FBQ3NDLElBQUwsRUFBVyxPQUFPLGdDQUFZbkMsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsWUFBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVXlELG1CQUFoQjtBQUFYLFdBQTlCLENBQVAsQ0FkWCxDQWdCQTs7QUFDQSxjQUFJckQsSUFBSSxDQUFDd0MsSUFBTCxLQUFjLE9BQWxCLEVBQTJCLE9BQU8sZ0NBQVkzRSxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVa0UsWUFBaEI7QUFBWCxXQUE5QixDQUFQLENBakIzQixDQW1CQTs7QUFDQSxjQUFJOUQsSUFBSSxDQUFDRyxTQUFULEVBQW9CLE9BQU8sZ0NBQVl0QyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVMEQsa0JBQWhCO0FBQVgsV0FBOUIsQ0FBUCxDQXBCcEIsQ0FxQkE7O0FBQ0EsY0FBSSxDQUFDLDJCQUFZL0MsUUFBUSxDQUFDQyxRQUFULEVBQVosRUFBaUNSLElBQUksQ0FBQ08sUUFBdEMsQ0FBTCxFQUNJLE9BQU8sZ0NBQVkxQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixZQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVZ0UsZUFBaEI7QUFBWCxXQUE5QixDQUFQO0FBRUo1RCxVQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ29DLFFBQUwsRUFBUDtBQUNBcEMsVUFBQUEsSUFBSSxDQUFDcUMsUUFBTCxTQUFzQjFELDRCQUFPQyxVQUFQLENBQWtCMEQscUJBQWxCLEVBQXFDO0FBQUVqRSxZQUFBQSxNQUFNLEVBQUUyQixJQUFJLENBQUNYO0FBQWYsV0FBckMsQ0FBdEIsQ0ExQkEsQ0EyQkE7O0FBQ0EsY0FBTWtELEtBQUssR0FBRyx3QkFBY3ZDLElBQUksQ0FBQ1gsR0FBbkIsRUFBd0I7QUFBRUosWUFBQUEsSUFBSSxFQUFFZSxJQUFJLENBQUNmLElBQWI7QUFBbUJnQixZQUFBQSxLQUFLLEVBQUVELElBQUksQ0FBQ0MsS0FBL0I7QUFBc0M3QixZQUFBQSxNQUFNLEVBQUU0QixJQUFJLENBQUM1QixNQUFuRDtBQUEyRG9FLFlBQUFBLElBQUksRUFBRXhDLElBQUksQ0FBQ3dDLElBQXRFO0FBQTRFbkUsWUFBQUEsTUFBTSxFQUFFMkIsSUFBSSxDQUFDM0I7QUFBekYsV0FBeEIsQ0FBZCxDQTVCQSxDQTZCQTs7QUFDQSxjQUFNUyxNQUFNLEdBQUc7QUFDWFUsWUFBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVWlFLGFBQWhCLENBREU7QUFFWHRCLFlBQUFBLEtBRlc7QUFHWHZDLFlBQUFBO0FBSFcsV0FBZjtBQUtBLGlCQUFPLGdDQUFZbkMsR0FBWixFQUFpQixHQUFqQixFQUFzQmlCLE1BQXRCLENBQVA7QUFFSCxTQXJDRCxDQXFDRSxPQUFPZCxLQUFQLEVBQWM7QUFDWjtBQUNBLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQTdZZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0E4WVEsV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQ3pDLFlBQUk7QUFFQSxjQUFJO0FBQUVvQyxZQUFBQTtBQUFGLGNBQVlyQyxHQUFHLENBQUNVLElBQXBCO0FBQ0EsY0FBSTtBQUFFZSxZQUFBQTtBQUFGLGNBQVV6QixHQUFHLENBQUNvQyxJQUFsQjtBQUVBLGNBQU1FLEtBQUssR0FBRztBQUFFQyxZQUFBQSxTQUFTLEVBQUUsS0FBYjtBQUFtQmQsWUFBQUEsR0FBRyxFQUFDQTtBQUF2QixXQUFkOztBQUNBLGNBQUlZLEtBQUosRUFBVyxDQUNQO0FBQ0gsV0FGRCxNQUdLO0FBQ0QsbUJBQU8sZ0NBQVlwQyxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixjQUFBQSxPQUFPLEVBQUU1QixHQUFHLENBQUMrQixDQUFKLENBQU1DLG1CQUFVUSxlQUFoQjtBQUFYLGFBQTlCLENBQVA7QUFDSCxXQVhELENBWUE7OztBQUNBLGNBQU1KLElBQUksU0FBU3JCLDRCQUFPQyxVQUFQLENBQWtCUSxhQUFsQixFQUE2QmMsS0FBN0IsRUFBb0MsQ0FBQyxLQUFELEVBQVEsTUFBUixDQUFwQyxDQUFuQixDQWJBLENBY0E7O0FBQ0EsY0FBSSxDQUFDRixJQUFMLEVBQ0ksT0FBTyxnQ0FBWW5DLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVDLFVBQWhCO0FBQVgsV0FBOUIsQ0FBUDs7QUFFSixjQUFNdEIsR0FBRyxHQUFHQyxxQkFBYUMsUUFBYixDQUFzQixDQUF0QixDQUFaOztBQUVBLGdCQUFNRSw0QkFBT08sTUFBUCxDQUFjRSxhQUFkLEVBQXlCO0FBQUVDLFlBQUFBLEdBQUcsRUFBRVcsSUFBSSxDQUFDWDtBQUFaLFdBQXpCLEVBQTRDO0FBQUV1QyxZQUFBQSxhQUFhLEVBQUVyRCxHQUFqQjtBQUFxQnNELFlBQUFBLFNBQVMsRUFBQzVCO0FBQS9CLFdBQTVDLENBQU47QUFDQSxjQUFNbkIsTUFBTSxHQUFHLEVBQWY7O0FBQ0EsY0FBSW1CLEtBQUosRUFBVztBQUNQbkIsWUFBQUEsTUFBTSxDQUFDVSxPQUFQLGtDQUF5Q1MsS0FBekM7O0FBQ0FJLDBCQUFLQyxJQUFMLENBQVVMLEtBQVYscUNBQW9ELHdDQUFzQzFCLEdBQXRDLEdBQTBDLGlDQUE5RixFQUFpSXlCLElBQUksQ0FBQ2YsSUFBdEk7QUFHSCxXQUxELE1BS087QUFDSEgsWUFBQUEsTUFBTSxDQUFDVSxPQUFQLGtDQUF5Q3BCLE1BQXpDLEVBREcsQ0FFSDtBQUNIOztBQUNEVSxVQUFBQSxNQUFNLENBQUNQLEdBQVAsR0FBYUEsR0FBYjtBQUVBLGlCQUFPLGdDQUFZVixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCaUIsTUFBdEIsQ0FBUDtBQUVILFNBbkNELENBbUNFLE9BQU9kLEtBQVAsRUFBYztBQUNaLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXJiZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxxQ0FzYkEsV0FBT0osR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQ2pDLFlBQUk7QUFDQSxjQUFNQyxNQUFNLEdBQUcsd0NBQWlCRixHQUFqQixDQUFmOztBQUNBLGNBQUksQ0FBQ0UsTUFBTSxDQUFDQyxPQUFQLEVBQUwsRUFBdUI7QUFDbkIsZ0JBQU1DLEtBQUssR0FBR0YsTUFBTSxDQUFDRyxLQUFQLEVBQWQ7QUFDQSxtQkFBT0osR0FBRyxDQUFDSyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsSUFBaEIsQ0FBcUJILEtBQXJCLENBQVA7QUFDSDs7QUFDRCxjQUFJO0FBQUVpQyxZQUFBQSxLQUFGO0FBQVMxQixZQUFBQTtBQUFULGNBQWlCWCxHQUFHLENBQUNVLElBQXpCO0FBRUEsY0FBTTRCLEtBQUssR0FBRztBQUFFQyxZQUFBQSxTQUFTLEVBQUU7QUFBYixXQUFkO0FBQ0EsY0FBTTRELE1BQU0sR0FBRztBQUFFNUQsWUFBQUEsU0FBUyxFQUFFO0FBQWIsV0FBZjs7QUFDQSxjQUFJRixLQUFKLEVBQVc7QUFDUEMsWUFBQUEsS0FBSyxDQUFDRCxLQUFOLEdBQWNBLEtBQWQ7QUFDQThELFlBQUFBLE1BQU0sQ0FBQ2xDLFNBQVAsR0FBbUI1QixLQUFuQjtBQUNILFdBSEQsTUFHTztBQUNILG1CQUFPLGdDQUFZcEMsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsY0FBQUEsT0FBTyxFQUFFNUIsR0FBRyxDQUFDK0IsQ0FBSixDQUFNQyxtQkFBVVEsZUFBaEI7QUFBWCxhQUE5QixDQUFQO0FBQ0gsV0FmRCxDQWdCQTs7O0FBQ0EsY0FBTUosSUFBSSxTQUFTckIsNEJBQU9DLFVBQVAsQ0FBa0JRLGFBQWxCLEVBQTZCYyxLQUE3QixFQUFvQyxDQUFDLEtBQUQsRUFBUSxlQUFSLEVBQXdCLFdBQXhCLENBQXBDLENBQW5CO0FBQ0EsY0FBTThELEtBQUssU0FBU3JGLDRCQUFPQyxVQUFQLENBQWtCUSxhQUFsQixFQUE2QjJFLE1BQTdCLEVBQXFDLENBQUMsS0FBRCxFQUFRLGVBQVIsRUFBd0IsV0FBeEIsQ0FBckMsQ0FBcEIsQ0FsQkEsQ0FtQkE7O0FBQ0EsY0FBSSxDQUFDL0QsSUFBRCxJQUFTLENBQUNnRSxLQUFkLEVBQ0ksT0FBTyxnQ0FBWW5HLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEI7QUFBRTJCLFlBQUFBLE9BQU8sRUFBRTVCLEdBQUcsQ0FBQytCLENBQUosQ0FBTUMsbUJBQVVDLFVBQWhCO0FBQVgsV0FBOUIsQ0FBUDs7QUFFSixjQUFJRyxJQUFJLElBQUlBLElBQUksQ0FBQzRCLGFBQWpCLEVBQWdDO0FBRTVCLGdCQUFJNUIsSUFBSSxDQUFDNEIsYUFBTCxJQUFzQnJELEdBQTFCLEVBQStCO0FBRTNCLG9CQUFNSSw0QkFBT08sTUFBUCxDQUFjRSxhQUFkLEVBQXlCO0FBQUVDLGdCQUFBQSxHQUFHLEVBQUVXLElBQUksQ0FBQ1g7QUFBWixlQUF6QixFQUE0QztBQUFFNEUsZ0JBQUFBLGNBQWMsRUFBRSxJQUFsQjtBQUF1QmhFLGdCQUFBQSxLQUFLLEVBQUNELElBQUksQ0FBQzZCO0FBQWxDLGVBQTVDLENBQU47QUFDQSxxQkFBTyxnQ0FBWWhFLEdBQVosRUFBaUIsR0FBakIsRUFBc0I7QUFBRTJCLGdCQUFBQSxPQUFPLEVBQUU7QUFBWCxlQUF0QixDQUFQO0FBQ0gsYUFKRCxNQUlPO0FBQ0gscUJBQU8sZ0NBQVkzQixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCO0FBQUUyQixnQkFBQUEsT0FBTyxFQUFFO0FBQVgsZUFBOUIsQ0FBUDtBQUNIO0FBQ0osV0FURCxNQVVLLElBQUd3RSxLQUFLLElBQUlBLEtBQUssQ0FBQ3BDLGFBQWxCLEVBQ0w7QUFDSSxnQkFBSW9DLEtBQUssQ0FBQ3BDLGFBQU4sSUFBdUJyRCxHQUEzQixFQUFnQztBQUU1QixvQkFBTUksNEJBQU9PLE1BQVAsQ0FBY0UsYUFBZCxFQUF5QjtBQUFFQyxnQkFBQUEsR0FBRyxFQUFFMkUsS0FBSyxDQUFDM0U7QUFBYixlQUF6QixFQUE2QztBQUFFNEUsZ0JBQUFBLGNBQWMsRUFBRSxJQUFsQjtBQUF1QmhFLGdCQUFBQSxLQUFLLEVBQUMrRCxLQUFLLENBQUNuQztBQUFuQyxlQUE3QyxDQUFOO0FBQ0EscUJBQU8sZ0NBQVloRSxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCO0FBQUUyQixnQkFBQUEsT0FBTyxFQUFFO0FBQVgsZUFBdEIsQ0FBUDtBQUNILGFBSkQsTUFJTztBQUNILHFCQUFPLGdDQUFZM0IsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsZ0JBQUFBLE9BQU8sRUFBRTtBQUFYLGVBQTlCLENBQVA7QUFDSDtBQUNKLFdBVEksTUFVQztBQUNGLG1CQUFPLGdDQUFZM0IsR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QjtBQUFFMkIsY0FBQUEsT0FBTyxFQUFFO0FBQVgsYUFBOUIsQ0FBUDtBQUNIO0FBRUosU0EvQ0QsQ0ErQ0UsT0FBT3hCLEtBQVAsRUFBYztBQUNaLGlCQUFPLGdDQUFZSCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCRyxLQUE5QixDQUFQO0FBQ0g7QUFDSixPQXplZ0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxxQ0EwZVYsV0FBT0osR0FBUCxFQUFXQyxHQUFYLEVBQWlCO0FBQ3BCLFlBQUk7QUFBRVEsVUFBQUE7QUFBRixZQUFhVCxHQUFHLENBQUNVLElBQXJCO0FBR0F3QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCbkMsR0FBRyxDQUFDVSxJQUExQjtBQUNBLGNBQU1LLDRCQUFPTyxNQUFQLENBQWNFLGFBQWQsRUFBeUI7QUFBRUMsVUFBQUEsR0FBRyxFQUFFaEI7QUFBUCxTQUF6QixFQUEwQztBQUFFeUMsVUFBQUEsV0FBVyxFQUFFO0FBQWYsU0FBMUMsQ0FBTjtBQUNBLGVBQU8sZ0NBQVlqRCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCO0FBQUMscUJBQVU7QUFBWCxTQUF0QixDQUFQO0FBQ0gsT0FqZmdCOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBLG9FQWtmVCxhQUFZO0FBRWhCO0FBQ0FpQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxLQUFaOztBQUNBTSxvQkFBS0MsSUFBTCxDQUFVLDBCQUFWLHFDQUF5RSx3RUFBekUsRUFBbUosUUFBbko7QUFDSCxLQXZmZ0I7QUFBQTs7QUFBQTs7ZUF5Zk4sSUFBSTNDLGNBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgb3RwR2VuZXJhdG9yIGZyb20gJ2dlbmVyYXRlLW90cCc7XG5pbXBvcnQgcmVmZXJyYWxDb2RlcyBmcm9tICdyZWZlcnJhbC1jb2Rlcyc7XG5pbXBvcnQgTWFpbCBmcm9tICcuLi9IZWxwZXIvTWFpbCc7XG5pbXBvcnQgVXNlck1vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyJztcbmltcG9ydCBVc2VyU2V0dGluZ3NNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlclNldHRpbmdzJztcbmltcG9ydCBVc2VyRGVsZXRlUmVxdWVzdCBmcm9tICcuLi9Nb2RlbHMvVXNlckRlbGV0ZVJlcXVlc3QnO1xuaW1wb3J0IEludml0ZUhpc3RvcnlNb2RlbCBmcm9tICcuLi9Nb2RlbHMvSW52aXRlSGlzdG9yeSc7XG5pbXBvcnQgSW52aXRlUmV3YXJkTW9kZWwgZnJvbSAnLi4vTW9kZWxzL0ludml0ZVJld2FyZHMnO1xuaW1wb3J0IE90cFZlcmlmaWNhdGlvbk1vZGVsIGZyb20gJy4uL01vZGVscy9PdHBWZXJpZmljYXRpb24nO1xuaW1wb3J0IHsgY29tcGFyZVN5bmMsIGhhc2hTeW5jIH0gZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZVRva2VuIH0gZnJvbSAnLi4vSGVscGVyL0pXVCc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9jb25zdGFudHMnO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcbmltcG9ydCBOb3RpZmljYXRpb25zIGZyb20gJy4uL1NlcnZpY2UvTm90aWZpY2F0aW9ucyc7XG5cbi8qKlxuICogIEF1dGggQ29udHJvbGxlciBDbGFzc1xuICogIEBhdXRob3IgTml0aXNoYSBLaGFuZGVsd2FsIDxuaXRpc2hhLmtoYW5kZWx3YWxAanBsb2Z0LmluPlxuICovXG5cbmNvbnN0IHBhcmFtcyA9IFsnX2lkJywgJ25hbWUnLCAncm9sZScsICdwYXNzd29yZCcsICdlbWFpbCcsICdtb2JpbGUnLCAndXNlcklkJywgJ2lzRGVsZXRlZCcsICdpc0Jsb2NrZWQnXTtcblxuY2xhc3MgQXV0aENvbnRyb2xsZXIge1xuICAgIC8qKlxuICAgICAqIFNlbmQgT1RQIGZvciBNb2JpbGUgbnVtYmVyIHZlcmlmaWNhdGlvblxuICAgICAqL1xuICAgIHNlbmRPdHAgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB7IG1vYmlsZSx1c2VySWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3Qgb3RwID0gb3RwR2VuZXJhdG9yLmdlbmVyYXRlKDYpO1xuICAgICAgICAgICAgY29uc3QgaXNNb2JpbGVFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShPdHBWZXJpZmljYXRpb25Nb2RlbCwgeyBtb2JpbGUgfSwgWydfaWQnXSk7XG4gICAgICAgICAgICBpZiAoaXNNb2JpbGVFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0PWF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE9UUFNtcyhtb2JpbGUsb3RwLGlzTW9iaWxlRXhpc3RzLm5hbWUpO1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoT3RwVmVyaWZpY2F0aW9uTW9kZWwsIHsgbW9iaWxlOiBtb2JpbGUgfSwgeyBvdHA6IG90cCB9KTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24uY3JlYXRlKE90cFZlcmlmaWNhdGlvbk1vZGVsLCB7IG1vYmlsZSwgb3RwIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYodXNlcklkKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcklkIH0sIHsgaXNNb2JpbGVWZXJpZmllZDogZmFsc2UsdGVtcE1vYmlsZTptb2JpbGUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgb3RwLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBPVFAgaGFzIGJlZW4gc2VudCB0byB5b3VyIG1vYmlsZSBubyAke21vYmlsZX1gXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFZlcmlmeSBNb2JpbGUgTnVtYmVyXG4gICAgICovXG4gICAgdmVyaWZ5TW9iaWxlTnVtYmVyID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgeyBtb2JpbGUsIG90cCxpc1ZlcmlmaWVkIH0gPSByZXEuYm9keTtcbiAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKE90cFZlcmlmaWNhdGlvbk1vZGVsLCB7IG1vYmlsZSB9LCBbJ19pZCcsICdvdHAnXSk7XG4gICAgICAgICAgICBpZiAoIWRhdGEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuICAgICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5vdHApIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5vdHAgPT09IG90cCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImlzVmVyaWZpZWRcIiwgaXNWZXJpZmllZClcbiAgICAgICAgICAgICAgICAgICAgaWYoIWlzVmVyaWZpZWQgfHwgaXNWZXJpZmllZD09PWZhbHNlKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHttb2JpbGV9LCBbJ19pZCcsICdvdHAnXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXIuX2lkIH0sIHsgaXNNb2JpbGVWZXJpZmllZDogdHJ1ZSxtb2JpbGU6IGRhdGEudGVtcE1vYmlsZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBhd2FpdCBDb21tb24ucmVtb3ZlKE90cFZlcmlmaWNhdGlvbk1vZGVsLCB7IG1vYmlsZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCB7IG1lc3NhZ2U6IFwiT1RQIFZlcmlmaWVkXCIgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogXCJXcm9uZyBPVFBcIiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IFwiTm8gT1RQIGV4aXN0cywgcGxlYXNlIHRyeSBhZ2FpblwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIE9UUCBmb3IgRW1haWwgdmVyaWZpY2F0aW9uXG4gICAgICovXG4gICAgc2VuZE90cEZvckZvcmdldFBhc3N3b3JkID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgeyBlbWFpbCwgbW9iaWxlIH0gPSByZXEuYm9keTtcblxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7IGlzRGVsZXRlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmVtYWlsID0gZW1haWw7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vYmlsZSkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lm1vYmlsZSA9IG1vYmlsZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOQURFUVVBVEVfREFUQSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBlbWFpbCBvciBtb2JpbGUgYWxyZWFkeSBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCBxdWVyeSwgWydfaWQnLCAnbmFtZSddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBvdHAgPSBvdHBHZW5lcmF0b3IuZ2VuZXJhdGUoNik7XG4gICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmRPVFBTbXMobW9iaWxlLG90cCx1c2VyLm5hbWUpO1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiB1c2VyLl9pZCB9LCB7IG90cCB9KTtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlID0gYE9UUCBoYXMgYmVlbiBzZW50IHRvICR7ZW1haWx9YDtcbiAgICAgICAgICAgICAgICAvLyBNYWlsLnNlbmQoZW1haWwsIGBBY3RpdmF0aW9uIENvZGUgdG8gdmVyaWZ5IGVtYWlsYCwgYCR7cmVxLnQoY29uc3RhbnRzLkVNQUlMX01TRyl9IDxiPiR7b3RwfTwvYj4uYCwgdXNlci5uYW1lKTtcbiAgICAgICAgICAgICAgICBNYWlsLnNlbmQoZW1haWwsIGBBY3RpdmF0aW9uIENvZGUgdG8gdmVyaWZ5IGVtYWlsYCwgXCJXZWxjb21lIHRvIFpvbGVNYXRlLCBZb3VyIE9UUCBpcyA6IFwiK290cCtcIiAgYnkgVVNSTSBORVRXT1JLIE9QQyBQVlQuIExURC5cIiwgdXNlci5uYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0Lm1lc3NhZ2UgPSBgT1RQIGhhcyBiZWVuIHNlbnQgdG8gJHttb2JpbGV9YDtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIENvZGUgdG8gc2VuZCBTTVMgdG8gTW9iaWxlIG5vLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0Lm90cCA9IG90cDtcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFZlcmlmeSBPVFBcbiAgICAgKi9cbiAgICB2ZXJpZnlPdHAgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHZhbGlkYXRpb25SZXN1bHQocmVxKTtcbiAgICAgICAgICAgIGlmICghZXJyb3JzLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZXJyb3JzLmFycmF5KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDAwKS5qc29uKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB7IGVtYWlsLCBtb2JpbGUsIG90cCB9ID0gcmVxLmJvZHk7XG5cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBpc0RlbGV0ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICBpZiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5lbWFpbCA9IGVtYWlsO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtb2JpbGUpIHtcbiAgICAgICAgICAgICAgICBxdWVyeS5tb2JpbGUgPSBtb2JpbGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTkFERVFVQVRFX0RBVEEpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZW1haWwgb3IgbW9iaWxlIGFscmVhZHkgZXhpc3RzIG9yIG5vdFxuICAgICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwgcXVlcnksIFsnX2lkJywgJ290cCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuXG4gICAgICAgICAgICBpZiAodXNlciAmJiB1c2VyLm90cCkge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLm90cCA9PT0gb3RwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyBpc01vYmlsZVZlcmlmaWVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogXCJPVFAgVmVyaWZpZWRcIiB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiBcIldyb25nIE9UUFwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogXCJObyBPVFAgZXhpc3RzLCBwbGVhc2UgdHJ5IGFnYWluXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRm9yZ290IFBhc3N3b3JkXG4gICAgICovXG4gICAgZm9yZ290UGFzc3dvcmQgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgZW1haWwsIG1vYmlsZSwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB7IGlzRGVsZXRlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmVtYWlsID0gZW1haWw7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1vYmlsZSkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lm1vYmlsZSA9IG1vYmlsZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOQURFUVVBVEVfREFUQSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBlbWFpbCBvciBtb2JpbGUgYWxyZWFkeSBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCBxdWVyeSwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgbm90IGV4aXN0c1xuICAgICAgICAgICAgaWYgKCF1c2VyKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5OT1RfRVhJU1RTKSB9KTtcbiAgICAgICAgICAgIHJlcS5ib2R5LnBhc3N3b3JkID0gaGFzaFN5bmMocGFzc3dvcmQudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXIuX2lkIH0sIHsgcGFzc3dvcmQ6IHJlcS5ib2R5LnBhc3N3b3JkIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdQYXNzd29yZCBDaGFuZ2VkJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHVzZXJcbiAgICAgKi9cbiAgICByZWdpc3RlciA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHsgbmFtZSwgZW1haWwsIHBhc3N3b3JkLCBkb2IsIG1vYmlsZSwgcmVmZXJyaW5nQ29kZSwgZGV2aWNlSWQsIHBsYXRmb3JtLCBkZXZpY2VUb2tlbiB9ID0gcmVxLmJvZHk7XG5cbiAgICAgICAgICAgIC8vIEhhc2ggcGFzc3dvcmRcbiAgICAgICAgICAgIHJlcS5ib2R5LnBhc3N3b3JkID0gaGFzaFN5bmMocGFzc3dvcmQudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZWZpeCA9IG5hbWUuc3Vic3RyaW5nKDAsIDQpO1xuICAgICAgICAgICAgcmVxLmJvZHkucmVmZXJDb2RlID0gKHJlZmVycmFsQ29kZXMuZ2VuZXJhdGUoe1xuICAgICAgICAgICAgICAgIHByZWZpeCxcbiAgICAgICAgICAgICAgICBsZW5ndGg6IDUsXG4gICAgICAgICAgICAgICAgY2hhcnNldDogcmVmZXJyYWxDb2Rlcy5jaGFyc2V0KFwiYWxwaGFudW1lcmljXCIpXG4gICAgICAgICAgICB9KSlbMF07XG5cbiAgICAgICAgICAgIHJlcS5ib2R5LnVzZXJJZCA9ICdaTS0nICsgb3RwR2VuZXJhdG9yLmdlbmVyYXRlKDQpO1xuXG4gICAgICAgICAgICByZXEuYm9keS5kb2IgPSBuZXcgRGF0ZShkb2IpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZW1haWwgYWxyZWFkeSBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCBpc1VzZXJFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgICAgaXNEZWxldGVkOiBmYWxzZVxuICAgICAgICAgICAgfSwgWydfaWQnXSk7XG4gICAgICAgICAgICBjb25zdCBpc1VzZXJFeGlzdHMxID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7XG4gICAgICAgICAgICAgICAgbW9iaWxlOiBtb2JpbGUsXG4gICAgICAgICAgICAgICAgaXNEZWxldGVkOiBmYWxzZVxuICAgICAgICAgICAgfSwgWydfaWQnXSk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIGVtYWlsIGV4aXN0c1xuICAgICAgICAgICAgaWYgKGlzVXNlckV4aXN0cylcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiBcIkVtYWlsIGFscmVhZHkgcmVnaXN0cmVkXCIgfSk7XG5cbiAgICAgICAgICAgIGlmIChpc1VzZXJFeGlzdHMxKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IFwiTW9iaWxlIG5vIGFscmVhZHkgcmVnaXN0cmVkXCIgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVmZXJyaW5nQ29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWZlcnJlZEJ5ID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCB7IHJlZmVyQ29kZTogcmVmZXJyaW5nQ29kZSB9LCBbJ19pZCcsICd3YWxsZXQnLCAncG9wdWxhcml0eScsICdtZXNzYWdlJ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVmZXJyZWRCeSAmJiByZWZlcnJlZEJ5Ll9pZCkge1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3I9XCJJbnZhbGlkIFJlZmVycmFsIENvZGUgXCIgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IGVycm9yIH0pOyBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENyZWF0ZSB1c2VyXG4gICAgICAgICAgICBsZXQgZW1haWxPdHAgPSBvdHBHZW5lcmF0b3IuZ2VuZXJhdGUoNik7XG4gICAgICAgICAgICByZXEuYm9keS5lbWFpbCA9IHJlcS5ib2R5LmVtYWlsLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXEuYm9keS5tYWlsVmVyaWZ5T3RwID0gZW1haWxPdHA7XG4gICAgICAgICAgICByZXEuYm9keS50ZW1wRW1haWwgPSBlbWFpbDtcbiAgICAgICAgICAgIHJlcS5ib2R5LnRlbXBNb2JpbGUgPSBtb2JpbGU7XG4gICAgICAgICAgICByZXEuYm9keS5pc01vYmlsZVZlcmlmaWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcS5ib2R5LmxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW3BhcnNlRmxvYXQocmVxLmJvZHkubGF0aXR1ZGUpLCBwYXJzZUZsb2F0KHJlcS5ib2R5LmxvbmdpdHVkZSldXG4gICAgICAgICAgICAgICB9IDtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF3YWl0IENvbW1vbi5jcmVhdGUoVXNlck1vZGVsLCByZXEuYm9keSk7XG5cbiAgICAgICAgICAgIE1haWwuc2VuZChlbWFpbCwgYEFjdGl2YXRpb24gQ29kZSB0byB2ZXJpZnkgZW1haWxgLCBcIldlbGNvbWUgdG8gWm9sZU1hdGUsIFlvdXIgT1RQIGlzIDogXCIrZW1haWxPdHArXCIgIGJ5IFVTUk0gTkVUV09SSyBPUEMgUFZULiBMVEQuXCIsIHVzZXIubmFtZSk7XG4gICAgICAgICAgICB1c2VyID0gdXNlci50b09iamVjdCgpO1xuXG4gICAgICAgICAgICB1c2VyLnNldHRpbmdzID0gYXdhaXQgQ29tbW9uLmNyZWF0ZShVc2VyU2V0dGluZ3NNb2RlbCwgeyB1c2VySWQ6IHVzZXIuX2lkIH0pO1xuXG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGdlbmVyYXRlVG9rZW4odXNlci5faWQsIHsgbmFtZTogdXNlci5uYW1lLCBlbWFpbDogdXNlci5lbWFpbCwgbW9iaWxlOiB1c2VyLm1vYmlsZSwgcm9sZTogdXNlci5yb2xlLCB1c2VySWQ6IHVzZXIudXNlcklkIH0pO1xuXG4gICAgICAgICAgICBpZiAocmVmZXJyaW5nQ29kZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZmVycmVkQnkgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHsgcmVmZXJDb2RlOiByZWZlcnJpbmdDb2RlIH0sIFsnX2lkJywgJ3dhbGxldCcsICdwb3B1bGFyaXR5JywgJ21lc3NhZ2UnXSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlZmVycmVkQnkgJiYgcmVmZXJyZWRCeS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoSW52aXRlUmV3YXJkTW9kZWwsIHt9LCBbJ3pvbGUnLCAncG9wdWxhcml0eScsICdtZXNzYWdlJ10pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3YWxsZXQgPSByZWZlcnJlZEJ5LndhbGxldCA/IHJlZmVycmVkQnkud2FsbGV0ICsgcmV3YXJkLnpvbGUgOiByZXdhcmQuem9sZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9wdWxhcml0eSA9IHJlZmVycmVkQnkucG9wdWxhcml0eSA/IHJlZmVycmVkQnkucG9wdWxhcml0eSArIHJld2FyZC5wb3B1bGFyaXR5IDogcmV3YXJkLnBvcHVsYXJpdHk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZWZlcnJlZEJ5Lm1lc3NhZ2UgPyByZWZlcnJlZEJ5Lm1lc3NhZ2UgKyByZXdhcmQubWVzc2FnZSA6IHJld2FyZC5tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHJlZmVycmVkQnkuX2lkIH0sIHsgcG9wdWxhcml0eSwgd2FsbGV0LCBtZXNzYWdlIH0pO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXIuX2lkIH0sIHsgcG9wdWxhcml0eTpyZXdhcmQucG9wdWxhcml0eSwgd2FsbGV0OnJld2FyZC56b2xlLCBtZXNzYWdlOiByZXdhcmQubWVzc2FnZX0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnZpdGVEYXRhID0geyBkZXZpY2VJZCwgZGV2aWNlVG9rZW4sIHBsYXRmb3JtLCByZWZlcnJlZEJ5OiByZWZlcnJlZEJ5Ll9pZCwgcmVmZXJyZWRUbzogdXNlci5faWQgfTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLmNyZWF0ZShJbnZpdGVIaXN0b3J5TW9kZWwsIGludml0ZURhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBsZXQgZXJyb3I9XCJpbnZhbGlkIHJlZmVyY29kZVwiICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IGVycm9yIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFNlbmQgcmVzcG9uc2VcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkNvbmdyYXR1bGF0aW9uISBZb3VyIEFjY291bnQgQ3JlYXRlZCBTdWNjZXNzZnVsbHlcIixcbiAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICB1c2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAxLCByZXN1bHQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb2dpbiBNZXRob2RcbiAgICAgKi9cbiAgICBsb2dpbiA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gRXJyb3JzIG9mIHRoZSBleHByZXNzIHZhbGlkYXRvcnMgZnJvbSByb3V0ZVxuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyB1c2VySW5wdXQsIHBhc3N3b3JkLCBkZXZpY2VJZCwgZGV2aWNlVG9rZW4gfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciBlbWFpbCBhbmQgcGFzc3dvcmQgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXJJbnB1dCB8fCAhcGFzc3dvcmQgfHwgKCFkZXZpY2VUb2tlbiAmJiAhZGV2aWNlSWQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5JTkFERVFVQVRFX0RBVEEpIH0pO1xuICAgICAgICAgICAgLy8gR2V0IHVzZXIgZGV0YWlsc1xuICAgICAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHsgJG9yOiBbeyBlbWFpbDogeyAkcmVnZXg6IHVzZXJJbnB1dCwgJG9wdGlvbnM6IFwiaVwiIH0gfSwgeyBtb2JpbGU6IHVzZXJJbnB1dCB9XSB9LCBwYXJhbXMpO1xuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiBlbWFpbCBub3QgZXhpc3RzIGluIERCXG4gICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5OT19NQVRDSF9XSVRIX0lOUFVUKSB9KTtcblxuICAgICAgICAgICAgLy8gUmV0dXJucyBlcnJvciBpZiB1c2VyIGlzIGRlbGV0ZWRcbiAgICAgICAgICAgIGlmICh1c2VyLmlzRGVsZXRlZCkgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkFDQ09VTlRfTk9UX0VYSVNUUykgfSk7XG5cbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBpcyBibG9ja2VkXG4gICAgICAgICAgICBpZiAodXNlci5pc0Jsb2NrZWQpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6ICdZb3UgYXJlIGJsb2NrZWQgYnkgQWRtaW4nIH0pO1xuXG4gICAgICAgICAgICAvLyBjaGVjayBkZWxldGUgYWNjb3VudCByZXF1ZXN0IGFmdGVyIHJlc3VtZSBzdGF0dXMgc2hvdWxkIGJlIHJlamVjdGVkXG4gICAgICAgICAgICBsZXQgdXNlckRlbGV0ZVJlcXVlc3QgPSBhd2FpdCBVc2VyRGVsZXRlUmVxdWVzdC5maW5kT25lKHsgXCJ1c2VySWRcIjogdXNlci5faWQsIHN0YXR1czogeyAkaW46IFtcImFjY2VwdGVkXCIsIFwicmVzdW1lXCJdIH0gfSk7XG4gICAgICAgICAgICBpZiAodXNlckRlbGV0ZVJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDAsIHsgbWVzc2FnZTogXCJ5b3VyIGFjY291bnQgaXMgZGVsZXRlZCAucGxlYXNlIHJlcXVlc3QgZm9yIHJlc3VtZSB5b3VyIGFjY291bnRcIiwgZGF0YTogdXNlckRlbGV0ZVJlcXVlc3QgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgcGFzc3dvcmQgaXMgY29ycmVjdFxuICAgICAgICAgICAgaWYgKCFjb21wYXJlU3luYyhwYXNzd29yZC50b1N0cmluZygpLCB1c2VyLnBhc3N3b3JkKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9ERVRBSUxTKSB9KTtcblxuICAgICAgICAgICAgdXNlciA9IHVzZXIudG9PYmplY3QoKTtcbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyBkZXZpY2VUb2tlbiwgZGV2aWNlSWQgfSk7XG4gICAgICAgICAgICB1c2VyLnNldHRpbmdzID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlclNldHRpbmdzTW9kZWwsIHsgdXNlcklkOiB1c2VyLl9pZCB9KTtcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRva2VuXG4gICAgICAgICAgICBjb25zdCB0b2tlbiA9IGdlbmVyYXRlVG9rZW4odXNlci5faWQsIHsgbmFtZTogdXNlci5uYW1lLCBlbWFpbDogdXNlci5lbWFpbCwgbW9iaWxlOiB1c2VyLm1vYmlsZSwgcm9sZTogdXNlci5yb2xlLCB1c2VySWQ6IHVzZXIudXNlcklkIH0pO1xuICAgICAgICAgICAgLy8gc2VuZCByZXNwb25zZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5MT0dJTl9TVUNDRVNTKSxcbiAgICAgICAgICAgICAgICB0b2tlbixcbiAgICAgICAgICAgICAgICB1c2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRtaW4gbG9naW5cbiAgICAgKi9cbiAgICBhZG1pbkxvZ2luID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgb2YgdGhlIGV4cHJlc3MgdmFsaWRhdG9ycyBmcm9tIHJvdXRlXG4gICAgICAgICAgICBjb25zdCBlcnJvcnMgPSB2YWxpZGF0aW9uUmVzdWx0KHJlcSk7XG4gICAgICAgICAgICBpZiAoIWVycm9ycy5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGVycm9ycy5hcnJheSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbihlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IHVzZXJJbnB1dCwgcGFzc3dvcmQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciBlbWFpbCBhbmQgcGFzc3dvcmQgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXJJbnB1dCB8fCAhcGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOQURFUVVBVEVfREFUQSkgfSk7XG4gICAgICAgICAgICAvLyBHZXQgdXNlciBkZXRhaWxzXG4gICAgICAgICAgICBsZXQgdXNlciA9IGF3YWl0IENvbW1vbi5maW5kU2luZ2xlKFVzZXJNb2RlbCwgeyAkb3I6IFt7IGVtYWlsOiB7ICRyZWdleDogdXNlcklucHV0LCAkb3B0aW9uczogXCJpXCIgfSB9LCB7IG1vYmlsZTogdXNlcklucHV0IH1dLCBpc0RlbGV0ZWQ6IGZhbHNlIH0sIHBhcmFtcyk7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIGVtYWlsIG5vdCBleGlzdHMgaW4gREJcbiAgICAgICAgICAgIGlmICghdXNlcikgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PX01BVENIX1dJVEhfSU5QVVQpIH0pO1xuXG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgcm9sZSBpcyBub3QgYWRtaW5cbiAgICAgICAgICAgIGlmICh1c2VyLnJvbGUgIT09ICdhZG1pbicpIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMSwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5VTkFVVEhPUklaRUQpIH0pO1xuXG4gICAgICAgICAgICAvLyBSZXR1cm5zIGVycm9yIGlmIHVzZXIgaXMgZGVsZXRlZFxuICAgICAgICAgICAgaWYgKHVzZXIuaXNEZWxldGVkKSByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuQUNDT1VOVF9OT1RfRVhJU1RTKSB9KTtcbiAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgcGFzc3dvcmQgaXMgY29ycmVjdFxuICAgICAgICAgICAgaWYgKCFjb21wYXJlU3luYyhwYXNzd29yZC50b1N0cmluZygpLCB1c2VyLnBhc3N3b3JkKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5WQUxJRF9ERVRBSUxTKSB9KTtcblxuICAgICAgICAgICAgdXNlciA9IHVzZXIudG9PYmplY3QoKTtcbiAgICAgICAgICAgIHVzZXIuc2V0dGluZ3MgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyU2V0dGluZ3NNb2RlbCwgeyB1c2VySWQ6IHVzZXIuX2lkIH0pO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgdG9rZW5cbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0gZ2VuZXJhdGVUb2tlbih1c2VyLl9pZCwgeyBuYW1lOiB1c2VyLm5hbWUsIGVtYWlsOiB1c2VyLmVtYWlsLCBtb2JpbGU6IHVzZXIubW9iaWxlLCByb2xlOiB1c2VyLnJvbGUsIHVzZXJJZDogdXNlci51c2VySWQgfSk7XG4gICAgICAgICAgICAvLyBzZW5kIHJlc3BvbnNlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLkxPR0lOX1NVQ0NFU1MpLFxuICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgIHVzZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVzZW5kVmVyaWZpY2F0aW9uTWFpbCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICBsZXQgeyBlbWFpbCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHsgaXNEZWxldGVkOiBmYWxzZSxfaWQ6X2lkIH07XG4gICAgICAgICAgICBpZiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICAvLyBxdWVyeS5lbWFpbCA9IGVtYWlsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLklOQURFUVVBVEVfREFUQSkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBlbWFpbCBvciBtb2JpbGUgYWxyZWFkeSBleGlzdHMgb3Igbm90XG4gICAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoVXNlck1vZGVsLCBxdWVyeSwgWydfaWQnLCAnbmFtZSddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7fSwge30sIHsgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLk5PVF9FWElTVFMpIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBvdHAgPSBvdHBHZW5lcmF0b3IuZ2VuZXJhdGUoNik7XG5cbiAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlci5faWQgfSwgeyBtYWlsVmVyaWZ5T3RwOiBvdHAsdGVtcEVtYWlsOmVtYWlsIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBpZiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQubWVzc2FnZSA9IGBPVFAgaGFzIGJlZW4gc2VudCB0byAke2VtYWlsfWA7XG4gICAgICAgICAgICAgICAgTWFpbC5zZW5kKGVtYWlsLCBgQWN0aXZhdGlvbiBDb2RlIHRvIHZlcmlmeSBlbWFpbGAsIFwiV2VsY29tZSB0byBab2xlTWF0ZSwgWW91ciBPVFAgaXMgOiBcIitvdHArXCIgIGJ5IFVTUk0gTkVUV09SSyBPUEMgUFZULiBMVEQuXCIsIHVzZXIubmFtZSk7XG5cbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNzYWdlID0gYE9UUCBoYXMgYmVlbiBzZW50IHRvICR7bW9iaWxlfWA7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBDb2RlIHRvIHNlbmQgU01TIHRvIE1vYmlsZSBuby5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdC5vdHAgPSBvdHA7XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2ZXJpZnlFbWFpbE90cCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdChyZXEpO1xuICAgICAgICAgICAgaWYgKCFlcnJvcnMuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnJvcnMuYXJyYXkoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDApLmpzb24oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHsgZW1haWwsIG90cCB9ID0gcmVxLmJvZHk7XG5cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0geyBpc0RlbGV0ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICBjb25zdCBxdWVyeTEgPSB7IGlzRGVsZXRlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIGlmIChlbWFpbCkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmVtYWlsID0gZW1haWw7XG4gICAgICAgICAgICAgICAgcXVlcnkxLnRlbXBFbWFpbCA9IGVtYWlsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiByZXEudChjb25zdGFudHMuSU5BREVRVUFURV9EQVRBKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGVtYWlsIG9yIG1vYmlsZSBhbHJlYWR5IGV4aXN0cyBvciBub3RcbiAgICAgICAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHF1ZXJ5LCBbJ19pZCcsICdtYWlsVmVyaWZ5T3RwJywndGVtcEVtYWlsJ10pO1xuICAgICAgICAgICAgY29uc3QgdXNlcjEgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShVc2VyTW9kZWwsIHF1ZXJ5MSwgWydfaWQnLCAnbWFpbFZlcmlmeU90cCcsJ3RlbXBFbWFpbCddKTtcbiAgICAgICAgICAgIC8vIFJldHVybnMgZXJyb3IgaWYgdXNlciBub3QgZXhpc3RzXG4gICAgICAgICAgICBpZiAoIXVzZXIgJiYgIXVzZXIxKVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IHJlcS50KGNvbnN0YW50cy5OT1RfRVhJU1RTKSB9KTtcblxuICAgICAgICAgICAgaWYgKHVzZXIgJiYgdXNlci5tYWlsVmVyaWZ5T3RwKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHVzZXIubWFpbFZlcmlmeU90cCA9PSBvdHApIHtcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKFVzZXJNb2RlbCwgeyBfaWQ6IHVzZXIuX2lkIH0sIHsgaXNNYWlsVmVyaWZpZWQ6IHRydWUsZW1haWw6dXNlci50ZW1wRW1haWwgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBtZXNzYWdlOiBcIk9UUCBWZXJpZmllZFwiIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwge30sIHt9LCB7IG1lc3NhZ2U6IFwiV3JvbmcgT1RQXCIgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZih1c2VyMSAmJiB1c2VyMS5tYWlsVmVyaWZ5T3RwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyMS5tYWlsVmVyaWZ5T3RwID09IG90cCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcjEuX2lkIH0sIHsgaXNNYWlsVmVyaWZpZWQ6IHRydWUsZW1haWw6dXNlcjEudGVtcEVtYWlsIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgbWVzc2FnZTogXCJPVFAgVmVyaWZpZWRcIiB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiBcIldyb25nIE9UUFwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHt9LCB7fSwgeyBtZXNzYWdlOiBcIk5vIE9UUCBleGlzdHMsIHBsZWFzZSB0cnkgYWdhaW5cIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgbG9nb3V0PWFzeW5jIChyZXEscmVzKT0+e1xuICAgICAgICBsZXQgeyB1c2VySWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICBcbiAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VySWRcIiwgcmVxLmJvZHkpXG4gICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogdXNlcklkIH0sIHsgZGV2aWNlVG9rZW46ICcnIH0pO1xuICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHtcIm1lc3NhZ2VcIjpcIkxvZ291dCBTdWNjZXNzZnVsbHlcIn0pO1xuICAgIH1cbiAgICB0ZXN0U21zPWFzeW5jICgpID0+IHtcblxuICAgICAgICAvLyBsZXQgcmVzdWx0PWF3YWl0IE5vdGlmaWNhdGlvbnMuc2VuZE9UUFNtcyhcIjkxODk0OTUyOTMwMVwiLFwiMTIzNFwiLFwiY2hldGFuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNkZFwiKTtcbiAgICAgICAgTWFpbC5zZW5kKFwiY2hldGFuMTMxMDE5OTJAZ21haWwuY29tXCIsIGBBY3RpdmF0aW9uIENvZGUgdG8gdmVyaWZ5IGVtYWlsYCwgXCJXZWxjb21lIHRvIFpvbGVNYXRlLCBZb3VyIE9UUCBpcyA6IDEyNTUgIGJ5IFVTUk0gTkVUV09SSyBPUEMgUFZULiBMVEQuXCIsIFwiY2hldGFuXCIpO1xuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IG5ldyBBdXRoQ29udHJvbGxlcigpO1xuIl19