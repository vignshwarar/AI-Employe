import * as esbuild from "esbuild";
import * as fs from "fs";
import { file, write } from "bun";

const entrypoints = [
  "src/worker.ts",
  "src/recorder.ts",
  "src/ui.tsx",
  "src/run.tsx",
];

const commonBuildOptions = {
  entryPoints: entrypoints,
  bundle: true,
  outdir: "./build",
  format: "esm",
  target: "es2017",
  sourcemap: true,
  define: {
    "process.env.BACKEND_URL": JSON.stringify(process.env.BACKEND_URL),
    "process.env.FRONTEND_URL": JSON.stringify(process.env.FRONTEND_URL),
    "process.env.NEXT_PUBLIC_API_KEY": JSON.stringify(
      process.env.NEXT_PUBLIC_API_KEY
    ),
    "process.env.NEXT_PUBLIC_AUTH_DOMAIN": JSON.stringify(
      process.env.NEXT_PUBLIC_AUTH_DOMAIN
    ),
    "process.env.NEXT_PUBLIC_PROJECT_ID": JSON.stringify(
      process.env.NEXT_PUBLIC_PROJECT_ID
    ),
    "process.env.NEXT_PUBLIC_STORAGE_BUCKET": JSON.stringify(
      process.env.NEXT_PUBLIC_STORAGE_BUCKET
    ),
    "process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID": JSON.stringify(
      process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID
    ),
    "process.env.NEXT_PUBLIC_APP_ID": JSON.stringify(
      process.env.NEXT_PUBLIC_APP_ID
    ),
    "process.env.DEPLOYMENT_TYPE": JSON.stringify(process.env.DEPLOYMENT_TYPE),
  },
};

const copyAssets = async () => {
  const assets = ["manifest.json", "ui.html"];
  fs.mkdirSync("build", { recursive: true });
  await Promise.all(
    assets.map((asset) => write(`build/${asset}`, file(`./src/${asset}`)))
  );

  fs.mkdirSync("build/icons", { recursive: true });
  await Promise.all(
    fs
      .readdirSync("./src/icons")
      .map((icon) => write(`build/icons/${icon}`, file(`./src/icons/${icon}`)))
  );
};

async function build(isDev: boolean) {
  const buildOptions = isDev
    ? { ...commonBuildOptions }
    : { ...commonBuildOptions, minify: true };

  if (isDev) {
    const ctx = await esbuild.context(buildOptions as esbuild.BuildOptions);
    await ctx.watch();
  } else {
    await esbuild.build(buildOptions as esbuild.BuildOptions);
  }

  await copyAssets();
}

const isDev = process.env.ENV === "development";
build(isDev).then(() =>
  console.log(`${isDev ? "Development build done." : "Production build done."}`)
);
