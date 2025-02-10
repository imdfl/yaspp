
# Yaspp

## Yet Another Self Publishing Platform

This platform is based on [Mels' loop](https://github.com/tomerlichtash/mels-loop), a comprehensive companion and guide for _The Story of Mel_, an epic Hacker Folklore tale written Ed Nather about a programmer called Mel Kaye.

### Operation

Yaspp packs your content and the yaspp platform into a web app that displays this content according to your configuration. Your text (markdown with html), metadata (in the markdown), localized strings, style overrides etc. are all packed into a [Next.js](https://nextjs.org), easily deployable to the web.

### Content

You can organize your content any way you want, as long as it is reflected in the `yaspp.json` configuration file. After publishing, all your content is available in the `/public` folder, e.g. `/public/content`, `/public/locales` etc.

The recommended folder structure for a Yaspp project is

    /root-
          |...your content, styles, dictionaries etc in folders
          | yaspp/
          | yaspp.json

### Operation

Once you have your project structure place, `cd` to your project's root and run

    $ cd yaspp
    $ yarn init-yaspp -P ..

This will create the files and folders required for running yaspp. From here, your run and build normally, e.g.

    $ yarn dev
    $ yarn build
    $ yarn start

On each development or production run, yaspp runs the script `scripts/build/copy-content` which copies the relevant content from your project to the yaspp `/public` folder. This means that you _cannot_ hot-reload your content, but you will get the latest version of it in each run.

### Detailed information

See the [Wiki](https://github.com/imdfl/yaspp/wiki)