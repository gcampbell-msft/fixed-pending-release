# A GitHub Action that closes issues marked 'fixed-pending-release' upon a new release

This GitHub Action adds a comment to all pull requests that were included in a GitHub release. The comment includes a link to the release, along with a celebratory emoji :tada:

## Usage

To use this action, you will need to provide your [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `public_repo` permission.

```yaml
name: Close issues marked 'fixed-pending-release' upon a release.
on:
  release:
    types: [published]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - name: Close issues marked 'fixed-pending-release' upon a release.
        uses: gcampbell/fixed-pending-release/@x.x.x
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          message: ":tada: This issue has now been fixed and is now available in the latest release! :tada:"
```

Note that this action is triggered by the `release.published` event, which occurs when a new release is published in your repository.

## Assumptions

There are a couple of assumptions that this GitHub Actions makes.

1. The only releases that you want to use for this action, to close issues based on, are official releases.
1. You use `fixed-pending-release` to label issues that are fixed pending an official release.
1. The most recent release that you published is the release that fixes all issues marked `fixed-pending-release`.
    1. This assumption is not made when `isExternalRelease` is `"true"`

## Inputs

This action has the following inputs:

- `token` (required): Your GitHub access token. You can use `${{ secrets.ACCESS_TOKEN }}` to access the value you set as actions repository secret.
- `message` (optional): The message to be included in the comment. This is passed to the action as a lodash template string.
  Available variables, when `isExternalRelease` is `true` include: `releaseName`, `releaseTag`, `releaseUrl`.
- `isExternalRelease` (optional): Boolean indicating whether the release is external to GitHub. If it is, no GitHub release will be used and thus the above variables aren't available.

## Example

Here's an example of what the comment looks like:

:tada: This issue has now been fixed! The fix is is included in [vx.x.x](https://github.com/owner/repo/releases/tag/vx.x.x) :tada:

## License

This GitHub Action is licensed under the [MIT License](LICENSE).
