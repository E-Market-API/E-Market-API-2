import sharp from "sharp";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";


const defaultOptions = {
  maxWidth: 1600,
  jpegQuality: 80,
  webpQuality: 80,
  pngCompressionLevel: 9,
  skipGif: true,
};
export const optimizeImages = (opts = {}) => {
  const options = { ...defaultOptions, ...opts };

  return async (req, res, next) => {
    try {
      // collect Images:
      const fileGroups = [];

      if (req.file) {
        fileGroups.push([req.file]);
      }
      if (Array.isArray(req.files)) {
        fileGroups.push(req.files);
      } else if (req.files && typeof req.files === "object") {
        Object.values(req.files).forEach((arr) => {
          if (Array.isArray(arr)) fileGroups.push(arr);
        });
      }

      if (fileGroups.length === 0) return next();

      // process each file
      for (const group of fileGroups) {
        for (const file of group) {
          // determine full path (support diskStorage and memoryStorage)
          let filePath = file.path || (file.destination && file.filename ? path.join(file.destination, file.filename) : null);
          const isMemory = !!file.buffer;

          // if memory storage and no destination/filename, try to create a file name under uploads/products
          if (!filePath && isMemory) {
            const destDir = file.destination ? file.destination : path.join(process.cwd(), "uploads", "products");
            if (!fsSync.existsSync(destDir)) {
              await fs.mkdir(destDir, { recursive: true });
            }
            const filename = file.filename || (file.originalname ? `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}` : `${Date.now()}.jpg`);
            filePath = path.join(destDir, filename);

            // ensure multer downstream sees a filename/path if needed
            file.filename = file.filename || path.basename(filename);
            file.destination = file.destination || destDir;
            file.path = file.path || filePath;
          }

          if (!filePath) {
            // nothing we can do
            console.warn("optimizeImages: no disk path or buffer available for file, skipping");
            continue;
          }

          // make sure file exists (if disk) or buffer exists (if memory)
          if (!isMemory) {
            try {
              await fs.access(filePath);
            } catch {
              // file not found, skip
              console.warn("optimizeImages: file not found on disk, skipping:", filePath);
              continue;
            }
          }

          const ext = path.extname(filePath).toLowerCase();

          const tmpPath = `${filePath}.tmp`;

          try {
            // Build sharp pipeline from buffer (memory) or from disk path
            const input = isMemory ? file.buffer : filePath;
            const pipeline = sharp(input).rotate().resize({
              width: options.maxWidth,
              withoutEnlargement: true,
            });

            // apply format-specific options and write to tmpPath
            if (ext === ".jpg" || ext === ".jpeg") {
              await pipeline.jpeg({ quality: options.jpegQuality }).toFile(tmpPath);
            } else if (ext === ".png") {
              await pipeline.png({ compressionLevel: options.pngCompressionLevel }).toFile(tmpPath);
            } else if (ext === ".webp") {
              await pipeline.webp({ quality: options.webpQuality }).toFile(tmpPath);
            } else {
              // unknown/unsupported types: skip
              console.warn("optimizeImages: unsupported extension, skipping:", ext, filePath);
              continue;
            }

            // replace original with optimized file (if original was in memory we now have a disk file)
            await fs.rename(tmpPath, filePath);

            // update file metadata
            try {
              const stats = await fs.stat(filePath);
              file.size = stats.size;
              file.path = filePath;
            } catch (e) {
              // ignore
            }
          } catch (procErr) {
            // if tmp exists, try to remove it
            try {
              if (fsSync.existsSync(tmpPath)) await fs.unlink(tmpPath);
            } catch (e) { /* ignore */ }

            console.error("Image optimization failed for", filePath, procErr);
            continue;
          }
        }
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};
