import { describe, expect, it } from 'vitest';
import { summarize } from '../src/utils.js';

describe('summarize', () => {
  it('returns first sentences', () => {
    expect(summarize('A. B. C. D.')).toBe('A. B. C.');
  });
});
