const core = require("@actions/core");
const github = require("@actions/github");
const { template } = require("lodash");

async function run() {
  try {
    let token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // TODO: Possibly modify to strictly consider official releases.
    const { data: releases } = await octokit.rest.repos.listReleases({ owner, repo });
    const release = releases.length > 0 ? releases[0] : undefined;

    if (release === undefined) {
        throw new Error("There is no release available");
    }

    const issuesPendingRelease = (await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "open"
    })).data.filter(i => i.labels.map(l => l.name).includes("fixed-pending-release"));

    // Get the message template from the user input
    const messageTemplate =
      core.getInput("message", { required: false }) ||
      ":tada: This issue has now been fixed! The fix is included in [${releaseTag}](${releaseUrl})! :tada:";

    const issuesClosed = [];
    let failedIssues = 0;

    for (const issue of issuesPendingRelease) {
        const number = issue.number;

        // slow down how often we send requests if there are lots of issues.
        await new Promise((resolve) => setTimeout(resolve, 250));

        try {
            const message = template(messageTemplate)({
                releaseName: release.name,
                releaseTag: release.tag_name,
                releaseUrl: release.html_url
            });

            // Comment on the issue that we will close.
            await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: number,
                body: message
            });

            // Close the issue.
            await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: number,
                state: "closed"
            });
        } catch (error) {
            console.error(`Failed to comment on and/or close issue #${number}`, error);
            failedIssues++;
        }

        console.log(`Closed #${number}`);
        issuesClosed.push(issue);
    }

    if (failedIssues > 0) {
      core.setFailed(`Failed to comment on ${failedIssues} PRs`);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
