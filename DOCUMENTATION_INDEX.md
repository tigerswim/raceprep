# RacePrep - Documentation Index

**Complete guide to all project documentation**

---

## 🚀 Getting Started (Read These First)

### 1. **QUICKSTART.md** ⭐ START HERE
**Purpose:** Fast setup and orientation for Claude Code in Zed
**Contains:**
- Project structure overview
- Phase 2 accomplishments summary
- Development setup instructions
- Database schema overview
- UI/UX patterns
- Common commands for Claude Code
- Pre-session checklist

**When to Read:** First time opening project, or returning after time away

---

### 2. **CONTEXT.md** ⭐ CRITICAL REFERENCE
**Purpose:** Complete technical context for AI assistants
**Contains:**
- Project vision and goals
- Current capabilities (all features)
- Technical architecture
- Database schema details
- Design system specifications
- Component patterns
- Security implementation
- Performance optimizations
- Known limitations
- Phase 3 recommendations
- Best practices

**When to Read:** Before building new features or making architectural decisions

---

### 3. **.claude-session-template.md** ⭐ SESSION STARTER
**Purpose:** Templates for starting new Claude Code sessions
**Contains:**
- Session starter prompt
- Common session types (bug fix, feature, refactor)
- Quick reference commands
- Code examples
- Pre-session checklist
- Common pitfalls
- Session cleanup guide

**When to Read:** At the start of every new coding session

---

## 📋 Planning & Roadmap

### 4. **DEVELOPMENT_PLAN.md**
**Purpose:** Detailed project roadmap and priorities
**Contains:**
- Current status (Phase 2 - 100% complete)
- Phase 1 completion summary
- Phase 2 completion details
- Phase 3 planning (not started)
- Phase 4 weather integration
- Time estimates for all work
- Files to modify for each feature

**When to Read:** Planning new features, understanding project priorities

---

### 5. **PHASE_2_COMPLETION_SUMMARY.md**
**Purpose:** Detailed summary of Phase 2 work (just completed)
**Contains:**
- What was delivered (6 dashboard widgets, race analytics)
- Files created/modified
- Key features and benefits
- Analytics capabilities
- Technical implementation details
- Metrics and statistics
- Why course database was removed
- Next steps (Phase 3)

**When to Read:** Understanding recent work, catching up after time away

---

## 📚 General Documentation

### 6. **README.md**
**Purpose:** General project overview
**Contains:**
- Project description and vision
- Feature list (comprehensive)
- Technology stack
- Installation instructions
- Project structure
- Development roadmap (high-level)
- Phase completion status

**When to Read:** Sharing project with others, general overview

---

### 7. **FEATURES.md** (if exists)
**Purpose:** Detailed feature specifications
**Contains:**
- Use cases for each feature
- User stories
- Acceptance criteria
- Feature dependencies

**When to Read:** Understanding specific feature requirements

---

## 🗄️ Database Documentation

### 8. **supabase/schema.sql**
**Purpose:** Complete database schema
**Contains:**
- All table definitions
- Column types and constraints
- Foreign key relationships
- Comments and documentation

**When to Read:** Understanding data model, creating migrations

---

### 9. **supabase/seed.sql**
**Purpose:** Sample development data
**Contains:**
- 5 sample Georgia courses
- Sample races for current year
- Weather data examples
- Course reviews (placeholders)

**When to Read:** Setting up local development database

---

### 10. **supabase/migrations/** (12 files)
**Purpose:** Database schema evolution
**Contains:**
- Chronological schema changes
- Migration 002: User settings
- Migration 003: Strava integration
- Migration 004: Enhanced Strava fields
- Migration 005: Training sessions schema fixes
- Migration 006: Dashboard features (most important)
- Migration 007-012: Race management, user preferences

**When to Read:** Creating new migrations, debugging database issues

---

## 🧪 Testing Documentation

### 11. **src/services/__tests__/**
**Purpose:** Service layer tests
**Contains:**
- Database operation tests
- API integration tests
- Test patterns and examples

**When to Read:** Writing new tests, debugging test failures

---

## 📖 Additional Files

### 12. **SUPABASE_SETUP.md** (if exists)
**Purpose:** Database setup instructions
**Contains:**
- Supabase project creation
- Environment variable setup
- Migration execution
- RLS policy setup

---

### 13. **.env.local**
**Purpose:** Environment configuration
**Contains:**
- Supabase credentials
- API keys (Strava, OpenWeatherMap, RunSignup)
- Configuration values

**When to Read:** Setting up project, adding new API integrations

---

### 14. **package.json**
**Purpose:** Project dependencies and scripts
**Contains:**
- npm scripts
- Dependencies
- DevDependencies
- Project metadata

**When to Read:** Understanding available scripts, adding dependencies

---

## 🎯 Quick Navigation Guide

### I want to...

**Start a new coding session**
→ Read `.claude-session-template.md`

**Understand the project**
→ Read `QUICKSTART.md` then `CONTEXT.md`

**Plan new features**
→ Read `DEVELOPMENT_PLAN.md`

**Understand recent work**
→ Read `PHASE_2_COMPLETION_SUMMARY.md`

**Set up the database**
→ Read `supabase/schema.sql` and migration files

**Write tests**
→ Review `src/services/__tests__/`

**Add API integration**
→ Review `src/services/apiIntegrations.ts` and `CONTEXT.md`

**Understand data model**
→ Read `supabase/schema.sql`

**Fix TypeScript errors**
→ Use `npx tsc --noEmit`, reference `CONTEXT.md` for patterns

**Deploy the app**
→ Read `README.md` deployment section

---

## 📊 Documentation Status

| Document | Status | Last Updated | Completeness |
|----------|--------|--------------|--------------|
| QUICKSTART.md | ✅ Complete | Sep 30, 2025 | 100% |
| CONTEXT.md | ✅ Complete | Sep 30, 2025 | 100% |
| .claude-session-template.md | ✅ Complete | Sep 30, 2025 | 100% |
| DEVELOPMENT_PLAN.md | ✅ Complete | Sep 30, 2025 | 100% |
| PHASE_2_COMPLETION_SUMMARY.md | ✅ Complete | Sep 30, 2025 | 100% |
| README.md | ✅ Complete | Sep 30, 2025 | 100% |
| supabase/schema.sql | ✅ Complete | Sep 25, 2025 | 100% |
| FEATURES.md | ❓ Unknown | - | - |
| SUPABASE_SETUP.md | ❓ Unknown | - | - |

---

## 🔄 Maintenance

### When to Update Documentation

**QUICKSTART.md:**
- When project structure changes
- When setup process changes
- When adding new major features

**CONTEXT.md:**
- When architectural decisions change
- When adding new patterns
- When tech stack changes
- After completing each phase

**DEVELOPMENT_PLAN.md:**
- When completing phases
- When priorities change
- When removing/adding features

**README.md:**
- When feature list changes
- When dependencies change
- When deployment process changes

**.claude-session-template.md:**
- When common workflows change
- When adding new command patterns

---

## 📝 Creating New Documentation

### Template for Session Notes
```markdown
# Session Notes - [DATE]

## Goals
- [Goal 1]
- [Goal 2]

## Accomplished
- [What was done]

## Files Modified
- [File list]

## Next Steps
- [What's next]

## Notes
- [Any important notes]
```

### Template for Feature Documentation
```markdown
# [Feature Name]

## Purpose
[Why this feature exists]

## User Story
As a [user type], I want [goal] so that [benefit]

## Implementation
- Component: [path]
- Service: [path]
- Database: [tables used]

## Usage
[How to use the feature]

## Testing
[How to test]
```

---

## 🎓 Reading Order for New Developers

1. **README.md** - Get the overview (10 min)
2. **QUICKSTART.md** - Understand structure and setup (20 min)
3. **CONTEXT.md** - Learn architecture and patterns (30 min)
4. **DEVELOPMENT_PLAN.md** - See roadmap (15 min)
5. **PHASE_2_COMPLETION_SUMMARY.md** - Recent work (10 min)
6. **.claude-session-template.md** - Session patterns (10 min)
7. **supabase/schema.sql** - Data model (20 min)

**Total time: ~2 hours** to be fully oriented

---

## 🤝 Contributing to Documentation

When adding documentation:
1. Update this index
2. Follow existing formatting
3. Include "When to Read" section
4. Add to Quick Navigation if applicable
5. Update Last Updated date

---

**This index is the single source of truth for all project documentation. Keep it updated!**

---

*Last Updated: September 30, 2025*
