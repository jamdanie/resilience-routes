# Resilience Routes V5

**Global Operations & Critical Infrastructure Simulator**

Resilience Routes is a static, browser-based educational simulation inspired by Sunny Wescott's concept for teaching global supply-chain interdependence, infrastructure resilience, hazard response, and resource sharing.

**Live site:** https://jamdanie.github.io/resilience-routes/

## V5 highlights

- Animated simulated ships, cargo aircraft, freight trains, and trucks
- Global and regional logistics routes
- Ports, airports, rail, warehouses, power, fuel, water, and logistics data
- Hospitals, schools, emergency operations centers, cloud infrastructure, and large gatherings
- Cyber threats, AI-enabled social engineering, infrastructure anomalies, weather, and crowd risk
- Planning phase with limited preparedness investments
- Live operational event feed
- Selectable shipments, infrastructure, threats, and points of interest
- Command decisions that affect health, capacity, delay, resilience, confidence, and score
- Logistics, cyber, and public-safety advisor perspectives
- After-action review and print-to-PDF support
- Contributor attribution and government learning resources
- GitHub Pages compatible: no database, account, API key, or paid tracker required

## Important limitation

All positions, routes, movements, threats, incidents, crowd sizes, and system conditions are fictional and generated locally for educational gameplay. The application does not use FlightRadar24, AIS, live aircraft, live vessel, emergency-warning, law-enforcement, or intelligence feeds.

## Local development

```powershell
npm ci
npm run build
npm run dev
```

## Apply to the existing repository

Copy this package's contents into the root of the existing local `resilience-routes` project.

Recommended branch workflow:

```powershell
git checkout -b feature/v5-simulator
git add .
git commit -m "Build Version 5 living operations simulator"
git push -u origin feature/v5-simulator
```

After reviewing the branch, merge it into `main`. GitHub Pages will deploy to the same live URL.
