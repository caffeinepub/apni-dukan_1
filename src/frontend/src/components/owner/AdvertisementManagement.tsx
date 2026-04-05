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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { Advertisement } from "../../types";

interface AdvertisementManagementProps {
  onBack: () => void;
}

export default function AdvertisementManagement({
  onBack: _onBack,
}: AdvertisementManagementProps) {
  const [ads, setAds] = useState<Advertisement[]>(() =>
    getLS<Advertisement[]>("apniDukan_ads", []),
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingFile, setPendingFile] = useState<Advertisement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({
        id: `ad_${Date.now()}`,
        type: file.type.startsWith("video") ? "video" : "image",
        data: reader.result as string,
        createdAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function saveAd() {
    if (!pendingFile) return;
    const updated = [...ads, pendingFile];
    setAds(updated);
    setLS("apniDukan_ads", updated);
    setPendingFile(null);
    setShowAdd(false);
    toast.success("Ad added!");
  }

  function confirmDelete() {
    if (!deleteId) return;
    const updated = ads.filter((a) => a.id !== deleteId);
    setAds(updated);
    setLS("apniDukan_ads", updated);
    setDeleteId(null);
    toast.success("Ad deleted");
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="font-bold text-gray-800">Advertisements</h2>
        <span className="text-xs text-gray-500">{ads.length} ads</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {ads.length === 0 && !showAdd && (
          <p
            data-ocid="owner_ads.empty_state"
            className="text-sm text-gray-400 text-center py-12"
          >
            No ads yet. Add your first ad!
          </p>
        )}
        <div className="flex flex-col gap-3">
          {ads.map((ad, idx) => (
            <div
              key={ad.id}
              data-ocid={`owner_ads.item.${idx + 1}`}
              className="flex items-center gap-3 bg-white rounded-xl shadow-sm p-3 border"
            >
              {ad.type === "image" ? (
                <img
                  src={ad.data}
                  alt="ad"
                  className="w-20 h-14 object-cover rounded"
                />
              ) : (
                // biome-ignore lint/a11y/useMediaCaption: ad content is promotional
                <video
                  src={ad.data}
                  className="w-20 h-14 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {ad.type}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(ad.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`owner_ads.delete_button.${idx + 1}`}
                onClick={() => setDeleteId(ad.id)}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {showAdd && (
          <div className="mt-4 bg-white rounded-xl p-4 border">
            <p className="font-bold text-sm mb-3">Add New Ad</p>
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {pendingFile ? (
              <>
                {pendingFile.type === "image" ? (
                  <img
                    src={pendingFile.data}
                    alt="preview"
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                ) : (
                  // biome-ignore lint/a11y/useMediaCaption: ad content is promotional
                  <video
                    src={pendingFile.data}
                    controls
                    className="w-full h-40 rounded mb-3"
                  />
                )}
                <Button
                  type="button"
                  data-ocid="owner_ads.confirm_button"
                  onClick={saveAd}
                  className="w-full"
                >
                  Save Ad ✓
                </Button>
              </>
            ) : (
              <Button
                type="button"
                data-ocid="owner_ads.upload_button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="w-full h-12"
              >
                Select Photo or Video
              </Button>
            )}
            <Button
              type="button"
              data-ocid="owner_ads.cancel_button"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setPendingFile(null);
              }}
              className="w-full mt-2 text-gray-500"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {!showAdd && (
        <button
          type="button"
          data-ocid="owner_ads.open_modal_button"
          onClick={() => setShowAdd(true)}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="owner_ads.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this ad?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="owner_ads.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="owner_ads.confirm_button"
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
