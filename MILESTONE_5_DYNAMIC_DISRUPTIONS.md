# Milestone 5: Dynamic disruptions

This milestone connects transportation animation to the scenario and decision system without changing the established resilience calculation.

## Included

- Visible alternate routes for rerouted ships, aircraft, trains, and trucks
- Holding assets stop; delayed assets move at reduced speed
- Scenario-specific transportation reasons for each active disruption
- Different transportation outcomes for effective and weak decisions
- Four-asset network movement board with current status and route state
- Mission-log entries that name affected assets and their current condition
- Active, stabilized, and degraded node states
- Weather effects layered over existing scenario effects

## Test path

1. Launch the regional scenario and confirm all four assets appear on the movement board.
2. Open Port Horizon and confirm the vessel holds while the truck is delayed.
3. Choose the recommended response and confirm both assets use visible alternate routes.
4. Open Riverbend Rail Junction and choose a weak response. Confirm the train remains delayed and the truck enters holding.
5. Select a moving asset and confirm its current route, cargo, status, and operational reason appear in the sidebar.
6. Wait for the weather warning and confirm its temporary restrictions appear over the scenario state.
7. After the weather phase changes, confirm unresolved scenario effects remain active.
8. Complete three decisions and open the after-action report.

## Build

```powershell
npm ci
npm run build
npm run dev
```
