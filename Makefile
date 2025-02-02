
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
	yarn openapi-generator-cli generate
