import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Avatar } from "./BlogCard";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export const Appbar = () => {
  const [user, setUser] = useState<{ name: string; profilePic?: string } | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
          headers: { Authorization: token },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [token]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div className="border-b flex justify-between items-center mt-3 pb-3 mx-3">
      {/* Logo */}
      <Link to={"/blog/all"} className="flex flex-col justify-center font-bold cursor-pointer">
        <img className="w-[120px] sm:w-[200px]" src="/images/medium.png" alt="medium" />
      </Link>

      {/* Right side: New button + Avatar dropdown */}
      <div className="flex items-center gap-1 sm:gap-4 relative" ref={dropdownRef}>
        <Link to="/publish">
          <button className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-full text-xs sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5">
            New
          </button>
        </Link>
        <Link to="/myblogs">
          <button className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-full  text-xs sm:text-sm px-3 py-1.5 sm:px-5 sm:py-2.5">
            Your Blogs
          </button>
        </Link>

        {/* Avatar with dropdown */}
        <div className="relative">
          <button onClick={() => setOpenDropdown(!openDropdown)}>
            <Avatar name={user?.name || "?"} size="big" profilePic={user?.profilePic} />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setOpenDropdown(false)}
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
