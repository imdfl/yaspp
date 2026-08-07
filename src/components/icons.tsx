import {
	FileIcon,
	ListBulletIcon,
	GitHubLogoIcon,
	Pencil1Icon,
	MoonIcon,
	SunIcon,
	HamburgerMenuIcon,
	QuestionMarkCircledIcon,
	Cross2Icon,
	CaretDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	PersonIcon,
	EnvelopeClosedIcon,
	CheckIcon,
	CrossCircledIcon,
	CheckboxIcon,
	FileTextIcon,
	TwitterLogoIcon,
	ExclamationTriangleIcon
} from "@radix-ui/react-icons";

import type { IconProps} from "@radix-ui/react-icons/dist/types";
import type { ElementSize } from "@src/types/styles";

export interface IGetIconOptions {
	readonly className: string;
	readonly varName: string;
	readonly iconProps: IconProps;
	readonly size?: ElementSize;
}

type IconData = typeof CheckIcon;
const ICON_MAP = new Map<string, IconData>([
	["email", EnvelopeClosedIcon],
	["?", QuestionMarkCircledIcon],
	["twitter", TwitterLogoIcon],
	["article", FileIcon],
	["list", ListBulletIcon],
	["github", GitHubLogoIcon],
	["pencil", Pencil1Icon],
	["light", SunIcon],
	["dark", MoonIcon],
	["close", Cross2Icon],
	["hamburger", HamburgerMenuIcon],
	["caretDown", CaretDownIcon],
	["chevronLeft", ChevronLeftIcon],
	["chevronRight", ChevronRightIcon],
	["arrowLeft", ArrowLeftIcon],
	["arrowRight", ArrowRightIcon],
	["person", PersonIcon],
	["closed-envelope", EnvelopeClosedIcon],
	["check", CheckIcon],
	["cross", CrossCircledIcon],
	["checkbox", CheckboxIcon],
	["file-text", FileTextIcon]
])

export const getIcon = (icon: string, options?: Partial<IGetIconOptions>) => {
	const { className = "", varName, size = "md", iconProps = {} } = (options ?? {});
	const Ref = ICON_MAP.get(icon);
	if (Ref) {
		return <Ref className={className} {...iconProps } />
	}
	else if (icon?.length <= 2) { // render the text
		return icon;
	}
	if (varName) {
		const style: Record<string, string> = {
			"background-image": `var(${varName})`
		};
		return <div style={style} className={`icon-${size}`}></div>
	}
	return <ExclamationTriangleIcon className={className} {...iconProps } />
};
