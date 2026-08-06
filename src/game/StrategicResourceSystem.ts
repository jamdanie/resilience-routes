import type {
  Difficulty,
  StrategicResourceCost,
  StrategicResourceKey,
  StrategicResourcePool,
  StrategicResourceUpdate
} from "./types";

export const STRATEGIC_RESOURCE_KEYS: StrategicResourceKey[] = [
  "funds",
  "crews",
  "transport",
  "fuel",
  "intelligence",
  "inventory"
];

export const STRATEGIC_RESOURCE_LABELS: Record<StrategicResourceKey, string> = {
  funds: "Funds",
  crews: "Field crews",
  transport: "Transport",
  fuel: "Fuel",
  intelligence: "Intel",
  inventory: "Reserves"
};

const INITIAL_RESOURCES: Record<Difficulty, StrategicResourcePool> = {
  easy: { funds: 7, crews: 6, transport: 6, fuel: 6, intelligence: 6, inventory: 6 },
  medium: { funds: 6, crews: 4, transport: 4, fuel: 5, intelligence: 4, inventory: 4 },
  hard: { funds: 4, crews: 3, transport: 3, fuel: 4, intelligence: 3, inventory: 3 }
};

function emptyPool(): StrategicResourcePool {
  return { funds: 0, crews: 0, transport: 0, fuel: 0, intelligence: 0, inventory: 0 };
}

function copyPool(pool: StrategicResourcePool): StrategicResourcePool {
  return { ...pool };
}

export function formatResourceCost(cost: StrategicResourceCost): string {
  const entries = STRATEGIC_RESOURCE_KEYS
    .filter((key) => (cost[key] ?? 0) > 0)
    .map((key) => `${cost[key]} ${STRATEGIC_RESOURCE_LABELS[key]}`);
  return entries.length ? entries.join(" · ") : "No resource commitment";
}

export class StrategicResourceSystem {
  private readonly initial: StrategicResourcePool;
  private readonly remaining: StrategicResourcePool;
  private readonly spent: StrategicResourcePool = emptyPool();

  constructor(difficulty: Difficulty) {
    this.initial = copyPool(INITIAL_RESOURCES[difficulty]);
    this.remaining = copyPool(this.initial);
  }

  snapshot(): StrategicResourceUpdate {
    return {
      initial: copyPool(this.initial),
      remaining: copyPool(this.remaining),
      spent: copyPool(this.spent)
    };
  }

  canAfford(cost: StrategicResourceCost): boolean {
    return STRATEGIC_RESOURCE_KEYS.every((key) => (cost[key] ?? 0) <= this.remaining[key]);
  }

  missing(cost: StrategicResourceCost): StrategicResourceCost {
    return STRATEGIC_RESOURCE_KEYS.reduce<StrategicResourceCost>((missing, key) => {
      const shortage = (cost[key] ?? 0) - this.remaining[key];
      if (shortage > 0) missing[key] = shortage;
      return missing;
    }, {});
  }

  spend(cost: StrategicResourceCost): StrategicResourceUpdate | null {
    if (!this.canAfford(cost)) return null;
    STRATEGIC_RESOURCE_KEYS.forEach((key) => {
      const amount = cost[key] ?? 0;
      this.remaining[key] -= amount;
      this.spent[key] += amount;
    });
    return this.snapshot();
  }
}
