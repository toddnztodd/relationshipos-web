import { describe, expect, it } from 'vitest';
import * as fs from 'fs';

/**
 * Territory Intelligence Phase 1 — Feature structure tests.
 * These validate that all required files, types, routes, and components
 * are in place without importing browser-only modules (localStorage).
 */

describe('Territory Types', () => {
  const content = fs.readFileSync('client/src/types/index.ts', 'utf-8');

  it('defines TerritoryType union', () => {
    expect(content).toContain("export type TerritoryType = 'core_territory' | 'expansion_zone' | 'tactical_route'");
  });

  it('defines Territory interface with required fields', () => {
    expect(content).toContain('export interface Territory');
    expect(content).toContain('property_count: number');
    expect(content).toContain('owners_known: number');
    expect(content).toContain('signal_count: number');
  });

  it('defines CoverageActivity interface', () => {
    expect(content).toContain('export interface CoverageActivity');
    expect(content).toContain('activity_type:');
  });

  it('defines FarmingProgram interface', () => {
    expect(content).toContain('export interface FarmingProgram');
    expect(content).toContain('recurrence: string');
  });

  it('defines CoverageSummary interface', () => {
    expect(content).toContain('export interface CoverageSummary');
    expect(content).toContain('properties_introduced');
    expect(content).toContain('properties_untouched');
  });

  it('defines TerritoryCreate interface', () => {
    expect(content).toContain('export interface TerritoryCreate');
  });
});

describe('Territory API Functions', () => {
  const content = fs.readFileSync('client/src/lib/api.ts', 'utf-8');

  it('exports getTerritories function', () => {
    expect(content).toContain('export async function getTerritories');
  });

  it('exports getTerritory function', () => {
    expect(content).toContain('export async function getTerritory');
  });

  it('exports createTerritory function', () => {
    expect(content).toContain('export async function createTerritory');
  });

  it('exports updateTerritory function', () => {
    expect(content).toContain('export async function updateTerritory');
  });

  it('exports deleteTerritory function', () => {
    expect(content).toContain('export async function deleteTerritory');
  });

  it('exports linkPropertyToTerritory function', () => {
    expect(content).toContain('export async function linkPropertyToTerritory');
  });

  it('exports unlinkPropertyFromTerritory function', () => {
    expect(content).toContain('export async function unlinkPropertyFromTerritory');
  });

  it('exports getTerritoryCoverage function', () => {
    expect(content).toContain('export async function getTerritoryCoverage');
  });

  it('exports getTerritorySignals function', () => {
    expect(content).toContain('export async function getTerritorySignals');
  });

  it('exports logCoverageActivity function', () => {
    expect(content).toContain('export async function logCoverageActivity');
  });

  it('exports farming program CRUD functions', () => {
    expect(content).toContain('export async function getTerritoryFarmingPrograms');
    expect(content).toContain('export async function createFarmingProgram');
    expect(content).toContain('export async function updateFarmingProgram');
    expect(content).toContain('export async function deleteFarmingProgram');
  });
});

describe('Territory Hooks', () => {
  const content = fs.readFileSync('client/src/hooks/useTerritories.ts', 'utf-8');

  it('exports useTerritories hook', () => {
    expect(content).toContain('export function useTerritories');
  });

  it('exports useTerritory hook', () => {
    expect(content).toContain('export function useTerritory');
  });

  it('exports useTerritoryCoverage hook', () => {
    expect(content).toContain('export function useTerritoryCoverage');
  });

  it('exports useTerritorySignals hook', () => {
    expect(content).toContain('export function useTerritorySignals');
  });

  it('exports territory mutation hooks', () => {
    expect(content).toContain('export function useCreateTerritory');
    expect(content).toContain('export function useUpdateTerritory');
    expect(content).toContain('export function useDeleteTerritory');
  });

  it('exports property linking hooks', () => {
    expect(content).toContain('export function useLinkProperty');
    expect(content).toContain('export function useUnlinkProperty');
  });

  it('exports coverage and farming program hooks', () => {
    expect(content).toContain('export function useLogCoverageActivity');
    expect(content).toContain('export function useCreateFarmingProgram');
    expect(content).toContain('export function useUpdateFarmingProgram');
    expect(content).toContain('export function useDeleteFarmingProgram');
  });
});

describe('Territory Page', () => {
  const content = fs.readFileSync('client/src/pages/Territory.tsx', 'utf-8');

  it('exports default component', () => {
    expect(content).toContain('export default function TerritoryPage');
  });

  it('includes territory list view with cards', () => {
    expect(content).toContain('TerritoryCard');
  });

  it('includes territory detail view', () => {
    expect(content).toContain('TerritoryDetail');
  });

  it('includes 4 detail tabs', () => {
    expect(content).toContain("'overview'");
    expect(content).toContain("'properties'");
    expect(content).toContain("'coverage'");
    expect(content).toContain("'programs'");
  });

  it('includes create territory modal with canvas boundary', () => {
    expect(content).toContain('CreateTerritoryModal');
    expect(content).toContain('canvasRef');
    expect(content).toContain('boundaryPoints');
    expect(content).toContain('handleCanvasClick');
  });

  it('includes coverage activity types', () => {
    expect(content).toContain('territory_intro');
    expect(content).toContain('flyer_drop');
    expect(content).toContain('magnet_drop');
    expect(content).toContain('door_knock');
    expect(content).toContain('welcome_touch');
    expect(content).toContain('market_update');
  });

  it('includes territory type badges with correct colors', () => {
    expect(content).toContain('core_territory');
    expect(content).toContain('expansion_zone');
    expect(content).toContain('tactical_route');
    expect(content).toContain('bg-emerald-50');
    expect(content).toContain('bg-amber-50');
    expect(content).toContain('bg-blue-50');
  });

  it('includes farming programs with overdue detection', () => {
    expect(content).toContain('isOverdue');
    expect(content).toContain('text-amber-600');
  });
});

describe('Sidebar Navigation', () => {
  const content = fs.readFileSync('client/src/components/layout/Sidebar.tsx', 'utf-8');

  it('includes Territory nav item between Properties and Community', () => {
    expect(content).toContain("label: 'Territory'");
    expect(content).toContain("path: '/territory'");
    expect(content).toContain('Flag');
    // Verify order: Properties before Territory before Community
    const propsIdx = content.indexOf("label: 'Properties'");
    const terrIdx = content.indexOf("label: 'Territory'");
    const commIdx = content.indexOf("label: 'Community'");
    expect(propsIdx).toBeLessThan(terrIdx);
    expect(terrIdx).toBeLessThan(commIdx);
  });
});

describe('App Routing', () => {
  const content = fs.readFileSync('client/src/App.tsx', 'utf-8');

  it('includes /territory route', () => {
    expect(content).toContain('path="/territory"');
  });

  it('imports Territory page component', () => {
    expect(content).toContain("import Territory from \"./pages/Territory\"");
  });
});

describe('Property Detail Territory Integration', () => {
  const content = fs.readFileSync('client/src/pages/Properties.tsx', 'utf-8');

  it('includes TerritoryChips component', () => {
    expect(content).toContain('function TerritoryChips');
    expect(content).toContain('<TerritoryChips');
  });

  it('imports useTerritories hook', () => {
    expect(content).toContain('useTerritories');
  });

  it('includes territory type badge styles', () => {
    expect(content).toContain('TERRITORY_TYPE_STYLES');
    expect(content).toContain('core_territory');
    expect(content).toContain('expansion_zone');
    expect(content).toContain('tactical_route');
  });
});
