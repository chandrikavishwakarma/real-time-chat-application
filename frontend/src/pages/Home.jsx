import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/chat/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loggedInUser = response.data.me;

        const allUsers = Array.isArray(response.data.users)
          ? response.data.users
          : [];

        if (!loggedInUser) {
          throw new Error("No found logged-in user details.");
        }

        if (isMounted) {
          setCurrentUser(loggedInUser);

          setUsers(
            allUsers.filter(
              (user) => String(user._id) !== String(loggedInUser._id),
            ),
          );
        }
      } catch (err) {
        console.error(
          "Home page API error:",
          err.response?.status,
          err.response?.data || err.message,
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Users doest not load, please check the backend api.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleOpenChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-lime-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">

          {/* Logo and App Name */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-600 text-white shadow-md shadow-lime-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold tracking-tight text-gray-800 sm:text-xl">
                Real Time Chat
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Connect. Chat. Stay together.
              </p>
            </div>
          </div>

          {/* User and Logout */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-100 font-bold text-lime-800">
                {(currentUser?.Fullname || "U").charAt(0).toUpperCase()}
              </div>

              <div className="max-w-40">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {currentUser?.Fullname || "Loading..."}
                </p>
                <p className="text-xs text-emerald-600">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  Online
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer sm:px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">

        {/* Welcome Section */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-lime-600 to-emerald-600 p-6 text-white shadow-lg shadow-lime-200/60 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-lime-100">
                YOUR CHAT SPACE
              </p>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Hey, {currentUser?.Fullname || "there"}! 👋
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-lime-50 sm:text-base">
                Stay connected with people. Choose a user below and start a
                conversation instantly.
              </p>
            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 sm:flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="43"
                height="43"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Users Section */}
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">

          {/* Section Heading */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                Discover People
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select someone to start chatting.
              </p>
            </div>

            {!loading && !error && (
              <span className="shrink-0 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-800">
                {users.length} {users.length === 1 ? "User" : "Users"}
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-lime-100 border-t-lime-600"></div>

              <p className="mt-4 text-sm font-medium text-gray-600">
                Finding your people...
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Please wait a moment
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              </div>

              <h3 className="mt-4 font-bold text-red-700">
                Unable to load users
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && users.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="10" cy="7" r="4" />
                  <line x1="20" x2="20" y1="8" y2="14" />
                  <line x1="23" x2="17" y1="11" y2="11" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No other users yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                There are no other registered users to chat with right now.
                Ask someone to create an account and join you!
              </p>
            </div>
          )}

          {/* Users List */}
          {!loading && !error && users.length > 0 && (
            <div className="space-y-3">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleOpenChat(user._id)}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-lime-200 hover:bg-lime-50/60 hover:shadow-md hover:shadow-lime-100/60 cursor-pointer sm:p-5"
                >
                  {/* User Information */}
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-emerald-100 text-lg font-extrabold text-lime-800 transition group-hover:from-lime-200 group-hover:to-emerald-200 sm:h-14 sm:w-14">
                      {(user.Fullname || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-800 transition group-hover:text-lime-800">
                        {user.Fullname || "User"}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {user.Email}
                      </p>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <div className="flex shrink-0 items-center gap-2 rounded-xl bg-lime-50 px-3 py-2.5 text-sm font-bold text-lime-800 transition group-hover:bg-lime-600 group-hover:text-white sm:px-4">
                    <span className="hidden sm:inline">Chat Now</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <p className="mt-7 text-center text-xs text-gray-400">
          Made for meaningful conversations 💚
        </p>
      </main>
    </div>
  );
};

export default Home;
