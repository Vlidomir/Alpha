import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storageProvider } from "@/lib/storage/local-storage-provider";

export async function GET(
  request: Request,
  context: { params: Promise<{ fileId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await context.params;
  const file =
    (await prisma.uploadedImage.findFirst({
      where: {
        id: fileId,
        job: { userId: session.user.id }
      },
      select: {
        fileName: true,
        mimeType: true,
        path: true
      }
    })) ??
    (await prisma.generatedImage.findFirst({
      where: {
        id: fileId,
        job: { userId: session.user.id }
      },
      select: {
        fileName: true,
        mimeType: true,
        path: true
      }
    }));

  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const buffer = await storageProvider.read(file.path);

  return new Response(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": `inline; filename="${file.fileName}"`,
      "Cache-Control": "private, max-age=3600"
    }
  });
}
