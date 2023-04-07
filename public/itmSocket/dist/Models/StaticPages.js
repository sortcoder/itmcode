"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = require("mongoose");

var staticPagesSchema = new _mongoose.Schema({
  title: String,
  slug: String,
  subTitle: String,
  description: String,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
staticPagesSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var StaticPages = (0, _mongoose.model)('StaticPages', staticPagesSchema);
var _default = StaticPages;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvU3RhdGljUGFnZXMuanMiXSwibmFtZXMiOlsic3RhdGljUGFnZXNTY2hlbWEiLCJTY2hlbWEiLCJ0aXRsZSIsIlN0cmluZyIsInNsdWciLCJzdWJUaXRsZSIsImRlc2NyaXB0aW9uIiwiaXNEZWxldGVkIiwidHlwZSIsIkJvb2xlYW4iLCJkZWZhdWx0IiwidGltZXN0YW1wcyIsInNldCIsInRyYW5zZm9ybSIsImRvYyIsInJldCIsIm9wdCIsIl9fdiIsIlN0YXRpY1BhZ2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBTUEsaUJBQWlCLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUNqQ0MsRUFBQUEsS0FBSyxFQUFFQyxNQUQwQjtBQUVqQ0MsRUFBQUEsSUFBSSxFQUFFRCxNQUYyQjtBQUdqQ0UsRUFBQUEsUUFBUSxFQUFFRixNQUh1QjtBQUlqQ0csRUFBQUEsV0FBVyxFQUFFSCxNQUpvQjtBQUtqQ0ksRUFBQUEsU0FBUyxFQUFFO0FBQ1BDLElBQUFBLElBQUksRUFBRUMsT0FEQztBQUVQQyxJQUFBQSxPQUFPLEVBQUU7QUFGRjtBQUxzQixDQUFYLEVBU3ZCO0FBQUVDLEVBQUFBLFVBQVUsRUFBRTtBQUFkLENBVHVCLENBQTFCO0FBV0FYLGlCQUFpQixDQUFDWSxHQUFsQixDQUFzQixRQUF0QixFQUFnQztBQUM1QkMsRUFBQUEsU0FBUyxFQUFFLENBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFXQyxHQUFYLEtBQW1CO0FBQzFCLFdBQU9ELEdBQUcsQ0FBQ0UsR0FBWDtBQUNBLFdBQU9GLEdBQVA7QUFDSDtBQUoyQixDQUFoQztBQU9BLElBQU1HLFdBQVcsR0FBRyxxQkFBTSxhQUFOLEVBQXFCbEIsaUJBQXJCLENBQXBCO2VBRWVrQixXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCB9IGZyb20gJ21vbmdvb3NlJztcblxuY29uc3Qgc3RhdGljUGFnZXNTY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgICB0aXRsZTogU3RyaW5nLFxuICAgIHNsdWc6IFN0cmluZyxcbiAgICBzdWJUaXRsZTogU3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uOiBTdHJpbmcsXG4gICAgaXNEZWxldGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxufSwgeyB0aW1lc3RhbXBzOiB0cnVlIH0pO1xuXG5zdGF0aWNQYWdlc1NjaGVtYS5zZXQoJ3RvSlNPTicsIHtcbiAgICB0cmFuc2Zvcm06IChkb2MsIHJldCwgb3B0KSA9PiB7XG4gICAgICAgIGRlbGV0ZSByZXQuX192O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG59KTtcblxuY29uc3QgU3RhdGljUGFnZXMgPSBtb2RlbCgnU3RhdGljUGFnZXMnLCBzdGF0aWNQYWdlc1NjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRpY1BhZ2VzO1xuIl19