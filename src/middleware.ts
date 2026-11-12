import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { JWT_SECRET } from './lib/envSecret';

const jwtSecret = JWT_SECRET as string;

type TokenPayload = { id?: string; phone?: string; role?: string };

async function readToken(request: NextRequest): Promise<TokenPayload | null> {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                              /api/admin access                             */
/* -------------------------------------------------------------------------- */
// Everything under /api/admin needs a logged-in Admin, except the few endpoints
// the storefront itself calls.

// Read-only data the storefront shows to every visitor
const PUBLIC_READ = ['setting', 'categories', 'brands', 'sliders', 'faqs', 'site-content'];

// Things a visitor (guest checkout included) is allowed to submit
const PUBLIC_CREATE = ['orders', 'request-quote'];

type ApiAccess = 'public' | 'self' | 'admin';

function apiAccess(method: string, segments: string[]): ApiAccess {
  const [resource, id, ...rest] = segments;

  if (method === 'GET' && PUBLIC_READ.includes(resource)) return 'public';
  if (method === 'POST' && PUBLIC_CREATE.includes(resource) && !id) return 'public';

  // A single order by id: order success page and the customer's order details
  if (method === 'GET' && resource === 'orders' && id && rest.length === 0) return 'public';

  // A customer reading or updating their own profile
  if (resource === 'users' && id && rest.length === 0 && ['GET', 'PATCH', 'PUT'].includes(method)) return 'self';

  return 'admin';
}

const deny = (status: 401 | 403) =>
  NextResponse.json(
    { success: false, message: status === 401 ? 'Unauthorized: please log in' : 'Forbidden: admin access required' },
    { status }
  );

async function guardAdminApi(request: NextRequest) {
  const segments = request.nextUrl.pathname.replace(/^\/api\/admin\/?/, '').split('/').filter(Boolean);
  const access = apiAccess(request.method, segments);

  if (access === 'public') return NextResponse.next();

  const user = await readToken(request);
  if (!user) return deny(401);
  if (user.role === 'Admin') return NextResponse.next();
  if (access === 'self' && user.id && user.id === segments[1]) return NextResponse.next();

  return deny(403);
}

/* -------------------------------------------------------------------------- */
/*                                 Middleware                                 */
/* -------------------------------------------------------------------------- */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin')) {
    return guardAdminApi(request);
  }

  const user = await readToken(request);

  if (!user) {
    return NextResponse.redirect(new URL('/user-auth', request.url))
  }

  // Protect admin route
  if (pathname.startsWith('/admin') && user.role !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard route
  if (pathname.startsWith('/dashboard') && !user.role) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/api/admin/:path*'],
}
