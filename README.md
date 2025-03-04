
# Yaspp

## Yet Another Self Publishing Platform

This platform is based on [Mels' loop](https://github.com/tomerlichtash/mels-loop), a comprehensive companion and guide for _The Story of Mel_, an epic Hacker Folklore tale written Ed Nather about a programmer called Mel Kaye.

### Operation

Yaspp packs your content and the yaspp platform into a web app that displays this content according to your configuration. Your text (markdown with html), metadata (in the markdown), localized strings, style overrides etc. are all packed into a [Next.js](https://nextjs.org) application, easily deployable to the web.

## Project Configuration


### Content

You can organize your content any way you want, as long as it is reflected in the `yaspp.config.json` configuration file. After publishing, all your content is available in the `/public/yaspp` folder, e.g. `/public/yaspp/content`, `/public/yaspp/locales` etc.

The recommended folder structure for a Yaspp project is

    /project-root -
          |...your content, styles, dictionaries etc in folders
          | yaspp/ (cloned from this repository)
          | yaspp.config.json

Note that you don't need to clone the `yaspp` repository if you use the `create-yaspp` wizard (see below).

### Setup

Once you have your project structure place, there are two ways to set up the project.

- **Automatic**  
The recommneded way to create a `yaspp` project is our [create-yaspp](https://www.npmjs.com/package/create-yaspp) npm package. Once you have some content to test or publish, organize it as described below on your disk or in a git repository. You can then run the wizard (e.g. `npx create-yaspp`) which will create the project with your data in the current folder (or the optional target folder).

- **Manual**  
`cd` to your project's root and run

```
  $ cd yaspp
  $ yarn # or npm install
  $ yarn init-yaspp --project ..
```

### Run/Build

After setup, you should have all the the files and folders required for running yaspp. From here, `cd` to the `yaspp` folder and run or build normally, e.g.

    $ yarn dev
    $ yarn build
    $ yarn start

On each development or production run, yaspp runs the script `scripts/build/copy-content` which copies the relevant content from your project to the `/public/yaspp` folder. This means that you _cannot_ hot-reload your content, but you will get the latest version of it in each run.

### Detailed information

See the [Wiki](https://github.com/imdfl/yaspp/wiki)