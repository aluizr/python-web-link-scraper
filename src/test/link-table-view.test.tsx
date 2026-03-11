import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinkTableView } from "@/components/LinkTableView";
import type { LinkItem } from "@/types/link";

const toastSuccessMock = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

const makeLink = (overrides: Partial<LinkItem> = {}): LinkItem => ({
  id: "1",
  url: "https://example.com",
  title: "Example",
  description: "Desc",
  category: "Work",
  tags: ["alpha"],
  isFavorite: false,
  favicon: "",
  ogImage: "",
  notes: "",
  status: "backlog",
  priority: "medium",
  dueDate: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  position: 0,
  ...overrides,
});

function renderTable(links: LinkItem[], onUpdateLink = vi.fn()) {
  render(
    <LinkTableView
      links={links}
      onToggleFavorite={vi.fn()}
      onUpdateLink={onUpdateLink}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />
  );

  return { onUpdateLink };
}

describe("LinkTableView inline editing", () => {
  it("starts inline edit from the visible pencil affordance", () => {
    renderTable([makeLink({ id: "a", title: "Quick edit" })]);

    fireEvent.click(screen.getByRole("button", { name: "Editar titulo" }));

    expect(screen.getByDisplayValue("Quick edit")).toBeInTheDocument();
  });

  it("commits title once on Enter", () => {
    const { onUpdateLink } = renderTable([makeLink({ id: "a", title: "Old title" })]);

    const titleLink = screen.getByText("Old title");
    fireEvent.doubleClick(titleLink);

    const input = screen.getByDisplayValue("Old title");
    fireEvent.change(input, { target: { value: "New title" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateLink).toHaveBeenCalledTimes(1);
    expect(onUpdateLink).toHaveBeenCalledWith("a", { title: "New title" });
  });

  it("does not save on Escape", () => {
    const { onUpdateLink } = renderTable([makeLink({ id: "a", title: "Keep me" })]);

    const titleLink = screen.getByText("Keep me");
    fireEvent.doubleClick(titleLink);

    const input = screen.getByDisplayValue("Keep me");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onUpdateLink).not.toHaveBeenCalled();
    expect(screen.getByText("Keep me")).toBeInTheDocument();
  });

  it("skips no-op update when value is unchanged", () => {
    const { onUpdateLink } = renderTable([makeLink({ id: "a", title: "Same value" })]);

    fireEvent.doubleClick(screen.getByText("Same value"));
    const input = screen.getByDisplayValue("Same value");
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateLink).not.toHaveBeenCalled();
  });

  it("commits and moves to next inline column on Tab", () => {
    const { onUpdateLink } = renderTable([makeLink({ id: "a", title: "Tab me", description: "Old desc" })]);

    fireEvent.doubleClick(screen.getByText("Tab me"));
    const input = screen.getByDisplayValue("Tab me");

    fireEvent.change(input, { target: { value: "Tabbed title" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(onUpdateLink).toHaveBeenCalledWith("a", { title: "Tabbed title" });
    expect(screen.getByDisplayValue("Old desc")).toBeInTheDocument();
  });
});

describe("LinkTableView filters and sorting", () => {
  it("applies query filter and sorts ascending then descending", () => {
    renderTable([
      makeLink({ id: "1", title: "Zeta", description: "notes", category: "Work", tags: ["alpha"] }),
      makeLink({ id: "2", title: "Alpha", description: "notes", category: "Work", tags: ["alpha"] }),
      makeLink({ id: "3", title: "Beta", description: "other", category: "Personal", tags: ["beta"] }),
    ]);

    fireEvent.change(screen.getByPlaceholderText("Filtrar titulo, URL ou descricao"), {
      target: { value: "notes" },
    });

    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.getByText("Zeta")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    const titleHeader = screen.getByRole("button", { name: "Titulo" });
    fireEvent.click(titleHeader);

    const rowsAsc = screen.getAllByRole("row");
    expect(rowsAsc[1]).toHaveTextContent("Alpha");
    expect(rowsAsc[2]).toHaveTextContent("Zeta");

    fireEvent.click(titleHeader);

    const rowsDesc = screen.getAllByRole("row");
    expect(rowsDesc[1]).toHaveTextContent("Zeta");
    expect(rowsDesc[2]).toHaveTextContent("Alpha");
  });

  it("highlights overdue, today, and upcoming due dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T12:00:00.000Z"));

    renderTable([
      makeLink({ id: "1", title: "Late", dueDate: "2026-03-10" }),
      makeLink({ id: "2", title: "Today", dueDate: "2026-03-11" }),
      makeLink({ id: "3", title: "Soon", dueDate: "2026-03-14" }),
    ]);

    expect(within(screen.getByText("Late").closest("tr") as HTMLElement).getByText("Atrasado")).toBeInTheDocument();
    expect(within(screen.getByText("Today").closest("tr") as HTMLElement).getByText("Hoje")).toBeInTheDocument();
    expect(within(screen.getByText("Soon").closest("tr") as HTMLElement).getByText("3 dias")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
