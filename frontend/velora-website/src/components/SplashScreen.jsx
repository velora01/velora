import { useEffect, useState } from "react";
import "./SplashScreen.css";

const SplashScreen = ({ onFinish }) => {
  const imageSrc = encodeURI("/velora pic.png");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => setReady(true);
    image.onerror = () => setReady(true);

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [imageSrc]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(onFinish, 2600);
    return () => window.clearTimeout(timer);
  }, [ready, onFinish]);

  return (
    <div className="splash-screen">
      <div
        className="curtain-panel curtain-left"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      <div
        className="curtain-panel curtain-right"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      <div className="splash-overlay" />
    </div>
  );
};

export default SplashScreen;
