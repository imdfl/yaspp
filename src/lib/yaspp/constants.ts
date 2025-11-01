
export interface IYasppConstants {
	readonly CONFIG_FILE: string;
	readonly PUBLIC_PATH: string;
	readonly STYLES_PATH: string;
}

const yasppConstants: IYasppConstants = {
	CONFIG_FILE: "yaspp.config.json",
	PUBLIC_PATH: "public/yaspp",
	STYLES_PATH: "yaspp/styles"
};

export default yasppConstants;