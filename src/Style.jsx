import { useCallback, useEffect, useRef, useState } from "react";
import "./Style.css";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim();
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

const BUCKET = "community-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const scenes = {
  Breakdance: Array.from({ length: 17 }, (_, i) => ({
    src: `/breakdance${i + 1}.png`,
    scene: "Breakdance",
    id: `breakdance-${i + 1}`,
  })),

  Skating: Array.from({ length: 17 }, (_, i) => ({
    src: `/skate${i + 1}.png`,
    scene: "Skating",
    id: `skate-${i + 1}`,
  })),

  Graffiti: Array.from({ length: 16 }, (_, i) => ({
    src: `/graffiti${i + 1}.png`,
    scene: "Graffiti",
    id: `graffiti-${i + 1}`,
  })),
};

const allImages = Object.values(scenes).flat();
const tags = ["Breakdance", "Skating", "Graffiti"];

function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function createUniqueFileName(extension) {
  const randomPart =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${Date.now()}-${randomPart}.${extension}`;
}

export default function Style() {
  const [activeScene, setActiveScene] = useState("All");
  const [images, setImages] = useState(allImages);
  const [communityImages, setCommunityImages] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // LOAD COMMUNITY IMAGES FROM SUPABASE
  const loadCommunityImages = useCallback(async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("community_images")
      .select("id, image_url, tag, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load community images:", error.message);
      return;
    }

    const uploadedImages = (data || [])
      .filter(
        (item) =>
          item.image_url &&
          tags.includes(item.tag)
      )
      .map((item) => ({
        id: item.id,
        src: item.image_url,
        scene: item.tag,
        uploaded: true,
      }));

    setCommunityImages(uploadedImages);
  }, []);

  useEffect(() => {
    loadCommunityImages();
  }, [loadCommunityImages]);

  const allCollectionImages = [...allImages, ...communityImages];

  // UPDATE GALLERY WHEN COMMUNITY IMAGES CHANGE
  useEffect(() => {
    if (activeScene === "All") {
      setImages(allCollectionImages);
    } else {
      setImages(
        allCollectionImages.filter(
          (image) => image.scene === activeScene
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityImages, activeScene]);

  // FILTER GALLERY
  const filterImages = (scene) => {
    setActiveScene(scene);

    if (scene === "All") {
      setImages(allCollectionImages);
    } else {
      setImages(
        allCollectionImages.filter(
          (image) => image.scene === scene
        )
      );
    }
  };

  // SHUFFLE GALLERY
  const shuffleImages = () => {
    setImages((currentImages) => shuffleArray(currentImages));
  };

  // CHECK SELECTED FILE
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setUploadMessage("");
    setSelectedFile(null);

    if (!file) return;

    // ONLY ALLOW JPEG, PNG, WEBP AND GIF
    if (
      !Object.prototype.hasOwnProperty.call(
        ALLOWED_IMAGE_TYPES,
        file.type
      )
    ) {
      setUploadMessage(
        "Images only: choose a JPG, PNG, WEBP or GIF file."
      );

      event.target.value = "";
      return;
    }

    // MAXIMUM 10 MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadMessage(
        "Your image must be 10 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // UPLOAD IMAGE TO SUPABASE
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setUploadMessage(
        "Supabase is not configured. Check the REACT_APP credentials in .env.local, then restart npm start."
      );
      return;
    }

    if (!selectedFile) {
      setUploadMessage("Please choose an image first.");
      return;
    }

    if (!selectedTag || !tags.includes(selectedTag)) {
      setUploadMessage(
        "You must choose Breakdance, Skating or Graffiti before posting."
      );
      return;
    }

    // CHECK FILE AGAIN BEFORE UPLOADING
    if (
      !Object.prototype.hasOwnProperty.call(
        ALLOWED_IMAGE_TYPES,
        selectedFile.type
      )
    ) {
      setUploadMessage(
        "Images only: videos and other file types are not allowed."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadMessage(
        "Your image must be 10 MB or smaller."
      );
      return;
    }

    setUploading(true);
    setUploadMessage("");

    const fileExtension = ALLOWED_IMAGE_TYPES[selectedFile.type];
    const filePath = createUniqueFileName(fileExtension);

    try {
      // UPLOAD FILE TO STORAGE
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // GET PUBLIC IMAGE URL
      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);

      const imageUrl = publicData?.publicUrl;

      if (!imageUrl) {
        await supabase.storage
          .from(BUCKET)
          .remove([filePath]);

        throw new Error(
          "Supabase did not return a public image URL."
        );
      }

      // SAVE IMAGE INFORMATION IN DATABASE
      const { error: databaseError } = await supabase
        .from("community_images")
        .insert({
          image_path: filePath,
          image_url: imageUrl,
          tag: selectedTag,
        });

      if (databaseError) {
        await supabase.storage
          .from(BUCKET)
          .remove([filePath]);

        throw databaseError;
      }

      // RESET UPLOAD FORM
      setSelectedFile(null);
      setSelectedTag("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // REFRESH GALLERY
      await loadCommunityImages();

      setActiveScene("All");

      setUploadMessage(
        "Your image has been added to the collection!"
      );

    } catch (error) {
      console.error("Image upload failed:", error);

      setUploadMessage(
        error?.message ||
          "Something went wrong while uploading your image."
      );

    } finally {
      setUploading(false);
    }
  };

  // VIDEO AUTOPLAY
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = 0.2;
    video.muted = false;

    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, []);

  // TOGGLE VIDEO SOUND
  const toggleVideoSound = () => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = 0.2;
    video.muted = !video.muted;

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  // CLOSE LIGHTBOX WITH ESCAPE
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="mb-page">

      {/* HEADER */}

      <header className="mb-header">
        <a className="mb-logo" href="/">
          CONGO<span>!</span>
        </a>

        <span className="mb-header-note">
          A VISUAL ARCHIVE
        </span>
      </header>

      {/* HERO */}

      <section className="mb-hero">
        <div className="mb-hero-top">
          <span>STREET CULTURE / VISUAL DIARY</span>
          <span>EST. 2026</span>
        </div>

        <h1>
          THE
          <br />
          <span>MOOD</span>
          <br />
          BOARD<span className="mb-title-dot">.</span>
        </h1>

        <div className="mb-hero-bottom">
          <p>
            Breakdance, skating and graffiti.
            <br />
            Different scenes. One culture.
          </p>

          <span className="mb-scroll-note">
            SCROLL TO EXPLORE ↓
          </span>
        </div>
      </section>

      {/* VIDEO */}

      <section className="mb-video-section">
        <div className="mb-section-heading">
          <span>01 / MOVING IMAGE</span>
          <span>CLICK VIDEO TO TOGGLE SOUND</span>
        </div>

        <div className="mb-video-wrap">
          {!videoError && (
            <video
              ref={videoRef}
              className="mb-video"
              autoPlay
              loop
              playsInline
              preload="auto"
              onClick={toggleVideoSound}
              onError={() => setVideoError(true)}
            >
              <source
                src="/moodboard.mp4"
                type="video/mp4"
              />
            </video>
          )}

          <div className="mb-video-overlay">
            <span>CLICK VIDEO</span>
            <span>↗ SOUND ON / OFF</span>
          </div>

          {videoError && (
            <div className="mb-video-error">
              <p>VIDEO NOT FOUND</p>

              <span>
                Make sure{" "}
                <code>moodboard.mp4</code> is inside
                the public folder.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* COMMUNITY UPLOAD */}

      <section className="mb-upload-section">
        <div className="mb-section-heading">
          <span>02 / COMMUNITY UPLOAD</span>
          <span>ADD TO THE ARCHIVE</span>
        </div>

        <div className="mb-upload-content">

          <div className="mb-upload-intro">
            <span className="mb-section-label">
              YOUR SCENE. YOUR IMAGE.
            </span>

            <h2>
              ADD TO THE PILE<span>.</span>
            </h2>

            <p>
              Got a photo worth sharing? Add it to
              the collection. Choose a scene tag
              before posting.
            </p>
          </div>

          <form
            className="mb-upload-form"
            onSubmit={handleUpload}
          >

            <label
              className="mb-upload-label"
              htmlFor="community-image"
            >
              SELECT AN IMAGE
            </label>

            <input
              ref={fileInputRef}
              id="community-image"
              className="mb-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
            />

            {selectedFile && (
              <p className="mb-selected-file">
                SELECTED: {selectedFile.name}
              </p>
            )}

            <label className="mb-upload-label">
              CHOOSE A TAG *
            </label>

            <div className="mb-tag-options">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`mb-tag-option ${
                    selectedTag === tag
                      ? "mb-tag-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedTag(tag)}
                  aria-pressed={selectedTag === tag}
                >
                  {tag}

                  {selectedTag === tag && (
                    <span> ✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="mb-upload-button"
              type="submit"
              disabled={uploading}
            >
              {uploading
                ? "UPLOADING..."
                : "POST IMAGE ↗"}
            </button>

            {uploadMessage && (
              <p
                className={`mb-upload-message ${
                  uploadMessage.startsWith(
                    "Your image has been added"
                  )
                    ? "mb-upload-success"
                    : "mb-upload-error"
                }`}
                role="status"
              >
                {uploadMessage}
              </p>
            )}

            <p className="mb-upload-note">
              JPG / PNG / WEBP / GIF ONLY ·
              MAXIMUM FILE SIZE 10 MB
            </p>

          </form>
        </div>
      </section>

      {/* GALLERY */}

      <section className="mb-gallery-section">

        <div className="mb-gallery-heading">
          <div>
            <span className="mb-section-label">
              03 / THE COLLECTION
            </span>

            <h2>THE PILE</h2>
          </div>

          <button
            className="mb-shuffle"
            onClick={shuffleImages}
            type="button"
          >
            SHUFFLE THE PILE <span>↗</span>
          </button>
        </div>

        {/* FILTERS */}

        <div className="mb-filters">
          {["All", ...tags].map((scene) => (
            <button
              key={scene}
              type="button"
              className={`mb-filter ${
                activeScene === scene
                  ? "mb-filter-active"
                  : ""
              }`}
              onClick={() => filterImages(scene)}
            >
              {scene}
            </button>
          ))}

          <span className="mb-image-count">
            {images.length.toString().padStart(2, "0")}
            {" "}IMAGES
          </span>
        </div>

        {/* MASONRY COLLECTION */}

        <div className="mb-masonry">
          {images.map((image, index) => (
            <button
              className={`mb-image-card mb-card-${
                (index % 6) + 1
              }`}
              key={image.id || `${image.src}-${index}`}
              type="button"
              onClick={() => setLightboxImage(image)}
              aria-label={`Open ${image.scene} image`}
            >
              <div className="mb-image-frame">

                <img
                  src={image.src}
                  alt={`${image.scene} street culture`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />

                <span className="mb-image-scene">
                  {image.scene}
                </span>

                <span className="mb-image-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="mb-image-open">
                  ↗
                </span>

              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FOOTER */}

      <footer className="mb-footer">
        <span>CONGO! — VISUAL ARCHIVE</span>
        <span>MADE FOR THE CULTURE.</span>
      </footer>

      {/* LIGHTBOX */}

      {lightboxImage && (
        <div
          className="mb-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="mb-lightbox-close"
            type="button"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image"
          >
            ×
          </button>

          <div
            className="mb-lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.scene}
            />

            <div className="mb-lightbox-caption">
              <span>{lightboxImage.scene}</span>
              <span>CLICK OUTSIDE TO CLOSE</span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}