"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class CommanHelper {
  constructor() {
    _defineProperty(this, "randomNo", (min, max) => {
      var number = Math.floor(Math.random() * (max - min) + min);
      console.log("random helper", number);
      return number;
    });

    _defineProperty(this, "createSlug", text => {
      return text.toString().trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
    });
  }

}

var _default = new CommanHelper(); //export function value

/* export const  randomNo= (min,max)=>{
       const number = Math.floor( Math.random() * (max - min) + min);
       console.log("number",number);
       return number;
    } */


exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvQ29tbWFuSGVscGVyLmpzIl0sIm5hbWVzIjpbIkNvbW1hbkhlbHBlciIsIm1pbiIsIm1heCIsIm51bWJlciIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImNvbnNvbGUiLCJsb2ciLCJ0ZXh0IiwidG9TdHJpbmciLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFFQSxNQUFNQSxZQUFOLENBQW1CO0FBQUE7QUFBQSxzQ0FDSixDQUFDQyxHQUFELEVBQU1DLEdBQU4sS0FBYztBQUNyQixVQUFNQyxNQUFNLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXRCxJQUFJLENBQUNFLE1BQUwsTUFBaUJKLEdBQUcsR0FBR0QsR0FBdkIsSUFBOEJBLEdBQXpDLENBQWY7QUFDQU0sTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QkwsTUFBN0I7QUFDQSxhQUFPQSxNQUFQO0FBQ0gsS0FMYzs7QUFBQSx3Q0FNRE0sSUFBRCxJQUFVO0FBQ25CLGFBQU9BLElBQUksQ0FDTkMsUUFERSxHQUVGQyxJQUZFLEdBR0ZDLFdBSEUsR0FJRkMsT0FKRSxDQUlNLE1BSk4sRUFJYyxHQUpkLEVBS0ZBLE9BTEUsQ0FLTSxXQUxOLEVBS21CLEVBTG5CLEVBTUZBLE9BTkUsQ0FNTSxRQU5OLEVBTWdCLEdBTmhCLEVBT0ZBLE9BUEUsQ0FPTSxLQVBOLEVBT2EsRUFQYixFQVFGQSxPQVJFLENBUU0sS0FSTixFQVFhLEVBUmIsQ0FBUDtBQVNILEtBaEJjO0FBQUE7O0FBQUE7O2VBbUJKLElBQUliLFlBQUosRSxFQUVmOztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuY2xhc3MgQ29tbWFuSGVscGVyIHtcbiAgICByYW5kb21ObyA9IChtaW4sIG1heCkgPT4ge1xuICAgICAgICBjb25zdCBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmFuZG9tIGhlbHBlclwiLCBudW1iZXIpO1xuICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgIH1cbiAgICBjcmVhdGVTbHVnID0gKHRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIHRleHRcbiAgICAgICAgICAgIC50b1N0cmluZygpXG4gICAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xccysvZywgXCItXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXHdcXC1dKy9nLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcLVxcLSsvZywgXCItXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXi0rLywgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC8tKyQvLCBcIlwiKTtcbiAgICB9XG4gICBcbn1cbmV4cG9ydCBkZWZhdWx0IG5ldyBDb21tYW5IZWxwZXIoKTtcblxuLy9leHBvcnQgZnVuY3Rpb24gdmFsdWVcblxuXG4vKiBleHBvcnQgY29uc3QgIHJhbmRvbU5vPSAobWluLG1heCk9PntcbiAgICAgICBjb25zdCBudW1iZXIgPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pO1xuICAgICAgIGNvbnNvbGUubG9nKFwibnVtYmVyXCIsbnVtYmVyKTtcbiAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgIH0gKi9cbiJdfQ==