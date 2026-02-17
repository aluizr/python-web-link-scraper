import { describe, it, expect } from "vitest";
import { useIsMobile } from "@/hooks/use-mobile";
import { renderHook, act } from "@testing-library/react";

describe("useIsMobile", () => {
  it("returns false for desktop viewports (default)", () => {
    // matchMedia is mocked to return matches: false in setup.ts
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns boolean (not undefined) after mount", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });
});
