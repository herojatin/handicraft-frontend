import logo from "../assets/logo/logo.png";
import InstagramFeed from "./InstagramFeed";

export default function SocialSection() {
  return (
    <section className="w-full bg-gradient-to-r from-[#3a3a3a] to-[#2c2c2c] py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

        {/* Facebook */}
        <div className="flex justify-center">
          <div className="bg-white w-[320px] h-[520px] overflow-hidden shadow-lg rounded-lg">
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/haswanihandicrafts&tabs=timeline&width=320&height=520"
              width="320"
              height="520"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="facebook"
            />
          </div>
        </div>

        {/* Company */}
        <div className="text-center text-white px-4">
          <img
            src={logo}
            alt="Haswani Handicrafts"
            className="mx-auto mb-6 w-64"
          />

          <p className="leading-7 text-[15px] opacity-90">
            Haswani Handicrafts is a company engaged in the manufacturing and
            exporting of Antique Reproduction Furniture, Boxes, Almirahs,
            Jharokha, Arches, Doors, Windows, Tables and Accessories.
          </p>

          <div className="mt-6 space-y-2 text-sm opacity-90">
            <p>+91-98290-23455 | +91-98293-11703</p>
            <p>info@haswanihandicrafts.com</p>
            <p>
              C-13 B, Basni First Phase, Near Basni Railway Station,
              Jodhpur - 342001 (Raj.) India
            </p>
          </div>
        </div>

        {/* Instagram */}
        <div>
          <InstagramFeed />
        </div>

      </div>
    </section>
  );
}