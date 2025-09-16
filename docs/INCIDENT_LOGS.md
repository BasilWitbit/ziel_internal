# Incident Logs – Ziel Internal ERP

---

## Table of Contents

- [Summary](#summary)
- [Format Standard](#format-standard)
- [Example Incident](#example-incident)
- [Incidents](#incidents)
  - [2025-08-18 – Logs Sumission Failure](#2025-08-19--Logs-submission-failure)
  - [Add new incidents here]

---

## Summary

The purpose of this document is to maintain a chronological record of **production incidents** for the Ziel Internal ERP.  
Keeping structured incident logs helps us:

- Track issues over time
- Improve accountability (who reported, who fixed, when)
- Identify recurring problems and root causes
- Strengthen our **post-mortem culture** by ensuring lessons are not lost

This file acts as a **single source of truth** for incidents, independent of commit messages or tickets.

---

## Format Standard

We follow a consistent structure inspired by **IEEE-style documentation principles** (similar to IEEE 830 for SRS but adapted for incident tracking).

Each incident must include the following sections:

1. **Incident Metadata**
   - Title / short description
   - Date & Time (with timezone)
   - Reported by
   - Affected users/systems

2. **Issue Description**
   - What happened, symptoms observed

3. **Root Cause**
   - Technical explanation of why it happened

4. **Resolution**
   - Fix applied (include commit / PR link)

5. **Impact**
   - Who/what was affected, business/technical impact

6. **Preventive Measures**
   - Steps to avoid recurrence (tests, monitoring, processes)

---

## Example Incident

### Incident: Login Timeout Error

**Date:** 2025-07-05  
**Time:** 11:45 PKT  
**Reported by:** Ali (Support Team)  
**Affected system:** Authentication service  

#### Issue

Users experienced repeated timeouts while logging in.

#### Root Cause

Connection pool in the auth service exhausted due to missing cleanup of idle sessions.

#### Resolution

- Increased pool size and patched idle cleanup (commit: `a1b2c3`).  
- Deployed fix at 12:15 PKT.

#### Impact

- 40% of users unable to log in for ~30 minutes.  
- No data loss.

#### Preventive Measures

- Added alerting on connection pool usage.  
- Scheduled load testing for authentication endpoints.

---

## Incidents

### 2025-08-18 – Logs Submission Failure

**Date:** 2025-08-18  
**Time:** 18:30 PKT  
**Reported by:** Husnain Shakir  
**Affected users:** User attempting to submit logs at the day end.  

#### Issue

A certain user was unable to submit their logs , after clicking the submit logs button an error poped up saying "something went wrong"

https://github.com/BasilWitbit/ziel_internal/issues/43

#### Root Cause

In supabase the timetaken for a task had type int but the user was trying to put in time taken in decimals which required it to be float.

#### Resolution

- Made the timetaken type float so that it accepts decimal values aswell.   

#### Impact

- 4 failed submission attempts between 18:30–19:00.  

#### Preventive Measures

- Added try...catch handling in the Edge Function to capture and log errors gracefully, instead of generic “something went wrong” messages.
