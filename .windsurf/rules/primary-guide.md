---
trigger: always_on
---

### 🔄 Project Awareness & Context

- **Always read** `PLANNING.md` at the start of a new conversation to understand the project's architecture, goals, style, and constraints.

- **Check** `TASK.md` before starting a new task. If the task isn't listed, add it with a brief description and today's date.

- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

### 🧱 Code Structure & Modularity

- **Never create a file longer than 500 lines of code**. If a file approaches this limit, refactor by splitting it into modules or helper files.

- **Organize code into clearly separated modules**, grouped by feature or responsibility.

- **Maintain separation of concerns** between frontend, backend, and database logic.

- **Follow the appropriate design patterns** for the tech stack being used (MVC, component-based, etc.).

### 🧪 Testing & Reliability

- **Write unit tests for new features** using the appropriate testing framework for your tech stack.

- **After updating any logic**, check whether existing unit tests need to be updated.

- **Tests should live in a dedicated testing directory** mirroring the main app structure.

- Include at least:

- 1 test for expected use

- 1 edge case

- 1 failure case

- **Consider adding integration tests** for critical user flows.

### ✅ Task Completion

- **Mark completed tasks in** `TASK.md` immediately after finishing them.

- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.

### 📎 Style & Conventions

- **Follow the established style guide** for each language in your stack:

- JavaScript/TypeScript: ESLint/Prettier with appropriate config

- CSS: Use consistent methodology (BEM, CSS Modules, Tailwind, etc.)

- Backend: Follow conventions of your chosen framework/language

- **Use appropriate type systems** where available (TypeScript, PropTypes, etc.).

- **Document component props and API endpoints** thoroughly.

- **Use consistent code formatting** across the entire codebase.

### 📚 Documentation & Explainability

- **Update** `README.md` when new features are added, dependencies change, or setup steps are modified.

- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.

- **Document your API endpoints** with request/response examples.

- When writing complex logic, **add an inline comment explaining the why**, not just the what.

- **Create/update diagrams** for complex workflows or architecture changes.

### 🔧 Frontend Specifics

- **Make components reusable and composable** when possible.

- **Ensure responsive design** across different screen sizes.

- **Follow accessibility best practices** (semantic HTML, ARIA attributes, keyboard navigation).

- **Implement proper error handling** and loading states in UI.

- **Manage state appropriately** using the recommended patterns for your framework.

### 🖥️ Backend Specifics

- **Implement proper error handling and validation** for all inputs.

- **Use environment variables** for configuration and secrets.

- **Write clear and consistent API contracts**.

- **Implement appropriate security measures** (input validation, authentication, authorization).

- **Optimize database queries** and consider indexing for performance.

### 📱 Full-Stack Considerations

- **Ensure consistent data models** between frontend and backend.

- **Implement proper error handling** across the entire stack.

- **Consider performance optimizations** at all levels.

- **Use appropriate tools for cross-browser/device testing**.

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**

- **Never hallucinate libraries or functions** – only use known, verified packages and frameworks.

- **Always confirm file paths and module names** exist before referencing them in code or tests.

- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.

- **Provide explanations** for architectural decisions and pattern implementations.
