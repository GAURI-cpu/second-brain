import React, { useEffect, useState } from "react";
import axios from "axios";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import "./index.css";
import GraphView from "./components/GraphVeiw";

function App() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const filteredNotes = notes.filter((note) => {
    const matchesTags =
      selectedTags.length > 0
        ? selectedTags.every((tag) => note.tags && note.tags.includes(tag))
        : true;

    const matchesSearch =
      note.text.toLowerCase().includes(search.toLowerCase()) ||
      (note.tags &&
        note.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase()),
        ));

    return matchesTags && matchesSearch;
  });
  const [hoverData, setHoverData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔥 HEATMAP DATA (4 months)
  const getHeatMap = () => {
    const map = {};

    notes.forEach((note) => {
      const date = new Date(note.id).toISOString().slice(0, 10);
      map[date] = (map[date] || 0) + 1;
    });

    const days = [];
    const today = new Date();

    for (let i = 120; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().slice(0, 10);

      days.push({
        date: dateStr,
        count: map[dateStr] || 0,
      });
    }

    return days;
  };

  const addNote = async () => {
    try {
      await axios.post("http://localhost:5000/add-note", {
        text: text,
      });
      setText("");
      setSelectedTags([]);
      fetchNotes();
    } catch (error) {
      console.log("error adding notes:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete-note/${id}`);
      fetchNotes();
    } catch (error) {
      console.log("error deleting note:", error);
    }
  };

  const fetchNotes = async () => {
    const res = await axios.get("http://localhost:5000/notes");
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes();
  }, []);
  //🔥Streak
  const getStreak = () => {
    const data = getHeatMap();
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getPeakDay = () => {
    const map = {};

    notes.forEach((n) => {
      const day = new Date(n.id).toLocaleDateString("en-US", {
        weekday: "long",
      });

      map[day] = (map[day] || 0) + 1;
    });

    return Object.keys(map).reduce((a, b) => (map[a] > map[b] ? a : b));
  };

  const getRelatedNotes = (currentNote) => {
    return notes.filter((note) => {
      if (note.id === currentNote.id) return false;

      return note.tags?.some((tag) => currentNote.tags?.includes(tag));
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🧠 Second Brain</h1>
        <p className="text-gray-300 text-sm">{new Date().toDateString()}</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Notes</p>
          <h2 className="text-xl font-bold">{notes.length}</h2>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Today</p>
          <h2 className="text-xl font-bold">{notes.length}</h2>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Last Note</p>
          <h2 className="text-sm">
            {notes.length > 0 ? notes[notes.length - 1].text : "-"}
          </h2>
        </div>

        <div className="bg-white/10 p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Status</p>
          <h2 className="text-green-400">Active</h2>
        </div>
      </div>

      {/* INPUT */}
      <div className="bg-white/10 backdrop-blur-lg p-5 rounded-2xl mb-6 max-w-md mx-auto">
        <textarea
          className="w-full h-24 p-3 rounded-lg bg-white/10 outline-none resize-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Capture your thoughts..."
        />

        <button
          onClick={addNote}
          className="w-full mt-3 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-400 font-semibold shadow-[0_0_15px_rgba(255,0,0,0.7)] hover:scale-105 transition"
        >
          Add Note
        </button>
      </div>

      {/* 🔥 HEATMAP */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6 shadow-[0_0_40px_rgba(255,0,0,0.25)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">📊 Daily Activity</h2>
          <span className="text-red-200 mr-20">
            Max Streak: {getStreak()} days
          </span>
          <span className="text-sm text-red-200">Last 4 months</span>
        </div>

        <div className="flex justify-center">
          <div className="heatmap-container w-fit">
            <CalendarHeatmap
              startDate={
                new Date(new Date().setDate(new Date().getDate() - 120))
              }
              endDate={new Date()}
              values={getHeatMap()}
              gutterSize={0}
              classForValue={(value) => {
                if (!value || value.count === 0) return "color-empty";
                if (value.count === 1) return "color-scale-1";
                if (value.count === 2) return "color-scale-2";
                if (value.count === 3) return "color-scale-3";
                return "color-scale-4";
              }}
              // 🔥 HOVER (CUSTOM)
              onMouseOver={(event, value) => {
                if (value && value.date) {
                  setHoverData(value);
                }
              }}
              onMouseLeave={() => setHoverData(null)}
              // 🔥 CLICK
              onClick={(value) => {
                if (value && value.date) {
                  setSelectedDate(value.date);
                }
              }}
              titleForValue={(value) => {
                if (!value || !value.date) return "No activity";
                return `${value.count || 0} notes on ${value.date}`;
              }}
            />
          </div>
        </div>

        {/* EMPTY */}
        {notes.length === 0 && (
          <p className="text-center text-gray-400 mt-3 text-sm">
            Start adding notes to see your activity 🔥
          </p>
        )}
      </div>

      {/* 🔥 CLICK POPUP */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-[300px]">
            <h2 className="font-bold mb-3">{selectedDate}</h2>

            {notes.filter(
              (n) => new Date(n.id).toISOString().slice(0, 10) === selectedDate,
            ).length === 0 ? (
              <p>No notes</p>
            ) : (
              notes
                .filter(
                  (n) =>
                    new Date(n.id).toISOString().slice(0, 10) === selectedDate,
                )
                .map((n) => <p key={n.id}>• {n.text}</p>)
            )}

            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 bg-red-500 px-3 py-1 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/*Serach*/}
      <input
        placeholder="🔍 Serach Notes..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        className="w-[30rem] h-[5rem] bg-white/10 mb-4 p-3 rounded-lg"
        type="text"
      />

      {/* NOTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <p className="text-gray-400">No notes yet...</p>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-white/10 flex flex-col gap-2"
            >
              <span>{note.text}</span>

              {/* TAGS */}
              <div className="mt-1 flex gap-2 flex-wrap">
                {note.tags &&
                  note.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag],
                        );
                      }}
                      className="text-xs px-2 py-1 bg-red-500/30 rounded cursor-pointer hover:bg-red-500/50"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>

              {/* 🔥 RELATED NOTES */}
              <div className="text-xs text-gray-300">
                Related:
                {getRelatedNotes(note).length === 0 ? (
                  <span className="ml-2 text-gray-500">None</span>
                ) : (
                  getRelatedNotes(note)
                    .slice(0, 2)
                    .map((n) => (
                      <span key={n.id} className="ml-2 text-red-300">
                        {n.text}
                      </span>
                    ))
                )}
              </div>

              {/* DELETE */}
              <button
                onClick={() => deleteNote(note.id)}
                className="bg-red-500 px-2 py-1 rounded-md text-sm hover:bg-red-600 w-fit"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
      <GraphView notes={notes}/>
    </div>
  );
}

export default App;
