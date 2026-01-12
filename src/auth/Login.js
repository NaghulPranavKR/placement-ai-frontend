import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.success || "";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/api/auth/login", { email, password });
      login(res.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* 🔷 BRAND HEADER */}
        <div className="auth-brand">
          <div className="brand-header">
            <span className="brand-emoji">🤖</span>
            <h1 className="brand-text">Placement AI</h1>
        </div>

          <p>
            An intelligent AI assistant designed to guide users through career
            choices, job opportunities, and placement preparation.
          </p>
        </div>

        <h2>Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to continue</p>

        {/* ✅ SUCCESS MESSAGE */}
        {successMessage && (
          <p className="auth-success">{successMessage}</p>
        )}

        {/* ❌ ERROR MESSAGE */}
        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={submit}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary full">Login</button>
        </form>

        <p className="auth-switch">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
