const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

console.log('API KEY:', process.env.NOTION_API_KEY);

(async () => {
  try {
    const response = await notion.databases.query({
      database_id: '209c919d7cab8006879ef790fc144c7d',
    });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
})(); 