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

/**
 * Maps Notion video properties to a usable object
 * @param {object} page - Notion page object
 * @returns {object}
 */
function mapVideo(page) {
  const props = page.properties;
  const title = props['Videotitel']?.title?.[0]?.plain_text || '';
  const videoUrl = props['Video URL']?.url || '';
  const kategorie = props['Kategorie']?.select?.name || '';
  const produktkategorie = props['Produktkategorie']?.select?.name || '';
  const dauer = props['Dauer']?.rich_text?.[0]?.plain_text || '';
  // Extrahiere YouTube-ID
  let videoId = '';
  if (videoUrl) {
    const match = videoUrl.match(/(?:youtu.be\/|v=)([\w-]{11})/);
    videoId = match ? match[1] : '';
  }
  return { title, videoUrl, videoId, kategorie, produktkategorie, dauer };
}

module.exports = { getDatabase, mapVideo }; 