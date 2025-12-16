import { Suspense } from 'react';
import Layout from '@/components/Layout';
import TransactionList from '@/components/TransactionList';

function TransactionListWrapper({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const type = typeof searchParams.type === 'string' ? searchParams.type : '';
  const dateFrom = typeof searchParams.dateFrom === 'string' ? searchParams.dateFrom : '';
  const dateTo = typeof searchParams.dateTo === 'string' ? searchParams.dateTo : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 25;

  return (
    <TransactionList
      initialType={type}
      initialDateFrom={dateFrom}
      initialDateTo={dateTo}
      initialPage={page}
      initialLimit={limit}
    />
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Layout>
      <div className="transactions-page">
        <div className="page-header">
          <h2>Transactions</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TransactionListWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </Layout>
  );
}
