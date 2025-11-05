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
} from '@radix-ui/react-icons';

type IconData = typeof CheckIcon;
const ICON_MAP = new Map<string, IconData>([
	[ "email", EnvelopeClosedIcon ],
	[ "?", QuestionMarkCircledIcon ],
	[ "twitter", TwitterLogoIcon],
	[ "article", FileIcon ], 
	[ "list", ListBulletIcon ], 
	[ "github", GitHubLogoIcon ], 
	[ "pencil", Pencil1Icon ],
	[ "light", SunIcon ], 
	[ "dark", MoonIcon ], 
	[ "close", Cross2Icon ],
	[ "hamburger", HamburgerMenuIcon ], 
	[ "caretDown", CaretDownIcon ], 
	[ "chevronLeft", ChevronLeftIcon ], 
	[ "chevronRight", ChevronRightIcon ], 
[ "arrowLeft", ArrowLeftIcon ], 
	[ "arrowRight", ArrowRightIcon ], 
	[ "person", PersonIcon ], 
	[ "closed-envelope", EnvelopeClosedIcon ], 
	[ "check", CheckIcon ], 
	[ "cross", CrossCircledIcon ], 
	[ "checkbox", CheckboxIcon ], 
	[ "file-text", FileTextIcon ]
])

export const getIcon = (icon: string, className?: string) => {
	const Ref = ICON_MAP.get(icon);
	if (Ref) {
		return <Ref className={className} />
	}
	else if (icon?.length <= 2) { // will cover
		return icon;
	}
	return <ExclamationTriangleIcon className={className} />
};
