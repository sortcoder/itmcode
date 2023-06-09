"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = require("mongoose");

var roomSchema = new _mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  roomId: {
    type: String,
    unique: true
  },
  roomImg: String,
  hostedBy: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guests: [{
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isLive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
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
roomSchema.set('toJSON', {
  transform: (doc, ret, opt) => {
    delete ret.__v;
    return ret;
  }
});
var Room = (0, _mongoose.model)('Room', roomSchema);
var _default = Room;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2RlbHMvUm9vbS5qcyJdLCJuYW1lcyI6WyJyb29tU2NoZW1hIiwiU2NoZW1hIiwidGl0bGUiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJpbmRleCIsInJvb21JZCIsInVuaXF1ZSIsInJvb21JbWciLCJob3N0ZWRCeSIsIlR5cGVzIiwiT2JqZWN0SWQiLCJyZWYiLCJndWVzdHMiLCJpc0xpdmUiLCJCb29sZWFuIiwiZGVmYXVsdCIsImlzUHVibGljIiwiaXNEZWxldGVkIiwiY3JlYXRlZEJ5IiwidXBkYXRlZEJ5IiwidGltZXN0YW1wcyIsInNldCIsInRyYW5zZm9ybSIsImRvYyIsInJldCIsIm9wdCIsIl9fdiIsIlJvb20iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQSxJQUFNQSxVQUFVLEdBQUcsSUFBSUMsZ0JBQUosQ0FBVztBQUMxQkMsRUFBQUEsS0FBSyxFQUFFO0FBQ0hDLElBQUFBLElBQUksRUFBRUMsTUFESDtBQUVIQyxJQUFBQSxRQUFRLEVBQUUsSUFGUDtBQUdIQyxJQUFBQSxLQUFLLEVBQUU7QUFISixHQURtQjtBQU0xQkMsRUFBQUEsTUFBTSxFQUFFO0FBQ0pKLElBQUFBLElBQUksRUFBRUMsTUFERjtBQUVKSSxJQUFBQSxNQUFNLEVBQUU7QUFGSixHQU5rQjtBQVUxQkMsRUFBQUEsT0FBTyxFQUFFTCxNQVZpQjtBQVcxQk0sRUFBQUEsUUFBUSxFQUFFO0FBQ05QLElBQUFBLElBQUksRUFBRUYsaUJBQU9VLEtBQVAsQ0FBYUMsUUFEYjtBQUVOQyxJQUFBQSxHQUFHLEVBQUU7QUFGQyxHQVhnQjtBQWUxQkMsRUFBQUEsTUFBTSxFQUFFLENBQUM7QUFDTFgsSUFBQUEsSUFBSSxFQUFFRixpQkFBT1UsS0FBUCxDQUFhQyxRQURkO0FBRUxDLElBQUFBLEdBQUcsRUFBRTtBQUZBLEdBQUQsQ0Fma0I7QUFtQjFCRSxFQUFBQSxNQUFNLEVBQUU7QUFDSlosSUFBQUEsSUFBSSxFQUFFYSxPQURGO0FBRUpDLElBQUFBLE9BQU8sRUFBRTtBQUZMLEdBbkJrQjtBQXVCMUJDLEVBQUFBLFFBQVEsRUFBRTtBQUNOZixJQUFBQSxJQUFJLEVBQUVhLE9BREE7QUFFTkMsSUFBQUEsT0FBTyxFQUFFO0FBRkgsR0F2QmdCO0FBMkIxQkUsRUFBQUEsU0FBUyxFQUFFO0FBQ1BoQixJQUFBQSxJQUFJLEVBQUVhLE9BREM7QUFFUEMsSUFBQUEsT0FBTyxFQUFFO0FBRkYsR0EzQmU7QUErQjFCRyxFQUFBQSxTQUFTLEVBQUU7QUFDUGpCLElBQUFBLElBQUksRUFBRUYsaUJBQU9VLEtBQVAsQ0FBYUMsUUFEWjtBQUVQQyxJQUFBQSxHQUFHLEVBQUUsTUFGRTtBQUdQUixJQUFBQSxRQUFRLEVBQUU7QUFISCxHQS9CZTtBQW9DMUJnQixFQUFBQSxTQUFTLEVBQUU7QUFDUGxCLElBQUFBLElBQUksRUFBRUYsaUJBQU9VLEtBQVAsQ0FBYUMsUUFEWjtBQUVQQyxJQUFBQSxHQUFHLEVBQUUsTUFGRTtBQUdQUixJQUFBQSxRQUFRLEVBQUU7QUFISDtBQXBDZSxDQUFYLEVBeUNoQjtBQUFFaUIsRUFBQUEsVUFBVSxFQUFFO0FBQWQsQ0F6Q2dCLENBQW5CO0FBMkNBdEIsVUFBVSxDQUFDdUIsR0FBWCxDQUFlLFFBQWYsRUFBeUI7QUFDckJDLEVBQUFBLFNBQVMsRUFBRSxDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBV0MsR0FBWCxLQUFtQjtBQUMxQixXQUFPRCxHQUFHLENBQUNFLEdBQVg7QUFDQSxXQUFPRixHQUFQO0FBQ0g7QUFKb0IsQ0FBekI7QUFPQSxJQUFNRyxJQUFJLEdBQUcscUJBQU0sTUFBTixFQUFjN0IsVUFBZCxDQUFiO2VBRWU2QixJIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2NoZW1hLCBtb2RlbCB9IGZyb20gJ21vbmdvb3NlJztcblxuY29uc3Qgcm9vbVNjaGVtYSA9IG5ldyBTY2hlbWEoe1xuICAgIHRpdGxlOiB7XG4gICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGluZGV4OiB0cnVlXG4gICAgfSxcbiAgICByb29tSWQ6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB1bmlxdWU6IHRydWVcbiAgICB9LFxuICAgIHJvb21JbWc6IFN0cmluZyxcbiAgICBob3N0ZWRCeToge1xuICAgICAgICB0eXBlOiBTY2hlbWEuVHlwZXMuT2JqZWN0SWQsXG4gICAgICAgIHJlZjogJ1VzZXInXG4gICAgfSxcbiAgICBndWVzdHM6IFt7XG4gICAgICAgIHR5cGU6IFNjaGVtYS5UeXBlcy5PYmplY3RJZCxcbiAgICAgICAgcmVmOiAnVXNlcidcbiAgICB9XSxcbiAgICBpc0xpdmU6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgaXNQdWJsaWM6IHtcbiAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgaXNEZWxldGVkOiB7XG4gICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBjcmVhdGVkQnk6IHtcbiAgICAgICAgdHlwZTogU2NoZW1hLlR5cGVzLk9iamVjdElkLFxuICAgICAgICByZWY6ICdVc2VyJyxcbiAgICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHVwZGF0ZWRCeToge1xuICAgICAgICB0eXBlOiBTY2hlbWEuVHlwZXMuT2JqZWN0SWQsXG4gICAgICAgIHJlZjogJ1VzZXInLFxuICAgICAgICByZXF1aXJlZDogdHJ1ZVxuICAgIH0sXG59LCB7IHRpbWVzdGFtcHM6IHRydWUgfSk7XG5cbnJvb21TY2hlbWEuc2V0KCd0b0pTT04nLCB7XG4gICAgdHJhbnNmb3JtOiAoZG9jLCByZXQsIG9wdCkgPT4ge1xuICAgICAgICBkZWxldGUgcmV0Ll9fdjtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxufSk7XG5cbmNvbnN0IFJvb20gPSBtb2RlbCgnUm9vbScsIHJvb21TY2hlbWEpO1xuXG5leHBvcnQgZGVmYXVsdCBSb29tO1xuIl19