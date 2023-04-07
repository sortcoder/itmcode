"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _RoomController = _interopRequireDefault(require("../Controller/RoomController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

var _FileUploader = _interopRequireDefault(require("../Middlewares/FileUploader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.post('', _JwtVerify.default, _FileUploader.default.single('roomImg'), _RoomController.default.create);
router.get('/', _JwtVerify.default, _RoomController.default.index);
router.get('/:id', _JwtVerify.default, _RoomController.default.single);
router.put('/guests', _JwtVerify.default, _RoomController.default.addRemoveGuest);
router.put('/end-live/:id', _JwtVerify.default, _RoomController.default.endLive);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvUm9vbVJvdXRlci5qcyJdLCJuYW1lcyI6WyJyb3V0ZXIiLCJleHByZXNzIiwiUm91dGVyIiwicG9zdCIsIkp3dFZlcmlmeSIsInVwbG9hZCIsInNpbmdsZSIsIlJvb20iLCJjcmVhdGUiLCJnZXQiLCJpbmRleCIsInB1dCIsImFkZFJlbW92ZUd1ZXN0IiwiZW5kTGl2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOztBQUNBOztBQUNBOzs7O0FBSEEsSUFBTUEsTUFBTSxHQUFHQyxpQkFBUUMsTUFBUixFQUFmOztBQUtBRixNQUFNLENBQUNHLElBQVAsQ0FBWSxFQUFaLEVBQWdCQyxrQkFBaEIsRUFBNEJDLHNCQUFPQyxNQUFQLENBQWMsU0FBZCxDQUE1QixFQUFzREMsd0JBQUtDLE1BQTNEO0FBQ0FSLE1BQU0sQ0FBQ1MsR0FBUCxDQUFXLEdBQVgsRUFBZ0JMLGtCQUFoQixFQUEyQkcsd0JBQUtHLEtBQWhDO0FBQ0FWLE1BQU0sQ0FBQ1MsR0FBUCxDQUFXLE1BQVgsRUFBbUJMLGtCQUFuQixFQUE4Qkcsd0JBQUtELE1BQW5DO0FBQ0FOLE1BQU0sQ0FBQ1csR0FBUCxDQUFXLFNBQVgsRUFBc0JQLGtCQUF0QixFQUFpQ0csd0JBQUtLLGNBQXRDO0FBQ0FaLE1BQU0sQ0FBQ1csR0FBUCxDQUFXLGVBQVgsRUFBNEJQLGtCQUE1QixFQUF1Q0csd0JBQUtNLE9BQTVDO2VBRWViLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgUm9vbSBmcm9tICcuLi9Db250cm9sbGVyL1Jvb21Db250cm9sbGVyJztcbmltcG9ydCBKd3RWZXJpZnkgZnJvbSAnLi4vTWlkZGxld2FyZXMvSnd0VmVyaWZ5JztcbmltcG9ydCB1cGxvYWQgZnJvbSAnLi4vTWlkZGxld2FyZXMvRmlsZVVwbG9hZGVyJztcblxucm91dGVyLnBvc3QoJycsIEp3dFZlcmlmeSwgIHVwbG9hZC5zaW5nbGUoJ3Jvb21JbWcnKSwgUm9vbS5jcmVhdGUpO1xucm91dGVyLmdldCgnLycsIEp3dFZlcmlmeSwgUm9vbS5pbmRleCk7XG5yb3V0ZXIuZ2V0KCcvOmlkJywgSnd0VmVyaWZ5LCBSb29tLnNpbmdsZSk7XG5yb3V0ZXIucHV0KCcvZ3Vlc3RzJywgSnd0VmVyaWZ5LCBSb29tLmFkZFJlbW92ZUd1ZXN0KTtcbnJvdXRlci5wdXQoJy9lbmQtbGl2ZS86aWQnLCBKd3RWZXJpZnksIFJvb20uZW5kTGl2ZSk7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcbiJdfQ==