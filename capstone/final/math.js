// Generate normal distribution
export function generateRandomNormal(mean, standardDeviation) {
    var u = 0,
      v = 0;
    while (u === 0) u = Math.random(); // Exclude 0 to avoid infinity in logarithm
    while (v === 0) v = Math.random();
  
    var z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    var randomValue = mean + z * standardDeviation;
  
    return randomValue;
  }

