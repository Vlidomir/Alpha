import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai/mock-ai-provider";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeJob } from "@/lib/jobs";
import { storageProvider } from "@/lib/storage/local-storage-provider";
import { validateJobForm } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.imageJob.findMany({
    where: { userId: session.user.id },
    include: {
      uploadedImages: { orderBy: { createdAt: "asc" } },
      generatedImages: { orderBy: { createdAt: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ jobs: jobs.map(serializeJob) });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const validation = validateJobForm(await request.formData());

  if ("error" in validation) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  const job = await prisma.imageJob.create({
    data: {
      userId: session.user.id,
      prompt: validation.prompt,
      status: "pending"
    }
  });

  try {
    const storedUploads = await Promise.all(
      validation.images.map((image) =>
        storageProvider.saveUpload({
          file: image.file,
          jobId: job.id,
          extension: image.extension
        })
      )
    );

    const uploadedImages = await Promise.all(
      storedUploads.map((storedFile, index) =>
        prisma.uploadedImage.create({
          data: {
            jobId: job.id,
            fileName: storedFile.fileName,
            originalName: validation.images[index].file.name,
            mimeType: storedFile.mimeType,
            size: storedFile.size,
            path: storedFile.path
          }
        })
      )
    );

    await prisma.imageJob.update({
      where: { id: job.id },
      data: { status: "processing" }
    });

    const imageBuffers = await Promise.all(
      uploadedImages.map((image) => storageProvider.read(image.path))
    );

    const generated = await aiProvider.generate({
      prompt: validation.prompt,
      images: [
        {
          originalName: uploadedImages[0].originalName,
          mimeType: uploadedImages[0].mimeType,
          buffer: imageBuffers[0]
        },
        {
          originalName: uploadedImages[1].originalName,
          mimeType: uploadedImages[1].mimeType,
          buffer: imageBuffers[1]
        }
      ]
    });

    const storedResult = await storageProvider.saveResult({
      buffer: generated.buffer,
      jobId: job.id,
      extension: generated.extension,
      mimeType: generated.mimeType
    });

    await prisma.generatedImage.create({
      data: {
        jobId: job.id,
        fileName: storedResult.fileName,
        mimeType: storedResult.mimeType,
        size: storedResult.size,
        path: storedResult.path,
        promptSnapshot: validation.prompt
      }
    });

    const completedJob = await prisma.imageJob.update({
      where: { id: job.id },
      data: { status: "completed", error: null },
      include: {
        uploadedImages: { orderBy: { createdAt: "asc" } },
        generatedImages: { orderBy: { createdAt: "asc" } }
      }
    });

    return NextResponse.json({ job: serializeJob(completedJob) }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process image job.";

    const failedJob = await prisma.imageJob.update({
      where: { id: job.id },
      data: { status: "failed", error: message },
      include: {
        uploadedImages: { orderBy: { createdAt: "asc" } },
        generatedImages: { orderBy: { createdAt: "asc" } }
      }
    });

    return NextResponse.json(
      { error: message, job: serializeJob(failedJob) },
      { status: 500 }
    );
  }
}
