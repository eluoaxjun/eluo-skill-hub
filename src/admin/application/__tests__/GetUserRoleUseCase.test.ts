import { GetUserRoleUseCase } from "../GetUserRoleUseCase";
import type { AdminRepository } from "../ports/AdminRepository";

describe("GetUserRoleUseCase", () => {
  const mockAdminRepository: jest.Mocked<AdminRepository> = {
    getUserRole: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("adminRepository.getUserRole을 userId로 호출한다", async () => {
    mockAdminRepository.getUserRole.mockResolvedValue("admin");
    const useCase = new GetUserRoleUseCase(mockAdminRepository);

    await useCase.execute("user-123");

    expect(mockAdminRepository.getUserRole).toHaveBeenCalledWith("user-123");
  });

  it("역할이 'admin'이면 isAdmin: true를 반환한다", async () => {
    mockAdminRepository.getUserRole.mockResolvedValue("admin");
    const useCase = new GetUserRoleUseCase(mockAdminRepository);

    const result = await useCase.execute("admin-user");

    expect(result).toEqual({ role: "admin", isAdmin: true });
  });

  it("역할이 'user'이면 isAdmin: false를 반환한다", async () => {
    mockAdminRepository.getUserRole.mockResolvedValue("user");
    const useCase = new GetUserRoleUseCase(mockAdminRepository);

    const result = await useCase.execute("normal-user");

    expect(result).toEqual({ role: "user", isAdmin: false });
  });

  it("역할이 null이면 isAdmin: false를 반환한다", async () => {
    mockAdminRepository.getUserRole.mockResolvedValue(null);
    const useCase = new GetUserRoleUseCase(mockAdminRepository);

    const result = await useCase.execute("unknown-user");

    expect(result).toEqual({ role: null, isAdmin: false });
  });
});
