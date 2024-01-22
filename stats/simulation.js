const winning_scores = [33, 66, 67, 98, 99, 100];

const dice_variants = [4, 6, 8, 10, 12, 20];

const dp = (ds) => {
  const table = {};
  const incr = (n) => {
    const key = `${n}`;
    if (table.hasOwnProperty(key)) {
      table[key]++;
    } else {
      table[key] = 1;
    }
  };
  for (let d1 = 1; d1 <= ds; d1++) {
    for (let d2 = 1; d2 <= ds; d2++) {
      if (d1 === d2) continue;
      incr(d1 + d2);
      // Handle 7s
      if (d1 + d2 === 7) {
        incr(Math.abs(d2 - d1));
      }
    }
  }
  return table;
};
const greedy_table = (ds) => {
  const l = -ds * 2;
  const h = winning_scores[winning_scores.length - 1] + ds * 2;
  const dist = dp(ds);
  const table = {};
  for (let i = l; i <= h; i++) {
    table[i] =
      winning_scores
        .map((s) => (dist[Math.abs(s - i)] || 0) + (dist[Math.abs(s + i)] || 0))
        .reduce((a, b) => a + b, 0) /
      (ds * ds);
  }
  return table;
};

const greedy = {};
dice_variants.forEach((d) => {
  greedy[d] = greedy_table(d);
});

const roll = (ds) => {
  return Math.floor(Math.random() * ds) + 1;
};

// Play a single game of multiplayer.
const multiplayer = (...dsm) => {
  const pc = dsm.length;
  let scores = Array(pc).fill(0);
  let doubles = false;
  let turn = 0;
  const isGameWon = () => {
    if (doubles) return false;
    return scores.some((score) => winning_scores.includes(score));
  };
  let idx = 0;
  game: while (!isGameWon()) {
    if (!doubles) turn++;
    idx = turn % pc;
    const ds = dsm[idx];
    const rolls = [roll(ds), roll(ds)];
    doubles = rolls[0] === rolls[1];
    const split = rolls[0] + rolls[1] === 7;
    const sum = rolls[0] + rolls[1];
    const diff = Math.abs(rolls[0] - rolls[1]);
    const score = scores[idx];
    const options = [score + sum, score - sum];
    if (split) {
      options.push(score + diff);
      options.push(score - diff);
    }
    if (!doubles) {
      for (const o of options) {
        if (winning_scores.includes(o)) {
          scores[idx] = o;
          break game;
        }
      }
    }
    options.sort((a, b) => {
      const as = greedy[ds][a] || 0;
      const bs = greedy[ds][b] || 0;
      return bs - as;
    });
    scores[idx] = options[0];
    // Apply resets
    scores.forEach((s, i) => {
      if (i === idx) return;
      if (s === scores[idx]) {
        scores[i] = 0;
      }
    });
  }
  return { turns: Math.floor(turn / pc), idx };
};

// Simulates a singleplayer experience
const simulate = (ds) => {
  let score = 0;
  let doubles = false;
  let turns = 0;
  game: while (!winning_scores.includes(score) || doubles) {
    if (!doubles) turns++;
    const rolls = [roll(ds), roll(ds)];
    doubles = rolls[0] === rolls[1];
    const split = rolls[0] + rolls[1] === 7;
    const sum = rolls[0] + rolls[1];
    const diff = Math.abs(rolls[0] - rolls[1]);
    const options = [score + sum, score - sum];
    if (split) {
      options.push(score + diff);
      options.push(score - diff);
    }
    if (!doubles) {
      for (const o of options) {
        if (winning_scores.includes(o)) {
          score = o;
          break game;
        }
      }
    }
    options.sort((a, b) => {
      const as = greedy[ds][a] || 0;
      const bs = greedy[ds][b] || 0;
      return bs - as;
    });
    score = options[0];
  }
  return { score, turns };
};

const ITERATIONS = 1000000;
// Runs simulate a bunch of times
const simulation = (ds) => {
  const sbucket = {};
  const tbucket = {};
  let total_turns = 0;
  let high_key = 0;
  for (let i = 0; i < ITERATIONS; ++i) {
    const { score, turns } = simulate(ds);
    const skey = `${score}`;
    const tkey = `${turns}`;
    total_turns += turns;
    if (turns > high_key) {
      high_key = turns;
    }
    if (!tbucket.hasOwnProperty(tkey)) {
      tbucket[tkey] = 1;
    } else {
      tbucket[tkey]++;
    }
    if (!sbucket.hasOwnProperty(skey)) {
      sbucket[skey] = 1;
    } else {
      sbucket[skey]++;
    }
  }
  console.log(`Average turns for D${ds}:`, total_turns / ITERATIONS);
  return { sbucket, tbucket, high_key };
};

// const data = dice_variants.map((d) => simulation(d));

/* Perfect Games */
// dice_variants.forEach((d, i) => {
//   const num = data[i].tbucket[`1`] || 0;
//   console.log(`Perfect games for D${d}:`, num);
// });

/* Mode */
// dice_variants.forEach((d, i) => {
//   let mode = 0;
//   let modev = 0;
//   for (let j = 1; j <= data[i].high_key; j++) {
//     const num = data[i].tbucket[`${j}`] || 0;
//     if (num > modev) {
//       modev = num;
//       mode = j;
//     }
//   }
//   console.log(`Mode for D${d}:`, mode);
// });

/* Histograms */
// dice_variants.forEach((d, i) => {
//   console.log(`Histogram for D${d}`);
//   for (let j = 1; j <= data[i].high_key; j++) {
//     const num = data[i].tbucket[`${j}`] || 0;
//     console.log(num);
//   }
//   console.log();
// });

// Runs multiplayer a bunch of times
const multiplayerSim = (...dsm) => {
  const pbucket = {};
  for (let i = 0; i < ITERATIONS; ++i) {
    const { turns, idx } = multiplayer(...dsm);
    const ikey = `p${idx} (D${dsm[idx]})`;
    if (pbucket.hasOwnProperty(ikey)) {
      pbucket[ikey]++;
    } else {
      pbucket[ikey] = 1;
    }
  }
  console.log(Object.entries(pbucket).sort());
};

multiplayerSim(4, 4);
multiplayerSim(6, 6);
// multiplayerSim(20, 20);
multiplayerSim(6, 12);
multiplayerSim(12, 6);
// multiplayerSim(4, 6, 8, 10, 12, 20);
// multiplayerSim(20, 4);
// multiplayerSim(4, 20);
// multiplayerSim(6, 6, 6, 6);
