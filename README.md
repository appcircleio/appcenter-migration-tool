# App Center Migration Tool

The App Center Migration Tool is a CLI utility designed to help App Center users seamlessly transfer their organizations, apps, and testing groups to Appcircle. This tool streamlines the migration process, ensuring a smooth transition between platforms.

## Table Of Contents

- [Installation Instructions](#installation-instructions)
- [Usage Guidelines](#usage-guidelines)
  - [Command List](#core-commands)
- [Environment Variables](#environment-variables)
- [Interactive Mode](#interactive-mode)

## Installation Instructions

To install the tool globally, simply launch:

```
npm install -g @appcenter-migration-tool
```

alternatively, you can install the tool locally:

```
npm install @appcenter-migration-tool
```

## Usage Guidelines

To get started :

1. Follow the [installation instructions](#installation-instructions)

2. Simply launch the command on your Terminal/Command Line

```
appcenter-migration-tool
```

> If you have installed it locally, you should run `npx appcenter-migration-tool`

3. Log in to your App Center and Appcircle accounts.

Below is the list of commands currently supported by appcenter-migration-tool tool:

### Core Commands

Run `appcenter-migration-tool [commandName] --help` to view a list of commands/subcommands in your terminal.

- [appcenter-migration-tool login](/docs/login/index.md)
- [appcenter-migration-tool organizations](/docs/organizations/index.md)
- [appcenter-migration-tool apps](/docs/apps/index.md)
- [appcenter-migration-tool distribution-groups](/docs/distribution-groups/index.md)

The commands follow this pattern:

```shell
appcenter-migration-tool <command> <subcommand> ... <subcommand> [options]
```

- Run `appcenter-migration-tool (-i, --interactive)` to proceed with the appcenter-migration-tool GUI

## Environment Variables

- `API_HOSTNAME`: Specifies the host where the App Center API endpoint is located.

- `APPCENTER_TOKEN`: App Center authentication token for API requests. Setting this avoids being
  prompted to authenticate and overrides any previously stored credentials.

- `AC_ACCESS_TOKEN`: Appcircle authentication token for API requests. Setting this avoids being
  prompted to authenticate and overrides any previously stored credentials.

- `AC_API_HOSTNAME`: Specifies the host where the Appcircle API endpoint is located.

- `AC_AUTH_HOSTNAME`: Specifies the host where your IAM (identity access management) server endpoint is located.

- `AC_PAT`: Appcircle Personal Access Token

## Interactive Mode

appcenter-migration-tool incorporates a GUI that allows users to interactively access its features. To view all features in interactive mode, execute the following command:

```
appcenter-migration-tool -i
```
