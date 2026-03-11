import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const clientSrc = join(root, 'client/src');

describe('UI Polish — Haptic Utility', () => {
  it('lib/utils.ts exports haptic function', () => {
    const utils = readFileSync(join(clientSrc, 'lib/utils.ts'), 'utf-8');
    expect(utils).toContain('export function haptic');
    expect(utils).toContain('navigator.vibrate');
  });

  it('lib/utils.ts exports HapticPattern enum', () => {
    const utils = readFileSync(join(clientSrc, 'lib/utils.ts'), 'utf-8');
    expect(utils).toContain('HapticPattern');
    expect(utils).toContain('voiceStart');
    expect(utils).toContain('voiceStop');
    expect(utils).toContain('knock');
    expect(utils).toContain('tap');
  });
});

describe('UI Polish — CSS Animations', () => {
  it('index.css contains tab-content-enter keyframe', () => {
    const css = readFileSync(join(clientSrc, 'index.css'), 'utf-8');
    expect(css).toContain('tab-content-enter');
  });

  it('index.css contains checkbox-complete animation', () => {
    const css = readFileSync(join(clientSrc, 'index.css'), 'utf-8');
    expect(css).toContain('checkbox-complete');
  });

  it('index.css contains mic-ring animation', () => {
    const css = readFileSync(join(clientSrc, 'index.css'), 'utf-8');
    expect(css).toContain('mic-ring');
  });

  it('index.css contains strikethrough-animate class', () => {
    const css = readFileSync(join(clientSrc, 'index.css'), 'utf-8');
    expect(css).toContain('strikethrough-animate');
  });
});

describe('UI Polish — Haptic in Components', () => {
  it('VoiceRecorder uses haptic on start and stop', () => {
    const src = readFileSync(join(clientSrc, 'components/shared/VoiceRecorder.tsx'), 'utf-8');
    expect(src).toContain('haptic');
    expect(src).toContain('HapticPattern.voiceStart');
    expect(src).toContain('HapticPattern.voiceStop');
  });

  it('DoorKnock uses haptic on knock', () => {
    const src = readFileSync(join(clientSrc, 'pages/DoorKnock.tsx'), 'utf-8');
    expect(src).toContain('haptic');
    expect(src).toContain('HapticPattern.knock');
  });

  it('ListingChecklist uses haptic on item completion', () => {
    const src = readFileSync(join(clientSrc, 'components/properties/ListingChecklist.tsx'), 'utf-8');
    expect(src).toContain('haptic');
    expect(src).toContain('HapticPattern.tap');
  });
});

describe('UI Polish — Skeleton Loaders', () => {
  it('People.tsx has animate-pulse skeleton instead of spinner for list', () => {
    const src = readFileSync(join(clientSrc, 'pages/People.tsx'), 'utf-8');
    expect(src).toContain('animate-pulse');
    // Loading state should use skeleton cards, not a single spinner
    expect(src).toContain('rounded-xl border border-[#ECEAE5] bg-white/60');
  });

  it('Properties.tsx has animate-pulse skeleton instead of spinner for list', () => {
    const src = readFileSync(join(clientSrc, 'pages/Properties.tsx'), 'utf-8');
    expect(src).toContain('animate-pulse');
  });

  it('Dashboard.tsx has animate-pulse skeleton for signals section', () => {
    const src = readFileSync(join(clientSrc, 'pages/Dashboard.tsx'), 'utf-8');
    expect(src).toContain('animate-pulse');
  });
});

describe('UI Polish — Tab Animations', () => {
  it('People.tsx uses tab-content-enter class on tab content', () => {
    const src = readFileSync(join(clientSrc, 'pages/People.tsx'), 'utf-8');
    expect(src).toContain('tab-content-enter');
  });

  it('Territory.tsx uses tab-content-enter class on tab content', () => {
    const src = readFileSync(join(clientSrc, 'pages/Territory.tsx'), 'utf-8');
    expect(src).toContain('tab-content-enter');
  });
});

describe('UI Polish — No Emoji in JSX', () => {
  it('DoorKnock.tsx result buttons use Lucide icons not emoji', () => {
    const src = readFileSync(join(clientSrc, 'pages/DoorKnock.tsx'), 'utf-8');
    // Should not have emoji door or hand icons
    expect(src).not.toContain('🚪');
    expect(src).not.toContain('🤝');
    expect(src).not.toContain('📋');
  });

  it('VoiceCaptureModal.tsx uses Lucide DoorOpen not emoji', () => {
    const src = readFileSync(join(clientSrc, 'components/shared/VoiceCaptureModal.tsx'), 'utf-8');
    expect(src).not.toContain('🚪');
    expect(src).toContain('DoorOpen');
  });
});
