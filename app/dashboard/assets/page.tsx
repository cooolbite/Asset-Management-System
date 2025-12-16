import { Suspense } from 'react';
import Layout from '@/components/Layout';
import AssetList from '@/components/AssetList';

function AssetListWrapper({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 25;

  return (
    <AssetList
      initialSearch={search}
      initialType={type}
      initialStatus={status}
      initialPage={page}
      initialLimit={limit}
    />
  );
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Layout>
      <div className="assets-page">
        <div className="page-header">
          <h2>Assets</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AssetListWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </Layout>
  );
}
