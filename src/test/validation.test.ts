import { describe, it, expect } from "vitest";
import { linkSchema, categorySchema } from "@/lib/validation";

describe("linkSchema", () => {
  const validLink = {
    url: "https://example.com",
    title: "Example",
    description: "A link",
    category: "Dev",
    tags: ["react"],
    isFavorite: false,
    favicon: "",
  };

  it("accepts a valid link", () => {
    const result = linkSchema.safeParse(validLink);
    expect(result.success).toBe(true);
  });

  it("requires a URL", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "" });
    expect(result.success).toBe(false);
  });

  it("rejects javascript: protocol", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "javascript:alert(1)" });
    expect(result.success).toBe(false);
  });

  it("rejects data: protocol", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "data:text/html,<script>alert(1)</script>" });
    expect(result.success).toBe(false);
  });

  it("accepts https:// URLs", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "https://google.com" });
    expect(result.success).toBe(true);
  });

  it("accepts http:// URLs", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "http://localhost:3000" });
    expect(result.success).toBe(true);
  });

  it("accepts mailto: URLs", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "mailto:test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects URLs longer than 2048 chars", () => {
    const result = linkSchema.safeParse({ ...validLink, url: "https://x.com/" + "a".repeat(2040) });
    expect(result.success).toBe(false);
  });

  it("rejects more than 20 tags", () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
    const result = linkSchema.safeParse({ ...validLink, tags });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate tags", () => {
    const result = linkSchema.safeParse({ ...validLink, tags: ["react", "react"] });
    expect(result.success).toBe(false);
  });

  it("trims and lowercases tags", () => {
    const result = linkSchema.safeParse({ ...validLink, tags: [" React "] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags[0]).toBe("react");
    }
  });

  it("trims title and description", () => {
    const result = linkSchema.safeParse({ ...validLink, title: "  Hello  ", description: "  World  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Hello");
      expect(result.data.description).toBe("World");
    }
  });
});

describe("categorySchema", () => {
  it("accepts valid category", () => {
    const result = categorySchema.safeParse({ name: "Dev", icon: "Code" });
    expect(result.success).toBe(true);
  });

  it("requires a name", () => {
    const result = categorySchema.safeParse({ name: "", icon: "Folder" });
    expect(result.success).toBe(false);
  });

  it("rejects names with HTML special chars", () => {
    const result = categorySchema.safeParse({ name: '<script>alert("xss")</script>', icon: "Folder" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid icon names", () => {
    const result = categorySchema.safeParse({ name: "Test", icon: "InvalidIcon" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid icon names", () => {
    const validIcons = ["Folder", "Code", "BookOpen", "Palette", "Globe", "Database"];
    for (const icon of validIcons) {
      const result = categorySchema.safeParse({ name: "Test", icon });
      expect(result.success).toBe(true);
    }
  });

  it("defaults icon to Folder", () => {
    const result = categorySchema.safeParse({ name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.icon).toBe("Folder");
    }
  });

  it("accepts optional parentId as UUID", () => {
    const result = categorySchema.safeParse({ name: "Test", icon: "Folder", parentId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" });
    expect(result.success).toBe(true);
  });

  it("rejects parentId that is not UUID", () => {
    const result = categorySchema.safeParse({ name: "Test", icon: "Folder", parentId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});
