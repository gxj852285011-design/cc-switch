import { describe, it, expect } from 'vitest';
import { compareSemver, APP_CURRENT_VERSION } from '@/lib/updater';

describe('Updater - Semver Comparison & Logic', () => {
  it('correctly compares version numbers', () => {
    expect(compareSemver('4.2.1', '4.2.0')).toBe(1);
    expect(compareSemver('4.2.0', '4.2.1')).toBe(-1);
    expect(compareSemver('4.2.1', '4.2.1')).toBe(0);
    expect(compareSemver('v4.2.2', '4.2.1')).toBe(1);
    expect(compareSemver('v4.3.0', 'v4.2.9')).toBe(1);
    expect(compareSemver('5.0.0', '4.9.9')).toBe(1);
  });

  it('handles current app version', () => {
    expect(APP_CURRENT_VERSION).toBe('4.2.1');
    expect(compareSemver(APP_CURRENT_VERSION, '4.2.1')).toBe(0);
  });
});
