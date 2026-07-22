# Security policy

This project is designed as a static educational site.

## Do not commit

- passwords
- API keys
- tokens
- private research files
- personal information
- `.env` files
- database connection strings

## Reporting a problem

Open a private security advisory in the GitHub repository when possible. Do not post credentials or exploitable details in a public issue.

## Current security boundary

The first milestone has no SQL database, user accounts, payment handling, or server-side storage. This removes SQL injection from the current attack surface. It does not remove the need to review dependencies, links, content rendering, and deployment configuration.
