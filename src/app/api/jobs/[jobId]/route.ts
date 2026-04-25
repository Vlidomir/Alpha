import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  const job = await prisma.imageJob.findFirst({
    where: {
      id: jobId,
      userId: session.user.id
    },
    include: {
      uploadedImages: { orderBy: { createdAt: "asc" } },
      generatedImages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  return NextResponse.json({ job: serializeJob(job) });
}
