# A GitHub Action that closes issues marked as fixed upon a new release

This GitHub Action closes issues that were marked as fixed upon a new GitHub release :tada:

## Usage

To use this action, you will need to provide your [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with `public_repo` permission.

```yaml
name: Close issues marked as fixed upon a release.
on:
  release:
    types: [published]

jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - name: Close issues marked as fixed upon a release.
        uses: gcampbell/fixed-pending-release/@x.x.x
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          label: fixed-pending-release
          message: ":tada: This issue has now been fixed and is now available in the latest release! :tada:"
```

Note that this action is triggered by the `release.published` event, which occurs when a new release is published in your repository.
Additionally, if there are cases where you want to use this manually, you should use `workflow_dispatch` and you should likely set `isExternalLaunch` to `"true"`.

## Assumptions

There are a couple of assumptions that this GitHub Actions makes.

1. The most recent release that you published (pre-release or official) is the release that fixes all issues marked as fixed upon a new release.
    1. This assumption is not made when `isExternalRelease` is `"true"`.

## Inputs

This action has the following inputs:

- `token` (optional): Your GitHub access token. You can use `${{ secrets.ACCESS_TOKEN }}` to access the value you set as actions repository secret. Default value will be `${{ github.token }}`.
- `label` (option): The label that specifies issues that should be closed upon release.
- `removeLabel` (optional): Boolean, whether to remove the label after closing the issue.
- `applyToAll` (optional): Boolean, whether to apply to all issues. If false, only check open issues. Default value is false.
- `message` (optional): The message to be included in the comment. This is passed to the action as a lodash template string.
  Available variables, when `isExternalRelease` is `true`, include: `releaseName`, `releaseTag`, `releaseUrl`.
- `isExternalRelease` (optional): Boolean indicating whether the release is external to GitHub. If it is, no GitHub release will be used and thus the above variables aren't available.

## License

This GitHub Action is licensed under the [MIT License](LICENSE).
