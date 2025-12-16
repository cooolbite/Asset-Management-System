import Layout from '@/components/Layout';
import LocationList from '@/components/LocationList';

export default function LocationsPage() {
  return (
    <Layout>
      <div className="locations-page">
        <div className="page-header">
          <h2>Locations</h2>
        </div>
        <LocationList />
      </div>
    </Layout>
  );
}
