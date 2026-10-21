import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/queries/documents";
import { useResidents } from "@/hooks/queries/residents";
import { useAiStatus } from "@/hooks/queries/ai";
import { DocSuggestionReview } from "@/features/doc-intel/DocSuggestionReview";
import type { CareDocument } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Upload, FileText, X } from "lucide-react";

const documentSchema = z.object({
  name: z.string().trim().min(2, "Document name must be at least 2 characters").max(100),
  category: z.enum(['Admission', 'KYC', 'Consent', 'Contract', 'Financial', 'Medical']),
  file_type: z.string().trim().min(1, "File type is required").max(10),
  file_size: z.string().trim().min(1, "File size is required").max(20),
  resident_id: z.string().optional(),
  description: z.string().trim().max(500).optional(),
});

export function UploadDocumentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const upload = useUploadDocument();
  const { data: residents = [] } = useResidents(open);
  const { data: aiStatus } = useAiStatus();
  // After upload, the dialog switches to reviewing the AI's category/resident suggestion.
  const [uploaded, setUploaded] = useState<CareDocument | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    category: 'Admission' | 'KYC' | 'Consent' | 'Contract' | 'Financial' | 'Medical';
    resident_id: string;
    description: string;
  }>({
    name: "",
    category: "Admission",
    resident_id: "",
    description: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, DOC, DOCX, TXT, JPG, or PNG file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Auto-fill name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toUpperCase();
    return extension || 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;
    
    setIsLoading(true);
    try {
      const validated = documentSchema.parse({
        ...formData,
        file_type: getFileType(selectedFile.name),
        file_size: formatFileSize(selectedFile.size),
      });

      const document = await upload.mutateAsync({
        file: selectedFile,
        name: validated.name,
        category: validated.category,
        uploaded_by: user.name,
        resident_id: validated.resident_id || undefined,
        status: 'Pending',
        description: validated.description || undefined,
      });

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      if (aiStatus?.enabled) {
        setUploaded(document);
      } else {
        setOpen(false);
      }
      setFormData({
        name: "",
        category: "Admission",
        resident_id: "",
        description: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setUploaded(null); }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>Upload a new document to the system</DialogDescription>
        </DialogHeader>
        {uploaded ? (
          <DocSuggestionReview document={uploaded} onDone={() => { setUploaded(null); setOpen(false); }} />
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                className="hidden"
                disabled={isLoading}
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {getFileType(selectedFile.name)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Admission Form - John Doe"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: 'Admission' | 'KYC' | 'Consent' | 'Contract' | 'Financial' | 'Medical') => 
                setFormData({ ...formData, category: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admission">Admission</SelectItem>
                <SelectItem value="KYC">KYC</SelectItem>
                <SelectItem value="Consent">Consent</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Financial">Financial</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resident">Resident</Label>
            <Select
              value={formData.resident_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, resident_id: value === "none" ? "" : value })}
              disabled={isLoading}
            >
              <SelectTrigger id="resident">
                <SelectValue placeholder="Not linked to a resident" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not linked to a resident</SelectItem>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id}>
                    {resident.name} (Room {resident.room_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the document"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? "Uploading…" : "Upload document"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
