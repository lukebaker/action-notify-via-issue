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

async function findExistingIssue(octokit, { owner, repo, user, title }) {
  let issue = null;
  let hasNextPage = true;
  let after = null;
  while (!issue && hasNextPage) {
    let findIssuesResp = await octokit.graphql(findIssues, {
      owner,
      repo,
      after,
      mentioned: user,
    });
    hasNextPage = findIssuesResp.repository.issues.pageInfo.hasNextPage;
    after = findIssuesResp.repository.issues.pageInfo.endCursor;
    issue = findIssuesResp.repository.issues.nodes.find(
      (i) => i.title === title
    );
  }
  return issue;
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput("token");
    const repository = core.getInput("repository");
    const user = core.getInput("user");
    const title = core.getInput("title");

    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.split("/");

    const existingIssue = await findExistingIssue(octokit, {
      owner,
      repo,
      user,
      title,
    });
    if (existingIssue) {
      core.info(JSON.stringify(existingIssue));
    } else {
      const newIssue = await octokit.issues.create({
        owner,
        repo,
        assignee: user,
        title,
        body: `Here's the body. @${user}`,
      });

      await octokit.issues.update({
        owner,
        repo,
        issue_number: newIssue.data.number,
        state: "closed",
      });
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();
