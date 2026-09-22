import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!error && data) {
        setPageData(data);
      } else {
        setPageData(null);
      }
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <Link to="/" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{pageData.title}</h1>
          {pageData.hero_subtitle && (
            <p className="text-base sm:text-lg text-purple-100 max-w-2xl mx-auto">
              {pageData.hero_subtitle}
            </p>
          )}
          {pageData.button_text && pageData.button_link && (
            <div className="pt-4">
              <Link
                to={pageData.button_link}
                className="inline-block bg-white text-purple-700 hover:bg-purple-50 font-bold px-6 py-3 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
              >
                {pageData.button_text}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="prose prose-purple max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {pageData.body_text}
          </div>
        </div>
      </main>
    </div>
  );
}