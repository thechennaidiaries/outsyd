import { checkPaatifyAnswer, PAATIFY_PUZZLES } from '../src/data/paatify';

const muttaKalakki = PAATIFY_PUZZLES.find(p => p.id === 'paatify-001');
if (!muttaKalakki) {
  console.error("Error: Could not find paatify-001 in PAATIFY_PUZZLES!");
  process.exit(1);
}

const testCases = [
  { input: 'Mutta Kalakki', expected: true, desc: 'Exact matches' },
  { input: 'mutta kalakki', expected: true, desc: 'Case insensitive' },
  { input: 'muttai kalakki', expected: true, desc: 'Alternate spelling' },
  { input: 'kalakki', expected: true, desc: 'Shortened name' },
  { input: 'mutta   kalakki', expected: true, desc: 'Extra spaces' },
  { input: 'Mutta-Kalakki', expected: true, desc: 'With dash/punctuation' },
  { input: 'Munbe Vaa', expected: false, desc: 'Incorrect song' },
];

let failed = 0;
console.log(`Testing Paatify Answer Match for: "${muttaKalakki.song}"\n`);
for (const tc of testCases) {
  const result = checkPaatifyAnswer(tc.input, muttaKalakki);
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
