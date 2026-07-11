export const REACTION_CONFIGS = {
  sparkle: {
    name: 'sparkle',
    spriteUrl: '/assets/reactions/sparkle.svg',
    count: 20,
    cooldown: 1200, // ms
    minSpeed: 2,
    maxSpeed: 6,
    gravity: 0.15, // falls down
    drag: 0.96,
    lifeTime: 1.2, // seconds
    sizeMin: 15,
    sizeMax: 30,
    spreadAngle: 360, // full circle burst
    wobble: false,
    popNearTop: false
  },
  bubble: {
    name: 'bubble',
    spriteUrl: '/assets/reactions/bubble.svg',
    count: 15,
    cooldown: 2000, // ms
    minSpeed: 0.2, // slow initial spawn
    maxSpeed: 1.0,
    gravity: -0.03, // gentle float upward
    drag: 0.96, // decelerates fast to hover
    lifeTime: 4.0, // floats for 4 seconds
    sizeMin: 12,
    sizeMax: 45, // varied sizes
    spreadAngle: 360, // spawns in all directions around the hand
    wander: {
      changeRate: 0.2, // direction change rate
      amplitude: 0.12 // horizontal drift force
    },
    popOnExpire: true, // trigger pop shards when life ends
    popNearTop: false // let them pop naturally
  },
  heart: {
    name: 'heart',
    spriteUrl: '/assets/reactions/heart.svg',
    count: 18,
    cooldown: 1500, // ms
    minSpeed: 3,
    maxSpeed: 7,
    gravity: 0.2, // falls down
    drag: 0.95,
    lifeTime: 1.5,
    sizeMin: 18,
    sizeMax: 35,
    spreadAngle: 360, // full circle burst
    wobble: false,
    popNearTop: false
  }
};
