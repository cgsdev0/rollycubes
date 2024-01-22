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

const ITERATIONS = 100000;
const simulation = (ds) => {
  const sbucket = {};
  const tbucket = {};
  let total_turns = 0;
  for (let i = 0; i < ITERATIONS; ++i) {
    const { score, turns } = simulate(ds);
    const skey = `${score}`;
    const tkey = `${turns}`;
    total_turns += turns;
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
  return { sbucket, tbucket };
};

const data = dice_variants.map((d) => simulation(d));
