import Head from 'next/head';

type HeadProps = Readonly<{
	title?: string;
	name?: string;
	description?: string;
	theme?: string;
}>;

const CustomHead = ({ title, name, description, theme }: HeadProps) => (
	<Head>
		<link
			rel="icon"
			type="image/png"
			href="/favicon-dark.png"
			media="(prefers-color-scheme: light)"
		/>
		<link
			rel="icon"
			type="image/png"
			href="/favicon-light.png"
			media="(prefers-color-scheme: dark)"
		/>
		<meta itemProp="name" content={name} />
		<meta itemProp="description" content={description} />
		<meta name="description" content={description} />
		{/* <meta
				property="og:image"
				content={`https://og-image.vercel.app/${encodeURI(
					title
				)}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
			/> */}
		<meta name="og:title" content={title} />
		<meta name="twitter:card" content="summary_large_image" />
		{
			theme && (
				<link rel="stylesheet" href={`/styles/themes/${theme}.css`} />
			)
		}
		{/* {styles && styles.map((url, ind) => (
			<link rel="stylesheet" href={url} key={ind} />
		))} */}
	</Head>
);

export default CustomHead;
export type { HeadProps };
