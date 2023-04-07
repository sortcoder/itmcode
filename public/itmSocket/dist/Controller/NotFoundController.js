"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _constants = _interopRequireDefault(require("../../resources/constants"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class NotFoundController {
  constructor() {
    _defineProperty(this, "for0For", (req, res) => {
      // Send 404 if any route not exists
      res.status(404).json({
        status: 404,
        message: req.t(_constants.default.ROUTE_NOT_EXISTS)
      });
    });
  }

}

var _default = new NotFoundController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL05vdEZvdW5kQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6WyJOb3RGb3VuZENvbnRyb2xsZXIiLCJyZXEiLCJyZXMiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsInQiLCJjb25zdGFudHMiLCJST1VURV9OT1RfRVhJU1RTIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7OztBQUVBLE1BQU1BLGtCQUFOLENBQXlCO0FBQUE7QUFBQSxxQ0FJWCxDQUFDQyxHQUFELEVBQU1DLEdBQU4sS0FBYztBQUNwQjtBQUNBQSxNQUFBQSxHQUFHLENBQUNDLE1BQUosQ0FBVyxHQUFYLEVBQWdCQyxJQUFoQixDQUFxQjtBQUNqQkQsUUFBQUEsTUFBTSxFQUFFLEdBRFM7QUFFakJFLFFBQUFBLE9BQU8sRUFBRUosR0FBRyxDQUFDSyxDQUFKLENBQU1DLG1CQUFVQyxnQkFBaEI7QUFGUSxPQUFyQjtBQUlILEtBVm9CO0FBQUE7O0FBQUE7O2VBYVYsSUFBSVIsa0JBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5cbmNsYXNzIE5vdEZvdW5kQ29udHJvbGxlciB7XG4gICAgLyoqXG4gICAgICogTm90IEZvdW5kIFBhZ2VcbiAgICAgKi9cbiAgICBmb3IwRm9yID0gKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIC8vIFNlbmQgNDA0IGlmIGFueSByb3V0ZSBub3QgZXhpc3RzXG4gICAgICAgIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcbiAgICAgICAgICAgIHN0YXR1czogNDA0LFxuICAgICAgICAgICAgbWVzc2FnZTogcmVxLnQoY29uc3RhbnRzLlJPVVRFX05PVF9FWElTVFMpLFxuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgTm90Rm91bmRDb250cm9sbGVyKCk7XG4iXX0=