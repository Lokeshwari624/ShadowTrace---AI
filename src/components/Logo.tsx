import { Shield } from "lucide-react";

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-base" },
    md: { icon: "h-7 w-7", text: "text-xl" },
    lg: { icon: "h-10 w-10", text: "text-3xl" },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60" />
        <div className="relative bg-gradient-primary p-2 rounded-xl">
          <Shield className={`${s.icon} text-background`} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`font-display font-bold ${s.text} text-gradient`}>
          ShadowTrace
        </span>
        <span className="font-display text-[10px] tracking-[0.3em] text-primary/70 uppercase">
          AI Sentinel
        </span>
      </div>
    </div>
  );
};

export default Logo;
