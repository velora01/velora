import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Clear any old legacy dummy browser local storage data once for fresh launch
try {
  if (!localStorage.getItem("velora_fresh_v2_cleared")) {
    const legacyKeys = [
      "velora_custom_enquiries",
      "velora_custom_boqs",
      "velora_local_invoices",
      "velora_project_custom_edits",
      "velora_used_enquiry_nos",
      "velora_project_documents"
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem("velora_fresh_v2_cleared", "true");
  }
} catch (e) {
  console.warn("Storage reset check:", e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
