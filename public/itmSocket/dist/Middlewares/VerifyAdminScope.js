"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var VerifyAdminScope = (req, res, next) => {
  var allowedScopes = ['admin'];

  if (allowedScopes.includes(req.scope.role)) {
    next();
  } else {
    res.status(403).json({
      status: 403,
      message: 'error',
      data: {
        message: 'You are not allowed to view this resoure'
      }
    });
  }
};

var _default = VerifyAdminScope;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9NaWRkbGV3YXJlcy9WZXJpZnlBZG1pblNjb3BlLmpzIl0sIm5hbWVzIjpbIlZlcmlmeUFkbWluU2NvcGUiLCJyZXEiLCJyZXMiLCJuZXh0IiwiYWxsb3dlZFNjb3BlcyIsImluY2x1ZGVzIiwic2NvcGUiLCJyb2xlIiwic3RhdHVzIiwianNvbiIsIm1lc3NhZ2UiLCJkYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUEsSUFBTUEsZ0JBQWdCLEdBQUcsQ0FBQ0MsR0FBRCxFQUFNQyxHQUFOLEVBQVdDLElBQVgsS0FBb0I7QUFDekMsTUFBTUMsYUFBYSxHQUFHLENBQUMsT0FBRCxDQUF0Qjs7QUFDQSxNQUFJQSxhQUFhLENBQUNDLFFBQWQsQ0FBdUJKLEdBQUcsQ0FBQ0ssS0FBSixDQUFVQyxJQUFqQyxDQUFKLEVBQTRDO0FBQ3hDSixJQUFBQSxJQUFJO0FBQ1AsR0FGRCxNQUVPO0FBQ0hELElBQUFBLEdBQUcsQ0FBQ00sTUFBSixDQUFXLEdBQVgsRUFBZ0JDLElBQWhCLENBQXFCO0FBQ2pCRCxNQUFBQSxNQUFNLEVBQUUsR0FEUztBQUVqQkUsTUFBQUEsT0FBTyxFQUFFLE9BRlE7QUFHakJDLE1BQUFBLElBQUksRUFBRTtBQUNGRCxRQUFBQSxPQUFPLEVBQUU7QUFEUDtBQUhXLEtBQXJCO0FBT0g7QUFDSixDQWJEOztlQWVlVixnQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFZlcmlmeUFkbWluU2NvcGUgPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICBjb25zdCBhbGxvd2VkU2NvcGVzID0gWydhZG1pbiddO1xuICAgIGlmIChhbGxvd2VkU2NvcGVzLmluY2x1ZGVzKHJlcS5zY29wZS5yb2xlKSkge1xuICAgICAgICBuZXh0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVzLnN0YXR1cyg0MDMpLmpzb24oe1xuICAgICAgICAgICAgc3RhdHVzOiA0MDMsXG4gICAgICAgICAgICBtZXNzYWdlOiAnZXJyb3InLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdZb3UgYXJlIG5vdCBhbGxvd2VkIHRvIHZpZXcgdGhpcyByZXNvdXJlJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZlcmlmeUFkbWluU2NvcGU7Il19