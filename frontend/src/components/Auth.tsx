import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@gautamambedkar/medium-common";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const navigate = useNavigate();
  const [postInputs, setPostInputs] = useState<SignupInput>({
    name: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function sendRequest() {
    setLoading(true);
    setErrorMessage(""); // clear previous errors
    try {
      // Normalize email for signup
      const payload =
        type === "signup"
          ? { ...postInputs, username: postInputs.username.toLowerCase() }
          : postInputs;

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        payload
      );
      const jwt = response.data;
      localStorage.setItem("token", jwt);
      navigate("/blog/all");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center min-h-screen mx-3">
      <div className="flex flex-col">
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-5xl font-bold pb-4">
            {type === "signup" ? "Create an account" : "Sign in"}
          </div>
          <div className="text-lg sm:text-xl font-normal text-slate-400">
            {type === "signin" ? "Don't have an account?" : "Already have an account?"}
            <Link
              className="pt-2 underline"
              to={type === "signin" ? "/signup" : "/signin"}
            >
              {type === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:w-96 mx-auto">
          {type === "signup" && (
            <LabelledInput
              label="Name"
              placeholder="gautam"
              onChange={(e) =>
                setPostInputs((c) => ({ ...c, name: e.target.value }))
              }
            />
          )}

          <LabelledInput
            label="Username"
            placeholder="gautam@gmail.com"
            onChange={(e) =>
              setPostInputs((c) => ({ ...c, username: e.target.value }))
            }
          />

          <LabelledInput
            label="Password"
            type="password"
            placeholder="12345"
            onChange={(e) =>
              setPostInputs((c) => ({ ...c, password: e.target.value }))
            }
          />

          {/* Show backend error */}
          {errorMessage && (
            <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
          )}

          <button
            onClick={sendRequest}
            type="button"
            disabled={loading}
            className={`m-2 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none focus:ring-4 focus:ring-gray-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700"
            }`}
          >
            {loading
              ? type === "signup"
                ? "Signing up..."
                : "Signing in..."
              : type === "signup"
              ? "Sign up"
              : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface LabelledInputProps {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  label,
  placeholder,
  onChange,
  type,
}) => {
  return (
    <div className="flex flex-col m-2">
      <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-black">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        className="border text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder={placeholder}
        required
      />
    </div>
  );
};
