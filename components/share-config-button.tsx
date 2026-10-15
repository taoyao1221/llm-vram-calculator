"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, ExternalLink, Link2 } from "lucide-react";
import { generateShareUrl, copyShareUrl } from "@/lib/url-config";
import type { CalcConfig } from "@/components/config-panel";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface ShareConfigButtonProps {
  config: CalcConfig;
}

export function ShareConfigButton({ config }: ShareConfigButtonProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const handleShare = () => {
    const url = generateShareUrl(config);
    setShareUrl(url);
    setOpen(true);
  };

  const handleCopy = async () => {
    const success = await copyShareUrl(config);
    if (success) {
      setCopied(true);
      toast.success(t("share.toastSuccess"));
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t("share.toastError"));
    }
  };

  const handleOpenInNewTab = () => {
    const url = generateShareUrl(config);
    window.open(url, '_blank');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs h-8"
        onClick={handleShare}
      >
        <Share2 className="w-3.5 h-3.5" />
        {t("share.button")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              {t("share.title")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              {t("share.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            {/* Configuration summary */}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">{t("share.gpu")}</span>{" "}
                  <span className="font-medium text-foreground">{config.gpu.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("share.model")}</span>{" "}
                  <span className="font-medium text-foreground">{config.model.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("share.quantization")}</span>{" "}
                  <span className="font-medium text-foreground">{config.quant.label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("share.context")}</span>{" "}
                  <span className="font-medium text-foreground">{config.contextLen.toLocaleString()}{t("config.unitTokens")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("share.users")}</span>{" "}
                  <span className="font-medium text-foreground">{config.concurrentUsers}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("share.estVram")}</span>{" "}
                  <span className="font-medium text-emerald-400">{/* VRAM calculated dynamically */}</span>
                </div>
              </div>
            </div>

            {/* URL input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">{t("share.shareableUrl")}</label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs h-9 flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleOpenInNewTab}
              className="gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t("share.openInNewTab")}
            </Button>
            <Button
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {t("share.copied")}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {t("share.copyUrl")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
