import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { ZipArchive } from "archiver";
import { PIECE_COUNT } from "@/lib/pieces";

const pad = (n: number) => String(n).padStart(3, "0");

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = [
    ...new Set(
      raw
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= PIECE_COUNT),
    ),
  ];

  if (ids.length === 0) {
    return new Response("No pieces selected", { status: 400 });
  }

  const root = process.cwd();
  const archive = new ZipArchive({ zlib: { level: 6 } });

  for (const id of ids) {
    const name = `piece-${pad(id)}.webp`;
    const filePath = path.join(root, "public", "image", "large", name);
    if (fs.existsSync(filePath)) archive.file(filePath, { name });
  }

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on("data", (c) => chunks.push(c));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
    archive.finalize();
  });

  return new Response(buffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="memories-${ids.length}.zip"`,
    },
  });
}
