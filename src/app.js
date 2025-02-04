// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'app.css'; // Import your CSS file
import Select from 'react-select'; // For breed selection

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

function App() {
  const [user, setUser] = useState(null);
  const [breeds, setBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [sort, setSort] = useState('breed:asc');
  const [pagination, setPagination] = useState({ from: null, next: null, prev: null });
  const [favorites, setFavorites] = useState([]);
  const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(false);



  useEffect(() => {
    fetchBreeds();
  }, []);

  const handleLogin = async (name, email) => {
      try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, { name, email }, { withCredentials: true });
          if (response.status === 200) {
              setUser({ name, email });
          }
      } catch (error) {
          console.error("Login error:", error);
          alert("Login failed. Please check your credentials.");
      }

  };

  const fetchBreeds = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dogs/breeds`, { withCredentials: true });
      setBreeds(response.data.map(breed => ({ value: breed, label: breed })));
    } catch (error) {
        console.error("Error fetching breeds:", error);
    }
  };

  const fetchDogs = async (from = null) => {
    setLoading(true); // Set loading to true before fetching

    try {
      const params = {
        breeds: selectedBreeds.map(breed => breed.value),
        sort: sort,
        from: from,
      };

      const response = await axios.get(`${API_BASE_URL}/dogs/search`, { params, withCredentials: true });
      const dogIds = response.data.resultIds;
      const dogsResponse = await axios.post(`${API_BASE_URL}/dogs`, dogIds, { withCredentials: true });
      setDogs(dogsResponse.data);
      setPagination({ from: response.data.from, next: response.data.next, prev: response.data.prev });

    } catch (error) {
        console.error("Error fetching dogs:", error);
    } finally {
        setLoading(false); // Set loading to false after fetching, regardless of success or failure
    }
  };


  const handleBreedChange = (selectedOptions) => {
    setSelectedBreeds(selectedOptions);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
  };

  const handleFavorite = (dogId) => {
    if (favorites.includes(dogId)) {
      setFavorites(favorites.filter(id => id !== dogId));
    } else {
      setFavorites([...favorites, dogId]);
    }
  };

  const handleMatch = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/dogs/match`, favorites, { withCredentials: true });
      setMatch(response.data.match);
    } catch (error) {
        console.error("Error getting match:", error);
    }
  };

  const handleNextPage = () => {
      fetchDogs(pagination.next);
  };

  const handlePrevPage = () => {
      fetchDogs(pagination.prev);
  };

  const handleSearch = () => {
    fetchDogs();
  };


  if (!user) {
    return (
      <div className="login-container">
        <h2>Dog Adoption App</h2>
        <form onSubmit={e => {
          e.preventDefault();
          const name = e.target.name.value;
          const email = e.target.email.value;
          handleLogin(name, email);
        }}>
          <input type="text" name="name" placeholder="Name" required />
          <input type="email" name="email" placeholder="Email" required />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>Dog Search</h2>

      <div className="filter-container">
        <label htmlFor="breed-select">Breed:</label>
          <Select
              id="breed-select"
              isMulti
              options={breeds}
              value={selectedBreeds}
              onChange={handleBreedChange}
              placeholder="Select Breeds"
          />
        <label htmlFor="sort-select">Sort By:</label>
        <select id="sort-select" value={sort} onChange={handleSortChange}>
          <option value="breed:asc">Breed (Ascending)</option>
          <option value="breed:desc">Breed (Descending)</option>
          <option value="name:asc">Name (Ascending)</option>
          <option value="name:desc">Name (Descending)</option>
          <option value="age:asc">Age (Ascending)</option>
          <option value="age:desc">Age (Descending)</option>
        </select>
        <button onClick={handleSearch}>Search</button>

      </div>
        {loading && <div className="loading-spinner">Loading...</div>}

      <div className="dog-list">
        {dogs.map(dog => (
          <div key={dog.id} className="dog-card">
            <img src={dog.img} alt={dog.name} />
            <h3>{dog.name}</h3>
            <p>Breed: {dog.breed}</p>
            <p>Age: {dog.age}</p>
            <p>Zip Code: {dog.zip_code}</p>
            <button onClick={() => handleFavorite(dog.id)}>
              {favorites.includes(dog.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>
        ))}
      </div>

        <div className="pagination">
            {pagination.prev && <button onClick={handlePrevPage}>Previous</button>}
            {pagination.next && <button onClick={handleNextPage}>Next</button>}
        </div>

      <div className="match-container">
        <h2>Your Match</h2>
        {match && <p>Your matched dog ID is: {match}</p>}
        <button onClick={handleMatch} disabled={favorites.length === 0}>Get Match</button>
      </div>
    </div>
  );
}
