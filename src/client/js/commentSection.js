const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const videoContainer = document.querySelector(".videoContainer");
const ul = document.querySelector(".video__comments ul");
const btnArr = ul.querySelectorAll(".comment-delete");

const handleDelete = async (event) => {
  const li = event.target.parentNode;
  const commentId = li.dataset.id;
  const response = await fetch(`/api/comments/${commentId}/delete`, {
    method: "delete",
  });
  const ul = li.parentNode;
  li.parentNode.removeChild(li);
};

const addComment = (text, id) => {
  const li = document.createElement("li");
  const i = document.createElement("i");
  const deleteBtn = document.createElement("i");
  const span = document.createElement("span");

  li.className = "video__comment";
  i.className = "fas fa-comment";
  deleteBtn.className = "fas fa-comment comment-delete";
  deleteBtn.addEventListener("click", handleDelete);
  span.innerText = text;
  li.appendChild(i);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  li.dataset.id = id;
  ul.prepend(li);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const id = videoContainer.dataset.id;
  const text = textarea.value;
  if (text === "") return;
  const response = await fetch(`/api/videos/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
    textarea.value = "";
  }
};

form.addEventListener("submit", handleSubmit);
btnArr.forEach((btn) => btn.addEventListener("click", handleDelete));
