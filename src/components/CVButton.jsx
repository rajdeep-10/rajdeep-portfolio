import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/AuthContext";

const BUCKET = "cv";
const FILE_PATH = "resume.pdf"; // always overwritten, single latest CV

export default function CVButton({ style, label = "DOWNLOAD CV" }) {
  const { isAdmin } = useAuth();
  const [cvUrl, setCvUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    refreshUrl();
  }, []);

  const refreshUrl = () => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(FILE_PATH);
    // cache-bust so visitors always get the latest file after a re-upload
    setCvUrl(`${data.publicUrl}?t=${Date.now()}`);
  };

  const handleDownload = () => {
    if (!cvUrl) return;
    window.open(cvUrl, "_blank");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setUploading(true);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_PATH, file, { upsert: true, contentType: "application/pdf" });
    setUploading(false);
    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }
    refreshUrl();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={style}
      >
        {label}
      </motion.button>

      {isAdmin && (
        <>
          <motion.button
            onClick={handleUploadClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Upload new CV"
            disabled={uploading}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid rgba(168,85,247,0.4)",
              background: "rgba(168,85,247,0.1)",
              color: "#A855F7",
              cursor: uploading ? "default" : "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {uploading ? "…" : "⇧"}
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
}
