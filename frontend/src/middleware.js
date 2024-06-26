import { NextResponse } from "next/server";
import { getCookie, setCookie } from "cookies-next";
import { jwtVerify } from "jose";

const userRoutes = ["/profile", "/tickets"];
const superAdminRoutes = ["/dashboard", "/clubs", "/users"];
const clubAdminRoutes = ["/dashboard", "/events"];

const checkIfSuperAdmin = (payload) => {
  return payload.role === "superAdmin";
};

const checkIfClubAdmin = (payload) => {
  return payload.role === "admin";
};

const checkIfUser = (payload) => {
  return payload.role === "user";
};

const checkIfUserRoute = (pathname) => {
  return userRoutes.some((route) => pathname.startsWith(route));
};

export async function middleware(req) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  const token = getCookie("token", { res, req });

  if (pathname.startsWith("/_next/") || pathname.startsWith("/events")) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname.startsWith("/auth")) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        const { payload } = await jwtVerify(token, secret);

        setCookie("user", payload, { sameSite: "strict", res, req });

        if (pathname.startsWith("/auth")) {
          if (checkIfClubAdmin(payload)) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          }
          if (checkIfUser(payload)) {
            return NextResponse.redirect(new URL("/", req.url));
          }
        }
      } catch (error) {
        console.log("Invalid token during auth route check", error);
      }
    }
    return res;
  }

  if (!token) {
    console.log("No token found");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    setCookie("user", payload, { sameSite: "strict", res, req });

    if (checkIfClubAdmin(payload)) {
      return res;
    }

    if (pathname.startsWith("/dashboard") && !checkIfClubAdmin(payload)) {
      console.log("Admin access required for this route");
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (checkIfUser(payload) && checkIfUserRoute(pathname)) {
      return res;
    }

    console.log("User is not allowed to access this route");
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.log("Invalid token", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}
