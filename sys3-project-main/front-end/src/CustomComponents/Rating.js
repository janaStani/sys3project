import React, { Component } from "react";
import axios from "axios";
import StarRatings from "react-star-ratings";
import { API_URL } from "../Utils/Configuration";

// Rating component allows users to rate and comment on books.
class Rating extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: "", // Stores the user's comment input
      title: "", // Stores the selected book title
      rating: 0, // Stores the user's rating
      starColors: ["#ff4545", "#ffa534", "#ffe234", "#b7dd29", "#57e32c"], // Star colors based on rating
      comments: [], // Stores the list of comments fetched from the server
      editMode: false, // Indicates whether the component is in edit mode
      currentCommentId: null, // ID of the comment currently being edited
      status: {
        success: null, // Success status of the save/update operation
        msg: "", // Message related to the operation status
      },
      bok: [], // List of books fetched from the server
      boktorateid: 0, // ID of the book currently being rated
    };
  }

  // Lifecycle method to fetch comments and books when the component mounts
  componentDidMount() {
    this.fetchComments();
    axios.get(`${API_URL}/reviews/all-books`)
      .then(res => {
        // Update the state with the fetched list of books
        this.setState({ bok: res.data.books });
        // Optionally log the fetched books for debugging
        // console.log(res.data.books);
      })
      .catch(err => {
        console.error("Error fetching books:", err);
      });
  }

  // Fetches the list of comments from the server
  fetchComments = () => {
    axios.get(`${API_URL}/reviews`)
      .then(res => {
        // Update the state with the fetched list of comments
        this.setState({ comments: res.data.reviews });
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
      });
  };

  // Handles changes to the comment input field
  handleCommentChange = (event) => {
    this.setState({ comment: event.target.value });
  };

  // Handles changes to the book title selection dropdown
  handleTitleChange = (event) => {
    this.setState({ boktorateid: event.target.value });
  };

  // Handles changes in the star rating
  changeRating = (newRating) => {
    // Toggle rating: if the same rating is selected, reset it to 0
    this.setState((prevState) => ({
      rating: prevState.rating === newRating ? 0 : newRating
    }));
  };

  // Saves a new comment or updates an existing one
  saveComment = () => {
    const { comment, title, rating, editMode, currentCommentId, boktorateid } = this.state;
    const user = localStorage.getItem("username"); // Get the username from local storage
    const data = { comment, title, rating, currentCommentId, user, boktorateid };

    if (editMode) {
      // Update an existing comment
      axios.post(`${API_URL}/reviews/`, data)
        .then(res => {
          this.setState({ status: res.data });
          console.log("Comment updated:", res.data);
          this.resetForm();
        })
        .catch(err => {
          this.setState({ status: err.response.data });
          console.error("Error updating comment:", err);
        });
    } else {
      // Save a new comment
      axios.post(`${API_URL}/reviews`, data)
        .then(res => {
          this.setState({ status: res.data });
          console.log("Comment saved:", res.data);
          this.resetForm();
        })
        .catch(err => {
          this.setState({ status: err.response.data });
          console.error("Error saving comment:", err);
        });
    }
  };

  // Prepares the form for editing an existing comment
  editComment = (comment) => {
    console.log(comment);
    this.setState({
      comment: comment.comment,
      title: comment.title,
      rating: comment.star,
      editMode: true,
      currentCommentId: comment.id,
      boktorateid: comment.id
    });
  };

  // Deletes a comment and refetches the updated list of comments
  deleteComment = (commentId) => {
    axios.delete(`${API_URL}/reviews/${commentId}`)
      .then(res => {
        console.log("Comment deleted:", res.data);
        this.fetchComments();
      })
      .catch(err => {
        console.error("Error deleting comment:", err);
      });
  };

  // Resets the form to its initial state and refreshes the comments list
  resetForm = () => {
    this.setState({ comment: "", title: "", rating: 0, editMode: false, currentCommentId: null });
    this.fetchComments();
  };

  render() {
    const { rating, starColors, bok, comments, editMode } = this.state;

    return (
      <div className="card" style={{ margin: "10px", padding: "20px" }}>
        <h3 style={{ margin: "10px" }}>{editMode ? "Edit your comment" : "Write a comment for a book"}</h3>
        <div className="mb-3" style={{ margin: "10px" }}>
          {/* Book title selection */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Name of the book</label>
            <select
              name="boktorateid"
              id="boktorateid"
              onChange={this.handleTitleChange}
              className="form-control"
              value={this.state.title}
            >
              <option value="" disabled>Select a book</option>
              {bok.map((book, index) => (
                <option key={index} value={book.id}>{book.title}</option>
              ))}
            </select>
          </div>

          {/* Comment input field */}
          <div className="mb-3">
            <label htmlFor="comment" className="form-label">Write a comment</label>
            <textarea
              className="form-control"
              id="comment"
              rows="3"
              value={this.state.comment}
              onChange={this.handleCommentChange}
              placeholder="Write a comment"
            ></textarea>
          </div>

          {/* Rating component */}
          <div className="mb-3">
            <label htmlFor="rating" className="form-label">Rate the book</label>
            <div style={{ fontSize: 24 }}>
              <StarRatings
                rating={rating}
                starRatedColor={rating ? starColors[rating - 1] : starColors[0]}
                changeRating={this.changeRating}
                numberOfStars={5}
                name='rating'
                starDimension="40px"
                starSpacing="15px"
                starHoverColor={starColors[0]}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            className="btn btn-primary"
            onClick={this.saveComment}
            style={{ marginTop: "10px", backgroundColor: '#003f5c', borderColor: '#003f5c' }}
          >
            {editMode ? "Update comment" : "Save comment and rating"}
          </button>
        </div>

        {/* Display status messages */}
        {this.state.status.success ? (
          <p className="alert alert-success" role="alert">{this.state.status.msg}</p>
        ) : null}

        {!this.state.status.success && this.state.status.msg !== "" ? (
          <p className="alert alert-danger" role="alert">{this.state.status.msg}</p>
        ) : null}

        {/* Display existing comments */}
        <div style={{ marginTop: "20px" }}>
          <h4>Your Comments</h4>
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="comment-card" style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd" }}>
                <h5>{comment.title}</h5>
                <p>{comment.comment}</p>
                <div style={{ fontSize: 18 }}>
                  <StarRatings
                    rating={comment.rating}
                    starRatedColor={starColors[comment.rating - 1]}
                    numberOfStars={5}
                    name='rating'
                    starDimension="20px"
                    starSpacing="5px"
                    starHoverColor={starColors[comment.rating - 1]}
                    isSelectable={false}
                  />
                </div>
                <button
                  className="btn btn-warning"
                  onClick={() => this.editComment(comment)}
                  style={{ marginRight: "10px" }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => this.deleteComment(comment.id)}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    );
  }
}

export default Rating;