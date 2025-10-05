// FullBlog.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosPrivate from "../hooks/Middleware";
import { Appbar } from "../components/Appbar";
import { Avatar } from "../components/BlogCard";

export const FullBlog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === "all") {
        setLoading(false);
        return;
      }

      try {
        const blogId = Number(id);
        if (isNaN(blogId)) throw new Error("Invalid blog id");

        // fetch blog
        const blogRes = await axiosPrivate.get(`/api/v1/blog/${blogId}`);
        setBlog(blogRes.data.blog);

        // fetch current user
        const userRes = await axiosPrivate.get(`/api/v1/user/me`);
        setCurrentUser(userRes.data.user);
      } catch (err) {
        console.error(err);
        setError("Blog not found or you are not logged in.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (error) {
    alert(error);
    navigate("/myblogs");
    return null;
  }

  if (!blog) return <div>No blog found.</div>;

  const isOwner = currentUser && currentUser.id === blog.authorId;

  return (
    <div className="min-h-screen bg-gray-50 mb-7">
      <Appbar />
      <div className="flex justify-center mt-12 px-4">
        <div className="flex flex-col w-full max-w-4xl space-y-8">
          {/* Author Info */}
          <div className="flex items-center space-x-4">
            <Avatar
              size="big"
              name={blog.author?.name || "Anonymous"}
              profilePic={blog.author?.profilePic}
            />
            <div className="flex flex-col">
              <span className="text-lg text-slate-600">Author</span>
              <span className="text-xl font-bold">
                {blog.author?.name || "Anonymous"}
              </span>
            </div>
          </div>

          {/* Blog Title + Edit */}
          <div className="flex justify-between items-start">
            <h1 className="text-4xl md:text-5xl font-extrabold">{blog.title}</h1>
            {isOwner && (
              <button
                onClick={() => navigate(`/edit/${blog.id}`)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
            )}
          </div>

          {/* Cover Image */}
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="max-w-full max-h-[600px] w-auto h-auto object-cover rounded-lg shadow-md"
            />
          )}

          {/* Published Date */}
          <div className="text-slate-500 text-sm">
            Published on {new Date().toLocaleDateString()}
          </div>

          {/* Blog Content */}
          <div className="text-md leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>
      </div>
    </div>
  );
};
