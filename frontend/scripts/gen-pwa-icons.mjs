/* ============================================================
   Gera os ícones PWA a partir do public/favicon.svg.
   Uso: node scripts/gen-pwa-icons.mjs
   - pwa-192x192.png / pwa-512x512.png : fundo transparente (purpose any)
   - maskable-512x512.png              : fundo branco + safe-zone (maskable)
   ============================================================ */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "public", "favicon.svg");
const OUT = path.join(root, "public");

/** Renderiza o logo (svg) centralizado num canvas quadrado. */
async function gen(size, file, { bg, pad }) {
  const inner = Math.round(size * (1 - pad * 2));
  const logo = await sharp(SRC, { density: 1200 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, file));

  console.log("✓", file);
}

// favicon.svg é o logo BRANCO (gradiente #999 → white) → precisa de fundo
// escuro p/ aparecer. Usamos o navy do painel hero (--color-navy #0a0e1a).
const navy = { r: 10, g: 14, b: 26, alpha: 1 };

await gen(192, "pwa-192x192.png", { bg: navy, pad: 0.12 });
await gen(512, "pwa-512x512.png", { bg: navy, pad: 0.12 });
// Maskable: logo dentro da safe-zone (~64%) p/ não cortar no círculo.
await gen(512, "maskable-512x512.png", { bg: navy, pad: 0.18 });
