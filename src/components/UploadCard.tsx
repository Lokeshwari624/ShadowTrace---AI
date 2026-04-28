import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileCheck2, Fingerprint, Loader2, X } from "lucide-react";

const generateFingerprint = () =>
  `STX-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const UploadCard = ({ onScanComplete }: { onScanComplete?: (fp: string, match: number) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchPct, setMatchPct] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const match = Math.floor(Math.random() * 40) + 55; // 55-95
          const fp = generateFingerprint();
          setMatchPct(match);
          setFingerprint(fp);
          setScanning(false);
          onScanComplete?.(fp, match);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [scanning, onScanComplete]);

  const handleFile = (f: File) => {
    setFile(f);
    setProgress(0);
    setMatchPct(null);
    setFingerprint(null);
    setScanning(true);
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setMatchPct(null);
    setFingerprint(null);
    setScanning(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 h-full flex flex-col"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Upload Evidence</h3>
          <p className="text-xs text-muted-foreground">Drop file to fingerprint & cross-scan</p>
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
              className={`relative cursor-pointer h-full min-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
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
                <p className="text-sm font-medium text-foreground">
                  Drag & drop file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or <span className="text-primary">click to browse</span> · Images, video, audio, docs
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full min-h-[180px] flex flex-col"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background-alt/60 border border-border mb-3">
                <FileCheck2 className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-destructive transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {scanning ? (
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-mono">AI scanning...</span>
                    <span className="ml-auto font-mono">{Math.floor(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-background-alt overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-primary"
                      style={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Hashing → Cross-referencing → Mirror sweep
                  </p>
                </div>
              ) : (
                matchPct !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 grid grid-cols-2 gap-3"
                  >
                    <div className="rounded-xl bg-background-alt/60 border border-primary/30 p-3 flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                        <Fingerprint className="h-3 w-3" /> Fingerprint
                      </div>
                      <p className="font-mono text-sm text-primary mt-1">{fingerprint}</p>
                    </div>
                    <div
                      className={`rounded-xl border p-3 flex flex-col justify-center ${
                        matchPct >= 80
                          ? "bg-destructive/10 border-destructive/40"
                          : "bg-warning/10 border-warning/40"
                      }`}
                    >
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Match Found
                      </p>
                      <p
                        className={`font-display text-2xl font-bold ${
                          matchPct >= 80 ? "text-destructive" : "text-warning"
                        }`}
                      >
                        {matchPct}%
                      </p>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UploadCard;
