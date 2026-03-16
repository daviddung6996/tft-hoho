import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse } from 'dotenv';

type ServiceConfig = {
    name: string;
    command: string;
    args: string[];
    cwd: string;
    env?: NodeJS.ProcessEnv;
};

const repoRoot = process.cwd();
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const pythonCommand = process.env.TFT_DEV_PYTHON_CMD?.trim() || (isWindows ? 'python' : 'python3');
const services: ChildProcess[] = [];

function loadEnvFile(filePath: string): Record<string, string> {
    if (!existsSync(filePath)) {
        return {};
    }

    return parse(readFileSync(filePath, 'utf8'));
}

function prefixedLogger(serviceName: string, chunk: Buffer | string, writer: typeof process.stdout) {
    const lines = chunk
        .toString()
        .split(/\r?\n/)
        .filter((line) => line.length > 0);

    for (const line of lines) {
        writer.write(`[${serviceName}] ${line}\n`);
    }
}

function spawnService(config: ServiceConfig): ChildProcess {
    const command = isWindows && config.command.toLowerCase().endsWith('.cmd')
        ? 'cmd.exe'
        : config.command;
    const args = isWindows && config.command.toLowerCase().endsWith('.cmd')
        ? ['/d', '/s', '/c', config.command, ...config.args]
        : config.args;

    const child = spawn(command, args, {
        cwd: config.cwd,
        env: {
            ...process.env,
            ...(config.env ?? {}),
        },
        shell: false,
        stdio: ['inherit', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (chunk) => prefixedLogger(config.name, chunk, process.stdout));
    child.stderr?.on('data', (chunk) => prefixedLogger(config.name, chunk, process.stderr));
    child.on('exit', (code, signal) => {
        if (!shuttingDown) {
            const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`;
            process.stderr.write(`[${config.name}] exited with ${detail}\n`);
            shutdown(code ?? 1);
        }
    });
    child.on('error', (error) => {
        if (!shuttingDown) {
            process.stderr.write(`[${config.name}] failed to start: ${error.message}\n`);
            shutdown(1);
        }
    });

    services.push(child);
    return child;
}

async function waitForReady(url: string, serviceName: string, timeoutMs = 120000): Promise<void> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                process.stdout.write(`[${serviceName}] ready at ${url}\n`);
                return;
            }
        } catch {
            // Service is still starting.
        }

        await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
    }

    throw new Error(`${serviceName} did not become ready within ${Math.round(timeoutMs / 1000)}s`);
}

async function isReady(url: string): Promise<boolean> {
    try {
        const response = await fetch(url);
        return response.ok;
    } catch {
        return false;
    }
}

let shuttingDown = false;

function shutdown(exitCode = 0) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    for (const child of services) {
        if (!child.killed) {
            child.kill('SIGTERM');
        }
    }

    setTimeout(() => {
        for (const child of services) {
            if (!child.killed) {
                child.kill('SIGKILL');
            }
        }
        process.exit(exitCode);
    }, 1500).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
    const rootEnv = loadEnvFile(resolve(repoRoot, '.env'));
    const localEnv = loadEnvFile(resolve(repoRoot, '.env.local'));
    const bridgeEnv = loadEnvFile(resolve(repoRoot, 'services/notebooklm_bridge/.env'));
    const defaultStorageStatePath = join(homedir(), '.notebooklm', 'storage_state.json');
    const configuredStorageStatePath = process.env.NOTEBOOKLM_STORAGE_STATE_PATH
        || bridgeEnv.NOTEBOOKLM_STORAGE_STATE_PATH
        || defaultStorageStatePath;

    const bridgeProcessEnv: NodeJS.ProcessEnv = {
        ...bridgeEnv,
        NOTEBOOKLM_STORAGE_STATE_PATH: configuredStorageStatePath,
    };

    if (!existsSync(configuredStorageStatePath)) {
        throw new Error(`NotebookLM storage state not found at ${configuredStorageStatePath}`);
    }

    const bridgeReadyUrl = 'http://127.0.0.1:8080/live';
    if (await isReady(bridgeReadyUrl)) {
        process.stdout.write('[dev] reusing notebooklm bridge already running on 127.0.0.1:8080\n');
    } else {
        process.stdout.write('[dev] starting notebooklm bridge\n');
        spawnService({
            name: 'bridge',
            command: pythonCommand,
            args: ['app.py'],
            cwd: resolve(repoRoot, 'services/notebooklm_bridge'),
            env: bridgeProcessEnv,
        });
        await waitForReady(bridgeReadyUrl, 'bridge');
    }

    const adapterReadyUrl = 'http://127.0.0.1:54321/live';
    if (await isReady(adapterReadyUrl)) {
        process.stdout.write('[dev] reusing local visian-chat adapter already running on 127.0.0.1:54321\n');
    } else {
        process.stdout.write('[dev] starting local visian-chat adapter\n');
        spawnService({
            name: 'visian-chat',
            command: npmCommand,
            args: ['run', 'visian-chat:local'],
            cwd: repoRoot,
            env: {
                ...rootEnv,
                ...localEnv,
            },
        });
        await waitForReady(adapterReadyUrl, 'visian-chat');
    }

    process.stdout.write('[dev] starting vite frontend\n');
    spawnService({
        name: 'vite',
        command: npmCommand,
        args: ['run', 'dev:vite'],
        cwd: repoRoot,
        env: {
            ...rootEnv,
            ...localEnv,
        },
    });

    process.stdout.write('[dev] local stack ready. Press Ctrl+C to stop all services.\n');
}

void main().catch((error) => {
    process.stderr.write(`[dev] ${error instanceof Error ? error.message : String(error)}\n`);
    shutdown(1);
});
