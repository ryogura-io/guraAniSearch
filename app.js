import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID;

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/search", async (req, res) => {
  const animeName = req.body.animeName;

  try {
    const response = await fetch(`https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(animeName)}&limit=1&fields=id,title,main_picture,synopsis,mean,status,genres,num_episodes,media_type`, {
      headers: {
        "X-MAL-CLIENT-ID": MAL_CLIENT_ID
      }
    });

    const data = await response.json();
    const anime = data.data[0]?.node;

    if (!anime) return res.redirect("/");

    const formattedAnime = {
      title: anime.title,
      image: anime.main_picture?.large || anime.main_picture?.medium,
      synopsis: anime.synopsis,
      score: anime.mean,
      status: anime.status,
      genres: anime.genres?.map(g => g.name) || [],
      episodes: anime.num_episodes,
      type: anime.media_type,
      url: `https://myanimelist.net/anime/${anime.id}`
    };

    res.render("post", { anime: formattedAnime });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


//client ID 24edcfdfc0dd246fc079dcd8a0c6ef9f
//client secret e24cb1f5045b86e2d178a5cad792fb0d714d60baed96afcb4fc47238e1fa78c8