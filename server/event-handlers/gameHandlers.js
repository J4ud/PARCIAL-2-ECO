// gameHandlers.js

const { assignRoles, updateScore, checkWinner, sortByName, sortByScore, initializeScores, resetScores } = require("../utils/helpers")

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
  return (user) => {
    // Agregar el nuevo jugador a la base de datos con puntuación inicializada en 0
    const newPlayer = { id: socket.id, ...user, score: 0 };
    db.players.push(newPlayer);

    // Mostrar la lista de jugadores en la consola
    console.log(db.players);

    // Inicializar puntuaciones de todos los jugadores (si no está inicializado)
    db.players = initializeScores(db.players);

    // Emitir evento a todos los jugadores para actualizar las puntuaciones
    io.emit("userJoined", db); // Sigue notificando a todos los clientes que un usuario se ha unido
    io.emit("updateScores", db.players); // Actualiza las puntuaciones en las pantallas de todos
  }
}

const startGameHandler = (socket, db, io) => {
  return () => {
    db.players = assignRoles(db.players)

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role)
    })
  }
}

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    )

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      })
    })
  }
}

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco")

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      })
    })
  }
}

const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    const myUser = db.players.find((user) => user.id === socket.id);
    const poloSelected = db.players.find((user) => user.id === userID);

    if (!myUser || !poloSelected) {
      console.error("Jugador Marco o Polo no encontrado");
      return;
    }

    if (poloSelected.role === "polo-especial") {
      myUser.score += 50;
      poloSelected.score -= 10;

      io.emit("notifyGameOver", {
        message: `El Marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
      });
    } else {
      myUser.score -= 10;
      poloSelected.score += 10;

      io.emit("notifyGameOver", {
        message: `El Marco ${myUser.nickname} ha perdido`,
      });
    }

    io.emit("updateScores", db.players);

    const winner = db.players.find((player) => player.score >= 100);
    if (winner) {
      io.emit("newWinner", {
        nickname: winner.nickname,
        score: winner.score,
        players: db.players.sort((a, b) => b.score - a.score),
      });
    }
  };
};



const restartGameHandler = (io, db) => {
  return () => {
    // Reiniciar puntuaciones
    db.players = resetScores(db.players);

    // Emitir a todos los jugadores la lista de jugadores reiniciada
    io.emit("restartGame", db.players);
  };
};

const sortPlayersAlphabeticallyHandler = (socket, db, io) => {
  return () => {
    db.players = sortByName(db.players); // Ordena los jugadores alfabéticamente
    io.emit("playersSortedAlphabetically", db.players); // Emite la lista ordenada al cliente
  };
};

const sortPlayersByScoreHandler = (socket, db, io) => {
  return () => {
    const sortedPlayers = sortByScore([...db.players]); // Ordenar por puntuación en orden descendente
    io.emit("playersSortedByScore", sortedPlayers); // Emitir la lista ordenada al cliente
  };
};


module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
  sortPlayersAlphabeticallyHandler,
  restartGameHandler,
  sortPlayersByScoreHandler
}
