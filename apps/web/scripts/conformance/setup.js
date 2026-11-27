import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('./.venv', import.meta.url));
for (const [command, args] of [
  ['python3', ['-m', 'venv', directory]],
  [
    `${directory}/bin/python`,
    [
      '-m',
      'pip',
      'install',
      '--disable-pip-version-check',
      '-r',
      fileURLToPath(new URL('./requirements.txt', import.meta.url)),
    ],
  ],
]) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || 'Conformance environment setup failed');
    process.exit(1);
  }
}
