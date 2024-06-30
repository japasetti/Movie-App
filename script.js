// API key for OMDB API
const API_KEY = "9d0d26e3";

// Array to store favorite movies
let favoritesList = [];

// Function to fetch and display movie results
async function getResults(input) {
  const API_URL = `https://www.omdbapi.com/?s=${input}&apikey=${API_KEY}`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    const data = await response.json();
    console.log("API Response:", data);

    // Clear previous results
    document.getElementById("main").innerHTML = "";

    // Iterate over the search results and create movie cards
    if (data.Search) {
      data.Search.forEach((movie) => {
        // Only create card if the poster is available
        if (movie.Poster !== "N/A") {
          const movieCard = `
            <div class="movie">
              <img src="${movie.Poster}" alt="${movie.Title}" class="movie__poster">
              <div class="movie__info">
                <h3 class="movie__title">${movie.Title}</h3>
                <span class="movie__rating">${movie.Year}</span>
              </div>
              <div class="movie__btns">
                <button class="details-btn" data-imdbid="${movie.imdbID}">More...</button>
                <button class="favorite-btn" data-title="${movie.Title}" data-rating="${movie.Year}" data-poster="${movie.Poster}">Add Favorite</button>
              </div>
            </div>
          `;
          document.getElementById("main").innerHTML += movieCard;
        }
      });
    } else {
      document.getElementById("main").innerHTML = `<h2>No results found</h2>`;
    }
  } catch (error) {
    console.error("Error while fetching the data:", error);
  }
}

// Function to display detailed movie information
function displayMovieDetails(movie) {
  const movieDetails = `
    <div class="movie__info__card">
      <div class="movie__info__details">
        <div class="movie__poster">
          <img src="${movie.Poster}" />
        </div>
        <div class="movie__details">
          <div class="movie__meta">
            <h2>${movie.Title}</h2>
            <h4>Rating <span>${movie.imdbRating}</span></h4>
          </div>
          <div class="movie__type">${movie.Genre}</div>
          <div class="movie__content">
            <p class="movie__release">Released: ${movie.Released}</p>
            <p class="movie__duration">Duration: ${movie.Runtime}</p>
            <span class="movie__plot"><b>Plot:</b> ${movie.Plot}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  // Replace the existing movie cards with detailed information
  document.getElementById("main").innerHTML = movieDetails;
}

// Function to add a movie to favorites
function addFavorite(movieData) {
  const { title, rating, poster } = movieData;
  const isAlreadyFavorite = favoritesList.some(
    (movie) => movie.title === title
  );

  if (!isAlreadyFavorite) {
    favoritesList.push({ title, rating, poster });

    // Update favorites UI
    renderFavorites();

    // Save favorites to localStorage
    saveFavoritesToLocalStorage();

    // Alert message for adding to favorites
    alert(`Added "${title}" to favorites!`);
  }
}

// Function to remove a movie from favorites
function removeFavorite(title) {
  favoritesList = favoritesList.filter((movie) => movie.title !== title);

  // Update favorites UI
  renderFavorites();

  // Save favorites to localStorage
  saveFavoritesToLocalStorage();
}

// Function to render favorite movies
function renderFavorites() {
  const favoritesContainer = document.getElementById("favorites");
  favoritesContainer.innerHTML = "";

  favoritesList.forEach((movie) => {
    const favoriteMovieCard = `
      <div class="favorite">
        <img src="${movie.poster}" alt="${movie.title}" class="favorite__poster">
        <div class="favorite__info">
          <h3 class="favorite__title">${movie.title}</h3>
          <span class="favorite__rating">${movie.rating}</span>
          <button class="remove-favorite-btn" data-title="${movie.title}">Remove from Favorites</button>
        </div>
      </div>
    `;
    favoritesContainer.innerHTML += favoriteMovieCard;
  });

  // Add event listeners to remove favorite buttons
  document.querySelectorAll(".remove-favorite-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const movieTitle = this.getAttribute("data-title");
      removeFavorite(movieTitle);
    });
  });
}

// Function to save favorites to localStorage
function saveFavoritesToLocalStorage() {
  localStorage.setItem("favoritesList", JSON.stringify(favoritesList));
}

// Function to load favorites from localStorage
function loadFavoritesFromLocalStorage() {
  const storedFavorites = localStorage.getItem("favoritesList");
  if (storedFavorites) {
    favoritesList = JSON.parse(storedFavorites);
    renderFavorites();
  }
}

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load favorites from localStorage when the page loads
  loadFavoritesFromLocalStorage();

  // Event listener for search button click
  document.getElementById("btn").addEventListener("click", function (event) {
    inputSearch(event);
  });

  // Event listener for "More..." button clicks and "Add Favorite" button clicks
  document
    .getElementById("main")
    .addEventListener("click", async function (event) {
      const target = event.target;

      if (target.classList.contains("details-btn")) {
        const imdbID = target.getAttribute("data-imdbid");
        const detailURL = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`;
        try {
          const response = await fetch(detailURL);
          if (!response.ok) {
            throw new Error("Network response was not ok.");
          }
          const movieDetails = await response.json();
          console.log("Movie Details:", movieDetails);
          // Display detailed movie information
          displayMovieDetails(movieDetails);
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      } else if (target.classList.contains("favorite-btn")) {
        // Add favorite functionality
        const movieCard = target.closest(".movie");
        const movieTitle = target.getAttribute("data-title");
        const movieRating = target.getAttribute("data-rating");
        const moviePoster = target.getAttribute("data-poster");
        addFavorite({
          title: movieTitle,
          rating: movieRating,
          poster: moviePoster,
        });
      }
    });

  // Event listener for showing favorites
  document.getElementById("my-favorite").addEventListener("click", function () {
    const favoritesContainer = document.getElementById("favorites");
    favoritesContainer.classList.toggle("show");
  });

  // Event listener for hiding favorites on Escape key press
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const favoritesContainer = document.getElementById("favorites");
      favoritesContainer.classList.remove("show");
    }
  });

  // Function to handle search input
  function inputSearch(event) {
    // Prevent the default form submission
    event.preventDefault();
    // Get the data from the input form
    const search = document.getElementById("search").value.trim();
    if (search) {
      getResults(search);
    } else {
      document.getElementById(
        "main"
      ).innerHTML = `<h2>Please search with a movie name</h2>`;
    }
  }
});
