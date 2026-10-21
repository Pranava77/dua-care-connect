import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAiSettings, useRemoveAiKey, useUpdateAiSettings } from "@/hooks/queries/settings";

const SOURCE_LABEL = {
  settings: "Key saved in Settings",
  environment: "Key from server environment",
} as const;

/** Admin card for bringing your own Gemini API key. The key is write-only: it is never shown again after saving. */
export function AiProviderCard() {
  const { data: settings, isLoading } = useAiSettings();
  const update = useUpdateAiSettings();
  const remove = useRemoveAiKey();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (settings) setModel(settings.chat_model ?? settings.default_chat_model);
  }, [settings]);

  const currentModel = settings?.chat_model ?? settings?.default_chat_model ?? "";
  const modelChanged = !!model.trim() && model.trim() !== currentModel;
  const canSave = !!apiKey.trim() || (modelChanged && (settings?.has_saved_key || settings?.env_key_configured));

  const save = async () => {
    try {
      const result = await update.mutateAsync({
        ...(apiKey.trim() && { api_key: apiKey.trim() }),
        ...(modelChanged && { chat_model: model.trim() }),
      });
      setApiKey("");
      setShowKey(false);
      toast.success(`AI enabled with ${result.chat_model}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save AI settings");
    }
  };

  const removeKey = async () => {
    try {
      const result = await remove.mutateAsync();
      toast.success(result.enabled ? "Saved key removed; using the server's environment key" : "Saved key removed; AI is now off");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the key");
    } finally {
      setConfirmRemove(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Provider
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your own Google Gemini API key to power the assistant, semantic search, document analysis and report
          drafts. Get a key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-primary underline">
            Google AI Studio
          </a>.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !settings ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={settings.enabled ? "default" : "outline"}>{settings.enabled ? "AI enabled" : "AI off"}</Badge>
              {settings.source && <Badge variant="outline">{SOURCE_LABEL[settings.source]}</Badge>}
              {settings.key_hint && <Badge variant="outline" className="font-mono">{settings.key_hint}</Badge>}
              {settings.enabled && <span className="text-muted-foreground">Model: {settings.chat_model}</span>}
            </div>
            {settings.updated_by && settings.updated_at && (
              <p className="text-xs text-muted-foreground">
                Last changed by {settings.updated_by} on {new Date(settings.updated_at).toLocaleString()}
              </p>
            )}

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gemini-key">{settings.has_saved_key ? "Replace API key" : "Gemini API key"}</Label>
                <div className="relative">
                  <Input
                    id="gemini-key"
                    type={showKey ? "text" : "password"}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={settings.has_saved_key ? `Saved key ${settings.key_hint}` : "AIza…"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono"
                  />
                  {/* Plain button: the shared Button's ripple style forces position: relative */}
                  <button type="button" onClick={() => setShowKey(!showKey)} aria-label={showKey ? "Hide key" : "Show key"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemini-model">Chat model</Label>
                <Input id="gemini-model" value={model} onChange={(e) => setModel(e.target.value)}
                  placeholder={settings.default_chat_model} className="font-mono" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The key is checked with Google before it is saved, stored encrypted on the server and never shown again.
              Changing provider rebuilds the search index in the background.
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              {settings.has_saved_key && (
                <Button variant="outline" onClick={() => setConfirmRemove(true)} disabled={remove.isPending}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove saved key
                </Button>
              )}
              <Button onClick={save} disabled={!canSave || update.isPending}>
                {update.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
                {update.isPending ? "Verifying…" : "Verify & save"}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove the saved API key?</AlertDialogTitle>
            <AlertDialogDescription>
              {settings?.env_key_configured
                ? "The app will fall back to the key configured on the server."
                : "AI features (assistant, document analysis, report drafts) will stop working until a new key is added."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeKey}>Remove key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
