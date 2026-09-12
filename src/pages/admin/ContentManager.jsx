import { useEffect, useState } from 'react';
import { getSiteContent, updateContentKey, uploadSiteImage } from '../../lib/content';

export default function ContentManager() {
  const [content, setContent] = useState({});
  const [homeSlides, setHomeSlides] = useState([]);
  const [aboutSlides, setAboutSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form states for creating a new Home slide
  const [newHomeSlide, setNewHomeSlide] = useState({
    title: '',
    subtitle: '',
    description: '',
    cta: 'Shop Now',
    image: '',
  });

  // Form states for creating a new About slide
  const [newAboutSlide, setNewAboutSlide] = useState({
    title: '',
    subtitle: '',
    image: '',
  });

  useEffect(() => {
    getSiteContent().then((data) => {
      setContent(data);

      if (data.home_hero_slides) {
        try {
          setHomeSlides(JSON.parse(data.home_hero_slides));
        } catch (err) {
          console.error("Error parsing home_hero_slides:", err);
        }
      }

      if (data.about_hero_slides) {
        try {
          setAboutSlides(JSON.parse(data.about_hero_slides));
        } catch (err) {
          console.error("Error parsing about_hero_slides:", err);
        }
      }

      setLoading(false);
    });
  }, []);

  // --- Home Hero Slide Handlers ---
  const handleHomeImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadSiteImage(file);
      setNewHomeSlide((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddHomeSlide = async () => {
    if (!newHomeSlide.image) {
      alert('Please upload an image for the slide first.');
      return;
    }

    const slideToAdd = { ...newHomeSlide, id: Date.now() };
    const updatedSlides = [...homeSlides, slideToAdd];

    await updateContentKey('home_hero_slides', JSON.stringify(updatedSlides));
    setHomeSlides(updatedSlides);
    setNewHomeSlide({ title: '', subtitle: '', description: '', cta: 'Shop Now', image: '' });
    alert('Home slide added successfully!');
  };

  const handleRemoveHomeSlide = async (index) => {
    const updatedSlides = homeSlides.filter((_, idx) => idx !== index);
    await updateContentKey('home_hero_slides', JSON.stringify(updatedSlides));
    setHomeSlides(updatedSlides);
  };

  // --- About Hero Slide Handlers ---
  const handleAboutImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadSiteImage(file);
      setNewAboutSlide((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddAboutSlide = async () => {
    if (!newAboutSlide.image) {
      alert('Please upload an image for the slide first.');
      return;
    }

    const updatedSlides = [...aboutSlides, newAboutSlide];
    await updateContentKey('about_hero_slides', JSON.stringify(updatedSlides));
    setAboutSlides(updatedSlides);
    setNewAboutSlide({ title: '', subtitle: '', image: '' });
    alert('About slide added successfully!');
  };

  const handleRemoveAboutSlide = async (index) => {
    const updatedSlides = aboutSlides.filter((_, idx) => idx !== index);
    await updateContentKey('about_hero_slides', JSON.stringify(updatedSlides));
    setAboutSlides(updatedSlides);
  };

  if (loading) return <p className="p-4 text-gray-600">Loading Content Manager...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Manage Website Content</h1>

      {/* ================= HOME HERO SECTION ================= */}
      <section className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Home Page Hero Slides</h2>

        {/* Existing Home Slides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeSlides.map((slide, index) => (
            <div key={slide.id || index} className="border rounded-lg p-3 bg-gray-50 relative space-y-2">
              <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded" />
              <p className="text-xs text-amber-600 font-bold uppercase">{slide.subtitle}</p>
              <h3 className="font-semibold text-sm">{slide.title}</h3>
              <p className="text-xs text-gray-600">{slide.description}</p>
              <span className="inline-block bg-amber-300 text-gray-900 text-xs px-2 py-1 rounded font-bold">
                CTA: {slide.cta}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveHomeSlide(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Add Home Slide Form */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold text-gray-700">Add New Home Slide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Subtitle (e.g., New Arrival)"
              value={newHomeSlide.subtitle}
              onChange={(e) => setNewHomeSlide({ ...newHomeSlide, subtitle: e.target.value })}
              className="border p-2 rounded text-sm w-full"
            />
            <input
              type="text"
              placeholder="Title (e.g., Urban Chic)"
              value={newHomeSlide.title}
              onChange={(e) => setNewHomeSlide({ ...newHomeSlide, title: e.target.value })}
              className="border p-2 rounded text-sm w-full"
            />
            <input
              type="text"
              placeholder="CTA Button Text (e.g., Shop The Look)"
              value={newHomeSlide.cta}
              onChange={(e) => setNewHomeSlide({ ...newHomeSlide, cta: e.target.value })}
              className="border p-2 rounded text-sm w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleHomeImageUpload}
              disabled={uploading}
              className="text-sm border p-1 rounded w-full"
            />
          </div>
          <textarea
            placeholder="Description text..."
            rows={2}
            value={newHomeSlide.description}
            onChange={(e) => setNewHomeSlide({ ...newHomeSlide, description: e.target.value })}
            className="border p-2 rounded text-sm w-full"
          />
          {newHomeSlide.image && (
            <p className="text-xs text-green-600">✓ Image uploaded and ready.</p>
          )}
          <button
            type="button"
            onClick={handleAddHomeSlide}
            disabled={uploading}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-800"
          >
            Add Home Slide
          </button>
        </div>
      </section>

      {/* ================= ABOUT HERO SECTION ================= */}
      <section className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-800">About Page Hero Slides</h2>

        {/* Existing About Slides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aboutSlides.map((slide, index) => (
            <div key={index} className="border rounded-lg p-3 bg-gray-50 relative space-y-2">
              <img src={slide.image} alt={slide.title} className="w-full h-32 object-cover rounded" />
              <h3 className="font-semibold text-sm">{slide.title}</h3>
              <p className="text-xs text-gray-600">{slide.subtitle}</p>
              <button
                type="button"
                onClick={() => handleRemoveAboutSlide(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Add About Slide Form */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold text-gray-700">Add New About Slide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title (e.g., Elegance Redefined)"
              value={newAboutSlide.title}
              onChange={(e) => setNewAboutSlide({ ...newAboutSlide, title: e.target.value })}
              className="border p-2 rounded text-sm w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAboutImageUpload}
              disabled={uploading}
              className="text-sm border p-1 rounded w-full"
            />
          </div>
          <textarea
            placeholder="Subtitle text..."
            rows={2}
            value={newAboutSlide.subtitle}
            onChange={(e) => setNewAboutSlide({ ...newAboutSlide, subtitle: e.target.value })}
            className="border p-2 rounded text-sm w-full"
          />
          {newAboutSlide.image && (
            <p className="text-xs text-green-600">✓ Image uploaded and ready.</p>
          )}
          <button
            type="button"
            onClick={handleAddAboutSlide}
            disabled={uploading}
            className="bg-purple-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-purple-800"
          >
            Add About Slide
          </button>
        </div>
      </section>
    </div>
  );
}