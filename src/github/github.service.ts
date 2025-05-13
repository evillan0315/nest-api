import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GithubService {
  private readonly githubApiUrl = 'https://api.github.com';
  async getRepoFileTree(
    owner: string,
    repo: string,
    branch: string = 'main',
  ): Promise<any> {
    const token = process.env.GITHUB_TOKEN; // Optional: for private repos or higher rate limit
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Step 1: Get the SHA of the branch (e.g., "main")
    const refRes = await axios.get(
      `${this.githubApiUrl}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
      { headers },
    );
    const commitSha = refRes.data.object.sha;

    // Step 2: Get the commit data to find the tree SHA
    const commitRes = await axios.get(
      `${this.githubApiUrl}/repos/${owner}/${repo}/git/commits/${commitSha}`,
      { headers },
    );
    const treeSha = commitRes.data.tree.sha;

    // Step 3: Get the recursive tree
    const treeRes = await axios.get(
      `${this.githubApiUrl}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
      { headers },
    );

    return treeRes.data.tree; // Array of { path, type, sha, mode, size }
  }
}
