import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);

  const token = localStorage.getItem("adminToken");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get("/api/contact", config);
      setMessages(data);
    } catch (error) {
      toast.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`/api/contact/${id}`, config);
      toast.success("Message deleted");
      fetchMessages();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/contact/${id}`, {}, config);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
      {messages.length === 0 ? (
        <p className="opacity-70">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`card bg-base-100 shadow ${!msg.isRead ? "border-l-4 border-primary" : ""}`}
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{msg.name}</h3>
                    <p className="text-sm opacity-70">{msg.email}</p>
                    {msg.subject && <p className="font-medium mt-1">{msg.subject}</p>}
                  </div>
                  <span className="text-xs opacity-50">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2">{msg.message}</p>
                <div className="card-actions justify-end gap-2">
                  {!msg.isRead && (
                    <button className="btn btn-sm btn-outline" onClick={() => markRead(msg._id)}>
                      Mark Read
                    </button>
                  )}
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(msg._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
