import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { SARKARI_DATA } from '../src/data/sarkariData';
import {
  buildDeterministicThumbnailSpec,
  renderStandaloneMasterThumbnailSvg,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT
} from '../src/thumbnailGenerator';

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'thumbnails');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Starting generation of 1200x630 thumbnails for ${SARKARI_DATA.length} notifications...`);
  let count = 0;

  for (const item of SARKARI_DATA) {
    try {
      const spec = buildDeterministicThumbnailSpec({
        id: item.id,
        title: item.title,
        category: item.category,
        department: item.department,
        postType: item.postType,
        shortInfo: item.shortInfo,
        startDate: item.startDate,
        lastDate: item.lastDate,
        eligibility: item.eligibility,
        totalPosts: item.totalPosts ? String(item.totalPosts) : undefined,
        status: item.status
      });

      const svgString = renderStandaloneMasterThumbnailSvg(spec);
      const pngBuffer = await sharp(Buffer.from(svgString))
        .png({ quality: 92, compressionLevel: 7 })
        .toBuffer();

      const outPath = path.join(outDir, `${item.id}.png`);
      fs.writeFileSync(outPath, pngBuffer);
      count++;
      if (count % 25 === 0 || count === SARKARI_DATA.length) {
        console.log(`Generated ${count}/${SARKARI_DATA.length} thumbnails...`);
      }
    } catch (err) {
      console.error(`Error generating for ${item.id}:`, err);
    }
  }

  // Also generate the master og-banner.png (1200 x 630)
  const defaultSpec = buildDeterministicThumbnailSpec({
    title: 'Official Recruitment Updates, Exam Forms & Admissions 2026',
    category: 'jobs',
    department: 'CSC DOST Digital Assistance Portal',
    eligibility: 'All Citizens',
    lastDate: 'Active Updates',
    status: 'Open'
  });
  const defaultSvg = renderStandaloneMasterThumbnailSvg(defaultSpec);
  const defaultPng = await sharp(Buffer.from(defaultSvg))
    .png({ quality: 94, compressionLevel: 7 })
    .toBuffer();

  fs.writeFileSync(path.join(process.cwd(), 'public', 'og-banner.png'), defaultPng);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'og-image.png'), defaultPng);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'og-banner.svg'), defaultSvg);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'og-image.svg'), defaultSvg);

  console.log('✅ Finished generating all post thumbnails and og-banner assets!');
}

main().catch(console.error);
