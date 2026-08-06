# Changelog

## 6.2.0

- Replaced the abstract terrain background with a cartographic operational basemap
- Added recognizable shorelines, coastal water, rivers or ship channels, wetlands, and terrain contours
- Added mapped roads, highway shields, parallel rail lines, runways, taxiways, aprons, port basins, berths, warehouses, and industrial facilities
- Added region-specific infrastructure and corridor labels, a north arrow, scale bar, and not-for-navigation notice
- Added Infrastructure, Terrain, and Minimal map modes to balance realism and decision-card legibility
- Kept the basemap self-contained so the simulator works on GitHub Pages without map API keys, billing, tracking, or third-party tile availability

## 6.1.1

- Removed inactive standby cards from the live map while retaining the full scenario library
- Added automatic spacing for active decision cards to prevent overlap
- Kept temporary inject names hidden until hover or selection
- Reduced temporary inject hit areas so they do not block node clicks
- Enlarged mouse targets and added pointer cursors for nodes, assets, and weather
- Kept completed nodes clickable for review in the intelligence panel
- Made the terrain layer visible by default and moved its control directly above the map
- Reduced responsive header wrapping and vertical space


## 6.1.0

- Randomized vehicle starting position, speed, direction, and initial route by mission seed
- Randomized weather direction, track, timing, and locally affected transportation assets
- Added temporary weather, economic, security, and human-error injects during live play
- Expanded the regional decision library from 10 to 16 complete scenarios
- Added tariff, cost-of-goods, political unrest, customs, human-error, and cargo-fraud decisions
- Added a toggleable terrain layer with fictional regional coast, terrain, water, and infrastructure context
- Added temporary inject review to run history and the after-action report
- Extended validators and generation tests to cover ambient events, asset plans, and weather localization


## 6.0.0

- Added separate Pacific Northwest and Gulf Coast / Texas regional mission packs
- Added five Gulf Coast disruptions with region-specific logistics effects
- Added seeded random selection of active disruptions, operating conditions, and response order
- Added reproducible run loading and browser-local performance history
- Added mission-pack validation for maps, assets, weather, conditions, and scenario references
- Added automated tests for deterministic replay and meaningful run variation

## 5.2.0

- Reset the timed mission clock correctly when running another Medium or Hard mission
- Prevented incomplete or decision-free runs from receiving a strong performance band
- Moved current-region transportation effects into scenario data
- Added automatic scenario-schema validation to local builds and pull requests
- Added no-code and JSON contribution routes with a complete Pacific Northwest example
- Clarified that other regions should be developed as separate mission sets

## 5.1.0

- Connected scenario decisions to visible transportation states
- Added real alternate paths for rerouted ships, aircraft, trains, and trucks
- Added a four-asset network movement board
- Added transportation effects to the mission log
- Distinguished stabilized nodes from degraded nodes after a weak response

## 5.0.0

- Rebuilt the project as a living global operations simulator
- Added animated ships, aircraft, trains, and trucks
- Added a planning phase and preparedness allocation
- Added critical-infrastructure dependencies and points of interest
- Added cyber, AI-enabled, weather, infrastructure, and large-gathering risks
- Added a live operational feed and command actions
- Added advisor perspectives and mission objectives
- Added after-action reporting
- Added live-data and sensitive-information policy documentation
