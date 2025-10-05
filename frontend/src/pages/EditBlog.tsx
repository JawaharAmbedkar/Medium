import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar } from "../components/BlogCard";
import { Appbar } from "../components/Appbar";
import axiosPrivate from "../hooks/Middleware";
import axios from "axios";

export const EditBlog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Fetch blog by ID
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axiosPrivate.get(`/api/v1/blog/${id}`);
        if (data.blog) {
          setBlog(data.blog);
          setTitle(data.blog.title);
          setContent(data.blog.content);
          setCoverImage(data.blog.coverImage || "");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // Fetch logged-in user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axiosPrivate.get("/api/v1/user/me");
        if (data.user?.id) setLoggedInUserId(data.user.id);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  if (loading || !blog) return <div>Loading...</div>;

  const isOwner = loggedInUserId === blog.authorId;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    try {
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/de4innmm2/image/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setCoverImage(data.secure_url);
      setUploadSuccess(true);
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axiosPrivate.put("/api/v1/blog", { id: blog.id, title, content, coverImage });
      alert("Blog updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating blog:", err);
      alert(err?.response?.data?.message || "Error updating blog");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axiosPrivate.delete(`/api/v1/blog/${blog.id}`);
      alert("Blog deleted successfully!");
      navigate("/myblogs"); // redirect after deletion
    } catch (err: any) {
      console.error("Error deleting blog:", err);
      alert(err?.response?.data?.message || "Error deleting blog");
    }
  };

  return (
    <div>
      <Appbar />
      <div className="flex justify-center mb-7">
        <div className="px-10 w-full max-w-screen-xl pt-12">
          {/* Author Info */}
          <div className="mb-6">
            <div className="text-slate-600 text-lg">Author</div>
            <div className="flex mt-2">
              <div className="mr-4 flex flex-col">
                <Avatar size="big" name={blog.author?.name || "Anonymous"} profilePic={blog.author?.profilePic} />
              </div>
              <div>
                <div className="text-xl font-bold">{blog.author?.name || "Anonymous"}</div>
              </div>
            </div>
            <div className="mt-3 font-bold">
              To edit - click on text or the image then hit save changes.
            </div>
          </div>

          {/* Blog Content */}
          <div className="col-span-8 space-y-4">
            {/* Title */}
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-5xl font-extrabold border-b w-full outline-none"
              />
            ) : (
              <div className={`text-5xl font-extrabold ${isOwner ? "cursor-pointer" : ""}`} onClick={() => isOwner && setIsEditing(true)}>
                {title}
              </div>
            )}

            {/* Cover Image */}
            {isEditing ? (
              <div className="my-4">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {uploading && <p>Uploading...</p>}
                {uploadSuccess && !uploading && <p className="text-green-600 font-semibold">Image uploaded successfully!</p>}
                {coverImage && <img src={coverImage} alt="preview" className="w-full h-64 object-cover rounded-lg mt-2" />}
              </div>
            ) : (
              coverImage && (
                <img
                  src={coverImage}
                  alt={title}
                  className={`w-full max-h-[600px] h-auto object-contain rounded-lg my-6 ${isOwner ? "cursor-pointer hover:opacity-90" : ""}`}
                  onClick={() => isOwner && setIsEditing(true)}
                />
              )
            )}

            {/* Content */}
            {isEditing ? (
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-80 border rounded p-2 mb-10" />
            ) : (
              <div className={`pt-4 mb-10 whitespace-pre-line ${isOwner ? "cursor-pointer" : ""}`} onClick={() => isOwner && setIsEditing(true)}>
                {content}
              </div>
            )}

            {/* Action Buttons */}
            {isOwner && (
              <div className="flex space-x-4">
                {isEditing && (
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                )}
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Delete Blog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
