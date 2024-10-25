import { router, socket } from "../routes.js";

export default function renderResults() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Game Score</h1>
    <div id="game-score">
      <h2>Puntuaciones de Jugadores</h2>
      <ul id="players-list"></ul>
    </div>
    <div id="winner-message" style="display: none;">
      <h1>¡Tenemos un ganador!</h1>
      <h2 id="winner-name"></h2>
    </div>
    <button class="bton" id="sortByNameBtn">Ordenar alfabéticamente</button>
    <button class="bton" id="sortByScoreBtn">Ordenar por puntuaciones</button>
    <button class="bton" id="restartBtn">Reiniciar juego</button>
  `;

   
  const playersList = document.getElementById("players-list");
  const winnerMessage = document.getElementById("winner-message");
  const winnerName = document.getElementById("winner-name");
  let players = []; // Variable para almacenar la lista de jugadores

  // Escucha para actualizar puntajes y renderizar lista de jugadores
  socket.on("updateScores", (updatedPlayers) => {
    players = updatedPlayers;
    renderPlayerList(players);
  });

  // Mostrar mensaje de ganador y actualizar la lista de jugadores
  socket.on("newWinner", (data) => {
    winnerName.textContent = `${data.nickname} con ${data.score} puntos`;
    winnerMessage.style.display = "block";
    players = data.players;
    renderPlayerList(players);
  });

  // Ordena la lista alfabéticamente cuando se hace clic en el botón
  document.getElementById("sortByNameBtn").addEventListener("click", () => {
    const sortedPlayers = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname));
    renderPlayerList(sortedPlayers); // Renderiza la lista ordenada alfabéticamente
  });

  document.getElementById("sortByScoreBtn").addEventListener("click", () => {
    socket.emit("sortPlayersByScore"); // Emitir el evento para ordenar por puntuaciones
  });

  socket.on("playersSortedByScore", (sortedPlayers) => {
    renderPlayerList(sortedPlayers); // Renderizar la lista ordenada por puntuación
  });

  // Función para renderizar la lista de jugadores con posición
  function renderPlayerList(players) {
    playersList.innerHTML = ""; // Limpiar la lista de jugadores
    players.forEach((player, index) => {
      const playerItem = document.createElement("li");
      playerItem.textContent = `${index + 1}. ${player.nickname} (${player.score} pts)`;
      playersList.appendChild(playerItem);
    });
  }
}