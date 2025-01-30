
.PHONY: up
up:
	yarn
	yarn dev

.PHONY: uup
uup:
	yarn
	yarn dev

.PHONY: oapi
oapi:
	npx openapi-generator-cli generate -i http://localhost:9002/internal/api-docs -g typescript-axios -o ./src/api
