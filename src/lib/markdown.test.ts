// This is a dummy test file to set up the testing infrastructure.
// In a real project, you would add more comprehensive tests.

import { getArticlesSortedByDate } from './markdown';

// Mock the fs module to avoid actual file system access during tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // import and retain default behavior
  existsSync: jest.fn(() => true),
  readdirSync: jest.fn(() => ['test-article.md']),
  readFileSync: jest.fn(() => `---
title: Test Article
date: '2025-01-01'
category: 'testing'
description: 'This is a test.'
image: '/test.jpg'
draft: false
---

Hello world
`),
  statSync: jest.fn(() => ({
    mtime: new Date('2025-01-01'),
  })),
}));

describe('Markdown Library', () => {
  it('should read and parse a markdown file correctly', () => {
    const articles = getArticlesSortedByDate();
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Test Article');
    expect(articles[0].category).toBe('testing');
    expect(articles[0].draft).toBe(false);
  });
});
