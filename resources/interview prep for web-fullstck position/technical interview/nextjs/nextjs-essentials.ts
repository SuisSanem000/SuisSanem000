// ============================================================
// NEXT.JS ESSENTIALS - QUICK INTERVIEW REFERENCE
// ============================================================

// ----- 1. PAGE COMPONENT (app/page.tsx) -----
export default function HomePage() {
  return <h1>Welcome</h1>;
}

// ----- 2. ASYNC DATA FETCHING (Server Component) -----
async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    cache: "no-store",           // SSR - fresh every request
    // next: { revalidate: 60 }  // ISR - cache for 60 seconds
    // cache: 'force-cache'      // SSG - cache forever
  }).then(res => res.json());

  return <div>{posts.map(p => <article key={p.id}>{p.title}</article>)}</div>;
}

// ----- 3. CLIENT COMPONENT -----
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}

// ----- 4. LAYOUT (app/layout.tsx) -----
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html><body><nav>Header</nav>{children}<footer>Footer</footer></body></html>
  );
}

// ----- 5. DYNAMIC ROUTE (app/blog/[slug]/page.tsx) -----
async function PostPage({ params }: { params: { slug: string } }) {
  const post = await fetch(`/api/posts/${params.slug}`);
  return <article>{/* content */}</article>;
}

// ----- 6. API ROUTE (app/api/users/route.ts) -----
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get("page");
  return NextResponse.json({ users: [], page });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ user: body }, { status: 201 });
}

// ----- 7. MIDDLEWARE (middleware.ts at root) -----
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };

// ----- 8. METADATA (SEO) -----
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Site",
  description: "Site description",
};

// Dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetch(`/api/posts/${params.slug}`).then(r => r.json());
  return { title: post.title };
}

// ----- 9. NAVIGATION HOOKS (Client Component only) -----
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function NavExample() {
  const router = useRouter();
  const pathname = usePathname();        // "/blog/post-1"
  const params = useSearchParams();      // ?page=2
  
  router.push("/dashboard");             // Navigate
  router.replace("/login");              // Replace history
  router.back();                         // Go back
  router.refresh();                      // Refresh data
}

// ----- 10. SERVER ACTION (Next.js 14+) -----
async function saveUser(formData: FormData) {
  "use server";
  const name = formData.get("name");
  // Save to database
}

function Form() {
  return <form action={saveUser}><input name="name" /><button>Submit</button></form>;
}

// ----- 11. IMAGE OPTIMIZATION -----
import Image from "next/image";

function OptimizedImage() {
  return <Image src="/hero.jpg" alt="Hero" width={800} height={400} priority />;
}

// ============================================================
// KEY FILES SUMMARY:
// page.tsx     → Route UI
// layout.tsx   → Shared wrapper
// loading.tsx  → Loading state
// error.tsx    → Error boundary
// route.ts     → API endpoint
// middleware.ts → Request interceptor
// ============================================================
