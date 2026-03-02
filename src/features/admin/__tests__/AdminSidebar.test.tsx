import { render, screen } from "@testing-library/react";
import { AdminSidebar } from "../AdminSidebar";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("AdminSidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin");
  });

  it("'회원관리' 탭이 렌더링된다", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("회원관리")).toBeInTheDocument();
  });

  it("'스킬관리' 탭이 렌더링된다", () => {
    render(<AdminSidebar />);
    expect(screen.getByText("스킬관리")).toBeInTheDocument();
  });

  it("'회원관리' 탭은 /admin/members 링크를 가진다", () => {
    render(<AdminSidebar />);
    const link = screen.getByText("회원관리").closest("a");
    expect(link).toHaveAttribute("href", "/admin/members");
  });

  it("'스킬관리' 탭은 /admin/skills 링크를 가진다", () => {
    render(<AdminSidebar />);
    const link = screen.getByText("스킬관리").closest("a");
    expect(link).toHaveAttribute("href", "/admin/skills");
  });

  it("현재 경로가 /admin/members일 때 '회원관리' 탭이 활성 클래스를 가진다", () => {
    mockUsePathname.mockReturnValue("/admin/members");
    render(<AdminSidebar />);
    const link = screen.getByText("회원관리").closest("a");
    expect(link).toHaveClass("bg-primary/10");
  });

  it("현재 경로가 /admin/skills일 때 '스킬관리' 탭이 활성 클래스를 가진다", () => {
    mockUsePathname.mockReturnValue("/admin/skills");
    render(<AdminSidebar />);
    const link = screen.getByText("스킬관리").closest("a");
    expect(link).toHaveClass("bg-primary/10");
  });

  it("현재 경로가 /admin일 때 탭 중 활성 클래스를 가진 항목이 없다", () => {
    mockUsePathname.mockReturnValue("/admin");
    render(<AdminSidebar />);
    const membersLink = screen.getByText("회원관리").closest("a");
    const skillsLink = screen.getByText("스킬관리").closest("a");
    expect(membersLink).not.toHaveClass("bg-primary/10");
    expect(skillsLink).not.toHaveClass("bg-primary/10");
  });
});
