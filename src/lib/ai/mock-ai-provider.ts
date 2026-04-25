import type { AIProvider } from "@/lib/ai/types";

export class MockAIProvider implements AIProvider {
  async generate(input: Parameters<AIProvider["generate"]>[0]) {
    const [first, second] = input.images;
    const svg = buildSvg({
      prompt: input.prompt,
      first: {
        name: first.originalName,
        href: toDataUri(first.mimeType, first.buffer)
      },
      second: {
        name: second.originalName,
        href: toDataUri(second.mimeType, second.buffer)
      }
    });

    return {
      buffer: Buffer.from(svg, "utf8"),
      extension: "svg",
      mimeType: "image/svg+xml"
    };
  }
}

function toDataUri(mimeType: string, buffer: Buffer) {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function buildSvg(input: {
  prompt: string;
  first: { name: string; href: string };
  second: { name: string; href: string };
}) {
  const promptLines = wrapText(input.prompt, 58).slice(0, 4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="820" viewBox="0 0 1200 820" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="820" fill="#F7F5F0"/>
  <rect x="44" y="44" width="1112" height="732" rx="24" fill="#FFFFFF" stroke="#D8DCE3" stroke-width="2"/>
  <text x="78" y="103" fill="#172033" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="800">Mock AI edit result</text>
  <text x="78" y="144" fill="#677083" font-family="Inter, Arial, sans-serif" font-size="20">Generated locally from two uploaded images</text>
  <rect x="78" y="184" width="506" height="380" rx="18" fill="#E7EAF0"/>
  <rect x="616" y="184" width="506" height="380" rx="18" fill="#E7EAF0"/>
  <clipPath id="clipA"><rect x="78" y="184" width="506" height="380" rx="18"/></clipPath>
  <clipPath id="clipB"><rect x="616" y="184" width="506" height="380" rx="18"/></clipPath>
  <image href="${input.first.href}" x="78" y="184" width="506" height="380" preserveAspectRatio="xMidYMid slice" clip-path="url(#clipA)"/>
  <image href="${input.second.href}" x="616" y="184" width="506" height="380" preserveAspectRatio="xMidYMid slice" clip-path="url(#clipB)"/>
  <rect x="78" y="596" width="1044" height="126" rx="18" fill="#D9F2EF"/>
  <text x="108" y="634" fill="#115E59" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800">Prompt</text>
  ${promptLines
    .map(
      (line, index) =>
        `<text x="108" y="${666 + index * 26}" fill="#172033" font-family="Inter, Arial, sans-serif" font-size="22">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <text x="96" y="588" fill="#677083" font-family="Inter, Arial, sans-serif" font-size="16">${escapeXml(input.first.name)}</text>
  <text x="634" y="588" fill="#677083" font-family="Inter, Arial, sans-serif" font-size="16">${escapeXml(input.second.name)}</text>
</svg>`;
}

function wrapText(value: string, maxChars: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [value];
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const aiProvider = new MockAIProvider();
