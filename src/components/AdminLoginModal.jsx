import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/AuthContext";

export default function AdminLoginModal({ open, onClose }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message || "Login failed");
      return;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(360px, 90vw)",
              background: "rgba(15,15,17,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              padding: "28px",
            }}
          >
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", marginBottom: "4px" }}>
              Admin Login
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", marginBottom: "20px" }}>
              Sign in to edit site content
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, marginTop: "10px" }}
              />

              {error && (
                <div style={{ color: "#ff6b6b", fontSize: "0.75rem", marginTop: "10px" }}>
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "11px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#A855F7",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </motion.button>
            </form>

            <button
              onClick={onClose}
              style={{
                marginTop: "14px",
                width: "100%",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  fontSize: "0.85rem",
  outline: "none",
  boxSizing: "border-box",
};
