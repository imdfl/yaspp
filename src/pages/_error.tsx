import React, { useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import Layout from 'layout/Layout';
import Head from 'next/head';
import { LocaleContext } from '../contexts/localeContext';

const CustomError: NextPage = () => {
	const { t } = useContext(LocaleContext);

	return (
		<Layout>
			<Head>{t('pages:error:title')}</Head>
			<div className="error">
				<h1>Error</h1>
			</div>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default CustomError;
