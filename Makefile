.PHONY: install build start clean lint

# Default target
all: install build

# Install dependencies
install:
	npm install

# Build the project
build:
	npm run build

# Start the server
start:
	npm start

# Clean build artifacts
clean:
	rm -rf build/
	rm -rf node_modules/

# Run linter
lint:
	npx eslint . --ext .ts

# Install and configure ESLint if not present
setup-lint:
	npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
	echo '{\n\
  "parser": "@typescript-eslint/parser",\n\
  "plugins": ["@typescript-eslint"],\n\
  "extends": [\n\
    "eslint:recommended",\n\
    "plugin:@typescript-eslint/recommended"\n\
  ]\n\
}' > .eslintrc.json

# Help target
help:
	@echo "Available targets:"
	@echo "  install     - Install dependencies"
	@echo "  build      - Build the project"
	@echo "  start      - Start the server"
	@echo "  clean      - Remove build artifacts"
	@echo "  lint       - Run linter"
	@echo "  setup-lint - Install and configure ESLint"
	@echo "  help       - Show this help message"
