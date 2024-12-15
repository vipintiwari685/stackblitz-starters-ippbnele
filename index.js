const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('static'));

let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

async function fetchAllRestaurants() {
  let query = 'SELECT * from restaurants';
  let response = await db.all(query, []);
  return { restaurants: response };
}

async function fetchRestaurantById(id) {
  let query = 'SELECT * from restaurants WHERE id = ?';
  let response = await db.get(query, [id]);
  return { restaurant: response };
}

async function fetchRestaurantBycuisine(cuisine) {
  let query = 'SELECT * from restaurants WHERE cuisine = ?';
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}

async function fetchFilteredRestaurants(filters) {
  let query = 'SELECT * from restaurants';
  let allRestaurants = await db.all(query, []);
  let response = allRestaurants.filter((restaurant) =>
    Object.keys(filters).every(
      (key) => restaurant[key] === String(filters[key])
    )
  );
  return { restaurants: response };
}

async function fetchRestaurantSortByRating() {
  let query = 'SELECT * from restaurants ORDER BY rating DESC';
  let response = await db.all(query, []);
  return { restaurants: response };
}

async function fetchAllDishes() {
  let query = 'SELECT * from dishes';
  let response = await db.all(query, []);
  return { dishes: response };
}

async function fetchDishesById(id) {
  let query = 'SELECT * from dishes WHERE id = ?';
  let response = await db.get(query, [id]);
  return { dish: response };
}

async function fetchFilteredDishes(filters) {
  let query = 'SELECT * from dishes';
  let allRestaurants = await db.all(query, []);
  let response = allRestaurants.filter((restaurant) =>
    Object.keys(filters).every(
      (key) => restaurant[key] === String(filters[key])
    )
  );
  return { restaurants: response };
}

async function fetchDishesSortByPrice() {
  let query = 'SELECT * from dishes ORDER BY price';
  let response = await db.all(query, []);
  return { dishes: response };
}

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let results = await fetchDishesSortByPrice();

    if (results.dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/dishes/filter', async (req, res) => {
  try {
    // Extract query parameters
    const { isVeg } = req.query;
    // Convert query parameters to string 'true' or 'false'
    const filters = {
      ...(isVeg && { isVeg: isVeg }), // Keep as string
    };

    let results = await fetchFilteredDishes(filters);

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/dishes/details/:id', async (req, res) => {
  try {
    let results = await fetchDishesById(req.params.id);

    if (results.dish == null) {
      return res.status(404).json({ message: 'No dishes found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/dishes', async (req, res) => {
  try {
    let results = await fetchAllDishes();

    if (results.dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let results = await fetchRestaurantSortByRating();

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/restaurants/filter', async (req, res) => {
  try {
    // Extract query parameters
    const { isVeg, hasOutdoorSeating, isLuxury } = req.query;
    // Convert query parameters to string 'true' or 'false'
    const filters = {
      ...(isVeg && { isVeg: isVeg }), // Keep as string
      ...(hasOutdoorSeating && { hasOutdoorSeating: hasOutdoorSeating }),
      ...(isLuxury && { isLuxury: isLuxury }),
    };

    let results = await fetchFilteredRestaurants(filters);

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  try {
    let results = await fetchRestaurantBycuisine(req.params.cuisine);

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    let results = await fetchRestaurantById(req.params.id);

    if (results.restaurant == null) {
      return res.status(404).json({ message: 'No restaurant found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();

    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found!!' });
    }

    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
