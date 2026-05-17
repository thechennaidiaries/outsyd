async function testRedirect(url: string) {
  console.log(`Initial URL: ${url}`);
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    console.log(`Final URL: ${response.url}`);
    
    const text = await response.text();
    console.log(`Final URL has coordinates? ${response.url.includes('@')}`);
    
    // Check if coordinates are in the body (sometimes they are in meta tags)
    const atMatch = response.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) console.log(`Found @: ${atMatch[1]}, ${atMatch[2]}`);
    
    const bangMatch = response.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (bangMatch) console.log(`Found !3d: ${bangMatch[1]}, ${bangMatch[2]}`);

  } catch (e) {
    console.error(e);
  }
}

testRedirect('https://share.google/Exogctbr2BjIfbvtZ');
