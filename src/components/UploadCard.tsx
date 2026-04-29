import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileCheck2,
  Fingerprint,
  Loader2,
  X,
  ShieldCheck,
  Hash,
  Globe2,
  Clock,
  Cpu,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { api } from "@/api/endpoints";
import type { ScanResult } from "@/api/types";

const RISK_STYLES = {
  high:   { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", bar: "bg-destructive", label: "High Risk" },
  medium: { text: "text-warning",     bg: "bg-warning/10",     border: "border-warning/40",     bar: "bg-warning",     label: "Medium" },
  low:    { text: "text-success",     bg: "bg-success/10",     border: "border-success/40",     bar: "bg-success",     label: "Low Risk" },
} as const;

type Status = "idle" | "uploading" | "scanning" | "done" | "error";

const UploadCard = ({ onScanComplete }: { onScanComplete?: (result: ScanResult) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus("uploading");

    // local preview
    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }

    // animate progress while we kick off the scan
    let p = 0;
    const tick = setInterval(() => {
      p += Math.random() * 9 + 3;
      if (p >= 92) p = 92;
      setProgress(p);
    }, 110);

    setStatus("scanning");
    const res = await api.scan({
      fileName: f.name,
      fileSize: f.size,
      fileType: f.type || "application/octet-stream",
    });
    clearInterval(tick);
    setProgress(100);

    if (res.ok && res.data) {
      setResult(res.data);
      setStatus("done");
      onScanComplete?.(res.data);
    } else {
      setError(res.error ?? "Scan failed. Please retry.");
      setStatus("error");
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProgress(0);
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  const copyFp = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const r = result ? RISK_STYLES[result.risk] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 h-full flex flex-col"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Upload Evidence</h3>
          <p className="text-xs text-muted-foreground">Drop file → AI fingerprint → cross-network sweep</p>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/30">
          ENGINE: ACTIVE
        </span>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="drop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer h-full min-h-[220px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
                drag
                  ? "border-primary bg-primary/10 shadow-[0_0_30px_hsl(189_94%_53%/0.4)]"
                  : "border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-xl" />
                <UploadCloud className="relative h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drag & drop file here</p>
                <p className="text-xs text-muted-foreground mt-1">
                  or <span className="text-primary">click to browse</span> · Images, video, audio, docs
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col"
            >
              {/* File header + preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background-alt/60 border border-border mb-3">
                {preview && file.type.startsWith("image/") ? (
                  <img src={preview} alt="" className="h-10 w-10 rounded-lg object-cover border border-primary/30" />
                ) : preview && file.type.startsWith("video/") ? (
                  <video src={preview} className="h-10 w-10 rounded-lg object-cover border border-primary/30" />
                ) : (
                  <FileCheck2 className="h-5 w-5 text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB · {file.type || "unknown"}
                  </p>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-destructive transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {status === "scanning" || status === "uploading" ? (
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-mono">
                      {status === "uploading" ? "Uploading…" : "AI scanning…"}
                    </span>
                    <span className="ml-auto font-mono">{Math.floor(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-background-alt overflow-hidden">
                    <motion.div className="h-full bg-gradient-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Hashing → Cross-referencing → Mirror sweep across {Math.floor(20 + progress / 2)} sources
                  </p>
                </div>
              ) : status === "error" ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                  <button
                    onClick={reset}
                    className="text-xs px-3 py-1.5 rounded-lg border border-primary/40 text-primary hover:bg-primary/10"
                  >
                    Try again
                  </button>
                </div>
              ) : result && r ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-3 rounded-xl bg-background-alt/60 border border-primary/30 p-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                      <div className="relative flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                            <Fingerprint className="h-3 w-3 text-primary" /> Fingerprint ID
                          </div>
                          <p className="font-mono text-sm text-primary mt-1 truncate">{result.fingerprint}</p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-1 truncate">
                            SHA-256 · {result.sha256.slice(0, 24)}…
                          </p>
                        </div>
                        <button
                          onClick={copyFp}
                          className="shrink-0 p-1.5 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition"
                          title="Copy fingerprint"
                        >
                          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className={`sm:col-span-2 rounded-xl border p-3 flex flex-col justify-center ${r.bg} ${r.border}`}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                        Match Confidence
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className={`font-display text-2xl font-bold ${r.text}`}>
                          {result.matchConfidence}%
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {r.label}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-background-alt overflow-hidden">
                        <div className={`h-full ${r.bar}`} style={{ width: `${result.matchConfidence}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <DetailTile icon={<Cpu className="h-3 w-3" />}        label="Algorithm" value={result.algorithm} />
                    <DetailTile icon={<Hash className="h-3 w-3" />}       label="pHash"     value={result.pHash.slice(0, 10)} mono />
                    <DetailTile icon={<Globe2 className="h-3 w-3" />}     label="Mirrors"   value={`${result.mirrorsFound} found`} />
                    <DetailTile icon={<ShieldCheck className="h-3 w-3" />} label="Sources"   value={`${result.sourcesScanned} scanned`} />
                  </div>

                  {result.platforms.length > 0 && (
                    <div className="rounded-xl bg-background-alt/40 border border-border p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                        Platforms detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.platforms.map((p) => {
                          const ps = RISK_STYLES[p.risk];
                          return (
                            <span
                              key={p.platform}
                              className={`text-[11px] font-mono px-2 py-1 rounded-md border ${ps.bg} ${ps.border} ${ps.text}`}
                            >
                              {p.platform} · {p.matches}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/50 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(result.scannedAt).toLocaleTimeString()} · {result.durationMs}ms
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      {result.region}
                    </span>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const DetailTile = ({
  icon, label, value, mono,
}: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
  <div className="rounded-lg bg-background-alt/50 border border-border p-2.5 hover:border-primary/40 transition-colors">
    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
      {icon}{label}
    </div>
    <p className={`mt-1 text-xs text-foreground/90 truncate ${mono ? "font-mono" : "font-medium"}`}>
      {value}
    </p>
  </div>
);

export default UploadCard;
