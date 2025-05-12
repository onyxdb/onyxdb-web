
.PHONY: up
up:
	#nvm use 20.18.2
	yarn build
	yarn start -p 3002

.PHONY: uup
uup:
	#nvm use 20.18.2
	yarn
	yarn dev -p 3002


.PHONY: upp
upp:
	#nvm use 20.18.2
	yarn
	__NEXT_TEST_MODE=true yarn build

.PHONY: oapi
oapi:
	yarn openapi-generator-cli generate
