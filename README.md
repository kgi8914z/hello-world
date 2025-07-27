# Python Development with Cursor

This project is set up for Python development using Cursor IDE with all the essential tools and configurations.

## 🚀 Quick Start

### 1. Activate the Virtual Environment

```bash
# Activate the virtual environment
source venv/bin/activate

# On Windows (if using Git Bash or WSL)
# source venv/Scripts/activate
```

### 2. Install Dependencies

```bash
# Install all development dependencies
pip install -r requirements.txt
```

### 3. Run the Sample Code

```bash
# Run the main script
python src/main.py

# Or with arguments
python src/main.py Alice Bob Charlie
```

### 4. Run Tests

```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_main.py
```

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── __init__.py        # Package initialization
│   └── main.py            # Main application entry point
├── tests/                 # Test files
│   ├── __init__.py        # Test package initialization
│   └── test_main.py       # Tests for main module
├── venv/                  # Virtual environment (git-ignored)
├── .vscode/               # Cursor/VS Code settings
│   └── settings.json      # IDE configuration
├── .gitignore             # Git ignore rules
├── pyproject.toml         # Modern Python project configuration
├── requirements.txt       # Project dependencies
└── README.md              # This file
```

## 🛠️ Development Tools Included

- **Black**: Code formatting
- **Flake8**: Linting and style checking
- **MyPy**: Static type checking
- **isort**: Import sorting
- **pytest**: Testing framework
- **coverage**: Code coverage analysis

## 💡 Cursor IDE Features

### Code Intelligence
- **Auto-completion**: Intelligent code completion with type hints
- **Go to Definition**: Navigate to function/class definitions with Ctrl+Click
- **Find References**: Find all usages of functions/variables
- **Refactoring**: Rename symbols across the project

### AI-Powered Features
- **AI Chat**: Ask questions about your code using Ctrl+L
- **Code Generation**: Generate code snippets and functions
- **Code Explanation**: Get explanations for complex code blocks
- **Bug Detection**: AI-powered bug detection and suggestions

### Testing Integration
- **Test Discovery**: Automatically discovers and runs pytest tests
- **Test Runner**: Run tests directly from the IDE
- **Coverage Visualization**: See code coverage inline

## 🔧 Common Commands

```bash
# Format code with Black
black src/ tests/

# Check code style with Flake8
flake8 src/ tests/

# Type check with MyPy
mypy src/

# Sort imports with isort
isort src/ tests/

# Run all quality checks
black src/ tests/ && isort src/ tests/ && flake8 src/ tests/ && mypy src/ && pytest
```

## 📝 Tips for Python Development in Cursor

1. **Use Type Hints**: Add type hints to your functions for better IDE support
2. **Write Tests First**: Follow TDD principles for better code quality
3. **Use AI Chat**: Ask Cursor's AI for help with complex problems
4. **Leverage Code Actions**: Use Ctrl+. for quick fixes and refactoring
5. **Use the Command Palette**: Ctrl+Shift+P for quick access to commands

## 🎯 Next Steps

1. Install the Python extension for Cursor (if not already installed)
2. Configure your Python interpreter to use the virtual environment
3. Start coding your project in the `src/` directory
4. Write tests in the `tests/` directory
5. Use Cursor's AI features to accelerate your development

Happy coding! 🐍✨
