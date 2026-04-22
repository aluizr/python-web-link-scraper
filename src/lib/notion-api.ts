import { extractNotionPageId } from "./notion-utils";

const NOTION_TOKEN_KEY = "webnest:notion_api_key";
const NOTION_API_VERSION = "2022-06-28";

export interface NotionPageMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
}

interface NotionProperty {
  type: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  name?: string;
}

interface NotionBlock {
  type: string;
  paragraph?: { rich_text: { plain_text: string }[] };
  heading_1?: { rich_text: { plain_text: string }[] };
  heading_2?: { rich_text: { plain_text: string }[] };
}

/**
 * Get stored Notion API token from localStorage
 */
export function getNotionToken(): string | null {
  return localStorage.getItem(NOTION_TOKEN_KEY);
}

/**
 * Fetch page metadata from Notion API
 * @param urlOrPageId - Full Notion URL or 32-char page ID
 * @param token - Optional Notion API token (uses localStorage if not provided)
 */
export async function fetchNotionPageMetadata(urlOrPageId: string, token?: string): Promise<NotionPageMetadata | null> {
  const apiToken = token || getNotionToken();
  if (!apiToken) return null;

  // Extract page ID if a URL was provided
  const pageId = urlOrPageId.length === 32 ? urlOrPageId : extractNotionPageId(urlOrPageId);
  if (!pageId) return null;

  try {
    const response = await fetch(`/notion-api/v1/pages/${pageId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Página não encontrada ou não compartilhada com a integração no Notion.");
      }
      if (response.status === 401) {
        throw new Error("Token do Notion inválido ou expirado.");
      }
      console.debug("Notion API error:", response.status, response.statusText);
      return null;
    }
    const data = await response.json();

    // Extract title
    let title: string | null = null;
    if (data.properties) {
      const titleProp = Object.values(data.properties).find((prop) => (prop as NotionProperty).type === "title") as NotionProperty | undefined;
      if (titleProp?.title?.[0]?.plain_text) {
        title = titleProp.title[0].plain_text;
      }
    }

    // Extract description from properties (if exists as a property)
    let description: string | null = null;
    if (data.properties) {
      // Try to find a "Description" property (rich_text type)
      const descProp = Object.entries(data.properties).find(
        ([name, prop]) => (prop as NotionProperty).type === "rich_text" && (name.toLowerCase() === "description")
      )?.[1] as NotionProperty | undefined;
      
      if (descProp?.rich_text?.[0]?.plain_text) {
        description = descProp.rich_text[0].plain_text;
        // Limit to 200 chars as promised in the guide
        if (description.length > 200) {
          description = description.substring(0, 200) + "...";
        }
      }
    }

    // If no description property, try to fetch first block content
    if (!description) {
      try {
        const blocksResponse = await fetch(`/notion-api/v1/blocks/${pageId}/children?page_size=3`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Notion-Version": NOTION_API_VERSION,
            "Content-Type": "application/json",
          },
        });

        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json();
          // Extract text from first paragraph or text block
          for (const block of (blocksData.results as NotionBlock[] || [])) {
            if (block.type === "paragraph" && block.paragraph?.rich_text?.[0]?.plain_text) {
              description = block.paragraph.rich_text.map((t) => t.plain_text).join("");
              if (description.length > 200) {
                description = description.substring(0, 200) + "...";
              }
              break;
            } else if (block.type === "heading_1" && block.heading_1?.rich_text?.[0]?.plain_text) {
              description = block.heading_1.rich_text.map((t) => t.plain_text).join("");
              if (description.length > 200) {
                description = description.substring(0, 200) + "...";
              }
              break;
            } else if (block.type === "heading_2" && block.heading_2?.rich_text?.[0]?.plain_text) {
              description = block.heading_2.rich_text.map((t) => t.plain_text).join("");
              if (description.length > 200) {
                description = description.substring(0, 200) + "...";
              }
              break;
            }
          }
        }
      } catch (blockErr) {
        console.debug("Failed to fetch blocks for description:", blockErr);
      }
    }

    // Extract cover image
    let image: string | null = null;
    if (data.cover) {
      if (data.cover.type === "external") {
        image = data.cover.external?.url || null;
      } else if (data.cover.type === "file") {
        image = data.cover.file?.url || null;
      }
    }

    // Extract icon as favicon
    let favicon: string | null = null;
    if (data.icon) {
      if (data.icon.type === "external") {
        favicon = data.icon.external?.url || null;
      } else if (data.icon.type === "file") {
        favicon = data.icon.file?.url || null;
      } else if (data.icon.type === "emoji") {
        // For emoji icons, we could use them directly or convert to image
        // For now, we'll skip emoji and use default Notion favicon
        favicon = null;
      }
    }

    return { title, description, image, favicon };
  } catch (err) {
    console.debug("Notion API fetch error:", err);
    return null;
  }
}
