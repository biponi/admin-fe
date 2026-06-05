import { useEffect, useRef, useState } from "react";
import { Check, Search, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MobileKeyboardSearchProps {
  open: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
}

export function MobileKeyboardSearch({
  open,
  searchValue,
  onSearchChange,
  onClose,
}: MobileKeyboardSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!open) return;

    const updateKeyboardOffset = () => {
      const viewport = window.visualViewport;

      if (!viewport) {
        setKeyboardOffset(0);
        return;
      }

      const offset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );

      setKeyboardOffset(offset);
    };

    updateKeyboardOffset();
    window.visualViewport?.addEventListener("resize", updateKeyboardOffset);
    window.visualViewport?.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("resize", updateKeyboardOffset);

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(focusTimer);
      window.visualViewport?.removeEventListener("resize", updateKeyboardOffset);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("resize", updateKeyboardOffset);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[60] px-3 transition-[bottom] duration-200 sm:hidden"
      style={{
        bottom: keyboardOffset > 0 ? keyboardOffset + 8 : 88,
      }}
    >
      <form
        className="mx-auto flex max-w-md items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          inputRef.current?.blur();
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search orders, customers..."
            inputMode="search"
            enterKeyHint="search"
            className="h-11 rounded-xl border-gray-200 pl-9 pr-9 text-base"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <XCircle className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-xl"
        >
          <Check className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
