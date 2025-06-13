import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <Navbar />
      <main className="flex-1 px-4 py-4 dark:bg-gray-700">{children}</main>
      <Footer />
    </div>
  );
}
