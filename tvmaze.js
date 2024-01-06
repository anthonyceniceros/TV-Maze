"use strict";

// Selecting necessary DOM elements for later use.
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** 
 * Searches for TV shows that match the given query term.
 * Returns an array of show objects: each containing {id, name, summary, image}.
 */
async function getShowsByTerm(term) {
  // Making an AJAX request to TVMaze's search shows API.
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);

  // Mapping the API response to format it as required by our app.
  return res.data.map(result => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      // If the show doesn't have an image, use a default image.
      image: show.image ? show.image.medium : 'https://tinyurl.com/tv-missing'
    };
  });
}

/** 
 * Takes an array of shows and creates DOM elements for each, then appends them to the shows list.
 */
function populateShows(shows) {
  $showsList.empty(); // Clearing any previous results.

  for (let show of shows) {
    // Creating a show card with image, name, summary, and an 'Episodes' button.
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">Episodes</button>
           </div>
         </div>
       </div>`
    );

    $showsList.append($show); // Adding the show card to the shows list.
  }
}

/** 
 * Handles the search form submission, fetches shows from the API, and displays them.
 */
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val(); // Getting the user's search term.
  const shows = await getShowsByTerm(term); // Fetching shows that match the search term.

  $episodesArea.hide(); // Hiding the episodes area initially.
  populateShows(shows); // Displaying the fetched shows.
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault(); // Preventing the default form submission behavior.
  await searchForShowAndDisplay(); // Initiating search and display upon form submission.
});

/** 
 * Fetches episodes for a given show ID from the API.
 * Returns an array of episode objects: each containing {id, name, season, number}.
 */
async function getEpisodesOfShow(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return res.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
    
  }));
  
}

/** 
 * Takes an array of episodes and populates them into the episodes list in the DOM.
 */
function populateEpisodes(episodes) {
  // Find the #episodesList within the $episodesArea.
  const $episodesList = $episodesArea.find("#episodesList");

  $episodesList.empty(); // Clearing any previous episodes.

  for (let episode of episodes) {
    // Creating a list item for each episode.
    const $episode = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episode); // Adding the episode to the episodes list.
  }

  $episodesArea.show(); // Making the episodes list visible.
}


// Event delegation for dynamically added 'Episodes' buttons.
$showsList.on('click', '.Show-getEpisodes', async function(evt) {
  const showId = $(evt.target).closest('.Show').data('show-id');
  console.log("Fetching episodes for show ID:", showId); // Temporary console log for debugging
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});

