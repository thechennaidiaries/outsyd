async function scrapeSearchPage(url: string) {
  console.log(`Fetching Search Page: ${url}`);
  try {
    const response = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      } 
    });
    const text = await response.text();
    
    // Look for coordinates in the HTML body
    // Often found in: "https://maps.google.com/maps?q=13.0827,80.2707"
    const qMatch = text.match(/maps\?q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      console.log(`Found in maps?q=: ${qMatch[1]}, ${qMatch[2]}`);
      return;
    }

    // Or in JSON-LD / script tags
    const jsonMatch = text.match(/"latitude":\s*(-?\d+\.\d+),\s*"longitude":\s*(-?\d+\.\d+)/);
    if (jsonMatch) {
      console.log(`Found in JSON: ${jsonMatch[1]}, ${jsonMatch[2]}`);
      return;
    }

    console.log('No coordinates found in page body.');
  } catch (e) {
    console.error(e);
  }
}

// Use the final URL from the previous test
scrapeSearchPage('https://www.google.com/search?q=Kalaignar+Centenary+Park');
