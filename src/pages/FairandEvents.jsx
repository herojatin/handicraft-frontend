import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/api";

const AdminEventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${BASE_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
        alert("Failed to load events. Check console for errors.");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="bg-[#faf7f2] min-h-screen px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-[#5a3e2b] mb-10">
        Admin Panel - Fairs & Events
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">
          No events available
        </p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-10">
          {events.map((event) => (
            <div key={event._id} className="border-b pb-6">
              {/* Title */}
              <h2 className="text-2xl font-semibold text-[#5a3e2b]">
                {event.title}
              </h2>

              {/* Meta Info */}
         <p className="text-sm text-gray-600 mt-1">
          <strong>Venue:</strong> {event.venue}
        </p>

        <p className="text-sm text-gray-600">
          <strong>Start Date:</strong>{" "}
          {new Date(event.startDate).toLocaleDateString("en-GB")}
        </p>

        <p className="text-sm text-gray-600">
          <strong>End Date:</strong>{" "}
          {new Date(event.endDate).toLocaleDateString("en-GB")}
        </p>

              <p className="text-sm text-gray-500">
                <strong>Time:</strong>  {event.startTime} - {event.endTime}
              </p>

              {/* Description */}
              <p className="mt-3 text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventList;