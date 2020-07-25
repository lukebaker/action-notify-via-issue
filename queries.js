const queries = {
  fetchIds: `query fetchIds($owner: String!, $repo: String!, $login: String!) {
  user(login: $login) {
    id
  }
  repository(owner: $owner, name: $repo) {
    id
  }
}
`,

  findIssues: `query findIssues($owner: String!, $repo: String!, $mentioned: String!, $after: String = null) {
  repository(owner: $owner, name: $repo) {
    id
    issues(after: $after, first: 10, filterBy: {mentioned: $mentioned, createdBy: "github-actions[bot]"}, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        id
        title
        url
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
`,

  createIssue: `mutation createIssue($repositoryId: ID!, $title: String!, $body: String = null, $assigneeIds: [ID!] = null) {
  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body, assigneeIds: $assigneeIds}) {
    issue {
      id
      title
      url
    }
  }
}
`,

  addComment: `mutation addCommentToIssue($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    commentEdge {
      node {
        url
      }
    }
  }
}
`,

  closeIssue: `mutation closeIssue($id: ID!) {
  updateIssue(input: {id: $id, state:CLOSED}) {
    clientMutationId
  }
}
`,
};

module.exports = queries;
