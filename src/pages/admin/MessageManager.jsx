import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Phone, Trash2, Calendar, Search, Reply, Send, X } from 'lucide-react';

export default function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(`Error deleting message: ${err.message}`);
    }
  };

  const handleOpenReply = (msg) => {
    if (activeReplyId === msg.id) {
      setActiveReplyId(null);
      setReplyText('');
    } else {
      setActiveReplyId(msg.id);
      setReplyText(`Hi ${msg.name},\n\nThank you for reaching out to Gladys' Closet.\n\n`);
    }
  };

  const handleSendReply = (msg) => {
    if (!replyText.trim()) return;
    setSending(true);

    // Open default mail app pre-filled with the customer's email and draft message
    const mailtoUrl = `mailto:${msg.email}?subject=${encodeURIComponent(
      "Re: Inquiry at Gladys' Closet"
    )}&body=${encodeURIComponent(replyText)}`;
    
    window.location.href = mailtoUrl;

    setActiveReplyId(null);
    setReplyText('');
    setSending(false);
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Messages</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Total Inquiries: <span className="font-semibold text-gray-800">{messages.length}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search messages by name, email, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-xs focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500">No messages found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 mt-6">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-purple-200 transition-all shadow-sm relative group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm">{msg.name}</h3>
                  <span className="text-xs text-gray-400">•</span>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    {msg.email}
                  </a>
                  {msg.phone && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <a
                        href={`tel:${msg.phone}`}
                        className="text-xs text-gray-600 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {msg.phone}
                      </a>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  
                  <button
                    onClick={() => handleOpenReply(msg)}
                    className="text-purple-600 hover:text-purple-800 transition-colors p-1 flex items-center gap-1 text-xs font-semibold"
                    title="Reply to message"
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100">
                {msg.message}
              </p>

              {activeReplyId === msg.id && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900">
                      Replying to {msg.name} ({msg.email})
                    </span>
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 bg-white border border-purple-200 rounded-lg text-xs focus:outline-none focus:border-purple-600"
                    placeholder="Type your response here..."
                  ></textarea>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={sending}
                      onClick={() => handleSendReply(msg)}
                      className="px-4 py-1.5 text-xs bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      Open Mail App to Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}