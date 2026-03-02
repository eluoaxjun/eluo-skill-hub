import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/shared/ui/Sidebar";

const mockUsePathname = jest.fn().mockReturnValue("/");
const mockUseSearchParams = jest.fn().mockReturnValue(new URLSearchParams());

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

const mockCategories = [
  { id: "1", name: "기획", slug: "planning", icon: "EditNoteIcon", sortOrder: 1 },
  { id: "2", name: "디자인", slug: "design", icon: "BrushIcon", sortOrder: 2 },
  { id: "3", name: "퍼블리싱", slug: "publishing", icon: "CodeIcon", sortOrder: 3 },
  { id: "4", name: "개발", slug: "development", icon: "TerminalIcon", sortOrder: 4 },
  { id: "5", name: "QA", slug: "qa", icon: "BugReportIcon", sortOrder: 5 },
];

describe("Sidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders service logo with 'AI 스킬 허브' text", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("AI 스킬 허브")).toBeInTheDocument();
  });

  it("renders '메인' group label", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("메인")).toBeInTheDocument();
  });

  it("renders main menu items: 대시보드, 내 에이전트 (without 마켓플레이스)", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("대시보드")).toBeInTheDocument();
    expect(screen.getByText("내 에이전트")).toBeInTheDocument();
    expect(screen.queryByText("마켓플레이스")).not.toBeInTheDocument();
  });

  it("renders '내 에이전트' link pointing to /myagent", () => {
    render(<Sidebar categories={mockCategories} />);

    const link = screen.getByText("내 에이전트").closest("a");
    expect(link).toHaveAttribute("href", "/myagent");
  });

  it("renders '카테고리' group label", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("카테고리")).toBeInTheDocument();
  });

  it("renders 5 category menu items from DB: 기획, 디자인, 퍼블리싱, 개발, QA", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("기획")).toBeInTheDocument();
    expect(screen.getByText("디자인")).toBeInTheDocument();
    expect(screen.getByText("퍼블리싱")).toBeInTheDocument();
    expect(screen.getByText("개발")).toBeInTheDocument();
    expect(screen.getByText("QA")).toBeInTheDocument();
  });

  it("renders category items as /?category={slug} links", () => {
    render(<Sidebar categories={mockCategories} />);

    const planningLink = screen.getByText("기획").closest("a");
    expect(planningLink).toHaveAttribute("href", "/?category=planning");

    const designLink = screen.getByText("디자인").closest("a");
    expect(designLink).toHaveAttribute("href", "/?category=design");
  });

  it("renders '에이전트 생성' button", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("에이전트 생성")).toBeInTheDocument();
  });

  it("renders '도움말' link", () => {
    render(<Sidebar categories={mockCategories} />);

    expect(screen.getByText("도움말")).toBeInTheDocument();
  });

  it("highlights 대시보드 when pathname is / and no category param", () => {
    mockUsePathname.mockReturnValue("/");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(<Sidebar categories={mockCategories} />);

    const dashboardLink = screen.getByText("대시보드").closest("a");
    expect(dashboardLink?.className).toContain("bg-primary");
  });

  it("highlights 내 에이전트 when pathname is /myagent", () => {
    mockUsePathname.mockReturnValue("/myagent");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    render(<Sidebar categories={mockCategories} />);

    const myAgentLink = screen.getByText("내 에이전트").closest("a");
    expect(myAgentLink?.className).toContain("bg-primary");
  });

  it("highlights active category when ?category=design is in URL", () => {
    mockUsePathname.mockReturnValue("/");
    mockUseSearchParams.mockReturnValue(new URLSearchParams("category=design"));

    render(<Sidebar categories={mockCategories} />);

    const designLink = screen.getByText("디자인").closest("a");
    expect(designLink?.className).toContain("bg-primary");

    const dashboardLink = screen.getByText("대시보드").closest("a");
    expect(dashboardLink?.className).not.toContain("bg-primary");
  });
});
