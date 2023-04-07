"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pagination = require("../Helper/Pagination");

var _RequestHelper = require("../Helper/RequestHelper");

var _Mongo = require("../Helper/Mongo");

var _Country = _interopRequireDefault(require("../Models/Country"));

var _State = _interopRequireDefault(require("../Models/State"));

var _City = _interopRequireDefault(require("../Models/City"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  Invite Reward Controller Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
var params = ['zole', 'popularity'];

class LocationController {
  constructor() {
    _defineProperty(this, "countryList", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var result = yield _Country.default.find();
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

    _defineProperty(this, "stateList", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            countryId
          } = req.body;
          console.log(countryId, typeof countryId);
          var result = yield _State.default.find({
            country_id: countryId
          });
          console.log(result);
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "cityList", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            stateId
          } = req.body;
          var result = yield _City.default.find({
            state_id: stateId
          }, ['name']); // const result = await Common.list(City,{state_id:stateId});

          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());
  }

}

var _default = new LocationController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0xvY2F0aW9uQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJwYXJhbXMiLCJMb2NhdGlvbkNvbnRyb2xsZXIiLCJyZXEiLCJyZXMiLCJyZXN1bHQiLCJDb3VudHJ5IiwiZmluZCIsImVycm9yIiwiY291bnRyeUlkIiwiYm9keSIsImNvbnNvbGUiLCJsb2ciLCJTdGF0ZSIsImNvdW50cnlfaWQiLCJzdGF0ZUlkIiwiQ2l0eSIsInN0YXRlX2lkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLElBQU1BLE1BQU0sR0FBRyxDQUFDLE1BQUQsRUFBUyxZQUFULENBQWY7O0FBRUEsTUFBTUMsa0JBQU4sQ0FBeUI7QUFBQTtBQUFBO0FBQUEsbUNBR1AsV0FBT0MsR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBQzlCLFlBQUk7QUFFQSxjQUFNQyxNQUFNLFNBQVNDLGlCQUFRQyxJQUFSLEVBQXJCO0FBQ0EsaUJBQU8sZ0NBQVlILEdBQVosRUFBaUIsR0FBakIsRUFBc0JDLE1BQXRCLENBQVA7QUFDSCxTQUpELENBSUUsT0FBT0csS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUosR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkksS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0Fab0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0FhVCxXQUFPTCxHQUFQLEVBQVlDLEdBQVosRUFBb0I7QUFDNUIsWUFBSTtBQUNBLGNBQU07QUFBRUssWUFBQUE7QUFBRixjQUFnQk4sR0FBRyxDQUFDTyxJQUExQjtBQUNBQyxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWUgsU0FBWixFQUF1QixPQUFPQSxTQUE5QjtBQUNBLGNBQU1KLE1BQU0sU0FBU1EsZUFBTU4sSUFBTixDQUFXO0FBQUNPLFlBQUFBLFVBQVUsRUFBQ0w7QUFBWixXQUFYLENBQXJCO0FBQ0FFLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZUCxNQUFaO0FBQ0EsaUJBQU8sZ0NBQVlELEdBQVosRUFBaUIsR0FBakIsRUFBc0JDLE1BQXRCLENBQVA7QUFFSCxTQVBELENBT0UsT0FBT0csS0FBUCxFQUFjO0FBQ1o7QUFDQSxpQkFBTyxnQ0FBWUosR0FBWixFQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQixFQUExQixFQUE4QkksS0FBOUIsQ0FBUDtBQUNIO0FBQ0osT0F6Qm9COztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsb0NBMEJWLFdBQU9MLEdBQVAsRUFBWUMsR0FBWixFQUFvQjtBQUMzQixZQUFJO0FBQ0EsY0FBTTtBQUFFVyxZQUFBQTtBQUFGLGNBQWNaLEdBQUcsQ0FBQ08sSUFBeEI7QUFFQSxjQUFNTCxNQUFNLFNBQVNXLGNBQUtULElBQUwsQ0FBVTtBQUFDVSxZQUFBQSxRQUFRLEVBQUNGO0FBQVYsV0FBVixFQUE4QixDQUFDLE1BQUQsQ0FBOUIsQ0FBckIsQ0FIQSxDQUlBOztBQUVBLGlCQUFPLGdDQUFZWCxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCQyxNQUF0QixDQUFQO0FBQ0gsU0FQRCxDQU9FLE9BQU9HLEtBQVAsRUFBYztBQUNaO0FBQ0EsaUJBQU8sZ0NBQVlKLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEJJLEtBQTlCLENBQVA7QUFDSDtBQUNKLE9BdENvQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQTRDVixJQUFJTixrQkFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQge1xuICAgIHBhZ2luYXRpb24sXG4gICAgcGFyc2VDdXJyZW50UGFnZSxcbiAgICBwYXJzZUxpbWl0LFxufSBmcm9tICcuLi9IZWxwZXIvUGFnaW5hdGlvbic7XG5pbXBvcnQgeyBidWlsZFJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcbmltcG9ydCB7IHBhZ2luYXRpb25SZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvTW9uZ28nO1xuaW1wb3J0IENvdW50cnkgZnJvbSBcIi4uL01vZGVscy9Db3VudHJ5XCI7XG5pbXBvcnQgU3RhdGUgZnJvbSBcIi4uL01vZGVscy9TdGF0ZVwiO1xuaW1wb3J0IENpdHkgZnJvbSBcIi4uL01vZGVscy9DaXR5XCI7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuXG4vKipcbiAqICBJbnZpdGUgUmV3YXJkIENvbnRyb2xsZXIgQ2xhc3NcbiAqICBAYXV0aG9yIE5pdGlzaGEgS2hhbmRlbHdhbCA8bml0aXNoYS5raGFuZGVsd2FsQGpwbG9mdC5pbj5cbiAqL1xuXG5jb25zdCBwYXJhbXMgPSBbJ3pvbGUnLCAncG9wdWxhcml0eSddO1xuXG5jbGFzcyBMb2NhdGlvbkNvbnRyb2xsZXIge1xuXG4gIFxuICAgIGNvdW50cnlMaXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb3VudHJ5LmZpbmQoKTtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgc3RhdGVMaXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGNvdW50cnlJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjb3VudHJ5SWQsIHR5cGVvZiBjb3VudHJ5SWQpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgU3RhdGUuZmluZCh7Y291bnRyeV9pZDpjb3VudHJ5SWR9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdCk7XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgIFxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjaXR5TGlzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBzdGF0ZUlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDaXR5LmZpbmQoe3N0YXRlX2lkOnN0YXRlSWR9LCBbJ25hbWUnXSk7XG4gICAgICAgICAgICAvLyBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24ubGlzdChDaXR5LHtzdGF0ZV9pZDpzdGF0ZUlkfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gIFxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBMb2NhdGlvbkNvbnRyb2xsZXIoKTtcbiJdfQ==