const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Location of the full Sparticuz Chromium package (dev/build time only)
const chromiumBinDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "@sparticuz",
  "chromium",
  "bin"
);

// Where we'll write the tarball that will be served statically by Next/Vercel
const publicDir = path.join(__dirname, "..", "public");
const outputTar = path.join(publicDir, "chromium-pack.tar");

if (!fs.existsSync(chromiumBinDir)) {
  console.log(
    "[pack-chromium] @sparticuz/chromium bin directory not found, skipping tarball creation."
  );
  process.exit(0);
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

try {
  console.log("[pack-chromium] Creating Chromium tarball at:", outputTar);
  // Pack the entire bin directory contents into a gzipped tarball.
  // This is what @sparticuz/chromium-min will download & extract at runtime.
  execSync(`cd "${chromiumBinDir}" && tar -czf "${outputTar}" .`, {
    stdio: "inherit",
  });
  console.log("[pack-chromium] ✓ chromium-pack.tar created successfully.");
} catch (error) {
  console.error("[pack-chromium] Failed to create Chromium tarball:", error);
  process.exit(1);
}

