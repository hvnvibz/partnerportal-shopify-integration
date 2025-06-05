const { Client } = require('@notionhq/client');

// Initialize Notion client with API key from environment variables
const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Fetches all pages from a Notion database
 * @param {string} databaseId - The Notion database ID
 * @returns {Promise<Array>} - Array of page objects
 */
async function getDatabase(databaseId) {
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

module.exports = { getDatabase }; 