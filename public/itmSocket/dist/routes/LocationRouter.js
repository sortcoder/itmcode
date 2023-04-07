"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _LocationController = _interopRequireDefault(require("../Controller/LocationController"));

var _JwtVerify = _interopRequireDefault(require("../Middlewares/JwtVerify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express.default.Router();

router.get('/country', _LocationController.default.countryList);
router.post('/state', _LocationController.default.stateList);
router.post('/city', _LocationController.default.cityList);
var _default = router;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvTG9jYXRpb25Sb3V0ZXIuanMiXSwibmFtZXMiOlsicm91dGVyIiwiZXhwcmVzcyIsIlJvdXRlciIsImdldCIsIkxvY2F0aW9uIiwiY291bnRyeUxpc3QiLCJwb3N0Iiwic3RhdGVMaXN0IiwiY2l0eUxpc3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7QUFDQTs7OztBQUZBLElBQU1BLE1BQU0sR0FBR0MsaUJBQVFDLE1BQVIsRUFBZjs7QUFNQUYsTUFBTSxDQUFDRyxHQUFQLENBQVcsVUFBWCxFQUF3QkMsNEJBQVNDLFdBQWpDO0FBQ0FMLE1BQU0sQ0FBQ00sSUFBUCxDQUFZLFFBQVosRUFBdUJGLDRCQUFTRyxTQUFoQztBQUNBUCxNQUFNLENBQUNNLElBQVAsQ0FBWSxPQUFaLEVBQXNCRiw0QkFBU0ksUUFBL0I7ZUFHZVIsTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xuY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmltcG9ydCBMb2NhdGlvbiBmcm9tICcuLi9Db250cm9sbGVyL0xvY2F0aW9uQ29udHJvbGxlcic7XG5pbXBvcnQgSnd0VmVyaWZ5IGZyb20gJy4uL01pZGRsZXdhcmVzL0p3dFZlcmlmeSc7XG5cblxuXG5yb3V0ZXIuZ2V0KCcvY291bnRyeScsICBMb2NhdGlvbi5jb3VudHJ5TGlzdCk7XG5yb3V0ZXIucG9zdCgnL3N0YXRlJywgIExvY2F0aW9uLnN0YXRlTGlzdCk7XG5yb3V0ZXIucG9zdCgnL2NpdHknLCAgTG9jYXRpb24uY2l0eUxpc3QpO1xuXG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcjtcbiJdfQ==