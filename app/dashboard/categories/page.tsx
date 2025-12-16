import Layout from '@/components/Layout';
import CategoryList from '@/components/CategoryList';

export default function CategoriesPage() {
  return (
    <Layout>
      <div className="categories-page">
        <div className="page-header">
          <h2>Categories</h2>
        </div>
        <CategoryList />
      </div>
    </Layout>
  );
}
