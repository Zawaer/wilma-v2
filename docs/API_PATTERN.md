# API Route Pattern

This document explains the recommended pattern for creating API routes that interact with Wilma.

## Quick Start

For any API route that needs Wilma authentication:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getWilmaSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  // Get the authenticated session
  const session = await getWilmaSession();

  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Use the session to call Wilma API methods
  const data = await session.someMethod();

  if (!data) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
```

## How It Works

1. **Login** (`/api/login/route.ts`):
   - Creates a new `WilmaSession`
   - Calls `session.login(username, password)`
   - Stores `Wilma2SID` and `wilmaUrl` in httpOnly cookies

2. **Session Helper** (`lib/session.ts`):
   - `getWilmaSession()` reads cookies
   - Reconstructs a `WilmaSession` instance
   - Returns `null` if not authenticated

3. **API Routes**:
   - Import `getWilmaSession()`
   - Call it to get the authenticated session
   - Use the session to interact with Wilma API

4. **Middleware** (`middleware.ts`):
   - Checks for both `Wilma2SID` and `wilmaUrl` cookies
   - Redirects to `/login` if missing

## Why This Pattern?

- ✅ **Stateless**: Each request is independent (good for Next.js)
- ✅ **Secure**: Cookies are httpOnly (can't be accessed by JS)
- ✅ **Clean**: Reusable `getWilmaSession()` helper
- ✅ **Simple**: No complex session management needed
- ✅ **Maintainable**: Clear separation of concerns

## Adding New Wilma API Methods

To add a new Wilma API method:

1. Add the method to `WilmaSession` class in `lib/wilma-api.ts`
2. Create a new API route that uses `getWilmaSession()`
3. Call your new method on the session

Example:

```typescript
// In lib/wilma-api.ts
async getMessages(): Promise<any> {
  const res = await fetch(`${this.wilmaUrl}/messages`, {
    method: "GET",
    headers: { "Cookie": `Wilma2SID=${this.wilma2SID}` }
  });
  // ... parse and return data
}

// In app/api/messages/route.ts
export async function GET(request: NextRequest) {
  const session = await getWilmaSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const messages = await session.getMessages();
  return NextResponse.json(messages);
}
```
