"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _GifController = _interopRequireDefault(require("../Controller/GifController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

var _FileUploader = _interopRequireDefault(require("../Middlewares/FileUploader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.post('/add', _FileUploader.default.single('image'), _GifController.default.create);
router.post('/edit', _FileUploader.default.single('image'), _GifController.default.update);
router.get('/', _FileUploader.default.none(), _GifController.default.index);
router.get('/:id', _JwtVerify.default, _GifController.default.single);
router.post('/delete', _FileUploader.default.none(), _GifController.default.remove);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvR2lmUm91dGVyLmpzIl0sIm5hbWVzIjpbInJvdXRlciIsImV4cHJlc3MiLCJSb3V0ZXIiLCJwb3N0IiwidXBsb2FkIiwic2luZ2xlIiwiR2lmIiwiY3JlYXRlIiwidXBkYXRlIiwiZ2V0Iiwibm9uZSIsImluZGV4IiwiSnd0VmVyaWZ5IiwicmVtb3ZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7QUFIQSxJQUFNQSxNQUFNLEdBQUdDLGlCQUFRQyxNQUFSLEVBQWY7O0FBUUFGLE1BQU0sQ0FBQ0csSUFBUCxDQUFZLE1BQVosRUFBcUJDLHNCQUFPQyxNQUFQLENBQWMsT0FBZCxDQUFyQixFQUE2Q0MsdUJBQUlDLE1BQWpEO0FBQ0FQLE1BQU0sQ0FBQ0csSUFBUCxDQUFZLE9BQVosRUFBc0JDLHNCQUFPQyxNQUFQLENBQWMsT0FBZCxDQUF0QixFQUE2Q0MsdUJBQUlFLE1BQWpEO0FBQ0FSLE1BQU0sQ0FBQ1MsR0FBUCxDQUFXLEdBQVgsRUFBaUJMLHNCQUFPTSxJQUFQLEVBQWpCLEVBQStCSix1QkFBSUssS0FBbkM7QUFDQVgsTUFBTSxDQUFDUyxHQUFQLENBQVcsTUFBWCxFQUFtQkcsa0JBQW5CLEVBQThCTix1QkFBSUQsTUFBbEM7QUFDQUwsTUFBTSxDQUFDRyxJQUFQLENBQVksU0FBWixFQUF3QkMsc0JBQU9NLElBQVAsRUFBeEIsRUFBc0NKLHVCQUFJTyxNQUExQztlQUdlYixNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGV4cHJlc3MgZnJvbSAnZXhwcmVzcyc7XG5jb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xuaW1wb3J0IEdpZiBmcm9tICcuLi9Db250cm9sbGVyL0dpZkNvbnRyb2xsZXInO1xuaW1wb3J0IEp3dFZlcmlmeSBmcm9tICcuLi9NaWRkbGV3YXJlcy9Kd3RWZXJpZnknO1xuaW1wb3J0IHVwbG9hZCBmcm9tICcuLi9NaWRkbGV3YXJlcy9GaWxlVXBsb2FkZXInO1xuXG5cblxuXG5yb3V0ZXIucG9zdCgnL2FkZCcsICB1cGxvYWQuc2luZ2xlKCdpbWFnZScpLCBHaWYuY3JlYXRlKTtcbnJvdXRlci5wb3N0KCcvZWRpdCcsICB1cGxvYWQuc2luZ2xlKCdpbWFnZScpLEdpZi51cGRhdGUpO1xucm91dGVyLmdldCgnLycsICB1cGxvYWQubm9uZSgpLEdpZi5pbmRleCk7XG5yb3V0ZXIuZ2V0KCcvOmlkJywgSnd0VmVyaWZ5LCBHaWYuc2luZ2xlKTtcbnJvdXRlci5wb3N0KCcvZGVsZXRlJywgIHVwbG9hZC5ub25lKCksR2lmLnJlbW92ZSk7XG5cblxuZXhwb3J0IGRlZmF1bHQgcm91dGVyO1xuIl19