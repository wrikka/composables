import { computed, ref } from "vue";

export interface Migration {
  id: string;
  name: string;
  version: string;
  description?: string;
  up: (connection: any) => Promise<void>;
  down: (connection: any) => Promise<void>;
  dependencies?: string[];
  createdAt: Date;
}

export interface MigrationResult {
  migration: Migration;
  success: boolean;
  error?: Error;
  executionTime: number;
}

export interface MigrationConfig {
  tableName?: string;
  migrationsDirectory?: string;
  autoMigrate?: boolean;
  validateDependencies?: boolean;
}

export function useMigration(config: MigrationConfig = {}) {
  const {
    tableName = "migrations",
    validateDependencies = true,
  } = config;

  const loading = ref(false);
  const error = ref<Error | null>(null);
  const migrations = ref<Migration[]>([]);
  const appliedMigrations = ref<string[]>([]);
  const pendingMigrations = ref<Migration[]>([]);
  const migrationHistory = ref<MigrationResult[]>([]);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const hasPendingMigrations = computed(() => pendingMigrations.value.length > 0);
  const migrationStatus = computed(() => ({
    total: migrations.value.length,
    applied: appliedMigrations.value.length,
    pending: pendingMigrations.value.length,
    percentage: migrations.value.length > 0
      ? (appliedMigrations.value.length / migrations.value.length) * 100
      : 0,
  }));

  const loadMigrations = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      // This would typically load from file system or database
      // For now, we'll use a placeholder implementation
      const loadedMigrations: Migration[] = [];
      migrations.value = loadedMigrations;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  };

  const getAppliedMigrations = async (connection: any): Promise<string[]> => {
    try {
      // Query the migrations table to get applied migrations
      const result = await connection.query(
        `SELECT version FROM ${tableName} ORDER BY version ASC`,
      );
      return result.map((row: any) => row.version);
    } catch {
      // If table doesn't exist, return empty array
      return [];
    }
  };

  const createMigrationsTable = async (connection: any): Promise<void> => {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER
      )
    `;
    await connection.query(createTableSQL);
  };

  const validateMigrationDependencies = (migration: Migration): boolean => {
    if (!validateDependencies || !migration.dependencies) {
      return true;
    }

    return migration.dependencies.every(dep => appliedMigrations.value.includes(dep));
  };

  const calculatePendingMigrations = (): void => {
    const applied = new Set(appliedMigrations.value);
    pendingMigrations.value = migrations.value
      .filter(migration => !applied.has(migration.version))
      .filter(migration => validateMigrationDependencies(migration))
      .sort((a, b) => a.version.localeCompare(b.version));
  };

  const executeMigration = async (migration: Migration, connection: any): Promise<MigrationResult> => {
    const startTime = Date.now();

    try {
      await migration.up(connection);

      // Record migration
      await connection.query(
        `INSERT INTO ${tableName} (version, name, description, execution_time) VALUES ($1, $2, $3, $4)`,
        [migration.version, migration.name, migration.description, Date.now() - startTime],
      );

      const result: MigrationResult = {
        migration,
        success: true,
        executionTime: Date.now() - startTime,
      };

      migrationHistory.value.push(result);
      appliedMigrations.value.push(migration.version);

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));

      const result: MigrationResult = {
        migration,
        success: false,
        error: errorObj,
        executionTime: Date.now() - startTime,
      };

      migrationHistory.value.push(result);
      return result;
    }
  };

  const migrateUp = async (connection: any, targetVersion?: string): Promise<MigrationResult[]> => {
    loading.value = true;
    error.value = null;

    try {
      await createMigrationsTable(connection);
      appliedMigrations.value = await getAppliedMigrations(connection);
      calculatePendingMigrations();

      const migrationsToRun = targetVersion
        ? pendingMigrations.value.filter(m => m.version <= targetVersion)
        : pendingMigrations.value;

      const results: MigrationResult[] = [];

      for (const migration of migrationsToRun) {
        const result = await executeMigration(migration, connection);
        results.push(result);

        if (!result.success) {
          throw result.error || new Error("Migration failed");
        }
      }

      calculatePendingMigrations();
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const migrateDown = async (connection: any, targetVersion?: string): Promise<MigrationResult[]> => {
    loading.value = true;
    error.value = null;

    try {
      appliedMigrations.value = await getAppliedMigrations(connection);

      const migrationsToRollback = migrations.value
        .filter(migration => appliedMigrations.value.includes(migration.version))
        .filter(migration => targetVersion ? migration.version > targetVersion : true)
        .sort((a, b) => b.version.localeCompare(a.version)); // Reverse order for rollback

      const results: MigrationResult[] = [];

      for (const migration of migrationsToRollback) {
        const startTime = Date.now();

        try {
          await migration.down(connection);

          // Remove migration record
          await connection.query(
            `DELETE FROM ${tableName} WHERE version = $1`,
            [migration.version],
          );

          const result: MigrationResult = {
            migration,
            success: true,
            executionTime: Date.now() - startTime,
          };

          results.push(result);

          // Update applied migrations
          const index = appliedMigrations.value.indexOf(migration.version);
          if (index >= 0) {
            appliedMigrations.value.splice(index, 1);
          }
        } catch (err) {
          const errorObj = err instanceof Error ? err : new Error(String(err));

          const result: MigrationResult = {
            migration,
            success: false,
            error: errorObj,
            executionTime: Date.now() - startTime,
          };

          results.push(result);
          throw errorObj;
        }
      }

      calculatePendingMigrations();
      return results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const reset = (): void => {
    loading.value = false;
    error.value = null;
    migrations.value = [];
    appliedMigrations.value = [];
    pendingMigrations.value = [];
    migrationHistory.value = [];
  };

  return {
    loadMigrations,
    migrateUp,
    migrateDown,
    reset,
    isLoading,
    lastError,
    migrations,
    appliedMigrations,
    pendingMigrations,
    migrationHistory,
    hasPendingMigrations,
    migrationStatus,
  };
}
