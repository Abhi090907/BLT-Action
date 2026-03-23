const nock = require('nock');
const assert = require('assert');
const axios = require('axios');

// The function we are testing (imported or defined here for testing purposes)
async function assignUserToIssue(owner, repo, issueNumber, username) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/assignees`;
  const response = await axios.post(url, { assignees: [username] });
  return response.data;
}

describe('Assignment Command Tests', () => {
  // Clean up any lingering API mocks before each test runs
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should assign a user to an issue successfully', async () => {
    // 1. Set up our fake data
    const owner = 'OWASP-BLT';
    const repo = 'BLT-Action';
    const issueNumber = 123;
    const username = 'testuser';

    // 2. Mock the GitHub API using Nock
    // This intercepts the HTTP request so it doesn't actually hit the real GitHub server
    const githubApiMock = nock('https://api.github.com')
      .post(`/repos/${owner}/${repo}/issues/${issueNumber}/assignees`, {
        assignees: [username]
      })
      .reply(201, { login: username, assigned: true }); // Fake successful response

    // 3. Call the function we want to test
    const result = await assignUserToIssue(owner, repo, issueNumber, username);

    // 4. Verify the results using Assert
    assert.strictEqual(result.login, username, 'The returned username should match our input');
    assert.ok(githubApiMock.isDone(), 'The GitHub API mock should have been called exactly once');
  });
});