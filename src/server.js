const express = require("express");
const { MongoClient } = require("mongodb");

const port = 8000;

const app = express();

app.use(express.json());

const withDB = async (operations, res) => {
  const url = "mongodb://localhost:27017";
  const dbName = "training_blog";

  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    operations(db);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error while connecting to database: ${err}` });
  } finally {
    client.close();
  }
};

app.post("/api/articles", async (req, res) => {
  withDB(async (db) => {
    try {
      const { author, title } = req.body;
      const articles = db.collection("articles");

      await articles.insertOne({ author, title });

      const updatedArticles = await articles.findOne({ author, title });

      res.status(200).json(updatedArticles);
    } catch (err) {
      res.status(400).json({ message: err });
    }
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
