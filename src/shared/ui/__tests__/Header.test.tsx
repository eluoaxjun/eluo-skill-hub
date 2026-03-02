import React from "react";
import { render, screen } from "@testing-library/react";
import { Header } from "@/shared/ui/Header";

jest.mock("@/shared/ui/ProfileDropdown", () => ({
  ProfileDropdown: ({ email }: { email: string }) => (
    <button data-testid="profile-avatar">{email?.charAt(0) || "U"}</button>
  ),
}));

describe("Header", () => {
  it("renders breadcrumb texts '마켓플레이스' and '추천 스킬'", () => {
    render(<Header />);

    expect(screen.getByText("마켓플레이스")).toBeInTheDocument();
    expect(screen.getByText("추천 스킬")).toBeInTheDocument();
  });

  it("renders navigation links: '탐색하기', '인기 스킬'", () => {
    render(<Header />);

    expect(screen.getByText("탐색하기")).toBeInTheDocument();
    expect(screen.getByText("인기 스킬")).toBeInTheDocument();
  });

  it("renders notifications button", () => {
    render(<Header />);

    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("renders user profile avatar area", () => {
    render(<Header />);

    expect(screen.getByTestId("profile-avatar")).toBeInTheDocument();
  });
});
