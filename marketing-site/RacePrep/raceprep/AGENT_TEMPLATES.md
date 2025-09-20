# Agent Description Templates - Quick Reference

## 🔗 **Copy-Paste Agent Descriptions**

### **Frontend Developer Agent**
```
React Native/TypeScript UI specialist for RacePrep triathlon app. Builds dashboard widgets, modal components, and mobile-optimized interfaces following glassmorphism design patterns with NativeWind/Tailwind CSS.
```

### **Backend Developer Agent**
```
Node.js/Express API and Supabase database specialist for RacePrep. Handles server endpoints, database operations, authentication, and third-party integrations (Strava, RunSignup, OpenWeatherMap).
```

### **Code Reviewer Agent**
```
Quality assurance specialist for RacePrep. Reviews code for TypeScript best practices, runs Jest tests, ensures mobile performance, validates security, and checks deployment readiness.
```

---

## 🎯 **Example Starter Prompts**

### **For Frontend Agent**
```
"Enhance the PerformanceOverviewWidget to show a small chart/graph for the training time trend over the last 7 days. Keep the existing glassmorphism design style and add it below the current metrics. Follow the patterns used in other dashboard widgets."
```

### **For Backend Agent**
```
"Add API endpoints to support weekly training statistics. Create database queries to fetch user training data grouped by week for the last 3 months. Include proper error handling and follow existing API patterns in server.js."
```

### **For Code Reviewer Agent**
```
"Review the updated PerformanceOverviewWidget for code quality, TypeScript usage, and mobile performance. Add Jest tests for the new functionality and ensure it follows RacePrep's existing patterns."
```

---

## 📱 **Key Context for All Agents**

**Tech Stack**: React Native + TypeScript + NativeWind + Supabase + Node.js
**Design**: Glassmorphism with backdrop blur, mobile-first
**Testing**: Jest + React Native Testing Library
**APIs**: Strava, RunSignup, OpenWeatherMap integrations