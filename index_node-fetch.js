import express from "express";
import fetch from "node-fetch";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// Function to handle fetch requests and convert response to JSON
const fetchData = async (url) => {
    const response = await fetch(url, { timeout: 30000 }); // Set timeout to 30 seconds
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/random", async (req, res) => {
    try {
        const result = await fetchData('https://api.jikan.moe/v4/random/anime?sfw');
        const show = result.data;
        const genres = show.genres.map(genre => genre.name);
        const studios = show.studios.map(studio => ({ name: studio.name, url: studio.url }));

        res.render("random", {
            id: show.mal_id,
            title: show.title,
            title_jp: show.title_japanese,
            title_img: show.images.webp.large_image_url,
            title_lg_img: show.images.webp.large_image_url,
            title_sm_img: show.images.webp.small_image_url,
            type: show.type,
            rating: show.rating,
            synopsis: show.synopsis,
            genres: genres,
            episode: show.episodes,
            status: show.status,
            score: show.score,
            studio: studios,
            studio_url: show.studios.url,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/search", async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).send("Bad Request");
    }

    try {
        const result = await fetchData(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
        if (result.data.length === 0) {
            return res.status(404).send("No Anime Found");
        }

        const animeList = result.data.map(show => ({
            id: show.mal_id,
            title: show.title,
            title_jp: show.title_japanese,
            title_img: show.images.webp.image_url,
            title_lg_img: show.images.webp.large_image_url,
            title_sm_img: show.images.webp.small_image_url,
            type: show.type,
            rating: show.rating,
            synopsis: show.synopsis,
            genres: show.genres.map(genre => genre.name),
            episode: show.episodes,
            status: show.status,
            score: show.score,
            studios: show.studios.map(studio => ({ name: studio.name, url: studio.url })),
        }));

        res.render("search", { animeList: animeList });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/anime/:id", async (req, res) => {
    const animeID = req.params.id;

    try {
        const result = await fetchData(`https://api.jikan.moe/v4/anime/${animeID}`);
        const show = result.data;
        const genres = show.genres.map(genre => genre.name);
        const studios = show.studios.map(studio => ({ name: studio.name, url: studio.url }));

        res.render("anime", {
            id: show.mal_id,
            title: show.title,
            title_jp: show.title_japanese,
            title_img: show.images.webp.image_url,
            title_lg_img: show.images.webp.large_image_url,
            title_sm_img: show.images.webp.small_image_url,
            type: show.type,
            rating: show.rating,
            synopsis: show.synopsis,
            genres: genres,
            episode: show.episodes,
            status: show.status,
            score: show.score,
            studio: studios,
            studio_url: show.studios.url,
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
