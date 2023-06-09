"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = require("mongoose");

var zolesSchema = new _mongoose.Schema({
  zole: {
    type: Number,
    required: true,
    index: true
  },
  price: Number,
  bonus: Number,
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
zolesSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var Zole = (0, _mongoose.model)('Zole', zolesSchema);
var _default = Zole;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvWm9sZXMuanMiXSwibmFtZXMiOlsiem9sZXNTY2hlbWEiLCJTY2hlbWEiLCJ6b2xlIiwidHlwZSIsIk51bWJlciIsInJlcXVpcmVkIiwiaW5kZXgiLCJwcmljZSIsImJvbnVzIiwiaXNEZWxldGVkIiwiQm9vbGVhbiIsImRlZmF1bHQiLCJjcmVhdGVkQnkiLCJUeXBlcyIsIk9iamVjdElkIiwicmVmIiwidXBkYXRlZEJ5IiwidGltZXN0YW1wcyIsInNldCIsInRyYW5zZm9ybSIsImRvYyIsInJldCIsIm9wdCIsIl9fdiIsIlpvbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQSxJQUFNQSxXQUFXLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUMzQkMsRUFBQUEsSUFBSSxFQUFFO0FBQ0ZDLElBQUFBLElBQUksRUFBRUMsTUFESjtBQUVGQyxJQUFBQSxRQUFRLEVBQUUsSUFGUjtBQUdGQyxJQUFBQSxLQUFLLEVBQUU7QUFITCxHQURxQjtBQU0zQkMsRUFBQUEsS0FBSyxFQUFFSCxNQU5vQjtBQU8zQkksRUFBQUEsS0FBSyxFQUFFSixNQVBvQjtBQVEzQkssRUFBQUEsU0FBUyxFQUFFO0FBQ1BOLElBQUFBLElBQUksRUFBRU8sT0FEQztBQUVQQyxJQUFBQSxPQUFPLEVBQUU7QUFGRixHQVJnQjtBQVkzQkMsRUFBQUEsU0FBUyxFQUFFO0FBQ1BULElBQUFBLElBQUksRUFBRUYsaUJBQU9ZLEtBQVAsQ0FBYUMsUUFEWjtBQUVQQyxJQUFBQSxHQUFHLEVBQUUsTUFGRTtBQUdQVixJQUFBQSxRQUFRLEVBQUU7QUFISCxHQVpnQjtBQWlCM0JXLEVBQUFBLFNBQVMsRUFBRTtBQUNQYixJQUFBQSxJQUFJLEVBQUVGLGlCQUFPWSxLQUFQLENBQWFDLFFBRFo7QUFFUEMsSUFBQUEsR0FBRyxFQUFFLE1BRkU7QUFHUFYsSUFBQUEsUUFBUSxFQUFFO0FBSEg7QUFqQmdCLENBQVgsRUFzQmpCO0FBQUVZLEVBQUFBLFVBQVUsRUFBRTtBQUFkLENBdEJpQixDQUFwQjtBQXdCQWpCLFdBQVcsQ0FBQ2tCLEdBQVosQ0FBZ0IsUUFBaEIsRUFBMEI7QUFDdEJDLEVBQUFBLFNBQVMsRUFBRSxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsR0FBWCxLQUFtQjtBQUMxQixXQUFPRCxHQUFHLENBQUNFLEdBQVg7QUFDQSxXQUFPRixHQUFQO0FBQ0g7QUFKcUIsQ0FBMUI7QUFPQSxJQUFNRyxJQUFJLEdBQUcscUJBQU0sTUFBTixFQUFjeEIsV0FBZCxDQUFiO2VBRWV3QixJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCB9IGZyb20gJ21vbmdvb3NlJztcblxuY29uc3Qgem9sZXNTY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgICB6b2xlOiB7XG4gICAgICAgIHR5cGU6IE51bWJlcixcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGluZGV4OiB0cnVlXG4gICAgfSxcbiAgICBwcmljZTogTnVtYmVyLFxuICAgIGJvbnVzOiBOdW1iZXIsXG4gICAgaXNEZWxldGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBjcmVhdGVkQnk6IHtcbiAgICAgICAgdHlwZTogU2NoZW1hLlR5cGVzLk9iamVjdElkLFxuICAgICAgICByZWY6ICdVc2VyJyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHVwZGF0ZWRCeToge1xuICAgICAgICB0eXBlOiBTY2hlbWEuVHlwZXMuT2JqZWN0SWQsXG4gICAgICAgIHJlZjogJ1VzZXInLFxuICAgICAgICByZXF1aXJlZDogdHJ1ZVxuICAgIH0sXG59LCB7IHRpbWVzdGFtcHM6IHRydWUgfSk7XG5cbnpvbGVzU2NoZW1hLnNldCgndG9KU09OJywge1xuICAgIHRyYW5zZm9ybTogKGRvYywgcmV0LCBvcHQpID0+IHtcbiAgICAgICAgZGVsZXRlIHJldC5fX3Y7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfSxcbn0pO1xuXG5jb25zdCBab2xlID0gbW9kZWwoJ1pvbGUnLCB6b2xlc1NjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IFpvbGU7XG4iXX0=