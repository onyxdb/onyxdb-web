
.PHONY: up
up:
	#nvm use 20.18.2
	yarn
	yarn dev -p 3002

.PHONY: uup
uup:
	#nvm use 20.18.2
	yarn
	yarn dev -p 3002

.PHONY: oapi
oapi:
	yarn openapi-generator-cli generate
