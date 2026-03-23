# BLT-Action

BLT-Action is a GitHub Action designed to streamline issue and pull request management in GitHub repositories. It automates contributor assignment, tracks progress, rewards engagement, and maintains an organized workflow through comment-triggered commands, scheduled intervals, and manual triggers.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Installation](#installation)
- [Usage](#usage)
- [Implementation Details](#implementation-details)
- [Contributing](#contributing)

---

## Features

### Assignment Management

- **Self-Assignment**: Contributors can assign themselves to issues using natural language commands such as `/assign`, `assign to me`, `work on this`, or `i am interested in contributing`
- **Manual Unassignment**: Contributors can release an issue by commenting `/unassign`
- **Assignment Validation**: Prevents contributors from holding multiple issues simultaneously without an active pull request
- **Smart PR Tracking**: Automatically checks for linked pull requests before unassigning contributors
- **Bot Protection**: Filters out bot accounts and GitHub Apps from triggering assignment commands

### Automated Workflow Management

- **Time-Based Unassignment**: Automatically releases issues after 24 hours of inactivity if no pull request is linked
- **Smart Pull Request Detection**: Identifies cross-referenced open pull requests in issue timelines to prevent premature unassignment
- **Duplicate Prevention**: Avoids creating duplicate unassignment notifications
- **Scheduled Execution**: Runs daily via cron to check for stale assignments
- **Manual Triggers**: Supports `workflow_dispatch` for on-demand execution

### Engagement Features

- **GIF Integration**: Post GIFs using `/giphy [search term]` powered by the Giphy API
- **Kudos System**: Recognize contributors using `/kudos @username [message]` — integrates with the OWASP BLT platform to track acknowledgements
- **Tip System**: Support contributors using `/tip @username $amount` — generates a direct GitHub Sponsors link for one-time payments

---

## How It Works

BLT-Action operates through three trigger mechanisms:

**Comment-Triggered Actions**
When a contributor comments a recognized command on an issue, the action processes it immediately. Assignment commands are restricted to issues only and do not apply to pull requests.

**Scheduled Monitoring**
A daily cron job checks all assigned issues for inactivity. Issues assigned for more than 24 hours without a linked pull request are automatically unassigned and made available to other contributors.

**Smart Assignment Logic**
The action prevents contributors from holding multiple issues without active pull requests, blocks duplicate assignments, and manages an `assigned` label automatically to reflect current issue status.

---

## Getting Started

### Prerequisites

- A GitHub account
- A GitHub repository where you have administrative access

---

## Configuration

### Required Inputs

| Parameter | Description |
|-----------|-------------|
| `repo-token` | GitHub token for authentication — use `${{ secrets.GITHUB_TOKEN }}` |
| `repository` | Repository identifier — use `${{ github.repository }}` |
| `giphy-api-key` | API key for Giphy integration — required only for the `/giphy` command |

### Setting Up the Giphy API Key

1. Obtain a free API key from [Giphy Developers](https://developers.giphy.com/)
2. Add it as a repository secret named `GIPHY_API_KEY`
3. Reference it in your workflow file as shown in the installation section below

---

## Installation

Navigate to your repository and create the following workflow file at `.github/workflows/blt-action.yml`:
```yml
name: Auto Assign Issues

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  auto-assign:
    if: >
      (github.event_name == 'issue_comment' && (
      contains(github.event.comment.body, '/assign') || 
      startsWith(github.event.comment.body, '/unassign') || 
      startsWith(github.event.comment.body, '/giphy') || 
      startsWith(github.event.comment.body, '/kudos') || 
      startsWith(github.event.comment.body, '/tip') || 
      contains(github.event.comment.body, 'assign to me') || 
      contains(github.event.comment.body, 'assign this to me') || 
      contains(github.event.comment.body, 'assign it to me') || 
      contains(github.event.comment.body, 'assign me this') || 
      contains(github.event.comment.body, 'work on this') || 
      contains(github.event.comment.body, 'i can try fixing this') || 
      contains(github.event.comment.body, 'i am interested in doing this') || 
      contains(github.event.comment.body, 'be assigned this') || 
      contains(github.event.comment.body, 'i am interested in contributing'))) || 
      github.event_name == 'schedule' || 
      github.event_name == 'workflow_dispatch' ||
      github.event_name == 'pull_request_review_comment'
    runs-on: ubuntu-latest
    steps:
      - name: BLT Action
        uses: OWASP-BLT/BLT-Action@main
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          repository: ${{ github.repository }}
          giphy-api-key: ${{ secrets.GIPHY_API_KEY }}
```

---

## Usage

### Assignment Commands

Comment any of the following on an issue to self-assign:

- `/assign`
- `assign to me`
- `assign this to me`
- `assign it to me`
- `assign me this`
- `work on this`
- `i can try fixing this`
- `i am interested in doing this`
- `i am interested in contributing`

Upon assignment the action will verify that you have no other open assigned issues without pull requests, assign you to the issue, add an `assigned` label, and give you 24 hours to submit a pull request.

To release an issue, comment `/unassign`. The action will remove you from the issue, remove the `assigned` label, and make the issue available for others.

Note: Assignment commands are restricted to human users. Bot accounts and GitHub Apps are automatically excluded.

### Engagement Commands

**Post a GIF**

Comment `/giphy [search term]` on any issue or pull request.

Example: `/giphy celebration`

**Send Kudos**

Comment `/kudos @username [optional message]` to publicly recognize a contributor.

Example: `/kudos @alice great work on this pull request`

If the recipient has an OWASP BLT profile, kudos are automatically tracked there. If not, they will be encouraged to create one.

**Send a Tip**

Comment `/tip @username $amount` to support a contributor financially via GitHub Sponsors.

Example: `/tip @contributor $10`

The action generates a direct link to the recipient's GitHub Sponsors page. Due to GitHub API limitations, the payment must be completed manually.

### Automated Unassignment

If an issue remains inactive for 24 hours without a linked pull request, the action automatically unassigns the contributor, removes the `assigned` label, and posts a notification that the issue is available again.

---

## Implementation Details

### Attribution

All comments generated by BLT-Action include the following footer for transparency:
```
---
This comment was generated by OWASP BLT-Action — https://github.com/OWASP-BLT/BLT-Action
```

### Event Triggers

| Event | Purpose |
|-------|---------|
| `issue_comment.created` | Processes commands on issue and PR comments |
| `pull_request_review_comment.created` | Processes commands on PR review comments |
| `schedule` | Daily cron job for stale issue detection |
| `workflow_dispatch` | Manual trigger for on-demand execution |

### Label Management

The action automatically manages an `assigned` label across issues. The label is added when a contributor is successfully assigned and removed upon unassignment, whether manual or automatic.

### API Integrations

| Integration | Purpose |
|-------------|---------|
| GitHub API | All GitHub operations via `@actions/github` with `GITHUB_TOKEN` |
| Giphy API | GIF retrieval — requires a free API key from developers.giphy.com |
| OWASP BLT API | Kudos tracking at owaspblt.org |

---

## Contributing

Contributions are welcome and greatly appreciated. To contribute:

1. Check the [issues page](../issues) for something you would like to work on
2. Fork the repository to your GitHub account
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Commit your changes: `git commit -m "Add: description of your change"`
5. Push to your branch: `git push origin feature/your-feature-name`
6. Open a pull request from your fork to the original repository

---

## License

This project is maintained by the OWASP BLT team. See the repository for license details.
