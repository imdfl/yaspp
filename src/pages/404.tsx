import React, { useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import Layout from 'layout/Layout';
import Head from 'next/head';
import { LocaleContext } from '@contexts/localeContext';

const Error404: NextPage = () => {
	const { t } = useContext(LocaleContext);

	return (
		<Layout>
			<Head>
				<title>{t('pages:404:title')}</title>
			</Head>
			<div className="error">
				<h1>404 - Page Not Found</h1>
			</div>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default Error404;
