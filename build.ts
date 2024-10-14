import dto from "bun-plugin-dts";

await Bun.build({
	entrypoints: ["index.ts"],
	outdir: "dist",
	plugins: [dto()],
});
