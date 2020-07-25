const github = require("@actions/github");
const core = require("@actions/core");

const findIssues = `query findIssues($owner: String!, $repo: String!, $mentioned: String!, $after: String = null) {
  repository(owner: $owner, name: $repo) {
    issues(after: $after, first: 10, filterBy: {mentioned: $mentioned, createdBy: "github-actions[bot]"}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        title
        number
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`;

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput("token");
    const repository = core.getInput("repository");
    const user = core.getInput("user");

    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.split("/");
    let issues = await octokit.graphql(findIssues, {
      owner,
      repo,
      mentioned: user,
    });
    core.info(JSON.stringify(issues));

    /*
    const newIssue = await octokit.issues.create({
      owner,
      repo,
      assignee: user,
      title: `New issue for ${user}!`,
      body: `Here's the body. @${user}`,
    });

    await octokit.issues.update({
      owner,
      repo,
      issue_number: newIssue.data.number,
      state: "closed",
    });
    */
  } catch (error) {
    core.setFailed(error);
  }
}

run();
