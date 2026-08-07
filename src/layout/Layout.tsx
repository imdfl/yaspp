'use client';

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useIconAnimator, useWindowSize } from "@hooks/index";
import { useDrawer } from "../hooks/useDrawer";
import {
	Button, Container,
	Drawer, MenuBar,
	Link, List,
	ListItem, LocaleSelect,
	Logo, Scrollbar,
	Separator, Strip,
	Text, TextLink,
	ThemeSelect, MenuDrawer,
} from "../components/index";
import { getIcon } from "@components/icons";
import CustomHead from "./customHead";
import { Analytics } from "./analytics";
import { LocaleId, OperationPromise } from "@src/types";
import { useRouter } from "next/router";
import { NavSectionId } from "./data/nav";
import classNames from "@lib/class-names";
import type { LocaleOptionProps } from "@src/layout/locale-select/LocaleSelect";
import { ComponentContextProvider, LocaleContext, PageContext } from "../contexts";
import useNavItems from "@hooks/useNavItems";
import { YasppOnload } from "../components/yaspp-components";
import { MLThemeContext } from "@contexts/MLThemeContext";
import { useTranslatedString } from "@hooks/useTranslatedString";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import useClassNames from "@hooks/useClassNames";

import styles from "./Layout.module.scss";

const IS_DEBUG = process.env.NEXT_PUBLIC_ML_DEBUG;
const MIN_DESKTOP_WIDTH = 1024;

const _globalStyles = new Map<string, string>();

async function loadStyles(styleUrls?: ReadonlyArray<string>): OperationPromise<string[]> {
	if (!styleUrls?.length) {
		return { result: [] };
	}
	const styles: string[] = [];
	const errors: string[] = [];

	for await (const url of styleUrls) {
		if (_globalStyles.has(url)) {
			const txt = _globalStyles.get(url);
			if (txt) {
				styles.push(txt);
			}
		}
		else {
			let cssText = "";
			try {
				const cssModule = await import(/* webpackIgnore: true */ url, { with: { type: "css" } });
				const css = (cssModule.default as CSSStyleSheet);
				if (css?.cssRules?.length) {
					cssText = Array.from(css.cssRules).map(rule => rule.cssText).join('\n');
				}
			}
			catch (e) {
				errors.push(`Error loading css module from ${url}: ${e}`);
			}
			finally {
				_globalStyles.set(url, cssText);
				if (cssText) {
					styles.push(cssText);
				}
			}
		}
	}
	return {
		result: styles,
		error: errors.join('\n')
	};
}


const Layout = ({ children }: YSPComponentPropsWithChildren) => {
	const router = useRouter();
	const pageCtx = useContext(PageContext);

	useIconAnimator(router);

	const pathname = usePathname();
	const { t, locale: lang, textDirection, allowedLocales } = useContext(LocaleContext);
	const { width: screenWidth } = useWindowSize();
	const { theme, setTheme, themes, oppositeTheme } = useContext(MLThemeContext);
	const [loadedStyle, setLoadedstyle] = useState<string | null>(null);

	// const [themeNames, setThemeNames] = useState<ReadonlyArray<string>>(themes?.map(u => u.name) ?? []);

	const isHome = pathname === "/";
	const isMobile = screenWidth <= MIN_DESKTOP_WIDTH;

	const { open: drawerOpen, toggle: toggleDrawer } = useDrawer(isMobile);

	const localeContext = useContext(LocaleContext);

	const { sections: footerSections } = useNavItems(NavSectionId.FOOTER);
	const { sections: sidebarSections } = useNavItems(NavSectionId.SIDEBAR);
	const { sections: topbarSections } = useNavItems(NavSectionId.TOPBAR);

	const setCurrentTheme = useCallback((theme: string) => {
		setTheme(theme);
		// setMLTheme(theme);
	}, [setTheme])

	const setLocale = useCallback(
		async (id: LocaleId) => {
			await localeContext.setLocale(id);
		},
		[localeContext]
	);

	const themeLabel = useMemo(() => {
		return oppositeTheme ? t("common:button:toggleTheme", {
			theme: t(`common:theme:${oppositeTheme}:name`),
		}) : "";
	}, [oppositeTheme, t]);

	const localeItems: LocaleOptionProps[] = useMemo(
		() =>
			allowedLocales.map((id) => ({
				id: id,
				label: t(`locale:${id}:symbol`, null, { default: id[0] }),
				title: t(`locale:${id}:label`, null, { default: id }),
			})),
		[allowedLocales, t]
	);

	const siteTitleGen = useCallback(() => t("common:site:title"), [t]);
	const siteSubtitleGen = useCallback(() => t("common:site:subtitle"), [t]);
	const siteLicenseGen = useCallback(() => t("common:site:license", {
		toYear: new Date().getFullYear(),
	}), [t]);
	const { text: siteTitle } = useTranslatedString(siteTitleGen);
	const { text: siteSubtitle } = useTranslatedString(siteSubtitleGen);
	const { text: siteLicense } = useTranslatedString(siteLicenseGen);
	const { componentClass: headerClass, componentPath: headerPath } = useClassNames({
		classes: [styles.topbar],
		part: "header",
	});

	const menuDrawer = useMemo(
		() => {
			return () => {
				const themeNames = themes?.map(u => u.name) ?? [];
				return (
					<Drawer
						direction={textDirection === "ltr" ? "right" : "left"}
						open={drawerOpen}
						onClose={toggleDrawer}
						className={styles.drawer}
					>
						<Scrollbar textDirection={textDirection} height="100vh">
							<Button onClick={toggleDrawer} asChild>
								{getIcon("close")}
							</Button>
							<div className={styles.menuHeader}>
								<Logo mode={oppositeTheme || theme} className={styles.logo} />
								<TextLink title={siteTitle} linked={!isHome} href="/">
									{siteTitle}
								</TextLink>
							</div>
							<Strip />
							<div className={styles.panel}>
								<LocaleSelect
									defaultValue={lang}
									options={localeItems}
									onSelect={(id) => id !== lang && void setLocale(id)}
									className={styles.localeSelect}
								/>
								<Separator className={styles.separator} />
								{oppositeTheme && (<ThemeSelect
									label={themeLabel}
									theme={theme}
									themes={themeNames}
									setTheme={setCurrentTheme}
									className={styles.themeSelect}
								/>)}
							</div>
							<MenuDrawer
								items={sidebarSections}
								onClose={toggleDrawer}
								className={styles.menu}
							/>
						</Scrollbar>
					</Drawer>
				)
			}
		},
		[
			textDirection,
			setCurrentTheme,
			drawerOpen,
			toggleDrawer,
			oppositeTheme,
			siteTitle,
			isHome,
			lang,
			localeItems,
			themeLabel,
			theme,
			themes,
			sidebarSections,
			setLocale,
		]
	);

	useEffect(() => {
		const run = async (): OperationPromise<string[]> => {
			const t = themes?.find(t => t.name === theme);
			if (!t) {
				console.warn(`Theme "${theme}" not found`);
				return { result: [] };
			}
			return await loadStyles(t.paths);
		};

		run()
			.then(({ error, result: strs }) => {
				if (error) {
					console.error(`Error loading theme ${theme}`);
					setLoadedstyle("");
				}
				else {
					setLoadedstyle(strs?.length ? strs.join('\n') : "");
				}

			})
			.catch
	}, [themes, theme, pageCtx])


	if (loadedStyle === null) {
		return <></>
	}

	const themeNames = themes?.map(u => u.name) ?? [];
	return (
		<>
			<CustomHead
				title={`${siteTitle} – ${siteSubtitle}`}
				name={siteTitle}
				style={loadedStyle}
				description={siteSubtitle}
			/>

			{/* <Scrollbar
				textDirection={textDirection}
				height="100vh"
				className={styles.root}
				data-locale={lang}
			> */}
			<div className={styles.root}>
				<Container
					asChild
					sticky="top"
					fullWidth
					spaceBetween
					alignItemsCenter
					horizontalGutter
					className={headerClass}
				>
					<header data-testid="topbar">
						<ComponentContextProvider parentPath={headerPath}>
							{/* Top logo */}
							<Container alignItemsCenter className={styles.title}>
								<Logo mode={theme || "light"} className={styles.logo} />
								<TextLink
									title={siteTitle}
									linked={!isHome}
									href="/"
								>
									{siteTitle}
								</TextLink>
								<Separator />
								<Text className={styles.subtitle}>
									{siteSubtitle}
								</Text>
							</Container>
							{isMobile ? (
								// hamburger menu
								<Button onClick={toggleDrawer} asChild>
									{getIcon("hamburger")}
								</Button>
							) : (
								<Container alignItemsCenter>
									<Container className={styles.panel}>
										<MenuBar
											items={topbarSections}
											textDirection={textDirection}
										/>
										<LocaleSelect
											defaultValue={lang}
											options={localeItems}
											onSelect={(id) => void setLocale(id)}
											className={styles.localeSelect}
										/>
										<ThemeSelect
											label={themeLabel}
											theme={theme}
											themes={themeNames}
											setTheme={setCurrentTheme}
											className={styles.themeSelect}
										/>
									</Container>
								</Container>
							)}
						</ComponentContextProvider>
					</header>
				</Container>
				<div className={styles.content_container}>
					<Container className={styles.page}>{children}</Container>
					<Strip />
					<Container fullWidth asChild className={styles.footer}>
						<footer className={styles.footer}>
							<div className={styles.container}>
								<div className={styles.columns}>
									<div className={classNames(styles.column)}>
										<Text aria-label={siteLicense}>
											{siteLicense}
										</Text>
										<Text>{siteSubtitle}</Text>
										<Text>{t("common:site:shortSiteDescription")}</Text>
									</div>
									{footerSections.map((section) => (
										<Container className={styles.column} key={`container-${section.id}`}>
											<List className={styles.list} label={section.title}>
												{section.items.map((item) => (
													<ListItem
														key={`footer-links-item-${item.id}`}
														className={styles.item}
													>
														<Link
															href={item.url}
															target={item.target}
															className={styles.link}
															asChild={true}
														>
															{item.title}
														</Link>
													</ListItem>
												))}
											</List>
										</Container>
									))}
								</div>
							</div>
						</footer>
					</Container>
				</div>
				{isMobile && menuDrawer()}
			</div>
			{/* </Scrollbar> */}
			<YasppOnload />
			{!IS_DEBUG && <Analytics />}
		</>
	);
};

export default Layout;
