const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000
// middle were 
app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pii6nyx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const userCollection = client.db("bistroDB").collection("users");
        const MenuCollection = client.db("bistroDB").collection("menuCollection");
        const reviewsCollection = client.db("bistroDB").collection("reviews")
        const cartsCollection = client.db("bistroDB").collection("carts")
        app.get('/menuCollection', async (req, res) => {
            const result = await MenuCollection.find().toArray();
            res.send(result);
        })
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result)
        })
        // carts collection
        app.post('/carts', async (req, res) => {
            const cartsItem = req.body;
            const result = await cartsCollection.insertOne(cartsItem)
            res.send(result)
        })
        app.get('/carts', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await cartsCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        })
        // user related api
        app.post("/users", async (req, res) => {
            const users = req.body;
            // insert email if user doesn't exist
            // you can do this many away (1. email unique, 2.upsert, 3.simple checking)
            const query = { email: users.email }
            const exisTingUser = await userCollection.findOne(query)
            if (exisTingUser) {
                return res.send({ message: "user already exist", insertedId: null })
            }
            const result = await userCollection.insertOne(users)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Boss is sitting')
})

app.listen(port, () => {
    console.log(`Bistro-boss is sitting on port ${port}`)
})