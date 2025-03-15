import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentInitialProps,
	DocumentContext,
	DocumentProps,
} from 'next/document';
import { fontFaceLinks } from '../siteFonts';
import { initYaspp } from '../lib/yaspp';

interface IStyleProps {
	readonly styleUrls: ReadonlyArray<string>;
}

type YSPDocProps= DocumentProps & IStyleProps;

type YSPInitDocProps = DocumentInitialProps & IStyleProps;

class CustomDocument extends Document<IStyleProps> {
	private styleUrls: ReadonlyArray<string>;
	constructor(props: YSPDocProps) {
		super(props);
		this.styleUrls = props.styleUrls ?? []
	}

	static async getInitialProps(ctx: DocumentContext): Promise<YSPInitDocProps> {
		const app = await initYaspp();
		const base = await Document.getInitialProps(ctx);

		return {
			...base,
			styleUrls: app.isValid ? app.styleUrls.map(rec => rec.full) : []
		}
	}

	render() {
		return (
			<Html>
				<Head>
					{fontFaceLinks}
					{
						this.styleUrls.map((url, ind) => (
							<link data-yaspp-position="last" rel="stylesheet" href={url} key={ind} />
						))
					}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default CustomDocument;
