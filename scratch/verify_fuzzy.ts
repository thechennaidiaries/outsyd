import { checkAnswer, PUZZLES } from '../src/data/game';

const puzzle = PUZZLES.find(p => p.id === 'game-026');
if (!puzzle) {
  console.error("Error: Could not find game-026 in PUZZLES!");
  process.exit(1);
}

const testCases = [
  { input: 'Chennai Trade Centre', expected: true, desc: 'Exact match' },
  { input: 'chennai trade center', expected: true, desc: 'Case/spelling variation' },
  { input: 'Trade Centre', expected: true, desc: 'Alternate form alias' },
  { input: 'Trade Center', expected: true, desc: 'Alternate form variation' },
  { input: 'Chenai Trade Centre', expected: true, desc: '1 typo (Chennai -> Chenai)' },
  { input: 'Chennai Trdae Centre', expected: true, desc: 'Single transposition / 2 edits (Trdae)' },
  { input: 'ctc', expected: true, desc: 'Exact abbreviation' },
  { input: 'c.t.c.', expected: true, desc: 'Abbreviation with punctuation' },
  { input: 'c t c', expected: true, desc: 'Abbreviation with space' },
  { input: 'Chennai Central', expected: false, desc: 'Completely different place' },
  { input: 'Loyola College', expected: false, desc: 'Completely different place' },
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
