# Pull Request

## Summary

Describe what changed and why.

## Scope

Which area does this affect?

- [ ] CLI
- [ ] Use cases
- [ ] Services
- [ ] Repositories
- [ ] Domain
- [ ] Integrations
- [ ] Tests
- [ ] Documentation
- [ ] Examples
- [ ] Other:

## Architecture Checklist

- [ ] CLI files only parse arguments, call use cases, and render safe output.
- [ ] Business logic remains in services or use cases.
- [ ] Supabase query syntax remains in repositories.
- [ ] Domain code remains pure where applicable.
- [ ] Provider behavior remains behind provider boundaries.
- [ ] ATS behavior remains behind strategy/service boundaries.
- [ ] Analytics remains read-only.

## Test Commands

Run the required gates before review:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Results:

```text

```

## Documentation

- [ ] README updated if needed.
- [ ] Architecture docs updated if needed.
- [ ] Database docs updated if needed.
- [ ] Test docs updated if needed.
- [ ] Progress or audit report updated if needed.
- [ ] Not applicable.

## Security Checklist

- [ ] No credentials committed.
- [ ] No provider keys committed.
- [ ] No Supabase service role keys committed.
- [ ] No cookies committed.
- [ ] No browser session files committed.
- [ ] No screenshots containing personal data committed.
- [ ] No private generated artifacts committed.
- [ ] Logs and examples are sanitized.

## ATS Safety Checklist

- [ ] No final ATS submission behavior added.
- [ ] Human approval boundary remains mandatory.
- [ ] Live ATS behavior was not used in automated tests.
- [ ] Mock-first ATS safety remains intact.

## Production Resource Checklist

- [ ] No production resources touched.
- [ ] No production database writes.
- [ ] No production provider calls.
- [ ] No deployment performed.
- [ ] No GitHub push was performed by automation.

## Known Limitations

List any remaining limitations or follow-up work.
