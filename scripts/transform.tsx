import { transformSolidSource } from "../node_modules/@opentui/solid/scripts/solid-transform.js"
import path from "path"
import { fileURLToPath } from "url"
import { rm, mkdir, copyFile } from "fs/promises"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const entry = path.join(root, "src", "index.tsx")
const buildDir = path.join(root, ".build")

await rm(buildDir, { recursive: true, force: true })
await mkdir(buildDir, { recursive: true })

const src = await Bun.file(entry).text()
const out = await transformSolidSource(src, {
  filename: entry,
  moduleName: "@opentui/solid",
})

await Bun.write(path.join(buildDir, "index.js"), out)
await copyFile(path.join(root, "src", "format.ts"), path.join(buildDir, "format.ts"))
await copyFile(path.join(root, "src", "options.ts"), path.join(buildDir, "options.ts"))
console.log("solid transform written:", buildDir)
