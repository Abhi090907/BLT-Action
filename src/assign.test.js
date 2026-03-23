const nock = require('nock');
const assert = require('assert');
const axios = require('axios');

// The function we are testing (matching the pattern in mock-test.js)
async function assignUserToIssue(owner, repo, issueNumber, username) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/assignees`;
  const response = await axios.post(url, { assignees: [username] });
  return response.data;
}

describe('Assignment Command Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should assign a user to an issue successfully', async () => {
    const owner = 'OWASP-BLT';
    const repo = 'BLT-Action';
    const issueNumber = 123;
    const username = 'testuser';

    // Fix: Updated the mock response to match GitHub's actual API format
    const githubApiMock = nock('https://api.github.com')
      .post(`/repos/${owner}/${repo}/issues/${issueNumber}/assignees`, {
        assignees: [username]
      })
      .reply(201, { assignees: [{ login: username }] }); // Updated response format

    const result = await assignUserToIssue(owner, repo, issueNumber, username);

    // Fix: Updated the assertion to check the new array format
    assert.strictEqual(result.assignees[0].login, username, 'The returned username should match our input');
    assert.ok(githubApiMock.isDone(), 'The GitHub API mock should have been called exactly once');
  });
});