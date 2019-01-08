# Contributing to Dejavu

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:


1. Fork repo
2. Create a branch for the issue you are working on from one of the branches listed below depending on what you are intending to contribute to.
3. Submit a Pull Request against whichever branch applies.


#### Branches

`next` branch is the actively developer version of dejavu, a complete rewrite that's light-weight and performant and will replace the current dejavu codebase entirely.

`dev` branch is the current version of dejavu, all bug fixes to the current version go here.

`chrome-extension` branch is where we make chrome extension related changes.

`gh-pages` branch is for the hosted app, as well as for the version that runs on https://dashboard.appbase.io.


#### Local Installation

1. `git clone` your fork of https://github.com/appbaseio/dejavu
2. `git checkout next`
3. `git submodule init && git submodule sync && git submodule update --recursive --remote`
4. `yarn`
5. `yarn start` (open dejavu in the browser on http://localhost:1358/)

#### Generating an AppName and URL

1. Create an account here: https://dashboard.appbase.io
2. Follow instructions to create an appname.
3. Click through to newly created app
4. Click on the Credentials tab.
5. Copy Read-only or Admin API Key
6. Url is `https://${API_KEY}@scalr.api.appbase.io`

#### Local Build

#### `next` branch: Webpage

```sh
$ yarn start
```

#### `chrome-extension` branch: Chrome extension

```sh
$ yarn run build_chrome_extension
```

#### `gh-pages` branch: Github hosted pages

```sh
$ yarn run build_gh_pages
```
