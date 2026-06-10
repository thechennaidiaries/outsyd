import { checkAnswer, PUZZLES } from '../src/data/game';

const puzzle = PUZZLES.find(p => p.id === 'game-035');
if (!puzzle) {
  console.error("Error: Could not find game-035 in PUZZLES!");
  process.exit(1);
}

const testCases = [
  { input: 'Chennai Lighthouse', expected: true, desc: 'Exact match' },
  { input: 'chennai lighthouse', expected: true, desc: 'Case variation' },
  { input: 'Lighthouse', expected: true, desc: 'Alias match' },
  { input: 'Marina Lighthouse', expected: true, desc: 'Alias match' },
  { input: 'Light house', expected: true, desc: 'Alias match with space' },
  { input: 'Marina Light house', expected: true, desc: 'Marina Light house pattern' },
  { input: 'Chenai Lighthouse', expected: true, desc: '1 typo in Chennai' },
  { input: 'Lighthous', expected: true, desc: '1 typo in Lighthouse' },
  { input: 'Kapaleeshwarar Temple', expected: false, desc: 'Completely different place' },
];

let failed = 0;
console.log(`Testing RouteThala Fuzzy Match for: "${puzzle.location}"\n`);
for (const tc of testCases) {
  const result = checkAnswer(tc.input, puzzle);
  const passed = result === tc.expected;
  console.log(`${passed ? '✅' : '❌'} [${tc.desc}] Guess: "${tc.input}" -> Got: ${result}, Expected: ${tc.expected}`);
  if (!passed) failed++;
}

if (failed === 0) {
  console.log('\n🎉 All tests passed successfully!');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} tests failed!`);
  process.exit(1);
}

