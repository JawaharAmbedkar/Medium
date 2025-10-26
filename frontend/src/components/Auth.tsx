import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput } from "@gautamambedkar/medium-common";
import axios from "axios";
import { BACKEND_URL } from "../config";


// trpc
export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        username: "",
        password: ""
    });

    async function sendRequest() {
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs
            );
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blog/all");
        } catch (err: any) {
            // Check if backend sent a response
            if (err.response?.data?.message) {
                alert(err.response.data.message); // show backend message
            } else {
                alert("Error while signing up!"); // fallback
            }
        }
    }

    return <div className="flex flex-col justify-center min-h-screen mx-3">
        <div className="flex flex-col">
            <div className="flex flex-col items-center">
                <div className="text-3xl sm:text-5xl font-bold pb-4">
                    Create an account
                </div>
                <div className="text-lg sm:text-xl font-normal text-slate-400">
                    {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                    <Link className="pt-2 underline" to={type === "signin" ? "/signup" : "/signin"}>{type === "signin" ? "Sign up" : "Sign in"}</Link>
                </div>
            </div>
            <div className="flex flex-col sm:w-96 mx-auto">
                {type === "signup" ? <LabelledInput label="Name" placeholder="gautam" onChange={(e) => {
                    setPostInputs(c => ({
                        ...c,
                        name: e.target.value
                    }))
                }} /> : null}

                <LabelledInput label="Username" placeholder="gautam@gmail.com" onChange={(e) => {
                    setPostInputs(c => ({
                        ...c,
                        username: e.target.value
                    }))
                }} />

                <LabelledInput label="Password" type={"password"} placeholder="12345" onChange={(e) => {
                    setPostInputs(c => ({
                        ...c,
                        password: e.target.value
                    }))
                }} />
                <button onClick={sendRequest} type="button" className="m-2 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" : "Sign in"}</button>
            </div>
        </div>

    </div>
}

interface LabelledInputProps {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}
const LabelledInput: React.FC<LabelledInputProps> = ({ label, placeholder, onChange, type }) => {
    return <div className="flex flex-col m-2">
        <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-black">{label}</label>
        <input onChange={onChange} type={type || "text"} id="first_name" className="border  text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder={placeholder} required />
    </div>
}