import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "evidence");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export function getEvidenceStorageRoot(): string {
  return STORAGE_ROOT;
}

export function resolveEvidenceAbsolutePath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("INVALID_PATH");
  }
  return path.join(STORAGE_ROOT, normalized);
}

export async function saveEvidenceScreenshot(params: {
  testId: string;
  sessionId: string;
  findingId: string;
  file: File;
}): Promise<{ relativePath: string; originalName: string }> {
  const { testId, sessionId, findingId, file } = params;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const extension = ALLOWED_MIME_TYPES[file.type];
  if (!extension) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const filename = `${randomUUID()}${extension}`;
  const relativePath = path.join(testId, sessionId, findingId, filename);
  const absolutePath = resolveEvidenceAbsolutePath(relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return {
    relativePath: relativePath.replace(/\\/g, "/"),
    originalName: file.name,
  };
}

export async function readEvidenceFile(relativePath: string): Promise<Buffer> {
  const absolutePath = resolveEvidenceAbsolutePath(relativePath);
  return readFile(absolutePath);
}

export async function deleteEvidenceFile(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;

  try {
    const absolutePath = resolveEvidenceAbsolutePath(relativePath);
    await unlink(absolutePath);
  } catch {
    // File may already be removed
  }
}

export async function saveEvidenceFromBase64(params: {
  testId: string;
  sessionId: string;
  findingId: string;
  base64: string;
  originalName?: string;
}): Promise<{ relativePath: string; originalName: string }> {
  const match = params.base64.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
  if (!match) {
    throw new Error("INVALID_BASE64");
  }

  const mime = match[1];
  const extension = ALLOWED_MIME_TYPES[mime];
  if (!extension) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const filename = `${randomUUID()}${extension}`;
  const relativePath = path.join(params.testId, params.sessionId, params.findingId, filename);
  const absolutePath = resolveEvidenceAbsolutePath(relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    relativePath: relativePath.replace(/\\/g, "/"),
    originalName: params.originalName ?? `captura${extension}`,
  };
}

export function getMimeTypeFromPath(relativePath: string): string {
  const ext = path.extname(relativePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export async function readEvidenceAsDataUrl(relativePath: string): Promise<string | null> {
  try {
    const buffer = await readEvidenceFile(relativePath);
    const mime = getMimeTypeFromPath(relativePath);
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
