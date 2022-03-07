const rankCalc = (client, pDatas) => {
    let globalRank = "Non classé";
    let playerPosition = "Non classé";
    let playerRank = playerPosition;

    const playerBreath = pDatas.breath.ressourceName;
    const lb = client.gameLeaderboard.global.get("lb");
    const lbBreaths = client.gameLeaderboard.breaths.get("lb");
    if (lb !== undefined && Object.entries(lb).length !== 0 && lb.map(p => p.userId).includes(pDatas.userId)) globalRank = `#${client.gameLeaderboard.global.get("lb").map(p => p.userId).indexOf(pDatas.userId) + 1}`;
    if (lbBreaths !== undefined && Object.entries(lbBreaths).length !== 0 && playerBreath !== null) playerPosition = lbBreaths[playerBreath].map(p => p.userId).indexOf(pDatas.userId) + 1;

    if (typeof playerPosition === "number") playerRank = `${pDatas.pillar ? `Pilier (#${playerPosition})` : `#${playerPosition}`}`;

    return { globalRank, playerRank };
};

module.exports = rankCalc;