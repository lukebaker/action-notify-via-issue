const queries = require("./queries");
const github = require("@actions/github");
const core = require("@actions/core");

async function findExistingIssue(octokit, { owner, repo, user, title }) {
  let issue = null;
  let hasNextPage = true;
  let after = null;
  while (!issue && hasNextPage) {
    let findIssuesResp = await octokit.graphql(queries.findIssues, {
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

    let ids = await octokit.graphql(queries.fetchIds, {
      owner,
      repo,
      login: user,
    });
    let issue = await findExistingIssue(octokit, {
      owner,
      repo,
      user,
      title,
    });
    if (!issue) {
      let { createIssue } = await octokit.graphql(queries.createIssue, {
        repositoryId: ids.repository.id,
        title,
        assigneeIds: [ids.user.id],
        body: "el cuerpo",
      });
      issue = createIssue.issue;
      core.info(`Created issue: ${issue.url}`);
      await octokit.graphql(queries.closeIssue, { id: issue.id });
    }
    let { addComment } = await octokit.graphql(queries.addComment, {
      subjectId: issue.id,
      body: "This is a test comment. :mexico:",
    });
    core.info(`Added comment: ${addComment.commentEdge.node.url}`);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
