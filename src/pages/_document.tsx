import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentInitialProps,
	DocumentContext,
	DocumentProps,
} from "next/document";
import { initYaspp } from "@lib/yaspp";
import { IncomingMessage } from "http";

interface IStyleProps {
	readonly styleUrls: ReadonlyArray<string>;
}

type YSPDocProps = DocumentProps & IStyleProps;

type YSPInitDocProps = DocumentInitialProps & IStyleProps;

class CustomDocument extends Document<IStyleProps> {
	constructor(props: YSPDocProps) {
		super(props);
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
					{/* {fontFaceLinks} */}
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
