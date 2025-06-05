import { getDatabase } from '../../lib/notion';

export default async function handler(req, res) {
  // Reverted to the original Notion database ID
  const databaseId = '209c919d7cab8006879ef790fc144c7d';
  try {
    const data = await getDatabase(databaseId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 