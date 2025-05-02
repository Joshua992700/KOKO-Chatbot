// app/page.tsx
import Layout from '@/components/home/Layout';
import Welcome from '@/components/home/Welcome';

export default function HomePage() {
  return (
    <Layout>
      <Welcome />
    </Layout>
  );
}
