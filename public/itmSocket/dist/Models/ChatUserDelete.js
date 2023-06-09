"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = require("mongoose");

var ChatUserDeleteschema = new _mongoose.Schema({
  senderId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiverId: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
ChatUserDeleteschema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var ChatUserDelete = (0, _mongoose.model)('ChatUserDelete', ChatUserDeleteschema);
var _default = ChatUserDelete;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvQ2hhdFVzZXJEZWxldGUuanMiXSwibmFtZXMiOlsiQ2hhdFVzZXJEZWxldGVzY2hlbWEiLCJTY2hlbWEiLCJzZW5kZXJJZCIsInR5cGUiLCJUeXBlcyIsIk9iamVjdElkIiwicmVmIiwicmVjZWl2ZXJJZCIsImlzRGVsZXRlZCIsIkJvb2xlYW4iLCJkZWZhdWx0IiwidGltZXN0YW1wcyIsInNldCIsInRyYW5zZm9ybSIsImRvYyIsInJldCIsIm9wdCIsIl9fdiIsIkNoYXRVc2VyRGVsZXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsSUFBTUEsb0JBQW9CLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUNwQ0MsRUFBQUEsUUFBUSxFQUFFO0FBQ05DLElBQUFBLElBQUksRUFBRUYsaUJBQU9HLEtBQVAsQ0FBYUMsUUFEYjtBQUVOQyxJQUFBQSxHQUFHLEVBQUU7QUFGQyxHQUQwQjtBQUtwQ0MsRUFBQUEsVUFBVSxFQUFFO0FBQ1JKLElBQUFBLElBQUksRUFBRUYsaUJBQU9HLEtBQVAsQ0FBYUMsUUFEWDtBQUVSQyxJQUFBQSxHQUFHLEVBQUU7QUFGRyxHQUx3QjtBQVVwQ0UsRUFBQUEsU0FBUyxFQUFFO0FBQ1BMLElBQUFBLElBQUksRUFBRU0sT0FEQztBQUVQQyxJQUFBQSxPQUFPLEVBQUU7QUFGRjtBQVZ5QixDQUFYLEVBZTFCO0FBQUVDLEVBQUFBLFVBQVUsRUFBRTtBQUFkLENBZjBCLENBQTdCO0FBaUJBWCxvQkFBb0IsQ0FBQ1ksR0FBckIsQ0FBeUIsUUFBekIsRUFBbUM7QUFDL0JDLEVBQUFBLFNBQVMsRUFBRSxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsR0FBWCxLQUFtQjtBQUMxQixXQUFPRCxHQUFHLENBQUNFLEdBQVg7QUFDQSxXQUFPRixHQUFQO0FBQ0g7QUFKOEIsQ0FBbkM7QUFPQSxJQUFNRyxjQUFjLEdBQUcscUJBQU0sZ0JBQU4sRUFBd0JsQixvQkFBeEIsQ0FBdkI7ZUFFZWtCLGMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlbWEsIG1vZGVsIH0gZnJvbSAnbW9uZ29vc2UnO1xuXG5jb25zdCBDaGF0VXNlckRlbGV0ZXNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIHNlbmRlcklkOiB7XG4gICAgICAgIHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgICAgcmVmOiAnVXNlcidcbiAgICB9LFxuICAgIHJlY2VpdmVySWQ6IHtcbiAgICAgICAgdHlwZTogU2NoZW1hLlR5cGVzLk9iamVjdElkLFxuICAgICAgICByZWY6ICdVc2VyJ1xuICAgIH0sXG4gICBcbiAgICBpc0RlbGV0ZWQ6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIFxufSwgeyB0aW1lc3RhbXBzOiB0cnVlIH0pO1xuXG5DaGF0VXNlckRlbGV0ZXNjaGVtYS5zZXQoJ3RvSlNPTicsIHtcbiAgICB0cmFuc2Zvcm06IChkb2MsIHJldCwgb3B0KSA9PiB7XG4gICAgICAgIGRlbGV0ZSByZXQuX192O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG59KTtcblxuY29uc3QgQ2hhdFVzZXJEZWxldGUgPSBtb2RlbCgnQ2hhdFVzZXJEZWxldGUnLCBDaGF0VXNlckRlbGV0ZXNjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IENoYXRVc2VyRGVsZXRlO1xuIl19