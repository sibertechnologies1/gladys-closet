import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBrands(data);
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('brand-logos')
      .upload(filePath, file);

    setUploading(false);

    if (error) {
      alert(`Upload failed: ${error.message}`);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filePath);

    setLogoUrl(publicUrlData.publicUrl);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    if (editingId) {
      const { error } = await supabase
        .from('brands')
        .update({ name, slug, description, logo_url: logoUrl })
        .eq('id', editingId);

      setLoading(false);

      if (error) {
        alert(`Failed to update brand: ${error.message}`);
      } else {
        resetForm();
        fetchBrands();
      }
    } else {
      const { error } = await supabase
        .from('brands')
        .insert([{ name, slug, description, logo_url: logoUrl }]);

      setLoading(false);

      if (error) {
        alert(`Failed to add brand: ${error.message}`);
      } else {
        resetForm();
        fetchBrands();
      }
    }
  }

  function handleEdit(brand) {
    setEditingId(brand.id);
    setName(brand.name);
    setDescription(brand.description || '');
    setLogoUrl(brand.logo_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
    setLogoUrl('');
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      await supabase.from('brands').delete().eq('id', id);
      fetchBrands();
    }
  }

  // Filter brands based on the search query
  const filteredBrands = brands.filter((brand) => {
    const query = searchTerm.toLowerCase();
    return (
      brand.name.toLowerCase().includes(query) ||
      (brand.description && brand.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Brands</h1>
        {editingId && (
          <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
            Editing Mode
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Brand Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
            placeholder="e.g. Versace"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {editingId ? 'Replace Logo Image (Optional)' : 'Brand Logo Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full border p-2 rounded"
          />
          {uploading && (
            <p className="text-xs text-purple-600 mt-1">Uploading logo...</p>
          )}
          {logoUrl && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={logoUrl}
                alt="Logo Preview"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xs text-green-600 font-medium">
                Logo active
              </span>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows="2"
            placeholder="Brief description of the brand..."
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-slate-900 text-white py-2 rounded font-medium hover:bg-slate-800 transition disabled:bg-slate-400"
          >
            {loading
              ? 'Saving...'
              : editingId
              ? 'Update Brand'
              : 'Add Brand'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-200 text-slate-700 px-6 py-2 rounded font-medium hover:bg-slate-300 transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Search Bar Section */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search brands by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border p-2 rounded text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'} found
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 text-xs text-slate-500 uppercase">
              <th className="p-4">Brand</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <tr key={brand.id} className="border-b text-sm hover:bg-slate-50">
                  <td className="p-4 font-medium flex items-center gap-3">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs text-slate-500">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                    {brand.name}
                  </td>
                  <td className="p-4 text-slate-500">{brand.slug}</td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">
                    {brand.description || '-'}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">
                  No brands matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}