# RacePrep Agent Setup Guide
*Simple 3-agent system for efficient development*

## 🤖 **Agent Configuration**

### **1. Frontend Developer Agent**
```
Name: frontend-developer
Description: React Native/TypeScript UI specialist for RacePrep triathlon app. Builds dashboard widgets, modal components, and mobile-optimized interfaces following glassmorphism design patterns with NativeWind/Tailwind CSS.
```

**When to use**:
- Building new React Native components
- Dashboard widget enhancements
- UI/UX improvements
- Mobile responsiveness fixes
- Styling with NativeWind/Tailwind

**Example prompt**:
```
"Create a new race analytics dashboard widget that shows performance trends over the last 6 months. Use the existing glassmorphism design with charts showing swim/bike/run improvements. Follow the pattern of PerformanceOverviewWidget.tsx."
```

---

### **2. Backend Developer Agent**
```
Name: backend-developer
Description: Node.js/Express API and Supabase database specialist for RacePrep. Handles server endpoints, database operations, authentication, and third-party integrations (Strava, RunSignup, OpenWeatherMap).
```

**When to use**:
- Adding new API endpoints
- Database schema changes
- Supabase operations
- Third-party API integrations
- Authentication features

**Example prompt**:
```
"Add API endpoints to support race analytics data. Create database queries to fetch user race results with performance trends over time periods. Include proper error handling and data validation."
```

---

### **3. Code Reviewer Agent**
```
Name: code-reviewer
Description: Quality assurance specialist for RacePrep. Reviews code for TypeScript best practices, runs Jest tests, ensures mobile performance, validates security, and checks deployment readiness.
```

**When to use**:
- Code quality review
- Testing and coverage
- Performance optimization
- Security audits
- Pre-deployment checks

**Example prompt**:
```
"Review the new race analytics feature for code quality, add comprehensive Jest tests, check mobile performance, and ensure it follows RacePrep's TypeScript conventions."
```

---

## 🔄 **Simple Workflow Examples**

### **Example 1: Basic Frontend Enhancement**
1. **You**: "I want to improve the weather widget with better mobile layout"
2. **frontend-developer**: Enhances WeatherWidget.tsx with improved mobile responsiveness
3. **code-reviewer**: Reviews changes and tests on different screen sizes

### **Example 2: New Feature Development**
1. **You**: "Add a weekly training summary widget to the dashboard"
2. **backend-developer**: Creates API endpoints for weekly training data
3. **frontend-developer**: Builds new TrainingSummaryWidget component
4. **code-reviewer**: Tests integration and ensures quality

### **Example 3: Bug Fix and Enhancement**
1. **You**: "Fix Strava sync issues and add progress indicators"
2. **backend-developer**: Debugs and enhances Strava integration
3. **frontend-developer**: Adds loading states and progress UI
4. **code-reviewer**: Validates fixes and adds regression tests

---

## 🎯 **Best Practices for Agent Usage**

### **Starting Simple**
- **First use**: Try frontend-developer for a small UI enhancement
- **Second use**: Add backend-developer for an API change
- **Third use**: Include code-reviewer for comprehensive quality check

### **Clear Communication**
- Be specific about requirements and context
- Reference existing files/components when possible
- Mention mobile-first design requirements
- Specify which RacePrep patterns to follow

### **Iterative Development**
- Start with one agent for initial implementation
- Add second agent for related changes
- Use code-reviewer for final quality assurance
- Build complexity gradually

---

## 📋 **Current RacePrep Context**

### **Key Technologies**
- **Frontend**: React Native + TypeScript + NativeWind
- **Backend**: Node.js/Express + Supabase PostgreSQL
- **Testing**: Jest + React Native Testing Library
- **APIs**: Strava, RunSignup, OpenWeatherMap

### **Important Files**
- `src/components/WebDashboard.tsx` - Main dashboard
- `src/components/dashboard/` - Dashboard widgets
- `server/server.js` - API endpoints
- `src/services/supabase.ts` - Database operations

### **Design Patterns**
- Glassmorphism UI with backdrop blur
- Mobile-first responsive design
- TypeScript interfaces for type safety
- Modular widget architecture

---

## 🚀 **Getting Started**

### **Your First Agent Task**
Try this simple enhancement to get comfortable:

```
"frontend-developer: Enhance the PerformanceOverviewWidget to show a small chart/graph for the training time trend over the last 7 days. Keep the existing design style and add it below the current metrics."
```

This will help you:
- See how agents work with existing code
- Learn the communication style
- Understand the output quality
- Build confidence with the system

### **Expanding Your Usage**
As you get comfortable:
1. **Week 1**: Frontend-only enhancements
2. **Week 2**: Add backend agent for API changes
3. **Week 3**: Include code-reviewer for quality
4. **Week 4**: Try multi-agent coordination

---

## 💡 **Pro Tips**

- **Reference existing patterns**: "Follow the style of WeatherWidget.tsx"
- **Be specific about scope**: "Only modify the dashboard, don't change navigation"
- **Mention testing needs**: "Include Jest tests for the new component"
- **Consider mobile**: "Ensure it works well on mobile screens"
- **Think about data**: "Use existing Supabase queries where possible"

---

*This setup gives you powerful development assistance while keeping complexity manageable as you learn agent collaboration patterns.*