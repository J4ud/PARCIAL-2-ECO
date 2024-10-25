const assignRoles = (players) => {
  let shuffled = players.sort(() => 0.5 - Math.random())
  shuffled[0].role = "marco"
  shuffled[1].role = "polo-especial"
  for (let i = 2; i < shuffled.length; i++) {
    shuffled[i].role = "polo"
  }
  return shuffled
}

const initializeScores = (players) => {
  return players.map(player => ({
    ...player,
    score: player.score !== undefined ? player.score : 0 // Si la puntuación no está definida, asigna 0
  }));
};

const updateScore = (player, isSuccessful, isMarco) => {
  if (isMarco) {
    if (isSuccessful) {
      player.score += 50; // Marco captura al Polo especial
    } else {
      player.score -= 10; // Marco no captura al Polo especial
    }
  } else {
    if (isSuccessful) {
      player.score += 10; // Polo especial no es atrapado
    } else {
      player.score -= 10; // Polo especial es atrapado
    }
  }
};

const checkWinner = (players) => {
  return players.find(player => player.score >= 100);
};

const sortByScore = (players) => {
  return players.sort((a, b) => b.score - a.score);
};



const sortByName = (players) => {
  return players.sort((a, b) => a.nickname.localeCompare(b.nickname));
};

function resetScores(players) {
  return players.map(player => ({ ...player, score: 0 }));
}

module.exports = { assignRoles, 
  updateScore, 
  checkWinner,
  sortByScore,
  sortByName,
  initializeScores,
  resetScores
 }
