import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    const user = {
      email,
      name: name || email.split("@")[0],
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem("shadowtrace_user", JSON.stringify(user));
    toast.success(mode === "login" ? "Access granted" : "Account created");
    setTimeout(() => navigate("/dashboard"), 400);
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <ThreeBackground />

      {/* LEFT — Brand Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex-1 flex items-center justify-center p-8 lg:p-16 min-h-[40vh] lg:min-h-screen"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass rounded-2xl p-8 lg:p-10 animate-pulse-glow"
          >
            <Logo size="lg" />
            <div className="mt-8 space-y-4">
              <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight">
                Trace the <span className="text-gradient">untraceable</span>.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered content fingerprinting that detects ownership conflicts,
                metadata tampering, and mirror matches across the open web — in real time.
              </p>

              <div className="pt-4 space-y-3">
                {[
                  { label: "Real-time threat detection", color: "primary" },
                  { label: "Quantum fingerprint hashing", color: "accent" },
                  { label: "Cross-network mirror scanning", color: "teal" },
                ].map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className={`h-2 w-2 rounded-full bg-${f.color} shadow-[0_0_10px_currentColor]`} />
                    <span className="text-foreground/80">{f.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Powered by ShadowTrace Neural Engine v4.2</span>
          </div>
        </div>
      </motion.div>

      {/* RIGHT — Auth Panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative flex-1 flex items-center justify-center p-8 lg:p-16 min-h-[60vh] lg:min-h-screen"
      >
        <div className="w-full max-w-[380px]">
          <div className="glass-strong rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Sign in to your secure command center."
                  : "Join the next-gen content defense network."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {mode === "signup" && (
                <Field
                  icon={<Sparkles className="h-4 w-4" />}
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={setName}
                />
              )}
              <Field
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="agent@shadowtrace.ai"
                value={email}
                onChange={setEmail}
              />
              <Field
                icon={<Lock className="h-4 w-4" />}
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="relative w-full group rounded-xl py-3 px-4 font-semibold text-background bg-gradient-primary overflow-hidden shadow-[0_0_25px_hsl(189_94%_53%/0.4)] hover:shadow-[0_0_40px_hsl(189_94%_53%/0.7)] transition-shadow"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {mode === "login" ? "Initialize Session" : "Activate Account"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? "New operative?" : "Already enrolled?"}{" "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "login" ? "Create account" : "Sign in"}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to ShadowTrace's <span className="text-primary/80">Terms</span> &{" "}
            <span className="text-primary/80">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Field = ({
  icon,
  type,
  placeholder,
  value,
  onChange,
  trailing,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) => (
  <div className="relative group">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
      {icon}
    </span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={type === "password" ? "new-password" : "off"}
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-form-type="other"
      data-lpignore="true"
      data-1p-ignore="true"
      name={`stx-${Math.random().toString(36).slice(2, 8)}`}
      className="w-full bg-input/40 border border-border rounded-xl py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_15px_hsl(189_94%_53%/0.2)] transition-all"
    />
    {trailing && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</span>
    )}
  </div>
);

export default Login;
