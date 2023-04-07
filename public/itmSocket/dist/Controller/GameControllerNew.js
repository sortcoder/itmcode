"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _expressValidator = require("express-validator");

var _Chat = _interopRequireDefault(require("../Models/Chat"));

var _User = _interopRequireDefault(require("../Models/User"));

var _Game = _interopRequireDefault(require("../Models/Game"));

var _GameRound = _interopRequireDefault(require("../Models/GameRound"));

var _RequestHelper = require("../Helper/RequestHelper");

var _constants = _interopRequireDefault(require("../../resources/constants"));

var _CommanHelper = _interopRequireDefault(require("../Helper/CommanHelper"));

var _CommonDbController = _interopRequireDefault(require("../DbController/CommonDbController"));

var _GameRequest = _interopRequireDefault(require("../Models/GameRequest"));

var _Notifications = _interopRequireDefault(require("../Service/Notifications"));

var _winston = require("winston");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var params = ['title', 'description', 'image', "link", 'type'];

class GameController {
  constructor() {
    var _this = this;

    _defineProperty(this, "home", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var Users = yield _User.default.findById(_id);
          return (0, _RequestHelper.buildResult)(res, 200, Users);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "startGame", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var gameDetail = '';

          var _checkGame = yield _Game.default.findOne({
            status: "pending"
          }).where("firstUser").ne(_id);

          if (_checkGame) {
            var _gameDetail = yield _Game.default.findById(_checkGame._id);

            _gameDetail.secUser = _id;
            _gameDetail.status = "booked";

            _gameDetail.save();

            for (var i = 1; i <= 5; i++) {
              var gameRound = yield new _GameRound.default({
                game: _checkGame._id,
                roundName: "Round " + i,
                firstUser: _gameDetail.firstUser,
                secUser: _gameDetail.secUser,
                firstUserText: "X",
                secUserText: "O",
                winnerUser: null,
                status: "pending"
              }).save();
            }

            return (0, _RequestHelper.buildResult)(res, 200, _gameDetail);
          } else {
            var checkGame1 = yield _Game.default.findOne({
              status: "pending",
              firstUser: _id
            });

            if (!checkGame1) {
              var _gameDetail2 = yield new _Game.default({
                firstUser: _id,
                firstUserPoints: 0,
                secUserPoints: 0,
                zoleWin: 1,
                status: "pending"
              }).save();

              return (0, _RequestHelper.buildResult)(res, 200, _gameDetail2);
            }

            return (0, _RequestHelper.buildResult)(res, 200, checkGame1);
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "playGame", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(function* (req, res) {
        var date_ob = new Date();
        var {
          gameId
        } = req.body;
        var {
          _id
        } = req.user;
        var gameDetail = yield _Game.default.findById(gameId).populate(["firstUser", "secUser"]);
        var round = yield _GameRound.default.findOne({
          game: gameId,
          nextRoundStarted: "No"
        });
        var totaldraw = yield _GameRound.default.count({
          game: gameId,
          status: "draw"
        });
        var roundId = round ? round._id : '';

        if (roundId) {
          yield _this.checkGameStatus(gameId, roundId);
        }

        if (gameDetail.status == "pending") {
          var diffInMilliSeconds = Math.abs(new Date("Y-m-d H:i:s") - new Date(gameDetail.createdAt)) / 1000;
          /* 
          // calculate days
          const days = Math.floor(diffInMilliSeconds / 86400);
          diffInMilliSeconds -= days * 86400;
                
          // calculate hours
          const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
          diffInMilliSeconds -= hours * 3600;
          */
          // calculate minutes

          var minutes = Math.floor(diffInMilliSeconds / 60) % 60;
          diffInMilliSeconds -= minutes * 60;

          if (minutes > 2) {
            var _gameDetail3 = yield _Game.default.findById(checkGame._id);

            _gameDetail3.status = "rejected";

            _gameDetail3.save();

            var gameDetail1 = yield _GameRound.default.updateMany({
              game: _gameDetail3._id
            }, {
              $set: {
                status: "rejected"
              }
            });
            result = {
              message: "No One Is Available Please Try Again Later"
            };
            return (0, _RequestHelper.buildResult)(res, 301, result);
          }

          var result = {
            message: "Waiting for opponent to join..."
          };
          return (0, _RequestHelper.buildResult)(res, 300, result);
        } else if (gameDetail.status == "booked" || gameDetail.status == "running") {
          if (gameDetail.firstUser._id.toString() != _id.toString() && gameDetail.secUser._id.toString() != _id.toString()) {
            var _result2 = {
              message: "No One Is Available Please Try Again Later"
            };
            return (0, _RequestHelper.buildResult)(res, 300, _result2);
          }

          var _result = {
            message: "Game Started",
            gameData: gameDetail,
            roundData: round,
            totaldraw: totaldraw ? totaldraw : 0
          };
          var _status = 200;

          if (round && round.nextTurn) {
            _status = 505;
          }

          if (round && round.nextTurn && round.nextTurn.toString() == _id.toString()) {
            _status = 200;
          }

          return (0, _RequestHelper.buildResult)(res, _status, _result);
        } else {
          var _result3 = {
            message: "Game Started",
            gameData: gameDetail,
            roundData: round ? round : {}
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result3);
        }
      });

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "addMoves", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(function* (req, res) {
        var {
          gameId,
          moves,
          movestext,
          roundId
        } = req.body;
        var gameDetail = yield _Game.default.findById(gameId).populate(['firstUser', "secUser"]);
        var {
          _id
        } = req.user;
        var nextTurn = '';

        if (gameDetail.firstUser._id.toString() == _id.toString()) {
          nextTurn = gameDetail.secUser._id;
        } else {
          nextTurn = gameDetail.firstUser._id;
        }

        console.log("loginUserId", _id);
        var updateobject = {};

        if (moves == "m1") {
          updateobject = {
            m1: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m2") {
          updateobject = {
            m2: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m3") {
          updateobject = {
            m3: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m4") {
          updateobject = {
            m4: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m5") {
          updateobject = {
            m5: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m6") {
          updateobject = {
            m6: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m7") {
          updateobject = {
            m7: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m8") {
          updateobject = {
            m8: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m9") {
          updateobject = {
            m9: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        yield _GameRound.default.updateMany({
          _id: roundId
        }, {
          $set: updateobject
        });
        var round = yield _GameRound.default.findById(roundId);
        var winnerUserIdPre = yield _this.winnerLogic(round);

        if (round.m1 && round.m2 && round.m3 && round.m4 && round.m5 && round.m6 && round.m7 && round.m8 && round.m9) {
          var winnerUserId = yield _this.winnerLogic(round);

          if (winnerUserId) {
            yield _GameRound.default.updateMany({
              _id: roundId
            }, {
              $set: {
                winnerUser: winnerUserId,
                status: "completed"
              }
            });
          } else {
            yield _GameRound.default.updateMany({
              _id: roundId
            }, {
              $set: {
                winnerUser: _id,
                status: "draw"
              }
            });
          }

          var firstPoint = gameDetail.firstUserPoints;
          var secPoint = gameDetail.secUserPoints;

          if (gameDetail.firstUser._id.toString() == winnerUserId.toString()) {
            firstPoint = firstPoint + 1;
          } else if (gameDetail.secUser._id.toString() == winnerUserId.toString()) {
            secPoint = secPoint + 1;
          }

          yield _Game.default.updateMany({
            _id: gameId
          }, {
            $set: {
              firstUserPoints: firstPoint,
              secUserPoints: secPoint,
              status: "running"
            }
          });
          var otherRound = yield _GameRound.default.findOne({
            game: gameId,
            winnerUser: null
          });

          if (!otherRound) {
            var checkFinalWinner = yield _Game.default.findById(gameId);
            var finalWinner = '';
            var looseGameId = '';

            if (checkFinalWinner.firstUserPoints > checkFinalWinner.secUserPoints) {
              finalWinner = checkFinalWinner.firstUser;
              looseGameId = checkFinalWinner.secUser;
            } else if (checkFinalWinner.firstUserPoints < checkFinalWinner.secUserPoints) {
              finalWinner = checkFinalWinner.secUser;
              looseGameId = checkFinalWinner.firstUser;
            }

            if (finalWinner != "") {
              yield _Game.default.updateMany({
                _id: gameId
              }, {
                $set: {
                  winnerUser: finalWinner,
                  status: "completed"
                }
              });
            } else {
              yield _Game.default.updateMany({
                _id: gameId
              }, {
                $set: {
                  winnerUser: _id,
                  status: "draw"
                }
              });
            }

            var _messageText = 'Match is Draw';

            if (finalWinner != "") {
              var winnerDetail = yield _User.default.findById(finalWinner);
              var walletamount = winnerDetail.wallet ? winnerDetail.wallet : 0;
              var newWallet = parseInt(walletamount) + parseInt(checkFinalWinner.zoleWin) + parseInt(checkFinalWinner.zoleWin);
              yield _User.default.updateOne({
                _id: finalWinner
              }, {
                $set: {
                  wallet: newWallet
                }
              });

              if (finalWinner.toString() == _id.toString()) {
                _messageText = "You have Won The match";
                var message = "You have Won The match";
                var subject = "Game";
                var message1 = "You have Lose The match";
                yield _this.sendnotification(_id, message, subject, looseGameId);
                yield _this.sendnotification(_id, "you have won " + checkFinalWinner.zoleWin + " zoles", subject, looseGameId);
                yield _this.sendnotification(looseGameId, message1, subject, finalWinner);
              } else {
                _messageText = "You have Lose The match";
                var _message = "You have Lose The match";
                var _subject = "Game";
                var _message2 = "You have Won The match";
                yield _this.sendnotification(finalWinner, "you have won " + checkFinalWinner.zoleWin + " zoles", _subject, _id);
                yield _this.sendnotification(finalWinner, _message2, _subject, _id);
                yield _this.sendnotification(_id, _message, _subject, finalWinner);
              }
            } else {
              //first user amount refunded
              var firstUserDetail = yield _User.default.findById(checkFinalWinner.firstUser);
              var firstUserWallet = firstUserDetail.wallet ? firstUserDetail.wallet : 0;

              var _newWallet = parseInt(firstUserWallet) + parseInt(checkFinalWinner.zoleWin);

              yield _User.default.updateOne({
                _id: firstUserDetail._id
              }, {
                $set: {
                  wallet: _newWallet
                }
              }); //sec user amount refunded

              var secUserDetail = yield _User.default.findById(checkFinalWinner.secUser);
              var secUserWallet = secUserDetail.wallet ? secUserDetail.wallet : 0;
              var newWalletsec = parseInt(secUserWallet) + parseInt(checkFinalWinner.zoleWin);
              yield _User.default.updateOne({
                _id: secUserDetail._id
              }, {
                $set: {
                  wallet: newWalletsec
                }
              }); //send notification

              var _message3 = "Match is draw and zoles are refunded ";
              var _subject2 = "Game";
              yield _this.sendnotification(checkFinalWinner.firstUser, _message3, _subject2, checkFinalWinner.secUser);
              yield _this.sendnotification(checkFinalWinner.secUser, _message3, _subject2, checkFinalWinner.firstUser);
            }

            var gameDetails = yield _Game.default.findById(gameId);
            var _result4 = {
              message: _messageText,
              gameData: gameDetails,
              roundData: round
            };
            return (0, _RequestHelper.buildResult)(res, 606, _result4);
          }

          var messageText = 'Match is Draw';

          if (winnerUserId != "") {
            if (winnerUserId == _id) {
              messageText = "You have Won The match";
            } else {
              messageText = "You have Lose The match";
            }
          }

          var result = {
            message: messageText,
            gameData: gameDetail,
            roundData: round
          };
          return (0, _RequestHelper.buildResult)(res, 600, result);
        } else if (winnerUserIdPre != "") {
          if (winnerUserIdPre) {
            yield _GameRound.default.updateMany({
              _id: roundId
            }, {
              $set: {
                winnerUser: winnerUserIdPre,
                status: "completed"
              }
            });
          }

          var _firstPoint = gameDetail.firstUserPoints;
          var _secPoint = gameDetail.secUserPoints;

          if (gameDetail.firstUser._id.toString() == winnerUserIdPre.toString()) {
            _firstPoint = _firstPoint + 1;
          } else if (gameDetail.secUser._id.toString() == winnerUserIdPre.toString()) {
            _secPoint = _secPoint + 1;
          }

          yield _Game.default.updateMany({
            _id: gameId
          }, {
            $set: {
              firstUserPoints: _firstPoint,
              secUserPoints: _secPoint,
              status: "running"
            }
          });

          var _otherRound = yield _GameRound.default.findOne({
            game: gameId,
            winnerUser: null
          });

          if (!_otherRound) {
            var _checkFinalWinner = yield _Game.default.findById(gameId);

            var _finalWinner = '';
            var _looseGameId = '';

            if (_checkFinalWinner.firstUserPoints > _checkFinalWinner.secUserPoints) {
              _finalWinner = _checkFinalWinner.firstUser;
              _looseGameId = _checkFinalWinner.secUser;
            } else if (_checkFinalWinner.firstUserPoints < _checkFinalWinner.secUserPoints) {
              _finalWinner = _checkFinalWinner.secUser;
              _looseGameId = _checkFinalWinner.firstUser;
            }

            yield _Game.default.updateMany({
              _id: gameId
            }, {
              $set: {
                winnerUser: _finalWinner,
                status: "completed"
              }
            });
            var _messageText3 = 'Match is Draw';

            if (_finalWinner != "") {
              var _winnerDetail = _User.default.findById(_finalWinner);

              var _newWallet2 = _winnerDetail.wallet ? _winnerDetail.wallet : 0 + _checkFinalWinner.zoleWin;

              yield _User.default.updateOne({
                _id: _finalWinner
              }, {
                $set: {
                  wallet: _newWallet2
                }
              });

              if (_finalWinner == _id) {
                _messageText3 = "You have Won The match";
                var _message4 = "You have Won The match";
                var _subject3 = "Game";
                var _message5 = "You have Lose The match";
                yield _this.sendnotification(_looseGameId, _message5, _subject3, _finalWinner);
                yield _this.sendnotification(_id, _message4, _subject3, _looseGameId);
              } else {
                _messageText3 = "You have Lose The match";
                var _message6 = "You have Lose The match";
                var _message7 = "You have Won The match";
                var _subject4 = "Game";
                yield _this.sendnotification(_id, _message6, _subject4, _finalWinner);
                yield _this.sendnotification(_finalWinner, _message7, _subject4, _looseGameId);
              }
            } else {
              var _message8 = "match is draw";
              var _subject5 = "Game";
              yield _this.sendnotification(gameDetail.firstUser, _message8, _subject5, gameDetail.secUser);
              yield _this.sendnotification(gameDetail.secUser, _message8, _subject5, gameDetail.firstUser);
            }

            var _gameDetails = yield _Game.default.findById(gameId);

            var _result6 = {
              message: _messageText3,
              gameData: _gameDetails,
              roundData: round
            };
            return (0, _RequestHelper.buildResult)(res, 606, _result6);
          }

          var _messageText2 = 'result';

          if (winnerUserIdPre.toString() == _id.toString()) {
            _messageText2 = "You have Won The match";
          } else {
            _messageText2 = "You have Lose The match";
          }

          var _result5 = {
            message: _messageText2,
            gameData: gameDetail,
            roundData: round
          };
          return (0, _RequestHelper.buildResult)(res, 600, _result5);
        } else {
          var _result7 = {
            message: "Game Running",
            gameData: gameDetail,
            roundData: round
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result7);
        }
      });

      return function (_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "winnerLogic", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(function* (round) {
        var winnertext = '';
        /*   if (round.m1 && round.m2 && round.m3 && round.m4 && round.m5 && round.m6 && round.m7 && round.m8 && round.m9) { */

        if (round.m1 == round.m2 && round.m2 == round.m3 && round.m1 && round.m2 && round.m3) {
          winnertext = round.m1;
        }

        if (round.m1 == round.m4 && round.m4 == round.m7 && round.m1 && round.m4 && round.m7) {
          winnertext = round.m1;
        }

        if (round.m2 == round.m5 && round.m5 == round.m8 && round.m3 && round.m6 && round.m8) {
          winnertext = round.m2;
        }

        if (round.m3 == round.m6 && round.m6 == round.m9 && round.m3 && round.m6 && round.m9) {
          winnertext = round.m3;
        }

        if (round.m4 == round.m5 && round.m5 == round.m6 && round.m4 && round.m5 && round.m6) {
          winnertext = round.m4;
        }

        if (round.m7 == round.m8 && round.m8 == round.m9 && round.m7 && round.m8 && round.m9) {
          winnertext = round.m7;
        }

        if (round.m1 == round.m5 && round.m5 == round.m9 && round.m1 && round.m5 && round.m9) {
          winnertext = round.m1;
        }

        if (round.m3 == round.m5 && round.m5 == round.m7 && round.m3 && round.m5 && round.m7) {
          winnertext = round.m3;
        }
        /*    } */


        var winnerUserid = '';

        if (winnertext == round.firstUserText) {
          winnerUserid = round.firstUser;
        } else if (winnertext == '') {
          winnerUserid = '';
        } else {
          winnerUserid = round.secUser;
        }

        return winnerUserid;
      });

      return function (_x9) {
        return _ref5.apply(this, arguments);
      };
    }());

    _defineProperty(this, "startGamePrivate", /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            zole
          } = req.body;

          if (!zole || zole == 0) {
            return (0, _RequestHelper.buildResult)(res, 500, {
              message: "Please Provide Zole"
            });
          }

          var loginUser = yield _User.default.findById(_id);

          if (loginUser.wallet < zole) {
            return (0, _RequestHelper.buildResult)(res, 500, {
              message: "Insufficient zole"
            });
          }

          var checkGame1 = yield _Game.default.findOne({
            status: "pending",
            firstUser: _id,
            gameType: "private"
          });

          var autoCode = _CommanHelper.default.randomNo(11111111, 99999999);

          if (!checkGame1) {
            var gameDetail = yield new _Game.default({
              firstUser: _id,
              firstUserPoints: 0,
              secUserPoints: 0,
              zoleWin: zole,
              gameType: "private",
              gameCode: autoCode,
              status: "pending"
            }).save();
            return (0, _RequestHelper.buildResult)(res, 200, gameDetail);
          }

          return (0, _RequestHelper.buildResult)(res, 200, checkGame1);
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x10, _x11) {
        return _ref6.apply(this, arguments);
      };
    }());

    _defineProperty(this, "joinGamePrivate", /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            code
          } = req.body;

          var _checkGame2 = yield _Game.default.findOne({
            status: "pending",
            gameCode: code
          }).where("firstUser").ne(_id);

          var loginUser = yield _User.default.findById(_id);

          if (loginUser.wallet < _checkGame2.zoleWin) {
            return (0, _RequestHelper.buildResult)(res, 500, {
              message: "Insufficient zole"
            });
          }

          yield _User.default.updateOne({
            _id: requestId
          }, {
            $set: {
              status: status
            }
          });

          if (_checkGame2) {
            var gameDetail = yield _Game.default.findById(_checkGame2._id);
            gameDetail.secUser = _id;
            gameDetail.status = "booked";
            gameDetail.save();
            var firstUsers = yield _User.default.findById(_checkGame2.firstUser);
            firstUsers.wallet = parseInt(firstUsers.wallet) - _checkGame2.zoleWin;
            firstUsers.save();
            var secUsers = yield _User.default.findById(_id);
            secUsers.wallet = parseInt(secUsers.wallet) - _checkGame2.zoleWin;
            secUsers.save();
            var subject = "Game";
            var message = _checkGame2.zoleWin + " zoles is duducted from your wallet";
            yield _this.sendnotification(_checkGame2.firstUser, message, subject, _id);
            yield _this.sendnotification(_id, message, subject, _checkGame2.firstUser);

            for (var i = 1; i <= 5; i++) {
              var gameRound = yield new _GameRound.default({
                game: _checkGame2._id,
                roundName: "Round " + i,
                firstUser: gameDetail.firstUser,
                secUser: gameDetail.secUser,
                firstUserText: "X",
                secUserText: "O",
                winnerUser: null,
                status: "pending"
              }).save();
            }

            return (0, _RequestHelper.buildResult)(res, 200, gameDetail);
          } else {
            return (0, _RequestHelper.buildResult)(res, 500, {
              message: "invalid Code"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x12, _x13) {
        return _ref7.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendRequest", /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            receiver,
            gameId
          } = req.body;
          console.log(receiver, "--", gameId);

          var _checkGame3 = yield _GameRequest.default.findOne({
            status: "pending",
            sender: _id,
            receiver: receiver,
            game: gameId
          });

          if (_checkGame3) {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "request already sent"
            });
          } else {
            var gamereq = yield new _GameRequest.default({
              status: "pending",
              sender: _id,
              receiver: receiver,
              game: gameId
            }).save();
            var message = "send a request for play game";
            var subject = "Game";
            yield _this.sendnotification(receiver, message, subject, _id);
            return (0, _RequestHelper.buildResult)(res, 200, gamereq);
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x14, _x15) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "requestList", /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user; // const { receiver,gameId } = req.body;

          console.log(_id);

          var _checkGame4 = yield _GameRequest.default.find({
            status: "pending",
            receiver: _id
          }).populate(["sender", "receiver", "game"]);

          if (_checkGame4) {
            return (0, _RequestHelper.buildResult)(res, 200, _checkGame4);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "not found"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x16, _x17) {
        return _ref9.apply(this, arguments);
      };
    }());

    _defineProperty(this, "acceptRequest", /*#__PURE__*/function () {
      var _ref10 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            status: _status2,
            requestId: _requestId
          } = req.body;

          var _checkGame5 = yield _GameRequest.default.findOne({
            status: "pending",
            _id: _requestId
          });

          console.log(_checkGame5);

          if (_checkGame5) {
            yield _GameRequest.default.updateOne({
              _id: _requestId
            }, {
              $set: {
                status: _status2
              }
            });

            if (_status2 == "accepted") {
              var gameDetail = yield _Game.default.findById(_checkGame5.game);
              gameDetail.secUser = _id;
              gameDetail.status = "booked";
              gameDetail.save();

              for (var i = 1; i <= 5; i++) {
                var gameRound = yield new _GameRound.default({
                  game: gameDetail._id,
                  roundName: "Round " + i,
                  firstUser: gameDetail.firstUser,
                  secUser: gameDetail.secUser,
                  firstUserText: "X",
                  secUserText: "O",
                  winnerUser: null,
                  status: "pending"
                }).save();
              }

              var message = "accept your request for play game";
              var subject = "Game";
              yield _this.sendnotification(gameDetail.firstUser, message, subject, gameDetail.secUser);
            } else {
              var _gameDetail4 = yield _Game.default.findById(_checkGame5.game);

              var _message9 = "reject your request for play game";
              var _subject6 = "Game";
              console.log(_gameDetail4);
              yield _this.sendnotification(_gameDetail4.firstUser, _message9, _subject6, _id);
            }

            var checkGame1 = yield _GameRequest.default.findOne({
              _id: _requestId
            });
            return (0, _RequestHelper.buildResult)(res, 200, checkGame1);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "Room Code is Invalid"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x18, _x19) {
        return _ref10.apply(this, arguments);
      };
    }());

    _defineProperty(this, "quitGame", /*#__PURE__*/function () {
      var _ref11 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            gameId
          } = req.body;

          var _checkGame6 = yield _Game.default.findById(gameId);

          if (_checkGame6) {
            yield _GameRound.default.updateMany({
              game: gameId
            }, {
              $set: {
                status: "completed"
              }
            });
            yield _Game.default.updateMany({
              _id: gameId
            }, {
              $set: {
                status: "completed"
              }
            });
            return (0, _RequestHelper.buildResult)(res, 200, _checkGame6);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "not found"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x20, _x21) {
        return _ref11.apply(this, arguments);
      };
    }());

    _defineProperty(this, "gameHistory", /*#__PURE__*/function () {
      var _ref12 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            gameId
          } = req.body;

          var _checkGame7 = yield _Game.default.find({
            isDeleted: false
          }).populate(["firstUser", "secUser"]);

          var result = [];

          if (_checkGame7) {
            console.log(_checkGame7);

            for (var games of _checkGame7) {
              var tmp = {};
              tmp.game = games;
              var gameround = yield _GameRound.default.find({
                game: games._id
              }).populate(["firstUser", "secUser"]);
              tmp.rounds = gameround;
              result.push(tmp);
            }

            return (0, _RequestHelper.buildResult)(res, 200, result);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "not found"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x22, _x23) {
        return _ref12.apply(this, arguments);
      };
    }());

    _defineProperty(this, "gameDetail", /*#__PURE__*/function () {
      var _ref13 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            gameId
          } = req.body;

          var _checkGame8 = yield _Game.default.findOne({
            isDeleted: false,
            _id: gameId
          });

          var result = {};

          if (_checkGame8) {
            console.log(_checkGame8);
            result = _checkGame8;
            var gameround = yield _GameRound.default.find({
              game: _checkGame8._id
            });
            result.rounds = gameround;
            return (0, _RequestHelper.buildResult)(res, 200, result);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "not found"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x24, _x25) {
        return _ref13.apply(this, arguments);
      };
    }());

    _defineProperty(this, "startNextRound", /*#__PURE__*/function () {
      var _ref14 = _asyncToGenerator(function* (req, res) {
        var {
          gameId,
          roundId
        } = req.body;

        try {
          var gameRounds = yield _GameRound.default.updateOne({
            _id: roundId
          }, {
            $set: {
              nextRoundStarted: "Yes"
            }
          });
          var currentRound = yield _GameRound.default.findById(roundId);
          var round = yield _GameRound.default.findOne({
            game: gameId,
            nextRoundStarted: "No"
          });

          if (round) {
            if (currentRound.winnerUser) {
              yield _GameRound.default.updateOne({
                _id: round._id
              }, {
                $set: {
                  nextTurn: currentRound.winnerUser
                }
              });
            } else {
              yield _GameRound.default.updateOne({
                _id: round._id
              }, {
                $set: {
                  nextTurn: currentRound.firstUser
                }
              });
            }
          }

          var result = {
            message: "Game Running",
            gameData: gameRounds
          };
          return (0, _RequestHelper.buildResult)(res, 200, result);
        } catch (error) {
          return (0, _RequestHelper.buildResult)(res, 500, error);
        }
      });

      return function (_x26, _x27) {
        return _ref14.apply(this, arguments);
      };
    }());

    _defineProperty(this, "checkGameStatus", /*#__PURE__*/function () {
      var _ref15 = _asyncToGenerator(function* (gameId, roundId) {
        var gameDetailAll = yield _Game.default.find({
          isDeleted: false,
          _id: gameId
        }).populate(["firstUser", "secUser"]);

        for (var games of gameDetailAll) {
          if (games.status == "running" || games.status == "booked") {
            var rounds = yield _GameRound.default.findById(roundId);

            if (rounds) {
              var diffInMilliSeconds = Math.abs(new Date() - new Date(rounds.updatedAt)) / 1000;
              var minutes = Math.floor(diffInMilliSeconds / 60) % 60;
              diffInMilliSeconds -= minutes * 60;
              console.log("min", minutes);

              if (minutes > 1) {
                if (rounds.nextTurn) {
                  if (rounds.nextTurn == rounds.firstUser.toString()) {
                    var gameDetail = yield _Game.default.findById(games._id);
                    yield _Game.default.updateOne({
                      _id: games._id
                    }, {
                      $set: {
                        status: "completed",
                        winnerUser: rounds.secUser
                      }
                    });
                    yield _GameRound.default.updateMany({
                      game: games._id
                    }, {
                      $set: {
                        status: "completed",
                        winnerUser: rounds.secUser
                      }
                    });
                    var userDetail = yield _User.default.findById(rounds.secUser);
                    var walletamount = userDetail.wallet ? userDetail.wallet + gameDetail.zoleWin : gameDetail.zoleWin;
                    var message = "You have Won The match";
                    var message1 = "You have Lose The match";
                    var subject = "Game";
                    yield _this.sendnotification(gameDetail.secUser, message, subject, gameDetail.firstUser);
                    yield _this.sendnotification(gameDetail.firstUser, message1, subject, gameDetail.secUser);
                    yield _User.default.updateOne({
                      _id: userDetail._id
                    }, {
                      $set: {
                        wallet: walletamount
                      }
                    });
                  } else {
                    console.log("else", minutes);

                    var _gameDetail5 = yield _Game.default.findById(games._id);

                    yield _Game.default.updateOne({
                      _id: games._id
                    }, {
                      $set: {
                        status: "completed",
                        winnerUser: rounds.firstUser
                      }
                    });
                    yield _GameRound.default.updateMany({
                      game: games._id
                    }, {
                      $set: {
                        status: "completed",
                        winnerUser: rounds.firstUser
                      }
                    });

                    var _userDetail = yield _User.default.findById(rounds.firstUser);

                    var _walletamount = _userDetail.wallet ? _userDetail.wallet + _gameDetail5.zoleWin : _gameDetail5.zoleWin;

                    var _message10 = "You have Won The match";
                    var _message11 = "You have Lose The match";
                    var _subject7 = "Game";
                    yield _this.sendnotification(_gameDetail5.firstUser, _message10, _subject7, _gameDetail5.secUser);
                    yield _this.sendnotification(_gameDetail5.secUser, _message11, _subject7, _gameDetail5.firstUser);
                    yield _User.default.updateOne({
                      _id: _userDetail._id
                    }, {
                      $set: {
                        wallet: _walletamount
                      }
                    });
                  }
                } else {
                  console.log("otuer", minutes);

                  var _gameDetail6 = yield _Game.default.findById(games._id);
                  /*  let gameDetail = await Game.findById(games._id);
                             gameDetail.winner =rounds.firstUser;
                   gameDetail.status = "completed";
                   gameDetail.save(); */


                  yield _Game.default.updateOne({
                    _id: games._id
                  }, {
                    $set: {
                      status: "completed",
                      winnerUser: rounds.secUser
                    }
                  });
                  yield _GameRound.default.updateMany({
                    game: games._id
                  }, {
                    $set: {
                      status: "completed",
                      winnerUser: rounds.secUser
                    }
                  });

                  var _userDetail2 = yield _User.default.findById(rounds.secUser);

                  var _walletamount2 = _userDetail2.wallet ? _userDetail2.wallet + _gameDetail6.zoleWin : _gameDetail6.zoleWin;

                  var _message12 = "You have Lose The match";
                  var _message13 = "You have Won The match";
                  var _subject8 = "Game";
                  yield _this.sendnotification(_gameDetail6.firstUser, _message12, _subject8, _gameDetail6.secUser);
                  yield _this.sendnotification(_gameDetail6.secUser, _message13, _subject8, _gameDetail6.firstUser);
                  yield _User.default.updateOne({
                    _id: _userDetail2._id
                  }, {
                    $set: {
                      wallet: _walletamount2
                    }
                  });
                }
              }
            }
          }
        }
      });

      return function (_x28, _x29) {
        return _ref15.apply(this, arguments);
      };
    }());

    _defineProperty(this, "deleteGame", /*#__PURE__*/function () {
      var _ref16 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            _id
          } = req.user;
          var {
            gameId
          } = req.body;

          var _checkGame9 = yield _Game.default.findOne({
            isDeleted: false,
            _id: gameId
          });

          var result = {
            "message": "deleted Successfully"
          };

          if (_checkGame9) {
            console.log(_checkGame9);
            yield _Game.default.deleteOne({
              _id: gameId
            });
            yield _GameRound.default.deleteMany({
              game: gameId
            });
            return (0, _RequestHelper.buildResult)(res, 200);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
              "message": "not found"
            });
          }
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x30, _x31) {
        return _ref16.apply(this, arguments);
      };
    }());

    _defineProperty(this, "sendnotification", /*#__PURE__*/function () {
      var _ref17 = _asyncToGenerator(function* (userId, message, subject, loginUser) {
        var firstUserDetail = yield _User.default.findById(userId);

        if (firstUserDetail.deviceToken) {
          var notificationData = {
            toUser: firstUserDetail._id,
            fromUser: loginUser,
            title: subject,
            message: message,
            deviceToken: firstUserDetail.deviceToken,
            createdBy: loginUser,
            updatedBy: loginUser
          };
          yield _Notifications.default.sendNotification(notificationData);
        }
      });

      return function (_x32, _x33, _x34, _x35) {
        return _ref17.apply(this, arguments);
      };
    }());

    _defineProperty(this, "enterInGame", /*#__PURE__*/function () {
      var _ref18 = _asyncToGenerator(function* (req, res) {
        try {
          var {
            gameId
          } = req.body;
          var {
            _id
          } = req.user;
          var gameDetail = yield _Game.default.findById(gameId);

          if (gameDetail.firstUser.toString() == _id.toString()) {
            yield _Game.default.updateOne({
              _id: gameId
            }, {
              $set: {
                firstUserStart: 1
              }
            });
          } else {
            yield _Game.default.updateOne({
              _id: gameId
            }, {
              $set: {
                secUserStart: 1
              }
            });
          }

          var gameDetaila = yield _Game.default.findById(gameId);

          if (gameDetaila.firstUserStart == 1 && gameDetaila.firstUserStart == 2) {
            yield _Game.default.updateOne({
              _id: gameId
            }, {
              $set: {
                status: "running"
              }
            });
          }

          return (0, _RequestHelper.buildResult)(res, 200, {
            "status": 200,
            "message": "updated Successfully"
          });
        } catch (error) {
          // Returns unspecified exceptions
          return (0, _RequestHelper.buildResult)(res, 500, {}, {}, error);
        }
      });

      return function (_x36, _x37) {
        return _ref18.apply(this, arguments);
      };
    }());
  }

}

var _default = new GameController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0dhbWVDb250cm9sbGVyTmV3LmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIkdhbWVDb250cm9sbGVyIiwicmVxIiwicmVzIiwiX2lkIiwidXNlciIsIlVzZXJzIiwiVXNlciIsImZpbmRCeUlkIiwiZXJyb3IiLCJnYW1lRGV0YWlsIiwiY2hlY2tHYW1lIiwiR2FtZSIsImZpbmRPbmUiLCJzdGF0dXMiLCJ3aGVyZSIsIm5lIiwic2VjVXNlciIsInNhdmUiLCJpIiwiZ2FtZVJvdW5kIiwiR2FtZVJvdW5kIiwiZ2FtZSIsInJvdW5kTmFtZSIsImZpcnN0VXNlciIsImZpcnN0VXNlclRleHQiLCJzZWNVc2VyVGV4dCIsIndpbm5lclVzZXIiLCJjaGVja0dhbWUxIiwiZmlyc3RVc2VyUG9pbnRzIiwic2VjVXNlclBvaW50cyIsInpvbGVXaW4iLCJkYXRlX29iIiwiRGF0ZSIsImdhbWVJZCIsImJvZHkiLCJwb3B1bGF0ZSIsInJvdW5kIiwibmV4dFJvdW5kU3RhcnRlZCIsInRvdGFsZHJhdyIsImNvdW50Iiwicm91bmRJZCIsImNoZWNrR2FtZVN0YXR1cyIsImRpZmZJbk1pbGxpU2Vjb25kcyIsIk1hdGgiLCJhYnMiLCJjcmVhdGVkQXQiLCJtaW51dGVzIiwiZmxvb3IiLCJnYW1lRGV0YWlsMSIsInVwZGF0ZU1hbnkiLCIkc2V0IiwicmVzdWx0IiwibWVzc2FnZSIsInRvU3RyaW5nIiwiZ2FtZURhdGEiLCJyb3VuZERhdGEiLCJuZXh0VHVybiIsIm1vdmVzIiwibW92ZXN0ZXh0IiwiY29uc29sZSIsImxvZyIsInVwZGF0ZW9iamVjdCIsIm0xIiwibTIiLCJtMyIsIm00IiwibTUiLCJtNiIsIm03IiwibTgiLCJtOSIsIndpbm5lclVzZXJJZFByZSIsIndpbm5lckxvZ2ljIiwid2lubmVyVXNlcklkIiwiZmlyc3RQb2ludCIsInNlY1BvaW50Iiwib3RoZXJSb3VuZCIsImNoZWNrRmluYWxXaW5uZXIiLCJmaW5hbFdpbm5lciIsImxvb3NlR2FtZUlkIiwibWVzc2FnZVRleHQiLCJ3aW5uZXJEZXRhaWwiLCJ3YWxsZXRhbW91bnQiLCJ3YWxsZXQiLCJuZXdXYWxsZXQiLCJwYXJzZUludCIsInVwZGF0ZU9uZSIsInN1YmplY3QiLCJtZXNzYWdlMSIsInNlbmRub3RpZmljYXRpb24iLCJmaXJzdFVzZXJEZXRhaWwiLCJmaXJzdFVzZXJXYWxsZXQiLCJzZWNVc2VyRGV0YWlsIiwic2VjVXNlcldhbGxldCIsIm5ld1dhbGxldHNlYyIsImdhbWVEZXRhaWxzIiwid2lubmVydGV4dCIsIndpbm5lclVzZXJpZCIsInpvbGUiLCJsb2dpblVzZXIiLCJnYW1lVHlwZSIsImF1dG9Db2RlIiwiQ29tbWFuSGVscGVyIiwicmFuZG9tTm8iLCJnYW1lQ29kZSIsImNvZGUiLCJyZXF1ZXN0SWQiLCJmaXJzdFVzZXJzIiwic2VjVXNlcnMiLCJyZWNlaXZlciIsIkdhbWVSZXF1ZXN0Iiwic2VuZGVyIiwiZ2FtZXJlcSIsImZpbmQiLCJpc0RlbGV0ZWQiLCJnYW1lcyIsInRtcCIsImdhbWVyb3VuZCIsInJvdW5kcyIsInB1c2giLCJnYW1lUm91bmRzIiwiY3VycmVudFJvdW5kIiwiZ2FtZURldGFpbEFsbCIsInVwZGF0ZWRBdCIsInVzZXJEZXRhaWwiLCJkZWxldGVPbmUiLCJkZWxldGVNYW55IiwidXNlcklkIiwiZGV2aWNlVG9rZW4iLCJub3RpZmljYXRpb25EYXRhIiwidG9Vc2VyIiwiZnJvbVVzZXIiLCJ0aXRsZSIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsIk5vdGlmaWNhdGlvbnMiLCJzZW5kTm90aWZpY2F0aW9uIiwiZmlyc3RVc2VyU3RhcnQiLCJzZWNVc2VyU3RhcnQiLCJnYW1lRGV0YWlsYSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBRUEsSUFBTUEsTUFBTSxHQUFHLENBQUMsT0FBRCxFQUFVLGFBQVYs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QUFDWjtBQUNBLGlCQUFPLGdDQUFZTixHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEVBQXRCLEVBQTBCLEVBQTFCLEVBQThCTSxLQUE5QixDQUFQO0FBQ0g7QUFFSixPQXo4QmdCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBZzlCTixJQUFJUixjQUFKLEUiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IHZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICdleHByZXNzLXZhbGlkYXRvcic7XG5pbXBvcnQgQ2hhdCBmcm9tICcuLi9Nb2RlbHMvQ2hhdCc7XG5pbXBvcnQgVXNlciBmcm9tICcuLi9Nb2RlbHMvVXNlcic7XG5pbXBvcnQgR2FtZSBmcm9tICcuLi9Nb2RlbHMvR2FtZSc7XG5pbXBvcnQgR2FtZVJvdW5kIGZyb20gJy4uL01vZGVscy9HYW1lUm91bmQnO1xuXG5pbXBvcnQgeyBidWlsZFJlc3VsdCB9IGZyb20gJy4uL0hlbHBlci9SZXF1ZXN0SGVscGVyJztcblxuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi8uLi9yZXNvdXJjZXMvY29uc3RhbnRzJztcbmltcG9ydCBDb21tYW5IZWxwZXIgZnJvbSAnLi4vSGVscGVyL0NvbW1hbkhlbHBlcic7XG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0RiQ29udHJvbGxlci9Db21tb25EYkNvbnRyb2xsZXInO1xuaW1wb3J0IEdhbWVSZXF1ZXN0IGZyb20gJy4uL01vZGVscy9HYW1lUmVxdWVzdCc7XG5pbXBvcnQgTm90aWZpY2F0aW9ucyBmcm9tICcuLi9TZXJ2aWNlL05vdGlmaWNhdGlvbnMnO1xuaW1wb3J0IHsgZXhpdE9uRXJyb3IgfSBmcm9tICd3aW5zdG9uJztcblxuY29uc3QgcGFyYW1zID0gWyd0aXRsZScsICdkZXNjcmlwdGlvbicsICdpbWFnZScsIFwibGlua1wiLCAndHlwZSddO1xuXG5jbGFzcyBHYW1lQ29udHJvbGxlciB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgQmFubmVyXG4gICAgICovXG4gICAgaG9tZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBsZXQgVXNlcnMgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKF9pZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgVXNlcnMpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExpc3Qgb2YgYWxsIHRoZSBiYW5uZXJzXG4gICAgICovXG4gICAgc3RhcnRHYW1lID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9ICcnO1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IHN0YXR1czogXCJwZW5kaW5nXCIgfSkud2hlcmUoXCJmaXJzdFVzZXJcIikubmUoX2lkKVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoY2hlY2tHYW1lLl9pZCk7XG4gICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zZWNVc2VyID0gX2lkO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc3RhdHVzID0gXCJib29rZWRcIjtcbiAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZVJvdW5kID0gYXdhaXQgbmV3IEdhbWVSb3VuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lOiBjaGVja0dhbWUuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm91bmROYW1lOiBcIlJvdW5kIFwiICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlcjogZ2FtZURldGFpbC5maXJzdFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNVc2VyOiBnYW1lRGV0YWlsLnNlY1VzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXJUZXh0OiBcIlhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY1VzZXJUZXh0OiBcIk9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbm5lclVzZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiXG5cbiAgICAgICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgZ2FtZURldGFpbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tHYW1lMSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IHN0YXR1czogXCJwZW5kaW5nXCIsIGZpcnN0VXNlcjogX2lkIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaGVja0dhbWUxKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgbmV3IEdhbWUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXJQb2ludHM6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgem9sZVdpbjogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdhbWVEZXRhaWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGNoZWNrR2FtZTEpO1xuICAgICAgICAgICAgfVxuXG5cblxuXG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcGxheUdhbWUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgbGV0IGRhdGVfb2IgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zdCB7IGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgY29uc3QgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKS5wb3B1bGF0ZShbXCJmaXJzdFVzZXJcIiwgXCJzZWNVc2VyXCJdKTtcbiAgICAgICAgY29uc3Qgcm91bmQgPSBhd2FpdCBHYW1lUm91bmQuZmluZE9uZSh7IGdhbWU6IGdhbWVJZCwgbmV4dFJvdW5kU3RhcnRlZDogXCJOb1wiIH0pO1xuICAgICAgICBjb25zdCB0b3RhbGRyYXcgPSBhd2FpdCBHYW1lUm91bmQuY291bnQoeyBnYW1lOiBnYW1lSWQsIHN0YXR1czogXCJkcmF3XCIgfSk7XG4gICAgICAgIGxldCByb3VuZElkID0gcm91bmQgPyByb3VuZC5faWQgOiAnJztcblxuICAgICAgICBpZiAocm91bmRJZCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jaGVja0dhbWVTdGF0dXMoZ2FtZUlkLCByb3VuZElkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChnYW1lRGV0YWlsLnN0YXR1cyA9PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgbGV0IGRpZmZJbk1pbGxpU2Vjb25kcyA9IE1hdGguYWJzKG5ldyBEYXRlKFwiWS1tLWQgSDppOnNcIikgLSBuZXcgRGF0ZShnYW1lRGV0YWlsLmNyZWF0ZWRBdCkpIC8gMTAwMDtcbiAgICAgICAgICAgIC8qIFxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGRheXNcbiAgICAgICAgICAgIGNvbnN0IGRheXMgPSBNYXRoLmZsb29yKGRpZmZJbk1pbGxpU2Vjb25kcyAvIDg2NDAwKTtcbiAgICAgICAgICAgIGRpZmZJbk1pbGxpU2Vjb25kcyAtPSBkYXlzICogODY0MDA7XG4gICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgaG91cnNcbiAgICAgICAgICAgIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihkaWZmSW5NaWxsaVNlY29uZHMgLyAzNjAwKSAlIDI0O1xuICAgICAgICAgICAgZGlmZkluTWlsbGlTZWNvbmRzIC09IGhvdXJzICogMzYwMDtcbiAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBtaW51dGVzXG4gICAgICAgICAgICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihkaWZmSW5NaWxsaVNlY29uZHMgLyA2MCkgJSA2MDtcbiAgICAgICAgICAgIGRpZmZJbk1pbGxpU2Vjb25kcyAtPSBtaW51dGVzICogNjA7XG5cbiAgICAgICAgICAgIGlmIChtaW51dGVzID4gMikge1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChjaGVja0dhbWUuX2lkKTtcblxuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc3RhdHVzID0gXCJyZWplY3RlZFwiO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsMSA9IGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZURldGFpbC5faWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJyZWplY3RlZFwiIH0gfSk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTm8gT25lIElzIEF2YWlsYWJsZSBQbGVhc2UgVHJ5IEFnYWluIExhdGVyXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMzAxLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiV2FpdGluZyBmb3Igb3Bwb25lbnQgdG8gam9pbi4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAzMDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZ2FtZURldGFpbC5zdGF0dXMgPT0gXCJib29rZWRcIiB8fCBnYW1lRGV0YWlsLnN0YXR1cyA9PSBcInJ1bm5pbmdcIikge1xuXG4gICAgICAgICAgICBpZiAoZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkLnRvU3RyaW5nKCkgIT0gX2lkLnRvU3RyaW5nKCkgJiYgZ2FtZURldGFpbC5zZWNVc2VyLl9pZC50b1N0cmluZygpICE9IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJObyBPbmUgSXMgQXZhaWxhYmxlIFBsZWFzZSBUcnkgQWdhaW4gTGF0ZXJcIlxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDMwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkdhbWUgU3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICAgICAgdG90YWxkcmF3OiB0b3RhbGRyYXcgPyB0b3RhbGRyYXcgOiAwLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHN0YXR1cz0yMDA7XG4gICAgICAgICAgICBpZihyb3VuZCAmJiByb3VuZC5uZXh0VHVybilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgc3RhdHVzPTUwNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgXG4gICAgICAgICAgICBpZihyb3VuZCAmJiByb3VuZC5uZXh0VHVybiAmJiByb3VuZC5uZXh0VHVybi50b1N0cmluZygpPT1faWQudG9TdHJpbmcoKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzdGF0dXM9MjAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgc3RhdHVzLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkdhbWUgU3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQgPyByb3VuZCA6IHt9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgYWRkTW92ZXMgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgeyBnYW1lSWQsIG1vdmVzLCBtb3Zlc3RleHQsIHJvdW5kSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICBjb25zdCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lSWQpLnBvcHVsYXRlKFsnZmlyc3RVc2VyJywgXCJzZWNVc2VyXCJdKTtcbiAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICBsZXQgbmV4dFR1cm4gPSAnJztcblxuXG5cbiAgICAgICAgaWYgKGdhbWVEZXRhaWwuZmlyc3RVc2VyLl9pZC50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICBuZXh0VHVybiA9IGdhbWVEZXRhaWwuc2VjVXNlci5faWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXh0VHVybiA9IGdhbWVEZXRhaWwuZmlyc3RVc2VyLl9pZDtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcImxvZ2luVXNlcklkXCIsIF9pZCk7XG4gICAgICAgIGxldCB1cGRhdGVvYmplY3QgPSB7fTtcbiAgICAgICAgaWYgKG1vdmVzID09IFwibTFcIikge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtMTogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtMlwiKSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG0yOiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm0zXCIpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTM6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibTRcIikge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtNDogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtNVwiKSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG01OiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm02XCIpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTY6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibTdcIikge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtNzogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtOFwiKSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG04OiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm05XCIpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTk6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB1cGRhdGVvYmplY3QgfSk7XG4gICAgICAgIGNvbnN0IHJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRCeUlkKHJvdW5kSWQpO1xuICAgICAgICBjb25zdCB3aW5uZXJVc2VySWRQcmUgPSBhd2FpdCB0aGlzLndpbm5lckxvZ2ljKHJvdW5kKTtcblxuICAgICAgICBpZiAocm91bmQubTEgJiYgcm91bmQubTIgJiYgcm91bmQubTMgJiYgcm91bmQubTQgJiYgcm91bmQubTUgJiYgcm91bmQubTYgJiYgcm91bmQubTcgJiYgcm91bmQubTggJiYgcm91bmQubTkpIHtcblxuICAgICAgICAgICAgY29uc3Qgd2lubmVyVXNlcklkID0gYXdhaXQgdGhpcy53aW5uZXJMb2dpYyhyb3VuZCk7XG4gICAgICAgICAgICBpZiAod2lubmVyVXNlcklkKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IHdpbm5lclVzZXJJZCwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IF9pZCwgc3RhdHVzOiBcImRyYXdcIiB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZmlyc3RQb2ludCA9IGdhbWVEZXRhaWwuZmlyc3RVc2VyUG9pbnRzO1xuICAgICAgICAgICAgbGV0IHNlY1BvaW50ID0gZ2FtZURldGFpbC5zZWNVc2VyUG9pbnRzO1xuXG4gICAgICAgICAgICBpZiAoZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkLnRvU3RyaW5nKCkgPT0gd2lubmVyVXNlcklkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFBvaW50ID0gZmlyc3RQb2ludCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChnYW1lRGV0YWlsLnNlY1VzZXIuX2lkLnRvU3RyaW5nKCkgPT0gd2lubmVyVXNlcklkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBzZWNQb2ludCA9IHNlY1BvaW50ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlTWFueSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyBmaXJzdFVzZXJQb2ludHM6IGZpcnN0UG9pbnQsIHNlY1VzZXJQb2ludHM6IHNlY1BvaW50LCBzdGF0dXM6IFwicnVubmluZ1wiIH0gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG90aGVyUm91bmQgPSBhd2FpdCBHYW1lUm91bmQuZmluZE9uZSh7IGdhbWU6IGdhbWVJZCwgd2lubmVyVXNlcjogbnVsbCB9KTtcblxuICAgICAgICAgICAgaWYgKCFvdGhlclJvdW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tGaW5hbFdpbm5lciA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcbiAgICAgICAgICAgICAgICBsZXQgZmluYWxXaW5uZXIgPSAnJztcbiAgICAgICAgICAgICAgICBsZXQgbG9vc2VHYW1lSWQgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXJQb2ludHMgPiBjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXJQb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxXaW5uZXIgPSBjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICAgICAgbG9vc2VHYW1lSWQgPSBjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyUG9pbnRzIDwgY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsV2lubmVyID0gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyO1xuICAgICAgICAgICAgICAgICAgICBsb29zZUdhbWVJZCA9IGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmaW5hbFdpbm5lciAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlTWFueSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyB3aW5uZXJVc2VyOiBmaW5hbFdpbm5lciwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU1hbnkoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgd2lubmVyVXNlcjogX2lkLCBzdGF0dXM6IFwiZHJhd1wiIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2VUZXh0ID0gJ01hdGNoIGlzIERyYXcnO1xuICAgICAgICAgICAgICAgIGlmIChmaW5hbFdpbm5lciAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5uZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGZpbmFsV2lubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdhbGxldGFtb3VudCA9IHdpbm5lckRldGFpbC53YWxsZXQgPyB3aW5uZXJEZXRhaWwud2FsbGV0IDogMDtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbikrIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiBmaW5hbFdpbm5lciB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsV2lubmVyLnRvU3RyaW5nKCkgPT0gX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oX2lkLCBtZXNzYWdlLCBzdWJqZWN0LCBsb29zZUdhbWVJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oX2lkLCBcInlvdSBoYXZlIHdvbiBcIitjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4rXCIgem9sZXNcIiwgc3ViamVjdCwgbG9vc2VHYW1lSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGxvb3NlR2FtZUlkLCBtZXNzYWdlMSwgc3ViamVjdCwgZmluYWxXaW5uZXIpO1xuXG5cblxuXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihmaW5hbFdpbm5lciwgXCJ5b3UgaGF2ZSB3b24gXCIrY2hlY2tGaW5hbFdpbm5lci56b2xlV2luK1wiIHpvbGVzXCIsIHN1YmplY3QsIF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZmluYWxXaW5uZXIsIG1lc3NhZ2UxLCBzdWJqZWN0LCBfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgbWVzc2FnZSwgc3ViamVjdCwgZmluYWxXaW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9maXJzdCB1c2VyIGFtb3VudCByZWZ1bmRlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgZmlyc3RVc2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdFVzZXJXYWxsZXQgPSBmaXJzdFVzZXJEZXRhaWwud2FsbGV0ID8gZmlyc3RVc2VyRGV0YWlsLndhbGxldCA6IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1dhbGxldCA9IHBhcnNlSW50KGZpcnN0VXNlcldhbGxldCkgKyBwYXJzZUludChjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogZmlyc3RVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgIC8vc2VjIHVzZXIgYW1vdW50IHJlZnVuZGVkXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWNVc2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VjVXNlcldhbGxldCA9IHNlY1VzZXJEZXRhaWwud2FsbGV0ID8gc2VjVXNlckRldGFpbC53YWxsZXQgOiAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdXYWxsZXRzZWMgPSBwYXJzZUludChzZWNVc2VyV2FsbGV0KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiBzZWNVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXRzZWMgfSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvL3NlbmQgbm90aWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJNYXRjaCBpcyBkcmF3IGFuZCB6b2xlcyBhcmUgcmVmdW5kZWQgXCI7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlciwgbWVzc2FnZSwgc3ViamVjdCwgY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBnYW1lRGV0YWlscyA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcblxuXG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZ2FtZURhdGE6IGdhbWVEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICByb3VuZERhdGE6IHJvdW5kLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDYsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBtZXNzYWdlVGV4dCA9ICdNYXRjaCBpcyBEcmF3JztcbiAgICAgICAgICAgIGlmICh3aW5uZXJVc2VySWQgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGlmICh3aW5uZXJVc2VySWQgPT0gX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VUZXh0LFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAod2lubmVyVXNlcklkUHJlICE9IFwiXCIpIHtcblxuXG4gICAgICAgICAgICBpZiAod2lubmVyVXNlcklkUHJlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IHdpbm5lclVzZXJJZFByZSwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgbGV0IGZpcnN0UG9pbnQgPSBnYW1lRGV0YWlsLmZpcnN0VXNlclBvaW50cztcbiAgICAgICAgICAgIGxldCBzZWNQb2ludCA9IGdhbWVEZXRhaWwuc2VjVXNlclBvaW50cztcblxuICAgICAgICAgICAgaWYgKGdhbWVEZXRhaWwuZmlyc3RVc2VyLl9pZC50b1N0cmluZygpID09IHdpbm5lclVzZXJJZFByZS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RQb2ludCA9IGZpcnN0UG9pbnQgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZURldGFpbC5zZWNVc2VyLl9pZC50b1N0cmluZygpID09IHdpbm5lclVzZXJJZFByZS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgc2VjUG9pbnQgPSBzZWNQb2ludCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU1hbnkoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgZmlyc3RVc2VyUG9pbnRzOiBmaXJzdFBvaW50LCBzZWNVc2VyUG9pbnRzOiBzZWNQb2ludCwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9IH0pO1xuXG4gICAgICAgICAgICBjb25zdCBvdGhlclJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRPbmUoeyBnYW1lOiBnYW1lSWQsIHdpbm5lclVzZXI6IG51bGwgfSk7XG5cbiAgICAgICAgICAgIGlmICghb3RoZXJSb3VuZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrRmluYWxXaW5uZXIgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZCk7XG4gICAgICAgICAgICAgICAgbGV0IGZpbmFsV2lubmVyID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGxvb3NlR2FtZUlkID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyUG9pbnRzID4gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsV2lubmVyID0gY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXI7XG4gICAgICAgICAgICAgICAgICAgIGxvb3NlR2FtZUlkID0gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlclBvaW50cyA8IGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlclBvaW50cykge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbFdpbm5lciA9IGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlcjtcbiAgICAgICAgICAgICAgICAgICAgbG9vc2VHYW1lSWQgPSBjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU1hbnkoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgd2lubmVyVXNlcjogZmluYWxXaW5uZXIsIHN0YXR1czogXCJjb21wbGV0ZWRcIiB9IH0pO1xuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlVGV4dCA9ICdNYXRjaCBpcyBEcmF3JztcbiAgICAgICAgICAgICAgICBpZiAoZmluYWxXaW5uZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2lubmVyRGV0YWlsID0gVXNlci5maW5kQnlJZChmaW5hbFdpbm5lcik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdXYWxsZXQgPSB3aW5uZXJEZXRhaWwud2FsbGV0ID8gd2lubmVyRGV0YWlsLndhbGxldCA6IDAgKyBjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW47XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiBmaW5hbFdpbm5lciB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbmFsV2lubmVyID09IF9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVRleHQgPSBcIllvdSBoYXZlIFdvbiBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihsb29zZUdhbWVJZCwgbWVzc2FnZTEsIHN1YmplY3QsIGZpbmFsV2lubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihfaWQsIG1lc3NhZ2UsIHN1YmplY3QsIGxvb3NlR2FtZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgbWVzc2FnZSwgc3ViamVjdCwgZmluYWxXaW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGZpbmFsV2lubmVyLCBtZXNzYWdlMSwgc3ViamVjdCwgbG9vc2VHYW1lSWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJtYXRjaCBpcyBkcmF3XCI7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGdhbWVEZXRhaWwuc2VjVXNlciwgbWVzc2FnZSwgc3ViamVjdCwgZ2FtZURldGFpbC5maXJzdFVzZXIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGdhbWVEZXRhaWxzID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lSWQpO1xuXG5cblxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VUZXh0LFxuICAgICAgICAgICAgICAgICAgICBnYW1lRGF0YTogZ2FtZURldGFpbHMsXG4gICAgICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDYwNiwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG1lc3NhZ2VUZXh0ID0gJ3Jlc3VsdCc7XG5cblxuICAgICAgICAgICAgaWYgKHdpbm5lclVzZXJJZFByZS50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVRleHQgPSBcIllvdSBoYXZlIFdvbiBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlVGV4dCxcbiAgICAgICAgICAgICAgICBnYW1lRGF0YTogZ2FtZURldGFpbCxcbiAgICAgICAgICAgICAgICByb3VuZERhdGE6IHJvdW5kLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNjAwLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkdhbWUgUnVubmluZ1wiLFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2lubmVyTG9naWMgPSBhc3luYyAocm91bmQpID0+IHtcblxuICAgICAgICB2YXIgd2lubmVydGV4dCA9ICcnO1xuICAgICAgICAvKiAgIGlmIChyb3VuZC5tMSAmJiByb3VuZC5tMiAmJiByb3VuZC5tMyAmJiByb3VuZC5tNCAmJiByb3VuZC5tNSAmJiByb3VuZC5tNiAmJiByb3VuZC5tNyAmJiByb3VuZC5tOCAmJiByb3VuZC5tOSkgeyAqL1xuICAgICAgICBpZiAocm91bmQubTEgPT0gcm91bmQubTIgJiYgcm91bmQubTIgPT0gcm91bmQubTMgJiYgcm91bmQubTEgJiYgcm91bmQubTIgJiYgcm91bmQubTMpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm91bmQubTEgPT0gcm91bmQubTQgJiYgcm91bmQubTQgPT0gcm91bmQubTcgJiYgcm91bmQubTEgJiYgcm91bmQubTQgJiYgcm91bmQubTcpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tMTtcblxuICAgICAgICB9XG4gICAgICAgIGlmIChyb3VuZC5tMiA9PSByb3VuZC5tNSAmJiByb3VuZC5tNSA9PSByb3VuZC5tOCAmJiByb3VuZC5tMyAmJiByb3VuZC5tNiAmJiByb3VuZC5tOCkge1xuICAgICAgICAgICAgd2lubmVydGV4dCA9IHJvdW5kLm0yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3VuZC5tMyA9PSByb3VuZC5tNiAmJiByb3VuZC5tNiA9PSByb3VuZC5tOSAmJiByb3VuZC5tMyAmJiByb3VuZC5tNiAmJiByb3VuZC5tOSkge1xuICAgICAgICAgICAgd2lubmVydGV4dCA9IHJvdW5kLm0zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvdW5kLm00ID09IHJvdW5kLm01ICYmIHJvdW5kLm01ID09IHJvdW5kLm02ICYmIHJvdW5kLm00ICYmIHJvdW5kLm01ICYmIHJvdW5kLm02KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdW5kLm03ID09IHJvdW5kLm04ICYmIHJvdW5kLm04ID09IHJvdW5kLm05ICYmIHJvdW5kLm03ICYmIHJvdW5kLm04ICYmIHJvdW5kLm05KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdW5kLm0xID09IHJvdW5kLm01ICYmIHJvdW5kLm01ID09IHJvdW5kLm05ICYmIHJvdW5kLm0xICYmIHJvdW5kLm01ICYmIHJvdW5kLm05KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdW5kLm0zID09IHJvdW5kLm01ICYmIHJvdW5kLm01ID09IHJvdW5kLm03ICYmIHJvdW5kLm0zICYmIHJvdW5kLm01ICYmIHJvdW5kLm03KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTM7XG4gICAgICAgIH1cbiAgICAgICAgLyogICAgfSAqL1xuICAgICAgICBsZXQgd2lubmVyVXNlcmlkID0gJyc7XG5cbiAgICAgICAgaWYgKHdpbm5lcnRleHQgPT0gcm91bmQuZmlyc3RVc2VyVGV4dCkge1xuXG4gICAgICAgICAgICB3aW5uZXJVc2VyaWQgPSByb3VuZC5maXJzdFVzZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAod2lubmVydGV4dCA9PSAnJykge1xuICAgICAgICAgICAgd2lubmVyVXNlcmlkID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aW5uZXJVc2VyaWQgPSByb3VuZC5zZWNVc2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpbm5lclVzZXJpZDtcbiAgICB9XG5cbiAgICBzdGFydEdhbWVQcml2YXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHpvbGUgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgaWYgKCF6b2xlIHx8IHpvbGUgPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwgeyBtZXNzYWdlOiBcIlBsZWFzZSBQcm92aWRlIFpvbGVcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBsb2dpblVzZXIgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKF9pZCk7XG4gICAgICAgICAgICBpZiAobG9naW5Vc2VyLndhbGxldCA8IHpvbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHsgbWVzc2FnZTogXCJJbnN1ZmZpY2llbnQgem9sZVwiIH0pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIGxldCBjaGVja0dhbWUxID0gYXdhaXQgR2FtZS5maW5kT25lKHsgc3RhdHVzOiBcInBlbmRpbmdcIiwgZmlyc3RVc2VyOiBfaWQsIGdhbWVUeXBlOiBcInByaXZhdGVcIiB9KTtcblxuICAgICAgICAgICAgbGV0IGF1dG9Db2RlID0gQ29tbWFuSGVscGVyLnJhbmRvbU5vKDExMTExMTExLCA5OTk5OTk5OSk7XG4gICAgICAgICAgICBpZiAoIWNoZWNrR2FtZTEpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IG5ldyBHYW1lKHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlclBvaW50czogMCxcbiAgICAgICAgICAgICAgICAgICAgc2VjVXNlclBvaW50czogMCxcbiAgICAgICAgICAgICAgICAgICAgem9sZVdpbjogem9sZSxcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVR5cGU6IFwicHJpdmF0ZVwiLFxuICAgICAgICAgICAgICAgICAgICBnYW1lQ29kZTogYXV0b0NvZGUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCJcbiAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBnYW1lRGV0YWlsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgY2hlY2tHYW1lMSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgam9pbkdhbWVQcml2YXRlID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IGNvZGUgfSA9IHJlcS5ib2R5O1xuXG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZS5maW5kT25lKHsgc3RhdHVzOiBcInBlbmRpbmdcIiwgZ2FtZUNvZGU6IGNvZGUgfSkud2hlcmUoXCJmaXJzdFVzZXJcIikubmUoX2lkKVxuICAgICAgICAgICAgbGV0IGxvZ2luVXNlciA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoX2lkKTtcbiAgICAgICAgICAgIGlmIChsb2dpblVzZXIud2FsbGV0IDwgY2hlY2tHYW1lLnpvbGVXaW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHsgbWVzc2FnZTogXCJJbnN1ZmZpY2llbnQgem9sZVwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIFxuXG4gICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogcmVxdWVzdElkIH0sIHsgJHNldDogeyBzdGF0dXM6IHN0YXR1cyB9IH0pO1xuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChjaGVja0dhbWUuX2lkKTtcbiAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNlY1VzZXIgPSBfaWQ7XG4gICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zdGF0dXMgPSBcImJvb2tlZFwiO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0VXNlcnM9IGF3YWl0IFVzZXIuZmluZEJ5SWQoY2hlY2tHYW1lLmZpcnN0VXNlcik7XG4gICAgICAgICAgICAgICAgZmlyc3RVc2Vycy53YWxsZXQ9cGFyc2VJbnQoIGZpcnN0VXNlcnMud2FsbGV0KS1jaGVja0dhbWUuem9sZVdpbjtcbiAgICAgICAgICAgICAgICBmaXJzdFVzZXJzLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGxldCBzZWNVc2Vycz1hd2FpdCBVc2VyLmZpbmRCeUlkKF9pZCk7XG4gICAgICAgICAgICAgICAgc2VjVXNlcnMud2FsbGV0PXBhcnNlSW50KCBzZWNVc2Vycy53YWxsZXQpLWNoZWNrR2FtZS56b2xlV2luO1xuICAgICAgICAgICAgICAgIHNlY1VzZXJzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlPWNoZWNrR2FtZS56b2xlV2luK1wiIHpvbGVzIGlzIGR1ZHVjdGVkIGZyb20geW91ciB3YWxsZXRcIjtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oY2hlY2tHYW1lLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgX2lkKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oX2lkLCBtZXNzYWdlLCBzdWJqZWN0LCBjaGVja0dhbWUuZmlyc3RVc2VyKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZVJvdW5kID0gYXdhaXQgbmV3IEdhbWVSb3VuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lOiBjaGVja0dhbWUuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm91bmROYW1lOiBcIlJvdW5kIFwiICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlcjogZ2FtZURldGFpbC5maXJzdFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNVc2VyOiBnYW1lRGV0YWlsLnNlY1VzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXJUZXh0OiBcIlhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY1VzZXJUZXh0OiBcIk9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbm5lclVzZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiXG5cbiAgICAgICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdhbWVEZXRhaWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHsgbWVzc2FnZTogXCJpbnZhbGlkIENvZGVcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBzZW5kUmVxdWVzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBjb25zdCB7IHJlY2VpdmVyLCBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVjZWl2ZXIsIFwiLS1cIiwgZ2FtZUlkKVxuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWVSZXF1ZXN0LmZpbmRPbmUoeyBzdGF0dXM6IFwicGVuZGluZ1wiLCBzZW5kZXI6IF9pZCwgcmVjZWl2ZXI6IHJlY2VpdmVyLCBnYW1lOiBnYW1lSWQgfSk7XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHsgXCJtZXNzYWdlXCI6IFwicmVxdWVzdCBhbHJlYWR5IHNlbnRcIiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBnYW1lcmVxID0gYXdhaXQgbmV3IEdhbWVSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgc2VuZGVyOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgIHJlY2VpdmVyOiByZWNlaXZlcixcbiAgICAgICAgICAgICAgICAgICAgZ2FtZTogZ2FtZUlkXG5cbiAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG5cblxuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJzZW5kIGEgcmVxdWVzdCBmb3IgcGxheSBnYW1lXCI7XG4gICAgICAgICAgICAgICAgbGV0IHN1YmplY3QgPSBcIkdhbWVcIjtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24ocmVjZWl2ZXIsIG1lc3NhZ2UsIHN1YmplY3QsIF9pZCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdhbWVyZXEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVxdWVzdExpc3QgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIC8vIGNvbnN0IHsgcmVjZWl2ZXIsZ2FtZUlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKF9pZCk7XG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZVJlcXVlc3QuZmluZCh7IHN0YXR1czogXCJwZW5kaW5nXCIsIHJlY2VpdmVyOiBfaWQgfSkucG9wdWxhdGUoW1wic2VuZGVyXCIsIFwicmVjZWl2ZXJcIiwgXCJnYW1lXCJdKTtcbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBjaGVja0dhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHsgXCJtZXNzYWdlXCI6IFwibm90IGZvdW5kXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhY2NlcHRSZXF1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IHN0YXR1cywgcmVxdWVzdElkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGxldCBjaGVja0dhbWUgPSBhd2FpdCBHYW1lUmVxdWVzdC5maW5kT25lKHsgc3RhdHVzOiBcInBlbmRpbmdcIiwgX2lkOiByZXF1ZXN0SWQgfSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoZWNrR2FtZSk7XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJlcXVlc3QudXBkYXRlT25lKHsgX2lkOiByZXF1ZXN0SWQgfSwgeyAkc2V0OiB7IHN0YXR1czogc3RhdHVzIH0gfSk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBcImFjY2VwdGVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGNoZWNrR2FtZS5nYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zZWNVc2VyID0gX2lkO1xuICAgICAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnN0YXR1cyA9IFwiYm9va2VkXCI7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVSb3VuZCA9IGF3YWl0IG5ldyBHYW1lUm91bmQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWU6IGdhbWVEZXRhaWwuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdW5kTmFtZTogXCJSb3VuZCBcIiArIGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyOiBnYW1lRGV0YWlsLmZpcnN0VXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNVc2VyOiBnYW1lRGV0YWlsLnNlY1VzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyVGV4dDogXCJYXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjVXNlclRleHQ6IFwiT1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbm5lclVzZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcImFjY2VwdCB5b3VyIHJlcXVlc3QgZm9yIHBsYXkgZ2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZ2FtZURldGFpbC5maXJzdFVzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGdhbWVEZXRhaWwuc2VjVXNlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoY2hlY2tHYW1lLmdhbWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwicmVqZWN0IHlvdXIgcmVxdWVzdCBmb3IgcGxheSBnYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGdhbWVEZXRhaWwpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZ2FtZURldGFpbC5maXJzdFVzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIF9pZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjaGVja0dhbWUxID0gYXdhaXQgR2FtZVJlcXVlc3QuZmluZE9uZSh7IF9pZDogcmVxdWVzdElkIH0pXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBjaGVja0dhbWUxKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJSb29tIENvZGUgaXMgSW52YWxpZFwiIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVpdEdhbWUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgZ2FtZUlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGxldCBjaGVja0dhbWUgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZClcblxuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZUlkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIgfSB9KTtcblxuICAgICAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlTWFueSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIgfSB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGNoZWNrR2FtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJub3QgZm91bmRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdhbWVIaXN0b3J5ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZS5maW5kKHsgaXNEZWxldGVkOiBmYWxzZSB9KS5wb3B1bGF0ZShbXCJmaXJzdFVzZXJcIiwgXCJzZWNVc2VyXCJdKVxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoZWNrR2FtZSk7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBnYW1lcyBvZiBjaGVja0dhbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRtcCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICB0bXAuZ2FtZSA9IGdhbWVzO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZXJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmQoeyBnYW1lOiBnYW1lcy5faWQgfSkucG9wdWxhdGUoW1wiZmlyc3RVc2VyXCIsIFwic2VjVXNlclwiXSk7XG4gICAgICAgICAgICAgICAgICAgIHRtcC5yb3VuZHMgPSBnYW1lcm91bmQ7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRtcClcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7IFwibWVzc2FnZVwiOiBcIm5vdCBmb3VuZFwiIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2FtZURldGFpbCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IGlzRGVsZXRlZDogZmFsc2UsIF9pZDogZ2FtZUlkIH0pXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge307XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hlY2tHYW1lKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNoZWNrR2FtZTtcbiAgICAgICAgICAgICAgICBsZXQgZ2FtZXJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmQoeyBnYW1lOiBjaGVja0dhbWUuX2lkIH0pO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5yb3VuZHMgPSBnYW1lcm91bmQ7XG5cblxuXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJub3QgZm91bmRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXJ0TmV4dFJvdW5kID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgZ2FtZUlkLCByb3VuZElkIH0gPSByZXEuYm9keTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBnYW1lUm91bmRzID0gYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU9uZSh7IF9pZDogcm91bmRJZCB9LCB7ICRzZXQ6IHsgbmV4dFJvdW5kU3RhcnRlZDogXCJZZXNcIiB9IH0pO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRCeUlkKHJvdW5kSWQpO1xuICAgICAgICAgICAgY29uc3Qgcm91bmQgPSBhd2FpdCBHYW1lUm91bmQuZmluZE9uZSh7IGdhbWU6IGdhbWVJZCwgbmV4dFJvdW5kU3RhcnRlZDogXCJOb1wiIH0pO1xuICAgICAgICAgICAgaWYgKHJvdW5kKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRSb3VuZC53aW5uZXJVc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSb3VuZC51cGRhdGVPbmUoeyBfaWQ6IHJvdW5kLl9pZCB9LCB7ICRzZXQ6IHsgbmV4dFR1cm46IGN1cnJlbnRSb3VuZC53aW5uZXJVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQudXBkYXRlT25lKHsgX2lkOiByb3VuZC5faWQgfSwgeyAkc2V0OiB7IG5leHRUdXJuOiBjdXJyZW50Um91bmQuZmlyc3RVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJHYW1lIFJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgICBnYW1lRGF0YTogZ2FtZVJvdW5kcyxcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCBlcnJvcik7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBjaGVja0dhbWVTdGF0dXMgPSBhc3luYyAoZ2FtZUlkLCByb3VuZElkKSA9PiB7XG4gICAgICAgIGNvbnN0IGdhbWVEZXRhaWxBbGwgPSBhd2FpdCBHYW1lLmZpbmQoeyBpc0RlbGV0ZWQ6IGZhbHNlLCBfaWQ6IGdhbWVJZCB9KS5wb3B1bGF0ZShbXCJmaXJzdFVzZXJcIiwgXCJzZWNVc2VyXCJdKTtcblxuXG4gICAgICAgIGZvciAoY29uc3QgZ2FtZXMgb2YgZ2FtZURldGFpbEFsbCkge1xuXG4gICAgICAgICAgICBpZiAoZ2FtZXMuc3RhdHVzID09IFwicnVubmluZ1wiIHx8IGdhbWVzLnN0YXR1cyA9PSBcImJvb2tlZFwiKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByb3VuZHMgPSBhd2FpdCBHYW1lUm91bmQuZmluZEJ5SWQocm91bmRJZCk7XG5cblxuICAgICAgICAgICAgICAgIGlmIChyb3VuZHMpIHtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZkluTWlsbGlTZWNvbmRzID0gTWF0aC5hYnMobmV3IERhdGUoKSAtIG5ldyBEYXRlKHJvdW5kcy51cGRhdGVkQXQpKSAvIDEwMDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKGRpZmZJbk1pbGxpU2Vjb25kcyAvIDYwKSAlIDYwO1xuICAgICAgICAgICAgICAgICAgICBkaWZmSW5NaWxsaVNlY29uZHMgLT0gbWludXRlcyAqIDYwO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1pblwiLCBtaW51dGVzKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAobWludXRlcyA+IDEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdW5kcy5uZXh0VHVybikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3VuZHMubmV4dFR1cm4gPT0gcm91bmRzLmZpcnN0VXNlci50b1N0cmluZygpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVzLl9pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuc2VjVXNlciB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQudXBkYXRlTWFueSh7IGdhbWU6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuc2VjVXNlciB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChyb3VuZHMuc2VjVXNlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0YW1vdW50ID0gdXNlckRldGFpbC53YWxsZXQgPyB1c2VyRGV0YWlsLndhbGxldCArIGdhbWVEZXRhaWwuem9sZVdpbiA6IGdhbWVEZXRhaWwuem9sZVdpbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLnNlY1VzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGdhbWVEZXRhaWwuZmlyc3RVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGdhbWVEZXRhaWwuZmlyc3RVc2VyLCBtZXNzYWdlMSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiB1c2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgd2FsbGV0OiB3YWxsZXRhbW91bnQgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZVwiLCBtaW51dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVzLl9pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuZmlyc3RVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZXMuX2lkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIsIHdpbm5lclVzZXI6IHJvdW5kcy5maXJzdFVzZXIgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXNlckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQocm91bmRzLmZpcnN0VXNlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2FsbGV0YW1vdW50ID0gdXNlckRldGFpbC53YWxsZXQgPyB1c2VyRGV0YWlsLndhbGxldCArIGdhbWVEZXRhaWwuem9sZVdpbiA6IGdhbWVEZXRhaWwuem9sZVdpbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGdhbWVEZXRhaWwuc2VjVXNlciwgbWVzc2FnZTEsIHN1YmplY3QsIGdhbWVEZXRhaWwuZmlyc3RVc2VyKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogdXNlckRldGFpbC5faWQgfSwgeyAkc2V0OiB7IHdhbGxldDogd2FsbGV0YW1vdW50IH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm90dWVyXCIsIG1pbnV0ZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lcy5faWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZXMuX2lkKTtcbiAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLndpbm5lciA9cm91bmRzLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zdGF0dXMgPSBcImNvbXBsZXRlZFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNhdmUoKTsgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU9uZSh7IF9pZDogZ2FtZXMuX2lkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIsIHdpbm5lclVzZXI6IHJvdW5kcy5zZWNVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBnYW1lOiBnYW1lcy5faWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJjb21wbGV0ZWRcIiwgd2lubmVyVXNlcjogcm91bmRzLnNlY1VzZXIgfSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChyb3VuZHMuc2VjVXNlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3YWxsZXRhbW91bnQgPSB1c2VyRGV0YWlsLndhbGxldCA/IHVzZXJEZXRhaWwud2FsbGV0ICsgZ2FtZURldGFpbC56b2xlV2luIDogZ2FtZURldGFpbC56b2xlV2luO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIFdvbiBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZ2FtZURldGFpbC5zZWNVc2VyLCBtZXNzYWdlMSwgc3ViamVjdCwgZ2FtZURldGFpbC5maXJzdFVzZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXNlci51cGRhdGVPbmUoeyBfaWQ6IHVzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyB3YWxsZXQ6IHdhbGxldGFtb3VudCB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgZGVsZXRlR2FtZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IGlzRGVsZXRlZDogZmFsc2UsIF9pZDogZ2FtZUlkIH0pXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geyBcIm1lc3NhZ2VcIjogXCJkZWxldGVkIFN1Y2Nlc3NmdWxseVwiIH07XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hlY2tHYW1lKTtcblxuXG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZS5kZWxldGVPbmUoeyBfaWQ6IGdhbWVJZCB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQuZGVsZXRlTWFueSh7IGdhbWU6IGdhbWVJZCB9KTtcblxuXG5cblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJub3QgZm91bmRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNlbmRub3RpZmljYXRpb24gPSBhc3luYyAodXNlcklkLCBtZXNzYWdlLCBzdWJqZWN0LCBsb2dpblVzZXIpID0+IHtcbiAgICAgICAgY29uc3QgZmlyc3RVc2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZCh1c2VySWQpO1xuXG4gICAgICAgIGlmIChmaXJzdFVzZXJEZXRhaWwuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgdG9Vc2VyOiBmaXJzdFVzZXJEZXRhaWwuX2lkLFxuICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBsb2dpblVzZXIsXG4gICAgICAgICAgICAgICAgdGl0bGU6IHN1YmplY3QsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBkZXZpY2VUb2tlbjogZmlyc3RVc2VyRGV0YWlsLmRldmljZVRva2VuLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRCeTogbG9naW5Vc2VyLFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRCeTogbG9naW5Vc2VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhd2FpdCBOb3RpZmljYXRpb25zLnNlbmROb3RpZmljYXRpb24obm90aWZpY2F0aW9uRGF0YSk7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBlbnRlckluR2FtZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG5cbiAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lSWQpO1xuICAgICAgICAgICAgaWYgKGdhbWVEZXRhaWwuZmlyc3RVc2VyLnRvU3RyaW5nKCkgPT0gX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU9uZSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyBmaXJzdFVzZXJTdGFydDogMSB9IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgc2VjVXNlclN0YXJ0OiAxIH0gfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsYSA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcbiAgICAgICAgICAgIGlmIChnYW1lRGV0YWlsYS5maXJzdFVzZXJTdGFydCA9PSAxICYmIGdhbWVEZXRhaWxhLmZpcnN0VXNlclN0YXJ0ID09IDIpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU9uZSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwicnVubmluZ1wiIH0gfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgeyBcInN0YXR1c1wiOiAyMDAsIFwibWVzc2FnZVwiOiBcInVwZGF0ZWQgU3VjY2Vzc2Z1bGx5XCIgfSk7XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG5cblxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBHYW1lQ29udHJvbGxlcigpO1xuIl19