import { useRef, useState } from "react";

const HoverVideoReveal = ({ src, children }) => {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const handleEnter = () => {
    setVisible(true);
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  const handleLeave = () => {
    setVisible(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div
      style={{ position: "relative", display: "inline-flex", cursor: "default", userSelect: "none" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      <div
        style={{
          position: "absolute",
          top: "calc(100% + 14px)",
          left: 0,
          width: "340px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.97)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          pointerEvents: "none",
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: "100%",
            background: "#000",
            border: "1px solid #262626",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <video
            ref={videoRef}
            src={src}
            loop
            muted
            playsInline
            preload="auto"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
};

export default HoverVideoReveal;
