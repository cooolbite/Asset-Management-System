import Layout from '@/components/Layout';
import VendorList from '@/components/VendorList';

export default function VendorsPage() {
  return (
    <Layout>
      <div className="vendors-page">
        <div className="page-header">
          <h2>Vendors & Suppliers</h2>
        </div>
        <VendorList />
      </div>
    </Layout>
  );
}
