import { useState } from "react"
import PrimaryButton from "./PrimaryButton";
import UploadMediaProps from "@/lib/interfaces/UploadMediaProps";
import { mediaType } from "@/lib/enums/mediaType";
import Exit from "./Exit";
import EventService from "@/lib/redux/Events/EventService";
import IMedia from "@/lib/interfaces/Redux/IMedia";

export default function UploadMediaPopup(props: UploadMediaProps) {
  const { closePopup, handleThrowError, mediaService, setIsUploading, fetchAllMedia } = props;
  const [selectedType, setSelectedType] = useState<mediaType>(mediaType.Default);
  const [uploadedMedia, setUploadedMedia] = useState<File>();
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const eventService = new EventService();

  /**
   * Add a hashtag
   */
  function addHashtag() {
    const tag = hashtagInput.trim().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  }

  /**
   * Remove a hashtag
   */
  function removeHashtag(tag: string) {
    setHashtags(hashtags.filter(t => t !== tag));
  }

  /**
   * Handle hashtag input keydown
   */
  function handleHashtagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addHashtag();
    }
  }

  /**
   * On upload media click
   */
  async function onUploadClick() {
    setIsUploading(true);
    if (!uploadedMedia) {
      setIsUploading(false)
      return
    };

    if (uploadedMedia?.type.includes("video/") && selectedType !== mediaType.Video) {
      handleThrowError("Please select the correct media type or upload the correct meida");
      setIsUploading(false);
      return;
    }

    if (uploadedMedia?.type.includes("image/") && selectedType !== mediaType.Image) {
      handleThrowError("Please select the correct media type or upload the correct meida");
      setIsUploading(false);
      return;
    }


    const formData = new FormData();
    formData.append("media", uploadedMedia);

    //Upload the media
    let uploadedMediaUrl = null;
    try {
      if (selectedType == mediaType.Video) {
        uploadedMediaUrl = await eventService.saveVideoToCloudinary(formData)
      }

      if (selectedType == mediaType.Image) {
        uploadedMediaUrl = await eventService.saveImageToCloudinary(formData)
      }

      if (!uploadedMediaUrl) {
        throw new Error("Something went wrong, while uploading the media to cloudinary");
      }

      const data: IMedia = {
        mediaType: selectedType,
        mediaLink: uploadedMediaUrl,
        caption: caption,
        hashtags: hashtags,
      }

      const response = await mediaService.addMedia(data)
      if (!response || !response?._id) {
        throw new Error("Something went wrong while uploading the media")
      }

      setSelectedType(mediaType.Default)
      setUploadedMedia(undefined)
      setUploadedMediaUrl("")
      setCaption("")
      setHashtags([])
      setIsUploading(false);
      await fetchAllMedia();
      closePopup()
    } catch (error: any) {
      handleThrowError(error?.message ?? error);
      setSelectedType(mediaType.Default)
      setUploadedMedia(undefined)
      setUploadedMediaUrl("")
      setCaption("")
      setHashtags([])
      setIsUploading(false);
      return;
    }

  }

  /**
 * Handler to set uploaded image
 * @param {*} files
 * @returns
 */
  const handleSetUploadedMedia = (files?: FileList) => {
    //Check the file and media type have been selected
    if (!files) {
      handleThrowError("Select a media to upload");
      return
    };

    if (selectedType === mediaType.Default) {
      handleThrowError("Select the type of media you want to upload");
      return
    };

    const file = files[0];
    const fileSize = Number((file.size / (1024 * 1024)).toFixed(2));
    let isFileLarge = false;
    //Check the media size 
    if (selectedType === mediaType.Image) {
      if (fileSize > 50) {
        handleThrowError("Image file is too large.");
        setUploadedMedia(undefined);
        setUploadedMediaUrl("");
        isFileLarge = true;
        return;
      }
    }

    if (selectedType === mediaType.Video) {
      if (fileSize > 90) {
        handleThrowError("Video file is too large.");
        setUploadedMedia(undefined);
        setUploadedMediaUrl("");
        isFileLarge = true;
        return;
      }
    }

    if (!isFileLarge) {
      //Save the media
      const fr = new FileReader();
      fr.readAsArrayBuffer(file);
      fr.onload = function () {
        if (!fr.result) return;

        const blob = new Blob([fr.result]);
        const url = URL.createObjectURL(blob);

        if (!url) return;
        setUploadedMediaUrl(url);
        setUploadedMedia(file);
      };
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center z-40 p-4 pt-8 overflow-y-auto">
      <div className="relative w-full max-w-[550px] glass-card rounded-2xl text-white animate-fade-up animate-duration-300">
        <Exit onClick={closePopup} />
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Upload Media
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Share your event recaps with the world</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Media Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Media Type</label>
            <select 
              name="media_type_option" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as mediaType)}
              className="input-modern w-full py-3 px-4 rounded-xl cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value={mediaType.Default}>Select media type</option>
              <option value={mediaType.Image}>📷 Image</option>
              <option value={mediaType.Video}>🎬 Video</option>
            </select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Upload File</label>
            <div className={`relative flex flex-col h-[160px] rounded-xl border-2 border-dashed transition-all duration-300 items-center justify-center cursor-pointer group ${
              selectedType === mediaType.Default 
                ? "border-neutral-700 bg-neutral-900/30 opacity-50" 
                : "border-neutral-600 hover:border-primary-500/50 bg-neutral-900/50"
            }`}>
              {!uploadedMedia ? (
                <div className="flex flex-col items-center gap-2 p-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedType !== mediaType.Default ? "bg-neutral-800 group-hover:bg-primary-500/20" : "bg-neutral-800/50"
                  }`}>
                    <svg className={`w-6 h-6 transition-colors ${selectedType !== mediaType.Default ? "text-neutral-400 group-hover:text-primary-500" : "text-neutral-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className={`text-sm ${selectedType !== mediaType.Default ? "text-neutral-300" : "text-neutral-600"}`}>
                    {selectedType === mediaType.Default ? "Select media type first" : "Drop file here or click to upload"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 w-full">
                  {selectedType === mediaType.Image ? (
                    <img src={uploadedMediaUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                  ) : (
                    <video src={uploadedMediaUrl} className="h-24 w-24 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 font-medium truncate">{uploadedMedia?.name}</p>
                    <p className="text-neutral-500 text-sm">Click to change</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                onChange={(e) => handleSetUploadedMedia(e.target.files ?? undefined)}
                disabled={selectedType === mediaType.Default}
                accept={selectedType === mediaType.Image ? "image/*" : "video/*"}
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Caption (Optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your media..."
              rows={2}
              className="input-modern w-full py-3 px-4 rounded-xl resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Hashtags (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="Type and press Enter..."
                className="input-modern flex-1 py-3 px-4 rounded-xl"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-200 rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium"
                  >
                    #{tag}
                    <button 
                      onClick={() => removeHashtag(tag)}
                      className="w-4 h-4 rounded-full bg-primary-500/30 hover:bg-primary-500/50 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            onClick={onUploadClick}
            disabled={!uploadedMedia || selectedType === mediaType.Default}
            className="w-full py-4 mt-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Upload Media
          </button>
        </div>
      </div>
    </div>
  )
}
