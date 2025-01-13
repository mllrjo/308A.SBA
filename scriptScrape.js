const puppeteer = require('puppeteer');

const SEC_BASE_URL = 'https://data.sec.gov';

// Function to scrape board members from a DEF 14A filing
const scrapeBoardMembers = async (filingUrl) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the filing URL
        await page.goto(filingUrl, { waitUntil: 'load' });
        console.log(`Accessing DEF 14A filing at: ${filingUrl}`);

        // Extract board member information
        const boardMembers = await page.evaluate(() => {
            const boardData = [];
            const elements = Array.from(document.querySelectorAll('p, td, span'));

            elements.forEach((element) => {
                const text = element.innerText.trim();
                // Look for patterns indicating board members and their bios
                if (text.match(/Director|Board|Chair|CEO|Biography/i)) {
                    boardData.push(text);
                }
            });

            return boardData;
        });

        console.log('Board Member Details Extracted:');
        boardMembers.forEach((info, idx) => console.log(`${idx + 1}. ${info}`));

        await browser.close();
        return boardMembers;
    } catch (error) {
        console.error('Error scraping DEF 14A:', error);
        await browser.close();
    }
};

async function listFilesInUrl(url) {
    try {

        const headers = { 
            'User-Agent': "personal use jnthnmllr@gmail.com",
        };
        // url = 'https://www.sec.gov/Archives/edgar/data/320193';
        url = 'https://www.sec.gov/Archives/edgar/data/320193/000130817925000009/aapl4359751-defa14a.htm';
        console.log('Fetching directory:', url);
        // throw new Error('Stopping here before fetch'); 
        const response = await fetch(url, { headers });
        console.log('Response:', response);
        const text = await response.text();
        console.log('Response text:', text);
        // Parse file names from HTML response
        throw new Error('Stopping here after fetch');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const fileNames = [];
        const regex = /<a href="([^"]+)"/g; // Matches href links in the directory
        let match;
        while ((match = regex.exec(text)) !== null) {
            fileNames.push(match[1]);
        }

        console.log('Files in directory:');
        fileNames.forEach(file => console.log(file));
    } catch (error) {
        console.error('Error fetching or parsing directory:', error);
    }
}

// Function to find and scrape DEF 14A filing for a company
const scrapeDef14AFiling = async (cik) => {
    const companyDataUrl = `${SEC_BASE_URL}/submissions/CIK${cik}.json`;
    const headers = { 
        'User-Agent': "personal use jnthnmllr@gmail.com",
    };

    try {
    // Fetch company submissions
        const response = await fetch(companyDataUrl, { headers });
        if (!response.ok) {
            throw new Error(`Failed to fetch company data. Status: ${response.status}`);
        }
        const data = await response.json();
        if (!data.filings.recent) {
            throw new Error('No recent filings found.');
        }
        const filings = data.filings.recent;

      // Find the most recent DEF 14A filing
        const filingIndex = filings.form.findIndex((form) => form === 'DEF 14A');
        if (filingIndex === -1) {
            console.error('No DEF 14A filings found.');
            return;
        }

        const accessionNumber = filings.accessionNumber[filingIndex];
//      const filingUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}-index-headers.html`;
        const filingUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}`;
        console.log('Filing URL:', filingUrl);
//      Now we need to find def14a files in this directory.
        const listOfFiles = await listFilesInUrl(filingUrl);
        throw new Error('Stopping here after listing files');
        console.log(filingUrl)
        console.log(`DEF 14A Filing URL: ${filingUrl}`);
        // Scrape board members from the filing
        const boardMembers = await scrapeBoardMembers(filingUrl);
        console.log(`Extracted ${boardMembers.length} board member entries.`);
    } catch (error) {
        console.error('Error fetching company data or filings:', error);
    }
};

// Main Function
const main = async () => {
    const cik = '0000320193'; // Example: Apple's CIK
    console.log('Scraping DEF 14A filing for board member details...');
    await scrapeDef14AFiling(cik);
};

main();
