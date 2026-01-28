import { ref, computed } from "vue";

interface AggregationFunction {
	(value: number[]): number;
}

interface UseDataAggregateOptions<T> {
	data: T[];
}

export function useDataAggregate<T = any>(options: UseDataAggregateOptions<T>) {
	const { data } = options;

	const sum = (key: keyof T): number => {
		return data.reduce((acc, item) => {
			const value = item[key] as number;
			return acc + (typeof value === "number" ? value : 0);
		}, 0);
	};

	const avg = (key: keyof T): number => {
		const total = sum(key);
		return total / data.length;
	};

	const count = (): number => {
		return data.length;
	};

	const min = (key: keyof T): number => {
		return data.reduce((acc, item) => {
			const value = item[key] as number;
			return Math.min(acc, typeof value === "number" ? value : Infinity);
		}, Infinity);
	};

	const max = (key: keyof T): number => {
		return data.reduce((acc, item) => {
			const value = item[key] as number;
			return Math.max(acc, typeof value === "number" ? value : -Infinity);
		}, -Infinity);
	};

	const groupBy = (key: keyof T): Record<string, T[]> => {
		return data.reduce((acc, item) => {
			const value = String(item[key]);
			if (!acc[value]) {
				acc[value] = [];
			}
			acc[value].push(item);
			return acc;
		}, {} as Record<string, T[]>);
	};

	const countBy = (key: keyof T): Record<string, number> => {
		return data.reduce((acc, item) => {
			const value = String(item[key]);
			acc[value] = (acc[value] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	};

	const aggregate = (keys: (keyof T)[]): Record<string, number> => {
		const result: Record<string, number> = {};

		keys.forEach((key) => {
			result[String(key)] = sum(key);
		});

		return result;
	};

	const getStatistics = (key: keyof T) => {
		const values = data.map((item) => item[key] as number).filter((v) => typeof v === "number");

		if (values.length === 0) {
			return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
		}

		const total = values.reduce((acc, v) => acc + v, 0);
		const mean = total / values.length;
		const sorted = [...values].sort((a, b) => a - b);
		const median = sorted.length % 2 === 0
			? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
			: sorted[Math.floor(sorted.length / 2)];

		return {
			sum: total,
			avg: mean,
			min: Math.min(...values),
			max: Math.max(...values),
			count: values.length,
			median,
		};
	};

	return {
		sum,
		avg,
		count,
		min,
		max,
		groupBy,
		countBy,
		aggregate,
		getStatistics,
	};
}
