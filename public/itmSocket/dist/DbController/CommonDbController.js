"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = _interopRequireDefault(require("../../resources/constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// DB Queries
class CommonDbController {
  constructor() {
    _defineProperty(this, "create", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (model, data) {
        return yield new model(_objectSpread({}, data)).save();
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "list", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (model, query, params, populate, sort) {
        var limit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : "all";

        if (populate) {
          if (limit != "all") {
            return yield model.find(query, params).populate(populate).sort(sort ? sort : {
              createdAt: -1
            }).limit(limit);
          } else {
            return yield model.find(query, params).populate(populate).sort(sort ? sort : {
              createdAt: -1
            });
          }
        } else {
          if (limit != "all") {
            return yield model.find(query, params).sort(sort ? sort : {
              createdAt: -1
            }).limit(limit);
          } else {
            return yield model.find(query, params).sort(sort ? sort : {
              createdAt: -1
            });
          }
        }
      });

      return function (_x3, _x4, _x5, _x6, _x7) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "findById", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (model, query) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var populate = arguments.length > 3 ? arguments[3] : undefined;

        if (populate) {
          return yield model.findById(query, params).populate(populate);
        } else {
          return yield model.findById(query, params);
        }
      });

      return function (_x8, _x9) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "findSingle", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (model, query) {
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var populate = arguments.length > 3 ? arguments[3] : undefined;

        if (populate) {
          return yield model.findOne(query, params).populate(populate);
        } else {
          return yield model.findOne(query, params);
        }
      });

      return function (_x10, _x11) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "update", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (model, query, data) {
        yield model.updateMany(query, {
          $set: _objectSpread({}, data)
        }, {
          multi: true
        });
        return {
          message: _constants.default.UPDATED
        };
      });

      return function (_x12, _x13, _x14) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "remove", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (model, query) {
        yield model.deleteOne(query);
        return {
          message: 'Entry deleted'
        };
      });

      return function (_x15, _x16) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "deleteMultiple", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (model, query) {
        var result = yield model.deleteMany(query);
        return {
          message: result.deletedCount + ' Records deleted'
        };
      });

      return function (_x17, _x18) {
        return _ref7.apply(this, arguments);
      };
    }());

    _defineProperty(this, "count", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* (model, query) {
        return yield model.countDocuments(query);
      });

      return function (_x19, _x20) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "distinct", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(function* (model, fieldName) {
        return yield model.find().distinct(fieldName);
      });

      return function (_x21, _x22) {
        return _ref9.apply(this, arguments);
      };
    }());
  }

}

var _default = new CommonDbController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIkNvbW1vbkRiQ29udHJvbGxlciIsIm1vZGVsIiwiZGF0YSIsInNhdmUiLCJxdWVyeSIsInBhcmFtcyIsInBvcHVsYXRlIiwic29ydCIsImxpbWl0IiwiZmluZCIsImNyZWF0ZWRBdCIsImZpbmRCeUlkIiwiZmluZE9uZSIsInVwZGF0ZU1hbnkiLCIkc2V0IiwibXVsdGkiLCJtZXNzYWdlIiwiY29uc3RhbnRzIiwiVVBEQVRFRCIsImRlbGV0ZU9uZSIsInJlc3VsdCIsImRlbGV0ZU1hbnkiLCJkZWxldGVkQ291bnQiLCJjb3VudERvY3VtZW50cyIsImZpZWxkTmFtZSIsImRpc3RpbmN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7O0FBRUE7QUFDQSxNQUFNQSxrQkFBTixDQUF5QjtBQUFBO0FBQUE7QUFBQSxtQ0FFWixXQUFPQyxLQUFQLEVBQWNDLElBQWQsRUFBdUI7QUFDNUIscUJBQWEsSUFBSUQsS0FBSixtQkFBY0MsSUFBZCxHQUFxQkMsSUFBckIsRUFBYjtBQUNILE9BSm9COztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsb0NBT2QsV0FBT0YsS0FBUCxFQUFjRyxLQUFkLEVBQXFCQyxNQUFyQixFQUE2QkMsUUFBN0IsRUFBdUNDLElBQXZDLEVBQTREO0FBQUEsWUFBaEJDLEtBQWdCLHVFQUFWLEtBQVU7O0FBQy9ELFlBQUlGLFFBQUosRUFBYztBQUNWLGNBQUdFLEtBQUssSUFBSSxLQUFaLEVBQ0E7QUFDSSx5QkFBYVAsS0FBSyxDQUFDUSxJQUFOLENBQVdMLEtBQVgsRUFBa0JDLE1BQWxCLEVBQTBCQyxRQUExQixDQUFtQ0EsUUFBbkMsRUFBNkNDLElBQTdDLENBQWtEQSxJQUFJLEdBQUdBLElBQUgsR0FBVTtBQUFDRyxjQUFBQSxTQUFTLEVBQUUsQ0FBQztBQUFiLGFBQWhFLEVBQWlGRixLQUFqRixDQUF1RkEs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TSxDQUFDRSxZQUFQLEdBQXNCO0FBQWhDLFNBQVA7QUFDSCxPQWhFb0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0FtRWIsV0FBT3JCLEtBQVAsRUFBY0csS0FBZCxFQUF3QjtBQUM1QixxQkFBYUgsS0FBSyxDQUFDc0IsY0FBTixDQUFxQm5CLEtBQXJCLENBQWI7QUFDSCxPQXJFb0I7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxvQ0F3RVYsV0FBT0gsS0FBUCxFQUFjdUIsU0FBZCxFQUE0QjtBQUNuQyxxQkFBY3ZCLEtBQUssQ0FBQ1EsSUFBTixHQUFhZ0IsUUFBYixDQUFzQkQsU0FBdEIsQ0FBZDtBQUNILE9BMUVvQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQTZFVixJQUFJeEIsa0JBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5cbi8vIERCIFF1ZXJpZXNcbmNsYXNzIENvbW1vbkRiQ29udHJvbGxlciB7XG4gICAgLy8gQ3JlYXRlIHF1ZXJ5XG4gICAgY3JlYXRlID0gYXN5bmMgKG1vZGVsLCBkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCBuZXcgbW9kZWwoey4uLmRhdGF9KS5zYXZlKCk7XG4gICAgfTtcblxuICAgIC8vIFF1ZXJ5IGZvciBsaXN0IG9mIGRhdGFcbiAgICBsaXN0ID0gYXN5bmMgKG1vZGVsLCBxdWVyeSwgcGFyYW1zLCBwb3B1bGF0ZSwgc29ydCxsaW1pdD1cImFsbFwiKSA9PiB7XG4gICAgICAgIGlmIChwb3B1bGF0ZSkge1xuICAgICAgICAgICAgaWYobGltaXQgIT0gXCJhbGxcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgbW9kZWwuZmluZChxdWVyeSwgcGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZSkuc29ydChzb3J0ID8gc29ydCA6IHtjcmVhdGVkQXQ6IC0xfSkubGltaXQobGltaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBtb2RlbC5maW5kKHF1ZXJ5LCBwYXJhbXMpLnBvcHVsYXRlKHBvcHVsYXRlKS5zb3J0KHNvcnQgPyBzb3J0IDoge2NyZWF0ZWRBdDogLTF9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmKGxpbWl0ICE9IFwiYWxsXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IG1vZGVsLmZpbmQocXVlcnksIHBhcmFtcykuc29ydChzb3J0ID8gc29ydCA6IHtjcmVhdGVkQXQ6IC0xfSkubGltaXQobGltaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCBtb2RlbC5maW5kKHF1ZXJ5LCBwYXJhbXMpLnNvcnQoc29ydCA/IHNvcnQgOiB7Y3JlYXRlZEF0OiAtMX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBRdWVyeSB0byBmaW5kIGRhdGEgYnkgaWRcbiAgICBmaW5kQnlJZCA9IGFzeW5jIChtb2RlbCwgcXVlcnksIHBhcmFtcyA9IFtdLCBwb3B1bGF0ZSkgPT4ge1xuICAgICAgICBpZiAocG9wdWxhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBtb2RlbC5maW5kQnlJZChxdWVyeSwgcGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgbW9kZWwuZmluZEJ5SWQocXVlcnksIHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUXVlcnkgdG8gZmluZCBzaW5nbGUgZGF0YVxuICAgIGZpbmRTaW5nbGUgPSBhc3luYyAobW9kZWwsIHF1ZXJ5LCBwYXJhbXMgPSBbXSwgcG9wdWxhdGUpID0+IHtcbiAgICAgICAgaWYgKHBvcHVsYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgbW9kZWwuZmluZE9uZShxdWVyeSwgcGFyYW1zKS5wb3B1bGF0ZShwb3B1bGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgbW9kZWwuZmluZE9uZShxdWVyeSwgcGFyYW1zKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBRdWVyeSB0byB1cGRhdGUgZGF0YVxuICAgIHVwZGF0ZSA9IGFzeW5jIChtb2RlbCwgcXVlcnksIGRhdGEpID0+IHtcbiAgICAgICAgYXdhaXQgbW9kZWwudXBkYXRlTWFueShxdWVyeSwgeyRzZXQ6IHsuLi5kYXRhfX0sIHttdWx0aTogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4ge21lc3NhZ2U6IGNvbnN0YW50cy5VUERBVEVEfTtcbiAgICB9O1xuXG4gICAgLy8gUXVlcnkgdG8gZGVsZXRlIGVudHJ5XG4gICAgcmVtb3ZlID0gYXN5bmMgKG1vZGVsLCBxdWVyeSkgPT4ge1xuICAgICAgICBhd2FpdCBtb2RlbC5kZWxldGVPbmUocXVlcnkpO1xuICAgICAgICByZXR1cm4ge21lc3NhZ2U6ICdFbnRyeSBkZWxldGVkJ307XG4gICAgfTtcblxuICAgIGRlbGV0ZU11bHRpcGxlID0gYXN5bmMgKG1vZGVsLCBxdWVyeSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBtb2RlbC5kZWxldGVNYW55KHF1ZXJ5KTtcbiAgICAgICAgcmV0dXJuIHttZXNzYWdlOiByZXN1bHQuZGVsZXRlZENvdW50ICsgJyBSZWNvcmRzIGRlbGV0ZWQnfTtcbiAgICB9O1xuXG4gICAgLy8gUXVlcnkgdG8gY291bnQgdGhlIGRhdGFcbiAgICBjb3VudCA9IGFzeW5jIChtb2RlbCwgcXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IG1vZGVsLmNvdW50RG9jdW1lbnRzKHF1ZXJ5KTtcbiAgICB9O1xuXG4gICAgLy8gUXVlcnkgdG8gZ2V0IGRpc3RpbmN0IGVudHJpZXNcbiAgICBkaXN0aW5jdCA9IGFzeW5jIChtb2RlbCwgZmllbGROYW1lKSA9PiB7XG4gICAgICAgIHJldHVybiBhd2FpdCAgbW9kZWwuZmluZCgpLmRpc3RpbmN0KGZpZWxkTmFtZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQ29tbW9uRGJDb250cm9sbGVyKCk7Il19