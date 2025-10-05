import { ChangeEvent, useState } from "react";
import { Appbar } from "../components/Appbar";
import axiosPrivate from "../hooks/Middleware";
import { useNavigate } from "react-router-dom";

export const Publish = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const navigate = useNavigate();

  // Cloudinary image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset"); // replace with your preset

    try {
      const { data } = await axiosPrivate.post(
        "https://api.cloudinary.com/v1_1/de4innmm2/image/upload",
        formData
      );
      if (data.secure_url) {
        setCoverImage(data.secure_url);
        setUploadStatus("success");
      } else {
        setUploadStatus("error");
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
    }
  };

  // Publish new blog
  const handlePublish = async () => {
    try {
      const { data } = await axiosPrivate.post("/api/v1/blog", {
        title,
        content: description,
        coverImage,
      });
      navigate(`/blog/${data.id}`);
    } catch (err: any) {
      console.error("Error publishing blog:", err);
      alert(err?.response?.data?.message || "Failed to publish blog");
    }
  };

  return (
    <div>
      <Appbar />
      <div className="flex justify-center m-3">
        <div className="max-w-screen-lg w-full pt-8">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Create New Post Here
          </label>

          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
            placeholder="Title"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-4"
          />

          {uploadStatus === "uploading" && (
            <p className="text-blue-600 text-sm mt-1">Uploading image…</p>
          )}
          {uploadStatus === "success" && (
            <p className="text-green-600 text-sm mt-1">
              ✅ Image uploaded successfully
            </p>
          )}
          {uploadStatus === "error" && (
            <p className="text-red-600 text-sm mt-1">❌ Failed to upload image</p>
          )}

          {coverImage && (
            <img
              src={coverImage}
              alt="cover preview"
              className="mt-2 w-full max-h-64 object-cover rounded-lg"
            />
          )}

          <TextEditor onChange={(e) => setDescription(e.target.value)} />

          <button
            onClick={handlePublish}
            type="submit"
            className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            Publish post
          </button>
        </div>
      </div>
    </div>
  );
};

function TextEditor({
  onChange,
}: {
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="mt-2">
      <div className="w-full mb-4">
        <div className="flex items-center justify-between border">
          <div className="my-2 bg-white rounded-b-lg w-full">
            <textarea
              onChange={onChange}
              id="editor"
              rows={8}
              className="focus:outline-none block w-full px-2 text-sm text-gray-800 bg-white border-0"
              placeholder="Write an article..."
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
