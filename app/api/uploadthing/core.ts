import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

async function requireSession(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    throw new UploadThingError("غير مصرح");
  }
  return session;
}

export const ourFileRouter = {
  courseImage: f({
    image: { maxFileSize: "8MB" },
  })
    .middleware(async ({ req }) => {
      const session = await requireSession(req);
      if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") {
        throw new UploadThingError("غير مصرح");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),

  pdf: f({
    "application/pdf": { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const session = await requireSession(req);
      if (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT_ADMIN") {
        throw new UploadThingError("غير مصرح");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),

  homework: f({
    image: { maxFileSize: "8MB" },
    "application/pdf": { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      const session = await requireSession(req);
      if (session.user.role !== "STUDENT") {
        throw new UploadThingError("غير مصرح");
      }
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const type = file.type.startsWith("image/") ? "image" : "pdf";
      return { url: file.ufsUrl, key: file.key, fileName: file.name, type };
    }),

  messageAttachment: f({
    image: { maxFileSize: "16MB" },
    "application/pdf": { maxFileSize: "16MB" },
    "application/msword": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
    },
    "application/vnd.ms-excel": { maxFileSize: "16MB" },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
    },
  })
    .middleware(async ({ req }) => {
      const session = await requireSession(req);
      return { userId: session.user.id, role: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const isImage = file.type.startsWith("image/");
      return {
        url: file.ufsUrl,
        key: file.key,
        fileName: file.name,
        messageType: isImage ? "image" : "file",
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

