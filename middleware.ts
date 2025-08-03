import { NextRequest, NextResponse } from "next/server";

export async function middleware(_request: NextRequest) {
  // For now, let's disable middleware authentication to avoid issues
  // and let the individual pages handle authentication
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
