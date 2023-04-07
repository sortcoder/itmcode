"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _mail = _interopRequireDefault(require("@sendgrid/mail"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

_mail.default.setApiKey(process.env.SENDGRID_APIKEY);

class Mail {
  // Method to get html from the mail template
  static getHtml(text, name) {
    return _asyncToGenerator(function* () {
      var templateDir = _path.default.join(__dirname, '../../', 'src/templates', 'Mail.html');

      if (_fs.default.existsSync(templateDir)) {
        // read file content
        var html = yield _fs.default.readFileSync(templateDir, {
          encoding: 'utf-8'
        }); // Replace dynamic content (name and url) in the mail template

        html = html.replace(/{{ name }}/, name);
        html = html.replace(/{{ text }}/, text);
        return html;
      }
    })();
  }
  /**
   * send email using template
   * @param {string} to - Email
   * @param {string} subject  - Subject
   * @param text
   * @param name
   */


  send(to, subject, text, name) {
    return _asyncToGenerator(function* () {
      try {
        // Get HTML
        var html = yield Mail.getHtml(text, name); // Generate msg to send on mail

        var msg = {
          to: to,
          from: "".concat(process.env.MAIL_FROM_NAME, " <").concat(process.env.MAIL_SMTP_USERNAME, ">"),
          // Use the email address or domain you verified above
          subject: subject,
          html: html
        }; // Returns mail response

        return yield _mail.default.send(msg);
      } catch (err) {
        console.log("maileroor", err);
        return err;
      }
    })();
  }

}

var _default = new Mail();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvTWFpbC5qcyJdLCJuYW1lcyI6WyJzZ01haWwiLCJzZXRBcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiU0VOREdSSURfQVBJS0VZIiwiTWFpbCIsImdldEh0bWwiLCJ0ZXh0IiwibmFtZSIsInRlbXBsYXRlRGlyIiwicGF0aCIsImpvaW4iLCJfX2Rpcm5hbWUiLCJmcyIsImV4aXN0c1N5bmMiLCJodG1sIiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJyZXBsYWNlIiwic2VuZCIsInRvIiwic3ViamVjdCIsIm1zZyIsImZyb20iLCJNQUlMX0ZST01fTkFNRSIsIk1BSUxfU01UUF9VU0VSTkFNRSIsImVyciIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQUEsY0FBT0MsU0FBUCxDQUFpQkMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLGVBQTdCOztBQUVBLE1BQU1DLElBQU4sQ0FBVztBQUVQO0FBQ29CLFNBQVBDLE9BQU8sQ0FBQ0MsSUFBRCxFQUFPQyxJQUFQLEVBQWE7QUFBQTtBQUM3QixVQUFNQyxXQUFXLEdBQUdDLGNBQUtDLElBQUwsQ0FDaEJDLFNBRGdCLEVBRWhCLFFBRmdCLEVBR2hCLGVBSGdCLEVBSWhCLFdBSmdCLENBQXBCOztBQU1BLFVBQUlDLFlBQUdDLFVBQUgsQ0FBY0wsV0FBZCxDQUFKLEVBQWdDO0FBQzVCO0FBQ0EsWUFBSU0sSUFBSSxTQUFTRixZQUFHRyxZQUFILENBQWdCUCxXQUFoQixFQUE2QjtBQUFFUSxVQUFBQSxRQUFRLEVBQUU7QUFBWixTQUE3QixDQUFqQixDQUY0QixDQUc1Qjs7QUFDQUYsUUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNHLE9BQUwsQ0FBYSxZQUFiLEVBQTJCVixJQUEzQixDQUFQO0FBQ0FPLFFBQUFBLElBQUksR0FBR0EsSUFBSSxDQUFDRyxPQUFMLENBQWEsWUFBYixFQUEyQlgsSUFBM0IsQ0FBUDtBQUNBLGVBQU9RLElBQVA7QUFDSDtBQWQ0QjtBQWVoQztBQUNEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFDVUksRUFBQUEsSUFBSSxDQUFDQyxFQUFELEVBQUtDLE9BQUwsRUFBY2QsSUFBZCxFQUFvQkMsSUFBcEIsRUFBMEI7QUFBQTtBQUNoQyxVQUFJO0FBQ0E7QUFDQSxZQUFNTyxJQUFJLFNBQVNWLElBQUksQ0FBQ0MsT0FBTCxDQUFhQyxJQUFiLEVBQW1CQyxJQUFuQixDQUFuQixDQUZBLENBR0E7O0FBQ0EsWUFBTWMsR0FBRyxHQUFHO0FBQ1JGLFVBQUFBLEVBQUUsRUFBRUEsRUFESTtBQUVSRyxVQUFBQSxJQUFJLFlBQUtyQixPQUFPLENBQUNDLEdBQVIsQ0FBWXFCLGNBQWpCLGVBQW9DdEIsT0FBTyxDQUFDQyxHQUFSLENBQVlzQixrQkFBaEQsTUFGSTtBQUVtRTtBQUMzRUosVUFBQUEsT0FBTyxFQUFFQSxPQUhEO0FBSVJOLFVBQUFBLElBQUksRUFBRUE7QUFKRSxTQUFaLENBSkEsQ0FVQTs7QUFDQSxxQkFBYWYsY0FBT21CLElBQVAsQ0FBWUcsR0FBWixDQUFiO0FBQ0gsT0FaRCxDQVlFLE9BQU9JLEdBQVAsRUFBWTtBQUNWQyxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxXQUFaLEVBQXdCRixHQUF4QjtBQUNBLGVBQU9BLEdBQVA7QUFDSDtBQWhCK0I7QUFpQm5DOztBQTNDTTs7ZUE4Q0ksSUFBSXJCLElBQUosRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBzZ01haWwgZnJvbSAnQHNlbmRncmlkL21haWwnO1xuXG5zZ01haWwuc2V0QXBpS2V5KHByb2Nlc3MuZW52LlNFTkRHUklEX0FQSUtFWSk7XG5cbmNsYXNzIE1haWwge1xuXG4gICAgLy8gTWV0aG9kIHRvIGdldCBodG1sIGZyb20gdGhlIG1haWwgdGVtcGxhdGVcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SHRtbCh0ZXh0LCBuYW1lKSB7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlRGlyID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICAgJy4uLy4uLycsXG4gICAgICAgICAgICAnc3JjL3RlbXBsYXRlcycsXG4gICAgICAgICAgICAnTWFpbC5odG1sJ1xuICAgICAgICApO1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh0ZW1wbGF0ZURpcikpIHtcbiAgICAgICAgICAgIC8vIHJlYWQgZmlsZSBjb250ZW50XG4gICAgICAgICAgICBsZXQgaHRtbCA9IGF3YWl0IGZzLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZURpciwgeyBlbmNvZGluZzogJ3V0Zi04JyB9KTtcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgZHluYW1pYyBjb250ZW50IChuYW1lIGFuZCB1cmwpIGluIHRoZSBtYWlsIHRlbXBsYXRlXG4gICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC97eyBuYW1lIH19LywgbmFtZSk7XG4gICAgICAgICAgICBodG1sID0gaHRtbC5yZXBsYWNlKC97eyB0ZXh0IH19LywgdGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBzZW5kIGVtYWlsIHVzaW5nIHRlbXBsYXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRvIC0gRW1haWxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3ViamVjdCAgLSBTdWJqZWN0XG4gICAgICogQHBhcmFtIHRleHRcbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqL1xuICAgIGFzeW5jIHNlbmQodG8sIHN1YmplY3QsIHRleHQsIG5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEdldCBIVE1MXG4gICAgICAgICAgICBjb25zdCBodG1sID0gYXdhaXQgTWFpbC5nZXRIdG1sKHRleHQsIG5hbWUpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgbXNnIHRvIHNlbmQgb24gbWFpbFxuICAgICAgICAgICAgY29uc3QgbXNnID0ge1xuICAgICAgICAgICAgICAgIHRvOiB0byxcbiAgICAgICAgICAgICAgICBmcm9tOiBgJHtwcm9jZXNzLmVudi5NQUlMX0ZST01fTkFNRX0gPCR7cHJvY2Vzcy5lbnYuTUFJTF9TTVRQX1VTRVJOQU1FfT5gLCAvLyBVc2UgdGhlIGVtYWlsIGFkZHJlc3Mgb3IgZG9tYWluIHlvdSB2ZXJpZmllZCBhYm92ZVxuICAgICAgICAgICAgICAgIHN1YmplY3Q6IHN1YmplY3QsXG4gICAgICAgICAgICAgICAgaHRtbDogaHRtbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBSZXR1cm5zIG1haWwgcmVzcG9uc2VcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBzZ01haWwuc2VuZChtc2cpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWFpbGVyb29yXCIsZXJyKVxuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1haWwoKTtcbiJdfQ==