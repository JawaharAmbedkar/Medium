import { Link } from "react-router-dom";

interface BlogCardProps {
    authorName: string;
    title: string;
    coverImage?: string;
    content: string;
    publishedDate: string;
    id: number;
    profilePic?: string;
}


export const BlogCard = ({
    id,
    authorName,
    title,
    coverImage,
    content,
    publishedDate,
    profilePic
}: BlogCardProps) => {
    return (
        <Link to={`/blog/${id}`}>
            <div className="p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer">
                
                {/* Author Info */}
                <div className="flex items-center">
                    <Avatar name={authorName} size="small" profilePic={profilePic} />
                    <div className="font-extralight pl-2 text-sm flex justify-center flex-col">
                        {authorName}
                    </div>
                    <div className="flex justify-center flex-col pl-2">
                        <Circle/>
                    </div>
                    <div className="pl-2 font-thin text-slate-400 flex justify-center flex-col">
                        {publishedDate}
                    </div>
                </div>
                
                <div className="sm:flex">
                  <div>
                     {/* Title */}
                <div className="text-xl font-semibold pt-2 my-3">{title}</div> 
                {/* Content */}
                <div className="text-md font-thin flex justify-center items-center mr-2">{content.slice(0, 200) + "..."}</div>
                  </div>                 
                {/* Cover Image */}
                {coverImage && (
                    <img 
                        src={coverImage} 
                        alt={title} 
                        className="w-[17rem] h-[10rem] object-cover rounded-lg my-2"
                    />
                )}
                </div>
                {/* Reading Time */}
                <div className="text-slate-500 text-sm font-thin pt-4">
                    {`${Math.ceil(content.length / 100)} minutes read`}
                </div>
            </div>
        </Link>
    );
};

export function Circle(){
    return <div className="h-1 w-1 rounded-full bg-slate-500">

    </div>
}

interface AvatarProps {
  name: string;
  size?: "small" | "big";
  profilePic?: string; // optional URL
}

export function Avatar({ name, size = "small", profilePic }: AvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full ${
        size === "small" ? "w-6 h-6" : " w-7 h-7 sm:w-10 sm:h-10"
      }`}
      style={{ backgroundColor: "#e5e7eb" }} // fallback bg color
    >
      {profilePic ? (
        <img
          src={profilePic}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span
          className={`${
            size === "small" ? "text-xs" : "text-md"
          } font-normal text-gray-600`}
        >
          {name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}


