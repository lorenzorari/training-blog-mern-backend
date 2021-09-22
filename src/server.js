const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const port = 8000;

const app = express();

app.use(express.json());

const withDB = async (operations, res) => {
  const url = "mongodb://localhost:27017";
  const dbName = "training_blog";
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    await operations(db);
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error while connecting to database: ${err}` });
  } finally {
    client.close();
  }
};

app.get("/api/articles", async (req, res) => {
  withDB(async (db) => {
    try {
      const articles = db.collection("articles");
      const articlesFound = await articles.find({}).toArray();

      res.status(200).json(articlesFound);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
});

app.post("/api/articles", async (req, res) => {
  withDB(async (db) => {
    try {
      const { author, title } = req.body;
      const articles = db.collection("articles");

      await articles.insertOne({ author, title });

      const updatedArticles = await articles.findOne({ author, title });

      res.status(200).json(updatedArticles);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
});

app.delete("/api/articles/:id", async (req, res) => {
  withDB(async (db) => {
    try {
      const { id } = req.params;
      const documentToDelete = { _id: new ObjectId(id) };
      const articles = db.collection("articles");

      const articleDeleted = await articles.findOne(documentToDelete);
      await articles.deleteOne(documentToDelete);

      res.status(200).json(articleDeleted);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }, res);
});

app.listen(port, () => console.log(`Listening on port ${port}`));
