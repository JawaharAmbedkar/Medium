import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import axiosPrivate from "../hooks/Middleware";

interface Blog {
  id: number;
  title: string;
  content: string;
  coverImage?: string;
  authorId: number;
  author?: {
    name?: string;
    profilePic?: string;
  };
}

export const AllBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axiosPrivate.get(`/api/v1/blog/all`);
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />

      <div className="flex justify-center mt-12 px-4">
        <div className="w-full max-w-4xl space-y-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
            : blogs.length === 0
            ? <div className="text-center text-gray-500 mt-10">No blogs found.</div>
            : blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  id={blog.id}
                  authorName={blog.author?.name || "Anonymous"}
                  title={blog.title}
                  coverImage={blog.coverImage}
                  content={blog.content}
                  publishedDate={new Date().toLocaleDateString()}
                  profilePic={blog.author?.profilePic}
                />
              ))}
        </div>
      </div>
    </div>
  );
};
