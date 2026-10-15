import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null); // { msg } or null
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("all"); // all | unread | replied
  const autoMarkQueue = useRef(new Set());

  const getConfig = () => {
    const token = localStorage.getItem("adminToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/contact", getConfig());
      setMessages(data);
    } catch {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-mark unread messages as read after 2 seconds of viewing
  useEffect(() => {
    const unread = messages.filter((m) => !m.isRead);
    unread.forEach((msg) => {
      if (!autoMarkQueue.current.has(msg._id)) {
        autoMarkQueue.current.add(msg._id);
        setTimeout(async () => {
          try {
            await axios.put(`/api/contact/${msg._id}`, {}, getConfig());
            setMessages((prev) =>
              prev.map((m) => (m._id === msg._id ? { ...m, isRead: true } : m))
            );
          } catch {
            // silent fail
          }
        }, 2000);
      }
    });
  }, [messages]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`/api/contact/${id}`, getConfig());
      toast.success("Message deleted");
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const openReply = (msg) => {
    setReplyModal(msg);
    setReplyText(msg.reply || "");
  };

  const closeReply = () => {
    setReplyModal(null);
    setReplyText("");
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    setReplying(true);
    try {
      const { data } = await axios.put(
        `/api/contact/${replyModal._id}/reply`,
        { reply: replyText },
        getConfig()
      );
      setMessages((prev) =>
        prev.map((m) => (m._id === data._id ? data : m))
      );
      toast.success("Reply saved successfully");
      closeReply();
    } catch {
      toast.error("Failed to save reply");
    } finally {
      setReplying(false);
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "replied") return !!m.reply;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-primary mt-1">
              {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {/* Filter tabs */}
        <div className="tabs tabs-boxed">
          {["all", "unread", "replied"].map((f) => (
            <button
              key={f}
              className={`tab capitalize ${filter === f ? "tab-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="badge badge-primary badge-sm ml-1">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 opacity-60">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg">
            {filter === "all" ? "No messages yet." : `No ${filter} messages.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg._id}
              className={`card bg-base-100 shadow-md transition-all ${
                !msg.isRead
                  ? "border-l-4 border-primary shadow-primary/10"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="card-body gap-3">
                {/* Top row: sender info + date */}
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{msg.name}</h3>
                      {!msg.isRead && (
                        <span className="badge badge-primary badge-sm">New</span>
                      )}
                      {msg.reply && (
                        <span className="badge badge-success badge-sm">Replied</span>
                      )}
                    </div>
                    <p className="text-sm opacity-60">{msg.email}</p>
                    {msg.subject && (
                      <p className="font-medium text-sm mt-0.5 opacity-80">
                        Subject: {msg.subject}
                      </p>
                    )}
                  </div>
                  <span className="text-xs opacity-50 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Message body */}
                <div className="bg-base-200 rounded-lg p-3 text-sm leading-relaxed">
                  {msg.message}
                </div>

                {/* Reply preview */}
                {msg.reply && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-3">
                    <p className="text-xs font-semibold text-success mb-1">
                      Your Reply · {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ""}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.reply}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions justify-end gap-2 mt-1">
                  <button
                    className="btn btn-sm btn-primary gap-1"
                    onClick={() => openReply(msg)}
                  >
                    ✏️ {msg.reply ? "Edit Reply" : "Reply"}
                  </button>
                  <button
                    className="btn btn-sm btn-error btn-outline gap-1"
                    onClick={() => handleDelete(msg._id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-1">
              Reply to {replyModal.name}
            </h3>
            <p className="text-sm opacity-60 mb-4">{replyModal.email}</p>

            {/* Original message */}
            <div className="bg-base-200 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-xs opacity-50 mb-1">Original message:</p>
              {replyModal.message}
            </div>

            <textarea
              className="textarea textarea-bordered w-full min-h-32 text-sm"
              placeholder="Write your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <p className="text-xs opacity-50 mt-1">
              Note: This reply is stored in the database. Share it with the sender manually if needed.
            </p>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeReply} disabled={replying}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReplySubmit}
                disabled={replying || !replyText.trim()}
              >
                {replying ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Save Reply"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeReply}></div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
