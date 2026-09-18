/**
 * Keep-Alive Service for Free Tier Hosting (e.g. Render)
 * Automatically pings the server health endpoint every 5 minutes to prevent cold starts / sleep mode.
 */

const DEFAULT_BACKEND_URL = "https://velora-backend-usq1.onrender.com";
let pingInterval = null;

export const startKeepAlive = (intervalMinutes = 5) => {
  // Clear any existing interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  const rawUrl =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.SERVER_URL ||
    DEFAULT_BACKEND_URL;

  const baseUrl = rawUrl.replace(/\/$/, "");
  const healthUrl = `${baseUrl}/api/health`;
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

  console.log(`[Keep-Alive] Initialized self-ping service for: ${healthUrl} (Every ${intervalMinutes} mins)`);

  const pingServer = async () => {
    try {
      const startTime = Date.now();
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: { "User-Agent": "Velora-KeepAlive-Worker/1.0" },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      const duration = Date.now() - startTime;
      if (response.ok) {
        console.log(`[Keep-Alive] Heartbeat ping success (${response.status}) in ${duration}ms at ${new Date().toISOString()}`);
      } else {
        console.warn(`[Keep-Alive] Heartbeat responded with status ${response.status} at ${new Date().toISOString()}`);
      }
    } catch (err) {
      console.warn(`[Keep-Alive] Heartbeat ping skipped/failed: ${err.message}`);
    }
  };

  // Schedule regular interval
  pingInterval = setInterval(pingServer, intervalMs);

  // Initial ping after 30 seconds
  setTimeout(pingServer, 30000);
};

export const stopKeepAlive = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    console.log("[Keep-Alive] Self-ping service stopped");
  }
};

export default {
  startKeepAlive,
  stopKeepAlive,
};
