"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Reused methods throughout the application
 */
class CommonService {
  constructor() {
    _defineProperty(this, "findAssessedStudents", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (Model, task, set, ClassModel, StudentModel) {
        try {
          var query = {
            task
          };
          var classes, student; // Creating query according to given filters

          if (set.student === 'All') {
            if (set.students && set.students.length) {
              query.student = {
                $in: set.students
              };
            }

            if (set.class && set.class.length) {
              query.class = {
                $in: set.class
              };
            } // Finding Class Name of selected class id


            classes = yield _CommonDbController.default.list(ClassModel, {
              _id: {
                $in: set.class
              }
            }, ['name']);
          } else {
            query.student = set.student; // Finding Name of selected student id

            student = yield _CommonDbController.default.list(StudentModel, {
              _id: set.student
            }, ['firstName', 'lastName']);
          }

          if (set.assessDate) {
            query.createdAt = set.assessDate;
          } // Finding average of details (head, arms, legs, body) of selected students


          var average = (list, field) => {
            var sum = 0;

            for (var obj of list) {
              sum += obj[field];
            }

            return (sum / list.length).toFixed(2);
          };

          var params = ['head', 'arms', 'legs', 'body']; // Find list of Assessments

          var result = yield _CommonDbController.default.list(Model, query, params);
          return {
            head: average(result, 'head'),
            arms: average(result, 'arms'),
            legs: average(result, 'legs'),
            body: average(result, 'body'),
            assessDate: set.assessDate,
            classes,
            student
          };
        } catch (err) {
          return err;
        }
      });

      return function (_x, _x2, _x3, _x4, _x5) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "findIds", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (Model, query, params) {
        // Finding list of given schema for the given query
        var data = yield _CommonDbController.default.list(Model, query, params);
        var ids = [];

        for (var obj of data) {
          obj = obj.toObject();
          ids.push(obj[params]);
        }

        return ids;
      });

      return function (_x6, _x7, _x8) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "findUsers", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (Model, query, params, populate, role) {
        // Finding list of all the users of specific condition
        var adminUsers = yield _CommonDbController.default.list(Model, query, params, populate);
        var mIds = [],
            pcIds = [],
            pIds = [];

        if (role === 'admin' && adminUsers && adminUsers.length) {
          for (var obj of adminUsers) {
            obj = obj.toObject();

            if (obj.role.name === 'manager') {
              mIds.push(obj._id);
            } else if (obj.role.name === 'programcordinator') {
              pcIds.push(obj._id);
            } else if (obj.role.name === 'practitioner') {
              pIds.push(obj._id);
            }
          }
        }

        if (mIds && mIds.length || role.name === 'manager') {
          var query1 = mIds && mIds.length ? {
            $or: [{
              createdBy: {
                $in: mIds
              }
            }, {
              updatedBy: {
                $in: mIds
              }
            }]
          } : query; // Finding list of all the users of specific condition

          var managerUsers = yield _CommonDbController.default.list(Model, query1, params, populate);

          if (managerUsers && managerUsers.length) {
            for (var _obj of managerUsers) {
              _obj = _obj.toObject();

              if (_obj.role.name === 'programcordinator') {
                pcIds.push(_obj._id);
              } else if (_obj.role.name === 'practitioner') {
                pIds.push(_obj._id);
              }
            }
          }
        }

        if (pcIds && pcIds.length || role.name === 'programcordinator') {
          var _query = pcIds && pcIds.length ? {
            $or: [{
              createdBy: {
                $in: pcIds
              }
            }, {
              updatedBy: {
                $in: pcIds
              }
            }]
          } : query; // Finding list of all the users of specific condition


          var pcUsers = yield _CommonDbController.default.list(Model, _query, params);

          if (pcUsers && pcUsers.length) {
            for (var _obj2 of pcUsers) {
              _obj2 = _obj2.toObject();
              pIds.push(_obj2._id);
            }
          }
        } // Getting all the users which are under the logged in user


        return [...mIds, ...pcIds, ...pIds];
      });

      return function (_x9, _x10, _x11, _x12, _x13) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "convertTimeToDate", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (time) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = parseInt(date.getMonth(), 10) + 1;
        month = month < 10 ? '0' + month : month;
        var day = parseInt(date.getDate(), 10);
        day = day < 10 ? '0' + day : day;
        return day + '-' + month + '-' + year;
      });

      return function (_x14) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "getAge", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) age--;
        return age;
      });

      return function (_x15) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "checkEmailExistence", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (Model, email, list) {
        var isEmailExist = false;

        if (list && list.length) {
          // Check existence of given email in array
          var entryIndex = list.findIndex(x => x.email === email);

          if (entryIndex > -1) {
            isEmailExist = true;
          } else {
            // Check existence of given email in DB
            var isEmailExists = yield _CommonDbController.default.findSingle(Model, {
              email,
              isDeleted: false
            }, ['_id']);

            if (isEmailExists) {
              isEmailExist = true;
            }
          }
        } else {
          // Check existence of given email in DB
          var _isEmailExists = yield _CommonDbController.default.findSingle(Model, {
            email,
            isDeleted: false
          }, ['_id']);

          if (_isEmailExists) {
            isEmailExist = true;
          }
        }

        return isEmailExist;
      });

      return function (_x16, _x17, _x18) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "findTasks", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (Model, query) {
        var populateFields = [{
          path: 'phase',
          select: 'name'
        }, {
          path: 'movementType',
          select: 'name'
        }]; // Finding tasks

        var tasks = yield _CommonDbController.default.list(Model, query, ['name', 'phase', 'movementType'], populateFields);

        if (tasks && tasks.length) {
          for (var i in tasks) {
            if (tasks.hasOwnProperty(i)) {
              tasks[i] = tasks[i].toObject();
              tasks[i].displayName = "".concat(tasks[i].name, " - ").concat(tasks[i].phase.name, " - ").concat(tasks[i].movementType.name);
            }
          }
        }

        return tasks;
      });

      return function (_x19, _x20) {
        return _ref7.apply(this, arguments);
      };
    }());
  }

}

var _default = new CommonService();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TZXJ2aWNlL0NvbW1vblNlcnZpY2UuanMiXSwibmFtZXMiOlsiQ29tbW9uU2VydmljZSIsIk1vZGVsIiwidGFzayIsInNldCIsIkNsYXNzTW9kZWwiLCJTdHVkZW50TW9kZWwiLCJxdWVyeSIsImNsYXNzZXMiLCJzdHVkZW50Iiwic3R1ZGVudHMiLCJsZW5ndGgiLCIkaW4iLCJjbGFzcyIsIkNvbW1vbiIsImxpc3QiLCJfaWQiLCJhc3Nlc3NEYXRlIiwiY3JlYXRlZEF0IiwiYXZlcmFnZSIsImZpZWxkIiwic3VtIiwib2JqIiwidG9GaXhlZCIsInBhcmFtcyIsInJlc3VsdCIsImhlYWQiLCJhcm1zIiwibGVncyIsImJvZHkiLCJlcnIiLCJkYXRhIiwiaWRzIiwidG9PYmplY3QiLCJwdXNoIiwicG9wdWxhdGUiLCJyb2xlIiwiYWRtaW5Vc2VycyIsIm1JZHMiLCJwY0lkcyIsInBJZHMiLCJuYW1lIiwicXVlcnkxIiwiJG9yIiwiY3JlYXRlZEJ5IiwidXBkYXRlZEJ5IiwibWFuYWdlclVzZXJzIiwicGNVc2VycyIsInRpbWUiLCJkYXRlIiwiRGF0ZSIsInllYXIiLCJnZXRGdWxsWWVhciIsIm1vbnRoIiwicGFyc2VJbnQiLCJnZXRNb250aCIsImRheSIsImdldERhdGUiLCJkYXRlU3RyaW5nIiwidG9kYXkiLCJiaXJ0aERhdGUiLCJhZ2UiLCJtIiwiZW1haWwiLCJpc0VtYWlsRXhpc3QiLCJlbnRyeUluZGV4IiwiZmluZEluZGV4IiwieCIsImlzRW1haWxFeGlzdHMiLCJmaW5kU2luZ2xlIiwiaXNEZWxldGVkIiwicG9wdWxhdGVGaWVsZHMiLCJwYXRoIiwic2VsZWN0IiwidGFza3MiLCJpIiwiaGFzT3duUHJvcGVydHkiLCJkaXNwbGF5TmFtZSIsInBoYXNlIiwibW92ZW1lbnRUeXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQSxhQUFOLENBQW9CO0FBQUE7QUFBQTtBQUFB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Z0UsY0FBYyxHQUFHLENBQUM7QUFBQ0MsVUFBQUEsSUFBSSxFQUFFLE9BQVA7QUFBZ0JDLFVBQUFBLE1BQU0sRUFBRTtBQUF4QixTQUFELEVBQWtDO0FBQUNELFVBQUFBLElBQUksRUFBRSxjQUFQO0FBQXVCQyxVQUFBQSxNQUFNLEVBQUU7QUFBL0IsU0FBbEMsQ0FBdkIsQ0FEZ0MsQ0FFaEM7O0FBQ0EsWUFBTUMsS0FBSyxTQUFTNUQsNEJBQU9DLElBQVAsQ0FBWWIsS0FBWixFQUFtQkssS0FBbkIsRUFBMEIsQ0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixjQUFsQixDQUExQixFQUE2RGdFLGNBQTdELENBQXBCOztBQUNBLFlBQUlHLEtBQUssSUFBSUEsS0FBSyxDQUFDL0QsTUFBbkIsRUFBMkI7QUFDdkIsZUFBSyxJQUFNZ0UsQ0FBWCxJQUFnQkQsS0FBaEIsRUFBdUI7QUFDbkIsZ0JBQUlBLEtBQUssQ0FBQ0UsY0FBTixDQUFxQkQsQ0FBckIsQ0FBSixFQUE2QjtBQUN6QkQsY0FBQUEsS0FBSyxDQUFDQyxDQUFELENBQUwsR0FBV0QsS0FBSyxDQUFDQyxDQUFELENBQUwsQ0FBUzFDLFFBQVQsRUFBWDtBQUNBeUMsY0FBQUEsS0FBSyxDQUFDQyxDQUFELENBQUwsQ0FBU0UsV0FBVCxhQUEwQkgsS0FBSyxDQUFDQyxDQUFELENBQUwsQ0FBU2xDLElBQW5DLGdCQUE2Q2lDLEtBQUssQ0FBQ0MsQ0FBRCxDQUFMLENBQVNHLEtBQVQsQ0FBZXJDLElBQTVELGdCQUFzRWlDLEtBQUssQ0FBQ0MsQ0FBRCxDQUFMLENBQVNJLFlBQVQsQ0FBc0J0QyxJQUE1RjtBQUNIO0FBQ0o7QUFDSjs7QUFDRCxlQUFPaUMsS0FBUDtBQUNILE9Bbk5lOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBc05MLElBQUl6RSxhQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuXG4vKipcbiAqIFJldXNlZCBtZXRob2RzIHRocm91Z2hvdXQgdGhlIGFwcGxpY2F0aW9uXG4gKi9cbmNsYXNzIENvbW1vblNlcnZpY2Uge1xuICAgIC8qKlxuICAgICAqIEZpbmQgYXNzZXNzZWQgc3R1ZGVudHMgb2Ygc2VsZWN0ZWQgY2xhc3MgZm9yIGdpdmVuIHRhc2tcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gTW9kZWwgLSBEYXRhYmFzZSBzY2hlbWEgdG8gcnVuIHF1ZXJ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhc2sgLSBJZCBvZiB0YXNrXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHNldCAtIG9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgZmlsdGVyc1xuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBDbGFzc01vZGVsIC0gREIgU2NoZW1hIG9mIENsYXNzIE1vZGVsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFN0dWRlbnRNb2RlbCAtIERCIFNjaGVtYSBvZiBTdHVkZW50IE1vZGVsXG4gICAgICovXG4gICAgZmluZEFzc2Vzc2VkU3R1ZGVudHMgPSBhc3luYyAoTW9kZWwsIHRhc2ssIHNldCwgQ2xhc3NNb2RlbCwgU3R1ZGVudE1vZGVsKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHt0YXNrfTtcbiAgICAgICAgICAgIGxldCBjbGFzc2VzLCBzdHVkZW50O1xuICAgICAgICAgICAgLy8gQ3JlYXRpbmcgcXVlcnkgYWNjb3JkaW5nIHRvIGdpdmVuIGZpbHRlcnNcbiAgICAgICAgICAgIGlmIChzZXQuc3R1ZGVudCA9PT0gJ0FsbCcpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2V0LnN0dWRlbnRzICYmIHNldC5zdHVkZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkuc3R1ZGVudCA9IHskaW46IHNldC5zdHVkZW50c31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNldC5jbGFzcyAmJiBzZXQuY2xhc3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNsYXNzID0geyRpbjogc2V0LmNsYXNzfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRmluZGluZyBDbGFzcyBOYW1lIG9mIHNlbGVjdGVkIGNsYXNzIGlkXG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGF3YWl0IENvbW1vbi5saXN0KENsYXNzTW9kZWwsIHtfaWQ6IHskaW46IHNldC5jbGFzc319LCBbJ25hbWUnXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LnN0dWRlbnQgPSBzZXQuc3R1ZGVudDtcbiAgICAgICAgICAgICAgICAvLyBGaW5kaW5nIE5hbWUgb2Ygc2VsZWN0ZWQgc3R1ZGVudCBpZFxuICAgICAgICAgICAgICAgIHN0dWRlbnQgPSBhd2FpdCBDb21tb24ubGlzdChTdHVkZW50TW9kZWwsIHtfaWQ6IHNldC5zdHVkZW50fSwgWydmaXJzdE5hbWUnLCAnbGFzdE5hbWUnXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZXQuYXNzZXNzRGF0ZSkge1xuICAgICAgICAgICAgICAgIHF1ZXJ5LmNyZWF0ZWRBdCA9IHNldC5hc3Nlc3NEYXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5kaW5nIGF2ZXJhZ2Ugb2YgZGV0YWlscyAoaGVhZCwgYXJtcywgbGVncywgYm9keSkgb2Ygc2VsZWN0ZWQgc3R1ZGVudHNcbiAgICAgICAgICAgIGNvbnN0IGF2ZXJhZ2UgPSAobGlzdCwgZmllbGQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3VtID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgbGlzdCkge1xuICAgICAgICAgICAgICAgICAgICBzdW0gKz0gb2JqW2ZpZWxkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIChzdW0gLyBsaXN0Lmxlbmd0aCkudG9GaXhlZCgyKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBbJ2hlYWQnLCAnYXJtcycsICdsZWdzJywgJ2JvZHknXTtcblxuICAgICAgICAgICAgLy8gRmluZCBsaXN0IG9mIEFzc2Vzc21lbnRzXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBDb21tb24ubGlzdChNb2RlbCwgcXVlcnksIHBhcmFtcyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaGVhZDogYXZlcmFnZShyZXN1bHQsICdoZWFkJyksXG4gICAgICAgICAgICAgICAgYXJtczogYXZlcmFnZShyZXN1bHQsICdhcm1zJyksXG4gICAgICAgICAgICAgICAgbGVnczogYXZlcmFnZShyZXN1bHQsICdsZWdzJyksXG4gICAgICAgICAgICAgICAgYm9keTogYXZlcmFnZShyZXN1bHQsICdib2R5JyksXG4gICAgICAgICAgICAgICAgYXNzZXNzRGF0ZTogc2V0LmFzc2Vzc0RhdGUsXG4gICAgICAgICAgICAgICAgY2xhc3NlcyxcbiAgICAgICAgICAgICAgICBzdHVkZW50XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIGlkcyBmcm9tIHRoZSBhcnJheSBvZiBvYmplY3RzIG9mIGdpdmVuIHNjaGVtYVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBNb2RlbCAtIERhdGFiYXNlIHNjaGVtYSB0byBydW4gcXVlcnlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcXVlcnkgLSBjb25kaXRpb25cbiAgICAgKiBAcGFyYW0ge2FycmF5fSBwYXJhbXMgLSBwYXJhbWV0ZXJzIHdoaWNoIG5lZWQgdG8gZ2V0IGZyb20gREJcbiAgICAgKi9cbiAgICBmaW5kSWRzID0gYXN5bmMgKE1vZGVsLCBxdWVyeSwgcGFyYW1zKSA9PiB7XG4gICAgICAgIC8vIEZpbmRpbmcgbGlzdCBvZiBnaXZlbiBzY2hlbWEgZm9yIHRoZSBnaXZlbiBxdWVyeVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgQ29tbW9uLmxpc3QoTW9kZWwsIHF1ZXJ5LCBwYXJhbXMpO1xuICAgICAgICBjb25zdCBpZHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgb2JqIG9mIGRhdGEpIHtcbiAgICAgICAgICAgIG9iaiA9IG9iai50b09iamVjdCgpO1xuICAgICAgICAgICAgaWRzLnB1c2gob2JqW3BhcmFtc10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpZHM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgaWRzIG9mIGFsbCB0aGUgdXNlcnMgdW5kZXIgdGhlIGxvZ2dlZCBpbiB1c2VyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IE1vZGVsIC0gRGF0YWJhc2Ugc2NoZW1hIHRvIHJ1biBxdWVyeVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBxdWVyeSAtIGNvbmRpdGlvblxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHBhcmFtcyAtIHBhcmFtZXRlcnMgd2hpY2ggbmVlZCB0byBnZXQgZnJvbSBEQlxuICAgICAqIEBwYXJhbSB7YXJyYXl9IHBvcHVsYXRlIC0gcXVlcnkgZm9yIGZpbmRpbmcgZGF0YSBmcm9tIHJlZmVyZW5jZWQgc2NoZW1hXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHJvbGUgLSByb2xlIG9iamVjdCBoYXZpbmcgaWQgYW5kIG5hbWUgaW4gaXRzIG9iamVjdFxuICAgICAqL1xuICAgIGZpbmRVc2VycyA9IGFzeW5jIChNb2RlbCwgcXVlcnksIHBhcmFtcywgcG9wdWxhdGUsIHJvbGUpID0+IHtcbiAgICAgICAgLy8gRmluZGluZyBsaXN0IG9mIGFsbCB0aGUgdXNlcnMgb2Ygc3BlY2lmaWMgY29uZGl0aW9uXG4gICAgICAgIGNvbnN0IGFkbWluVXNlcnMgPSBhd2FpdCBDb21tb24ubGlzdChNb2RlbCwgcXVlcnksIHBhcmFtcywgcG9wdWxhdGUpO1xuICAgICAgICBjb25zdCBtSWRzID0gW10sIHBjSWRzID0gW10sIHBJZHMgPSBbXTtcbiAgICAgICAgaWYgKHJvbGUgPT09ICdhZG1pbicgJiYgYWRtaW5Vc2VycyAmJiBhZG1pblVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIGFkbWluVXNlcnMpIHtcbiAgICAgICAgICAgICAgICBvYmogPSBvYmoudG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAob2JqLnJvbGUubmFtZSA9PT0gJ21hbmFnZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIG1JZHMucHVzaChvYmouX2lkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9iai5yb2xlLm5hbWUgPT09ICdwcm9ncmFtY29yZGluYXRvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgcGNJZHMucHVzaChvYmouX2lkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9iai5yb2xlLm5hbWUgPT09ICdwcmFjdGl0aW9uZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHBJZHMucHVzaChvYmouX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChtSWRzICYmIG1JZHMubGVuZ3RoKSB8fCByb2xlLm5hbWUgPT09ICdtYW5hZ2VyJykge1xuICAgICAgICAgICAgY29uc3QgcXVlcnkxID0gKG1JZHMgJiYgbUlkcy5sZW5ndGgpID8geyRvcjogW3tjcmVhdGVkQnk6IHskaW46IG1JZHN9fSwge3VwZGF0ZWRCeTogeyRpbjogbUlkc319XX0gOiBxdWVyeTtcbiAgICAgICAgICAgIC8vIEZpbmRpbmcgbGlzdCBvZiBhbGwgdGhlIHVzZXJzIG9mIHNwZWNpZmljIGNvbmRpdGlvblxuICAgICAgICAgICAgY29uc3QgbWFuYWdlclVzZXJzID0gYXdhaXQgQ29tbW9uLmxpc3QoTW9kZWwsIHF1ZXJ5MSwgcGFyYW1zLCBwb3B1bGF0ZSk7XG4gICAgICAgICAgICBpZiAobWFuYWdlclVzZXJzICYmIG1hbmFnZXJVc2Vycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvYmogb2YgbWFuYWdlclVzZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iai50b09iamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnJvbGUubmFtZSA9PT0gJ3Byb2dyYW1jb3JkaW5hdG9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGNJZHMucHVzaChvYmouX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvYmoucm9sZS5uYW1lID09PSAncHJhY3RpdGlvbmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcElkcy5wdXNoKG9iai5faWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICgocGNJZHMgJiYgcGNJZHMubGVuZ3RoKSB8fCByb2xlLm5hbWUgPT09ICdwcm9ncmFtY29yZGluYXRvcicpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5MSA9IChwY0lkcyAmJiBwY0lkcy5sZW5ndGgpID8geyRvcjogW3tjcmVhdGVkQnk6IHskaW46IHBjSWRzfX0sIHt1cGRhdGVkQnk6IHskaW46IHBjSWRzfX1dfSA6IHF1ZXJ5O1xuICAgICAgICAgICAgLy8gRmluZGluZyBsaXN0IG9mIGFsbCB0aGUgdXNlcnMgb2Ygc3BlY2lmaWMgY29uZGl0aW9uXG4gICAgICAgICAgICBjb25zdCBwY1VzZXJzID0gYXdhaXQgQ29tbW9uLmxpc3QoTW9kZWwsIHF1ZXJ5MSwgcGFyYW1zKTtcbiAgICAgICAgICAgIGlmIChwY1VzZXJzICYmIHBjVXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb2JqIG9mIHBjVXNlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqID0gb2JqLnRvT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIHBJZHMucHVzaChvYmouX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2V0dGluZyBhbGwgdGhlIHVzZXJzIHdoaWNoIGFyZSB1bmRlciB0aGUgbG9nZ2VkIGluIHVzZXJcbiAgICAgICAgcmV0dXJuIFsuLi5tSWRzLCAuLi5wY0lkcywgLi4ucElkc107XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgZ2l2ZW4gdGltZSB0byBzcGVjaWZpYyBkYXRlIGZvcm1hdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgICAqL1xuICAgIGNvbnZlcnRUaW1lVG9EYXRlID0gYXN5bmMgKHRpbWUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRpbWUpO1xuICAgICAgICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICBsZXQgbW9udGggPSBwYXJzZUludChkYXRlLmdldE1vbnRoKCksIDEwKSArIDE7XG4gICAgICAgIG1vbnRoID0gbW9udGggPCAxMCA/ICcwJyArIG1vbnRoIDogbW9udGg7XG4gICAgICAgIGxldCBkYXkgPSBwYXJzZUludChkYXRlLmdldERhdGUoKSwgMTApO1xuICAgICAgICBkYXkgPSBkYXkgPCAxMCA/ICcwJyArIGRheSA6IGRheTtcbiAgICAgICAgcmV0dXJuIGRheSArICctJyArIG1vbnRoICsgJy0nICsgeWVhcjtcbiAgICB9O1xuXG5cbiAgICBnZXRBZ2UgPSBhc3luYyAoZGF0ZVN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IGJpcnRoRGF0ZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xuICAgICAgICBsZXQgYWdlID0gdG9kYXkuZ2V0RnVsbFllYXIoKSAtIGJpcnRoRGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgICAgICBjb25zdCBtID0gdG9kYXkuZ2V0TW9udGgoKSAtIGJpcnRoRGF0ZS5nZXRNb250aCgpO1xuICAgICAgICBpZiAobSA8IDAgfHwgKG0gPT09IDAgJiYgdG9kYXkuZ2V0RGF0ZSgpIDwgYmlydGhEYXRlLmdldERhdGUoKSkpXG4gICAgICAgICAgICBhZ2UtLTtcbiAgICAgICAgcmV0dXJuIGFnZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgdGhlIGVtYWlsIGV4aXN0ZW5jZSBpbiBleGlzdGluZyBlbnRyaWVzIG9mIERCIGFuZCBnaXZlbiBhcnJheSAobGlzdClcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gTW9kZWwgLSBEYXRhYmFzZSBzY2hlbWEgdG8gcnVuIHF1ZXJ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGVtYWlsXG4gICAgICogQHBhcmFtIHthcnJheX0gbGlzdFxuICAgICAqL1xuICAgIGNoZWNrRW1haWxFeGlzdGVuY2UgPSBhc3luYyAoTW9kZWwsIGVtYWlsLCBsaXN0KSA9PiB7XG4gICAgICAgIGxldCBpc0VtYWlsRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgaWYgKGxpc3QgJiYgbGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0ZW5jZSBvZiBnaXZlbiBlbWFpbCBpbiBhcnJheVxuICAgICAgICAgICAgY29uc3QgZW50cnlJbmRleCA9IGxpc3QuZmluZEluZGV4KHggPT4geC5lbWFpbCA9PT0gZW1haWwpO1xuICAgICAgICAgICAgaWYgKGVudHJ5SW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIGlzRW1haWxFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0ZW5jZSBvZiBnaXZlbiBlbWFpbCBpbiBEQlxuICAgICAgICAgICAgICAgIGNvbnN0IGlzRW1haWxFeGlzdHMgPSBhd2FpdCBDb21tb24uZmluZFNpbmdsZShNb2RlbCwge1xuICAgICAgICAgICAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgaXNEZWxldGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0sIFsnX2lkJ10pO1xuICAgICAgICAgICAgICAgIGlmIChpc0VtYWlsRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlzRW1haWxFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQ2hlY2sgZXhpc3RlbmNlIG9mIGdpdmVuIGVtYWlsIGluIERCXG4gICAgICAgICAgICBjb25zdCBpc0VtYWlsRXhpc3RzID0gYXdhaXQgQ29tbW9uLmZpbmRTaW5nbGUoTW9kZWwsIHtcbiAgICAgICAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICAgICAgICBpc0RlbGV0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9LCBbJ19pZCddKTtcbiAgICAgICAgICAgIGlmIChpc0VtYWlsRXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgaXNFbWFpbEV4aXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFbWFpbEV4aXN0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kaW5nIFRhc2tzIHdoaWNoIHNhdGlzZnkgZ2l2ZW4gY29uZGl0aW9uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IE1vZGVsIC0gRGF0YWJhc2Ugc2NoZW1hIHRvIHJ1biBxdWVyeVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBxdWVyeSAtIENvbmRpdGlvblxuICAgICAqL1xuICAgIGZpbmRUYXNrcyA9IGFzeW5jIChNb2RlbCwgcXVlcnkpID0+IHtcbiAgICAgICAgY29uc3QgcG9wdWxhdGVGaWVsZHMgPSBbe3BhdGg6ICdwaGFzZScsIHNlbGVjdDogJ25hbWUnfSwge3BhdGg6ICdtb3ZlbWVudFR5cGUnLCBzZWxlY3Q6ICduYW1lJ31dO1xuICAgICAgICAvLyBGaW5kaW5nIHRhc2tzXG4gICAgICAgIGNvbnN0IHRhc2tzID0gYXdhaXQgQ29tbW9uLmxpc3QoTW9kZWwsIHF1ZXJ5LCBbJ25hbWUnLCAncGhhc2UnLCAnbW92ZW1lbnRUeXBlJ10sIHBvcHVsYXRlRmllbGRzKTtcbiAgICAgICAgaWYgKHRhc2tzICYmIHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIHRhc2tzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2ldID0gdGFza3NbaV0udG9PYmplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaV0uZGlzcGxheU5hbWUgPSBgJHt0YXNrc1tpXS5uYW1lfSAtICR7dGFza3NbaV0ucGhhc2UubmFtZX0gLSAke3Rhc2tzW2ldLm1vdmVtZW50VHlwZS5uYW1lfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXNrcztcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBDb21tb25TZXJ2aWNlKCk7Il19