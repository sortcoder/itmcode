"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _PaymentController = _interopRequireDefault(require("../Controller/PaymentController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.post('', _JwtVerify.default, _PaymentController.default.create);
router.get('', _JwtVerify.default, _PaymentController.default.index);
router.get('/:id', _JwtVerify.default, _PaymentController.default.single);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvUGF5bWVudFJvdXRlci5qcyJdLCJuYW1lcyI6WyJyb3V0ZXIiLCJleHByZXNzIiwiUm91dGVyIiwicG9zdCIsIkp3dFZlcmlmeSIsIlBheW1lbnQiLCJjcmVhdGUiLCJnZXQiLCJpbmRleCIsInNpbmdsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVBOztBQUNBOzs7O0FBRkEsSUFBTUEsTUFBTSxHQUFHQyxpQkFBUUMsTUFBUixFQUFmOztBQUlBRixNQUFNLENBQUNHLElBQVAsQ0FBWSxFQUFaLEVBQWdCQyxrQkFBaEIsRUFBMkJDLDJCQUFRQyxNQUFuQztBQUNBTixNQUFNLENBQUNPLEdBQVAsQ0FBVyxFQUFYLEVBQWVILGtCQUFmLEVBQTBCQywyQkFBUUcsS0FBbEM7QUFDQVIsTUFBTSxDQUFDTyxHQUFQLENBQVcsTUFBWCxFQUFtQkgsa0JBQW5CLEVBQThCQywyQkFBUUksTUFBdEM7ZUFFZVQsTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCBQYXltZW50IGZyb20gJy4uL0NvbnRyb2xsZXIvUGF5bWVudENvbnRyb2xsZXInO1xuaW1wb3J0IEp3dFZlcmlmeSBmcm9tICcuLi9NaWRkbGV3YXJlcy9Kd3RWZXJpZnknO1xuXG5yb3V0ZXIucG9zdCgnJywgSnd0VmVyaWZ5LCBQYXltZW50LmNyZWF0ZSk7XG5yb3V0ZXIuZ2V0KCcnLCBKd3RWZXJpZnksIFBheW1lbnQuaW5kZXgpO1xucm91dGVyLmdldCgnLzppZCcsIEp3dFZlcmlmeSwgUGF5bWVudC5zaW5nbGUpO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7XG4iXX0=