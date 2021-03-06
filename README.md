# Submission interface frontend

![Unit tests and coverage](https://github.com/CSCfi/metadata-submitter-frontend/workflows/Unit%20tests%20and%20coverage/badge.svg)
![Code style check](https://github.com/CSCfi/metadata-submitter-frontend/workflows/Code%20style%20check/badge.svg)
![Static type check](https://github.com/CSCfi/metadata-submitter-frontend/workflows/Static%20type%20check/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/CSCfi/metadata-submitter-frontend/badge.svg?branch=master)](https://coveralls.io/github/CSCfi/metadata-submitter-frontend?branch=master)

Frontend for CSCs Sensitive Data Archive metadata submitter. [See backend for more info](https://github.com/CSCfi/metadata-submitter/)

## Install and run

Requirements:

- Node 14+
- Optionally Docker + docker-compose
- Backend

Install backend from [backend repository](https://github.com/CSCfi/metadata-submitter/).

Install and run frontend either with:

- Docker by running `docker-compose up --build` (add `-d` flag to run container in the background).
  - By default, frontend tries to connect to docker-container running the backend. Feel free to modify `docker-compose.yml` if you want to use some other setup.
- Local node setup by running `npm install` followed with `npm start`.

After installing and running, frontend can be found from `http://localhost:3000`.

## Tests

Run Jest-based tests with `npm test`. Check code formatting and style errors with `npm run lint:check` and fix them with `npm run lint`. Respectively for formatting errors in json/yaml/css/md -files, use `npm run format:check` or `npm run format`. Possible type errors can be checked with `npm run flow`.

End-to-end tests can be run with `npx cypress open`.

We're following recommended settings from eslint, react and prettier -packages with couple exceptions, which you can find in `.eslintrc` and `.prettierrc`. Linting, formatting and testing are also configured for you as a git pre-commit, which is recommended to use to avoid fails on CI pipeline.

## Building

Running `npm run build` builds the app for production to the `build` folder.

## Architecture

See [architecture](architecture.md).

## License

Metadata submission interface is released under `MIT`, see [LICENSE](LICENSE).

## Contributing

If you want to contribute to a project and make it better, your help is very welcome. For more info about how to contribute, see [CONTRIBUTING](CONTRIBUTING.md).
