# modi-api
## set of tests for REST api endpoints
 - uses chai/mocha for tests
 - mainly validates response codes
 - also checks responses against openAPI spec file at `/spec/swagger.yaml`
 - expects `username`, `password`, `baseUrl` to be set in `/test/env/config.js`
 - test results export via mochawesome to `/docs/index.html`
 - most recent test results viewable at https://matindow.github.io/modi-api