#!/usr/bin/env node

import args from "args";
import { getGitStats } from "../src/index.js";
import fs from "fs";

// TODO: args validation
args
	.option("login", "Github login")
	.option("runAsync", "Run Git asynchronously", true)
	.option("verbose", "Verbose mode", false)
	.option("recentRepositoriesCount", "Number of recent repositories to fetch", 100)
	.option("token", "Github token", undefined)
	.option("out", "Output file");

const { login, runAsync, verbose, recentRepositoriesCount, token, out } = args.parse(process.argv);

if (!login || typeof login !== "string") {
	console.error("Login is required");
	process.exit(1);
}

$.verbose = verbose;

const outputFile = out || `./out/${login}.json`;

const stats = await getGitStats({ token, recentRepositoriesCount, login, runAsync });

if (!fs.existsSync("./out")) fs.mkdirSync("./out");
fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
console.info(`Stats saved to ${outputFile}`);
