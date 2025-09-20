# Project Best Practices

## 1. Project Purpose
3-Click Payroll is a full-stack web application for managing payroll operations. It consists of a FastAPI backend (`3-click-pr-be`) that provides REST APIs for authentication and worker management, and a React frontend (`3-click-pr-fe`) built with TypeScript and Vite. The system supports multiple worker types (direct employees, contract workers, and agent workers) with role-based access control for admin users.

## 2. Project Structure

### Backend (`3-click-pr-be/`)
- `app/main.py` - FastAPI application entry point with CORS and router configuration
- `app/routes/` - API route handlers organized by domain (auth, workers)
- `app/models.py` - Pydantic models for request/response validation and typing
- `app/db.py` - MongoDB connection management and database initialization
- `app/config.py` - Environment configuration using python-dotenv
- `app/security.py` - Authentication and authorization utilities
- `requirements.txt` - Python dependencies

### Frontend (`3-click-pr-fe/`)
- `src/features/` - Feature-based organization (auth, dashboard, workers)
- `src/state/` - Global state management (AuthContext)
- `src/lib/` - Shared utilities (useHashLocation for routing)
- `src/App.tsx` - Main application with lazy-loaded route components and hash-based routing
- `tests/features/` - Test structure mirrors feature organization
- Configuration files: `vite.config.ts`, `tsconfig.json`, `package.json`
- `src/index.css` - Global styles and Tailwind CSS imports
- `src/main.tsx` - Application entry point with AuthProvider wrapper

## 3. Test Strategy

### Framework
- Frontend: Test structure exists under `tests/features/` but no specific framework configured yet
- Backend: No explicit test framework configured in requirements.txt

### Organization
- Tests should mirror the feature-based structure: `tests/features/workers/`, `tests/features/auth/`
- Follow the same naming conventions as source files

### Guidelines
- Unit tests for individual components and utility functions
- Integration tests for API endpoints and database operations
- Mock external dependencies (database, API calls) in unit tests

## 4. Code Style

### TypeScript/React (Frontend)
- Use TypeScript strict mode with proper typing
- Functional components with hooks (useState, useEffect, useContext)
- Custom hooks for reusable logic (e.g., `useHashLocation`, `useAuth`)
- Lazy loading for route components using `React.lazy()`
- CSS Modules for component styling (`.module.css` files)
- Environment variables prefixed with `VITE_`

### Python (Backend)
- Use Pydantic models for all request/response validation
- Async/await pattern for all database operations and route handlers
- Type hints for function parameters and return values
- Environment variables loaded via `python-dotenv`
- Global database client management with proper initialization/cleanup

### Naming Conventions
- **Files**: PascalCase for React components (`AddWorker.tsx`), snake_case for Python modules (`workers.py`)
- **Functions**: camelCase in TypeScript, snake_case in Python
- **Variables**: camelCase in TypeScript, snake_case in Python
- **Constants**: UPPER_SNAKE_CASE for environment variables
- **Types**: PascalCase for TypeScript types and Pydantic models

### Error Handling
- Frontend: Try-catch blocks with user-friendly error messages
- Backend: HTTPException with appropriate status codes and detail messages
- Database errors: Handle DuplicateKeyError and OperationFailure specifically

## 5. Common Patterns

### Authentication
- JWT tokens stored in localStorage with Bearer token authorization
- Context-based auth state management with `AuthProvider`
- Route protection based on authentication status
- Token validation middleware in backend routes

### Database Operations
- MongoDB with Motor (async driver)
- Unique indexes for data integrity (e.g., admin email, worker email per type)
- ObjectId conversion for MongoDB document IDs
- Sparse indexes for optional fields

### API Design
- RESTful endpoints with appropriate HTTP methods
- Consistent response models using Pydantic
- Query parameters for filtering (e.g., email existence checks)
- Authorization header validation for protected routes

### Form Handling
- Controlled components with individual state for each field
- Real-time validation with visual feedback
- Debounced API calls for existence checks
- Form reset functionality after successful submission

## 6. Do's and Don'ts

### Do's
- Use TypeScript strict mode and provide proper type annotations
- Implement proper error boundaries and error handling
- Use environment variables for configuration
- Normalize email addresses (lowercase, trim) before storage/comparison
- Use unique database indexes to prevent duplicate data
- Implement proper loading states and user feedback
- Use lazy loading for route components to improve performance
- Follow the established folder structure and naming conventions

### Don'ts
- Don't store sensitive data in localStorage beyond tokens
- Don't bypass TypeScript type checking with `any`
- Don't hardcode API URLs or configuration values
- Don't forget to handle database connection cleanup
- Don't create routes without proper authentication checks
- Don't submit forms without proper validation
- Don't use synchronous database operations in async contexts

## 7. Tools & Dependencies

### Backend
- **FastAPI** - Modern Python web framework with automatic API documentation
- **Motor** - Async MongoDB driver for Python
- **Pydantic** - Data validation using Python type annotations
- **python-jose** - JWT token handling
- **passlib** - Password hashing with bcrypt
- **python-dotenv** - Environment variable management
- **email-validator** - Email validation utilities
- **uvicorn** - ASGI server for running FastAPI applications

### Frontend
- **React 19** - UI library with hooks and functional components
- **TypeScript** - Static type checking
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Scoped styling

### Development
- **ESLint** - JavaScript/TypeScript linting
- **Autoprefixer** - CSS vendor prefixing

## 8. Other Notes

### For LLM Code Generation
- Always include proper TypeScript types when creating new components
- Follow the established pattern of feature-based organization
- Use the existing `AuthContext` for authentication state
- Implement proper loading states and error handling in forms
- Use the `useHashLocation` hook for navigation instead of React Router
- Follow the established API patterns with proper Pydantic models
- Include proper database indexes when adding new collections or fields
- Use the existing CSS module patterns for styling
- Implement proper validation both client-side and server-side
- Use `React.lazy()` for route-level code splitting and wrap with `Suspense`
- Follow the established routing pattern in `App.tsx` with path-based conditional rendering
- Use FastAPI's startup/shutdown events for database lifecycle management

### Special Constraints
- Hash-based routing instead of browser history API
- MongoDB as the primary database with specific indexing requirements
- CORS configuration allows multiple localhost origins for development
- Email uniqueness is scoped per admin and worker type, not globally
- Worker types have conditional fields (company name for contracts/agents, agency fee for agents only)