#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const TARGETS = ['opencode', 'copilot'] as const;
type Target = (typeof TARGETS)[number];

interface ConvertOptions {
  skillsDir: string;
  distDir: string;
  targets: Target[];
}

/**
 * Reads skills/<name>/ and for each target produces:
 *   dist/{target}-skills/{name}/   (full skill directory copy)
 *
 * Files copied: SKILL.md + everything in references/, scripts/, agents/
 */
export async function convert(options: ConvertOptions): Promise<void> {
  const { skillsDir, distDir, targets } = options;

  // Clean and recreate dist/{target}-skills/ for each target
  for (const target of targets) {
    const targetDir = path.join(distDir, `${target}-skills`);
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Walk skills/ — each subdir with SKILL.md is a skill
  const skills = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) => fs.existsSync(path.join(skillsDir, d.name, 'SKILL.md')))
    .map((d) => d.name);

  let count = 0;
  for (const skill of skills) {
    const skillSrc = path.join(skillsDir, skill);

    for (const target of targets) {
      const dest = path.join(distDir, `${target}-skills`, skill);
      copyDir(skillSrc, dest);
    }
    count++;
  }

  console.log(`Built ${count} skills for targets: ${targets.join(', ')}`);
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// CLI
const args = process.argv.slice(2);
const targets = (args
  .find((a) => a.startsWith('--targets='))
  ?.split('=')[1]
  ?.split(',') ?? [...TARGETS]) as Target[];

convert({
  skillsDir: args.find((a) => a.startsWith('--skills='))?.split('=')[1] ?? './skills',
  distDir: args.find((a) => a.startsWith('--dist='))?.split('=')[1] ?? './dist',
  targets,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
