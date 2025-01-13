// const fetch = require('node-fetch'); // Use this in Node.js. In browsers, native `fetch` works.

const SEC_BASE_URL = 'https://data.sec.gov';
const USER_AGENT = 'Jonathan Miller jnthnmllr@gmail.com Per Scholas'; // Update this!
cik = '0000320193'; // Apple Inc. CIK

// Function to fetch company data
const fetchCompanyData = async (cik) => {
    const url = `${SEC_BASE_URL}/submissions/CIK${cik}.json`;
    const headers = { 'User-Agent': USER_AGENT };

    try {
        const response = await fetch(url, { headers });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error(`Failed to fetch company data. Status: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching company data:', error);
        return null;
    }
};

// Function to fetch and parse board member names and bios
const fetchBoardMembers = async (cik) => {
    const companyData = await fetchCompanyData(cik);
    if (!companyData) return;

    const filings = companyData.filings.recent;
    const filingIndex = filings.form.findIndex((form) => form === 'DEF 14A'); // Proxy Statement
    if (filingIndex === -1) {
        console.error('No DEF 14A filings found.');
        return;
    }

    const accessionNumber = filings.accessionNumber[filingIndex];
    const filingUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}/index.html`;

    console.log('DEF 14A Filing URL:', filingUrl);

    // For DEF 14A parsing, you would need to scrape the HTML for board member information
    console.log('Note: You need to scrape the DEF 14A filing to get names and bios.');
};

// Function to fetch insider transactions (Form 4 filings)
const fetchInsiderTransactions = async (cik) => {
    const companyData = await fetchCompanyData(cik);
    if (!companyData) return;

    const filings = companyData.filings.recent;
    const insiderFilings = filings.form
        .map((form, index) => (form === '4' ? filings.accessionNumber[index] : null))
        .filter(Boolean);

    if (insiderFilings.length === 0) {
        console.error('No Form 4 filings found.');
        return;
    }

    console.log('Recent Insider Transactions:');
    insiderFilings.forEach((accessionNumber) => {
        const transactionUrl = `${SEC_BASE_URL}/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, '')}/index.html`;
        console.log(transactionUrl);
    });
};

// Main function to orchestrate the queries
const main = async () => {
    const cik = '0000320193'; // Replace with the CIK of your target company (e.g., Apple)
    console.log('Fetching board members...');
    await fetchBoardMembers(cik);

    console.log('\nFetching insider transactions...');
    await fetchInsiderTransactions(cik);
};

main();
