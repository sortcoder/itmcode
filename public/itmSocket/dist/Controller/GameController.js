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

var _UserSettings = _interopRequireDefault(require("../Models/UserSettings"));

var _winston = require("winston");

var _moment = _interopRequireDefault(require("moment"));

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
          var checkGame = yield _Game.default.findOne({
            status: "pending",
            gameType: "public"
          }).where("firstUser").ne(_id);

          if (checkGame) {
            var _gameDetail = yield _Game.default.findById(checkGame._id);

            _gameDetail.secUser = _id;
            _gameDetail.status = "booked";

            _gameDetail.save();

            for (var i = 1; i <= 5; i++) {
              var gameRound = yield new _GameRound.default({
                game: checkGame._id,
                roundName: "Round " + i,
                firstUser: _gameDetail.firstUser,
                secUser: _gameDetail.secUser,
                firstUserText: "X",
                secUserText: "O",
                nextTurn: _gameDetail.firstUser,
                winnerUser: null,
                status: "pending"
              }).save();
            }

            return (0, _RequestHelper.buildResult)(res, 200, _gameDetail);
          } else {
            var checkGame1 = yield _Game.default.findOne({
              status: "pending",
              gameType: "public",
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
          // let diffInMilliSeconds = Math.abs(new Date("Y-m-d H:i:s") - new Date(gameDetail.createdAt)) / 1000;
          var startTime = (0, _moment.default)(gameDetail.createdAt);
          var endTime = (0, _moment.default)(new Date());
          var secondsDiff = endTime.diff(startTime, 'seconds');
          console.log(secondsDiff, "secondsDiff");
          /* 
          // calculate days
          const days = Math.floor(diffInMilliSeconds / 86400);
          diffInMilliSeconds -= days * 86400;
                
          // calculate hours
          const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
          diffInMilliSeconds -= hours * 3600;
          */
          // calculate minutes

          /*    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
             diffInMilliSeconds -= minutes * 60;
             console.log("diffInMilliSeconds", diffInMilliSeconds);
             console.log("minutes", minutes); */

          if (secondsDiff > 110) {
            var gameDetail2 = yield _Game.default.findById(gameDetail._id);
            gameDetail2.status = "rejected";
            gameDetail2.save();
            var gameDetail1 = yield _GameRound.default.updateMany({
              game: gameDetail._id
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
        } else if (gameDetail.status == "match") {
          var _result = {
            message: "Game Started",
            gameData: gameDetail,
            roundData: round ? round : {}
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result);
        } else if (gameDetail.status == "booked" || gameDetail.status == "running") {
          if (gameDetail.firstUser._id.toString() != _id.toString() && gameDetail.secUser._id.toString() != _id.toString()) {
            var _result3 = {
              message: "No One Is Available Please Try Again Later"
            };
            return (0, _RequestHelper.buildResult)(res, 300, _result3);
          }

          var _result2 = {
            message: "Game Started",
            gameData: gameDetail,
            roundData: round,
            totaldraw: totaldraw ? totaldraw : 0
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result2);
        } else {
          var _result4 = {
            message: "Game Started",
            gameData: gameDetail,
            roundData: round ? round : {}
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result4);
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
        var gameDetailRound = yield _GameRound.default.findById(roundId);

        if (gameDetail.firstUser._id.toString() == _id.toString()) {
          nextTurn = gameDetail.secUser._id;
        } else {
          nextTurn = gameDetail.firstUser._id;
        }

        console.log("move text", movestext);
        var updateobject = {};

        if (moves == "m1" && !gameDetailRound.m1) {
          updateobject = {
            m1: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m2" && !gameDetailRound.m2) {
          updateobject = {
            m2: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m3" && !gameDetailRound.m3) {
          updateobject = {
            m3: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m4" && !gameDetailRound.m4) {
          updateobject = {
            m4: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m5" && !gameDetailRound.m5) {
          updateobject = {
            m5: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m6" && !gameDetailRound.m6) {
          updateobject = {
            m6: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m7" && !gameDetailRound.m7) {
          updateobject = {
            m7: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m8" && !gameDetailRound.m8) {
          updateobject = {
            m8: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        }

        if (moves == "m9" && !gameDetailRound.m9) {
          updateobject = {
            m9: movestext,
            nextTurn: nextTurn,
            status: "running"
          };
        } // check which user move
        //let checkMove= await this.checkMoves(gameDetailRound,movestext,moves);

        /*    if(checkMove===0)
           {
            
               let result = {
                   message: "Game Running",
                   gameData: gameDetail,
                   roundData: gameDetailRound,
               }
               return buildResult(res, 200, result);
           } */


        if (updateobject && updateobject.nextTurn) {
          yield _GameRound.default.updateMany({
            _id: roundId
          }, {
            $set: updateobject
          });
        }

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
            status: "pending"
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
            }

            var _messageText = 'Match is Draw';

            if (finalWinner != "") {
              var winnerDetail = yield _User.default.findById(finalWinner);
              var walletamount = winnerDetail.wallet ? winnerDetail.wallet : 0;
              var newWallet = parseInt(walletamount);

              if (checkFinalWinner.gameType == "public") {
                newWallet = parseInt(walletamount) + parseInt(checkFinalWinner.zoleWin);
              } else {
                newWallet = parseInt(walletamount) + parseInt(checkFinalWinner.zoleWin) + parseInt(checkFinalWinner.zoleWin);
              }

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
                yield _this.sendnotification(looseGameId, message1, subject, finalWinner);
                yield _this.sendnotification(_id, "you have won " + checkFinalWinner.zoleWin + " zoles", subject, looseGameId);
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
              if (checkFinalWinner.gameType != "public") {
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
                });
              } //send notification


              var _message3 = "Match is draw and zoles are refunded ";
              var _subject2 = "Game";
              yield _this.sendnotification(checkFinalWinner.firstUser, _message3, _subject2, checkFinalWinner.secUser);
              yield _this.sendnotification(checkFinalWinner.secUser, _message3, _subject2, checkFinalWinner.firstUser);
              yield _Game.default.updateMany({
                _id: gameId
              }, {
                $set: {
                  status: "completed"
                }
              });
            }

            var gameDetails = yield _Game.default.findById(gameId);
            var _result5 = {
              message: _messageText,
              gameData: gameDetails,
              roundData: round
            };
            return (0, _RequestHelper.buildResult)(res, 606, _result5);
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
            status: "pending"
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
              var _winnerDetail = yield _User.default.findById(_finalWinner);

              var _walletamount = _winnerDetail.wallet ? _winnerDetail.wallet : 0;

              var _newWallet2 = parseInt(_walletamount);

              if (_checkFinalWinner.gameType == "public") {
                _newWallet2 = parseInt(_walletamount) + parseInt(_checkFinalWinner.zoleWin);
              } else {
                _newWallet2 = parseInt(_walletamount) + parseInt(_checkFinalWinner.zoleWin) + parseInt(_checkFinalWinner.zoleWin);
              }

              yield _User.default.updateOne({
                _id: _finalWinner
              }, {
                $set: {
                  wallet: _newWallet2
                }
              });

              if (_finalWinner == _id) {
                _messageText3 = "You have Won The match ";
                var _message4 = "You have Won The match ";
                var _subject3 = "Game";
                var _message5 = "You have Lose The match";
                yield _this.sendnotification(_id, "you have won " + _winnerDetail.zoleWin + " zoles", _subject3, _looseGameId);
                yield _this.sendnotification(_looseGameId, _message5, _subject3, _finalWinner);
                yield _this.sendnotification(_id, _message4, _subject3, _looseGameId);
              } else {
                _messageText3 = "You have Lose The match";
                var _message6 = "You have Lose The match";
                var _message7 = "You have Won The match";
                var _subject4 = "Game";
                yield _this.sendnotification(_finalWinner, "you have won " + _winnerDetail.zoleWin + " zoles", _subject4, _id);
                yield _this.sendnotification(_id, _message6, _subject4, _finalWinner);
                yield _this.sendnotification(_finalWinner, _message7, _subject4, _looseGameId);
              }
            } else {
              //first user amount refunded
              var _firstUserDetail = yield _User.default.findById(_checkFinalWinner.firstUser);

              var _firstUserWallet = _firstUserDetail.wallet ? _firstUserDetail.wallet : 0;

              var _newWallet3 = parseInt(_firstUserWallet) + parseInt(_checkFinalWinner.zoleWin);

              yield _User.default.updateOne({
                _id: _firstUserDetail._id
              }, {
                $set: {
                  wallet: _newWallet3
                }
              }); //sec user amount refunded

              var _secUserDetail = yield _User.default.findById(_checkFinalWinner.secUser);

              var _secUserWallet = _secUserDetail.wallet ? _secUserDetail.wallet : 0;

              var _newWalletsec = parseInt(_secUserWallet) + parseInt(_checkFinalWinner.zoleWin);

              yield _User.default.updateOne({
                _id: _secUserDetail._id
              }, {
                $set: {
                  wallet: _newWalletsec
                }
              }); //send notification

              var _message8 = "Match is draw and zoles are refunded ";
              var _subject5 = "Game";
              yield _this.sendnotification(_checkFinalWinner.firstUser, _message8, _subject5, _checkFinalWinner.secUser);
              yield _this.sendnotification(_checkFinalWinner.secUser, _message8, _subject5, _checkFinalWinner.firstUser);
            }

            var _gameDetails = yield _Game.default.findById(gameId);

            var _result7 = {
              message: _messageText3,
              gameData: _gameDetails,
              roundData: round
            };
            return (0, _RequestHelper.buildResult)(res, 606, _result7);
          }

          var _messageText2 = 'result';

          if (winnerUserIdPre.toString() == _id.toString()) {
            _messageText2 = "You have Won The match";
          } else {
            _messageText2 = "You have Lose The match";
          }

          var _result6 = {
            message: _messageText2,
            gameData: gameDetail,
            roundData: round
          };
          return (0, _RequestHelper.buildResult)(res, 600, _result6);
        } else {
          var _result8 = {
            message: "Game Running",
            gameData: gameDetail,
            roundData: round
          };
          return (0, _RequestHelper.buildResult)(res, 200, _result8);
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
          } else {
            yield _CommonDbController.default.update(_Game.default, {
              _id: checkGame1._id
            }, {
              status: "completed"
            });

            var _gameDetail3 = yield new _Game.default({
              firstUser: _id,
              firstUserPoints: 0,
              secUserPoints: 0,
              zoleWin: zole,
              gameType: "private",
              gameCode: autoCode,
              status: "pending"
            }).save();

            return (0, _RequestHelper.buildResult)(res, 200, _gameDetail3);
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
          var checkGame = yield _Game.default.findOne({
            status: "pending",
            gameCode: code
          }).where("firstUser").ne(_id);

          if (!checkGame) {
            return (0, _RequestHelper.buildResult)(res, 400, {
              message: "invalid Code"
            });
          }

          var loginUser = yield _User.default.findById(_id);
          console.log("loginUser.wallet" + loginUser.wallet);
          console.log("checkGame.zoleWin" + checkGame.zoleWin);

          if (loginUser.wallet) {
            if (loginUser.wallet < checkGame.zoleWin) {
              return (0, _RequestHelper.buildResult)(res, 500, {
                message: "Insufficient zole"
              });
            }
          } else {
            return (0, _RequestHelper.buildResult)(res, 500, {
              message: "Insufficient zole"
            });
          }

          if (checkGame) {
            var gameDetail = yield _Game.default.findById(checkGame._id);
            gameDetail.secUser = _id; // gameDetail.status = "booked";

            gameDetail.status = "match";
            gameDetail.save();

            for (var i = 1; i <= 5; i++) {
              var gameRound = yield new _GameRound.default({
                game: checkGame._id,
                roundName: "Round " + i,
                firstUser: gameDetail.firstUser,
                secUser: gameDetail.secUser,
                nextTurn: gameDetail.firstUser,
                firstUserText: "X",
                secUserText: "O",
                winnerUser: null,
                status: "pending"
              }).save();
            }

            var firstUsers = yield _User.default.findById(gameDetail.firstUser);
            console.log("firstuser", firstUsers.wallet);
            firstUsers.wallet = parseInt(firstUsers.wallet) - checkGame.zoleWin;
            firstUsers.save();
            console.log("firstuserDone", firstUsers.wallet);
            var secUsers = yield _User.default.findById(_id);
            console.log("secuser", secUsers.wallet);
            secUsers.wallet = parseInt(secUsers.wallet) - checkGame.zoleWin;
            secUsers.save();
            console.log("secuserDone", secUsers.wallet);
            var subject = "Game";
            var message = checkGame.zoleWin + " zoles is duducted from your wallet";
            yield _this.sendnotification(checkGame.firstUser, message, subject, _id);
            yield _this.sendnotification(_id, message, subject, checkGame.firstUser);
            return (0, _RequestHelper.buildResult)(res, 200, gameDetail);
          } else {
            return (0, _RequestHelper.buildResult)(res, 400, {
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
          var checkGame = yield _GameRequest.default.findOne({
            status: "pending",
            sender: _id,
            receiver: receiver,
            game: gameId
          });

          if (checkGame) {
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
            var receiverSetting = yield _UserSettings.default.findOne({
              userId: receiver
            });

            if (receiverSetting.inviteToRoom == true) {
              yield _this.sendnotification(receiver, message, subject, _id);
            }

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
          var checkGame = yield _GameRequest.default.find({
            status: "pending",
            receiver: _id
          }).populate(["sender", "receiver", "game"]);

          if (checkGame) {
            return (0, _RequestHelper.buildResult)(res, 200, checkGame);
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
            status,
            requestId
          } = req.body;
          var checkGame = yield _GameRequest.default.findOne({
            status: "pending",
            _id: requestId
          });
          console.log(checkGame);

          if (checkGame) {
            yield _GameRequest.default.updateOne({
              _id: requestId
            }, {
              $set: {
                status: status
              }
            });

            if (status == "accepted") {
              var gameDetail = yield _Game.default.findById(checkGame.game);
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
                  nextTurn: gameDetail.firstUser,
                  winnerUser: null,
                  status: "pending"
                }).save();
              }

              var message = "accept your request for play game";
              var subject = "Game";
              yield _this.sendnotification(gameDetail.firstUser, message, subject, gameDetail.secUser);
            } else {
              var _gameDetail4 = yield _Game.default.findById(checkGame.game);

              var _message9 = "reject your request for play game";
              var _subject6 = "Game";
              console.log(_gameDetail4);
              yield _this.sendnotification(_gameDetail4.firstUser, _message9, _subject6, _id);
            }

            var checkGame1 = yield _GameRequest.default.findOne({
              _id: requestId
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
          var checkGame = yield _Game.default.findById(gameId);

          if (checkGame) {
            var winnerId = '';
            var looserId = '';

            if (checkGame.firstUser.toString() == _id.toString()) {
              winnerId = checkGame.secUser;
              looserId = checkGame.firstUser;
            } else {
              winnerId = checkGame.firstUser;
              looserId = checkGame.secUser;
            }

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
                status: "completed",
                winnerUser: winnerId
              }
            });
            var userDetail = yield _User.default.findById(winnerId);
            var walletamount = userDetail.wallet ? userDetail.wallet : 0;
            var newWallet = parseInt(walletamount);

            if (checkGame.gameType == "public") {
              newWallet = parseInt(walletamount) + parseInt(checkGame.zoleWin);
            } else {
              newWallet = parseInt(walletamount) + parseInt(checkGame.zoleWin) + parseInt(checkGame.zoleWin);
            }

            yield _User.default.updateOne({
              _id: userDetail._id
            }, {
              $set: {
                wallet: newWallet
              }
            });
            var message = "You have Won The match";
            var message1 = "You have Lose The match";
            var subject = "Game";
            yield _this.sendnotification(winnerId, message, subject, looserId);
            yield _this.sendnotification(looserId, message1, subject, winnerId);
            return (0, _RequestHelper.buildResult)(res, 200, checkGame);
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
          var checkGame = yield _Game.default.find({
            isDeleted: false
          }).populate(["firstUser", "secUser"]);
          var result = [];

          if (checkGame) {
            console.log(checkGame);

            for (var games of checkGame) {
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
          var checkGame = yield _Game.default.findOne({
            isDeleted: false,
            _id: gameId
          });
          var result = {};

          if (checkGame) {
            console.log(checkGame);
            result = checkGame;
            var gameround = yield _GameRound.default.find({
              game: checkGame._id
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
              var startTime = (0, _moment.default)(rounds.updatedAt);
              var endTime = (0, _moment.default)(new Date()); // var hoursDiff = endTime.diff(startTime, 'hours');
              // console.log('Hours:' + hoursDiff);
              // var minutesDiff = endTime.diff(startTime, 'minutes');
              // console.log('Minutes:' + minutesDiff);

              var secondsDiff = endTime.diff(startTime, 'seconds');
              console.log('Seconds:' + secondsDiff); // let diffInMilliSeconds = Math.abs(new Date() - new Date(rounds.updatedAt)) / 1000;
              // const seconds = Math.floor(diffInMilliSeconds / 1000) ;
              // const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
              // diffInMilliSeconds -= minutes * 60;
              // console.log("min", minutes);
              // console.log("seconds", seconds);

              if (secondsDiff > 30) {
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
                    var winnerDetail = yield _User.default.findById(rounds.secUser);
                    var walletamount = winnerDetail.wallet ? winnerDetail.wallet : 0;
                    var newWallet = parseInt(walletamount);

                    if (games.gameType == "public") {
                      newWallet = parseInt(walletamount) + parseInt(games.zoleWin);
                    } else {
                      newWallet = parseInt(walletamount) + parseInt(games.zoleWin) + parseInt(games.zoleWin);
                    }

                    yield _User.default.updateOne({
                      _id: rounds.secUser
                    }, {
                      $set: {
                        wallet: newWallet
                      }
                    });
                    var message = "You have Won The match";
                    var message1 = "You have Lose The match";
                    var subject = "Game";
                    yield _this.sendnotification(gameDetail.secUser, message, subject, gameDetail.firstUser);
                    yield _this.sendnotification(gameDetail.firstUser, message1, subject, gameDetail.secUser);
                  } else {
                    // console.log("else", minutes);
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

                    var _winnerDetail2 = yield _User.default.findById(rounds.firstUser);

                    var _walletamount2 = _winnerDetail2.wallet ? _winnerDetail2.wallet : 0;

                    var _newWallet4 = parseInt(_walletamount2);

                    if (games.gameType == "public") {
                      _newWallet4 = parseInt(_walletamount2) + parseInt(games.zoleWin);
                    } else {
                      _newWallet4 = parseInt(_walletamount2) + parseInt(games.zoleWin) + parseInt(games.zoleWin);
                    }

                    yield _User.default.updateOne({
                      _id: rounds.firstUser
                    }, {
                      $set: {
                        wallet: _newWallet4
                      }
                    });
                    var _message10 = "You have Won The match";
                    var _message11 = "You have Lose The match";
                    var _subject7 = "Game";
                    yield _this.sendnotification(_gameDetail5.firstUser, _message10, _subject7, _gameDetail5.secUser);
                    yield _this.sendnotification(_gameDetail5.secUser, _message11, _subject7, _gameDetail5.firstUser);
                  }
                } else {
                  // console.log("otuer", minutes);
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

                  var _winnerDetail3 = yield _User.default.findById(rounds.secUser);

                  var _walletamount3 = _winnerDetail3.wallet ? _winnerDetail3.wallet : 0;

                  var _newWallet5 = parseInt(_walletamount3);

                  if (games.gameType == "public") {
                    _newWallet5 = parseInt(_walletamount3) + parseInt(games.zoleWin);
                  } else {
                    _newWallet5 = parseInt(_walletamount3) + parseInt(games.zoleWin) + parseInt(games.zoleWin);
                  }

                  yield _User.default.updateOne({
                    _id: rounds.secUser
                  }, {
                    $set: {
                      wallet: _newWallet5
                    }
                  });
                  var _message12 = "You have Lose The match";
                  var _message13 = "You have Won The match";
                  var _subject8 = "Game";
                  yield _this.sendnotification(_gameDetail6.firstUser, _message12, _subject8, _gameDetail6.secUser);
                  yield _this.sendnotification(_gameDetail6.secUser, _message13, _subject8, _gameDetail6.firstUser);
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
          var checkGame = yield _Game.default.findOne({
            isDeleted: false,
            _id: gameId
          });
          var result = {
            "message": "deleted Successfully"
          };

          if (checkGame) {
            console.log(checkGame);
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
            fromUser: firstUserDetail._id,
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

          if (gameDetaila.firstUserStart == 1) {
            yield _Game.default.updateOne({
              _id: gameId
            }, {
              $set: {
                status: "booked"
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

    _defineProperty(this, "checkMoves", /*#__PURE__*/function () {
      var _ref19 = _asyncToGenerator(function* (gameRound, moveText, moves) {
        var totalXMove = 0;
        var totalOMove = 0; //check empty filed

        if (moves == "m1" && gameRound.m1) {
          return 0;
        }

        if (moves == "m2" && gameRound.m2) {
          return 0;
        }

        if (moves == "m3" && gameRound.m3) {
          return 0;
        }

        if (moves == "m4" && gameRound.m4) {
          return 0;
        }

        if (moves == "m5" && gameRound.m5) {
          return 0;
          ;
        }

        if (moves == "m6" && gameRound.m6) {
          return 0;
        }

        if (moves == "m7" && gameRound.m7) {
          return 0;
        }

        if (moves == "m8" && gameRound.m8) {
          return 0;
        }

        if (moves == "m9" && gameRound.m9) {
          return 0;
        } //check total moves


        if (gameRound.m1 == "X") {
          totalXMove++;
        }

        if (gameRound.m2 == "X") {
          totalXMove++;
        }

        if (gameRound.m3 == "X") {
          totalXMove++;
        }

        if (gameRound.m4 == "X") {
          totalXMove++;
        }

        if (gameRound.m5 = "X") {
          totalXMove++;
        }

        if (gameRound.m6 == "X") {
          totalXMove++;
        }

        if (gameRound.m7 == "X") {
          totalXMove++;
        }

        if (gameRound.m8 == "X") {
          totalXMove++;
        }

        if (gameRound.m9 == "X") {
          totalXMove++;
        }

        if (gameRound.m1 == "O") {
          totalOMove++;
        }

        if (gameRound.m2 == "O") {
          totalOMove++;
        }

        if (gameRound.m3 == "O") {
          totalOMove++;
        }

        if (gameRound.m4 == "O") {
          totalOMove++;
        }

        if (gameRound.m5 = "O") {
          totalOMove++;
        }

        if (gameRound.m6 == "O") {
          totalOMove++;
        }

        if (gameRound.m7 == "O") {
          totalOMove++;
        }

        if (gameRound.m8 == "O") {
          totalOMove++;
        }

        if (gameRound.m9 == "O") {
          totalOMove++;
        }

        if (totalOMove > totalXMove && moveText == "O") {
          var gameDetail1 = yield _GameRound.default.updateOne({
            _id: gameRound._id
          }, {
            $set: {
              nextTurn: gameRound.firstUser
            }
          });
          return 0;
        }

        if (totalOMove < totalXMove && moveText == "X") {
          var _gameDetail7 = yield _GameRound.default.updateOne({
            _id: gameRound._id
          }, {
            $set: {
              nextTurn: gameRound.secUser
            }
          });

          return 0;
        }

        if (totalOMove == totalXMove && moveText == "O") {
          var _gameDetail8 = yield _GameRound.default.updateOne({
            _id: gameRound._id
          }, {
            $set: {
              nextTurn: gameRound.firstUser
            }
          });

          return 0;
        }

        return 1;
      });

      return function (_x38, _x39, _x40) {
        return _ref19.apply(this, arguments);
      };
    }());
  }

}

var _default = new GameController();

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db250cm9sbGVyL0dhbWVDb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbInBhcmFtcyIsIkdhbWVDb250cm9sbGVyIiwicmVxIiwicmVzIiwiX2lkIiwidXNlciIsIlVzZXJzIiwiVXNlciIsImZpbmRCeUlkIiwiZXJyb3IiLCJnYW1lRGV0YWlsIiwiY2hlY2tHYW1lIiwiR2FtZSIsImZpbmRPbmUiLCJzdGF0dXMiLCJnYW1lVHlwZSIsIndoZXJlIiwibmUiLCJzZWNVc2VyIiwic2F2ZSIsImkiLCJnYW1lUm91bmQiLCJHYW1lUm91bmQiLCJnYW1lIiwicm91bmROYW1lIiwiZmlyc3RVc2VyIiwiZmlyc3RVc2VyVGV4dCIsInNlY1VzZXJUZXh0IiwibmV4dFR1cm4iLCJ3aW5uZXJVc2VyIiwiY2hlY2tHYW1lMSIsImZpcnN0VXNlclBvaW50cyIsInNlY1VzZXJQb2ludHMiLCJ6b2xlV2luIiwiZGF0ZV9vYiIsIkRhdGUiLCJnYW1lSWQiLCJib2R5IiwicG9wdWxhdGUiLCJyb3VuZCIsIm5leHRSb3VuZFN0YXJ0ZWQiLCJ0b3RhbGRyYXciLCJjb3VudCIsInJvdW5kSWQiLCJjaGVja0dhbWVTdGF0dXMiLCJzdGFydFRpbWUiLCJjcmVhdGVkQXQiLCJlbmRUaW1lIiwic2Vjb25kc0RpZmYiLCJkaWZmIiwiY29uc29sZSIsImxvZyIsImdhbWVEZXRhaWwyIiwiZ2FtZURldGFpbDEiLCJ1cGRhdGVNYW55IiwiJHNldCIsInJlc3VsdCIsIm1lc3NhZ2UiLCJnYW1lRGF0YSIsInJvdW5kRGF0YSIsInRvU3RyaW5nIiwibW92ZXMiLCJtb3Zlc3RleHQiLCJnYW1lRGV0YWlsUm91bmQiLCJ1cGRhdGVvYmplY3QiLCJtMSIsIm0yIiwibTMiLCJtNCIsIm01IiwibTYiLCJtNyIsIm04IiwibTkiLCJ3aW5uZXJVc2VySWRQcmUiLCJ3aW5uZXJMb2dpYyIsIndpbm5lclVzZXJJZCIsImZpcnN0UG9pbnQiLCJzZWNQb2ludCIsIm90aGVyUm91bmQiLCJjaGVja0ZpbmFsV2lubmVyIiwiZmluYWxXaW5uZXIiLCJsb29zZUdhbWVJZCIsIm1lc3NhZ2VUZXh0Iiwid2lubmVyRGV0YWlsIiwid2FsbGV0YW1vdW50Iiwid2FsbGV0IiwibmV3V2FsbGV0IiwicGFyc2VJbnQiLCJ1cGRhdGVPbmUiLCJzdWJqZWN0IiwibWVzc2FnZTEiLCJzZW5kbm90aWZpY2F0aW9uIiwiZmlyc3RVc2VyRGV0YWlsIiwiZmlyc3RVc2VyV2FsbGV0Iiwic2VjVXNlckRldGFpbCIsInNlY1VzZXJXYWxsZXQiLCJuZXdXYWxsZXRzZWMiLCJnYW1lRGV0YWlscyIsIndpbm5lcnRleHQiLCJ3aW5uZXJVc2VyaWQiLCJ6b2xlIiwibG9naW5Vc2VyIiwiYXV0b0NvZGUiLCJDb21tYW5IZWxwZXIiLCJyYW5kb21ObyIsImdhbWVDb2RlIiwiQ29tbW9uIiwidXBkYXRlIiwiY29kZSIsImZpcnN0VXNlcnMiLCJzZWNVc2VycyIsInJlY2VpdmVyIiwiR2FtZVJlcXVlc3QiLCJzZW5kZXIiLCJnYW1lcmVxIiwicmVjZWl2ZXJTZXR0aW5nIiwiVXNlclNldHRpbmdzIiwidXNlcklkIiwiaW52aXRlVG9Sb29tIiwiZmluZCIsInJlcXVlc3RJZCIsIndpbm5lcklkIiwibG9vc2VySWQiLCJ1c2VyRGV0YWlsIiwiaXNEZWxldGVkIiwiZ2FtZXMiLCJ0bXAiLCJnYW1lcm91bmQiLCJyb3VuZHMiLCJwdXNoIiwiZ2FtZVJvdW5kcyIsImN1cnJlbnRSb3VuZCIsImdhbWVEZXRhaWxBbGwiLCJ1cGRhdGVkQXQiLCJkZWxldGVPbmUiLCJkZWxldGVNYW55IiwiZGV2aWNlVG9rZW4iLCJub3RpZmljYXRpb25EYXRhIiwidG9Vc2VyIiwiZnJvbVVzZXIiLCJ0aXRsZSIsImNyZWF0ZWRCeSIsInVwZGF0ZWRCeSIsIk5vdGlmaWNhdGlvbnMiLCJzZW5kTm90aWZpY2F0aW9uIiwiZmlyc3RVc2VyU3RhcnQiLCJzZWNVc2VyU3RhcnQiLCJnYW1lRGV0YWlsYSIsIm1vdmVUZXh0IiwidG90YWxYTW92ZSIsInRvdGFsT01v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RDtBQUM1QyxjQUFJaEcsWUFBVyxTQUFTL0IsbUJBQVVtRSxTQUFWLENBQW9CO0FBQUVyRixZQUFBQSxHQUFHLEVBQUVpQixTQUFTLENBQUNqQjtBQUFqQixXQUFwQixFQUE0QztBQUFFbUQsWUFBQUEsSUFBSSxFQUFFO0FBQUUzQixjQUFBQSxRQUFRLEVBQUVQLFNBQVMsQ0FBQ0g7QUFBdEI7QUFBUixXQUE1QyxDQUF4Qjs7QUFDQSxpQkFBTyxDQUFQO0FBQ0g7O0FBQ0QsWUFBSXFJLFVBQVUsSUFBSUQsVUFBZCxJQUE0QkQsUUFBUSxJQUFJLEdBQTVDLEVBQWlEO0FBQzdDLGNBQUloRyxZQUFXLFNBQVMvQixtQkFBVW1FLFNBQVYsQ0FBb0I7QUFBRXJGLFlBQUFBLEdBQUcsRUFBRWlCLFNBQVMsQ0FBQ2pCO0FBQWpCLFdBQXBCLEVBQTRDO0FBQUVtRCxZQUFBQSxJQUFJLEVBQUU7QUFBRTNCLGNBQUFBLFFBQVEsRUFBRVAsU0FBUyxDQUFDSTtBQUF0QjtBQUFSLFdBQTVDLENBQXhCOztBQUNBLGlCQUFPLENBQVA7QUFDSDs7QUFFRCxlQUFPLENBQVA7QUFDSCxPQTV1Q2dCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O2VBbXZDTixJQUFJeEIsY0FBSixFIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyB2YWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnZXhwcmVzcy12YWxpZGF0b3InO1xuaW1wb3J0IENoYXQgZnJvbSAnLi4vTW9kZWxzL0NoYXQnO1xuaW1wb3J0IFVzZXIgZnJvbSAnLi4vTW9kZWxzL1VzZXInO1xuaW1wb3J0IEdhbWUgZnJvbSAnLi4vTW9kZWxzL0dhbWUnO1xuaW1wb3J0IEdhbWVSb3VuZCBmcm9tICcuLi9Nb2RlbHMvR2FtZVJvdW5kJztcblxuaW1wb3J0IHsgYnVpbGRSZXN1bHQgfSBmcm9tICcuLi9IZWxwZXIvUmVxdWVzdEhlbHBlcic7XG5cbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL2NvbnN0YW50cyc7XG5pbXBvcnQgQ29tbWFuSGVscGVyIGZyb20gJy4uL0hlbHBlci9Db21tYW5IZWxwZXInO1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9EYkNvbnRyb2xsZXIvQ29tbW9uRGJDb250cm9sbGVyJztcbmltcG9ydCBHYW1lUmVxdWVzdCBmcm9tICcuLi9Nb2RlbHMvR2FtZVJlcXVlc3QnO1xuaW1wb3J0IE5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vU2VydmljZS9Ob3RpZmljYXRpb25zJztcbmltcG9ydCBVc2VyU2V0dGluZ3MgZnJvbSAnLi4vTW9kZWxzL1VzZXJTZXR0aW5ncyc7XG5pbXBvcnQgeyBleGl0T25FcnJvciB9IGZyb20gJ3dpbnN0b24nO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuXG5jb25zdCBwYXJhbXMgPSBbJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJywgJ2ltYWdlJywgXCJsaW5rXCIsICd0eXBlJ107XG5cbmNsYXNzIEdhbWVDb250cm9sbGVyIHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBCYW5uZXJcbiAgICAgKi9cbiAgICBob21lID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG5cbiAgICAgICAgICAgIGxldCBVc2VycyA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoX2lkKTtcblxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBVc2Vycyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTGlzdCBvZiBhbGwgdGhlIGJhbm5lcnNcbiAgICAgKi9cbiAgICBzdGFydEdhbWUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gJyc7XG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZS5maW5kT25lKHsgc3RhdHVzOiBcInBlbmRpbmdcIiwgZ2FtZVR5cGU6IFwicHVibGljXCIgfSkud2hlcmUoXCJmaXJzdFVzZXJcIikubmUoX2lkKTtcbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcbiAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoY2hlY2tHYW1lLl9pZCk7XG4gICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zZWNVc2VyID0gX2lkO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc3RhdHVzID0gXCJib29rZWRcIjtcbiAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZVJvdW5kID0gYXdhaXQgbmV3IEdhbWVSb3VuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lOiBjaGVja0dhbWUuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm91bmROYW1lOiBcIlJvdW5kIFwiICsgaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlcjogZ2FtZURldGFpbC5maXJzdFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNVc2VyOiBnYW1lRGV0YWlsLnNlY1VzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXJUZXh0OiBcIlhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY1VzZXJUZXh0OiBcIk9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUdXJuOiBnYW1lRGV0YWlsLmZpcnN0VXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbm5lclVzZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiXG5cbiAgICAgICAgICAgICAgICAgICAgfSkuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgZ2FtZURldGFpbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY2hlY2tHYW1lMSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IHN0YXR1czogXCJwZW5kaW5nXCIsIGdhbWVUeXBlOiBcInB1YmxpY1wiLCBmaXJzdFVzZXI6IF9pZCB9KTtcblxuICAgICAgICAgICAgICAgIGlmICghY2hlY2tHYW1lMSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IG5ldyBHYW1lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlcjogX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VjVXNlclBvaW50czogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvbGVXaW46IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiXG4gICAgICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBnYW1lRGV0YWlsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBjaGVja0dhbWUxKTtcbiAgICAgICAgICAgIH1cblxuXG5cblxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHBsYXlHYW1lID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIGxldCBkYXRlX29iID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgIGNvbnN0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZCkucG9wdWxhdGUoW1wiZmlyc3RVc2VyXCIsIFwic2VjVXNlclwiXSk7XG4gICAgICAgIGNvbnN0IHJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRPbmUoeyBnYW1lOiBnYW1lSWQsIG5leHRSb3VuZFN0YXJ0ZWQ6IFwiTm9cIiB9KTtcbiAgICAgICAgY29uc3QgdG90YWxkcmF3ID0gYXdhaXQgR2FtZVJvdW5kLmNvdW50KHsgZ2FtZTogZ2FtZUlkLCBzdGF0dXM6IFwiZHJhd1wiIH0pO1xuICAgICAgICBsZXQgcm91bmRJZCA9IHJvdW5kID8gcm91bmQuX2lkIDogJyc7XG5cbiAgICAgICAgaWYgKHJvdW5kSWQpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hlY2tHYW1lU3RhdHVzKGdhbWVJZCwgcm91bmRJZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ2FtZURldGFpbC5zdGF0dXMgPT0gXCJwZW5kaW5nXCIpIHtcbiAgICAgICAgICAgIC8vIGxldCBkaWZmSW5NaWxsaVNlY29uZHMgPSBNYXRoLmFicyhuZXcgRGF0ZShcIlktbS1kIEg6aTpzXCIpIC0gbmV3IERhdGUoZ2FtZURldGFpbC5jcmVhdGVkQXQpKSAvIDEwMDA7XG5cbiAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBtb21lbnQoZ2FtZURldGFpbC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgdmFyIGVuZFRpbWUgPSBtb21lbnQobmV3IERhdGUoKSk7XG5cbiAgICAgICAgICAgIHZhciBzZWNvbmRzRGlmZiA9IGVuZFRpbWUuZGlmZihzdGFydFRpbWUsICdzZWNvbmRzJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWNvbmRzRGlmZixcInNlY29uZHNEaWZmXCIpXG4gICAgICAgICAgICAvKiBcbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBkYXlzXG4gICAgICAgICAgICBjb25zdCBkYXlzID0gTWF0aC5mbG9vcihkaWZmSW5NaWxsaVNlY29uZHMgLyA4NjQwMCk7XG4gICAgICAgICAgICBkaWZmSW5NaWxsaVNlY29uZHMgLT0gZGF5cyAqIDg2NDAwO1xuICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIGhvdXJzXG4gICAgICAgICAgICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IoZGlmZkluTWlsbGlTZWNvbmRzIC8gMzYwMCkgJSAyNDtcbiAgICAgICAgICAgIGRpZmZJbk1pbGxpU2Vjb25kcyAtPSBob3VycyAqIDM2MDA7XG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgbWludXRlc1xuICAgICAgICAgLyogICAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoZGlmZkluTWlsbGlTZWNvbmRzIC8gNjApICUgNjA7XG4gICAgICAgICAgICBkaWZmSW5NaWxsaVNlY29uZHMgLT0gbWludXRlcyAqIDYwO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaWZmSW5NaWxsaVNlY29uZHNcIiwgZGlmZkluTWlsbGlTZWNvbmRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWludXRlc1wiLCBtaW51dGVzKTsgKi9cblxuICAgICAgICAgICAgaWYgKHNlY29uZHNEaWZmID4gMTEwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwyID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lRGV0YWlsLl9pZCk7XG5cbiAgICAgICAgICAgICAgICBnYW1lRGV0YWlsMi5zdGF0dXMgPSBcInJlamVjdGVkXCI7XG4gICAgICAgICAgICAgICAgZ2FtZURldGFpbDIuc2F2ZSgpO1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsMSA9IGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZURldGFpbC5faWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJyZWplY3RlZFwiIH0gfSk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTm8gT25lIElzIEF2YWlsYWJsZSBQbGVhc2UgVHJ5IEFnYWluIExhdGVyXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMzAxLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiV2FpdGluZyBmb3Igb3Bwb25lbnQgdG8gam9pbi4uLlwiXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAzMDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZ2FtZURldGFpbC5zdGF0dXMgPT0gXCJtYXRjaFwiKSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiR2FtZSBTdGFydGVkXCIsXG4gICAgICAgICAgICAgICAgZ2FtZURhdGE6IGdhbWVEZXRhaWwsXG4gICAgICAgICAgICAgICAgcm91bmREYXRhOiByb3VuZCA/IHJvdW5kIDoge30sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZ2FtZURldGFpbC5zdGF0dXMgPT0gXCJib29rZWRcIiB8fCBnYW1lRGV0YWlsLnN0YXR1cyA9PSBcInJ1bm5pbmdcIikge1xuXG4gICAgICAgICAgICBpZiAoZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkLnRvU3RyaW5nKCkgIT0gX2lkLnRvU3RyaW5nKCkgJiYgZ2FtZURldGFpbC5zZWNVc2VyLl9pZC50b1N0cmluZygpICE9IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJObyBPbmUgSXMgQXZhaWxhYmxlIFBsZWFzZSBUcnkgQWdhaW4gTGF0ZXJcIlxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDMwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkdhbWUgU3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICAgICAgdG90YWxkcmF3OiB0b3RhbGRyYXcgPyB0b3RhbGRyYXcgOiAwLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkdhbWUgU3RhcnRlZFwiLFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQgPyByb3VuZCA6IHt9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgYWRkTW92ZXMgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgeyBnYW1lSWQsIG1vdmVzLCBtb3Zlc3RleHQsIHJvdW5kSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICBjb25zdCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lSWQpLnBvcHVsYXRlKFsnZmlyc3RVc2VyJywgXCJzZWNVc2VyXCJdKTtcblxuICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG5cblxuICAgICAgICBsZXQgbmV4dFR1cm4gPSAnJztcblxuICAgICAgICBjb25zdCBnYW1lRGV0YWlsUm91bmQgPSBhd2FpdCBHYW1lUm91bmQuZmluZEJ5SWQocm91bmRJZCk7XG5cblxuICAgICAgICBpZiAoZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkLnRvU3RyaW5nKCkgPT0gX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgIG5leHRUdXJuID0gZ2FtZURldGFpbC5zZWNVc2VyLl9pZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5leHRUdXJuID0gZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwibW92ZSB0ZXh0XCIsIG1vdmVzdGV4dCk7XG4gICAgICAgIGxldCB1cGRhdGVvYmplY3QgPSB7fTtcbiAgICAgICAgaWYgKG1vdmVzID09IFwibTFcIiAmJiAhZ2FtZURldGFpbFJvdW5kLm0xKSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG0xOiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm0yXCIgJiYgIWdhbWVEZXRhaWxSb3VuZC5tMikge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtMjogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtM1wiICYmICFnYW1lRGV0YWlsUm91bmQubTMpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTM6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibTRcIiAmJiAhZ2FtZURldGFpbFJvdW5kLm00KSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG00OiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm01XCIgJiYgIWdhbWVEZXRhaWxSb3VuZC5tNSkge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtNTogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtNlwiICYmICFnYW1lRGV0YWlsUm91bmQubTYpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTY6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibTdcIiAmJiAhZ2FtZURldGFpbFJvdW5kLm03KSB7XG4gICAgICAgICAgICB1cGRhdGVvYmplY3QgPSB7IG03OiBtb3Zlc3RleHQsIG5leHRUdXJuOiBuZXh0VHVybiwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm04XCIgJiYgIWdhbWVEZXRhaWxSb3VuZC5tOCkge1xuICAgICAgICAgICAgdXBkYXRlb2JqZWN0ID0geyBtODogbW92ZXN0ZXh0LCBuZXh0VHVybjogbmV4dFR1cm4sIHN0YXR1czogXCJydW5uaW5nXCIgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtOVwiICYmICFnYW1lRGV0YWlsUm91bmQubTkpIHtcbiAgICAgICAgICAgIHVwZGF0ZW9iamVjdCA9IHsgbTk6IG1vdmVzdGV4dCwgbmV4dFR1cm46IG5leHRUdXJuLCBzdGF0dXM6IFwicnVubmluZ1wiIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjaGVjayB3aGljaCB1c2VyIG1vdmVcblxuXG4gICAgICAgIC8vbGV0IGNoZWNrTW92ZT0gYXdhaXQgdGhpcy5jaGVja01vdmVzKGdhbWVEZXRhaWxSb3VuZCxtb3Zlc3RleHQsbW92ZXMpO1xuICAgICAgICAvKiAgICBpZihjaGVja01vdmU9PT0wKVxuICAgICAgICAgICB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJHYW1lIFJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgICAgICBnYW1lRGF0YTogZ2FtZURldGFpbCxcbiAgICAgICAgICAgICAgICAgICByb3VuZERhdGE6IGdhbWVEZXRhaWxSb3VuZCxcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgICAgfSAqL1xuXG4gICAgICAgIGlmICh1cGRhdGVvYmplY3QgJiYgdXBkYXRlb2JqZWN0Lm5leHRUdXJuKSB7XG4gICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQudXBkYXRlTWFueSh7IF9pZDogcm91bmRJZCB9LCB7ICRzZXQ6IHVwZGF0ZW9iamVjdCB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRCeUlkKHJvdW5kSWQpO1xuICAgICAgICBjb25zdCB3aW5uZXJVc2VySWRQcmUgPSBhd2FpdCB0aGlzLndpbm5lckxvZ2ljKHJvdW5kKTtcblxuICAgICAgICBpZiAocm91bmQubTEgJiYgcm91bmQubTIgJiYgcm91bmQubTMgJiYgcm91bmQubTQgJiYgcm91bmQubTUgJiYgcm91bmQubTYgJiYgcm91bmQubTcgJiYgcm91bmQubTggJiYgcm91bmQubTkpIHtcblxuICAgICAgICAgICAgY29uc3Qgd2lubmVyVXNlcklkID0gYXdhaXQgdGhpcy53aW5uZXJMb2dpYyhyb3VuZCk7XG4gICAgICAgICAgICBpZiAod2lubmVyVXNlcklkKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IHdpbm5lclVzZXJJZCwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IF9pZCwgc3RhdHVzOiBcImRyYXdcIiB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZmlyc3RQb2ludCA9IGdhbWVEZXRhaWwuZmlyc3RVc2VyUG9pbnRzO1xuICAgICAgICAgICAgbGV0IHNlY1BvaW50ID0gZ2FtZURldGFpbC5zZWNVc2VyUG9pbnRzO1xuXG4gICAgICAgICAgICBpZiAoZ2FtZURldGFpbC5maXJzdFVzZXIuX2lkLnRvU3RyaW5nKCkgPT0gd2lubmVyVXNlcklkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFBvaW50ID0gZmlyc3RQb2ludCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChnYW1lRGV0YWlsLnNlY1VzZXIuX2lkLnRvU3RyaW5nKCkgPT0gd2lubmVyVXNlcklkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBzZWNQb2ludCA9IHNlY1BvaW50ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlTWFueSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyBmaXJzdFVzZXJQb2ludHM6IGZpcnN0UG9pbnQsIHNlY1VzZXJQb2ludHM6IHNlY1BvaW50LCBzdGF0dXM6IFwicnVubmluZ1wiIH0gfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IG90aGVyUm91bmQgPSBhd2FpdCBHYW1lUm91bmQuZmluZE9uZSh7IGdhbWU6IGdhbWVJZCwgc3RhdHVzOiBcInBlbmRpbmdcIiB9KTtcblxuICAgICAgICAgICAgaWYgKCFvdGhlclJvdW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tGaW5hbFdpbm5lciA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcbiAgICAgICAgICAgICAgICBsZXQgZmluYWxXaW5uZXIgPSAnJztcbiAgICAgICAgICAgICAgICBsZXQgbG9vc2VHYW1lSWQgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXJQb2ludHMgPiBjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXJQb2ludHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZmluYWxXaW5uZXIgPSBjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICAgICAgbG9vc2VHYW1lSWQgPSBjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyUG9pbnRzIDwgY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsV2lubmVyID0gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyO1xuICAgICAgICAgICAgICAgICAgICBsb29zZUdhbWVJZCA9IGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmaW5hbFdpbm5lciAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlTWFueSh7IF9pZDogZ2FtZUlkIH0sIHsgJHNldDogeyB3aW5uZXJVc2VyOiBmaW5hbFdpbm5lciwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZVRleHQgPSAnTWF0Y2ggaXMgRHJhdyc7XG4gICAgICAgICAgICAgICAgaWYgKGZpbmFsV2lubmVyICE9IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbm5lckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoZmluYWxXaW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2FsbGV0YW1vdW50ID0gd2lubmVyRGV0YWlsLndhbGxldCA/IHdpbm5lckRldGFpbC53YWxsZXQgOiAwO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrRmluYWxXaW5uZXIuZ2FtZVR5cGUgPT0gXCJwdWJsaWNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdXYWxsZXQgPSBwYXJzZUludCh3YWxsZXRhbW91bnQpICsgcGFyc2VJbnQoY2hlY2tGaW5hbFdpbm5lci56b2xlV2luKSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogZmluYWxXaW5uZXIgfSwgeyAkc2V0OiB7IHdhbGxldDogbmV3V2FsbGV0IH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaW5hbFdpbm5lci50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN1YmplY3QgPSBcIkdhbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlMSA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgbWVzc2FnZSwgc3ViamVjdCwgbG9vc2VHYW1lSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGxvb3NlR2FtZUlkLCBtZXNzYWdlMSwgc3ViamVjdCwgZmluYWxXaW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgXCJ5b3UgaGF2ZSB3b24gXCIgKyBjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4gKyBcIiB6b2xlc1wiLCBzdWJqZWN0LCBsb29zZUdhbWVJZCk7XG5cblxuXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZmluYWxXaW5uZXIsIFwieW91IGhhdmUgd29uIFwiICsgY2hlY2tGaW5hbFdpbm5lci56b2xlV2luICsgXCIgem9sZXNcIiwgc3ViamVjdCwgX2lkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGZpbmFsV2lubmVyLCBtZXNzYWdlMSwgc3ViamVjdCwgX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihfaWQsIG1lc3NhZ2UsIHN1YmplY3QsIGZpbmFsV2lubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGaW5hbFdpbm5lci5nYW1lVHlwZSAhPSBcInB1YmxpY1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2ZpcnN0IHVzZXIgYW1vdW50IHJlZnVuZGVkXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlyc3RVc2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZChjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlyc3RVc2VyV2FsbGV0ID0gZmlyc3RVc2VyRGV0YWlsLndhbGxldCA/IGZpcnN0VXNlckRldGFpbC53YWxsZXQgOiAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3V2FsbGV0ID0gcGFyc2VJbnQoZmlyc3RVc2VyV2FsbGV0KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogZmlyc3RVc2VyRGV0YWlsLl9pZCB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NlYyB1c2VyIGFtb3VudCByZWZ1bmRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlY1VzZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2VjVXNlcldhbGxldCA9IHNlY1VzZXJEZXRhaWwud2FsbGV0ID8gc2VjVXNlckRldGFpbC53YWxsZXQgOiAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3V2FsbGV0c2VjID0gcGFyc2VJbnQoc2VjVXNlcldhbGxldCkgKyBwYXJzZUludChjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXNlci51cGRhdGVPbmUoeyBfaWQ6IHNlY1VzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyB3YWxsZXQ6IG5ld1dhbGxldHNlYyB9IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy9zZW5kIG5vdGlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiTWF0Y2ggaXMgZHJhdyBhbmQgem9sZXMgYXJlIHJlZnVuZGVkIFwiO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlcik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVNYW55KHsgX2lkOiBnYW1lSWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJjb21wbGV0ZWRcIiB9IH0pO1xuXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBnYW1lRGV0YWlscyA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcblxuXG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgZ2FtZURhdGE6IGdhbWVEZXRhaWxzLFxuICAgICAgICAgICAgICAgICAgICByb3VuZERhdGE6IHJvdW5kLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDYsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBtZXNzYWdlVGV4dCA9ICdNYXRjaCBpcyBEcmF3JztcbiAgICAgICAgICAgIGlmICh3aW5uZXJVc2VySWQgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGlmICh3aW5uZXJVc2VySWQgPT0gX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VUZXh0LFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAod2lubmVyVXNlcklkUHJlICE9IFwiXCIpIHtcblxuXG4gICAgICAgICAgICBpZiAod2lubmVyVXNlcklkUHJlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IHdpbm5lclVzZXI6IHdpbm5lclVzZXJJZFByZSwgc3RhdHVzOiBcImNvbXBsZXRlZFwiIH0gfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgbGV0IGZpcnN0UG9pbnQgPSBnYW1lRGV0YWlsLmZpcnN0VXNlclBvaW50cztcbiAgICAgICAgICAgIGxldCBzZWNQb2ludCA9IGdhbWVEZXRhaWwuc2VjVXNlclBvaW50cztcblxuICAgICAgICAgICAgaWYgKGdhbWVEZXRhaWwuZmlyc3RVc2VyLl9pZC50b1N0cmluZygpID09IHdpbm5lclVzZXJJZFByZS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RQb2ludCA9IGZpcnN0UG9pbnQgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZ2FtZURldGFpbC5zZWNVc2VyLl9pZC50b1N0cmluZygpID09IHdpbm5lclVzZXJJZFByZS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgc2VjUG9pbnQgPSBzZWNQb2ludCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU1hbnkoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgZmlyc3RVc2VyUG9pbnRzOiBmaXJzdFBvaW50LCBzZWNVc2VyUG9pbnRzOiBzZWNQb2ludCwgc3RhdHVzOiBcInJ1bm5pbmdcIiB9IH0pO1xuXG4gICAgICAgICAgICBjb25zdCBvdGhlclJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRPbmUoeyBnYW1lOiBnYW1lSWQsIHN0YXR1czogXCJwZW5kaW5nXCIgfSk7XG5cbiAgICAgICAgICAgIGlmICghb3RoZXJSb3VuZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrRmluYWxXaW5uZXIgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZCk7XG4gICAgICAgICAgICAgICAgbGV0IGZpbmFsV2lubmVyID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IGxvb3NlR2FtZUlkID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyUG9pbnRzID4gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyUG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbmFsV2lubmVyID0gY2hlY2tGaW5hbFdpbm5lci5maXJzdFVzZXI7XG4gICAgICAgICAgICAgICAgICAgIGxvb3NlR2FtZUlkID0gY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlclBvaW50cyA8IGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlclBvaW50cykge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbFdpbm5lciA9IGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlcjtcbiAgICAgICAgICAgICAgICAgICAgbG9vc2VHYW1lSWQgPSBjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lLnVwZGF0ZU1hbnkoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgd2lubmVyVXNlcjogZmluYWxXaW5uZXIsIHN0YXR1czogXCJjb21wbGV0ZWRcIiB9IH0pO1xuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlVGV4dCA9ICdNYXRjaCBpcyBEcmF3JztcbiAgICAgICAgICAgICAgICBpZiAoZmluYWxXaW5uZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5uZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGZpbmFsV2lubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdhbGxldGFtb3VudCA9IHdpbm5lckRldGFpbC53YWxsZXQgPyB3aW5uZXJEZXRhaWwud2FsbGV0IDogMDtcblxuXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdXYWxsZXQgPSBwYXJzZUludCh3YWxsZXRhbW91bnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZpbmFsV2lubmVyLmdhbWVUeXBlID09IFwicHVibGljXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbikgKyBwYXJzZUludChjaGVja0ZpbmFsV2lubmVyLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXNlci51cGRhdGVPbmUoeyBfaWQ6IGZpbmFsV2lubmVyIH0sIHsgJHNldDogeyB3YWxsZXQ6IG5ld1dhbGxldCB9IH0pO1xuXG5cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWxXaW5uZXIgPT0gX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaCBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJZb3UgaGF2ZSBXb24gVGhlIG1hdGNoIFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN1YmplY3QgPSBcIkdhbWVcIjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgXCJ5b3UgaGF2ZSB3b24gXCIgKyB3aW5uZXJEZXRhaWwuem9sZVdpbiArIFwiIHpvbGVzXCIsIHN1YmplY3QsIGxvb3NlR2FtZUlkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGxvb3NlR2FtZUlkLCBtZXNzYWdlMSwgc3ViamVjdCwgZmluYWxXaW5uZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKF9pZCwgbWVzc2FnZSwgc3ViamVjdCwgbG9vc2VHYW1lSWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0ID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIFdvbiBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihmaW5hbFdpbm5lciwgXCJ5b3UgaGF2ZSB3b24gXCIgKyB3aW5uZXJEZXRhaWwuem9sZVdpbiArIFwiIHpvbGVzXCIsIHN1YmplY3QsIF9pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihfaWQsIG1lc3NhZ2UsIHN1YmplY3QsIGZpbmFsV2lubmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihmaW5hbFdpbm5lciwgbWVzc2FnZTEsIHN1YmplY3QsIGxvb3NlR2FtZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2ZpcnN0IHVzZXIgYW1vdW50IHJlZnVuZGVkXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdFVzZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0VXNlcldhbGxldCA9IGZpcnN0VXNlckRldGFpbC53YWxsZXQgPyBmaXJzdFVzZXJEZXRhaWwud2FsbGV0IDogMDtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3V2FsbGV0ID0gcGFyc2VJbnQoZmlyc3RVc2VyV2FsbGV0KSArIHBhcnNlSW50KGNoZWNrRmluYWxXaW5uZXIuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiBmaXJzdFVzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyB3YWxsZXQ6IG5ld1dhbGxldCB9IH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgLy9zZWMgdXNlciBhbW91bnQgcmVmdW5kZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlY1VzZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGNoZWNrRmluYWxXaW5uZXIuc2VjVXNlcik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWNVc2VyV2FsbGV0ID0gc2VjVXNlckRldGFpbC53YWxsZXQgPyBzZWNVc2VyRGV0YWlsLndhbGxldCA6IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1dhbGxldHNlYyA9IHBhcnNlSW50KHNlY1VzZXJXYWxsZXQpICsgcGFyc2VJbnQoY2hlY2tGaW5hbFdpbm5lci56b2xlV2luKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgVXNlci51cGRhdGVPbmUoeyBfaWQ6IHNlY1VzZXJEZXRhaWwuX2lkIH0sIHsgJHNldDogeyB3YWxsZXQ6IG5ld1dhbGxldHNlYyB9IH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vc2VuZCBub3RpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIk1hdGNoIGlzIGRyYXcgYW5kIHpvbGVzIGFyZSByZWZ1bmRlZCBcIjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YmplY3QgPSBcIkdhbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGNoZWNrRmluYWxXaW5uZXIuZmlyc3RVc2VyLCBtZXNzYWdlLCBzdWJqZWN0LCBjaGVja0ZpbmFsV2lubmVyLnNlY1VzZXIpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oY2hlY2tGaW5hbFdpbm5lci5zZWNVc2VyLCBtZXNzYWdlLCBzdWJqZWN0LCBjaGVja0ZpbmFsV2lubmVyLmZpcnN0VXNlcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZ2FtZURldGFpbHMgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZCk7XG5cblxuXG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZVRleHQsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlscyxcbiAgICAgICAgICAgICAgICAgICAgcm91bmREYXRhOiByb3VuZCxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNjA2LCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgbWVzc2FnZVRleHQgPSAncmVzdWx0JztcblxuXG4gICAgICAgICAgICBpZiAod2lubmVyVXNlcklkUHJlLnRvU3RyaW5nKCkgPT0gX2lkLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dCA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZVRleHQgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VUZXh0LFxuICAgICAgICAgICAgICAgIGdhbWVEYXRhOiBnYW1lRGV0YWlsLFxuICAgICAgICAgICAgICAgIHJvdW5kRGF0YTogcm91bmQsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA2MDAsIHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiR2FtZSBSdW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgZ2FtZURhdGE6IGdhbWVEZXRhaWwsXG4gICAgICAgICAgICAgICAgcm91bmREYXRhOiByb3VuZCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aW5uZXJMb2dpYyA9IGFzeW5jIChyb3VuZCkgPT4ge1xuXG4gICAgICAgIHZhciB3aW5uZXJ0ZXh0ID0gJyc7XG4gICAgICAgIC8qICAgaWYgKHJvdW5kLm0xICYmIHJvdW5kLm0yICYmIHJvdW5kLm0zICYmIHJvdW5kLm00ICYmIHJvdW5kLm01ICYmIHJvdW5kLm02ICYmIHJvdW5kLm03ICYmIHJvdW5kLm04ICYmIHJvdW5kLm05KSB7ICovXG4gICAgICAgIGlmIChyb3VuZC5tMSA9PSByb3VuZC5tMiAmJiByb3VuZC5tMiA9PSByb3VuZC5tMyAmJiByb3VuZC5tMSAmJiByb3VuZC5tMiAmJiByb3VuZC5tMykge1xuICAgICAgICAgICAgd2lubmVydGV4dCA9IHJvdW5kLm0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3VuZC5tMSA9PSByb3VuZC5tNCAmJiByb3VuZC5tNCA9PSByb3VuZC5tNyAmJiByb3VuZC5tMSAmJiByb3VuZC5tNCAmJiByb3VuZC5tNykge1xuICAgICAgICAgICAgd2lubmVydGV4dCA9IHJvdW5kLm0xO1xuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdW5kLm0yID09IHJvdW5kLm01ICYmIHJvdW5kLm01ID09IHJvdW5kLm04ICYmIHJvdW5kLm0zICYmIHJvdW5kLm02ICYmIHJvdW5kLm04KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvdW5kLm0zID09IHJvdW5kLm02ICYmIHJvdW5kLm02ID09IHJvdW5kLm05ICYmIHJvdW5kLm0zICYmIHJvdW5kLm02ICYmIHJvdW5kLm05KSB7XG4gICAgICAgICAgICB3aW5uZXJ0ZXh0ID0gcm91bmQubTM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocm91bmQubTQgPT0gcm91bmQubTUgJiYgcm91bmQubTUgPT0gcm91bmQubTYgJiYgcm91bmQubTQgJiYgcm91bmQubTUgJiYgcm91bmQubTYpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tNDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm91bmQubTcgPT0gcm91bmQubTggJiYgcm91bmQubTggPT0gcm91bmQubTkgJiYgcm91bmQubTcgJiYgcm91bmQubTggJiYgcm91bmQubTkpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tNztcbiAgICAgICAgfVxuICAgICAgICBpZiAocm91bmQubTEgPT0gcm91bmQubTUgJiYgcm91bmQubTUgPT0gcm91bmQubTkgJiYgcm91bmQubTEgJiYgcm91bmQubTUgJiYgcm91bmQubTkpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm91bmQubTMgPT0gcm91bmQubTUgJiYgcm91bmQubTUgPT0gcm91bmQubTcgJiYgcm91bmQubTMgJiYgcm91bmQubTUgJiYgcm91bmQubTcpIHtcbiAgICAgICAgICAgIHdpbm5lcnRleHQgPSByb3VuZC5tMztcbiAgICAgICAgfVxuICAgICAgICAvKiAgICB9ICovXG4gICAgICAgIGxldCB3aW5uZXJVc2VyaWQgPSAnJztcblxuICAgICAgICBpZiAod2lubmVydGV4dCA9PSByb3VuZC5maXJzdFVzZXJUZXh0KSB7XG5cbiAgICAgICAgICAgIHdpbm5lclVzZXJpZCA9IHJvdW5kLmZpcnN0VXNlcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh3aW5uZXJ0ZXh0ID09ICcnKSB7XG4gICAgICAgICAgICB3aW5uZXJVc2VyaWQgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdpbm5lclVzZXJpZCA9IHJvdW5kLnNlY1VzZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gd2lubmVyVXNlcmlkO1xuICAgIH1cblxuICAgIHN0YXJ0R2FtZVByaXZhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgem9sZSB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBpZiAoIXpvbGUgfHwgem9sZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7IG1lc3NhZ2U6IFwiUGxlYXNlIFByb3ZpZGUgWm9sZVwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGxvZ2luVXNlciA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoX2lkKTtcbiAgICAgICAgICAgIGlmIChsb2dpblVzZXIud2FsbGV0IDwgem9sZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwgeyBtZXNzYWdlOiBcIkluc3VmZmljaWVudCB6b2xlXCIgfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZTEgPSBhd2FpdCBHYW1lLmZpbmRPbmUoeyBzdGF0dXM6IFwicGVuZGluZ1wiLCBmaXJzdFVzZXI6IF9pZCwgZ2FtZVR5cGU6IFwicHJpdmF0ZVwiIH0pO1xuXG4gICAgICAgICAgICBsZXQgYXV0b0NvZGUgPSBDb21tYW5IZWxwZXIucmFuZG9tTm8oMTExMTExMTEsIDk5OTk5OTk5KTtcbiAgICAgICAgICAgIGlmICghY2hlY2tHYW1lMSkge1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgbmV3IEdhbWUoe1xuICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICBzZWNVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICB6b2xlV2luOiB6b2xlLFxuICAgICAgICAgICAgICAgICAgICBnYW1lVHlwZTogXCJwcml2YXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb2RlOiBhdXRvQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIlxuICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdhbWVEZXRhaWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICBhd2FpdCBDb21tb24udXBkYXRlKEdhbWUsIHtfaWQ6IGNoZWNrR2FtZTEuX2lkfSwge3N0YXR1czogXCJjb21wbGV0ZWRcIn0pO1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgbmV3IEdhbWUoe1xuICAgICAgICAgICAgICAgICAgICBmaXJzdFVzZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICBzZWNVc2VyUG9pbnRzOiAwLFxuICAgICAgICAgICAgICAgICAgICB6b2xlV2luOiB6b2xlLFxuICAgICAgICAgICAgICAgICAgICBnYW1lVHlwZTogXCJwcml2YXRlXCIsXG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb2RlOiBhdXRvQ29kZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBcInBlbmRpbmdcIlxuICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGdhbWVEZXRhaWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBjaGVja0dhbWUxKTtcblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBqb2luR2FtZVByaXZhdGUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgY29kZSB9ID0gcmVxLmJvZHk7XG5cbiAgICAgICAgICAgIGxldCBjaGVja0dhbWUgPSBhd2FpdCBHYW1lLmZpbmRPbmUoeyBzdGF0dXM6IFwicGVuZGluZ1wiLCBnYW1lQ29kZTogY29kZSB9KS53aGVyZShcImZpcnN0VXNlclwiKS5uZShfaWQpXG4gICAgICAgICAgICBpZiAoIWNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBtZXNzYWdlOiBcImludmFsaWQgQ29kZVwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGxvZ2luVXNlciA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoX2lkKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibG9naW5Vc2VyLndhbGxldFwiK2xvZ2luVXNlci53YWxsZXQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjaGVja0dhbWUuem9sZVdpblwiICsgY2hlY2tHYW1lLnpvbGVXaW4pO1xuICAgICAgICAgICAgaWYgKGxvZ2luVXNlci53YWxsZXQpIHtcbiAgICAgICAgICAgICAgICBpZiAobG9naW5Vc2VyLndhbGxldCA8IGNoZWNrR2FtZS56b2xlV2luKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwgeyBtZXNzYWdlOiBcIkluc3VmZmljaWVudCB6b2xlXCIgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHsgbWVzc2FnZTogXCJJbnN1ZmZpY2llbnQgem9sZVwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChjaGVja0dhbWUuX2lkKTtcbiAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNlY1VzZXIgPSBfaWQ7XG4gICAgICAgICAgICAgICAgLy8gZ2FtZURldGFpbC5zdGF0dXMgPSBcImJvb2tlZFwiO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc3RhdHVzID0gXCJtYXRjaFwiO1xuICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc2F2ZSgpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnYW1lUm91bmQgPSBhd2FpdCBuZXcgR2FtZVJvdW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWU6IGNoZWNrR2FtZS5faWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByb3VuZE5hbWU6IFwiUm91bmQgXCIgKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RVc2VyOiBnYW1lRGV0YWlsLmZpcnN0VXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY1VzZXI6IGdhbWVEZXRhaWwuc2VjVXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUdXJuOiBnYW1lRGV0YWlsLmZpcnN0VXNlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlclRleHQ6IFwiWFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VjVXNlclRleHQ6IFwiT1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lubmVyVXNlcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1czogXCJwZW5kaW5nXCJcblxuICAgICAgICAgICAgICAgICAgICB9KS5zYXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbGV0IGZpcnN0VXNlcnMgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKGdhbWVEZXRhaWwuZmlyc3RVc2VyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0dXNlclwiLGZpcnN0VXNlcnMud2FsbGV0KVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZmlyc3RVc2Vycy53YWxsZXQgPSBwYXJzZUludChmaXJzdFVzZXJzLndhbGxldCkgLSBjaGVja0dhbWUuem9sZVdpbjtcbiAgICAgICAgICAgICAgICBmaXJzdFVzZXJzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0dXNlckRvbmVcIixmaXJzdFVzZXJzLndhbGxldClcblxuICAgICAgICAgICAgICAgIGxldCBzZWNVc2VycyA9IGF3YWl0IFVzZXIuZmluZEJ5SWQoX2lkKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlY3VzZXJcIixzZWNVc2Vycy53YWxsZXQpXG4gICAgICAgICAgICAgICAgc2VjVXNlcnMud2FsbGV0ID0gcGFyc2VJbnQoc2VjVXNlcnMud2FsbGV0KSAtIGNoZWNrR2FtZS56b2xlV2luO1xuICAgICAgICAgICAgICAgIHNlY1VzZXJzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNlY3VzZXJEb25lXCIsc2VjVXNlcnMud2FsbGV0KVxuICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBjaGVja0dhbWUuem9sZVdpbiArIFwiIHpvbGVzIGlzIGR1ZHVjdGVkIGZyb20geW91ciB3YWxsZXRcIjtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oY2hlY2tHYW1lLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgX2lkKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oX2lkLCBtZXNzYWdlLCBzdWJqZWN0LCBjaGVja0dhbWUuZmlyc3RVc2VyKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgZ2FtZURldGFpbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBtZXNzYWdlOiBcImludmFsaWQgQ29kZVwiIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHNlbmRSZXF1ZXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG5cbiAgICAgICAgICAgIGNvbnN0IHsgcmVjZWl2ZXIsIGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWNlaXZlciwgXCItLVwiLCBnYW1lSWQpXG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZVJlcXVlc3QuZmluZE9uZSh7IHN0YXR1czogXCJwZW5kaW5nXCIsIHNlbmRlcjogX2lkLCByZWNlaXZlcjogcmVjZWl2ZXIsIGdhbWU6IGdhbWVJZCB9KTtcbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJyZXF1ZXN0IGFscmVhZHkgc2VudFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGdhbWVyZXEgPSBhd2FpdCBuZXcgR2FtZVJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXI6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWl2ZXI6IHJlY2VpdmVyLFxuICAgICAgICAgICAgICAgICAgICBnYW1lOiBnYW1lSWRcblxuICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcblxuXG4gICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcInNlbmQgYSByZXF1ZXN0IGZvciBwbGF5IGdhbWVcIjtcbiAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY2VpdmVyU2V0dGluZyA9IGF3YWl0IFVzZXJTZXR0aW5ncy5maW5kT25lKHsgdXNlcklkOiByZWNlaXZlciB9KTtcbiAgICAgICAgICAgICAgICBpZihyZWNlaXZlclNldHRpbmcuaW52aXRlVG9Sb29tPT10cnVlKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKHJlY2VpdmVyLCBtZXNzYWdlLCBzdWJqZWN0LCBfaWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBnYW1lcmVxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3RMaXN0ID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICAvLyBjb25zdCB7IHJlY2VpdmVyLGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhfaWQpO1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWVSZXF1ZXN0LmZpbmQoeyBzdGF0dXM6IFwicGVuZGluZ1wiLCByZWNlaXZlcjogX2lkIH0pLnBvcHVsYXRlKFtcInNlbmRlclwiLCBcInJlY2VpdmVyXCIsIFwiZ2FtZVwiXSk7XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG5cblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgY2hlY2tHYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNDAwLCB7IFwibWVzc2FnZVwiOiBcIm5vdCBmb3VuZFwiIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWNjZXB0UmVxdWVzdCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyBzdGF0dXMsIHJlcXVlc3RJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZVJlcXVlc3QuZmluZE9uZSh7IHN0YXR1czogXCJwZW5kaW5nXCIsIF9pZDogcmVxdWVzdElkIH0pXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjaGVja0dhbWUpO1xuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSZXF1ZXN0LnVwZGF0ZU9uZSh7IF9pZDogcmVxdWVzdElkIH0sIHsgJHNldDogeyBzdGF0dXM6IHN0YXR1cyB9IH0pO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gXCJhY2NlcHRlZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChjaGVja0dhbWUuZ2FtZSk7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc2VjVXNlciA9IF9pZDtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zdGF0dXMgPSBcImJvb2tlZFwiO1xuICAgICAgICAgICAgICAgICAgICBnYW1lRGV0YWlsLnNhdmUoKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA1OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBnYW1lUm91bmQgPSBhd2FpdCBuZXcgR2FtZVJvdW5kKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lOiBnYW1lRGV0YWlsLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3VuZE5hbWU6IFwiUm91bmQgXCIgKyBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlcjogZ2FtZURldGFpbC5maXJzdFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjVXNlcjogZ2FtZURldGFpbC5zZWNVc2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0VXNlclRleHQ6IFwiWFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY1VzZXJUZXh0OiBcIk9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VHVybjogZ2FtZURldGFpbC5maXJzdFVzZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lubmVyVXNlcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLnNhdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiYWNjZXB0IHlvdXIgcmVxdWVzdCBmb3IgcGxheSBnYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsID0gYXdhaXQgR2FtZS5maW5kQnlJZChjaGVja0dhbWUuZ2FtZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJyZWplY3QgeW91ciByZXF1ZXN0IGZvciBwbGF5IGdhbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YmplY3QgPSBcIkdhbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZ2FtZURldGFpbCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLmZpcnN0VXNlciwgbWVzc2FnZSwgc3ViamVjdCwgX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNoZWNrR2FtZTEgPSBhd2FpdCBHYW1lUmVxdWVzdC5maW5kT25lKHsgX2lkOiByZXF1ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIGNoZWNrR2FtZTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHsgXCJtZXNzYWdlXCI6IFwiUm9vbSBDb2RlIGlzIEludmFsaWRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1aXRHYW1lID0gYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IF9pZCB9ID0gcmVxLnVzZXI7XG4gICAgICAgICAgICBjb25zdCB7IGdhbWVJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgICAgICBsZXQgY2hlY2tHYW1lID0gYXdhaXQgR2FtZS5maW5kQnlJZChnYW1lSWQpXG5cbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcbiAgICAgICAgICAgICAgICBsZXQgd2lubmVySWQgPSAnJztcbiAgICAgICAgICAgICAgICBsZXQgbG9vc2VySWQgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tHYW1lLmZpcnN0VXNlci50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbm5lcklkID0gY2hlY2tHYW1lLnNlY1VzZXI7XG4gICAgICAgICAgICAgICAgICAgIGxvb3NlcklkID0gY2hlY2tHYW1lLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbm5lcklkID0gY2hlY2tHYW1lLmZpcnN0VXNlcjtcbiAgICAgICAgICAgICAgICAgICAgbG9vc2VySWQgPSBjaGVja0dhbWUuc2VjVXNlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU1hbnkoeyBnYW1lOiBnYW1lSWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJjb21wbGV0ZWRcIiB9IH0pO1xuXG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVNYW55KHsgX2lkOiBnYW1lSWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJjb21wbGV0ZWRcIiwgd2lubmVyVXNlcjogd2lubmVySWQgfSB9KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKHdpbm5lcklkKTtcblxuICAgICAgICAgICAgICAgIGxldCB3YWxsZXRhbW91bnQgPSB1c2VyRGV0YWlsLndhbGxldCA/IHVzZXJEZXRhaWwud2FsbGV0IDogMDtcbiAgICAgICAgICAgICAgICBsZXQgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KTtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tHYW1lLmdhbWVUeXBlID09IFwicHVibGljXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGNoZWNrR2FtZS56b2xlV2luKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChjaGVja0dhbWUuem9sZVdpbikgKyBwYXJzZUludChjaGVja0dhbWUuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogdXNlckRldGFpbC5faWQgfSwgeyAkc2V0OiB7IHdhbGxldDogbmV3V2FsbGV0IH0gfSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlMSA9IFwiWW91IGhhdmUgTG9zZSBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbih3aW5uZXJJZCwgbWVzc2FnZSwgc3ViamVjdCwgbG9vc2VySWQpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihsb29zZXJJZCwgbWVzc2FnZTEsIHN1YmplY3QsIHdpbm5lcklkKTtcblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCBjaGVja0dhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHsgXCJtZXNzYWdlXCI6IFwibm90IGZvdW5kXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnYW1lSGlzdG9yeSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWUuZmluZCh7IGlzRGVsZXRlZDogZmFsc2UgfSkucG9wdWxhdGUoW1wiZmlyc3RVc2VyXCIsIFwic2VjVXNlclwiXSlcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGlmIChjaGVja0dhbWUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjaGVja0dhbWUpO1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZ2FtZXMgb2YgY2hlY2tHYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0bXAgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgdG1wLmdhbWUgPSBnYW1lcztcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVyb3VuZCA9IGF3YWl0IEdhbWVSb3VuZC5maW5kKHsgZ2FtZTogZ2FtZXMuX2lkIH0pLnBvcHVsYXRlKFtcImZpcnN0VXNlclwiLCBcInNlY1VzZXJcIl0pO1xuICAgICAgICAgICAgICAgICAgICB0bXAucm91bmRzID0gZ2FtZXJvdW5kO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0bXApXG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJub3QgZm91bmRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdhbWVEZXRhaWwgPSBhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgX2lkIH0gPSByZXEudXNlcjtcbiAgICAgICAgICAgIGNvbnN0IHsgZ2FtZUlkIH0gPSByZXEuYm9keTtcbiAgICAgICAgICAgIGxldCBjaGVja0dhbWUgPSBhd2FpdCBHYW1lLmZpbmRPbmUoeyBpc0RlbGV0ZWQ6IGZhbHNlLCBfaWQ6IGdhbWVJZCB9KVxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHt9O1xuICAgICAgICAgICAgaWYgKGNoZWNrR2FtZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoZWNrR2FtZSk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjaGVja0dhbWU7XG4gICAgICAgICAgICAgICAgbGV0IGdhbWVyb3VuZCA9IGF3YWl0IEdhbWVSb3VuZC5maW5kKHsgZ2FtZTogY2hlY2tHYW1lLl9pZCB9KTtcbiAgICAgICAgICAgICAgICByZXN1bHQucm91bmRzID0gZ2FtZXJvdW5kO1xuXG5cblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA0MDAsIHsgXCJtZXNzYWdlXCI6IFwibm90IGZvdW5kXCIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFJldHVybnMgdW5zcGVjaWZpZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgNTAwLCB7fSwge30sIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGFydE5leHRSb3VuZCA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICBjb25zdCB7IGdhbWVJZCwgcm91bmRJZCB9ID0gcmVxLmJvZHk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgZ2FtZVJvdW5kcyA9IGF3YWl0IEdhbWVSb3VuZC51cGRhdGVPbmUoeyBfaWQ6IHJvdW5kSWQgfSwgeyAkc2V0OiB7IG5leHRSb3VuZFN0YXJ0ZWQ6IFwiWWVzXCIgfSB9KTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRSb3VuZCA9IGF3YWl0IEdhbWVSb3VuZC5maW5kQnlJZChyb3VuZElkKTtcbiAgICAgICAgICAgIGNvbnN0IHJvdW5kID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRPbmUoeyBnYW1lOiBnYW1lSWQsIG5leHRSb3VuZFN0YXJ0ZWQ6IFwiTm9cIiB9KTtcbiAgICAgICAgICAgIGlmIChyb3VuZCkge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Um91bmQud2lubmVyVXNlcikge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQudXBkYXRlT25lKHsgX2lkOiByb3VuZC5faWQgfSwgeyAkc2V0OiB7IG5leHRUdXJuOiBjdXJyZW50Um91bmQud2lubmVyVXNlciB9IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU9uZSh7IF9pZDogcm91bmQuX2lkIH0sIHsgJHNldDogeyBuZXh0VHVybjogY3VycmVudFJvdW5kLmZpcnN0VXNlciB9IH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiR2FtZSBSdW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgZ2FtZURhdGE6IGdhbWVSb3VuZHMsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDIwMCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgY2hlY2tHYW1lU3RhdHVzID0gYXN5bmMgKGdhbWVJZCwgcm91bmRJZCkgPT4ge1xuICAgICAgICBjb25zdCBnYW1lRGV0YWlsQWxsID0gYXdhaXQgR2FtZS5maW5kKHsgaXNEZWxldGVkOiBmYWxzZSwgX2lkOiBnYW1lSWQgfSkucG9wdWxhdGUoW1wiZmlyc3RVc2VyXCIsIFwic2VjVXNlclwiXSk7XG5cblxuICAgICAgICBmb3IgKGNvbnN0IGdhbWVzIG9mIGdhbWVEZXRhaWxBbGwpIHtcblxuICAgICAgICAgICAgaWYgKGdhbWVzLnN0YXR1cyA9PSBcInJ1bm5pbmdcIiB8fCBnYW1lcy5zdGF0dXMgPT0gXCJib29rZWRcIikge1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgcm91bmRzID0gYXdhaXQgR2FtZVJvdW5kLmZpbmRCeUlkKHJvdW5kSWQpO1xuXG5cbiAgICAgICAgICAgICAgICBpZiAocm91bmRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFydFRpbWUgPSBtb21lbnQocm91bmRzLnVwZGF0ZWRBdCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbmRUaW1lID0gbW9tZW50KG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIHZhciBob3Vyc0RpZmYgPSBlbmRUaW1lLmRpZmYoc3RhcnRUaW1lLCAnaG91cnMnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0hvdXJzOicgKyBob3Vyc0RpZmYpO1xuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIHZhciBtaW51dGVzRGlmZiA9IGVuZFRpbWUuZGlmZihzdGFydFRpbWUsICdtaW51dGVzJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdNaW51dGVzOicgKyBtaW51dGVzRGlmZik7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlY29uZHNEaWZmID0gZW5kVGltZS5kaWZmKHN0YXJ0VGltZSwgJ3NlY29uZHMnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlY29uZHM6JyArIHNlY29uZHNEaWZmKTtcblxuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGRpZmZJbk1pbGxpU2Vjb25kcyA9IE1hdGguYWJzKG5ldyBEYXRlKCkgLSBuZXcgRGF0ZShyb3VuZHMudXBkYXRlZEF0KSkgLyAxMDAwO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBzZWNvbmRzID0gTWF0aC5mbG9vcihkaWZmSW5NaWxsaVNlY29uZHMgLyAxMDAwKSA7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKGRpZmZJbk1pbGxpU2Vjb25kcyAvIDYwKSAlIDYwO1xuICAgICAgICAgICAgICAgICAgICAvLyBkaWZmSW5NaWxsaVNlY29uZHMgLT0gbWludXRlcyAqIDYwO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1pblwiLCBtaW51dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJzZWNvbmRzXCIsIHNlY29uZHMpO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlY29uZHNEaWZmID4gMzApIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdW5kcy5uZXh0VHVybikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3VuZHMubmV4dFR1cm4gPT0gcm91bmRzLmZpcnN0VXNlci50b1N0cmluZygpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVzLl9pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuc2VjVXNlciB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQudXBkYXRlTWFueSh7IGdhbWU6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuc2VjVXNlciB9IH0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHdpbm5lckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQocm91bmRzLnNlY1VzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2FsbGV0YW1vdW50ID0gd2lubmVyRGV0YWlsLndhbGxldCA/IHdpbm5lckRldGFpbC53YWxsZXQgOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdXYWxsZXQgPSBwYXJzZUludCh3YWxsZXRhbW91bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVzLmdhbWVUeXBlID09IFwicHVibGljXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChnYW1lcy56b2xlV2luKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChnYW1lcy56b2xlV2luKSArIHBhcnNlSW50KGdhbWVzLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogcm91bmRzLnNlY1VzZXIgfSwgeyAkc2V0OiB7IHdhbGxldDogbmV3V2FsbGV0IH0gfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWVzc2FnZTEgPSBcIllvdSBoYXZlIExvc2UgVGhlIG1hdGNoXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLnNlY1VzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGdhbWVEZXRhaWwuZmlyc3RVc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGdhbWVEZXRhaWwuZmlyc3RVc2VyLCBtZXNzYWdlMSwgc3ViamVjdCwgZ2FtZURldGFpbC5zZWNVc2VyKTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZWxzZVwiLCBtaW51dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVzLl9pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuZmlyc3RVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZXMuX2lkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIsIHdpbm5lclVzZXI6IHJvdW5kcy5maXJzdFVzZXIgfSB9KTtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3aW5uZXJEZXRhaWwgPSBhd2FpdCBVc2VyLmZpbmRCeUlkKHJvdW5kcy5maXJzdFVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2FsbGV0YW1vdW50ID0gd2lubmVyRGV0YWlsLndhbGxldCA/IHdpbm5lckRldGFpbC53YWxsZXQgOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXdXYWxsZXQgPSBwYXJzZUludCh3YWxsZXRhbW91bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVzLmdhbWVUeXBlID09IFwicHVibGljXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChnYW1lcy56b2xlV2luKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCkgKyBwYXJzZUludChnYW1lcy56b2xlV2luKSArIHBhcnNlSW50KGdhbWVzLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBVc2VyLnVwZGF0ZU9uZSh7IF9pZDogcm91bmRzLmZpcnN0VXNlciB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIllvdSBoYXZlIFdvbiBUaGUgbWF0Y2hcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UxID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3ViamVjdCA9IFwiR2FtZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNlbmRub3RpZmljYXRpb24oZ2FtZURldGFpbC5maXJzdFVzZXIsIG1lc3NhZ2UsIHN1YmplY3QsIGdhbWVEZXRhaWwuc2VjVXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLnNlY1VzZXIsIG1lc3NhZ2UxLCBzdWJqZWN0LCBnYW1lRGV0YWlsLmZpcnN0VXNlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJvdHVlclwiLCBtaW51dGVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZXMuX2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiAgbGV0IGdhbWVEZXRhaWwgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVzLl9pZCk7XG4gICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZURldGFpbC53aW5uZXIgPXJvdW5kcy5maXJzdFVzZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVEZXRhaWwuc3RhdHVzID0gXCJjb21wbGV0ZWRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZURldGFpbC5zYXZlKCk7ICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVzLl9pZCB9LCB7ICRzZXQ6IHsgc3RhdHVzOiBcImNvbXBsZXRlZFwiLCB3aW5uZXJVc2VyOiByb3VuZHMuc2VjVXNlciB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IEdhbWVSb3VuZC51cGRhdGVNYW55KHsgZ2FtZTogZ2FtZXMuX2lkIH0sIHsgJHNldDogeyBzdGF0dXM6IFwiY29tcGxldGVkXCIsIHdpbm5lclVzZXI6IHJvdW5kcy5zZWNVc2VyIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHdpbm5lckRldGFpbCA9IGF3YWl0IFVzZXIuZmluZEJ5SWQocm91bmRzLnNlY1VzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3YWxsZXRhbW91bnQgPSB3aW5uZXJEZXRhaWwud2FsbGV0ID8gd2lubmVyRGV0YWlsLndhbGxldCA6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1dhbGxldCA9IHBhcnNlSW50KHdhbGxldGFtb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVzLmdhbWVUeXBlID09IFwicHVibGljXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGdhbWVzLnpvbGVXaW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2FsbGV0ID0gcGFyc2VJbnQod2FsbGV0YW1vdW50KSArIHBhcnNlSW50KGdhbWVzLnpvbGVXaW4pICsgcGFyc2VJbnQoZ2FtZXMuem9sZVdpbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFVzZXIudXBkYXRlT25lKHsgX2lkOiByb3VuZHMuc2VjVXNlciB9LCB7ICRzZXQ6IHsgd2FsbGV0OiBuZXdXYWxsZXQgfSB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJZb3UgaGF2ZSBMb3NlIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlMSA9IFwiWW91IGhhdmUgV29uIFRoZSBtYXRjaFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdWJqZWN0ID0gXCJHYW1lXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZW5kbm90aWZpY2F0aW9uKGdhbWVEZXRhaWwuZmlyc3RVc2VyLCBtZXNzYWdlLCBzdWJqZWN0LCBnYW1lRGV0YWlsLnNlY1VzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VuZG5vdGlmaWNhdGlvbihnYW1lRGV0YWlsLnNlY1VzZXIsIG1lc3NhZ2UxLCBzdWJqZWN0LCBnYW1lRGV0YWlsLmZpcnN0VXNlcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG5cbiAgICB9XG4gICAgZGVsZXRlR2FtZSA9IGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuICAgICAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgbGV0IGNoZWNrR2FtZSA9IGF3YWl0IEdhbWUuZmluZE9uZSh7IGlzRGVsZXRlZDogZmFsc2UsIF9pZDogZ2FtZUlkIH0pXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0geyBcIm1lc3NhZ2VcIjogXCJkZWxldGVkIFN1Y2Nlc3NmdWxseVwiIH07XG4gICAgICAgICAgICBpZiAoY2hlY2tHYW1lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY2hlY2tHYW1lKTtcblxuXG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZS5kZWxldGVPbmUoeyBfaWQ6IGdhbWVJZCB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCBHYW1lUm91bmQuZGVsZXRlTWFueSh7IGdhbWU6IGdhbWVJZCB9KTtcblxuXG5cblxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkUmVzdWx0KHJlcywgMjAwLCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDQwMCwgeyBcIm1lc3NhZ2VcIjogXCJub3QgZm91bmRcIiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgLy8gUmV0dXJucyB1bnNwZWNpZmllZCBleGNlcHRpb25zXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCA1MDAsIHt9LCB7fSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNlbmRub3RpZmljYXRpb24gPSBhc3luYyAodXNlcklkLCBtZXNzYWdlLCBzdWJqZWN0LCBsb2dpblVzZXIpID0+IHtcbiAgICAgICAgY29uc3QgZmlyc3RVc2VyRGV0YWlsID0gYXdhaXQgVXNlci5maW5kQnlJZCh1c2VySWQpO1xuXG4gICAgICAgIGlmIChmaXJzdFVzZXJEZXRhaWwuZGV2aWNlVG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgdG9Vc2VyOiBmaXJzdFVzZXJEZXRhaWwuX2lkLFxuICAgICAgICAgICAgICAgIGZyb21Vc2VyOiBmaXJzdFVzZXJEZXRhaWwuX2lkLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBzdWJqZWN0LFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZGV2aWNlVG9rZW46IGZpcnN0VXNlckRldGFpbC5kZXZpY2VUb2tlbixcbiAgICAgICAgICAgICAgICBjcmVhdGVkQnk6IGxvZ2luVXNlcixcbiAgICAgICAgICAgICAgICB1cGRhdGVkQnk6IGxvZ2luVXNlclxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXdhaXQgTm90aWZpY2F0aW9ucy5zZW5kTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbkRhdGEpO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgZW50ZXJJbkdhbWUgPSBhc3luYyAocmVxLCByZXMpID0+IHtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBnYW1lSWQgfSA9IHJlcS5ib2R5O1xuICAgICAgICAgICAgY29uc3QgeyBfaWQgfSA9IHJlcS51c2VyO1xuXG4gICAgICAgICAgICBsZXQgZ2FtZURldGFpbCA9IGF3YWl0IEdhbWUuZmluZEJ5SWQoZ2FtZUlkKTtcbiAgICAgICAgICAgIGlmIChnYW1lRGV0YWlsLmZpcnN0VXNlci50b1N0cmluZygpID09IF9pZC50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgR2FtZS51cGRhdGVPbmUoeyBfaWQ6IGdhbWVJZCB9LCB7ICRzZXQ6IHsgZmlyc3RVc2VyU3RhcnQ6IDEgfSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlT25lKHsgX2lkOiBnYW1lSWQgfSwgeyAkc2V0OiB7IHNlY1VzZXJTdGFydDogMSB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZ2FtZURldGFpbGEgPSBhd2FpdCBHYW1lLmZpbmRCeUlkKGdhbWVJZCk7XG4gICAgICAgICAgICBpZiAoZ2FtZURldGFpbGEuZmlyc3RVc2VyU3RhcnQgPT0gMSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEdhbWUudXBkYXRlT25lKHsgX2lkOiBnYW1lSWQgfSwgeyAkc2V0OiB7IHN0YXR1czogXCJib29rZWRcIiB9IH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnVpbGRSZXN1bHQocmVzLCAyMDAsIHsgXCJzdGF0dXNcIjogMjAwLCBcIm1lc3NhZ2VcIjogXCJ1cGRhdGVkIFN1Y2Nlc3NmdWxseVwiIH0pO1xuXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm5zIHVuc3BlY2lmaWVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBidWlsZFJlc3VsdChyZXMsIDUwMCwge30sIHt9LCBlcnJvcik7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBjaGVja01vdmVzID0gYXN5bmMgKGdhbWVSb3VuZCwgbW92ZVRleHQsIG1vdmVzKSA9PiB7XG4gICAgICAgIGxldCB0b3RhbFhNb3ZlID0gMDtcbiAgICAgICAgbGV0IHRvdGFsT01vdmUgPSAwO1xuICAgICAgICAvL2NoZWNrIGVtcHR5IGZpbGVkXG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm0xXCIgJiYgZ2FtZVJvdW5kLm0xKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtMlwiICYmIGdhbWVSb3VuZC5tMikge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibTNcIiAmJiBnYW1lUm91bmQubTMpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm00XCIgJiYgZ2FtZVJvdW5kLm00KSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtNVwiICYmIGdhbWVSb3VuZC5tNSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7O1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm02XCIgJiYgZ2FtZVJvdW5kLm02KSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW92ZXMgPT0gXCJtN1wiICYmIGdhbWVSb3VuZC5tNykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVzID09IFwibThcIiAmJiBnYW1lUm91bmQubTgpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb3ZlcyA9PSBcIm05XCIgJiYgZ2FtZVJvdW5kLm05KSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICAvL2NoZWNrIHRvdGFsIG1vdmVzXG4gICAgICAgIGlmIChnYW1lUm91bmQubTEgPT0gXCJYXCIpIHtcbiAgICAgICAgICAgIHRvdGFsWE1vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm0yID09IFwiWFwiKSB7XG4gICAgICAgICAgICB0b3RhbFhNb3ZlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVSb3VuZC5tMyA9PSBcIlhcIikge1xuICAgICAgICAgICAgdG90YWxYTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTQgPT0gXCJYXCIpIHtcbiAgICAgICAgICAgIHRvdGFsWE1vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm01ID0gXCJYXCIpIHtcbiAgICAgICAgICAgIHRvdGFsWE1vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm02ID09IFwiWFwiKSB7XG4gICAgICAgICAgICB0b3RhbFhNb3ZlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVSb3VuZC5tNyA9PSBcIlhcIikge1xuICAgICAgICAgICAgdG90YWxYTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTggPT0gXCJYXCIpIHtcbiAgICAgICAgICAgIHRvdGFsWE1vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm05ID09IFwiWFwiKSB7XG4gICAgICAgICAgICB0b3RhbFhNb3ZlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVSb3VuZC5tMSA9PSBcIk9cIikge1xuICAgICAgICAgICAgdG90YWxPTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTIgPT0gXCJPXCIpIHtcbiAgICAgICAgICAgIHRvdGFsT01vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm0zID09IFwiT1wiKSB7XG4gICAgICAgICAgICB0b3RhbE9Nb3ZlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVSb3VuZC5tNCA9PSBcIk9cIikge1xuICAgICAgICAgICAgdG90YWxPTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTUgPSBcIk9cIikge1xuICAgICAgICAgICAgdG90YWxPTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTYgPT0gXCJPXCIpIHtcbiAgICAgICAgICAgIHRvdGFsT01vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVJvdW5kLm03ID09IFwiT1wiKSB7XG4gICAgICAgICAgICB0b3RhbE9Nb3ZlKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVSb3VuZC5tOCA9PSBcIk9cIikge1xuICAgICAgICAgICAgdG90YWxPTW92ZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUm91bmQubTkgPT0gXCJPXCIpIHtcbiAgICAgICAgICAgIHRvdGFsT01vdmUrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodG90YWxPTW92ZSA+IHRvdGFsWE1vdmUgJiYgbW92ZVRleHQgPT0gXCJPXCIpIHtcbiAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsMSA9IGF3YWl0IEdhbWVSb3VuZC51cGRhdGVPbmUoeyBfaWQ6IGdhbWVSb3VuZC5faWQgfSwgeyAkc2V0OiB7IG5leHRUdXJuOiBnYW1lUm91bmQuZmlyc3RVc2VyIH0gfSk7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG90YWxPTW92ZSA8IHRvdGFsWE1vdmUgJiYgbW92ZVRleHQgPT0gXCJYXCIpIHtcbiAgICAgICAgICAgIGxldCBnYW1lRGV0YWlsMSA9IGF3YWl0IEdhbWVSb3VuZC51cGRhdGVPbmUoeyBfaWQ6IGdhbWVSb3VuZC5faWQgfSwgeyAkc2V0OiB7IG5leHRUdXJuOiBnYW1lUm91bmQuc2VjVXNlciB9IH0pO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvdGFsT01vdmUgPT0gdG90YWxYTW92ZSAmJiBtb3ZlVGV4dCA9PSBcIk9cIikge1xuICAgICAgICAgICAgbGV0IGdhbWVEZXRhaWwxID0gYXdhaXQgR2FtZVJvdW5kLnVwZGF0ZU9uZSh7IF9pZDogZ2FtZVJvdW5kLl9pZCB9LCB7ICRzZXQ6IHsgbmV4dFR1cm46IGdhbWVSb3VuZC5maXJzdFVzZXIgfSB9KTtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDFcbiAgICB9XG5cblxuXG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEdhbWVDb250cm9sbGVyKCk7XG4iXX0=