// hooks/useBlogs.ts
import { useState, useEffect } from "react";
import axios from "axios";
import axiosPrivate from "./Middleware";
import { Blog } from "./types";

const axiosPublic = axios.create({
  baseURL: "https://medium-project.jawaharambedkar786.workers.dev",
});

export const useBlogs = (page = 1, limit = 10, mine = false) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);

    const fetchBlogs = async () => {
      try {
        let url: string;
        let client;

        if (mine) {
          // private (only your blogs)
          url = "/api/v1/blog/bulk";
          client = axiosPrivate;
        } else {
          // public (all blogs with pagination)
          url = `/api/v1/blog/all?page=${page}&limit=${limit}`;
          client = axiosPublic;
        }

        const res = await client.get(url);

        setBlogs(res.data.blogs || []);
        if (!mine) setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page, limit, mine]);

  return { loading, blogs, totalPages };
};
