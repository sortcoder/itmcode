"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _expressValidator = require("express-validator");

var _AuthController = _interopRequireDefault(require("../Controller/AuthController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

var _FileUploader = _interopRequireDefault(require("../Middlewares/FileUploader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.post('/send-otp', (0, _expressValidator.body)('mobile').exists().withMessage('Mobile no. should not be empty'), _AuthController.default.sendOtp);
router.post('/verify-mobile', (0, _expressValidator.body)('mobile').exists().withMessage('Mobile no. should not be empty'), (0, _expressValidator.body)('otp').exists().withMessage('Otp should not be empty'), _AuthController.default.verifyMobileNumber);
router.post('/register', (0, _expressValidator.body)('name').exists().withMessage('FirstName should not be empty'), (0, _expressValidator.body)('email').exists().withMessage('Email should not be empty').isEmail().withMessage('Email should be in correct format'), (0, _expressValidator.body)('mobile').exists().withMessage('Mobile should not be empty'), _AuthController.default.register);
router.post('/verify-account', _AuthController.default.sendOtpForForgetPassword);
router.post('/verify-otp', _AuthController.default.verifyOtp);
router.post('/forgot-password', _AuthController.default.forgotPassword);
router.post('/login', (0, _expressValidator.body)('userInput').exists().withMessage('Input should not be blank'), (0, _expressValidator.check)('password').isLength({
  min: 6
}).withMessage('Password must be at least 6 chars long'), _AuthController.default.login);
router.post('/admin-login', (0, _expressValidator.body)('userInput').exists().withMessage('Input should not be blank'), (0, _expressValidator.check)('password').isLength({
  min: 6
}).withMessage('Password must be at least 6 chars long'), _AuthController.default.adminLogin);
router.post('/resend-verification-email', _JwtVerify.default, _AuthController.default.resendVerificationMail);
router.post('/verify-email-otp', _AuthController.default.verifyEmailOtp);
router.post('/logout', _FileUploader.default.none(), _AuthController.default.logout);
router.get('/testSms', _AuthController.default.testSms);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvQXV0aFJvdXRlci5qcyJdLCJuYW1lcyI6WyJyb3V0ZXIiLCJleHByZXNzIiwiUm91dGVyIiwicG9zdCIsImV4aXN0cyIsIndpdGhNZXNzYWdlIiwiQXV0aCIsInNlbmRPdHAiLCJ2ZXJpZnlNb2JpbGVOdW1iZXIiLCJpc0VtYWlsIiwicmVnaXN0ZXIiLCJzZW5kT3RwRm9yRm9yZ2V0UGFzc3dvcmQiLCJ2ZXJpZnlPdHAiLCJmb3Jnb3RQYXNzd29yZCIsImlzTGVuZ3RoIiwibWluIiwibG9naW4iLCJhZG1pbkxvZ2luIiwiSnd0VmVyaWZ5IiwicmVzZW5kVmVyaWZpY2F0aW9uTWFpbCIsInZlcmlmeUVtYWlsT3RwIiwidXBsb2FkIiwibm9uZSIsImxvZ291dCIsImdldCIsInRlc3RTbXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7OztBQUpBLElBQU1BLE1BQU0sR0FBR0MsaUJBQVFDLE1BQVIsRUFBZjs7QUFPQUYsTUFBTSxDQUFDRyxJQUFQLENBQVksV0FBWixFQUF5Qiw0QkFBSyxRQUFMLEVBQWVDLE1BQWYsR0FBd0JDLFdBQXhCLENBQW9DLGdDQUFwQyxDQUF6QixFQUFnR0Msd0JBQUtDLE9BQXJHO0FBRUFQLE1BQU0sQ0FBQ0csSUFBUCxDQUFZLGdCQUFaLEVBQ0ksNEJBQUssUUFBTCxFQUFlQyxNQUFmLEdBQXdCQyxXQUF4QixDQUFvQyxnQ0FBcEMsQ0FESixFQUVJLDRCQUFLLEtBQUwsRUFBWUQsTUFBWixHQUFxQkMsV0FBckIsQ0FBaUMseUJBQWpDLENBRkosRUFHSUMsd0JBQUtFLGtCQUhUO0FBS0FSLE1BQU0sQ0FBQ0csSUFBUCxDQUFZLFdBQVosRUFDSSw0QkFBSyxNQUFMLEVBQWFDLE1BQWIsR0FBc0JDLFdBQXRCLENBQWtDLCtCQUFsQyxDQURKLEVBRUksNEJBQUssT0FBTCxFQUFjRCxNQUFkLEdBQXVCQyxXQUF2QixDQUFtQywyQkFBbkMsRUFDS0ksT0FETCxHQUNlSixXQURmLENBQzJCLG1DQUQzQixDQUZKLEVBSUksNEJBQUssUUFBTCxFQUFlRCxNQUFmLEdBQXdCQyxXQUF4QixDQUFvQyw0QkFBcEMsQ0FKSixFQUtJQyx3QkFBS0ksUUFMVDtBQU9BVixNQUFNLENBQUNHLElBQVAsQ0FBWSxpQkFBWixFQUErQkcsd0JBQUtLLHdCQUFwQztBQUVBWCxNQUFNLENBQUNHLElBQVAsQ0FBWSxhQUFaLEVBQTJCRyx3QkFBS00sU0FBaEM7QUFFQVosTUFBTSxDQUFDRyxJQUFQLENBQVksa0JBQVosRUFBZ0NHLHdCQUFLTyxjQUFyQztBQUVBYixNQUFNLENBQUNHLElBQVAsQ0FBWSxRQUFaLEVBQ0ksNEJBQUssV0FBTCxFQUFrQkMsTUFBbEIsR0FBMkJDLFdBQTNCLENBQXVDLDJCQUF2QyxDQURKLEVBRUksNkJBQU0sVUFBTixFQUNLUyxRQURMLENBQ2M7QUFBRUMsRUFBQUEsR0FBRyxFQUFFO0FBQVAsQ0FEZCxFQUVLVixXQUZMLENBRWlCLHdDQUZqQixDQUZKLEVBS0lDLHdCQUFLVSxLQUxUO0FBT0FoQixNQUFNLENBQUNHLElBQVAsQ0FBWSxjQUFaLEVBQ0ksNEJBQUssV0FBTCxFQUFrQkMsTUFBbEIsR0FBMkJDLFdBQTNCLENBQXVDLDJCQUF2QyxDQURKLEVBRUksNkJBQU0sVUFBTixFQUNLUyxRQURMLENBQ2M7QUFBRUMsRUFBQUEsR0FBRyxFQUFFO0FBQVAsQ0FEZCxFQUVLVixXQUZMLENBRWlCLHdDQUZqQixDQUZKLEVBS0lDLHdCQUFLVyxVQUxUO0FBT0FqQixNQUFNLENBQUNHLElBQVAsQ0FBWSw0QkFBWixFQUF5Q2Usa0JBQXpDLEVBQW9EWix3QkFBS2Esc0JBQXpEO0FBRUFuQixNQUFNLENBQUNHLElBQVAsQ0FBWSxtQkFBWixFQUFpQ0csd0JBQUtjLGNBQXRDO0FBRUFwQixNQUFNLENBQUNHLElBQVAsQ0FBWSxTQUFaLEVBQXVCa0Isc0JBQU9DLElBQVAsRUFBdkIsRUFBcUNoQix3QkFBS2lCLE1BQTFDO0FBQ0F2QixNQUFNLENBQUN3QixHQUFQLENBQVcsVUFBWCxFQUF3QmxCLHdCQUFLbUIsT0FBN0I7ZUFFZXpCLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB7IGJvZHksIGNoZWNrIH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCBBdXRoIGZyb20gJy4uL0NvbnRyb2xsZXIvQXV0aENvbnRyb2xsZXInO1xuXG5pbXBvcnQgSnd0VmVyaWZ5IGZyb20gJy4uL01pZGRsZXdhcmVzL0p3dFZlcmlmeSc7XG5pbXBvcnQgdXBsb2FkIGZyb20gJy4uL01pZGRsZXdhcmVzL0ZpbGVVcGxvYWRlcic7XG5cblxucm91dGVyLnBvc3QoJy9zZW5kLW90cCcsIGJvZHkoJ21vYmlsZScpLmV4aXN0cygpLndpdGhNZXNzYWdlKCdNb2JpbGUgbm8uIHNob3VsZCBub3QgYmUgZW1wdHknKSwgQXV0aC5zZW5kT3RwKTtcblxucm91dGVyLnBvc3QoJy92ZXJpZnktbW9iaWxlJyxcbiAgICBib2R5KCdtb2JpbGUnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgnTW9iaWxlIG5vLiBzaG91bGQgbm90IGJlIGVtcHR5JyksXG4gICAgYm9keSgnb3RwJykuZXhpc3RzKCkud2l0aE1lc3NhZ2UoJ090cCBzaG91bGQgbm90IGJlIGVtcHR5JyksXG4gICAgQXV0aC52ZXJpZnlNb2JpbGVOdW1iZXIpO1xuXG5yb3V0ZXIucG9zdCgnL3JlZ2lzdGVyJyxcbiAgICBib2R5KCduYW1lJykuZXhpc3RzKCkud2l0aE1lc3NhZ2UoJ0ZpcnN0TmFtZSBzaG91bGQgbm90IGJlIGVtcHR5JyksXG4gICAgYm9keSgnZW1haWwnKS5leGlzdHMoKS53aXRoTWVzc2FnZSgnRW1haWwgc2hvdWxkIG5vdCBiZSBlbXB0eScpXG4gICAgICAgIC5pc0VtYWlsKCkud2l0aE1lc3NhZ2UoJ0VtYWlsIHNob3VsZCBiZSBpbiBjb3JyZWN0IGZvcm1hdCcpLFxuICAgIGJvZHkoJ21vYmlsZScpLmV4aXN0cygpLndpdGhNZXNzYWdlKCdNb2JpbGUgc2hvdWxkIG5vdCBiZSBlbXB0eScpLFxuICAgIEF1dGgucmVnaXN0ZXIpO1xuXG5yb3V0ZXIucG9zdCgnL3ZlcmlmeS1hY2NvdW50JywgQXV0aC5zZW5kT3RwRm9yRm9yZ2V0UGFzc3dvcmQpO1xuXG5yb3V0ZXIucG9zdCgnL3ZlcmlmeS1vdHAnLCBBdXRoLnZlcmlmeU90cCk7XG5cbnJvdXRlci5wb3N0KCcvZm9yZ290LXBhc3N3b3JkJywgQXV0aC5mb3Jnb3RQYXNzd29yZCk7XG5cbnJvdXRlci5wb3N0KCcvbG9naW4nLFxuICAgIGJvZHkoJ3VzZXJJbnB1dCcpLmV4aXN0cygpLndpdGhNZXNzYWdlKCdJbnB1dCBzaG91bGQgbm90IGJlIGJsYW5rJyksXG4gICAgY2hlY2soJ3Bhc3N3b3JkJylcbiAgICAgICAgLmlzTGVuZ3RoKHsgbWluOiA2IH0pXG4gICAgICAgIC53aXRoTWVzc2FnZSgnUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA2IGNoYXJzIGxvbmcnKSxcbiAgICBBdXRoLmxvZ2luKTtcblxucm91dGVyLnBvc3QoJy9hZG1pbi1sb2dpbicsXG4gICAgYm9keSgndXNlcklucHV0JykuZXhpc3RzKCkud2l0aE1lc3NhZ2UoJ0lucHV0IHNob3VsZCBub3QgYmUgYmxhbmsnKSxcbiAgICBjaGVjaygncGFzc3dvcmQnKVxuICAgICAgICAuaXNMZW5ndGgoeyBtaW46IDYgfSlcbiAgICAgICAgLndpdGhNZXNzYWdlKCdQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDYgY2hhcnMgbG9uZycpLFxuICAgIEF1dGguYWRtaW5Mb2dpbik7XG5cbnJvdXRlci5wb3N0KCcvcmVzZW5kLXZlcmlmaWNhdGlvbi1lbWFpbCcsSnd0VmVyaWZ5LCBBdXRoLnJlc2VuZFZlcmlmaWNhdGlvbk1haWwpO1xuXG5yb3V0ZXIucG9zdCgnL3ZlcmlmeS1lbWFpbC1vdHAnLCBBdXRoLnZlcmlmeUVtYWlsT3RwKTtcblxucm91dGVyLnBvc3QoJy9sb2dvdXQnLCB1cGxvYWQubm9uZSgpLEF1dGgubG9nb3V0KTtcbnJvdXRlci5nZXQoJy90ZXN0U21zJywgIEF1dGgudGVzdFNtcyk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcbiJdfQ==