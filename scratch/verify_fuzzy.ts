import { checkAnswer, PUZZLES } from '../src/data/game';

const puzzle = PUZZLES.find(p => p.id === 'game-025');
if (!puzzle) {
  console.error("Error: Could not find game-025 in PUZZLES!");
  process.exit(1);
}

const testCases = [
  { input: 'Anna University', expected: true, desc: 'Exact match' },
  { input: 'anna university', expected: true, desc: 'Case insensitive' },
  { input: 'Ana University', expected: true, desc: '1 typo (Anna -> Ana)' },
  { input: 'Anna Univesrity', expected: true, desc: '2 typos (University -> Univesrity)' },
  { input: 'Anna Univ', expected: true, desc: 'Alternate form regex/alias' },
  { input: 'Ana Univ', expected: true, desc: '1 typo on alternate form' },
  { input: 'au', expected: true, desc: 'Exact abbreviation' },
  { input: 'a.u.', expected: true, desc: 'Abbreviation with punctuation' },
  { input: 'Annamalai University', expected: false, desc: 'Too many typos' },
  { input: 'Loyola College', expected: false, desc: 'Completely different place' },
  { input: 'a u', expected: true, desc: 'Abbreviation with space' },
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
