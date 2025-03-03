
.PHONY: up
up:
	#nvm use 20.18.2
	yarn
	yarn dev

.PHONY: uup
uup:
	#nvm use 20.18.2
	yarn
	yarn dev

.PHONY: oapi
oapi:
	yarn openapi-generator-cli generate
