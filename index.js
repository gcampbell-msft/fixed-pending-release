const core = require("@actions/core");
const github = require("@actions/github");
const issueParser = require("issue-parser");
const parse = issueParser("github");
const { template } = require("lodash");

async function run() {
  try {
    const token = core.getInput("token");
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Get the message template from the user input
    const messageTemplate =
      core.getInput("message", { required: false }) ||
      ":tada: This PR is included in [${releaseTag}](${releaseUrl}) :tada:";

    const { data: release } = await octokit.rest.repos.getRelease({ owner, repo, release_id: "latest" });
    const { data: issuesList } = await octokit.rest.issues.listForRepo({
        repo,
        state: "open"
    });

    for (const issue of issuesList) {
        console.log(issue);
    }

    // Parse the release notes to extract the pull request numbers
    const prNumbers = [...new Set(parse(release.body).refs.map((ref) => ref.issue))];

    // Used to print out pull request urls
    const pullRequestUrls = [];
    let failedComments = 0;

    // Post a comment on each pull request
    for (const prNumberStr of prNumbers) {
      const prNumber = parseInt(prNumberStr);

      // let's be a bit more friendly to the GitHub API
      await new Promise((resolve) => setTimeout(resolve, 250));

      try {
        const { data: pullRequest } = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: prNumber,
        });
        const message = template(messageTemplate)({
          releaseName: release.name,
          releaseTag: release.tag_name,
          releaseUrl: release.html_url,
          pullRequestTitle: pullRequest.title,
          pullRequestUrl: pullRequest.html_url,
          pullRequestNumber: prNumber,
        });
        /*await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: message,
        }); */
        //pullRequestUrls.push(pullRequest.html_url);
      } catch (error) {
        console.error(`Failed to comment on #${prNumber}`, error);
        failedComments += 1;
      }
    }

    console.log("Commented on PRs included in release:");
    pullRequestUrls.forEach((url) => console.log(url));

    if (failedComments > 0) {
      core.setFailed(`Failed to comment on ${failedComments} PRs`);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
