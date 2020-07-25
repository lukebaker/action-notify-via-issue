const github = require("@actions/github");
const core = require("@actions/core");

const fetchIds = `query fetchIds($owner: String!, $repo: String!, $login: String!) {
  user(login: $login) {
    id
  }
  repository(owner: $owner, name: $repo) {
    id
  }
}
`;

const findIssues = `query findIssues($owner: String!, $repo: String!, $mentioned: String!, $after: String = null) {
  repository(owner: $owner, name: $repo) {
    id
    issues(after: $after, first: 10, filterBy: {mentioned: $mentioned, createdBy: "github-actions[bot]"}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        id
        title
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`;

const createIssue = `mutation createIssue($repositoryId: ID!, $title: String!, $body: String = null, $assigneeIds: [ID!] = null) {
  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body, assigneeIds: $assigneeIds}) {
    issue {
      id
    }
  }
}
`;

const addComment = `mutation addCommentToIssue($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    clientMutationId
  }
}
`;

const closeIssue = `mutation closeIssue($id: ID!) {
  updateIssue(input: {id: $id, state:CLOSED}) {
    clientMutationId
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

    let ids = await octokit.graphql(fetchIds, { owner, repo, login: user });
    let issue = await findExistingIssue(octokit, {
      owner,
      repo,
      user,
      title,
    });
    if (!issue) {
      issue = await octokit.graphql(createIssue, {
        repositoryId: ids.repository.id,
        title,
        assigneeIds: [ids.user.id],
        body: "el cuerpo",
      });
      await octokit.graphql(closeIssue, { id: issue.id });
    }
    await octokit.graphql(addComment, {
      subjectId: issue.id,
      body: "Oh hi. This is a test comment.",
    });
  } catch (error) {
    core.setFailed(error);
  }
}

run();
