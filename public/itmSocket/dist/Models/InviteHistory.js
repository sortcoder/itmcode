"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.inviteHistorySchema = void 0;

var _mongoose = require("mongoose");

var inviteHistorySchema = new _mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceToken: String,
  platform: {
    type: String,
    enum: ['IOS', 'ANDROID']
  },
  referredBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referredTo: {
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
exports.inviteHistorySchema = inviteHistorySchema;
inviteHistorySchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var InviteHistory = (0, _mongoose.model)('InviteHistory', inviteHistorySchema);
var _default = InviteHistory;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvSW52aXRlSGlzdG9yeS5qcyJdLCJuYW1lcyI6WyJpbnZpdGVIaXN0b3J5U2NoZW1hIiwiU2NoZW1hIiwiZGV2aWNlSWQiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJpbmRleCIsImRldmljZVRva2VuIiwicGxhdGZvcm0iLCJlbnVtIiwicmVmZXJyZWRCeSIsIlR5cGVzIiwiT2JqZWN0SWQiLCJyZWYiLCJyZWZlcnJlZFRvIiwiaXNEZWxldGVkIiwiQm9vbGVhbiIsImRlZmF1bHQiLCJ0aW1lc3RhbXBzIiwic2V0IiwidHJhbnNmb3JtIiwiZG9jIiwicmV0Iiwib3B0IiwiX192IiwiSW52aXRlSGlzdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUVPLElBQU1BLG1CQUFtQixHQUFHLElBQUlDLGdCQUFKLENBQVc7QUFDMUNDLEVBQUFBLFFBQVEsRUFBRTtBQUNOQyxJQUFBQSxJQUFJLEVBQUVDLE1BREE7QUFFTkMsSUFBQUEsUUFBUSxFQUFFLElBRko7QUFHTkMsSUFBQUEsS0FBSyxFQUFFO0FBSEQsR0FEZ0M7QUFNMUNDLEVBQUFBLFdBQVcsRUFBRUgsTUFONkI7QUFPMUNJLEVBQUFBLFFBQVEsRUFBRTtBQUNOTCxJQUFBQSxJQUFJLEVBQUVDLE1BREE7QUFFTkssSUFBQUEsSUFBSSxFQUFFLENBQUMsS0FBRCxFQUFRLFNBQVI7QUFGQSxHQVBnQztBQVcxQ0MsRUFBQUEsVUFBVSxFQUFFO0FBQ1JQLElBQUFBLElBQUksRUFBRUYsaUJBQU9VLEtBQVAsQ0FBYUMsUUFEWDtBQUVSQyxJQUFBQSxHQUFHLEVBQUU7QUFGRyxHQVg4QjtBQWUxQ0MsRUFBQUEsVUFBVSxFQUFFO0FBQ1JYLElBQUFBLElBQUksRUFBRUYsaUJBQU9VLEtBQVAsQ0FBYUMsUUFEWDtBQUVSQyxJQUFBQSxHQUFHLEVBQUU7QUFGRyxHQWY4QjtBQW1CMUNFLEVBQUFBLFNBQVMsRUFBRTtBQUNQWixJQUFBQSxJQUFJLEVBQUVhLE9BREM7QUFFUEMsSUFBQUEsT0FBTyxFQUFFO0FBRkY7QUFuQitCLENBQVgsRUF1QmhDO0FBQUVDLEVBQUFBLFVBQVUsRUFBRTtBQUFkLENBdkJnQyxDQUE1Qjs7QUF5QlBsQixtQkFBbUIsQ0FBQ21CLEdBQXBCLENBQXdCLFFBQXhCLEVBQWtDO0FBQzlCQyxFQUFBQSxTQUFTLEVBQUUsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQVdDLEdBQVgsS0FBbUI7QUFDMUIsV0FBT0QsR0FBRyxDQUFDRSxHQUFYO0FBQ0EsV0FBT0YsR0FBUDtBQUNIO0FBSjZCLENBQWxDO0FBT0EsSUFBTUcsYUFBYSxHQUFHLHFCQUFNLGVBQU4sRUFBdUJ6QixtQkFBdkIsQ0FBdEI7ZUFFZXlCLGEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTY2hlbWEsIG1vZGVsIH0gZnJvbSAnbW9uZ29vc2UnO1xuXG5leHBvcnQgY29uc3QgaW52aXRlSGlzdG9yeVNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIGRldmljZUlkOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGluZGV4OiB0cnVlXG4gICAgfSxcbiAgICBkZXZpY2VUb2tlbjogU3RyaW5nLFxuICAgIHBsYXRmb3JtOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgZW51bTogWydJT1MnLCAnQU5EUk9JRCddXG4gICAgfSxcbiAgICByZWZlcnJlZEJ5OiB7XG4gICAgICAgIHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgICAgcmVmOiAnVXNlcidcbiAgICB9LFxuICAgIHJlZmVycmVkVG86IHtcbiAgICAgICAgdHlwZTogU2NoZW1hLlR5cGVzLk9iamVjdElkLFxuICAgICAgICByZWY6ICdVc2VyJ1xuICAgIH0sXG4gICAgaXNEZWxldGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxufSwgeyB0aW1lc3RhbXBzOiB0cnVlfSk7XG5cbmludml0ZUhpc3RvcnlTY2hlbWEuc2V0KCd0b0pTT04nLCB7XG4gICAgdHJhbnNmb3JtOiAoZG9jLCByZXQsIG9wdCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9fdjtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG59KTtcblxuY29uc3QgSW52aXRlSGlzdG9yeSA9IG1vZGVsKCdJbnZpdGVIaXN0b3J5JywgaW52aXRlSGlzdG9yeVNjaGVtYSk7XG5cbmV4cG9ydCBkZWZhdWx0IEludml0ZUhpc3Rvcnk7XG4iXX0=