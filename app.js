const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());


const uri = 'mongodb://localhost:27017/healthcareDB'; 
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Database connection error:', err));


const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });


const Service = mongoose.model('Service', serviceSchema);



app.post('/add-service', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ error: 'Service name and price are required' });
    }

    const service = new Service({ name, description, price });
    const savedService = await service.save();

    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while adding the service' });
  }
});


app.get('/get-all-services', async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving services' });
  }
});

app.put('/update-service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    if (price != null && price < 0) {
      return res.status(400).json({ error: 'Price must be a positive value' });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the service' });
  }
});

app.delete('/delete-service/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the service' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
