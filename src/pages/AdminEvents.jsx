import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/events`);
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/events/${id}`);
      alert("Event Deleted");
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      <button
        onClick={() => navigate("/admin/add-event")}
        className="mb-8 bg-black text-white px-5 py-2 rounded-lg"
      >
        Add Event
      </button>

      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-sm text-gray-600">{event.venue}</p>
              <p className="text-sm">
                {event.date} | {event.startTime} - {event.endTime}
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() =>
                    navigate(`/admin/edit-event/${event._id}`)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(event._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;