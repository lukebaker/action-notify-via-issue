const queries = require("./queries");
const github = require("@actions/github");
const core = require("@actions/core");
const template = require("lodash/template");

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
    const intro_body = core.getInput("intro_body");
    const comment_body = core.getInput("comment_body");

    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.split("/");

    const templateContext = { user, context: github.context, title };

    let issue = await findExistingIssue(octokit, {
      owner,
      repo,
      user,
      title,
    });
    if (!issue) {
      let { createIssue } = await octokit.graphql(queries.createIssue, {
        repositoryId: github.context.payload.repository.node_id,
        title,
        body:
          template(intro_body)(templateContext) +
          "\n---\n" +
          template(comment_body)(templateContext),
      });
      issue = createIssue.issue;
      core.info(`Created issue: ${issue.url}`);
      await octokit.graphql(queries.closeIssue, { id: issue.id });
    } else {
      let { addComment } = await octokit.graphql(queries.addComment, {
        subjectId: issue.id,
        body: template(comment_body)(templateContext),
      });
      core.info(`Added comment: ${addComment.commentEdge.node.url}`);
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();
