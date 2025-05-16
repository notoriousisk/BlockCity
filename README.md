# Telegram Mini Apps Vue Template

This template demonstrates how developers can implement a single-page
application on the Telegram Mini Apps platform using the following technologies
and libraries:

- [Vue](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)
- [@telegram-apps SDK](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x)
- [Vite](https://vitejs.dev/)

> The template was created using [npm](https://www.npmjs.com/). Therefore, it is
> required to use it for this project as well. Using other package managers, you
> will receive a corresponding error.

## Install Dependencies

If you have just cloned this template, you should install the project
dependencies using the command:

```Bash
npm install
```

## Scripts

This project contains the following scripts:

- `dev`. Runs the application in development mode.
- `dev:https`. Runs the application in development mode using locally created valid
  SSL-certificates.
- `build`. Builds the application for production.
- `lint`. Runs [eslint](https://eslint.org/) to ensure the code quality meets the required
  standards.
- `lint:fix`. Runs [eslint](https://eslint.org/) and fixes auto-fixable issues.
- `type-check`. Runs vue-tsc to check types.
- `deploy`. Deploys the application to GitHub Pages.

To run a script, use the `npm run` command:

```Bash
npm run {script}
# Example: npm run build
```

## Create Bot and Mini App

Before you start, make sure you have already created a Telegram Bot. Here is
a [comprehensive guide](https://docs.telegram-mini-apps.com/platform/creating-new-app)
on how to do it.

## Run

Although Mini Apps are designed to be opened
within [Telegram applications](https://docs.telegram-mini-apps.com/platform/about#supported-applications),
you can still develop and test them outside of Telegram during the development
process.

To run the application in the development mode, use the `dev` script:

```bash
npm run dev:https
```

> [!NOTE]
> As long as we use [vite-plugin-mkcert](https://www.npmjs.com/package/vite-plugin-mkcert),
> launching the dev mode for the first time, you may see sudo password request.
> The plugin requires it to properly configure SSL-certificates. To disable the plugin, use
> the `npm run dev` command.

After this, you will see a similar message in your terminal:

```bash
VITE v5.2.12  ready in 237 ms

➜  Local:   https://localhost:5173/vuejs-template
➜  Network: https://192.168.0.109:5173/vuejs-template

➜  press h + enter to show help
```

Here, you can see the `Local` link, available locally, and `Network` links
accessible to all devices in the same network with the current device.

To view the application, you need to open the `Local`
link (`https://localhost:5173/reactjs-template` in this example) in your
browser:

![Application](assets/application.png)

It is important to note that some libraries in this template, such as
`@telegram-apps/sdk`, are not intended for use outside of Telegram.

Nevertheless, they appear to function properly. This is because the
`src/mockEnv.ts` file, which is imported in the application's entry point (
`src/index.ts`), employs the `mockTelegramEnv` function to simulate the Telegram
environment. This trick convinces the application that it is running in a
Telegram-based environment. Therefore, be cautious not to use this function in
production mode unless you fully understand its implications.

> [!WARNING]
> Because we are using self-signed SSL certificates, the Android and iOS
> Telegram applications will not be able to display the application. These
> operating systems enforce stricter security measures, preventing the Mini App
> from loading. To address this issue, refer to
> [this guide](https://docs.telegram-mini-apps.com/platform/getting-app-link#remote).

## TON Connect

This boilerplate utilizes
the [TON Connect](https://docs.ton.org/develop/dapps/ton-connect/overview)
project to demonstrate how developers can integrate functionality related to TON
cryptocurrency.

The TON Connect manifest used in this boilerplate is stored in the `public`
folder, where all publicly accessible static files are located. Remember
to [configure](https://docs.ton.org/develop/dapps/ton-connect/manifest) this
file according to your project's information.

## Useful Links

- [Platform documentation](https://docs.telegram-mini-apps.com/)
- [@telegram-apps/sdk-vue documentation](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-vue)
- [Telegram developers community chat](https://t.me/devs)
