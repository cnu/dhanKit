import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filePath = path.join(process.cwd(), "_posts", ...pathSegments);

  // Security: ensure we're not escaping _posts directory
  const postsDir = path.join(process.cwd(), "_posts");
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(postsDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Check if file exists
  if (!fs.existsSync(resolvedPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Get file extension and mime type
  const ext = path.extname(resolvedPath).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  if (!mimeType) {
    return new NextResponse("Unsupported file type", { status: 415 });
  }

  // Read and return the file
  const fileBuffer = fs.readFileSync(resolvedPath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
