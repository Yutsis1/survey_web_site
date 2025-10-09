import { NextRequest, NextResponse } from "next/server";
import { SERVICES } from "@/config";

// Solution has been chosen to not using services like Nginx or Traefik
// to keep the stack simple and easy to deploy on platforms like Vercel
// And not parse the NEXT_PUBLIC_API_URL during build time
// to allow easy switching between backend instances/services/environments
// without the need to rebuild/redeploy the frontend

// const SERVICES: Record<string, string | undefined> = {
//     backend: process.env.BACKEND_URL,
//     //   register backend URLs here
//     //   every service will allow client to call it via /api/proxy/{service}/...{rest_of_path}
//     // example  surveys: process.env.SURVEYS_URL,
// };

async function forward(req: NextRequest, path: string[]) {
    // Not needed as we only have one service now
    const [svc, ...rest] = path;
    const base = SERVICES[svc as keyof typeof SERVICES];
    if (!base) return NextResponse.json({ error: `Unknown service: ${svc}` }, { status: 502 });
    const url = new URL(req.url);
    const target = `${base}/${rest.join("/")}${url.search}`;

    const init: RequestInit = {
        method: req.method,
        headers: req.headers, // Object.fromEntries(req.headers),
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
        cache: "no-store",
        // pass cookies if you rely on them between Next and the service
        credentials: "include",
    };

    const res = await fetch(target, init);
    // Optionally filter/normalize headers here
    return new NextResponse(res.body, { status: res.status, headers: res.headers });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return forward(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return forward(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return forward(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return forward(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return forward(req, path);
}
