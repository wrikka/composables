import { computed, ref } from "vue";

export interface QueryBuilderField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "json";
  table?: string;
  alias?: string;
}

export interface QueryBuilderCondition {
  field: string;
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "notIn"
    | "isNull"
    | "isNotNull"
    | "between";
  value?: any;
  values?: any[];
}

export interface QueryBuilderJoin {
  table: string;
  type: "inner" | "left" | "right" | "full";
  on: string;
  alias?: string;
}

export interface QueryBuilderOrder {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryBuilderOptions {
  table: string;
  fields?: QueryBuilderField[];
  where?: QueryBuilderCondition[];
  joins?: QueryBuilderJoin[];
  orderBy?: QueryBuilderOrder[];
  groupBy?: string[];
  having?: QueryBuilderCondition[];
  limit?: number;
  offset?: number;
  distinct?: boolean;
}

export interface QueryBuilderResult {
  query: string;
  params: any[];
  bindings: Record<string, any>;
}

export function useQueryBuilder() {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const currentQuery = ref<QueryBuilderOptions | null>(null);
  const builtQuery = ref<QueryBuilderResult | null>(null);

  const isLoading = computed(() => loading.value);
  const lastError = computed(() => error.value);
  const querySQL = computed(() => builtQuery.value?.query || "");
  const queryParams = computed(() => builtQuery.value?.params || []);

  const buildCondition = (condition: QueryBuilderCondition): string => {
    const { field, operator, values } = condition;

    switch (operator) {
      case "eq":
        return `${field} = ?`;
      case "ne":
        return `${field} != ?`;
      case "gt":
        return `${field} > ?`;
      case "gte":
        return `${field} >= ?`;
      case "lt":
        return `${field} < ?`;
      case "lte":
        return `${field} <= ?`;
      case "like":
        return `${field} LIKE ?`;
      case "ilike":
        return `${field} ILIKE ?`;
      case "in":
        return `${field} IN (${values?.map(() => "?").join(", ") || ""})`;
      case "notIn":
        return `${field} NOT IN (${values?.map(() => "?").join(", ") || ""})`;
      case "isNull":
        return `${field} IS NULL`;
      case "isNotNull":
        return `${field} IS NOT NULL`;
      case "between":
        return `${field} BETWEEN ? AND ?`;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  };

  const getConditionValues = (condition: QueryBuilderCondition): any[] => {
    const { operator, value, values } = condition;

    switch (operator) {
      case "in":
      case "notIn":
        return values || [];
      case "between":
        return Array.isArray(value) ? value : [value, value];
      case "isNull":
      case "isNotNull":
        return [];
      default:
        return [value];
    }
  };

  const buildSelect = (options: QueryBuilderOptions): string => {
    const { table, fields, distinct } = options;

    const selectFields = fields && fields.length > 0
      ? fields.map(field => {
        const fieldName = field.alias ? `${field.name} AS ${field.alias}` : field.name;
        return field.table ? `${field.table}.${field.name}` : fieldName;
      }).join(", ")
      : "*";

    const distinctClause = distinct ? "DISTINCT " : "";

    return `SELECT ${distinctClause}${selectFields} FROM ${table}`;
  };

  const buildJoins = (joins: QueryBuilderJoin[]): string => {
    return joins.map(join => {
      const joinType = join.type.toUpperCase();
      const joinTable = join.alias ? `${join.table} AS ${join.alias}` : join.table;
      return `${joinType} JOIN ${joinTable} ON ${join.on}`;
    }).join(" ");
  };

  const buildWhere = (conditions: QueryBuilderCondition[]): { clause: string; params: any[] } => {
    if (conditions.length === 0) {
      return { clause: "", params: [] };
    }

    const conditionStrings = conditions.map(buildCondition);
    const allParams = conditions.flatMap(getConditionValues);

    return {
      clause: `WHERE ${conditionStrings.join(" AND ")}`,
      params: allParams,
    };
  };

  const buildGroupBy = (groupBy: string[]): string => {
    return groupBy.length > 0 ? `GROUP BY ${groupBy.join(", ")}` : "";
  };

  const buildHaving = (conditions: QueryBuilderCondition[]): { clause: string; params: any[] } => {
    if (conditions.length === 0) {
      return { clause: "", params: [] };
    }

    const conditionStrings = conditions.map(buildCondition);
    const allParams = conditions.flatMap(getConditionValues);

    return {
      clause: `HAVING ${conditionStrings.join(" AND ")}`,
      params: allParams,
    };
  };

  const buildOrderBy = (orderBy: QueryBuilderOrder[]): string => {
    if (orderBy.length === 0) {
      return "";
    }

    return `ORDER BY ${orderBy.map(order => `${order.field} ${order.direction.toUpperCase()}`).join(", ")}`;
  };

  const buildLimitOffset = (limit?: number, offset?: number): string => {
    const clauses = [];
    if (limit !== undefined) {
      clauses.push(`LIMIT ${limit}`);
    }
    if (offset !== undefined) {
      clauses.push(`OFFSET ${offset}`);
    }
    return clauses.join(" ");
  };

  const build = (options: QueryBuilderOptions): QueryBuilderResult => {
    loading.value = true;
    error.value = null;

    try {
      currentQuery.value = options;

      const queryParts = [buildSelect(options)];
      const allParams: any[] = [];

      // Add joins
      if (options.joins && options.joins.length > 0) {
        queryParts.push(buildJoins(options.joins));
      }

      // Add where clause
      if (options.where && options.where.length > 0) {
        const whereResult = buildWhere(options.where);
        queryParts.push(whereResult.clause);
        allParams.push(...whereResult.params);
      }

      // Add group by
      if (options.groupBy && options.groupBy.length > 0) {
        queryParts.push(buildGroupBy(options.groupBy));
      }

      // Add having
      if (options.having && options.having.length > 0) {
        const havingResult = buildHaving(options.having);
        queryParts.push(havingResult.clause);
        allParams.push(...havingResult.params);
      }

      // Add order by
      if (options.orderBy && options.orderBy.length > 0) {
        queryParts.push(buildOrderBy(options.orderBy));
      }

      // Add limit and offset
      const limitOffset = buildLimitOffset(options.limit, options.offset);
      if (limitOffset) {
        queryParts.push(limitOffset);
      }

      const query = queryParts.filter(Boolean).join(" ");

      const bindings: Record<string, any> = {};
      allParams.forEach((param, index) => {
        bindings[`param${index + 1}`] = param;
      });

      const result: QueryBuilderResult = {
        query,
        params: allParams,
        bindings,
      };

      builtQuery.value = result;
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;
      throw errorObj;
    } finally {
      loading.value = false;
    }
  };

  const buildInsert = (table: string, data: Record<string, any>): QueryBuilderResult => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map(() => "?").join(", ");

    const query = `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`;

    const bindings: Record<string, any> = {};
    values.forEach((value, index) => {
      bindings[`param${index + 1}`] = value;
    });

    return { query, params: values, bindings };
  };

  const buildUpdate = (
    table: string,
    data: Record<string, any>,
    where: QueryBuilderCondition[],
  ): QueryBuilderResult => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(", ");

    const whereResult = buildWhere(where);
    const allParams = [...values, ...whereResult.params];

    const query = `UPDATE ${table} SET ${setClause} ${whereResult.clause}`;

    const bindings: Record<string, any> = {};
    allParams.forEach((param, index) => {
      bindings[`param${index + 1}`] = param;
    });

    return { query, params: allParams, bindings };
  };

  const buildDelete = (table: string, where: QueryBuilderCondition[]): QueryBuilderResult => {
    const whereResult = buildWhere(where);

    const query = `DELETE FROM ${table} ${whereResult.clause}`;

    const bindings: Record<string, any> = {};
    whereResult.params.forEach((param, index) => {
      bindings[`param${index + 1}`] = param;
    });

    return { query, params: whereResult.params, bindings };
  };

  const reset = (): void => {
    loading.value = false;
    error.value = null;
    currentQuery.value = null;
    builtQuery.value = null;
  };

  return {
    build,
    buildInsert,
    buildUpdate,
    buildDelete,
    reset,
    isLoading,
    lastError,
    currentQuery,
    builtQuery,
    querySQL,
    queryParams,
  };
}
