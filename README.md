# 

This GitHub Action adds a comment to all pull requests that were included in a GitHub release. The comment includes a link to the release, along with a celebratory emoji :tada:

## Usage

To use this action, you will need to provide your [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `public_repo` permission.

```yaml
name: Comment on Pull Requests included in Release
on:
  release:
    types: [published]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - name: Comment on Pull Requests
        uses: gcampbell/fixed-pending-release TODO
        with:
          token: ${{ secrets.ACCESS_TOKEN }}
          message: ":tada: This PR is included in [${releaseTag}](${releaseUrl}) :tada:"
```

Note that this action is triggered by the `release.published` event, which occurs when a new release is published in your repository.

## Inputs

This action has the following inputs:

- `token` (required): Your GitHub access token. You can use `${{ secrets.ACCESS_TOKEN }}` to access the value you set as actions repository secret.
- `message` (optional): The message to be included in the comment. This is passed to the action as a lodash template string.
  Available variables include: `releaseName`, `releaseTag`, `releaseUrl`, TODO: Remove the following items `pullRequestTitle`, `pullRequestUrl` and `pullRequestNumber`.

## Outputs

This action does not have any outputs.

## Example

Here's an example of what the comment looks like:

:tada: This PR is included in [v1.0.0](https://github.com/owner/repo/releases/tag/v1.0.0) :tada:

## License

This GitHub Action is licensed under the [MIT License](LICENSE).
