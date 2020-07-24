const github = require("@actions/github");
const core = require("@actions/core");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput("token");
    const repository = core.getInput("repository");
    const user = core.getInput("user");

    const octokit = github.getOctokit(token);
    const [owner, repo] = repository.split("/");

    const newIssue = await octokit.issues.create({
      owner,
      repo,
      assignee: user,
      title: `New issue for ${user}!`,
      body: `Here's the body. @${user}`,
    });
    core.info(JSON.stringify(newIssue.data));
    core.info(JSON.stringify(newIssue));

    await octokit.issues.update({
      owner,
      repo,
      issue_number: newIssue.data.id,
      state: "closed",
    });
  } catch (error) {
    core.error(error);
    core.setFailed(error);
  }
}

run();
