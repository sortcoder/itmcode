"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = _interopRequireWildcard(require("winston"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

_dotenv.default.config();
/**
 * Check Node ENVIRONMENT
 */


var ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
/**
 * Logger Options
 */

var options = {
  format: _winston.format.combine(_winston.format.label({
    label: ENVIRONMENT
  }), _winston.format.colorize(), _winston.format.timestamp({
    format: 'DD-MM-YYYY HH:mm:ss'
  }), _winston.format.printf(info => " [".concat(info.timestamp, "] [").concat(info.label, "] ").concat(info.level, " =>  ").concat(info.message))),
  transports: [new _winston.default.transports.Console({
    level: ENVIRONMENT === 'production' ? 'error' : 'debug'
  }), new _winston.default.transports.File({
    filename: 'debug.log',
    level: 'debug'
  })]
};
var logger = (0, _winston.createLogger)(options);
var _default = logger;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXMvTG9nZ2VyLmpzIl0sIm5hbWVzIjpbImRvdGVudiIsImNvbmZpZyIsIkVOVklST05NRU5UIiwicHJvY2VzcyIsImVudiIsIk5PREVfRU5WIiwib3B0aW9ucyIsImZvcm1hdCIsImNvbWJpbmUiLCJsYWJlbCIsImNvbG9yaXplIiwidGltZXN0YW1wIiwicHJpbnRmIiwiaW5mbyIsImxldmVsIiwibWVzc2FnZSIsInRyYW5zcG9ydHMiLCJ3aW5zdG9uIiwiQ29uc29sZSIsIkZpbGUiLCJmaWxlbmFtZSIsImxvZ2dlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7OztBQUNBQSxnQkFBT0MsTUFBUDtBQUVBO0FBQ0E7QUFDQTs7O0FBQ0EsSUFBTUMsV0FBVyxHQUFHQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUMsUUFBWixHQUF1QkYsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFFBQW5DLEdBQThDLGFBQWxFO0FBRUE7QUFDQTtBQUNBOztBQUNBLElBQU1DLE9BQU8sR0FBRztBQUNaQyxFQUFBQSxNQUFNLEVBQUVBLGdCQUFPQyxPQUFQLENBQ0pELGdCQUFPRSxLQUFQLENBQWE7QUFDVEEsSUFBQUEsS0FBSyxFQUFFUDtBQURFLEdBQWIsQ0FESSxFQUlKSyxnQkFBT0csUUFBUCxFQUpJLEVBS0pILGdCQUFPSSxTQUFQLENBQWlCO0FBQ2JKLElBQUFBLE1BQU0sRUFBRTtBQURLLEdBQWpCLENBTEksRUFRSkEsZ0JBQU9LLE1BQVAsQ0FDSUMsSUFBSSxnQkFDS0EsSUFBSSxDQUFDRixTQURWLGdCQUN5QkUsSUFBSSxDQUFDSixLQUQ5QixlQUN3Q0ksSUFBSSxDQUFDQyxLQUQ3QyxrQkFDMERELElBQUksQ0FBQ0UsT0FEL0QsQ0FEUixDQVJJLENBREk7QUFjWkMsRUFBQUEsVUFBVSxFQUFFLENBQ1IsSUFBSUMsaUJBQVFELFVBQVIsQ0FBbUJFLE9BQXZCLENBQStCO0FBQzNCSixJQUFBQSxLQUFLLEVBQUVaLFdBQVcsS0FBSyxZQUFoQixHQUErQixPQUEvQixHQUF5QztBQURyQixHQUEvQixDQURRLEVBSVIsSUFBSWUsaUJBQVFELFVBQVIsQ0FBbUJHLElBQXZCLENBQTRCO0FBQUVDLElBQUFBLFFBQVEsRUFBRSxXQUFaO0FBQXlCTixJQUFBQSxLQUFLLEVBQUU7QUFBaEMsR0FBNUIsQ0FKUTtBQWRBLENBQWhCO0FBc0JBLElBQU1PLE1BQU0sR0FBRywyQkFBYWYsT0FBYixDQUFmO2VBRWVlLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgd2luc3RvbiwgeyBjcmVhdGVMb2dnZXIsIGZvcm1hdCB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xuZG90ZW52LmNvbmZpZygpO1xuXG4vKipcbiAqIENoZWNrIE5vZGUgRU5WSVJPTk1FTlRcbiAqL1xuY29uc3QgRU5WSVJPTk1FTlQgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IHByb2Nlc3MuZW52Lk5PREVfRU5WIDogJ2RldmVsb3BtZW50JztcblxuLyoqXG4gKiBMb2dnZXIgT3B0aW9uc1xuICovXG5jb25zdCBvcHRpb25zID0ge1xuICAgIGZvcm1hdDogZm9ybWF0LmNvbWJpbmUoXG4gICAgICAgIGZvcm1hdC5sYWJlbCh7XG4gICAgICAgICAgICBsYWJlbDogRU5WSVJPTk1FTlQsXG4gICAgICAgIH0pLFxuICAgICAgICBmb3JtYXQuY29sb3JpemUoKSxcbiAgICAgICAgZm9ybWF0LnRpbWVzdGFtcCh7XG4gICAgICAgICAgICBmb3JtYXQ6ICdERC1NTS1ZWVlZIEhIOm1tOnNzJyxcbiAgICAgICAgfSksXG4gICAgICAgIGZvcm1hdC5wcmludGYoXG4gICAgICAgICAgICBpbmZvID0+XG4gICAgICAgICAgICAgICAgYCBbJHtpbmZvLnRpbWVzdGFtcH1dIFske2luZm8ubGFiZWx9XSAke2luZm8ubGV2ZWx9ID0+ICAke2luZm8ubWVzc2FnZX1gXG4gICAgICAgIClcbiAgICApLFxuICAgIHRyYW5zcG9ydHM6IFtcbiAgICAgICAgbmV3IHdpbnN0b24udHJhbnNwb3J0cy5Db25zb2xlKHtcbiAgICAgICAgICAgIGxldmVsOiBFTlZJUk9OTUVOVCA9PT0gJ3Byb2R1Y3Rpb24nID8gJ2Vycm9yJyA6ICdkZWJ1ZycsXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgd2luc3Rvbi50cmFuc3BvcnRzLkZpbGUoeyBmaWxlbmFtZTogJ2RlYnVnLmxvZycsIGxldmVsOiAnZGVidWcnIH0pLFxuICAgIF0sXG59O1xuXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIob3B0aW9ucyk7XG5cbmV4cG9ydCBkZWZhdWx0IGxvZ2dlcjtcbiJdfQ==