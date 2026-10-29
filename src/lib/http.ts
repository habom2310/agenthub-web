import { NextResponse } from "next/server";

// An error that maps straight to an API response
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public headers: Record<string, string> = {}
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown, logMessage: string, fallback: string): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status, headers: error.headers });
  }
  console.error(logMessage, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
