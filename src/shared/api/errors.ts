// ⚠️ AGNOSTIC — HTTP error parsing for DRF/JWT backend

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: unknown;

  constructor(status: number, path: string, body: unknown) {
    super(parseApiErrorMessage(body, status));
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function parseApiErrorMessage(body: unknown, status: number): string {
  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return record.detail;
    }

    const fieldMessages = Object.values(record)
      .flatMap((value) => (Array.isArray(value) ? value : []))
      .filter((value): value is string => typeof value === "string");

    if (fieldMessages.length > 0) {
      return fieldMessages[0];
    }
  }

  if (status === 401) {
    return "Invalid email or password";
  }

  if (status === 403) {
    return "You do not have permission to perform this action";
  }

  return `Request failed (${status})`;
}
