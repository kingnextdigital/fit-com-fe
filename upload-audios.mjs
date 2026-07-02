/**
 * Script de upload para o Supabase Storage
 * Executa com: node upload-audios.mjs
 *
 * Antes de rodar:
 *   1. Coloque os MP3s em uma pasta local (AUDIO_FOLDER abaixo)
 *   2. Troque SERVICE_ROLE_KEY pela sua chave do Supabase (Settings > API)
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';

// ─── CONFIGURE AQUI ────────────────────────────────────────────────────────
const SUPABASE_URL     = 'https://vvwfacaebnxlcapyfakr.supabase.co';
const SERVICE_ROLE_KEY = 'COLE_AQUI_A_SERVICE_ROLE_KEY';
const AUDIO_FOLDER     = 'C:/Users/loamy/Downloads/AudiosSalmos'; // pasta com os MP3s
const BUCKET           = 'audios';
// ───────────────────────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const files = (await readdir(AUDIO_FOLDER))
    .filter(f => extname(f).toLowerCase() === '.mp3');

  console.log(`\n📦 ${files.length} arquivos encontrados em ${AUDIO_FOLDER}\n`);

  let ok = 0;
  let fail = 0;

  for (const filename of files) {
    const filePath = join(AUDIO_FOLDER, filename);
    const buffer   = await readFile(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      console.error(`  ✗ ${filename} — ${error.message}`);
      fail++;
    } else {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      console.log(`  ✓ ${filename}`);
      ok++;
    }
  }

  console.log(`\n✅ Upload concluído: ${ok} OK, ${fail} falhas`);
  console.log(`\nURL base das suas músicas:`);
  console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/NOME_DO_ARQUIVO.mp3\n`);
}

main().catch(console.error);
