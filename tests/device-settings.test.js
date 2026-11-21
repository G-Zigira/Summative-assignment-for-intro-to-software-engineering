import { describe, it, expect } from 'vitest';
import { detectDevice, resolveControlScheme } from '../src/systems/device.js';
import { sanitizeSettings, defaultSettings, textScale } from '../src/systems/settings.js';

const envWith = (coarse) => ({ matchMedia: (q) => ({ matches: q === '(pointer: coarse)' && coarse }) });

describe('device detection (FR 2.1)', () => {
  it('coarse primary pointer (phone/tablet) -> touch', () => {
    expect(detectDevice(envWith(true))).toBe('touch');
  });
  it('fine primary pointer (laptop/desktop) -> desktop', () => {
    expect(detectDevice(envWith(false))).toBe('desktop');
  });
  it('no matchMedia (old browser / test env) -> desktop, never a crash', () => {
    expect(detectDevice({})).toBe('desktop');
    expect(detectDevice(undefined)).toBe('desktop');
  });
});

describe('control scheme (FR 2.2)', () => {
  it('"auto" follows detection; explicit settings override it', () => {
    expect(resolveControlScheme('auto', envWith(true))).toBe('touch');
    expect(resolveControlScheme('auto', envWith(false))).toBe('desktop');
    expect(resolveControlScheme('keyboard', envWith(true))).toBe('desktop');
    expect(resolveControlScheme('touch', envWith(false))).toBe('touch');
  });
});

describe('settings (FR 5.1)', () => {
  it('defaults: volume 70, medium text, auto controls', () => {
    expect(defaultSettings()).toEqual({ volume: 70, textSize: 'medium', controlScheme: 'auto' });
  });
  it('missing or invalid values fall back to defaults', () => {
    expect(sanitizeSettings(undefined)).toEqual(defaultSettings());
    expect(sanitizeSettings({ volume: NaN, textSize: 'x', controlScheme: 'y' })).toEqual(defaultSettings());
  });
  it('volume is clamped to 0-100 and snapped to steps of 10', () => {
    expect(sanitizeSettings({ volume: 250 }).volume).toBe(100);
    expect(sanitizeSettings({ volume: -5 }).volume).toBe(0);
    expect(sanitizeSettings({ volume: 43 }).volume).toBe(40);
    expect(sanitizeSettings({ volume: 45 }).volume).toBe(50);
  });
  it('text size multipliers are 100% / 125% / 150%', () => {
    expect(textScale({ textSize: 'small' })).toBe(1);
    expect(textScale({ textSize: 'medium' })).toBe(1.25);
    expect(textScale({ textSize: 'large' })).toBe(1.5);
  });
});
