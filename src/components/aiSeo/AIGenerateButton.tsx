import { Button } from "../../components/ui/button";
import { Sparkles } from "lucide-react";

interface AIGenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function AIGenerateButton({
  onClick,
  disabled,
}: AIGenerateButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-1.5 px-3 h-8 text-[12px] font-medium text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-[#141413] hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors">
      <Sparkles className="h-3.5 w-3.5" />
      Generate with AI
    </Button>
  );
}
