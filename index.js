
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://bookHavendb:F75V8huQGxxB75H4@cluster0.qoielcp.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});


app.get("/", (req, res) => {
  res.send("📚 The Book Haven server is running...");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("BookHavendb");
    const booksCollection = db.collection("books");
    const commentsCollection = db.collection("comments");

   
    app.post("/books", async (req, res) => {
      const result = await booksCollection.insertOne(req.body);
      res.send(result);
    });

    
    app.get("/books", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });

   
    app.get("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await booksCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ message: "Book not found" });
        res.send(result);
      } catch (err) {
        res.status(400).send({ message: "Invalid book ID" });
      }
    });

   
    app.patch("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        const updateDoc = { $set: data };
        const result = await booksCollection.updateOne({ _id: new ObjectId(id) }, updateDoc);
        res.send(result);
      } catch (err) {
        res.status(400).send({ message: "Invalid book ID" });
      }
    });

  
    app.delete("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(400).send({ message: "Invalid book ID" });
      }
    });

   
    app.get("/comments/:bookId", async (req, res) => {
      const bookId = req.params.bookId;
      const result = await commentsCollection.find({ bookId }).sort({ date: -1 }).toArray();
      res.send(result);
    });

    
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      comment.date = new Date().toISOString(); 
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    console.log("✅ Successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ Error connecting:", err);
  }
}
run();

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
