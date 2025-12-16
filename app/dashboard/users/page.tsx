import { Suspense } from 'react';
import Layout from '@/components/Layout';
import UserList from '@/components/UserList';

function UserListWrapper({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const role = typeof searchParams.role === 'string' ? searchParams.role : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 25;

  return (
    <UserList
      initialSearch={search}
      initialRole={role}
      initialStatus={status}
      initialPage={page}
      initialLimit={limit}
    />
  );
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <h2>Users</h2>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <UserListWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </Layout>
  );
}
