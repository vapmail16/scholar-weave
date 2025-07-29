# Configuration Files Structure

This directory contains all configuration files for the ScholarWeave project, organized by their scope and purpose.

## 📁 Directory Structure

```
config/
├── root/           # Project-wide configuration files
├── frontend/       # Frontend-specific configuration
├── backend/        # Backend-specific configuration
└── README.md       # This documentation file
```

## 🔧 Configuration Files by Category

### Root Configuration (`config/root/`)
Project-wide configuration files that apply to the entire project:

| File | Purpose | Description |
|------|---------|-------------|
| `package.json` | Root dependencies | Main project dependencies and scripts |
| `package-lock.json` | Dependency lock | Exact versions of all dependencies |
| `bun.lockb` | Bun lock file | Alternative package manager lock file |
| `.gitignore` | Git ignore rules | Files to exclude from version control |
| `.dockerignore` | Docker ignore rules | Files to exclude from Docker builds |

### Frontend Configuration (`config/frontend/`)
React + TypeScript frontend configuration:

| File | Purpose | Description |
|------|---------|-------------|
| `package.json` | Frontend dependencies | React, Vite, shadcn/ui dependencies |
| `package-lock.json` | Dependency lock | Exact versions of frontend dependencies |
| `tsconfig.json` | TypeScript config | Base TypeScript configuration |
| `tsconfig.app.json` | App TypeScript config | Application-specific TS config |
| `tsconfig.node.json` | Node TypeScript config | Node.js environment TS config |
| `vite.config.ts` | Vite configuration | Build tool and dev server config |
| `tailwind.config.ts` | Tailwind CSS config | CSS framework configuration |
| `postcss.config.js` | PostCSS config | CSS processing configuration |
| `components.json` | shadcn/ui config | UI component library configuration |
| `eslint.config.js` | ESLint config | Code linting rules |
| `index.html` | HTML template | Main HTML entry point |

### Backend Configuration (`config/backend/`)
Node.js + Express backend configuration:

| File | Purpose | Description |
|------|---------|-------------|
| `package.json` | Backend dependencies | Express, Prisma, Mongoose dependencies |
| `package-lock.json` | Dependency lock | Exact versions of backend dependencies |
| `tsconfig.json` | TypeScript config | Backend TypeScript configuration |
| `jest.config.js` | Jest config | Testing framework configuration |
| `.gitignore` | Git ignore rules | Backend-specific ignore rules |
| `env.example` | Environment template | Example environment variables |

## 🔗 Symbolic Links

To maintain compatibility with build tools and package managers, symbolic links are created from the original locations to the centralized config files:

### Root Level Links
```bash
package.json → config/root/package.json
package-lock.json → config/root/package-lock.json
.gitignore → config/root/.gitignore
.dockerignore → config/root/.dockerignore
```

### Frontend Links
```bash
frontend/package.json → config/frontend/package.json
frontend/tsconfig.json → config/frontend/tsconfig.json
frontend/vite.config.ts → config/frontend/vite.config.ts
# ... and so on
```

### Backend Links
```bash
backend/package.json → config/backend/package.json
backend/tsconfig.json → config/backend/tsconfig.json
backend/jest.config.js → config/backend/jest.config.js
# ... and so on
```

## 🛠️ Working with Configuration Files

### Adding New Configuration Files

1. **Determine the scope**: Is it project-wide, frontend-specific, or backend-specific?
2. **Place in appropriate directory**: `config/root/`, `config/frontend/`, or `config/backend/`
3. **Create symbolic link**: Link from the expected location to the config file
4. **Update documentation**: Add the new file to this README

### Example: Adding a New Frontend Config

```bash
# 1. Create the config file in the centralized location
touch config/frontend/new-config.json

# 2. Create a symbolic link
cd frontend && ln -s ../config/frontend/new-config.json new-config.json

# 3. Update this README with the new file
```

### Modifying Configuration Files

When modifying configuration files:

1. **Edit the centralized file**: Always edit files in the `config/` directory
2. **Test the changes**: Ensure the symbolic links work correctly
3. **Update documentation**: If adding new options, document them here

### Environment-Specific Configuration

For environment-specific configurations:

1. **Development**: Use files in `config/` directory
2. **Production**: Consider using environment variables or separate config files
3. **Testing**: Use test-specific configurations in `config/backend/` for Jest

## 📋 Configuration Best Practices

### 1. **Keep Configurations Minimal**
- Only include necessary settings
- Use sensible defaults
- Document non-obvious configurations

### 2. **Version Control**
- Include all configuration files in version control
- Use `.env` files for sensitive data (not in version control)
- Provide `.env.example` files for reference

### 3. **Consistency**
- Use consistent naming conventions
- Follow established patterns
- Keep related configurations together

### 4. **Documentation**
- Document all configuration options
- Explain the purpose of each file
- Provide examples where helpful

## 🔍 Troubleshooting

### Common Issues

#### 1. **Symbolic Link Errors**
If symbolic links are broken:
```bash
# Recreate the links
rm frontend/package.json
ln -s ../config/frontend/package.json frontend/package.json
```

#### 2. **Build Tool Issues**
If build tools can't find configuration files:
```bash
# Check if symbolic links exist
ls -la frontend/package.json
ls -la backend/package.json

# Recreate if missing
cd frontend && ln -s ../config/frontend/package.json package.json
cd backend && ln -s ../config/backend/package.json package.json
```

#### 3. **Package Manager Issues**
If npm/yarn can't find dependencies:
```bash
# Check if package.json links are correct
cat frontend/package.json
cat backend/package.json

# Reinstall if needed
cd frontend && npm install
cd backend && npm install
```

### Getting Help

1. **Check symbolic links**: `ls -la` to see if links are correct
2. **Verify file locations**: Ensure files exist in `config/` directory
3. **Check permissions**: Ensure files are readable
4. **Review documentation**: Check this README for guidance

## 📈 Future Enhancements

### Planned Improvements
1. **Configuration Validation**: Add schema validation for config files
2. **Environment Detection**: Automatic config selection based on environment
3. **Configuration UI**: Web interface for managing configurations
4. **Backup System**: Automatic backup of configuration changes

### Best Practices for New Configurations
1. **Use TypeScript**: Prefer `.ts` over `.js` for type safety
2. **Add Comments**: Document complex configurations
3. **Follow Conventions**: Use established naming patterns
4. **Test Changes**: Verify configurations work in all environments

## ✅ Configuration Checklist

- [x] All configuration files moved to `config/` directory
- [x] Symbolic links created for compatibility
- [x] Documentation updated
- [x] Build tools tested
- [x] Package managers verified
- [x] Environment files organized

The configuration structure is now centralized and well-organized! 🎉 