import { spawn, SpawnOptions } from 'child_process';

/**
 * Spawn a child process to run the specified command.
 * Outputs logs to inherited stdio by default.
 */
/* istanbul ignore next */
export const run = (command: string, options?: SpawnOptions) => {
    const parts = command.split(' ');
    const spawnOptions: SpawnOptions = { shell: true, stdio: 'inherit', windowsHide: true, ...options };
    const child = spawn(parts[0], parts.slice(1), spawnOptions);

    return new Promise<void>((resolve, reject) => {
        child.on('error', (err) => {
            reject(err);
        });

        child.on('exit', (code) => {
            // Explicitly check for 0 as code can also be null (if the process was killed, etc.)
            if (code !== 0) {
                reject(new Error('NoExitCodeZero'));
            } else {
                resolve();
            }
        });
    });
};
