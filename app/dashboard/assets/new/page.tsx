import Layout from '@/components/Layout';
import AssetForm from '@/components/AssetForm';

export default function NewAssetPage() {
  return (
    <Layout>
      <div className="assets-page">
        <div className="page-header">
          <h2>Add New Asset</h2>
        </div>
        <AssetForm />
      </div>
    </Layout>
  );
}
