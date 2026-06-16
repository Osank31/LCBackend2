import Docker from "dockerode";
import tar from "tar-stream";
import logger from "./logger.config.js";

const docker = new Docker();

async function ensureImage(image: string) {
    try {
        await docker.getImage(image).inspect();
        logger.info(`Image already exists: ${image}`);
    } catch {
        logger.info(`Pulling image: ${image}...`);

        await new Promise((resolve, reject) => {
            docker.pull(image, (err: any, stream: any) => {
                if (err) return reject(err);

                docker.modem.followProgress(
                    stream,
                    (err2: any) => {
                        if (err2) reject(err2);
                        else resolve(true);
                    }
                );
            });
        });

        logger.info(`Image pulled successfully: ${image}`);
    }
}

type Language = "cpp" | "python" | "java";

const languageConfig: Record<
    Language,
    {
        image: string;
        filename: string;
        compile?: string;
        run: string;
    }
> = {
    cpp: {
        image: "gcc:latest",
        filename: "main.cpp",
        compile: "g++ /app/main.cpp -o /app/main",
        run: "/app/main",
    },

    python: {
        image: "python:3.12-alpine",
        filename: "main.py",
        run: "python /app/main.py",
    },

    java: {
        image: "openjdk:21",
        filename: "Main.java",
        compile: "javac /app/Main.java",
        run: "java -cp /app Main",
    },
};

export async function runCode(
    language: Language,
    code: string,
    input: string
) {
    const config = languageConfig[language];

    if (!config) {
        throw new Error("Unsupported language");
    }

    await ensureImage(config.image);

    const shellCommand = [
        "mkdir -p /app",
        config.compile,
        `echo "$INPUT" | ${config.run}`,
    ]
        .filter(Boolean)
        .join(" && ");

    const container = await docker.createContainer({
        Image: config.image,

        Cmd: ["sh", "-c", shellCommand],

        Env: [`INPUT=${input}`],

        WorkingDir: "/app",

        Tty: false,

        AttachStdout: true,
        AttachStderr: true,

        HostConfig: {
            AutoRemove: false, 

            Memory: 256 * 1024 * 1024,
            NanoCpus: 1_000_000_000,
            NetworkMode: "none",
            ReadonlyRootfs: false,
            PidsLimit: 64,
        },
    });

    // Copy code into container
    const pack = tar.pack();

    pack.entry({ name: config.filename }, code);
    pack.finalize();

    await container.putArchive(pack, { path: "/app" });

    try {
        await container.start();
        await container.wait();

        const logBuffer = await container.logs({
            stdout: true,
            stderr: true,
            follow: false,
        });

        const output = Buffer.isBuffer(logBuffer)
            ? logBuffer.toString("utf-8")
            : String(logBuffer);
        return output.replace(/[\u0000-\u001F\u007F]/g, "").trim();

    } finally {
        try {
            await container.remove({ force: true });
        } catch (err) {
            console.error("Container cleanup failed:", err);
        }
    }
}