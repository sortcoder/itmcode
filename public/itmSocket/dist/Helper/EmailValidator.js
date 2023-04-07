"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmailValidator = void 0;

var EmailValidator = email => {
  // Regex for email validation
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

exports.EmailValidator = EmailValidator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvRW1haWxWYWxpZGF0b3IuanMiXSwibmFtZXMiOlsiRW1haWxWYWxpZGF0b3IiLCJlbWFpbCIsInJlIiwidGVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFPLElBQU1BLGNBQWMsR0FBSUMsS0FBRCxJQUFXO0FBQ3JDO0FBQ0EsTUFBTUMsRUFBRSxHQUFHLDJKQUFYO0FBQ0EsU0FBT0EsRUFBRSxDQUFDQyxJQUFILENBQVFGLEtBQVIsQ0FBUDtBQUNILENBSk0iLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRW1haWxWYWxpZGF0b3IgPSAoZW1haWwpID0+IHtcbiAgICAvLyBSZWdleCBmb3IgZW1haWwgdmFsaWRhdGlvblxuICAgIGNvbnN0IHJlID0gL14oKFtePD4oKVtcXF1cXFxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKykqKXwoXFxcIi4rXFxcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcXSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XG4gICAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xufTtcbiJdfQ==