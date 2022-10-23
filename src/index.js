import "zx/globals";

import { Octokit } from "octokit";
import ProgressBar from "progress";
import fs from "fs";

export const fetchCommits = async ({ repo, login }) => {
	if (repo.size == 0) return [];
	const git_dir = `./.repos/${login}/${repo.name}.git`;

	await (fs.existsSync(git_dir) ? $`git --git-dir=${git_dir} fetch` : $`git clone --bare ${repo.clone_url} ${git_dir}`);

	const log = await $`git --git-dir=${git_dir} log --pretty=format:'%an%x09%ae%x09%ci%x09%s' --all --no-merges`;
	return log.stdout
		.split("\n")
		.map((line) => line.split("\t"))
		.map(([name, mail, date, commit]) => ({ repo: repo.name, name, mail, date, commit }));
};

export const getGitStats = async ({ token, recentRepositoriesCount, login, runAsync }) => {
	const client = new Octokit({ auth: token });

	const q = { username: login, per_page: recentRepositoriesCount, sort: "created", direction: "desc" };
	const repos = await client.rest.repos.listForUser(q);

	const commits = [];
	const total = repos.data.length;
	const progress = new ProgressBar("Fetching :percent [:bar]", { total });

	const pushCommits = async (repo) => {
		commits.push(...(await fetchCommits({ repo, login })));
		progress.tick();
	};

	if (runAsync) {
		await Promise.all(repos.data.map(pushCommits));
	} else {
		for (const repo of repos.data) await pushCommits(repo);
	}

	return commits;
};
