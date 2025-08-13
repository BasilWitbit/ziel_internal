# Issue Reporting Guidelines

This document explains how to add issues in our GitHub project so they are **clear**, **consistent**, and **actionable**.

---

## 1. Required Fields for Every Issue

When creating an issue, always include the following:

### **Title**

- Keep it short but descriptive.
- Format: `[Short Description of Problem]`
- Example: `Pending Logs Modal Shows Duplicate Steps for Multiple Projects`

---

### **Severity**

Choose **one** of the following:

| Severity   | Meaning |
|------------|---------|
| **Blocker** | User cannot complete the intended task at all (feature fully broken or core part missing). No reasonable workaround. |
| **Risky**   | User can complete the task, but there’s a high chance of mistakes, bad data, or serious confusion. |
| **Annoyance** | Everything works correctly, but with extra effort, inefficiency, or cosmetic flaws. |

**Quick Check:**  

- Can the user complete the main goal?  
  - **No → Blocker**  
  - **Yes, but risky mistakes likely → Risky**  
  - **Yes, works fine but clunky/ugly → Annoyance**

---

### **Description**

- Briefly explain the problem.
- Mention the feature/page/component affected.

---

### **Steps to Reproduce**

- Write in a numbered list.
- Include all steps starting from a fresh login (unless irrelevant).
- Example:

```plaintext
1. Log in as a user with multiple projects and pending timelogs.
2. Ensure there are missed logs for 2 days.
3. Upon login, the Pending Logs modal automatically appears.
4. Observe duplication in steps.
