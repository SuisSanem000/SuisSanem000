// ============================================================
// NEXT.JS TYPESCRIPT EXAMPLES FOR INTERVIEW PREPARATION
// ============================================================
// This file demonstrates key Next.js patterns and syntax.
// Read through the comments to understand each concept.
// ============================================================

// ============================================================
// SECTION 1: PAGE COMPONENT (app/page.tsx)
// ============================================================
// In Next.js App Router, every page.tsx file becomes a route.
// This is a Server Component by default - it runs on the server.

// This would be the content of app/page.tsx
export default function HomePage() {
  // Server Components can do async operations directly
  // No useEffect needed!
  return (
    <main>
      <h1>Welcome to My App</h1>
    </main>
  );
}

// ============================================================
// SECTION 2: ASYNC SERVER COMPONENT WITH DATA FETCHING
// ============================================================
// Server Components can be async - they fetch data before rendering.
// This pattern replaces getServerSideProps from Pages Router.

interface Post {
  id: number;
  title: string;
  body: string;
}

async function BlogPage() {
  // fetch() is extended by Next.js with caching options
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    // OPTION 1: Fresh data every request (like SSR)
    cache: "no-store",

    // OPTION 2: Revalidate every 60 seconds (ISR behavior)
    // next: { revalidate: 60 }

    // OPTION 3: Cache forever until manually invalidated (default SSG behavior)
    // cache: 'force-cache'
  });

  const posts: Post[] = await response.json();

  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </article>
      ))}
    </div>
  );
}

// ============================================================
// SECTION 3: CLIENT COMPONENT
// ============================================================
// Add "use client" directive at the top to make it a Client Component.
// Client Components can use React hooks and browser APIs.

// "use client"  // <-- This would go at the very top of the file

import { useState, useEffect } from "react";

function InteractiveCounter() {
  // useState only works in Client Components
  const [count, setCount] = useState(0);

  // useEffect only works in Client Components
  useEffect(() => {
    console.log("Component mounted in browser");
  }, []);

  return (
    <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
  );
}

// ============================================================
// SECTION 4: LAYOUT COMPONENT (app/layout.tsx)
// ============================================================
// Layouts wrap pages and persist across navigation.
// They don't re-render when navigating between child pages.

interface LayoutProps {
  children: React.ReactNode;
}

function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>My Navigation</nav>
        </header>
        <main>{children}</main>
        <footer>My Footer</footer>
      </body>
    </html>
  );
}

// ============================================================
// SECTION 5: DYNAMIC ROUTES (app/blog/[slug]/page.tsx)
// ============================================================
// [slug] in the folder name creates a dynamic route segment.
// The parameter is passed as a prop.

interface PageParams {
  params: {
    slug: string;
  };
}

async function BlogPostPage({ params }: PageParams) {
  const { slug } = params;

  // Use the slug to fetch specific data
  const post = await fetch(`https://api.example.com/posts/${slug}`);

  return <article>{/* Render post content */}</article>;
}

// ============================================================
// SECTION 6: generateStaticParams - Pre-render Dynamic Routes
// ============================================================
// This function tells Next.js which dynamic routes to pre-render at build time.
// Similar to getStaticPaths in Pages Router.

async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((res) =>
    res.json()
  );

  // Return an array of objects with the dynamic parameter
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

// ============================================================
// SECTION 7: LOADING STATE (app/blog/loading.tsx)
// ============================================================
// Create loading.tsx to show automatic loading UI while page loads.
// Uses React Suspense under the hood.

function LoadingState() {
  return (
    <div className="loading-spinner">
      <p>Loading content...</p>
    </div>
  );
}

// ============================================================
// SECTION 8: ERROR HANDLING (app/blog/error.tsx)
// ============================================================
// Create error.tsx to handle errors in that route segment.
// Must be a Client Component.

// "use client"

interface ErrorProps {
  error: Error;
  reset: () => void; // Function to retry the failed render
}

function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// ============================================================
// SECTION 9: API ROUTE (app/api/users/route.ts)
// ============================================================
// API routes are created with route.ts files.
// Export functions named after HTTP methods.

import { NextRequest, NextResponse } from "next/server";

// GET handler - handles GET /api/users
export async function GET(request: NextRequest) {
  // Access query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";

  // Return JSON response
  return NextResponse.json({
    users: [],
    page: parseInt(page),
  });
}

// POST handler - handles POST /api/users
export async function POST(request: NextRequest) {
  // Parse JSON body
  const body = await request.json();

  // Validate, process, save to database...

  // Return response with status code
  return NextResponse.json({ success: true, user: body }, { status: 201 });
}

// ============================================================
// SECTION 10: API ROUTE WITH DYNAMIC SEGMENT
// ============================================================
// app/api/users/[id]/route.ts

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GETById(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params;

  // Fetch user by ID from database
  // const user = await db.users.findById(id);

  return NextResponse.json({ id, name: "John Doe" });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = params;

  // Delete user from database
  // await db.users.delete(id);

  return NextResponse.json({ deleted: true });
}

// ============================================================
// SECTION 11: MIDDLEWARE (middleware.ts at project root)
// ============================================================
// Middleware runs before requests are completed.
// Great for auth, redirects, and request modification.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Example: Check for authentication token
  const token = request.cookies.get("auth-token");

  // If no token and trying to access protected route
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Configure which paths middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};

// ============================================================
// SECTION 12: METADATA FOR SEO (app/page.tsx)
// ============================================================
// Export metadata object to define page meta tags.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Blog | Home",
  description: "Welcome to my blog about web development",
  keywords: ["web development", "Next.js", "React"],
  openGraph: {
    title: "My Blog",
    description: "Articles about web development",
    images: ["/og-image.png"],
  },
};

// ============================================================
// SECTION 13: DYNAMIC METADATA (app/blog/[slug]/page.tsx)
// ============================================================
// Use generateMetadata for dynamic pages.

interface MetadataParams {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: MetadataParams): Promise<Metadata> {
  // Fetch the post to get its title
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(
    (res) => res.json()
  );

  return {
    title: post.title,
    description: post.excerpt,
  };
}

// ============================================================
// SECTION 14: CLIENT-SIDE NAVIGATION HOOKS
// ============================================================
// These hooks only work in Client Components.

// "use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation";

function NavigationExample() {
  // Programmatic navigation
  const router = useRouter();

  // Current path (e.g., "/blog/my-post")
  const pathname = usePathname();

  // Query parameters (e.g., ?page=2&sort=asc)
  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  function handleNavigate() {
    // Navigate to a new page
    router.push("/dashboard");

    // Replace current history entry
    // router.replace('/dashboard');

    // Go back
    // router.back();

    // Refresh the current page (refetches data)
    // router.refresh();
  }

  return <button onClick={handleNavigate}>Go to Dashboard</button>;
}

// ============================================================
// SECTION 15: SERVER ACTIONS (Next.js 14+)
// ============================================================
// Server Actions let you define server-side functions that can be
// called directly from Client Components.

// "use server" directive marks this as a Server Action
async function saveToDatabase(formData: FormData) {
  "use server";

  const name = formData.get("name");
  const email = formData.get("email");

  // Save to database (this runs on server only)
  // await db.users.create({ name, email });

  // Optionally revalidate cached data
  // revalidatePath('/users');
}

// Use in a form (can be Server or Client Component)
function ContactForm() {
  return (
    <form action={saveToDatabase}>
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}

// ============================================================
// SECTION 16: IMAGE OPTIMIZATION (next/image)
// ============================================================
// Always use next/image for automatic optimization.

import Image from "next/image";

function OptimizedImage() {
  return (
    <div>
      {/* Local image */}
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={1200}
        height={600}
        priority // Load immediately (for above-the-fold images)
      />

      {/* Remote image (must configure domains in next.config.js) */}
      <Image
        src="https://example.com/photo.jpg"
        alt="Remote photo"
        width={400}
        height={300}
        loading="lazy" // Default behavior
      />

      {/* Fill container (responsive) */}
      <div style={{ position: "relative", width: "100%", height: "400px" }}>
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

// ============================================================
// SECTION 17: ENVIRONMENT VARIABLES
// ============================================================
// Next.js has built-in support for environment variables.

// Server-side only (default)
const databaseUrl = process.env.DATABASE_URL;

// Client-side accessible (must prefix with NEXT_PUBLIC_)
const publicApiKey = process.env.NEXT_PUBLIC_API_KEY;

// Type-safe environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXT_PUBLIC_API_KEY: string;
      SECRET_KEY: string;
    }
  }
}

// ============================================================
// SUMMARY OF KEY PATTERNS
// ============================================================
/*

1. FILE-BASED ROUTING
   - page.tsx = route content
   - layout.tsx = shared wrapper
   - loading.tsx = loading state
   - error.tsx = error boundary
   - route.ts = API endpoint

2. SERVER vs CLIENT COMPONENTS
   - Default is Server Component
   - Add "use client" for interactivity
   - Server Components can import Client Components

3. DATA FETCHING
   - Use fetch() directly in Server Components
   - Control caching with cache and next.revalidate options
   - No need for getServerSideProps/getStaticProps in App Router

4. API ROUTES
   - Create route.ts in app/api/
   - Export GET, POST, PUT, DELETE functions
   - Use NextRequest and NextResponse

5. NAVIGATION
   - <Link> component for declarative navigation
   - useRouter() hook for programmatic navigation
   - usePathname() and useSearchParams() for URL info

*/
