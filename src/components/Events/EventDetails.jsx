import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import Modal from "../UI/Modal.jsx";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeleteing, setIsDeleting] = useState();

  const { id } = useParams();
  const naviate = useNavigate();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: errorDeletion,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      naviate("/events");
    },
  });

  function handleDeletion() {
    mutate({ id });
  }

  function handleStartDeletion() {
    setIsDeleting(true);
  }

  function handleCancelDeletion() {
    setIsDeleting(false);
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="Failed to load event details."
        message={error?.info?.message || "Please try again later."}
      />
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = new Date(
      `1970-01-01T${data.time}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeletion}> Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`${formattedDate}T${formattedTime}`}>
                {formattedDate} @ {formattedTime}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleteing && (
        <Modal onClose={handleCancelDeletion}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting event...</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleCancelDeletion} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDeletion} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed to delete event."
              message={
                errorDeletion?.info?.message ||
                "Event deletion failed. Please try again later."
              }
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
