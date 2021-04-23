import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';

const { defaultLocale } = require('../../i18n.json');

const getIndexFileName = (locale: string) =>
  defaultLocale === locale ? 'index.md' : `index.${locale}.md`;

export function initContentDir(contentId: string) {
  return path.join(process.cwd(), `content/${contentId}`);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getSortedContentData(contentDir: string, locale: string) {
  // Get file names under /posts
  const contentIds = fs.readdirSync(contentDir);

  const allContentData = contentIds
    .map((id) => {
      // Read markdown file as string
      const filename = getIndexFileName(locale);
      const fullPath = path.join(contentDir, id, filename);

      if (!fs.existsSync(fullPath)) {
        return;
      }

      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        id,
        ...(matterResult.data as { date: string; title: string }),
      };
    })
    .filter((item) => item);
  // Sort posts by date
  return allContentData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllContentIds(contentDir: string, locales: string[]) {
  let paths: { params: { id: string }; locale: string }[] = [];

  const contentIds = fs.readdirSync(contentDir);

  for (let id of contentIds) {
    for (let locale of locales) {
      let fullpath = path.join(contentDir, id, getIndexFileName(locale));
      if (!fs.existsSync(fullpath)) {
        continue;
      }

      paths.push({ params: { id }, locale });
    }
  }

  return paths;
}

export async function getContentData(
  contentDir: string,
  id: string,
  locale: string,
) {
  const fullPath = path.join(contentDir, id, getIndexFileName(locale));
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...(matterResult.data as { date: string; title: string }),
  };
}