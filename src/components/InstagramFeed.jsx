import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";
import { BASE_URL } from "../config/api";
export default function InstagramFeed() {
  const [posts, setPosts] = useState([]);

 useEffect(() => {
  fetch(`${BASE_URL}/api/instagram`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Instagram API Error:", data);
        setPosts([]);
      }
    })
    .catch((err) => {
      console.error(err);
      setPosts([]);
    });
}, []);

  return (
    <div className="w-full">

      <h2 className="text-3xl font-semibold text-white mb-6 text-center">
        Follow Us on Instagram
      </h2>

      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-3">

        {posts.map((post) => (

          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            className="min-w-[250px] bg-white rounded-xl overflow-hidden shadow-xl group"
          >

            <div className="relative">

              <img
                src={post.image}
                alt=""
                className="w-full h-72 object-cover duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 duration-500 flex justify-center items-center">

               <Instagram
              size={50}
              className="text-white opacity-0 group-hover:opacity-100 duration-500"
                />

              </div>

            </div>

            <div className="p-4">

              <p className="text-sm line-clamp-2 text-gray-700">

                {post.caption}

              </p>

            </div>

          </a>

        ))}

      </div>

      <div className="text-center mt-8">

        <a
          href="https://www.instagram.com/haswanihandicrafts/"
          target="_blank"
          rel="noreferrer"
          className="bg-[#5a3e2b] text-white px-8 py-3 rounded-full hover:bg-[#3f2a1c]"
        >
          View on Instagram
        </a>

      </div>

    </div>
  );
}