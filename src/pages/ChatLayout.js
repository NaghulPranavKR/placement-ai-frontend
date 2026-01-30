import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../App.css";
import {
  getChats,
  createChat,
  getMessages,
  sendMessage as sendChatMessage,
  deleteChat,
  renameChat
} from "../api/chatApi";
import { AuthContext } from "../context/AuthContext";

export default function ChatLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile default
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const endRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const res = await getChats();
    setChats(res.data);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createNewChat = async () => {
    const res = await createChat();
    setChats(prev => [res.data, ...prev]);
    setActiveChatId(res.data._id);
    setMessages([]);
    setSidebarOpen(false); // ✅ close drawer on mobile
  };

  const openChat = async (chat) => {
    setActiveChatId(chat._id);
    const res = await getMessages(chat._id);
    setMessages(res.data);
    setMenuOpenId(null);
    setSidebarOpen(false); // ✅ close drawer on mobile
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    let chatId = activeChatId;

    if (!chatId) {
      const res = await createChat();
      chatId = res.data._id;
      setChats(prev => [res.data, ...prev]);
      setActiveChatId(chatId);
      setMessages([]);
    }

    const text = message;
    setMessage("");

    setMessages(prev => [
      ...prev,
      { sender: "user", text },
      { sender: "bot", text: "PlacementAI is typing..." }
    ]);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 12000)
      );

      await Promise.race([
        sendChatMessage(chatId, text),
        timeoutPromise
      ]);

      const res = await getMessages(chatId);
      setMessages(res.data);
      loadChats();
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          sender: "bot",
          text:
            "⚠️ **Chat limit reached**\n\n" +
            "This conversation has reached its maximum limit.\n\n" +
            "👉 **Click New Chat to continue**"
        }
      ]);
    }
  };

  const handleRenameChat = async (chat) => {
    const newTitle = prompt("Rename chat:", chat.title);
    if (!newTitle) return;

    const res = await renameChat(chat._id, newTitle);
    setChats(prev =>
      prev.map(c => (c._id === chat._id ? res.data : c))
    );
    setMenuOpenId(null);
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat permanently?")) return;

    await deleteChat(chatId);
    setChats(prev => prev.filter(c => c._id !== chatId));

    if (chatId === activeChatId) {
      setActiveChatId(null);
      setMessages([]);
    }
    setMenuOpenId(null);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div
      className={`app ${darkMode ? "dark" : "light"}`}
      onClick={() => setMenuOpenId(null)}
    >
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-top">
          <button
            className="menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(prev => !prev); // ✅ TOGGLE FIX
            }}
          >
            ☰
          </button>

          <div className="brand">
            <div className="brand-icon">🤖</div>
            <span className="brand-name">Placement AI</span>
          </div>
        </div>

        <div className="sidebar-content">
          <input
            className="search"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="chat-list">
            {chats
              .filter(c =>
                c.title?.toLowerCase().includes(search.toLowerCase())
              )
              .map(chat => (
                <div
                  key={chat._id}
                  className={`chat-item ${
                    chat._id === activeChatId ? "active" : ""
                  }`}
                >
                  <span onClick={() => openChat(chat)}>
                    💬 {chat.title || "New Chat"}
                  </span>

                  <div
                    className="chat-menu"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="menu-dots"
                      onClick={() =>
                        setMenuOpenId(
                          menuOpenId === chat._id ? null : chat._id
                        )
                      }
                    >
                      ⋯
                    </button>

                    {menuOpenId === chat._id && (
                      <div className="menu-dropdown">
                        <button onClick={() => handleRenameChat(chat)}>
                          Rename
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleDeleteChat(chat._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN */}
      <main className="chat-area">
        <header className="top-bar">
          <button className="btn primary" onClick={createNewChat}>
            ➕ New Chat
          </button>
          <button
            className="btn secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {messages.length === 0 && (
          <div className="welcome-box floating">
            <h2>Welcome, {user?.name}</h2>
            <p>Ask me about placements, careers, interviews, and skills.</p>
          </div>
        )}

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender}`}>
              <div className="bubble markdown">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="input-area">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask about jobs, placements, careers..."
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button className="send-btn" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </main>
    </div>
  );
}
