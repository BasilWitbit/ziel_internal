# Changelog

All notable changes to this project will be documented in this file.  
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).  

---

## [1.0.0] - 2025-08-14

### Added

**Admin Features:**

- Login functionality.  
- Create and view users.  
- Create, view, and edit projects.  
- Create, view, and edit project team members.  
- View timelogs within a project.  

**User Features:**

- Login functionality.  
- Create first-time password after account creation.  
- Fill in Day End Logs for activity tracking.  

---
## [1.0.1] - 2025-08-20

### Added

**Admin Features:**

- Login functionality.  
- Create and view users.  
- Create, view, and edit projects.  
- Create, view, and edit project team members.  
- View timelogs within a project.   

**User Features:**

- Login functionality.  
- Create first-time password after account creation.  
- Fill in Day End Logs for activity tracking.  

**Fixed:**
- **Logs submission failure**: Resolved an issue where entering decimal values for “time taken” caused submission errors. Database type updated to `float` to support decimals.  
- Improved error handling in Edge Functions with `try...catch` to display meaningful error messages instead of generic “something went wrong.”  
---
