import Docker from "dockerode";
import tar from "tar-stream";

const docker = new Docker();

async function ensureImage(image: string) {
    try {
        await docker.getImage(image).inspect();
        console.log(`Image already exists: ${image}`);
    } catch {
        console.log(`Pulling image: ${image}...`);

        await new Promise((resolve, reject) => {
            docker.pull(image, (err: any, stream: any) => {
                if (err) return reject(err);

                docker.modem.followProgress(
                    stream,
                    (err2) => {
                        if (err2) reject(err2);
                        else resolve(true);
                    }
                );
            });
        });

        console.log(`Image pulled successfully: ${image}`);
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

    // Ensure image exists
    await ensureImage(config.image);

    // Build shell command
    const commandParts = [
        "mkdir -p /app",
        config.compile,
        `echo "$INPUT" | ${config.run}`,
    ].filter(Boolean);

    const shellCommand = commandParts.join(" && ");

    // Create container
    const container = await docker.createContainer({
        Image: config.image,

        Cmd: ["sh", "-c", shellCommand],

        Env: [`INPUT=${input}`],

        WorkingDir: "/app",

        Tty: false,

        AttachStdout: true,
        AttachStderr: true,

        HostConfig: {
            AutoRemove: true,

            Memory: 256 * 1024 * 1024,

            NanoCpus: 1_000_000_000, // 1 CPU

            NetworkMode: "none",

            ReadonlyRootfs: false,

            PidsLimit: 64,
        },
    });

    // Create tar archive
    const pack = tar.pack();

    pack.entry(
        {
            name: config.filename,
        },
        code
    );

    pack.finalize();

    // Copy source file into container
    await container.putArchive(pack, {
        path: "/app",
    });

    // Start container
    await container.start();

    // Wait until container exits
    await container.wait();

    // Fetch logs
    const logStream = await container.logs({
        stdout: true,
        stderr: true,
        follow: false,
    });

    return logStream.toString("utf-8");
}

// Example usage
// (async () => {
//     const code = `
// #include <iostream>
// using namespace std;

// int main() {
//     int n;
//     cin >> n;

//     cout << n * 10;

//     return 0;
// }
// `;

//     const input = `5`;

//     try {
//         const result = await runCpp(code, input);

//         console.log("Program Output:");
//         console.log(result);
//     } catch (err) {
//         console.error("Error:", err);
//     }
// })();