import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/api/auth/register", form);

      // ✅ Redirect with success message
      navigate("/login", {
        state: {
          success:
            "Registration successful! Please login with your email and password."
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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

        <h2>Create Account 🚀</h2>
        <p className="auth-subtitle">Join Placement AI today</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={submit}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <button className="btn primary full">Register</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
