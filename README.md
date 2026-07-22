# Resilience Routes: Supply Chain Quest

A lightweight browser game and team portfolio for learning about global supply-chain interdependence, infrastructure disruptions, hazard injects, resource sharing, and resilience.

## What the first version includes

- Pokémon-inspired top-down movement using WASD or arrow keys
- Five infrastructure nodes: port, rail, airport, digital logistics, and warehouse
- Hazard injects with why, how, when, and where explanations
- Easy, medium, and hard modes
- A quick-reference pull-out menu 
- A resilience score and after-action report
- Project, contributor, and learning-model sections  
- Static GitHub Pages hosting with no database or server credentials

## Local setup in VS Code  

1. Install Node.js 22 and Git.
2. Open this folder in VS Code.  
3. Open **Terminal > New Terminal**. 
4. Run: 

   ```bash  
   npm install
   npm run dev
   ```    

5. Open the local address printed in the terminal.
6. Stop the server with `Ctrl+C`. 
    
## Build check

```bash
npm run typecheck
npm run build
npm run preview
```  

## Create the GitHub repository

Use the repository name `resilience-routes` unless the team chooses another name.

```bash
git init
git add .
git commit -m "Create first playable supply chain prototype"
git branch -M main
git remote add origin https://github.com/jamdanie/resilience-routes.git
git push -u origin main
```

If you change the repository name, update `base` in `vite.config.ts` so it matches:

```ts
base: "/your-repository-name/",
```

## Turn on GitHub Pages

1. Open the repository on GitHub.
2. Select **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open the **Actions** tab and confirm the deployment completed.
6. The expected address is:

   `https://jamdanie.github.io/resilience-routes/`

## Team workflow

Do not have everyone edit `main` directly.

```bash
git checkout main
git pull
git checkout -b feature/short-description
```

After making a focused change:

```bash
git add .
git commit -m "Add rail corridor scenario content"
git push -u origin feature/short-description
```

Open a pull request into `main`, request one review, and merge after the build passes.

Suggested branches:

- `feature/game-loop`
- `feature/global-trade-content`
- `feature/infrastructure-nodes`
- `feature/hazard-injects`
- `feature/us-scale-scenario`
- `feature/rules-and-learning`
- `feature/visual-design`

## First milestone due-outs

### James Daniels — prototype and hazards

- Keep the repository working and deployable.
- Convert reviewed hazard research into scenario data.
- Create issues, labels, and the first milestone.
- Post the playable GitHub Pages link and a short status update.
- Do not add a database in the first milestone.

### Kristina-Marie Horton — game design and global trade

- Confirm the basic turn or interaction loop.
- Confirm win, loss, scoring, and difficulty rules.
- Provide three resource categories.  
- Provide one example trade dependency and one ally or trade agreement mechanic.
- Review whether the digital version still reflects the tabletop idea.

### A'zariah Turner — visual design

- Provide a small color palette and readable font direction.
- Provide a simple map sketch showing node placement and paths.
- Provide icons or original visual references for port, rail, airport, warehouse, cyber, flood, wildfire, and conflict.
- Confirm the visual approach is inspired by familiar top-down games without copying Pokémon art or protected assets.

### Lauren Hession — infrastructure

- Provide five infrastructure nodes.
- For each node, identify what it connects to and what fails next.
- Mark one node as a critical chokepoint.
- Provide one alternate route or redundancy option per node.

### Rachel Farlinger — content and writing

- Finalize the opening instructions.
- Write one concise why, how, when, and where entry for each node.
- Draft the rule summary, card wording, and after-action questions.
- Review all on-screen text for clarity and consistent terms.

### Exercises group / US scale role

- Choose one state or regional scenario.
- Provide the exercise audience and learning objective.
- Provide one inject timeline with three decision points.
- Provide two evaluation measures that can appear in the after-action report.

### Sunny Wescott — decision points for the team

- Confirm the primary audience: students, emergency managers, or both.
- Confirm the first scale: global trade bloc, U.S. region, or one state.
- Confirm whether the digital game is the main deliverable or a companion to the tabletop game.
- Confirm whether the final product should be suitable for an emergency-management toolkit.

## Current project status

| Area | Status | Notes |
|---|---|---|
| Overall concept | Green | Game, learning outcomes, infrastructure, resource sharing, and hazard injects are aligned. |
| Prototype foundation | Green | This repository supplies the first playable structure. |
| Visual direction | Yellow | Top-down direction exists; original team art and map choices are still due. |
| Game rules | Yellow | Basic digital loop exists; tabletop turn structure and win conditions need team approval. |
| Scenario content | Yellow | Starter examples exist; team research and source review are still needed. |
| Global trade model | Yellow | Role is assigned; resource and trade logic are due. |
| U.S. scale model | Red/Unassigned | A named owner and first state or region are still needed. |
| Playtesting | Red/Not started | Begin after the first team-reviewed scenario is merged. |

## Security rules

- Keep the first version static. It does not need SQL, a login, or a backend.
- Never commit passwords, API keys, private documents, or `.env` files.
- Do not add forms that store personal information.
- Use `textContent` for dynamic text instead of injecting untrusted HTML.
- Review Dependabot pull requests and run `npm audit`.
- Use original or licensed art, audio, and fonts.
- Keep GitHub Actions permissions limited to what deployment needs.
- Add a backend only after the team defines the data, access, privacy, and maintenance requirements.

## Content editing

Most scenario content is in:

`src/data/scenarios.json`

Each scenario includes:

- event
- why
- how
- when
- where
- question
- response options
- correct response
- takeaway
- base penalty

Keep each entry concise enough to read during play.

## Recommended next features

1. Add resource cards and limited inventory.
2. Add trade partner or ally cards.
3. Add an inject-card animation.
4. Add a state-level map mode.
5. Add a facilitator mode for emergency-management exercises.
6. Add downloadable after-action results without collecting personal data.
7. Add source notes for reviewed scenario claims.
