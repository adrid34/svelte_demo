export const githubGreens = [
  '#ebedf0', // 0
  '#9be9a8', // 1-9
  '#40c463', // 10-19
  '#30a14e', // 20-29
  '#216e39' // 30+
];
export function getGithubGreen(count: number) {
  if (count === 0) return githubGreens[0];
  if (count < 10) return githubGreens[1];
  if (count < 20) return githubGreens[2];
  if (count < 30) return githubGreens[3];
  return githubGreens[4];
}
export function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.min(255, Math.max(0, R + percent));
  G = Math.min(255, Math.max(0, G + percent));
  B = Math.min(255, Math.max(0, B + percent));
  return (
    '#' +
    R.toString(16).padStart(2, '0') +
    G.toString(16).padStart(2, '0') +
    B.toString(16).padStart(2, '0')
  );
} 