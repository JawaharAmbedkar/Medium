import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Appbar } from "../components/Appbar";

export const Profile = () => {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setSuccess(""); // Reset message
    }
  };

  const handleUpdate = async () => {
    if (!image && !name) {
      alert("Please provide a new name or profile picture");
      return;
    }

    try {
      setLoading(true);
      let imageUrl = null;

      // ✅ If user selected a new image → upload to Cloudinary
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "unsigned_preset"); // replace with your preset

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/de4innmm2/image/upload",
          formData
        );

        imageUrl = cloudinaryRes.data.secure_url;
      }

      // ✅ Build update payload dynamically
      const payload: any = {};
      if (imageUrl) payload.profilePic = imageUrl;
      if (name.trim()) payload.name = name.trim();

      await axios.post(
        `${BACKEND_URL}/api/v1/user/update-profile`,
        payload,
        { headers: { authorization: token || "" } }
      );


      setSuccess("Profile updated successfully!");
      setLoading(false);
      setImage(null);
      setName("");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setLoading(false);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong while updating!");
      }
    }
  };

  return (
    <div>
      <Appbar/>
      <div className="m-3">
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4">Update Profile</h2>

      {/* Name input */}
      <input
        type="text"
        placeholder="Enter new name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      {/* File upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Submit */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>

      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
    </div>
    </div>
  );
};
