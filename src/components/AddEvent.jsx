import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../config/api";

const AddEvent = () => {
  const { id } = useParams();

  // ✅ ADMIN CHECK (correct place)
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <h1 className="text-center mt-20">Access Denied</h1>;
  }

  const [form, setForm] = useState({
    title: "",
    venue: "",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      axios
        .get(`${BASE_URL}/api/events/${id}`)
        .then((res) => setForm(res.data))
        .catch((err) => console.log(err));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.venue ||
      !form.date ||
      !form.startTime ||
      !form.endTime
    ) {
      alert("All fields are required");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("End time must be after start time");
      return;
    }

    try {
      if (id) {
        await axios.put(
          `${BASE_URL}/api/events/${id}`,
          form
        );
        alert("Event Updated");
      } else {
        await axios.post(
          `${BASE_URL}/api/events/create`,
          form
        );
        alert("Event Added");
      }

      setForm({
        title: "",
        venue: "",
        date: "",
        startTime: "",
        endTime: "",
        description: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          {id ? "Edit Event" : "Add Event"}
        </h2>

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="venue"
          placeholder="Venue"
          value={form.venue}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-2">
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
          />
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
          />
        </div>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-black text-white py-2 rounded">
          {id ? "Update Event" : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default AddEvent;