
module.exports = {
	locales: ["en"],
	defaultLocale: "en",
	logBuild: false,
	pages: 	{
    "*": [
        "common",
        "locale",
        "nav",
        "pages",
        "authors"
    ],
    "/": [
        "glossary"
    ],
    "/contact": [
        "contact"
    ],
    "/glossary": [
        "glossary"
    ],
    "/glossary/[id]": [
        "glossary"
    ],
    "/pages/docs/[id]/codex": [
        "docs"
    ],
    "he/posts": [
        "blog"
    ],
    "/posts/[id]": [
        "blog"
    ]
},
	loadLocaleFrom: (function(sysNS, userNS) {
		const uns = new Set(userNS);
		const sns = new Set(sysNS);
		async function load(path) {
			try {
				const m = await import(path);
				return m.default;

			} catch (err) {
				console.log(`Failed to load locale from ${path}`);
				return {};
			}
		}
		return (async (lang, ns) => {
				// You can use a dynamic import, fetch, whatever. You should
				// return a Promise with the JSON file.
				const ret = {};
				if (sns.has(ns)) {
					const m = await load(`./locales/${lang}/${ns}.json`);
					Object.assign(ret, m.default);
				}
				if (uns.has(ns)) {
					const m = await load(`./public/locales/${lang}/${ns}.json`);
					Object.assign(ret, m.default);
				}

				return  ret;
		});
	})(
		["common","locale","nav","pages","authors","glossary","contact","docs","blog"],
		["authors","common","contact","glossary","nav"]
	)
}