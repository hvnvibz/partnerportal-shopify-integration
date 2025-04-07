// Format rich text from Shopify

export function formatRichText(text: string): string {
  if (!text) return ""

  // If the text contains HTML tags, clean it up
  if (text.includes("<")) {
    // Remove CSS class definitions and other problematic elements
    return text
      .replace(/{[^}]*}/g, "") // Remove CSS blocks
      .replace(/class="[^"]*"/g, "") // Remove class attributes
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags
      .replace(/\.cs[A-Z0-9]{8}\{[^}]*\}/g, "") // Remove specific CSS class definitions
  }

  // For plain text, just return it
  return text
}

