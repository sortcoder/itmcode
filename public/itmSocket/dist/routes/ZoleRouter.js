"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _ZoleController = _interopRequireDefault(require("../Controller/ZoleController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

var _VerifyAdminScope = _interopRequireDefault(require("../Middlewares/VerifyAdminScope"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.post('', _JwtVerify.default, _VerifyAdminScope.default, _ZoleController.default.create);
router.get('', _JwtVerify.default, _ZoleController.default.index);
router.get('/:id', _JwtVerify.default, _ZoleController.default.single);
router.put('/:id', _JwtVerify.default, _VerifyAdminScope.default, _ZoleController.default.update);
router.delete('/:id', _JwtVerify.default, _VerifyAdminScope.default, _ZoleController.default.remove);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvWm9sZVJvdXRlci5qcyJdLCJuYW1lcyI6WyJyb3V0ZXIiLCJleHByZXNzIiwiUm91dGVyIiwicG9zdCIsIkp3dFZlcmlmeSIsIlZlcmlmeUFkbWluU2NvcGUiLCJab2xlIiwiY3JlYXRlIiwiZ2V0IiwiaW5kZXgiLCJzaW5nbGUiLCJwdXQiLCJ1cGRhdGUiLCJkZWxldGUiLCJyZW1vdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7QUFDQTs7OztBQUhBLElBQU1BLE1BQU0sR0FBR0MsaUJBQVFDLE1BQVIsRUFBZjs7QUFLQUYsTUFBTSxDQUFDRyxJQUFQLENBQVksRUFBWixFQUFnQkMsa0JBQWhCLEVBQTJCQyx5QkFBM0IsRUFBNkNDLHdCQUFLQyxNQUFsRDtBQUNBUCxNQUFNLENBQUNRLEdBQVAsQ0FBVyxFQUFYLEVBQWVKLGtCQUFmLEVBQTBCRSx3QkFBS0csS0FBL0I7QUFDQVQsTUFBTSxDQUFDUSxHQUFQLENBQVcsTUFBWCxFQUFtQkosa0JBQW5CLEVBQThCRSx3QkFBS0ksTUFBbkM7QUFDQVYsTUFBTSxDQUFDVyxHQUFQLENBQVcsTUFBWCxFQUFtQlAsa0JBQW5CLEVBQThCQyx5QkFBOUIsRUFBZ0RDLHdCQUFLTSxNQUFyRDtBQUNBWixNQUFNLENBQUNhLE1BQVAsQ0FBYyxNQUFkLEVBQXNCVCxrQkFBdEIsRUFBaUNDLHlCQUFqQyxFQUFtREMsd0JBQUtRLE1BQXhEO2VBRWVkLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZXhwcmVzcyBmcm9tICdleHByZXNzJztcbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5pbXBvcnQgWm9sZSBmcm9tICcuLi9Db250cm9sbGVyL1pvbGVDb250cm9sbGVyJztcbmltcG9ydCBKd3RWZXJpZnkgZnJvbSAnLi4vTWlkZGxld2FyZXMvSnd0VmVyaWZ5JztcbmltcG9ydCBWZXJpZnlBZG1pblNjb3BlIGZyb20gJy4uL01pZGRsZXdhcmVzL1ZlcmlmeUFkbWluU2NvcGUnO1xuXG5yb3V0ZXIucG9zdCgnJywgSnd0VmVyaWZ5LCBWZXJpZnlBZG1pblNjb3BlLCBab2xlLmNyZWF0ZSk7XG5yb3V0ZXIuZ2V0KCcnLCBKd3RWZXJpZnksIFpvbGUuaW5kZXgpO1xucm91dGVyLmdldCgnLzppZCcsIEp3dFZlcmlmeSwgWm9sZS5zaW5nbGUpO1xucm91dGVyLnB1dCgnLzppZCcsIEp3dFZlcmlmeSwgVmVyaWZ5QWRtaW5TY29wZSwgWm9sZS51cGRhdGUpO1xucm91dGVyLmRlbGV0ZSgnLzppZCcsIEp3dFZlcmlmeSwgVmVyaWZ5QWRtaW5TY29wZSwgWm9sZS5yZW1vdmUpO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXI7XG4iXX0=