"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.inviteRewardSchema = void 0;

var _mongoose = require("mongoose");

var inviteRewardSchema = new _mongoose.Schema({
  zole: Number,
  popularity: Number,
  message: Number,
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});
exports.inviteRewardSchema = inviteRewardSchema;
inviteRewardSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var InviteReward = (0, _mongoose.model)('InviteReward', inviteRewardSchema);
var _default = InviteReward;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvSW52aXRlUmV3YXJkcy5qcyJdLCJuYW1lcyI6WyJpbnZpdGVSZXdhcmRTY2hlbWEiLCJTY2hlbWEiLCJ6b2xlIiwiTnVtYmVyIiwicG9wdWxhcml0eSIsIm1lc3NhZ2UiLCJpc0RlbGV0ZWQiLCJ0eXBlIiwiQm9vbGVhbiIsImRlZmF1bHQiLCJjcmVhdGVkQnkiLCJUeXBlcyIsIk9iamVjdElkIiwicmVmIiwicmVxdWlyZWQiLCJ1cGRhdGVkQnkiLCJ0aW1lc3RhbXBzIiwic2V0IiwidHJhbnNmb3JtIiwiZG9jIiwicmV0Iiwib3B0IiwiX192IiwiSW52aXRlUmV3YXJkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRU8sSUFBTUEsa0JBQWtCLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUN6Q0MsRUFBQUEsSUFBSSxFQUFFQyxNQURtQztBQUV6Q0MsRUFBQUEsVUFBVSxFQUFFRCxNQUY2QjtBQUd6Q0UsRUFBQUEsT0FBTyxFQUFFRixNQUhnQztBQUl6Q0csRUFBQUEsU0FBUyxFQUFFO0FBQ1BDLElBQUFBLElBQUksRUFBRUMsT0FEQztBQUVQQyxJQUFBQSxPQUFPLEVBQUU7QUFGRixHQUo4QjtBQVF6Q0MsRUFBQUEsU0FBUyxFQUFFO0FBQ1BILElBQUFBLElBQUksRUFBRU4saUJBQU9VLEtBQVAsQ0FBYUMsUUFEWjtBQUVQQyxJQUFBQSxHQUFHLEVBQUUsTUFGRTtBQUdQQyxJQUFBQSxRQUFRLEVBQUU7QUFISCxHQVI4QjtBQWF6Q0MsRUFBQUEsU0FBUyxFQUFFO0FBQ1BSLElBQUFBLElBQUksRUFBRU4saUJBQU9VLEtBQVAsQ0FBYUMsUUFEWjtBQUVQQyxJQUFBQSxHQUFHLEVBQUUsTUFGRTtBQUdQQyxJQUFBQSxRQUFRLEVBQUU7QUFISDtBQWI4QixDQUFYLEVBa0IvQjtBQUFFRSxFQUFBQSxVQUFVLEVBQUU7QUFBZCxDQWxCK0IsQ0FBM0I7O0FBb0JQaEIsa0JBQWtCLENBQUNpQixHQUFuQixDQUF1QixRQUF2QixFQUFpQztBQUM3QkMsRUFBQUEsU0FBUyxFQUFFLENBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFXQyxHQUFYLEtBQW1CO0FBQzFCLFdBQU9ELEdBQUcsQ0FBQ0UsR0FBWDtBQUNBLFdBQU9GLEdBQVA7QUFDSDtBQUo0QixDQUFqQztBQU9BLElBQU1HLFlBQVksR0FBRyxxQkFBTSxjQUFOLEVBQXNCdkIsa0JBQXRCLENBQXJCO2VBRWV1QixZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCB9IGZyb20gJ21vbmdvb3NlJztcblxuZXhwb3J0IGNvbnN0IGludml0ZVJld2FyZFNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIHpvbGU6IE51bWJlcixcbiAgICBwb3B1bGFyaXR5OiBOdW1iZXIsXG4gICAgbWVzc2FnZTogTnVtYmVyLFxuICAgIGlzRGVsZXRlZDoge1xuICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgY3JlYXRlZEJ5OiB7XG4gICAgICAgIHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgICAgcmVmOiAnVXNlcicsXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICB1cGRhdGVkQnk6IHtcbiAgICAgICAgdHlwZTogU2NoZW1hLlR5cGVzLk9iamVjdElkLFxuICAgICAgICByZWY6ICdVc2VyJyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9XG59LCB7IHRpbWVzdGFtcHM6IHRydWV9KTtcblxuaW52aXRlUmV3YXJkU2NoZW1hLnNldCgndG9KU09OJywge1xuICAgIHRyYW5zZm9ybTogKGRvYywgcmV0LCBvcHQpID0+IHtcbiAgICAgICAgZGVsZXRlIHJldC5fX3Y7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxufSk7XG5cbmNvbnN0IEludml0ZVJld2FyZCA9IG1vZGVsKCdJbnZpdGVSZXdhcmQnLCBpbnZpdGVSZXdhcmRTY2hlbWEpO1xuXG5leHBvcnQgZGVmYXVsdCBJbnZpdGVSZXdhcmQ7XG4iXX0=