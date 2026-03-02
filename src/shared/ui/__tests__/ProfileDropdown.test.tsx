import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileDropdown } from "@/shared/ui/ProfileDropdown";

jest.mock("@/app/logout/actions", () => ({
  logout: jest.fn(),
}));

const TEST_EMAIL = "user@eluocnc.com";

describe("ProfileDropdown", () => {
  it("프로필 아바타가 렌더링된다", () => {
    render(<ProfileDropdown email={TEST_EMAIL} />);

    expect(screen.getByTestId("profile-avatar")).toBeInTheDocument();
  });

  it("아바타 클릭 시 드롭다운 메뉴가 표시된다", async () => {
    const user = userEvent.setup();
    render(<ProfileDropdown email={TEST_EMAIL} />);

    await user.click(screen.getByTestId("profile-avatar"));

    expect(screen.getByText(TEST_EMAIL)).toBeInTheDocument();
  });

  it("드롭다운에 이메일이 표시된다", async () => {
    const user = userEvent.setup();
    render(<ProfileDropdown email={TEST_EMAIL} />);

    await user.click(screen.getByTestId("profile-avatar"));

    expect(screen.getByText(TEST_EMAIL)).toBeInTheDocument();
  });

  it("드롭다운에 '로그아웃' 버튼이 표시된다", async () => {
    const user = userEvent.setup();
    render(<ProfileDropdown email={TEST_EMAIL} />);

    await user.click(screen.getByTestId("profile-avatar"));

    // 드롭다운 안의 로그아웃 버튼 (다이얼로그 안의 버튼과 구분)
    const logoutButtons = screen.getAllByRole("button", { name: "로그아웃" });
    expect(logoutButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("'로그아웃' 클릭 시 확인 다이얼로그가 표시된다", async () => {
    const user = userEvent.setup();
    render(<ProfileDropdown email={TEST_EMAIL} />);

    await user.click(screen.getByTestId("profile-avatar"));

    const logoutButtons = screen.getAllByRole("button", { name: "로그아웃" });
    await user.click(logoutButtons[0]);

    expect(
      screen.getByText("정말 로그아웃하시겠습니까?")
    ).toBeInTheDocument();
  });

  it("'취소' 클릭 시 다이얼로그가 닫힌다", async () => {
    const user = userEvent.setup();
    render(<ProfileDropdown email={TEST_EMAIL} />);

    // 드롭다운 열기
    await user.click(screen.getByTestId("profile-avatar"));

    // 로그아웃 클릭 → 다이얼로그 열기
    const logoutButtons = screen.getAllByRole("button", { name: "로그아웃" });
    await user.click(logoutButtons[0]);
    expect(
      screen.getByText("정말 로그아웃하시겠습니까?")
    ).toBeInTheDocument();

    // 취소 클릭 → 다이얼로그 닫기
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByText("정말 로그아웃하시겠습니까?")
    ).not.toBeInTheDocument();
  });

  it("avatarUrl이 없으면 이니셜을 표시한다", () => {
    render(<ProfileDropdown email={TEST_EMAIL} />);

    const avatar = screen.getByTestId("profile-avatar");
    expect(avatar).toHaveTextContent(
      TEST_EMAIL.charAt(0).toUpperCase()
    );
  });
});
