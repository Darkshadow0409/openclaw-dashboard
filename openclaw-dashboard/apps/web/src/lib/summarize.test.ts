import { describe, it, expect } from 'vitest';
import { compactNum } from './summarize';

describe('compactNum', () => {
  it('formats large values', () => expect(compactNum(1500)).toBe('1.5k'));
});
