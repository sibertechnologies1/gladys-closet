import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Mail, Search, Trash2, Calendar } from 'lucide-react';

export default function SubscriberManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error fetching subscribers:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 1. Export Subscriber List to CSV File
  const exportToCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ['ID', 'Email', 'Subscribed Date'];
    const rows = subscribers.map((sub) => [
      sub.id,
      `"${sub.email}"`,
      `"${new Date(sub.created_at).toLocaleString()}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gladys_Closet_Subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Trigger Welcome Email via Supabase Edge Function
  const sendWelcomeEmail = async (email, id) => {
    setSendingEmailId(id);
    setMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email }
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Welcome email sent to ${email}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error sending email.' });
    } finally {
      setSendingEmailId(null);
    }
  };

  // 3. Delete Subscriber
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;

    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(`Error deleting subscriber: ${err.message}`);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Newsletter Subscribers</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Subscribers: <span className="font-semibold text-gray-800">{subscribers.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={subscribers.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs sm:text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-500 bg-white"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm text-gray-500">Loading subscribers...</div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="py-12 text-center text-xs sm:text-sm text-gray-500">No subscribers found.</div>
      ) : (
        <div>
          {/* Mobile Card List View */}
          <div className="block sm:hidden space-y-3">
            {filteredSubscribers.map((sub) => (
              <div
                key={sub.id}
                className="p-4 border border-gray-200 rounded-2xl bg-gray-50 space-y-3"
              >
                <div>
                  <p className="font-bold text-gray-900 text-xs break-all">{sub.email}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                    Subscribed: {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => sendWelcomeEmail(sub.email, sub.id)}
                    disabled={sendingEmailId === sub.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-semibold hover:bg-teal-100 transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {sendingEmailId === sub.id ? 'Sending...' : 'Send Welcome'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sub.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{sub.email}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => sendWelcomeEmail(sub.email, sub.id)}
                        disabled={sendingEmailId === sub.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-medium hover:bg-teal-100 transition-colors disabled:opacity-50"
                      >
                        <Mail className="w-3 h-3" />
                        {sendingEmailId === sub.id ? 'Sending...' : 'Send Welcome'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}