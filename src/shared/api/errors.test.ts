import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";

describe("ApiError", () => {
  it("uses DRF detail message when available", () => {
    const error = new ApiError(401, "/auth/login/", {
      detail: "Invalid email or password",
    });

    expect(error.message).toBe("Invalid email or password");
    expect(error.status).toBe(401);
  });

  it("uses first field validation message for 400 responses", () => {
    const error = new ApiError(400, "/auth/login/", {
      email: ["Enter a valid email address."],
    });

    expect(error.message).toBe("Enter a valid email address.");
  });

  it("detects proxy ECONNREFUSED as backend unreachable", () => {
    const error = new ApiError(500, "/auth/login/", null);

    expect(error.message).toContain("No se pudo conectar con el backend");
  });
});
