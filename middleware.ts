import { NextRequest, NextResponse } from "next/server";
import { createMiddleware } from "@arcjet/next";
import { detectBot, shield } from "arcjet";
import aj from "./lib/arcjet";

const validate = aj.withRule(shield({ mode: "LIVE" })).withRule(
  detectBot({
    mode: "LIVE",
    allow: ["CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER"],
  })
);

export default createMiddleware(validate);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};
