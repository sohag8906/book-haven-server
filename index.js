const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://bookHavendb:F75V8huQGxxB75H4@cluster0.qoielcp.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) =>{
    res.send('Books server is running')
})

async function run (){
    try{
      await client.connect();

     const db = client.db('BookHavendb');
     const booksCollection = db.collection("books");
     
     // create a book 
     app.post('/books', async (req, res)=>{
        const newBook = req.body;
        const result = await booksCollection.insertOne(newBook);
        res.send(result);
     })

     // delete book
     app.delete('/books/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await booksCollection.deleteOne(query);
        res.send(result);
     })
  

      await client.db("admin").command({ ping: 1 });
       console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{

    }
}

run().catch(console.dir)

app.listen(port, () =>{
    console.log(`Books server is running on port: ${port}`)
})
