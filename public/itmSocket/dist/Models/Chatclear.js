"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = require("mongoose");

var Chatclearchema = new _mongoose.Schema({
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
Chatclearchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var Chatclear = (0, _mongoose.model)('Chatclear', Chatclearchema);
var _default = Chatclear;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvQ2hhdGNsZWFyLmpzIl0sIm5hbWVzIjpbIkNoYXRjbGVhcmNoZW1hIiwiU2NoZW1hIiwic2VuZGVySWQiLCJ0eXBlIiwiVHlwZXMiLCJPYmplY3RJZCIsInJlZiIsInJlY2VpdmVySWQiLCJpc0RlbGV0ZWQiLCJCb29sZWFuIiwiZGVmYXVsdCIsInRpbWVzdGFtcHMiLCJzZXQiLCJ0cmFuc2Zvcm0iLCJkb2MiLCJyZXQiLCJvcHQiLCJfX3YiLCJDaGF0Y2xlYXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQSxJQUFNQSxjQUFjLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUM5QkMsRUFBQUEsUUFBUSxFQUFFO0FBQ05DLElBQUFBLElBQUksRUFBRUYsaUJBQU9HLEtBQVAsQ0FBYUMsUUFEYjtBQUVOQyxJQUFBQSxHQUFHLEVBQUU7QUFGQyxHQURvQjtBQUs5QkMsRUFBQUEsVUFBVSxFQUFFO0FBQ1JKLElBQUFBLElBQUksRUFBRUYsaUJBQU9HLEtBQVAsQ0FBYUMsUUFEWDtBQUVSQyxJQUFBQSxHQUFHLEVBQUU7QUFGRyxHQUxrQjtBQVU5QkUsRUFBQUEsU0FBUyxFQUFFO0FBQ1BMLElBQUFBLElBQUksRUFBRU0sT0FEQztBQUVQQyxJQUFBQSxPQUFPLEVBQUU7QUFGRjtBQVZtQixDQUFYLEVBZXBCO0FBQUVDLEVBQUFBLFVBQVUsRUFBRTtBQUFkLENBZm9CLENBQXZCO0FBaUJBWCxjQUFjLENBQUNZLEdBQWYsQ0FBbUIsUUFBbkIsRUFBNkI7QUFDekJDLEVBQUFBLFNBQVMsRUFBRSxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsR0FBWCxLQUFtQjtBQUMxQixXQUFPRCxHQUFHLENBQUNFLEdBQVg7QUFDQSxXQUFPRixHQUFQO0FBQ0g7QUFKd0IsQ0FBN0I7QUFPQSxJQUFNRyxTQUFTLEdBQUcscUJBQU0sV0FBTixFQUFtQmxCLGNBQW5CLENBQWxCO2VBRWVrQixTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCB9IGZyb20gJ21vbmdvb3NlJztcblxuY29uc3QgQ2hhdGNsZWFyY2hlbWEgPSBuZXcgU2NoZW1hKHtcbiAgICBzZW5kZXJJZDoge1xuICAgICAgICB0eXBlOiBTY2hlbWEuVHlwZXMuT2JqZWN0SWQsXG4gICAgICAgIHJlZjogJ1VzZXInXG4gICAgfSxcbiAgICByZWNlaXZlcklkOiB7XG4gICAgICAgIHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgICAgcmVmOiAnVXNlcidcbiAgICB9LFxuICAgXG4gICAgaXNEZWxldGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxuICBcbn0sIHsgdGltZXN0YW1wczogdHJ1ZSB9KTtcblxuQ2hhdGNsZWFyY2hlbWEuc2V0KCd0b0pTT04nLCB7XG4gICAgdHJhbnNmb3JtOiAoZG9jLCByZXQsIG9wdCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9fdjtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxufSk7XG5cbmNvbnN0IENoYXRjbGVhciA9IG1vZGVsKCdDaGF0Y2xlYXInLCBDaGF0Y2xlYXJjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IENoYXRjbGVhcjtcbiJdfQ==