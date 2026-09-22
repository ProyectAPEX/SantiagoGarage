import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EntradaSecreta from "@/components/EntradaSecreta";

// Marco del sitio publico. El panel interno queda fuera de este grupo, sin navbar ni footer.
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <EntradaSecreta />
    </div>
  );
}
