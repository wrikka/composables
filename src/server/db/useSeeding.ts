import { computed, ref } from "vue";

export interface SeedData {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  data: any;
  seed: (connection: any) => Promise<void>;
  cleanup?: (connection: any) => Promise<void>;
}

export interface SeedResult {
  seed: SeedData;
  success: boolean;
  error?: Error;
  recordsInserted?: number;
  executionTime: number;
}

export interface SeedingConfig {
  tableName?: string;
  seedsDirectory?: string;
  autoSeed?: boolean;
  validateDependencies?: boolean;
  batchSize?: number;
}

export function useSeeding(config: SeedingConfig = {}) {
  const {
    tableName = "seed_data",
    validateDependencies = true,
  } = config;

  const loading = ref(false);
  const error = ref<Error | null>(null);
  const seeds = ref<SeedData[]>([]);
  const appliedSeeds = ref<string[]>([]);
  const pendingSeeds = ref<SeedData[]>([]);
  const seedingHistory = ref<SeedResult[]>([]);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const hasPendingSeeds = computed(() => pendingSeeds.value.length > 0);
  const seedingStatus = computed(() => ({
    total: seeds.value.length,
    applied: appliedSeeds.value.length,
    pending: pendingSeeds.value.length,
    percentage: seeds.value.length > 0
      ? (appliedSeeds.value.length / seeds.value.length) * 100
      : 0,
  }));

  const loadSeeds = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      // This would typically load from file system or database
      // For now, we'll use a placeholder implementation
      const loadedSeeds: SeedData[] = [];
      seeds.value = loadedSeeds;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const getAppliedSeeds = async (connection: any): Promise<string[]> => {
    try {
      const result = await connection.query(
        `SELECT version FROM ${tableName} ORDER BY version ASC`,
      );
      return result.map((row: any) => row.version);
    } catch {
      return [];
    }
  };

  const createSeedsTable = async (connection: any): Promise<void> => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        records_inserted INTEGER DEFAULT 0,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER
      )
    `;
    await connection.query(createTableSQL);
  };

  const validateSeedDependencies = (seed: SeedData): boolean => {
    if (!validateDependencies || !seed.dependencies) {
      return true;
    }

    return seed.dependencies.every(dep => appliedSeeds.value.includes(dep));
  };

  const calculatePendingSeeds = (): void => {
    const applied = new Set(appliedSeeds.value);
    pendingSeeds.value = seeds.value
      .filter(seed => !applied.has(seed.version))
      .filter(seed => validateSeedDependencies(seed))
      .sort((a, b) => a.version.localeCompare(b.version));
  };

  const executeSeed = async (seed: SeedData, connection: any): Promise<SeedResult> => {
    const startTime = Date.now();
    let recordsInserted = 0;

    try {
      await seed.seed(connection);

      // Try to count inserted records (this is implementation-specific)
      try {
        if (seed.data && Array.isArray(seed.data)) {
          recordsInserted = seed.data.length;
        }
      } catch {
        // Ignore counting errors
      }

      // Record seed
      await connection.query(
        `INSERT INTO ${tableName} (version, name, description, records_inserted, execution_time) VALUES ($1, $2, $3, $4, $5)`,
        [seed.version, seed.name, seed.description, recordsInserted, Date.now() - startTime],
      );

      const result: SeedResult = {
        seed,
        success: true,
        recordsInserted,
        executionTime: Date.now() - startTime,
      };

      seedingHistory.value.push(result);
      appliedSeeds.value.push(seed.version);

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      const result: SeedResult = {
        seed,
        success: false,
        error: errorObj,
        executionTime: Date.now() - startTime,
      };

      seedingHistory.value.push(result);
      return result;
    }
  };

  const seedUp = async (connection: any, targetVersion?: string): Promise<SeedResult[]> => {
    loading.value = true;
    error.value = null;

    try {
      await createSeedsTable(connection);
      appliedSeeds.value = await getAppliedSeeds(connection);
      calculatePendingSeeds();

      const seedsToRun = targetVersion
        ? pendingSeeds.value.filter(s => s.version <= targetVersion)
        : pendingSeeds.value;

      const results: SeedResult[] = [];

      for (const seed of seedsToRun) {
        const result = await executeSeed(seed, connection);
        results.push(result);

        if (!result.success) {
          throw result.error || new Error("Seeding failed");
        }
      }

      calculatePendingSeeds();
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const seedDown = async (connection: any, targetVersion?: string): Promise<SeedResult[]> => {
    loading.value = true;
    error.value = null;

    try {
      appliedSeeds.value = await getAppliedSeeds(connection);

      const seedsToCleanup = seeds.value
        .filter(seed => appliedSeeds.value.includes(seed.version))
        .filter(seed => targetVersion ? seed.version > targetVersion : true)
        .sort((a, b) => b.version.localeCompare(a.version));

      const results: SeedResult[] = [];

      for (const seed of seedsToCleanup) {
        const startTime = Date.now();

        try {
          if (seed.cleanup) {
            await seed.cleanup(connection);
          }

          // Remove seed record
          await connection.query(
            `DELETE FROM ${tableName} WHERE version = $1`,
            [seed.version],
          );

          const result: SeedResult = {
            seed,
            success: true,
            executionTime: Date.now() - startTime,
          };

          results.push(result);

          // Update applied seeds
          const index = appliedSeeds.value.indexOf(seed.version);
          if (index >= 0) {
            appliedSeeds.value.splice(index, 1);
          }
        } catch (err) {
          const errorObj = err instanceof Error ? err : new Error(String(err));

          const result: SeedResult = {
            seed,
            success: false,
            error: errorObj,
            executionTime: Date.now() - startTime,
          };

          results.push(result);
          throw errorObj;
        }
      }

      calculatePendingSeeds();
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const refreshSeed = async (seed: SeedData, connection: any): Promise<SeedResult> => {
    // First cleanup if cleanup function exists
    if (seed.cleanup) {
      await seed.cleanup(connection);
    }

    // Remove from applied seeds
    const index = appliedSeeds.value.indexOf(seed.version);
    if (index >= 0) {
      appliedSeeds.value.splice(index, 1);
    }

    // Remove seed record
    await connection.query(
      `DELETE FROM ${tableName} WHERE version = $1`,
      [seed.version],
    );

    // Re-execute the seed
    return await executeSeed(seed, connection);
  };

  const reset = (): void => {
    loading.value = false;
    error.value = null;
    seeds.value = [];
    appliedSeeds.value = [];
    pendingSeeds.value = [];
    seedingHistory.value = [];
  };

  return {
    loadSeeds,
    seedUp,
    seedDown,
    refreshSeed,
    reset,
    isLoading,
    lastError,
    seeds,
    appliedSeeds,
    pendingSeeds,
    seedingHistory,
    hasPendingSeeds,
    seedingStatus,
  };
}
