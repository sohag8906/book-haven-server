const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = "mongodb+srv://bookHavendb:F75V8huQGxxB75H4@cluster0.qoielcp.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('📚 The Book Haven server is running');
});

async function run() {
  try {
    await client.connect();

    const db = client.db('BookHavendb');
    const booksCollection = db.collection('books');

    //  Add new book
    app.post('/books', async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    //  Get all books , email , sort by rating
    app.get('/books', async (req, res) => {
      const email = req.query.email; 
      const sortOrder = req.query.sort === 'asc' ? 1 : -1; 

      let query = {};
      if (email) {
        query = { userEmail: email }; 
      }

      console.log("Query:", query, "Sort:", sortOrder); 

      const cursor = booksCollection.find(query).sort({ rating: sortOrder });
      const result = await cursor.toArray();
      res.send(result);
    });

    //  Get single book by ID
    app.get('/books/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    //  Update a book
    app.patch('/books/:id', async (req, res) => {
      const id = req.params.id;
      const updatedBook = req.body;
      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          title: updatedBook.title,
          author: updatedBook.author,
          genre: updatedBook.genre,
          rating: updatedBook.rating,
          summary: updatedBook.summary,
          coverImage: updatedBook.coverImage
        }
      };

      const result = await booksCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //  Delete a book
    app.delete('/books/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(" Successfully connected to MongoDB!");
  } finally {
    // Keep connection open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(` The Book Haven server is running on port: ${port}`);
});
