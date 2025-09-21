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

/**
 * Maps Notion handbook properties to a usable object
 * @param {object} page - Notion page object
 * @returns {object}
 */
function mapHandbook(page) {
  const props = page.properties;
  
  // Grunddaten
  const title = props['Kurz-Bezeichnung']?.title?.[0]?.plain_text || '';
  const slug = props['Slug']?.rich_text?.[0]?.plain_text || '';
  const produktTitel = props['Produkttitel']?.rich_text?.[0]?.plain_text || '';
  
  // Titelbild
  const titelbild = props['Titelbild']?.files?.[0]?.file?.url || '';
  
  // Video-Links (6 verfügbar)
  const videoUrl1 = props['Video Link #1']?.url || '';
  const videoUrl2 = props['Video Link #2']?.url || '';
  const videoUrl3 = props['Video Link #3']?.url || '';
  const videoUrl4 = props['Video Link #4']?.url || '';
  const videoUrl5 = props['Video Link #5 (Sonderausführung)']?.url || '';
  const videoUrl6 = props['Video Link #6']?.url || '';
  
  // Hauptvideo (erste verfügbare)
  const videoUrl = videoUrl1 || videoUrl2 || videoUrl3 || videoUrl4 || videoUrl5 || videoUrl6;
  
  // Handbücher und Anleitungen
  const einbauanleitung1 = props['Einbauanleitung (1)']?.url || '';
  const einbauanleitung1Google = props['Einbauanleitung (1) Google Drive']?.url || '';
  const einbauanleitung2 = props['Einbauanleitung (2 - neue Serie)']?.url || '';
  const schriftlicheAnleitung = props['Schriftliche Anleitung Sonderausführung']?.url || '';
  const schriftlicheAnleitungGoogle = props['Schr. Anleit. Connect (Google Drive)']?.url || '';
  
  // Haupt-Handbuch (erste verfügbare)
  const handbuchUrl = einbauanleitung1 || einbauanleitung1Google || einbauanleitung2 || schriftlicheAnleitung || schriftlicheAnleitungGoogle;
  
  // Datenblätter
  const datenblattAlt = props['Produktdatenblatt (alt)']?.url || '';
  const datenblattAlteVersion = props['Produktdatenblatt (alte Version)']?.url || '';
  const datenblattNeueVersion = props['Produktdatenblatt (neue Version)']?.url || '';
  const technischeDatenblatter = props['Technische Datenblätter (Google Drive)']?.url || '';
  
  // Haupt-Datenblatt (neueste Version bevorzugt)
  const datenblattUrl = datenblattNeueVersion || datenblattAlteVersion || datenblattAlt || technischeDatenblatter;
  
  // Wartungsinformationen
  const wartungsplan = props['Wartungsplan']?.url || '';
  const wartungKlein = props['Wartungstätigkeiten (kleine Wartung)']?.url || '';
  const wartungGross = props['Wartungstätigkeiten (große Wartung)']?.url || '';
  const wartungJaehrlich = props['Wartungstätigkeiten (jährlich)']?.url || '';
  
  // Haupt-Wartungsinformation (erste verfügbare)
  const wartungUrl = wartungsplan || wartungKlein || wartungGross || wartungJaehrlich;
  
  // Spezielle EKF-Komponenten
  const kompressorEKF = props['Kompressor EKF']?.url || '';
  const oxidatorEKF = props['Oxidator EKF']?.url || '';
  const dprEKF = props['DPR-EKF']?.url || '';
  const rslEKF = props['RSL-EKF']?.url || '';
  
  // OKF-Komponenten
  const niveausteuerungOKF = props['Niveausteuerung OKF']?.rich_text?.[0]?.plain_text || '';
  const rueckspuelautomatikOKF = props['Rücksülautomatik OKF']?.rich_text?.[0]?.plain_text || '';
  const komplettsteuerungOKF = props['Komplettsteuerung OKF']?.rich_text?.[0]?.plain_text || '';
  
  // Metadaten
  const collectionId = props['Collection ID']?.rich_text?.[0]?.plain_text || '';
  const localeId = props['Locale ID']?.rich_text?.[0]?.plain_text || '';
  const itemId = props['Item ID']?.rich_text?.[0]?.plain_text || '';
  const archived = props['Archived']?.rich_text?.[0]?.plain_text === '__YES__' || false;
  const draft = props['Draft']?.rich_text?.[0]?.plain_text === '__YES__' || false;
  const wartungsinformationenFreischalten = props['Wartungsinformationen freischalten']?.checkbox || false;
  
  // Datum-Felder
  const createdOn = props['Created On']?.rich_text?.[0]?.plain_text || '';
  const updatedOn = props['Updated On']?.rich_text?.[0]?.plain_text || '';
  const publishedOn = props['Published On']?.rich_text?.[0]?.plain_text || '';
  
  // Extrahiere YouTube-ID aus dem Hauptvideo
  let videoId = '';
  if (videoUrl) {
    const match = videoUrl.match(/(?:youtu.be\/|v=)([\w-]{11})/);
    videoId = match ? match[1] : '';
  }
  
  return { 
    title: produktTitel || title, // Produkttitel als Haupttitel, Fallback auf Kurz-Bezeichnung
    slug, 
    titelbild, // Titelbild URL
    videoId, 
    videoUrl,
    handbuchUrl, 
    datenblattUrl, 
    wartungUrl, 
    beschreibung: 'Produktinformationen ansehen', // Verallgemeinerte Beschreibung
    produktkategorie: '', // Wird später hinzugefügt
    
    // Alle verfügbaren Videos
    videoUrls: {
      video1: videoUrl1,
      video2: videoUrl2,
      video3: videoUrl3,
      video4: videoUrl4,
      video5: videoUrl5,
      video6: videoUrl6
    },
    
    // Alle verfügbaren Handbücher
    handbuchUrls: {
      einbauanleitung1,
      einbauanleitung1Google,
      einbauanleitung2,
      schriftlicheAnleitung,
      schriftlicheAnleitungGoogle
    },
    
    // Alle verfügbaren Datenblätter
    datenblattUrls: {
      alt: datenblattAlt,
      alteVersion: datenblattAlteVersion,
      neueVersion: datenblattNeueVersion,
      technische: technischeDatenblatter
    },
    
    // Alle verfügbaren Wartungsinformationen
    wartungUrls: {
      plan: wartungsplan,
      klein: wartungKlein,
      gross: wartungGross,
      jaehrlich: wartungJaehrlich
    },
    
    // EKF-Komponenten
    ekfKomponenten: {
      kompressor: kompressorEKF,
      oxidator: oxidatorEKF,
      dpr: dprEKF,
      rsl: rslEKF
    },
    
    // OKF-Komponenten
    okfKomponenten: {
      niveausteuerung: niveausteuerungOKF,
      rueckspuelautomatik: rueckspuelautomatikOKF,
      komplettsteuerung: komplettsteuerungOKF
    },
    
    // Metadaten
    collectionId,
    localeId,
    itemId,
    archived,
    draft,
    wartungsinformationenFreischalten,
    createdOn,
    updatedOn,
    publishedOn
  };
}

module.exports = { getDatabase, mapVideo, mapHandbook }; 