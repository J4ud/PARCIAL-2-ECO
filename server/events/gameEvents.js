const db = require("../db")
const {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
  restartGameHandler,
  sortPlayersAlphabeticallyHandler,
  sortPlayersByScoreHandler
} = require("../event-handlers/gameHandlers")
const { assignRoles,sortByScore,sortByName,updateScore,checkWinner,  } = require("../utils/helpers")

const gameEvents = (socket, io) => {
  socket.on("joinGame", joinGameHandler(socket, db, io))

  socket.on("startGame", startGameHandler(socket, db, io))

  socket.on("notifyMarco", notifyMarcoHandler(socket, db, io))

  socket.on("notifyPolo", notifyPoloHandler(socket, db, io))

  socket.on("onSelectPolo", onSelectPoloHandler(socket, db, io))

  socket.on("sortPlayersAlphabetically", sortPlayersAlphabeticallyHandler(socket, db, io));

  socket.on("sortPlayersByScore", sortPlayersByScoreHandler(socket, db, io));
  
  socket.on("checkWinner", () => {
    const winner = checkWinner(db.players);
    if (winner) {
      io.emit("newWinner", {
        nickname: winner.nickname,
        score: winner.score,
        players: db.players.sort(sortByScore),
      });
    } else {
      io.emit("updateScores", { players: db.players });
    }
  });

  // Evento para reiniciar el juego
  socket.on("restartGame", () => {
    restartGameHandler(db); // Reinicia las puntuaciones en el handler
    io.emit("gameRestarted", { players: db.players }); // Enviar puntuaciones reiniciadas a todos los clientes
  });
};

module.exports = { gameEvents }
