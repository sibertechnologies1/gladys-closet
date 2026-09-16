import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiRefreshCw, FiSend, FiX } from 'react-icons/fi';

export default function PreOrders() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPreorders();
  }, []);

  const fetchPreorders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('preorder_subscribers')
        .select(`
          id,
          full_name,
          email,
          phone_number,
          location,
          created_at,
          products ( id, name, image_urls )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreorders(data || []);
    } catch (err) {
      console.error('Error fetching pre-orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(preorders.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openEmailModal = (emailsArray, defaultSubject = '') => {
    setEmailRecipients(emailsArray);
    setSubject(defaultSubject);
    setMessage('');
    setIsModalOpen(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailRecipients.length || !subject || !message) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-preorder-email', {
        body: {
          recipients: emailRecipients,
          subject,
          message,
        },
      });

      if (error) throw error;

      alert(`Email sent successfully to ${emailRecipients.length} customer(s)!`);
      setIsModalOpen(false);
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to send email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const selectedEmails = preorders
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.email);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Order Requests</h1>
          <p className="text-sm text-gray-500">
            View customer interest and send email updates directly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => openEmailModal(selectedEmails, 'Update on your pre-order')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
            >
              <FiMail className="w-4 h-4" /> Email Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={fetchPreorders}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 font-semibold rounded-xl hover:bg-purple-100 transition"
          >
            <FiRefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading pre-orders...</div>
      ) : preorders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 text-gray-500">
          No pre-orders recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-400">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === preorders.length && preorders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Interest</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {preorders.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-900">{item.full_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.products?.image_urls?.[0] || 'https://via.placeholder.com/40'}
                          alt={item.products?.name || 'Product'}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100"
                        />
                        <span className="font-semibold text-gray-800">
                          {item.products?.name || 'Unknown Product'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <FiMail className="text-purple-600" />
                        <a href={`mailto:${item.email}`} className="hover:underline">
                          {item.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <FiPhone className="text-purple-600" />
                        <a
                          href={`https://wa.me/${item.phone_number.replace(/\s+/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {item.phone_number}
                        </a>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <FiMapPin className="text-purple-600" />
                        {item.location}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar />
                        {new Date(item.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEmailModal([item.email], `Update on your ${item.products?.name || 'pre-order'}`)}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition inline-flex items-center gap-1"
                      >
                        <FiSend /> Send Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Send Email Alert</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Recipients ({emailRecipients.length})
                </label>
                <div className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-gray-700 max-h-20 overflow-y-auto">
                  {emailRecipients.join(', ')}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Your item is back in stock!"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email update here..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 text-sm font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {sending ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}