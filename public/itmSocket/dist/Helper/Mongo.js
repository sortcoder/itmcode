"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.paginationResult = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var paginationResult = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var Model = arguments.length > 1 ? arguments[1] : undefined;
    var currentPage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
    var params = arguments.length > 4 ? arguments[4] : undefined;
    var populate = arguments.length > 5 ? arguments[5] : undefined;
    var sort = arguments.length > 6 ? arguments[6] : undefined;
    query = query ? query : {}; // Find list of documents with skip, limit and sort parameters

    var result = yield Model.find(query, params).populate(populate).skip(limit * (currentPage - 1)).limit(limit).sort(sort ? sort : {
      updatedAt: -1
    }); // Count no. of documents

    var totalCount = yield Model.countDocuments(query);
    return {
      result,
      totalCount
    };
  });

  return function paginationResult() {
    return _ref.apply(this, arguments);
  };
}();

exports.paginationResult = paginationResult;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvTW9uZ28uanMiXSwibmFtZXMiOlsicGFnaW5hdGlvblJlc3VsdCIsInF1ZXJ5IiwiTW9kZWwiLCJjdXJyZW50UGFnZSIsImxpbWl0IiwicGFyYW1zIiwicG9wdWxhdGUiLCJzb3J0IiwicmVzdWx0IiwiZmluZCIsInNraXAiLCJ1cGRhdGVkQXQiLCJ0b3RhbENvdW50IiwiY291bnREb2N1bWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQU8sSUFBTUEsZ0JBQWdCO0FBQUEsK0JBQUcsYUFRM0I7QUFBQSxRQVBEQyxLQU9DLHVFQVBPLEVBT1A7QUFBQSxRQU5EQyxLQU1DO0FBQUEsUUFMREMsV0FLQyx1RUFMYSxDQUtiO0FBQUEsUUFKREMsS0FJQyx1RUFKTyxFQUlQO0FBQUEsUUFIREMsTUFHQztBQUFBLFFBRkRDLFFBRUM7QUFBQSxRQUREQyxJQUNDO0FBQ0ROLElBQUFBLEtBQUssR0FBR0EsS0FBSyxHQUFHQSxLQUFILEdBQVcsRUFBeEIsQ0FEQyxDQUVEOztBQUNBLFFBQU1PLE1BQU0sU0FBU04sS0FBSyxDQUFDTyxJQUFOLENBQVdSLEtBQVgsRUFBa0JJLE1BQWxCLEVBQ2hCQyxRQURnQixDQUNQQSxRQURPLEVBRWhCSSxJQUZnQixDQUVYTixLQUFLLElBQUlELFdBQVcsR0FBRyxDQUFsQixDQUZNLEVBR2hCQyxLQUhnQixDQUdWQSxLQUhVLEVBSWhCRyxJQUpnQixDQUlYQSxJQUFJLEdBQUdBLElBQUgsR0FBVTtBQUFDSSxNQUFBQSxTQUFTLEVBQUUsQ0FBQztBQUFiLEtBSkgsQ0FBckIsQ0FIQyxDQVNEOztBQUNBLFFBQU1DLFVBQVUsU0FBU1YsS0FBSyxDQUFDVyxjQUFOLENBQXFCWixLQUFyQixDQUF6QjtBQUNBLFdBQU87QUFDSE8sTUFBQUEsTUFERztBQUVISSxNQUFBQTtBQUZHLEtBQVA7QUFJSCxHQXZCNEI7O0FBQUEsa0JBQWhCWixnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsR0FBdEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgcGFnaW5hdGlvblJlc3VsdCA9IGFzeW5jIChcbiAgICBxdWVyeSA9IHt9LFxuICAgIE1vZGVsLFxuICAgIGN1cnJlbnRQYWdlID0gMSxcbiAgICBsaW1pdCA9IDEwLFxuICAgIHBhcmFtcyxcbiAgICBwb3B1bGF0ZSxcbiAgICBzb3J0XG4pID0+IHtcbiAgICBxdWVyeSA9IHF1ZXJ5ID8gcXVlcnkgOiB7fTtcbiAgICAvLyBGaW5kIGxpc3Qgb2YgZG9jdW1lbnRzIHdpdGggc2tpcCwgbGltaXQgYW5kIHNvcnQgcGFyYW1ldGVyc1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1vZGVsLmZpbmQocXVlcnksIHBhcmFtcylcbiAgICAgICAgLnBvcHVsYXRlKHBvcHVsYXRlKVxuICAgICAgICAuc2tpcChsaW1pdCAqIChjdXJyZW50UGFnZSAtIDEpKVxuICAgICAgICAubGltaXQobGltaXQpXG4gICAgICAgIC5zb3J0KHNvcnQgPyBzb3J0IDoge3VwZGF0ZWRBdDogLTF9KTtcblxuICAgIC8vIENvdW50IG5vLiBvZiBkb2N1bWVudHNcbiAgICBjb25zdCB0b3RhbENvdW50ID0gYXdhaXQgTW9kZWwuY291bnREb2N1bWVudHMocXVlcnkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3VsdCxcbiAgICAgICAgdG90YWxDb3VudCxcbiAgICB9O1xufTtcbiJdfQ==