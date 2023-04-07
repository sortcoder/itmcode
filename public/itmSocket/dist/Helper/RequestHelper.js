"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildResult = void 0;

var buildResult = function buildResult(res, status, result) {
  var pagination = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var error = arguments.length > 4 ? arguments[4] : undefined;

  if (error) {
    // Generate error response
    return res.status(status).json({
      status,
      message: 'error',
      data: {
        message: error.message,
        pagination
      }
    });
  } else {
    // Generate success response
    return res.status(status).json({
      status,
      message: 'success',
      data: {
        result,
        pagination
      }
    });
  }
};

exports.buildResult = buildResult;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvUmVxdWVzdEhlbHBlci5qcyJdLCJuYW1lcyI6WyJidWlsZFJlc3VsdCIsInJlcyIsInN0YXR1cyIsInJlc3VsdCIsInBhZ2luYXRpb24iLCJlcnJvciIsImpzb24iLCJtZXNzYWdlIiwiZGF0YSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFPLElBQU1BLFdBQVcsR0FBRyxTQUFkQSxXQUFjLENBQUNDLEdBQUQsRUFBTUMsTUFBTixFQUFjQyxNQUFkLEVBQWlEO0FBQUEsTUFBM0JDLFVBQTJCLHVFQUFkLEVBQWM7QUFBQSxNQUFWQyxLQUFVOztBQUN4RSxNQUFJQSxLQUFKLEVBQVc7QUFDUDtBQUNBLFdBQU9KLEdBQUcsQ0FBQ0MsTUFBSixDQUFXQSxNQUFYLEVBQW1CSSxJQUFuQixDQUF3QjtBQUMzQkosTUFBQUEsTUFEMkI7QUFFM0JLLE1BQUFBLE9BQU8sRUFBRSxPQUZrQjtBQUczQkMsTUFBQUEsSUFBSSxFQUFFO0FBQ0ZELFFBQUFBLE9BQU8sRUFBRUYsS0FBSyxDQUFDRSxPQURiO0FBRUZILFFBQUFBO0FBRkU7QUFIcUIsS0FBeEIsQ0FBUDtBQVFILEdBVkQsTUFVTztBQUNIO0FBQ0EsV0FBT0gsR0FBRyxDQUFDQyxNQUFKLENBQVdBLE1BQVgsRUFBbUJJLElBQW5CLENBQXdCO0FBQzNCSixNQUFBQSxNQUQyQjtBQUUzQkssTUFBQUEsT0FBTyxFQUFFLFNBRmtCO0FBRzNCQyxNQUFBQSxJQUFJLEVBQUU7QUFDRkwsUUFBQUEsTUFERTtBQUVGQyxRQUFBQTtBQUZFO0FBSHFCLEtBQXhCLENBQVA7QUFRSDtBQUNKLENBdEJNIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGJ1aWxkUmVzdWx0ID0gKHJlcywgc3RhdHVzLCByZXN1bHQsIHBhZ2luYXRpb24gPSB7fSwgZXJyb3IpID0+IHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgLy8gR2VuZXJhdGUgZXJyb3IgcmVzcG9uc2VcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoc3RhdHVzKS5qc29uKHtcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdlcnJvcicsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEdlbmVyYXRlIHN1Y2Nlc3MgcmVzcG9uc2VcbiAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoc3RhdHVzKS5qc29uKHtcbiAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdzdWNjZXNzJyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuIl19