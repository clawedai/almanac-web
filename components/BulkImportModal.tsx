"use client";

import { useState, useRef, useCallback } from "react";
import { getToken } from "../lib/api";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: number, skipped: number) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  created: number;
  skipped: number;
  failed: number;
  errors: string[];
  preview: Array<{ id: string; full_name: string | null; company: string | null; email: string | null }>;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [step, setStep] = useState<"upload" | "importing" | "results">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx")) {
      setError("Only .csv or .xlsx files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    setSelectedFile(file);
    setError("");
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!selectedFile) return;
    const token = getToken();
    if (!token) return;

    setStep("importing");
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/bulk-import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data: ImportResult = await res.json();
      setResult(data);
      setStep("results");

      if (data.success) {
        onSuccess(data.created, data.skipped);
      }
    } catch {
      setError("Network error. Is the backend running?");
      setStep("upload");
    }
  }

  function handleReset() {
    setStep("upload");
    setSelectedFile(null);
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
      onClick={(e) => e.target === e.currentTarget && step !== "importing" && onClose()}
    >
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          padding: "40px",
          width: "100%",
          maxWidth: "560px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {/* Close */}
        {step !== "importing" && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "16px", right: "16px",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--ink-tertiary)", fontSize: "1.2rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          </button>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", margin: 0, color: "var(--ink-primary)" }}>
              Bulk Import
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)", margin: "4px 0 0" }}>
              Upload a CSV or Excel file to import prospects
            </p>
          </div>
        </div>

        {/* Upload step */}
        {step === "upload" && (
          <>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border-default)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(217,164,70,0.05)" : "var(--surface-inset)",
                transition: "all 0.15s ease",
                marginBottom: "16px",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink-tertiary)" strokeWidth="1.5" style={{ marginBottom: "12px" }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="11" x2="12" y2="17" strokeLinecap="round"/>
                <line x1="9" y1="14" x2="15" y2="14" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-secondary)", margin: "0 0 4px" }}>
                Drag & drop your file here
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--ink-tertiary)", margin: 0 }}>
                or <span style={{ color: "var(--accent)", textDecoration: "underline" }}>click to browse</span> — .csv or .xlsx
              </p>
            </div>

            {/* Selected file */}
            {selectedFile && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(217,164,70,0.08)", border: "1px solid rgba(217,164,70,0.25)",
                borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--ink-primary)", margin: 0, fontWeight: 500 }}>{selectedFile.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", margin: 0 }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-tertiary)", padding: "2px" }}
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4l12 12M16 4L4 16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Column guide */}
            <div style={{
              background: "var(--surface-inset)",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "20px",
              fontSize: "0.78rem",
              color: "var(--ink-tertiary)",
              lineHeight: "1.6",
            }}>
              <strong style={{ color: "var(--ink-secondary)" }}>Supported columns:</strong> full_name, company, email, title, linkedin_url, instagram_handle, company_domain, twitter_handle, phone, location.<br />
              <span style={{ color: "var(--danger)" }}>Email is required</span> for every row.
            </div>

            {error && (
              <div style={{
                background: "rgba(200,75,49,0.1)",
                border: "1px solid var(--danger)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                color: "var(--danger)",
              }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleImport}
              disabled={!selectedFile}
              style={{ width: "100%" }}
            >
              Import Prospects
            </button>
          </>
        )}

        {/* Importing step */}
        {step === "importing" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: "48px", height: "48px",
              border: "3px solid var(--border-default)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <p style={{ fontSize: "0.9rem", color: "var(--ink-secondary)", margin: 0 }}>
              Importing prospects...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results step */}
        {step === "results" && result && (
          <>
            {result.success ? (
              <div style={{ marginBottom: "24px" }}>
                {/* Summary stats */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px", marginBottom: "20px",
                }}>
                  <div style={{
                    background: "rgba(100,200,100,0.08)",
                    border: "1px solid rgba(100,200,100,0.2)",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#64C864", lineHeight: 1 }}>
                      {result.created}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Created
                    </div>
                  </div>
                  <div style={{
                    background: "rgba(217,164,70,0.08)",
                    border: "1px solid rgba(217,164,70,0.2)",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
                      {result.skipped}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Skipped
                    </div>
                  </div>
                  <div style={{
                    background: result.failed > 0 ? "rgba(200,75,49,0.08)" : "var(--surface-inset)",
                    border: result.failed > 0 ? "1px solid rgba(200,75,49,0.2)" : "1px solid var(--border-default)",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: result.failed > 0 ? "var(--danger)" : "var(--ink-tertiary)", lineHeight: 1 }}>
                      {result.failed}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Failed
                    </div>
                  </div>
                </div>

                {/* Preview table */}
                {result.preview.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                      Preview (first {result.preview.length})
                    </p>
                    <div style={{
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                        <thead>
                          <tr style={{ background: "var(--surface-inset)" }}>
                            <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink-tertiary)", fontWeight: 600 }}>Name</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink-tertiary)", fontWeight: 600 }}>Company</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink-tertiary)", fontWeight: 600 }}>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.preview.map((p) => (
                            <tr key={p.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                              <td style={{ padding: "8px 12px", color: "var(--ink-primary)" }}>{p.full_name || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "var(--ink-secondary)" }}>{p.company || "—"}</td>
                              <td style={{ padding: "8px 12px", color: "var(--ink-tertiary)" }}>{p.email || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                      Errors ({result.errors.length})
                    </p>
                    <div style={{
                      background: "rgba(200,75,49,0.06)",
                      border: "1px solid rgba(200,75,49,0.15)",
                      borderRadius: "8px",
                      maxHeight: "120px",
                      overflowY: "auto",
                      padding: "8px 12px",
                    }}>
                      {result.errors.slice(0, 10).map((err, i) => (
                        <p key={i} style={{ fontSize: "0.75rem", color: "var(--danger)", margin: "2px 0", fontFamily: "monospace" }}>
                          {err}
                        </p>
                      ))}
                      {result.errors.length > 10 && (
                        <p style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)", margin: "4px 0 0" }}>
                          ...and {result.errors.length - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: "rgba(200,75,49,0.08)",
                border: "1px solid rgba(200,75,49,0.2)",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "0.9rem", color: "var(--danger)", margin: 0 }}>{result.message}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                Import More
              </button>
              <button className="btn-primary" onClick={onClose} style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
