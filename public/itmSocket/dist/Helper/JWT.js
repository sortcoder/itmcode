"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTokenForFirstLogin = exports.generateToken = void 0;

var _jsonwebtoken = require("jsonwebtoken");

/**
 * generate jwt token
 * @param {string} uid  - uid
 * @param {object} scope  - user data
 */
var generateToken = (uid, scope) => {
  // Generate JWT token
  var appSecret = process.env.JWT_SECRET;
  return (0, _jsonwebtoken.sign)({
    uid,
    scope
  }, appSecret // { expiresIn: 2 * 60 * 60}
  );
};

exports.generateToken = generateToken;

var generateTokenForFirstLogin = (email, name) => {
  // Generate JWT token for first login
  var appSecret = process.env.JWT_SECRET;
  return (0, _jsonwebtoken.sign)({
    email,
    name
  }, appSecret);
};

exports.generateTokenForFirstLogin = generateTokenForFirstLogin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9IZWxwZXIvSldULmpzIl0sIm5hbWVzIjpbImdlbmVyYXRlVG9rZW4iLCJ1aWQiLCJzY29wZSIsImFwcFNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiZ2VuZXJhdGVUb2tlbkZvckZpcnN0TG9naW4iLCJlbWFpbCIsIm5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sSUFBTUEsYUFBYSxHQUFHLENBQUNDLEdBQUQsRUFBTUMsS0FBTixLQUFnQjtBQUN6QztBQUNBLE1BQU1DLFNBQVMsR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFVBQTlCO0FBQ0EsU0FBTyx3QkFDSDtBQUNJTCxJQUFBQSxHQURKO0FBRUlDLElBQUFBO0FBRkosR0FERyxFQUtIQyxTQUxHLENBTUg7QUFORyxHQUFQO0FBUUgsQ0FYTTs7OztBQWFBLElBQU1JLDBCQUEwQixHQUFHLENBQUNDLEtBQUQsRUFBUUMsSUFBUixLQUFpQjtBQUN2RDtBQUNBLE1BQU1OLFNBQVMsR0FBR0MsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFVBQTlCO0FBQ0EsU0FBTyx3QkFDSDtBQUNJRSxJQUFBQSxLQURKO0FBRUlDLElBQUFBO0FBRkosR0FERyxFQUtITixTQUxHLENBQVA7QUFPSCxDQVZNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc2lnbiB9IGZyb20gJ2pzb253ZWJ0b2tlbic7XG5cbi8qKlxuICogZ2VuZXJhdGUgand0IHRva2VuXG4gKiBAcGFyYW0ge3N0cmluZ30gdWlkICAtIHVpZFxuICogQHBhcmFtIHtvYmplY3R9IHNjb3BlICAtIHVzZXIgZGF0YVxuICovXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVUb2tlbiA9ICh1aWQsIHNjb3BlKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgSldUIHRva2VuXG4gICAgY29uc3QgYXBwU2VjcmV0ID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVDtcbiAgICByZXR1cm4gc2lnbihcbiAgICAgICAge1xuICAgICAgICAgICAgdWlkLFxuICAgICAgICAgICAgc2NvcGUsXG4gICAgICAgIH0sXG4gICAgICAgIGFwcFNlY3JldCxcbiAgICAgICAgLy8geyBleHBpcmVzSW46IDIgKiA2MCAqIDYwfVxuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVUb2tlbkZvckZpcnN0TG9naW4gPSAoZW1haWwsIG5hbWUpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSBKV1QgdG9rZW4gZm9yIGZpcnN0IGxvZ2luXG4gICAgY29uc3QgYXBwU2VjcmV0ID0gcHJvY2Vzcy5lbnYuSldUX1NFQ1JFVDtcbiAgICByZXR1cm4gc2lnbihcbiAgICAgICAge1xuICAgICAgICAgICAgZW1haWwsXG4gICAgICAgICAgICBuYW1lXG4gICAgICAgIH0sXG4gICAgICAgIGFwcFNlY3JldFxuICAgICk7XG59O1xuIl19