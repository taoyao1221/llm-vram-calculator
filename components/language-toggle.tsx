"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t("language.label")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("zh")} className="gap-2">
          <Check className={`h-4 w-4 ${locale === "zh" ? "opacity-100" : "opacity-0"}`} />
          {t("language.zh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")} className="gap-2">
          <Check className={`h-4 w-4 ${locale === "en" ? "opacity-100" : "opacity-0"}`} />
          {t("language.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}