'use client';

import React, { PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useIconAnimator, useWindowSize } from '@hooks/index';
import { useDrawer } from '../hooks/useDrawer';
import {
	Button,
	Container,
	Drawer,
	MenuBar,
	Link,
	List,
	ListItem,
	LocaleSelect,
	Logo,
	Scrollbar,
	Separator,
	Strip,
	Text,
	TextLink,
	ThemeSelect,
	MenuDrawer,
} from '../components/index';
import { getIcon } from 'components/icons';
import CustomHead from './customHead';
import { Analytics } from './analytics';
import { LocaleId } from 'types';
import { useRouter } from 'next/router';
import { NavSectionId } from './data/nav';
import classNames from 'classnames';
import styles from './Layout.module.scss';
import type { LocaleOptionProps } from 'layout/locale-select/LocaleSelect';
import { LocaleContext } from '../contexts/localeContext';
import useNavItems from '../hooks/useNavItems';
import { YasppOnload } from '../components/yaspp-components';
import { MLThemeContext } from '../contexts/MLThemeContext';

type RootLayoutProps = {
	className?: string;
};

const IS_DEBUG = process.env.NEXT_PUBLIC_ML_DEBUG;
const MIN_DESKTOP_WIDTH = 1024;


const Layout = ({ children }: PropsWithChildren<RootLayoutProps>) => {
	const router = useRouter();

	useIconAnimator(router);

	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const { t, locale: lang, locales, textDirection } = useContext(LocaleContext);
	const { width: screenWidth } = useWindowSize();
	const { theme: mlTheme, setTheme: setMLTheme} = useContext(MLThemeContext);

	const isHome = pathname === '/';
	const isMobile = screenWidth <= MIN_DESKTOP_WIDTH;
	const oppositeTheme = theme === 'dark' ? 'light' : 'dark';

	const { open: drawerOpen, toggle: toggleDrawer } = useDrawer(isMobile);

	const localeContext = useContext(LocaleContext);

	const { sections: footerSections } = useNavItems(NavSectionId.FOOTER);
	const { sections: sidebarSections } = useNavItems(NavSectionId.SIDEBAR);
	const { sections: topbarSections } = useNavItems(NavSectionId.TOPBAR);

	const setCurrentTheme = useCallback((theme: string) => {
		setTheme(theme);
		setMLTheme(theme);
	}, [setTheme, setMLTheme])

	const setLocale = useCallback(
		async (id: LocaleId) => {
			await localeContext.setLocale(id);
			// return router.push(router.asPath, router.asPath, {
			// 	locale: id,
			// 	scroll: true,
			// })
		},
		[localeContext]
	);

	const themeLabel = useMemo(() => {
		return t('common:button:toggleTheme', {
			theme: t(`common:theme:${oppositeTheme}:name`),
		});
	}, [oppositeTheme, t]);

	const localeItems: LocaleOptionProps[] = useMemo(
		() =>
			locales.map((id) => ({
				id: id,
				label: t(`locale:${id}:symbol`, null, { default: id[0] }),
				title: t(`locale:${id}:label`, null, { default: id }),
			})),
		[locales, t]
	);

	const siteTitle = t('common:site:title');
	const siteSubtitle = t('common:site:subtitle');
	const siteLicense = t('common:site:license', {
		toYear: new Date().getFullYear(),
	});


	const menuDrawer = useMemo(
		() => (
			<Drawer
				direction={textDirection === 'ltr' ? 'right' : 'left'}
				open={drawerOpen}
				onClose={toggleDrawer}
				className={styles.drawer}
			>
				<Scrollbar textDirection={textDirection} height="100vh">
					<Button onClick={toggleDrawer} asChild>
						{getIcon('close')}
					</Button>
					<div className={styles.menuHeader}>
						<Logo mode={oppositeTheme} className={styles.logo} />
						<TextLink title={siteTitle} linked={!isHome} href="/" variant="h1">
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
						<ThemeSelect
							label={themeLabel}
							theme={theme}
							setTheme={setCurrentTheme}
							className={styles.themeSelect}
						/>
					</div>
					<MenuDrawer
						items={sidebarSections}
						onClose={toggleDrawer}
						className={styles.menu}
					/>
				</Scrollbar>
			</Drawer>
		),
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
			sidebarSections,
			setLocale,
		]
	);

	return (
		<>
			<CustomHead
				title={`${siteTitle} – ${siteSubtitle}`}
				name={siteTitle}
				description={siteSubtitle}
				theme={mlTheme}
			/>
			<Scrollbar
				textDirection={textDirection}
				height="100vh"
				className={styles.root}
				data-locale={lang}
			>
				<Container
					asChild
					sticky
					fullWidth
					spaceBetween
					alignItemsCenter
					horizontalGutter
					position="top"
					className={styles.topbar}
				>
					<header data-testid="topbar">
						<Container alignItemsCenter className={styles.title}>
							<Logo mode={theme || 'light'} className={styles.logo} />
							<TextLink
								variant="subtitle1"
								title={siteTitle}
								linked={!isHome}
								href="/"
							>
								{siteTitle}
							</TextLink>
							<Separator />
							<Text variant="subtitle4" className={styles.subtitle}>
								{siteSubtitle}
							</Text>
						</Container>
						{isMobile ? (
							<Button onClick={toggleDrawer} asChild>
								{getIcon('hamburger')}
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
										setTheme={setCurrentTheme}
										className={styles.themeSelect}
									/>
								</Container>
							</Container>
						)}
					</header>
				</Container>
				<Container className={styles.page}>{children}</Container>
				<Strip />
				<Container fullWidth asChild className={styles.footer}>
					<footer className={styles.footer}>
						<div className={styles.container}>
							<div className={styles.columns}>
								<div className={classNames(styles.column)}>
									<Text variant="h1" aria-label={siteLicense}>
										{siteLicense}
									</Text>
									<Text>{siteSubtitle}</Text>
									<Text>{t('common:site:shortSiteDescription')}</Text>
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
				{isMobile && menuDrawer}
			</Scrollbar>
			<YasppOnload />
			{!IS_DEBUG && <Analytics />}
		</>
	);
};

export default Layout;
