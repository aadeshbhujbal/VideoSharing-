import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoutes = (req: NextRequest) => {
  const protectedRoutes = ["/dashboard(.*)", "/payment(.*)", "api/payment"];
  return protectedRoutes.some((route) =>
    new RegExp(route).test(req.nextUrl.pathname)
  );
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoutes(req)) {
    auth.protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
