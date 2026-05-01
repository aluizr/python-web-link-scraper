import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X, AlertCircle, Link2, StickyNote } from "lucide-react";
import { useMetadata } from "@/hooks/use-metadata";
import { useLinkDraft } from "@/hooks/use-link-draft";
import { useDuplicateDetector } from "@/hooks/use-duplicate-detector";
import { LinkPreview } from "@/components/LinkPreview";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TEXT_XS_CLASS } from "@/lib/utils";
import { uploadLinkThumbnail, deleteLinkThumbnail, getLocalBlobUrl } from "@/lib/storage-utils";
import { ImageIcon, Upload, Trash2, Camera, Loader2, Scissors, Crop, ScissorsSquareDashedBottom } from "lucide-react";
import { ScreenCropSelector } from "@/components/ScreenCropSelector";
import { ImageCropTool } from "@/components/ImageCropTool";
import { toast } from "sonner";
import type { LinkItem, Category, LinkPriority, LinkStatus } from "@/types/link";

interface LinkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  links: LinkItem[];
  editingLink?: LinkItem | null;
  onSubmit: (data: Omit<LinkItem, "id" | "createdAt" | "position">) => void | Promise<void>;
  onEditDuplicate?: (link: LinkItem) => void;
}

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export function LinkForm({ open, onOpenChange, categories, links, editingLink, onSubmit, onEditDuplicate }: LinkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [favicon, setFavicon] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [status, setStatus] = useState<LinkStatus>("backlog");
  const [priority, setPriority] = useState<LinkPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [forceAllowDuplicate, setForceAllowDuplicate] = useState(false);
  const { metadata, fetchMetadata } = useMetadata();
  const [autoFilledTitle, setAutoFilledTitle] = useState(false);
  const { hasDraft, draftData, saveDraft, restoreDraft, clearDraft, discardDraft } = useLinkDraft();
  const { isDuplicate, duplicateLink } = useDuplicateDetector(url, links, editingLink?.id);
  const draftTimeoutRef = useRef<NodeJS.Timeout>();
  const initialLoadDone = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading]     = useState(false);
  const [isCapturing, setIsCapturing]     = useState(false);
  const [cropImageSrc, setCropImageSrc]   = useState<string | null>(null);
  const [cropOgImageSrc, setCropOgImageSrc] = useState<string | null>(null);
  const [isCropLoading, setIsCropLoading] = useState(false);

  const parentCategories = categories.filter((c) => !c.parentId);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const categoryOptions = useMemo(() => {
    const buildFullName = (cat: Category): string => {
      const parts: string[] = [cat.name];
      let current = cat;
      while (current.parentId) {
        const parent = categories.find((c) => c.id === current.parentId);
        if (!parent) break;
        parts.unshift(parent.name);
        current = parent;
      }
      return parts.join(" / ");
    };

    const options: { id: string; label: string; fullName: string; depth: number }[] = [];
    const addChildren = (parentId: string | null, depth: number) => {
      const children = categories
        .filter((c) => (parentId ? c.parentId === parentId : !c.parentId))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      for (const child of children) {
        options.push({
          id: child.id,
          label: "\u00A0\u00A0".repeat(depth) + child.name,
          fullName: buildFullName(child),
          depth,
        });
        addChildren(child.id, depth + 1);
      }
    };

    addChildren(null, 0);
    return options;
  }, [categories]);

  const resolveSelection = useCallback((categoryValue: string): string => {
    if (!categoryValue) return "";
    const found = categoryOptions.find((opt) => opt.fullName === categoryValue);
    return found?.id ?? "";
  }, [categoryOptions]);

  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url);
      setTitle(editingLink.title);
      setDescription(editingLink.description);
      setSelectedCategoryId(resolveSelection(editingLink.category));
      setTags(editingLink.tags);
      setNotes(editingLink.notes || "");
      setFavicon(editingLink.favicon);
      setOgImage(editingLink.ogImage || "");
      setStatus(editingLink.status || "backlog");
      setPriority(editingLink.priority || "medium");
      setDueDate(editingLink.dueDate || "");
      setAutoFilledTitle(true);
      setShowDraftRecovery(false);
      setForceAllowDuplicate(false);
      initialLoadDone.current = true;
    } else {
      // Abrir formulário novo - mostrar opção de recuperar rascunho se existe
      if (open && hasDraft && !initialLoadDone.current) {
        setShowDraftRecovery(true);
      } else if (!open) {
        // Fechar formulário - resetar flag
        initialLoadDone.current = false;
        setForceAllowDuplicate(false);
      } else if (open && !hasDraft) {
        // Formulário aberto sem rascunho
        setUrl("");
        setTitle("");
        setDescription("");
        setSelectedCategoryId("");
        setTags([]);
        setNotes("");
        setFavicon("");
        setOgImage("");
        setStatus("backlog");
        setPriority("medium");
        setDueDate("");
        setAutoFilledTitle(false);
        setForceAllowDuplicate(false);
        initialLoadDone.current = true;
      }
    }
  }, [editingLink, open, categories, hasDraft, resolveSelection]);

  // Reset forceAllowDuplicate quando URL mudar
  useEffect(() => {
    setForceAllowDuplicate(false);
  }, [url]);

  // Auto-preview: when URL changes, try to get favicon and metadata
  useEffect(() => {
    if (!url || !open) return;
    
    // Se estiver editando e a URL for a mesma do link original, não faz nada
    const isEditingOriginalUrl = editingLink && normalizeUrl(url) === normalizeUrl(editingLink.url);
    if (isEditingOriginalUrl && initialLoadDone.current) return;

    try {
      const hostname = new URL(url).hostname;
      // Só sobrescreve o favicon se não estiver editando ou se o campo estiver vazio
      if (!editingLink || !favicon) {
        setFavicon(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`);
      }
    } catch {
      // invalid URL, ignore
    }

    // Fetch metadata with debounce (wait 500ms after user stops typing)
    const timer = setTimeout(() => {
      fetchMetadata(url).then((result) => {
        // Auto-fill title if not already set and we got a title from metadata
        if (!editingLink && !title && result.title && !autoFilledTitle) {
          setTitle(result.title);
          setAutoFilledTitle(true);
        }
        // Auto-fill description if it's empty
        if (!description && result.description) {
          setDescription(result.description);
        }
        // Auto-fill OG image apenas se estiver vazio ou se for um novo link
        if (result.image && (!ogImage || !editingLink)) {
          // Se for novo link, ou se o campo de imagem estiver vazio, preenche
          if (!ogImage || !editingLink) {
             setOgImage(result.image);
          }
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [url, open, editingLink, autoFilledTitle, title, description, ogImage, favicon, fetchMetadata]);

  // Auto-save draft com debounce (não salva enquanto está editando um link existente)
  useEffect(() => {
    if (editingLink) return; // Não salvar rascunho enquanto edita um link

    // Limpar timeout anterior
    if (draftTimeoutRef.current) clearTimeout(draftTimeoutRef.current);

    // Agendar salvamento do rascunho
    draftTimeoutRef.current = setTimeout(() => {
      saveDraft({
        url,
        title,
        description,
        notes,
        selectedCategoryId,
        status,
        priority,
        dueDate: dueDate || null,
        tags,
        favicon,
        ogImage,
      });
    }, 500);

    return () => {
      const timeoutRef = draftTimeoutRef.current;
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      draftTimeoutRef.current = undefined;
    };
  }, [url, title, description, notes, selectedCategoryId, status, priority, dueDate, tags, favicon, ogImage, editingLink, saveDraft]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Validar duplicata
    if (isDuplicate && !forceAllowDuplicate) {
      setForceAllowDuplicate(true);
      return;
    }

    const selectedOption = categoryOptions.find((opt) => opt.id === selectedCategoryId);
    const categoryValue = selectedOption?.fullName ?? "";
    const finalUrl = normalizeUrl(url);

    let fetchedTitle: string | null = null;
    let fetchedDescription: string | null = null;
    let fetchedImage: string | null = null;
    let fetchedFavicon: string | null = null;

    if (!editingLink && (!title.trim() || !description.trim() || !ogImage || !favicon)) {
      const fetched = await fetchMetadata(finalUrl);
      fetchedTitle = fetched.title;
      fetchedDescription = fetched.description;
      fetchedImage = fetched.image;
      fetchedFavicon = fetched.favicon;
    }

    const cleanProxyUrl = (urlStr: string | null | undefined): string => {
      if (!urlStr) return "";
      let finalUrl = urlStr.trim();
      if (finalUrl.includes("/og-proxy?url=")) {
        try {
          const extracted = new URL(finalUrl, "http://localhost").searchParams.get("url");
          if (extracted) finalUrl = extracted;
        } catch (err) {
          console.debug("[LinkForm] Proxy URL cleaning error:", err);
        }
      }
      return finalUrl;
    };

    const finalImage = cleanProxyUrl(ogImage || fetchedImage);
    const finalFavicon = cleanProxyUrl(favicon || fetchedFavicon);

    await onSubmit({
      url: finalUrl,
      title: title.trim() || fetchedTitle || finalUrl,
      description: description.trim() || fetchedDescription || "",
      category: categoryValue,
      tags,
      notes: notes.trim(),
      isFavorite: editingLink?.isFavorite ?? false,
      favicon: finalFavicon,
      ogImage: finalImage,
      status,
      priority,
      dueDate: dueDate || null,
    });
    // Limpar rascunho após envio bem-sucedido
    clearDraft();
    onOpenChange(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const publicUrl = await uploadLinkThumbnail(file);
      if (publicUrl) {
        // Se já havia uma imagem do Supabase, podemos tentar deletar a antiga
        if (ogImage && ogImage.includes("link-thumbnails")) {
          await deleteLinkThumbnail(ogImage);
        }
        setOgImage(publicUrl);
        toast.success("Imagem carregada com sucesso!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar imagem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (ogImage && ogImage.includes("link-thumbnails")) {
      await deleteLinkThumbnail(ogImage);
    }
    setOgImage("");
    toast.info("Imagem removida");
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!open) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          try {
            setIsUploading(true);
            const publicUrl = await uploadLinkThumbnail(file);
            if (publicUrl) {
              setOgImage(publicUrl);
              toast.success("Imagem colada com sucesso!");
            }
          } catch (err) {
            toast.error("Erro ao colar imagem");
          } finally {
            setIsUploading(false);
          }
        }
      }
    }
  }, [open, setOgImage]);

  useEffect(() => {
    if (open) {
      window.addEventListener("paste", handlePaste);
    }
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [open, handlePaste]);

  const handleScreenCapture = async () => {
    try {
      setIsCapturing(true);
      // Solicita permissão para capturar tela/janela
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "never" } as MediaTrackConstraints,
        audio: false
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Aguarda um pouco para o vídeo carregar o frame
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Para o stream
      stream.getTracks().forEach(track => track.stop());

      // Converte para Blob e sobe
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
          try {
            setIsUploading(true);
            const publicUrl = await uploadLinkThumbnail(file);
            if (publicUrl) {
              setOgImage(publicUrl);
              toast.success("Captura realizada!");
            }
          } catch (err) {
            toast.error("Erro ao subir captura");
          } finally {
            setIsUploading(false);
            setIsCapturing(false);
          }
        }
      }, "image/png");

    } catch (err) {
      console.error(err);
      setIsCapturing(false);
      if (err instanceof Error && err.name !== "NotAllowedError") {
        toast.error("Erro ao iniciar captura");
      }
    }
  };

  const handleSelectArea = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "never" } as MediaTrackConstraints,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());

      const dataUrl = canvas.toDataURL("image/png");
      setCropImageSrc(dataUrl);
    } catch (err) {
      if (err instanceof Error && err.name !== "NotAllowedError") {
        toast.error("Erro ao iniciar captura de área");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropImageSrc(null);
    try {
      setIsUploading(true);
      const file = new File([blob], `crop-${Date.now()}.png`, { type: "image/png" });
      const publicUrl = await uploadLinkThumbnail(file);
      if (publicUrl) {
        if (ogImage && ogImage.includes("link-thumbnails")) {
          await deleteLinkThumbnail(ogImage);
        }
        setOgImage(publicUrl);
        toast.success("Área selecionada como capa!");
      }
    } catch (err) {
      toast.error("Erro ao subir imagem recortada");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropImageSrc(null);
  };

  // ── Recortar imagem existente (ogImage) ──────────────────────────────────
  const handleOpenImageCrop = async () => {
    if (!ogImage) return;
    setIsCropLoading(true);
    try {
      // Converte para objectURL local (Supabase client para Storage URLs,
      // fetch com CORS para URLs externas) — garante canvas sem taint
      const blobUrl = await getLocalBlobUrl(ogImage);
      setCropOgImageSrc(blobUrl);
    } catch (err) {
      // Fallback: passa a URL diretamente (ImageCropTool tentará de novo internamente)
      setCropOgImageSrc(ogImage);
    } finally {
      setIsCropLoading(false);
    }
  };

  const handleImageCropConfirm = async (blob: Blob) => {
    // Revoga o objectURL para liberar memória
    if (cropOgImageSrc?.startsWith("blob:")) URL.revokeObjectURL(cropOgImageSrc);
    setCropOgImageSrc(null);
    try {
      setIsUploading(true);
      const file = new File([blob], `crop-${Date.now()}.webp`, { type: "image/webp" });
      const publicUrl = await uploadLinkThumbnail(file);
      if (publicUrl) {
        if (ogImage && ogImage.includes("link-thumbnails")) {
          await deleteLinkThumbnail(ogImage);
        }
        setOgImage(publicUrl);
        toast.success("Imagem recortada e salva!");
      }
    } catch {
      toast.error("Erro ao salvar imagem recortada");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageCropCancel = () => {
    if (cropOgImageSrc?.startsWith("blob:")) URL.revokeObjectURL(cropOgImageSrc);
    setCropOgImageSrc(null);
  };

  const handleRecoverDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setUrl(draft.url);
      setTitle(draft.title);
      setDescription(draft.description);
      setNotes(draft.notes || "");
      setSelectedCategoryId(draft.selectedCategoryId || draft.selectedParentId || "");
      setStatus(draft.status || "backlog");
      setPriority(draft.priority || "medium");
      setDueDate(draft.dueDate || "");
      setTags(draft.tags);
      setFavicon(draft.favicon);
      setOgImage(draft.ogImage || "");
      setAutoFilledTitle(!!draft.title); // Mark as auto-filled so it doesn't get overwritten
    }
    setShowDraftRecovery(false);
    initialLoadDone.current = true;
  };

  const handleDiscardDraft = () => {
    discardDraft();
    setShowDraftRecovery(false);
    setUrl("");
    setTitle("");
    setDescription("");
    setNotes("");
    setSelectedCategoryId("");
    setStatus("backlog");
    setPriority("medium");
    setDueDate("");
    setTags([]);
    setFavicon("");
    setOgImage("");
    setAutoFilledTitle(false);
    initialLoadDone.current = true;
  };

  const handleEditDuplicate = () => {
    if (duplicateLink && onEditDuplicate) {
      onEditDuplicate(duplicateLink);
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Overlay de seleção de área (screen capture) */}
      {cropImageSrc && (
        <ScreenCropSelector
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      {/* Ferramenta de recorte da imagem existente */}
      {cropOgImageSrc && (
        <ImageCropTool
          imageSrc={cropOgImageSrc}
          onConfirm={handleImageCropConfirm}
          onCancel={handleImageCropCancel}
        />
      )}
      {/* Dialog de recuperação de rascunho */}
      <AlertDialog open={showDraftRecovery} onOpenChange={setShowDraftRecovery}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Recuperar rascunho anterior?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Encontramos um rascunho de link salvo automaticamente. Deseja restaurá-lo ou descartar e começar do zero?
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 pt-4">
            <AlertDialogCancel onClick={handleDiscardDraft}>
              Descartar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRecoverDraft} className="bg-primary">
              Recuperar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de aviso de duplicata */}
      <AlertDialog open={forceAllowDuplicate && isDuplicate && !!duplicateLink} onOpenChange={setForceAllowDuplicate}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            Link duplicado encontrado
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Já existe um link com esta mesma URL salvo:</p>
            {duplicateLink && (
              <div className="rounded-md bg-muted p-2 text-sm">
                <p className="font-semibold truncate">{duplicateLink.title}</p>
                <p className={`${TEXT_XS_CLASS} text-muted-foreground truncate`}>{duplicateLink.url}</p>
                <p className={`${TEXT_XS_CLASS} text-muted-foreground mt-1`}>
                  Adicionado em {new Date(duplicateLink.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 pt-4">
            <AlertDialogCancel>Não, obrigado</AlertDialogCancel>
            {onEditDuplicate && duplicateLink && (
              <AlertDialogAction onClick={handleEditDuplicate} className="bg-blue-600">
                Editar link existente
              </AlertDialogAction>
            )}
            <AlertDialogAction onClick={() => setForceAllowDuplicate(false)} className="bg-primary">
              Adicionar mesmo assim
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog principal do formulário */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <DialogTitle>{editingLink ? "Editar Link" : "Novo Link"}</DialogTitle>
                <DialogDescription>
                  {editingLink ? "Atualize os dados do seu link" : "Adicione um novo link à sua coleção"}
                </DialogDescription>
              </div>
              {!editingLink && (url || title || description) && (
                <Badge variant="outline" className="whitespace-nowrap h-fit">
                  💾 Rascunho
                </Badge>
              )}
            </div>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setAutoFilledTitle(false);
              }}
              required
            />
          </div>
          {isDuplicate && duplicateLink && !forceAllowDuplicate && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm">
              <p className="flex items-center gap-2 font-medium text-blue-900 mb-1">
                <Link2 className="h-4 w-4" />
                Link já existe
              </p>
              <p className={`text-blue-800 ${TEXT_XS_CLASS} mb-2`}>
                Você já tem este link na sua coleção:
              </p>
              <p className={`text-blue-700 font-semibold ${TEXT_XS_CLASS} truncate`}>{duplicateLink.title}</p>
              {onEditDuplicate && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-blue-600 hover:text-blue-700"
                  onClick={handleEditDuplicate}
                >
                  Clicar para editar →
                </Button>
              )}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <Label>Pré-visualização e Capa</Label>
              <div className="flex flex-wrap gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleScreenCapture}
                  disabled={isUploading || isCapturing}
                >
                  {isCapturing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Scissors className="h-3 w-3" />}
                  Capturar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleSelectArea}
                  disabled={isUploading || isCapturing}
                >
                  {isCapturing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crop className="h-3 w-3" />}
                  Selecionar Área
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {isUploading ? "Enviando..." : "Upload"}
                </Button>
                {ogImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleOpenImageCrop}
                    disabled={isUploading || isCropLoading}
                  >
                    {isCropLoading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <ScissorsSquareDashedBottom className="h-3 w-3" />}
                    {isCropLoading ? "Carregando..." : "Recortar"}
                  </Button>
                )}
                {ogImage && ogImage.includes("link-thumbnails") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-xl border border-border/50 bg-muted/20">
              <div 
                className={`transition-all duration-500 ${isUploading || isCropLoading ? "blur-md opacity-40 grayscale scale-[0.98] pointer-events-none" : "cursor-pointer"}`}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <LinkPreview 
                  metadata={{
                    ...metadata,
                    title: title.trim() || metadata.title,
                    description: description.trim() || metadata.description,
                    image: ogImage.trim() || metadata.image,
                  }} 
                  url={url} 
                />
              </div>

              {/* Overlay de Feedback Visual em Tempo Real */}
              {(isUploading || isCropLoading) && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-background/80 backdrop-blur-md px-5 py-4 rounded-3xl shadow-2xl border border-primary/20 flex flex-col items-center gap-3 scale-110">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20 bg-primary rounded-full" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1">
                        {isUploading ? "Processando" : "Carregando"}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-medium">Aguarde um instante</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dica de interação */}
              {!isUploading && !isCropLoading && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/5 transition-colors pointer-events-none flex items-center justify-center">
                  <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-border/50 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">Alterar Capa</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="ogImage" className={TEXT_XS_CLASS + " text-muted-foreground"}>URL da Capa (opcional)</Label>
              <Input
                id="ogImage"
                placeholder="https://exemplo.com/imagem.jpg"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="text-sm h-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Título do link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Breve descrição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Notas pessoais
            </Label>
            <RichTextEditor
              content={notes}
              onChange={setNotes}
              placeholder="Escreva suas notas..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-4">

            <div className="space-y-2">
              <Label htmlFor="favicon">URL do Favicon</Label>
              <Input
                id="favicon"
                placeholder="https://exemplo.com/icon.png"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-select">Categoria</Label>
            <select
              id="category-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="status-select">Status</Label>
              <select
                id="status-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as LinkStatus)}
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">Em progresso</option>
                <option value="done">Concluído</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority-select">Prioridade</Label>
              <select
                id="priority-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={priority}
                onChange={(e) => setPriority(e.target.value as LinkPriority)}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-date">Data limite</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                id="link-tags"
                name="tags"
                placeholder="Adicionar tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                +
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingLink ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
