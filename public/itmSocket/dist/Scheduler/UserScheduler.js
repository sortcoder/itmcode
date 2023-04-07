"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeSchedule = _interopRequireDefault(require("node-schedule"));

var _User = _interopRequireDefault(require("../Models/User"));

var _Game = _interopRequireDefault(require("../Models/Game"));

var _UserSubscription = _interopRequireDefault(require("../Models/UserSubscription"));

var _MembershipPlans = _interopRequireDefault(require("../Models/MembershipPlans"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _RequestHelper = require("../Helper/RequestHelper");

var _UserGiftPlan = _interopRequireDefault(require("../Models/UserGiftPlan"));

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 *  User Scheduler Class
 *  @author Nitisha Khandelwal <nitisha.khandelwal@jploft.in>
 */
class UserScheduler {
  constructor() {
    _defineProperty(this, "checkUserSubscription", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        var subscribedUser = yield _CommonDbController.default.list(_User.default, {
          isSubscribed: true,
          isDeleted: false
        }, ['_id']);
        console.log("cron");
        var subscribedIds = [];
        var populateFields = {
          path: 'planId',
          select: 'validity createdAt'
        };

        if (subscribedUser && subscribedUser.length) {
          for (var obj of subscribedUser) {
            subscribedIds.push(obj._id);
            var subscription = yield _UserSubscription.default.find({
              userId: obj._id
            }, 'planId userId createdAt').populate(populateFields).sort({
              "createdAt": -1
            }).limit(1);
            subscription[0] = subscription[0].toObject();

            if (subscription[0].planId) {
              var planDate = new Date(subscription[0].createdAt);
              var endDate = (0, _moment.default)(planDate).add(parseInt(subscription[0].planId.validity), "days");
              var startDate = (0, _moment.default)(new Date());
              var result = endDate.diff(startDate, 'days'); // console.log(result,"S"+startDate.format("YYYY-MM-DD"),"e"+endDate.format("YYYY-MM-DD"),"v"+subscription[0].planId.validity,subscription[0].createdAt)

              var date = planDate.setDate(planDate.getDate() + parseInt(subscription[0].planId.validity, 10));

              if (result >= 0) {} else {
                yield _CommonDbController.default.update(_User.default, {
                  _id: obj._id
                }, {
                  isSubscribed: false
                });
                yield _CommonDbController.default.update(_UserGiftPlan.default, {
                  userId: obj._id,
                  status: 'active'
                }, {
                  status: 'used'
                });
              }
            } else {
              console.log("S");
              yield _CommonDbController.default.update(_User.default, {
                _id: obj._id
              }, {
                isSubscribed: false
              });
            }
          }
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "completeGameIfPlayerLeave", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        var endDate = (0, _moment.default)(new Date()).subtract(2, "minutes").toISOString();
        var endDate1 = (0, _moment.default)(new Date()).subtract(1, "minutes").toISOString();
        var allPendingGame = yield _CommonDbController.default.list(_Game.default, {
          createdAt: {
            $lt: endDate
          },
          status: "pending",
          gameType: "public"
        }, ['_id']);

        for (var obj of allPendingGame) {
          yield _CommonDbController.default.update(_Game.default, {
            _id: obj._id
          }, {
            status: "completed"
          });
        }

        var allPendingGamePrivate = yield _CommonDbController.default.list(_Game.default, {
          createdAt: {
            $lt: endDate1
          },
          status: "pending",
          gameType: "private"
        }, ['_id']);

        for (var _obj of allPendingGamePrivate) {
          yield _CommonDbController.default.update(_Game.default, {
            _id: _obj._id
          }, {
            status: "completed"
          });
        }

        var allPendingGamePrivateMatch = yield _CommonDbController.default.list(_Game.default, {
          createdAt: {
            $lt: endDate1
          },
          status: "match",
          gameType: "private"
        }, ['_id']); // console.log("allPendingGamePrivateMatch",allPendingGamePrivateMatch)

        for (var _obj2 of allPendingGamePrivateMatch) {
          yield _CommonDbController.default.update(_Game.default, {
            _id: _obj2._id
          }, {
            status: "completed"
          });
          /*  let finalWinner = obj.secUser;
           let winnerDetail = await User.findById(finalWinner);
           let walletamount = winnerDetail.wallet ? winnerDetail.wallet : 0;
           let newWallet = parseInt(walletamount) + parseInt(obj.zoleWin) + parseInt(obj.zoleWin);
             await UserModel.updateOne({ _id: finalWinner }, { $set: { wallet: newWallet } });
                     await Common.update(Game, { _id: obj._id }, { status: "completed",winnerUser: finalWinner }); */
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }

}

var _default = new UserScheduler();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TY2hlZHVsZXIvVXNlclNjaGVkdWxlci5qcyJdLCJuYW1lcyI6WyJVc2VyU2NoZWR1bGVyIiwicmVxIiwicmVzIiwic3Vic2NyaWJlZFVzZXIiLCJDb21tb24iLCJsaXN0IiwiVXNlck1vZGVsIiwiaXNTdWJzY3JpYmVkIiwiaXNEZWxldGVkIiwiY29uc29sZSIsImxvZyIsInN1YnNjcmliZWRJZHMiLCJwb3B1bGF0ZUZpZWxkcyIsInBhdGgiLCJzZWxlY3QiLCJsZW5ndGgiLCJvYmoiLCJwdXNoIiwiX2lkIiwic3Vic2NyaXB0aW9uIiwiVXNlclN1YnNjcmlwdGlvbk1vZGVsIiwiZmluZCIsInVzZXJJZCIsInBvcHVsYXRlIiwic29ydCIsImxpbWl0IiwidG9PYmplY3QiLCJwbGFuSWQiLCJwbGFuRGF0ZSIsIkRhdGUiLCJjcmVhdGVkQXQiLCJlbmREYXRlIiwiYWRkIiwicGFyc2VJbnQiLCJ2YWxpZGl0eSIsInN0YXJ0RGF0ZSIsInJlc3VsdCIsImRpZmYiLCJkYXRlIiwic2V0RGF0ZSIsImdldERhdGUiLCJ1cGRhdGUiLCJVc2VyR2lmdFBsYW4iLCJzdGF0dXMiLCJzdWJ0cmFjdCIsInRvSVNPU3RyaW5nIiwiZW5kRGF0ZTEiLCJhbGxQZW5kaW5nR2FtZSIsIkdhbWUiLCIkbHQiLCJnYW1lVHlwZSIsImFsbFBlbmRpbmdHYW1lUHJpdmF0ZSIsImFsbFBlbmRpbmdHYW1lUHJpdmF0ZU1hdGNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLE1BQU1BLGFBQU4sQ0FBb0I7QUFBQTtBQUFBO0FBQUEsbUNBQ1EsV0FBT0MsR0FBUCxFQUFZQyxHQUFaLEVBQW9CO0FBRXhDLFlBQU1DLGNBQWMsU0FBU0MsNEJBQU9DLElBQVAsQ0FBWUMsYUFBWixFQUF1QjtBQUFFQyxVQUFBQSxZQUFZLEVBQUUs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LEVBQW9CO0FBQUU5QixZQUFBQSxHQUFHLEVBQUVGLElBQUcsQ0FBQ0U7QUFBWCxXQUFwQixFQUFzQztBQUFFeUIsWUFBQUEsTUFBTSxFQUFFO0FBQVYsV0FBdEMsQ0FBTjtBQUNIOztBQUVELFlBQU1TLDBCQUEwQixTQUFTaEQsNEJBQU9DLElBQVAsQ0FBWTJDLGFBQVosRUFBa0I7QUFBRWxCLFVBQUFBLFNBQVMsRUFBRTtBQUFFbUIsWUFBQUEsR0FBRyxFQUFFSDtBQUFQLFdBQWI7QUFBZ0NILFVBQUFBLE1BQU0sRUFBRSxPQUF4QztBQUFpRE8sVUFBQUEsUUFBUSxFQUFFO0FBQTNELFNBQWxCLEVBQTBGLENBQUMsS0FBRCxDQUExRixDQUF6QyxDQWQ0QyxDQWU1Qzs7QUFDQSxhQUFLLElBQUlsQyxLQUFULElBQWdCb0MsMEJBQWhCLEVBQTRDO0FBQ3hDLGdCQUFNaEQsNEJBQU9xQyxNQUFQLENBQWNPLGFBQWQsRUFBb0I7QUFBRTlCLFlBQUFBLEdBQUcsRUFBRUYsS0FBRyxDQUFDRTtBQUFYLFdBQXBCLEVBQXNDO0FBQUV5QixZQUFBQSxNQUFNLEVBQUU7QUFBVixXQUF0QyxDQUFOO0FBQ0Q7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS1M7QUFJSixPQXZFZTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztlQTBFTCxJQUFJM0MsYUFBSixFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNjaGVkdWxlIGZyb20gJ25vZGUtc2NoZWR1bGUnO1xuaW1wb3J0IFVzZXJNb2RlbCBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgR2FtZSBmcm9tICcuLi9Nb2RlbHMvR2FtZSc7XG5pbXBvcnQgVXNlclN1YnNjcmlwdGlvbk1vZGVsIGZyb20gJy4uL01vZGVscy9Vc2VyU3Vic2NyaXB0aW9uJztcbmltcG9ydCBQbGFuTW9kZWwgZnJvbSAnLi4vTW9kZWxzL01lbWJlcnNoaXBQbGFucyc7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5pbXBvcnQgVXNlckdpZnRQbGFuIGZyb20gJy4uL01vZGVscy9Vc2VyR2lmdFBsYW4nO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuXG4vKipcbiAqICBVc2VyIFNjaGVkdWxlciBDbGFzc1xuICogIEBhdXRob3IgTml0aXNoYSBLaGFuZGVsd2FsIDxuaXRpc2hhLmtoYW5kZWx3YWxAanBsb2Z0LmluPlxuICovXG5cbmNsYXNzIFVzZXJTY2hlZHVsZXIge1xuICAgIGNoZWNrVXNlclN1YnNjcmlwdGlvbiA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuXG4gICAgICAgIGNvbnN0IHN1YnNjcmliZWRVc2VyID0gYXdhaXQgQ29tbW9uLmxpc3QoVXNlck1vZGVsLCB7IGlzU3Vic2NyaWJlZDogdHJ1ZSwgaXNEZWxldGVkOiBmYWxzZSB9LCBbJ19pZCddKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJjcm9uXCIpO1xuICAgICAgICBjb25zdCBzdWJzY3JpYmVkSWRzID0gW107XG4gICAgICAgIGNvbnN0IHBvcHVsYXRlRmllbGRzID0geyBwYXRoOiAncGxhbklkJywgc2VsZWN0OiAndmFsaWRpdHkgY3JlYXRlZEF0JyB9O1xuICAgICAgICBpZiAoc3Vic2NyaWJlZFVzZXIgJiYgc3Vic2NyaWJlZFVzZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBvYmogb2Ygc3Vic2NyaWJlZFVzZXIpIHtcbiAgICAgICAgICAgICAgICBzdWJzY3JpYmVkSWRzLnB1c2gob2JqLl9pZCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXdhaXQgVXNlclN1YnNjcmlwdGlvbk1vZGVsLmZpbmQoeyB1c2VySWQ6IG9iai5faWQgfSwgKCdwbGFuSWQgdXNlcklkIGNyZWF0ZWRBdCcpKS5wb3B1bGF0ZShwb3B1bGF0ZUZpZWxkcykuc29ydCh7IFwiY3JlYXRlZEF0XCI6IC0xIH0pLmxpbWl0KDEpO1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvblswXSA9IHN1YnNjcmlwdGlvblswXS50b09iamVjdCgpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25bMF0ucGxhbklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYW5EYXRlID0gbmV3IERhdGUoc3Vic2NyaXB0aW9uWzBdLmNyZWF0ZWRBdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuZERhdGUgPSBtb21lbnQocGxhbkRhdGUpLmFkZCgocGFyc2VJbnQoc3Vic2NyaXB0aW9uWzBdLnBsYW5JZC52YWxpZGl0eSkpLCBcImRheXNcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydERhdGUgPSBtb21lbnQobmV3IERhdGUoKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGVuZERhdGUuZGlmZihzdGFydERhdGUsICdkYXlzJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3VsdCxcIlNcIitzdGFydERhdGUuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcImVcIitlbmREYXRlLmZvcm1hdChcIllZWVktTU0tRERcIiksXCJ2XCIrc3Vic2NyaXB0aW9uWzBdLnBsYW5JZC52YWxpZGl0eSxzdWJzY3JpcHRpb25bMF0uY3JlYXRlZEF0KVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBwbGFuRGF0ZS5zZXREYXRlKHBsYW5EYXRlLmdldERhdGUoKSArIHBhcnNlSW50KHN1YnNjcmlwdGlvblswXS5wbGFuSWQudmFsaWRpdHksIDEwKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA+PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyTW9kZWwsIHsgX2lkOiBvYmouX2lkIH0sIHsgaXNTdWJzY3JpYmVkOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShVc2VyR2lmdFBsYW4sIHsgdXNlcklkOiBvYmouX2lkLCBzdGF0dXM6ICdhY3RpdmUnIH0sIHsgc3RhdHVzOiAndXNlZCcgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNcIik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IENvbW1vbi51cGRhdGUoVXNlck1vZGVsLCB7IF9pZDogb2JqLl9pZCB9LCB7IGlzU3Vic2NyaWJlZDogZmFsc2UgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb21wbGV0ZUdhbWVJZlBsYXllckxlYXZlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHZhciBlbmREYXRlID0gbW9tZW50KG5ldyBEYXRlKCkpLnN1YnRyYWN0KDIsIFwibWludXRlc1wiKS50b0lTT1N0cmluZygpO1xuICAgICAgICB2YXIgZW5kRGF0ZTEgPSBtb21lbnQobmV3IERhdGUoKSkuc3VidHJhY3QoMSwgXCJtaW51dGVzXCIpLnRvSVNPU3RyaW5nKCk7XG5cbiAgICAgICAgY29uc3QgYWxsUGVuZGluZ0dhbWUgPSBhd2FpdCBDb21tb24ubGlzdChHYW1lLCB7IGNyZWF0ZWRBdDogeyAkbHQ6IGVuZERhdGUgfSwgc3RhdHVzOiBcInBlbmRpbmdcIiwgZ2FtZVR5cGU6IFwicHVibGljXCIgfSwgWydfaWQnXSk7XG4gICAgICAgIGZvciAobGV0IG9iaiBvZiBhbGxQZW5kaW5nR2FtZSkge1xuICAgICAgICAgICAgYXdhaXQgQ29tbW9uLnVwZGF0ZShHYW1lLCB7IF9pZDogb2JqLl9pZCB9LCB7IHN0YXR1czogXCJjb21wbGV0ZWRcIiB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFsbFBlbmRpbmdHYW1lUHJpdmF0ZSA9IGF3YWl0IENvbW1vbi5saXN0KEdhbWUsIHsgY3JlYXRlZEF0OiB7ICRsdDogZW5kRGF0ZTEgfSwgc3RhdHVzOiBcInBlbmRpbmdcIiwgZ2FtZVR5cGU6IFwicHJpdmF0ZVwiIH0sIFsnX2lkJ10pO1xuICAgICAgICBmb3IgKGxldCBvYmogb2YgYWxsUGVuZGluZ0dhbWVQcml2YXRlKSB7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKEdhbWUsIHsgX2lkOiBvYmouX2lkIH0sIHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsUGVuZGluZ0dhbWVQcml2YXRlTWF0Y2ggPSBhd2FpdCBDb21tb24ubGlzdChHYW1lLCB7IGNyZWF0ZWRBdDogeyAkbHQ6IGVuZERhdGUxIH0sIHN0YXR1czogXCJtYXRjaFwiLCBnYW1lVHlwZTogXCJwcml2YXRlXCIgfSwgWydfaWQnXSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiYWxsUGVuZGluZ0dhbWVQcml2YXRlTWF0Y2hcIixhbGxQZW5kaW5nR2FtZVByaXZhdGVNYXRjaClcbiAgICAgICAgZm9yIChsZXQgb2JqIG9mIGFsbFBlbmRpbmdHYW1lUHJpdmF0ZU1hdGNoKSB7XG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKEdhbWUsIHsgX2lkOiBvYmouX2lkIH0sIHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0pO1xuICAgICAgICAgICAvKiAgbGV0IGZpbmFsV2lubmVyID0gb2JqLnNlY1VzZXI7XG4gICAgICAgICAgICBsZXQgd2lubmVyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChmaW5hbFdpbm5lcik7XG4gICAgICAgICAgICBsZXQgd2FsbGV0YW1vdW50ID0gd2lubmVyRGV0YWlsLndhbGxldCA/IHdpbm5lckRldGFpbC53YWxsZXQgOiAwO1xuXG4gICAgICAgICAgIGxldCBuZXdXYWxsZXQgPSBwYXJzZUludCh3YWxsZXRhbW91bnQpICsgcGFyc2VJbnQob2JqLnpvbGVXaW4pICsgcGFyc2VJbnQob2JqLnpvbGVXaW4pO1xuXG5cbiAgICAgICAgICAgIGF3YWl0IFVzZXJNb2RlbC51cGRhdGVPbmUoeyBfaWQ6IGZpbmFsV2lubmVyIH0sIHsgJHNldDogeyB3YWxsZXQ6IG5ld1dhbGxldCB9IH0pO1xuICAgICAgICAgXG4gICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKEdhbWUsIHsgX2lkOiBvYmouX2lkIH0sIHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLHdpbm5lclVzZXI6IGZpbmFsV2lubmVyIH0pOyAqL1xuICAgICAgICB9XG4gICAgICAgXG5cblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFVzZXJTY2hlZHVsZXIoKTsiXX0=