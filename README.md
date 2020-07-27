# Notify via issue comment

<p align="center">
  <a href="https://github.com/lukebaker/action-notify-via-issue/actions"><img alt="javscript-action status" src="https://github.com/lukebaker/action-notify-via-issue/workflows/units-test/badge.svg"></a>
</p>

This GitHub Action will trigger notifications by creating or commenting on an
issue. By default, the action will create a new issue the first time it needs
to notify a particular user. It will immediately close this issue so that it
doesn't clutter the issues view. For subsequent notifications for that same
user, this action will create a new comment on the existing issue.

## Basic usage

```yaml
- uses: lukebaker/action-notify-via-issue@v1
  if: ${{ failure() }}
```

This will create an issue comment whenever the job fails. The comment / issue
will @ mention the user whose interaction triggered the GitHub workflow to
run.

## Usage

```yaml
- uses: lukebaker/action-notify-via-issue@v1
  if: ${{ always() }}
  with:
    # Repository name with owner. For example, lukebaker/action-notify-via-issue
    # Lodash template: no
    # Default: ${{ github.repository }}
    repository: ""

    # The GitHub authentication token.
    # Lodash template: no
    # Default: ${{ github.token }}
    token: ""

    # The GitHub username to notify.
    # Lodash template: no
    # Default: ${{ github.actor }}
    user: ""

    # Notification will be skipped when this evaluates to "true"
    # Lodash template: yes
    # Default: "false"
    skip_when: "false"

    # The title used for the GitHub issue. Used to find existing issue to add
    # subsequent comments to.
    # Lodash template: yes
    # Default: "${{ github.workflow }} notifications for ${{ github.actor }}"
    title: ""

    # Introduction body used when creating a new issue.
    # Lodash template: yes
    # Default: see `action.yml`
    intro_body: ""

    # Comment body used for notification.
    # Lodash template: yes
    # Default: see `action.yml`
    comment_body: ""
```

### Lodash template

Above, some values indicate "Lodash template: yes". These values are passsed
through [Lodash `template()`](https://lodash.com/docs/4.17.15#template). This
gives a lot of flexibility to customize these values as they have the full
power of JavaScript. Additionally, the following context is passed to these
templates:

- [github](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#github-context)
- [job](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#job-context)
- [runner](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#runner-context)
- [matrix](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#contexts)

Some examples can be found in the defaults specified in
[action.yml](action.yml).

**Note:** GitHub provides some variable replacement with things like `${{ github.repository }}` inside the workflow definition. These will be completed _before_ the Lodash template is executed.

## Todo

- [ ] Allow multiple users and pass through `template()`
- [ ] Allow "ALL" users to notify all mentionable users
- [ ] Include duration of job like [action-slack](https://github.com/8398a7/action-slack/blob/932385ec78c1a25cdbbdc3c2a9fc4d91f8534aed/src/fields.ts#L94-L100)
- [ ] Include link to specific job that failed, using same API call above to get job id

## Development

- Install dependencies:
  ```
  yarn install
  ```
- Make changes
- Run lint, tests, build:
  ```
  yarn all
  ```
- Commit and push changes
