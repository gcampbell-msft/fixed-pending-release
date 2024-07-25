const core = require("@actions/core");
const github = require("@actions/github");
const { template } = require("lodash");

async function run() {
  try {
    let token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Get workflow inputs
    const label = core.getInput("label", { required: false }) || "fixed-pending-release";
    const providedMessage = core.getInput("message", { required: false });
    const isExternalRelease = !!core.getInput("isExternalRelease", { required: false }) || false;

    // Prepare message release message
    const externalReleaseDefault = ":tada: This issue has now been fixed and is available in the latest release! :tada:";
    const nonExternalReleaseDefault = ":tada: This issue has now been fixed and is available in [${releaseTag}](${releaseUrl}) :tada:";
    let message = "";

    // Check if this is a GitHub internal release
    if (!isExternalRelease) {
        // if it isn't an external release, we should have access to the release and we can 
        // template with the most recent release.

        // TODO: Possibly modify to strictly consider official releases.
        const { data: releases } = await octokit.rest.repos.listReleases({ owner, repo });
        const release = releases.length > 0 ? releases[0] : undefined;

        if (release === undefined) {
            throw new Error("There is no release available");
        }

        message = template(providedMessage || nonExternalReleaseDefault)({
            releaseName: release.name,
            releaseTag: release.tag_name,
            releaseUrl: release.html_url
        });
    } else {
        // in an external release, we simply pass the message
        message = providedMessage || externalReleaseDefault;
    }

    // Get list of issues
    const issuesPendingRelease = (await octokit.paginate(octokit.rest.issues.listForRepo, {
        owner,
        repo,
        state: "open",
        per_page: 100
    })).filter(i => i.pull_request === undefined && i.labels.map(l => l.name).includes(label));
    
    const issuesClosed = [];
    let failedIssues = 0;

    // Iterate over issues to comment and close them
    for (const issue of issuesPendingRelease) {
        const number = issue.number;

        // slow down how often we send requests if there are lots of issues.
        await new Promise((resolve) => setTimeout(resolve, 250));

        try {
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
